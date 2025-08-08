
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    plugins: [react()],
    define: {
      'import.meta.env.ALGOLIA_APP_ID': JSON.stringify(env.ALGOLIA_APP_ID),
      'import.meta.env.ALGOLIA_SEARCH_API_KEY': JSON.stringify(env.ALGOLIA_SEARCH_API_KEY),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8081',
          changeOrigin: true,
        },
      },
    },
  };
});
