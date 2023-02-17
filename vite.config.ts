import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  assetsInclude: ['**/*.md'],
  preview: {
    port: 3000,
  },
  define: {
    'process.env.REACT_APP_API_HOST': `"${process.env.REACT_APP_API_HOST}"`,
    'process.env.REACT_APP_LOGIN_ORIGIN': `"${process.env.REACT_APP_LOGIN_ORIGIN}"`,
  },
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./**/*.{ts,tsx}"',
      },
    }),
  ],
};

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return {
      ...config,
      server: {
        port: 3000,
        https: {
          key: fs.readFileSync(__dirname + '/key2.pem', 'utf8'),
          cert: fs.readFileSync(__dirname + '/cert.pem', 'utf8'),
        },
      },
    };
  }

  return config;
});
