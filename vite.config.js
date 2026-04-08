import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/seat-swap/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  publicDir: '../assets',
});
