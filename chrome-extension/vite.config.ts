import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    emptyOutDir: false,

    rollupOptions: {
      // input: resolve(__dirname, './src/content/index.tsx'), // custom main
      output: {
        assetFileNames: (assetInfo) => {
          console.log(assetInfo)
          let extType = assetInfo.name?.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            extType = 'img'
          }

          return `assets/[name][extname]`
        },
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js',
      },
    },
  },
})
