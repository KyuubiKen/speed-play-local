// Static, client-only SPA build for GitHub Pages (no SSR, single page).
// The Lovable/TanStack Start app in vite.config.ts is untouched; this config
// reuses the same player component, styles and PWA assets.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Relative base so the app works from https://user.github.io/repo-name/
  base: "./",
  root: fileURLToPath(new URL("./static", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-static", import.meta.url)),
    emptyOutDir: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        // App shell only — never video data or blob:/object URLs.
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request, url, sameOrigin }) =>
              Boolean(sameOrigin) &&
              url.protocol.startsWith("http") &&
              (request.destination === "script" ||
                request.destination === "style" ||
                request.destination === "image" ||
                request.destination === "font"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-shell",
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
