import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      devOptions: {
        enabled: false, // Disabled in dev mode to prevent sw.js MIME type errors and HMR issues
        type: "module",
      },
      manifest: {
        name: "Kilamate Weather",
        short_name: "Kilamate",
        description: "A modern weather application",
        theme_color: "#000000",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        skipWaiting: true,      // Force new SW to activate immediately
        clientsClaim: true,     // Claim all tabs as soon as SW activates
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        globIgnores: ["**/sitemap.xml", "**/robots.txt", "**/site.webmanifest", "**/custom-sw.js"], // Don't cache these static files
        importScripts: ["custom-sw.js"], // Import our custom logic
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: "NetworkFirst", // Must be NetworkFirst when using networkTimeoutSeconds
            options: {
              cacheName: "openweather-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 60, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 10, // Fallback to cache after 10s
            },
          },
          {
            // Cache weather icons
            urlPattern: /^https:\/\/openweathermap\.org\/img\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "weather-icons-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["react-globe.gl", "three"],
  },
  build: {
    // Performance optimizations
    target: "esnext",
    minify: "esbuild", // Revert to standard esbuild
    // Let Rollup handle chunking naturally to prevent CommonJS/execution order bugs
    rollupOptions: {
      output: {
        // We removed manualChunks to fix "Prop is not a constructor" and "FL is not a constructor"
        // which occur when circular dependencies in Three.js/Kapsule are split across chunks incorrectly.
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 2000,
  },
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
  },
});
