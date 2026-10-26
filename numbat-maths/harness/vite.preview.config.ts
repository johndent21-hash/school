// Builds the stand-alone preview: one JS and one CSS file, later inlined into a single page.
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] }), tanstackRouter({ target: 'react', autoCodeSplitting: false }), tailwindcss(), viteReact()],
  build: {
    outDir: 'dist-preview',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000,
    rollupOptions: { input: 'preview.html', output: { inlineDynamicImports: true } },
  },
})
