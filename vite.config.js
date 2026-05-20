// ═══════════════════════════════════════════════════════════════
// vite.config.js
// ═══════════════════════════════════════════════════════════════
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Target modern browsers only — smaller bundles, faster parse
    target: "es2020",

    // Raise chunk size warning threshold slightly (images not included)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Stable name for the main CSS so the preload hint in index.html matches at runtime.
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "index.css") return "assets/index.css";
          return "assets/[name]-[hash][extname]";
        },
        // Vite 8 (Rolldown) requires manualChunks to be a function, not an object.
        // Split Firebase by sub-package so pages that don't use Storage skip that chunk.
        manualChunks(id) {
          if (id.includes("/node_modules/firebase/storage")) return "vendor-firebase-storage";
          if (id.includes("/node_modules/firebase/auth")) return "vendor-firebase-auth";
          if (id.includes("/node_modules/firebase/firestore")) return "vendor-firebase-firestore";
          if (id.includes("/node_modules/firebase/")) return "vendor-firebase-app";
          if (id.includes("/node_modules/lucide-react/")) return "vendor-ui";
          if (id.includes("/node_modules/browser-image-compression/")) return "vendor-compression";
          if (id.includes("/node_modules/react-helmet-async/")) return "vendor-helmet";
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/react-router") ||
            id.includes("/node_modules/scheduler/")
          ) return "vendor-react";
        },
      },
    },
  },

  // Enable source maps in production for error monitoring (optional)
  // sourcemap: true,
});
