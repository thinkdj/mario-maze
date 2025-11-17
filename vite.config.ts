import { defineConfig } from 'vite';

export default defineConfig({
  // Use repository name for GitHub Pages, or './' for local/other deployments
  base: process.env.GITHUB_ACTIONS ? '/mario-maze/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  publicDir: 'src/assets',
  server: {
    port: 4200,
    open: true,
  },
});
