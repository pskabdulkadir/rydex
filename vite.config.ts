import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { exec } from "child_process";

// Dev mode'da Express server'ı başlatan plugin
const expressServerPlugin = (): Plugin => {
  let devServerProcess: any;

  return {
    name: "express-dev-server-launcher",
    configResolved(config) {
      if (config.command === "serve") {
        // Dev mode'da - Express server'ı başlat
        console.log("[Express Server] 🚀 Dev server başlatılıyor (port 5173)...");

        devServerProcess = exec("tsx server/dev-server.ts", (error: any) => {
          if (error && !error.killed) {
            console.error("[Express Server] ❌ Hata:", error.message);
          }
        });

        devServerProcess.stdout?.on("data", (data: any) => {
          console.log("[Express Server STDOUT]", String(data).trim());
        });

        devServerProcess.stderr?.on("data", (data: any) => {
          console.error("[Express Server STDERR]", String(data).trim());
        });

        // Hata event'i
        devServerProcess.on("error", (error: any) => {
          console.error("[Express Server ERROR EVENT]", error);
        });
      }
    },
    apply: "serve",
  };
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: [path.resolve(__dirname)],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
    },
    // Express server'ına API isteklerini proxy et
    // Not: Express server'ı manuel olarak başlatmalısın: npm run dev:express
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
      },
      "/camera-analysis": {
        target: "http://localhost:5173",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist", // Vercel için standart çıktı klasörü
    minify: "terser",
    sourcemap: false,
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
          leaflet: ["leaflet", "react-leaflet"],
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
          ],
        },
      },
    },
  },
  plugins: [
    expressServerPlugin(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /.*\.(?:js|css)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "js-css-cache",
            },
          },
        ],
        globPatterns: ["**/*.{js,css,html,woff,woff2,ttf,eot}"],
      },
      devOptions: {
        enabled: false,
        suppressWarnings: true,
        navigateFallback: "/",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));
