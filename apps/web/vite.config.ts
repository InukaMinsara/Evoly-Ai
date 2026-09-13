import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function googleSiteVerificationPlugin() {
  return {
    name: 'google-site-verification',
    transformIndexHtml(html: string) {
      const token = process.env.VITE_GOOGLE_SITE_VERIFICATION || process.env.GOOGLE_SITE_VERIFICATION;
      if (token && token.trim()) {
        return html.replace(
          '</head>',
          `    <meta name="google-site-verification" content="${token.trim()}" />\n  </head>`,
        );
      }
      return html;
    },
  };
}

export default defineConfig({
  plugins: [react(), googleSiteVerificationPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@evoly/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy /api requests to backend during development
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
});
