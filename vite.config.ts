import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/Sunol-Flowlab-VR/' : '/',
  plugins: [mode === 'https' ? basicSsl() : null, react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
}))
