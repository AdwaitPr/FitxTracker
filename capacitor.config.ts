import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitx.app',
  appName: 'FitxTracker',
  webDir: 'public',
  server: {
    // Live Vercel production deployment
    url: 'https://fitx-tracker.vercel.app',
    cleartext: true,
  },
};

export default config;
