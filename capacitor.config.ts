import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vmate.nemuri',
  appName: '.nemuri',
  webDir: 'out',
  server: {
    // SPA フォールバック: 動的ルート (/review/[id] 等) でリロードしても index.html を返す
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#080E1C',
  },
  android: {
    backgroundColor: '#080E1C',
  },
};

export default config;
