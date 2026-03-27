import { createServer } from "./index";

try {
  console.log("[Express Dev] 🚀 Express server oluşturuluyor...");
  const app = createServer();
  console.log("[Express Dev] ✅ Express server başarıyla oluşturuldu!");

  const port = 5173; // Vite'den farklı port

  app.listen(port, () => {
    console.log(`[Express Dev] ✅ Server çalışıyor: http://localhost:${port}`);
    console.log(`[Express Dev] API endpoints: http://localhost:${port}/api/*`);
  });

  // Unhandled rejection handling
  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Express Dev] ❌ Unhandled Rejection:', reason);
  });

  // Uncaught exception handling
  process.on('uncaughtException', (error) => {
    console.error('[Express Dev] ❌ Uncaught Exception:', error);
    process.exit(1);
  });
} catch (error) {
  console.error("[Express Dev] ❌ HATA: Express server oluşturulamadı!");
  console.error("[Express Dev] ❌ Hata detayı:", error);
  process.exit(1);
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[Express Dev] 🛑 SIGTERM alındı, kapatılıyor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[Express Dev] 🛑 SIGINT alındı, kapatılıyor...");
  process.exit(0);
});
