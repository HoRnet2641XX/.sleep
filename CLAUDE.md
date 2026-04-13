# CLAUDE.md — .nemuri プロジェクト

このファイルは `.nemuri`（睡眠障害SNS）プロジェクト固有のルールです。
ワークスペース全体のルール（`../CLAUDE.md`）も必ず併用してください。

---

## プロダクト概要

- **サービス名**: .nemuri
- **ドメイン**: 睡眠障害を抱える人向けのレビューSNS
- **ターゲット**: 不眠症、中途覚醒、早朝覚醒などに悩む成人
- **技術スタック**: Next.js 14 (App Router) + Tailwind CSS + Supabase + framer-motion + three.js
- **トーン**: 静かで安心感のある、寄り添い型。押し付けがましくない。眠りを想起させる紫〜琥珀のグラデーション

---

## .prompts/ 自動ルーティング

以下のキーワード/文脈を検知したら、該当する `.prompts/XX-*.md` を**自動で開いて読み**、
そのテンプレートに従ってタスクを遂行すること。ユーザーが明示的に指定しなくても適用する。

| 検知するキーワード・文脈 | 自動参照するファイル |
|------------------------|-------------------|
| 「デザインシステム」「カラー体系」「トークン」「Tailwind設定」 | `.prompts/01-design-system.md` |
| 「ブランド」「ロゴ」「トーン&マナー」「ネーミング」「アイデンティティ」 | `.prompts/02-brand-identity.md` |
| 「UI/UXパターン」「画面設計」「ユーザーフロー」「ペルソナ」 | `.prompts/03-ui-ux-patterns.md` |
| 「マーケティング」「広告コピー」「メールシーケンス」「LPコピー」「SNS投稿」「キャンペーン」 | `.prompts/04-marketing-assets.md` |
| 「Figma仕様」「デザインスペック」 | `.prompts/05-figma-spec.md` |
| 「デザイン批評」「レビューして」「改善点」 | `.prompts/06-design-critique.md` |
| 「トレンド」「今どきのデザイン」「業界動向」 | `.prompts/07-design-trends.md` |
| 「アクセシビリティ」「a11y」「WCAG」「スクリーンリーダー」 | `.prompts/08-accessibility-audit.md` |
| 「Figmaからコード」「デザイン→実装」「スクショから作って」 | `.prompts/09-design-to-code.md` |
| 「Figmaから直接作る」「MCPで構築」 | `.prompts/10-figma-build.md` |

### 運用ルール

1. 該当キーワードを検知したら**黙って**該当ファイルを Read してから作業を始める（ユーザーに毎回確認しない）
2. プレースホルダー（`[PRODUCT]` 等）は本プロジェクトの値（`.nemuri`、不眠に悩む成人、等）で自動置換
3. 複数の `.prompts/` が該当する場合は、主タスクのものを優先し、副次的なものは必要に応じて参照
4. テンプレートの指示とユーザー指示が競合する場合は**ユーザー指示を優先**
5. 参照したファイルは簡潔に「`.prompts/04` を参照して作業します」と一行だけ宣言する

---

## プロジェクト固有の遵守事項

- `sleep_disorder_types` カラム名は絶対に変更しない（過去のグローバル置換で `nemuri_disorder_types` に誤変更した事故あり）
- マスコット SVG (`public/mascot.svg`) は変更せず、そのまま使用する
- Supabase の OAuth プロバイダ設定は `twitter` ではなく `x`（Supabase 内部リネーム済み）
- 破壊的な SQL マイグレーションは `supabase/NNN_*.sql` の連番ファイルで提案し、ユーザーが Supabase SQL Editor で手動実行する運用

---

## デザインシステム運用上の前提

このプロジェクトは以下の点で、ワークスペース共通の `../CLAUDE.md` と意図的に差分を持ちます。新規作業時はここを参照してから手を付けること。

### Dark mode 固定(ライトモード未提供)
- 本プロダクトは深夜・就寝前の利用を想定するため、**ダークモード固定**。
- `tailwind.config.ts` の `darkMode: "class"` および `app/layout.tsx` の `<html className="dark">` は維持するが、ライトテーマのトークンは用意しない。ライトモード対応は検討しない。

### カラーパレット(lavender/amber)はワークスペース既定を上書き
- ワークスペース CLAUDE.md の `color-primary` (#0066FF) / `color-accent` (#F59E0B) に対し、.nemuri は **眠りを想起させるパレット**へ上書き:
  - `primary` = `#A98FD8` (lavender)
  - `accent` = `#F5B83D` (amber)
- これは **.nemuri ドメイン専用の意図的な差分**。他プロジェクトに流用する際はパレットを戻すこと。

### Tailwind `spacing` トークン override について
- `tailwind.config.ts` の `spacing` は CLAUDE.md の 8px 基準(`space-5=24px`, `space-6=32px`, `space-7=48px`, `space-8=64px`, `space-9=96px`)に合わせて **Tailwind デフォルトのスケールを上書き** している(例: Tailwind 標準 `p-5` = 20px だが、本プロジェクトでは 24px)。
- したがって Tailwind のチートシート値と本プロジェクトの実寸は `5` 以降で乖離する。`p-5/6/7/8/9` を書くときは**本プロジェクトのトークン表**を参照すること。
- 任意ピクセル値(`p-[13px]` など)は引き続き禁止。

### アイコン規約
- すべてのアイコンは **SVG コンポーネント**(stroke 1.5, 24px viewBox)。絵文字は CLAUDE.md の Anti-AI Aesthetic 方針により禁止。
- カテゴリアイコンは `src/components/ui/CategoryIcon.tsx` に集約。新カテゴリを追加する場合はこのファイルに型を追加する。

### モーション
- framer-motion は `Providers.tsx` の `<MotionConfig reducedMotion="user">` で OS の `prefers-reduced-motion` を尊重する設定になっている。新規アニメーションは `useReducedMotion()` で分岐するか、`MotionConfig` に任せる。
- three.js の `HeroSleepScene` は内部で reduced-motion を検出し、静的背景にフォールバックする。新規 Canvas を追加する際は同パターンを踏襲すること。
