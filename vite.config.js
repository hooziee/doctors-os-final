import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This section fixes the "import.meta" error by telling Vite to build
  // for a modern browser version that supports this feature.
  build: {
    target: 'es2020'
  },
  esbuild: {
    target: 'es2020'
  },
  optimizeDeps: {
      esbuildOptions: {
          target: 'es2020',
      },
  },
})
