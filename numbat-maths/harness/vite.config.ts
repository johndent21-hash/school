import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: !!process.env.STATIC_BUILD, autoSubfolderIndex: true, autoStaticPathsDiscovery: true, crawlLinks: false, failOnError: true } }),
    viteReact(),
  ],
})
