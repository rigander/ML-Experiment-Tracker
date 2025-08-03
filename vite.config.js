import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'sass-embedded',
      config: (config, { command }) => {
        if (command === 'build') {
          config.esbuild = {
            loader: {
              '.sass': 'css',
              '.scss': 'css'
            }
          }
        }
      }
    }
  ]
})
