# 📦 PWA Installation Instructions

## What You Need to Install

To enable PWA functionality with offline support, you need to install the Vite PWA plugin.

## Installation Steps

### 1. Fix PowerShell Execution Policy (if needed)

If you haven't already, run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 2. Install Dependencies

```bash
npm install vite-plugin-pwa workbox-window -D
```

### 3. Update Vite Configuration

The `vite.config.ts` file needs to be updated to include the PWA plugin. Add this configuration:

```typescript
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.webp", "logo2.webp"],
      manifest: {
        name: "Kilamate - Weather & Air Quality App",
        short_name: "Kilamate",
        description: "Advanced weather forecasting with offline support",
        theme_color: "#0d0d0d",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "weather-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 30, // 30 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
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
});
```

## What's Already Set Up

✅ Service Worker (`public/sw.js`) - Handles offline caching  
✅ PWA Manifest (`public/site.webmanifest`) - App metadata  
✅ Install Prompt Component - Shows install button  
✅ Offline Indicator - Shows when offline  
✅ PWA Hook - Manages service worker registration

## Testing PWA Locally

1. Build the production version:
   ```bash
   npm run build
   npm run preview
   ```

2. Open Chrome DevTools → Application tab
3. Check "Service Workers" and "Manifest"
4. Test offline mode by checking "Offline" in Network tab

## Features

### 🔄 Offline Support
- Caches static assets (HTML, CSS, JS)
- Caches weather API responses for 30 minutes
- Shows offline indicator when disconnected
- Automatically syncs when back online

### 📱 Install Prompt
- Shows install banner on supported devices
- One-click installation
- Runs as standalone app

### 🔔 Update Notifications
- Automatically detects new versions
- Shows toast notification to refresh
- Seamless updates

## Browser Support

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 11.3+)
- ✅ Samsung Internet

## Deployment

When deploying to Netlify/Vercel:
1. Build command: `npm run build`
2. Publish directory: `dist`
3. PWA will work automatically!

---

**Note:** The service worker only works in production builds or HTTPS. It won't work in development mode (`npm run dev`).
