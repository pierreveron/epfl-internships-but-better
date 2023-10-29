import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'dist/content'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, './src/content/index.tsx'), // custom main
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split('.').at(1)
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType ?? '')) {
            extType = 'img'
          }

          return `[name][extname]`
        },
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
      },
    },
  },
})
