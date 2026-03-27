import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface RadarPoint {
  angle: number; // 0-360 derece
  intensity: number; // 0-100
  type: "low" | "medium" | "high"; // Anomali seviyesi
  label?: string;
}

interface RadarVisualizationProps {
  anomalyScore: number; // 0-100
  points?: RadarPoint[];
  isScanning?: boolean;
  title?: string;
}

/**
 * 360° Radar Görselleştirme Bileşeni
 * - Tarama animasyonu
 * - Alan yoğunluk halkası
 * - Renkli kodlama: Yeşil (düşük), Sarı (orta), Kırmızı (yüksek)
 */
export function RadarVisualization({
  anomalyScore,
  points = [],
  isScanning = false,
  title = "Anomali Tarayıcı",
}: RadarVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) / 2 - 10;

      // Arka planı temizle
      ctx.fillStyle = "#0f172a"; // Koyu lacivert
      ctx.fillRect(0, 0, width, height);

      // Arka plan grid'i
      drawRadarGrid(ctx, centerX, centerY, maxRadius);

      // Anomali halkaları
      drawAnomalyRings(ctx, centerX, centerY, maxRadius, anomalyScore);

      // Radar noktaları
      drawRadarPoints(ctx, centerX, centerY, maxRadius, points);

      // Tarama çizgisi (animasyonlu)
      if (isScanning) {
        const time = Date.now() % 4000; // 4 saniye döngü
        const angle = (time / 4000) * 360;
        drawScanLine(ctx, centerX, centerY, maxRadius, angle);
      }

      // Merkez noktası
      ctx.fillStyle = "#60a5fa"; // Mavi
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tekrar çiz (animasyon için)
      if (isScanning) {
        requestAnimationFrame(draw);
      }
    };

    draw();

    if (isScanning) {
      const animationFrame = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [anomalyScore, points, isScanning]);

  return (
    <Card className="w-full bg-slate-900 border-slate-700 p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-sm text-slate-400">
          Anomali Skoru: <span className={getScoreColor(anomalyScore)}>{Math.round(anomalyScore)}</span>/100
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="border border-slate-700 rounded-lg"
        />
      </div>

      {/* Renk Kodlaması */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-slate-300">Düşük</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-slate-300">Orta</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-slate-300">Yüksek</span>
        </div>
      </div>

      {isScanning && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm">Tarama Devam Ediyor...</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// Yardımcı Fonksiyonlar

function drawRadarGrid(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number
) {
  ctx.strokeStyle = "#475569"; // Gri
  ctx.lineWidth = 1;

  // Dairesel grid çizgileri
  for (let i = 1; i <= 4; i++) {
    const radius = (maxRadius / 4) * i;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Radyal grid çizgileri
  ctx.strokeStyle = "#334155"; // Koyu gri
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const x2 = centerX + maxRadius * Math.cos(rad);
    const y2 = centerY + maxRadius * Math.sin(rad);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Dereceli etiketler
    const labelX = centerX + (maxRadius + 20) * Math.cos(rad);
    const labelY = centerY + (maxRadius + 20) * Math.sin(rad);
    ctx.fillStyle = "#94a3b8"; // Açık gri
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${angle}°`, labelX, labelY);
  }
}

function drawAnomalyRings(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number,
  anomalyScore: number
) {
  // Anomali seviyesine göre halka rengini seç
  let color = "#22c55e"; // Yeşil (düşük)
  if (anomalyScore >= 30 && anomalyScore < 70) {
    color = "#eab308"; // Sarı (orta)
  } else if (anomalyScore >= 70) {
    color = "#ef4444"; // Kırmızı (yüksek)
  }

  // Anomali yoğunluğu halkası (dış)
  const ringRadius = (anomalyScore / 100) * maxRadius;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // İç doldurma (hafif)
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawRadarPoints(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number,
  points: RadarPoint[]
) {
  for (const point of points) {
    const rad = (point.angle * Math.PI) / 180;
    const radius = (point.intensity / 100) * maxRadius;
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);

    // Nokta rengini belirle
    let color = "#22c55e"; // Yeşil
    if (point.type === "medium") {
      color = "#eab308"; // Sarı
    } else if (point.type === "high") {
      color = "#ef4444"; // Kırmızı
    }

    // Nokta çiz
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Çember çiz (halo efekti)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Etiket
    if (point.label) {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(point.label, x, y - 15);
    }
  }
}

function drawScanLine(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  maxRadius: number,
  angle: number
) {
  const rad = (angle * Math.PI) / 180;
  const x2 = centerX + maxRadius * Math.cos(rad);
  const y2 = centerY + maxRadius * Math.sin(rad);

  // Tarama çizgisi (yeşil)
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Hafif parıltı efekti
  const gradient = ctx.createLinearGradient(centerX, centerY, x2, y2);
  gradient.addColorStop(0, "rgba(16, 185, 129, 0.8)");
  gradient.addColorStop(1, "rgba(16, 185, 129, 0.1)");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function getScoreColor(score: number): string {
  if (score < 30) return "text-green-400";
  if (score < 70) return "text-yellow-400";
  return "text-red-400";
}
