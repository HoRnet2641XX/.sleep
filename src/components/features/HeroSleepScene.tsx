"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════
   Simplex-style noise (GPU)
   フラグメントシェーダー内で使うための GLSL
   ═══════════════════════════════════════════ */
const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
  vec4 mod289(vec4 x){ return x - floor(x*(1./289.))*289.; }
  vec4 permute(vec4 x){ return mod289(((x*34.)+1.)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1./6., 1./3.);
    const vec4 D = vec4(0.,0.5,1.,2.);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0., i1.z, i2.z, 1.))
            + i.y + vec4(0., i1.y, i2.y, 1.))
            + i.x + vec4(0., i1.x, i2.x, 1.));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.*x_);
    vec4 x  = x_*ns.x + ns.yyyy;
    vec4 y  = y_*ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.+1.;
    vec4 s1 = floor(b1)*2.+1.;
    vec4 sh = -step(h, vec4(0.));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m = m*m;
    return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`;

/* ═══════════════════════════════════════════
   NebulaPlane — full-screen shader quad
   3 層のノイズでオーロラ的な流体を描画
   ═══════════════════════════════════════════ */
const nebulaVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
  }
`;

const nebulaFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2  uResolution;
  varying vec2  vUv;

  ${NOISE_GLSL}

  void main(){
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

    // 3 層の流体ノイズ（それぞれ速度・スケール・色が異なる）
    float t = uTime * 0.08;

    // 第1層: 深い紫（ゆっくり、大きなスケール）
    float n1 = snoise(vec3(p * 1.2, t * 0.7)) * 0.5 + 0.5;
    n1 = smoothstep(0.25, 0.75, n1);

    // 第2層: ラベンダー（中速）
    float n2 = snoise(vec3(p * 2.0 + 5.0, t * 1.1)) * 0.5 + 0.5;
    n2 = smoothstep(0.3, 0.7, n2);

    // 第3層: アンバーのアクセント（速め、小さなスケール）
    float n3 = snoise(vec3(p * 3.0 + 10.0, t * 1.5)) * 0.5 + 0.5;
    n3 = smoothstep(0.45, 0.65, n3);

    // 色
    vec3 deepPurple = vec3(0.04, 0.02, 0.12);
    vec3 lavender   = vec3(0.42, 0.28, 0.72);
    vec3 amber      = vec3(0.96, 0.72, 0.24);

    vec3 col = deepPurple;
    col = mix(col, lavender, n1 * 0.18);
    col = mix(col, lavender * 1.2, n2 * 0.10);
    col = mix(col, amber, n3 * 0.06);

    // ビネット（端を暗く）
    float vig = 1.0 - smoothstep(0.3, 0.85, length(p * 0.9));
    col *= vig * 0.7 + 0.3;

    // 全体の透明度は低く — 主役はテキスト
    float alpha = (n1 * 0.3 + n2 * 0.2 + n3 * 0.1) * vig;
    alpha = clamp(alpha, 0.0, 0.35);

    gl_FragColor = vec4(col, alpha);
  }
`;

function NebulaPlane() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime.value = state.clock.elapsedTime;
    ref.current.uniforms.uResolution.value.set(
      viewport.width,
      viewport.height,
    );
  });

  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <shaderMaterial
        ref={ref}
        vertexShader={nebulaVertex}
        fragmentShader={nebulaFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   LuminousOrb — 有機的に漂う発光球体
   大きなソフトスフィアが数個だけ
   ═══════════════════════════════════════════ */
const orbFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uIntensity;
  varying vec2  vUv;

  void main(){
    float d = length(vUv - 0.5) * 2.0;
    // soft radial falloff
    float glow = exp(-d * d * 3.0) * uIntensity;
    // subtle pulse
    glow *= 0.8 + 0.2 * sin(uTime * 0.5);
    gl_FragColor = vec4(uColor, glow);
  }
`;

const orbVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
  }
`;

type OrbProps = {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  phase: number;
  intensity?: number;
};

function LuminousOrb({
  position: pos,
  color,
  size,
  speed,
  phase,
  intensity = 0.6,
}: OrbProps) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    [color, intensity],
  );

  useFrame((state) => {
    if (!ref.current || !matRef.current) return;
    const t = state.clock.elapsedTime * speed;
    // リサージュ曲線の有機的な動き
    ref.current.position.x = pos[0] + Math.sin(t + phase) * 1.2;
    ref.current.position.y =
      pos[1] + Math.sin(t * 0.7 + phase * 2) * 0.8;
    ref.current.position.z =
      pos[2] + Math.cos(t * 0.5 + phase) * 0.5;
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={ref} position={pos}>
      <planeGeometry args={[size, size]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={orbVertex}
        fragmentShader={orbFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   静的フォールバック (reduced-motion)
   ═══════════════════════════════════════════ */
function StaticFallback() {
  return (
    <div
      className="absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse at 35% 40%, rgba(100,60,180,0.15) 0%, transparent 50%), " +
          "radial-gradient(ellipse at 65% 30%, rgba(169,143,216,0.10) 0%, transparent 40%), " +
          "radial-gradient(ellipse at 50% 70%, rgba(245,184,61,0.06) 0%, transparent 40%)",
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   モバイル判定
   ═══════════════════════════════════════════ */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

/* ═══════════════════════════════════════════
   HeroSleepScene — エクスポート
   ═══════════════════════════════════════════ */
export function HeroSleepScene() {
  const isMobile = useIsMobile();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  if (reduced) return <StaticFallback />;

  const dpr: [number, number] = isMobile ? [1, 1.5] : [1, 2];
  const power = isMobile ? "low-power" : "high-performance";

  // モバイルではオーブを減らす
  const orbs: OrbProps[] = isMobile
    ? [
        { position: [-2, 1, -1], color: "#a98fd8", size: 5, speed: 0.15, phase: 0, intensity: 0.4 },
        { position: [2.5, -0.5, -1], color: "#ffd27a", size: 3.5, speed: 0.12, phase: 2, intensity: 0.25 },
      ]
    : [
        { position: [-3, 1.5, -1], color: "#a98fd8", size: 6, speed: 0.15, phase: 0, intensity: 0.5 },
        { position: [3, -1, -1], color: "#ffd27a", size: 4, speed: 0.12, phase: 2, intensity: 0.3 },
        { position: [0, 2, -1.5], color: "#8b6cc0", size: 5, speed: 0.1, phase: 4, intensity: 0.25 },
        { position: [-2, -2, -1], color: "#c7b8e8", size: 3, speed: 0.18, phase: 1, intensity: 0.2 },
      ];

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      gl={{ antialias: false, alpha: true, powerPreference: power }}
      dpr={dpr}
      style={{ position: "absolute", inset: 0 }}
    >
      <NebulaPlane />
      {orbs.map((o, i) => (
        <LuminousOrb key={i} {...o} />
      ))}
    </Canvas>
  );
}
