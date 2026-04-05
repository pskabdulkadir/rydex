import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// Üretimde, oluşturulmuş SPA dosyalarını sun
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Statik dosyaları sun
app.use(express.static(distPath));

// React Router'ı işle - tüm API olmayan rotalar için index.html'i sun
app.get("*", (req, res) => {
  // API rotaları için index.html'i sunma
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API uç noktası bulunamadı" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
