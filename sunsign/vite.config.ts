import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    watch: {
      ignored: ['**/ml/**'],
    },
  },

  // ─── Dependency pre-bundling ───────────────────────────────────────────────
  // Note: @tensorflow/tfjs must NOT be excluded here — it uses CJS module
  // globals internally and needs Vite's CJS→ESM conversion to work.
  // The dynamic import() in useGestureModel.ts still defers the actual
  // download to after the loading screen is visible.
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'framer-motion',
      'i18next',
      'react-i18next',
      'lucide-react',
    ],
  },

  // ─── Production build chunk strategy ──────────────────────────────────────
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — tiny, always needed immediately
          'vendor-react': ['react', 'react-dom'],
          // Translations — small, needed for the loading screen text
          'vendor-i18n': ['i18next', 'react-i18next'],
          // Animation utilities — loaded after splash screen
          'vendor-motion': ['framer-motion'],
          // Icon library — only icons actually imported are included (tree-shaken)
          'vendor-icons': ['lucide-react'],
          // Entire three.js ecosystem — loaded lazily via SignAnimator
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', '@pixiv/three-vrm'],
          // TensorFlow — very large, loaded on-demand by useGestureModel
          'vendor-tf': ['@tensorflow/tfjs'],
        },
      },
    },
  },
})
