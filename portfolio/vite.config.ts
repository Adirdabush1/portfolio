import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          rapier: ['@react-three/rapier', '@dimforge/rapier3d-compat'],
        },
      },
    },
  },
})
