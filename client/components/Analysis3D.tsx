import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface Vector3D {
  x: number;
  y: number;
  z: number;
}

interface SurfacePoint {
  x: number;
  y: number;
  z: number; // intensity
  intensity: number; // 0-100
}

interface Analysis3DProps {
  magneticVector?: Vector3D;
  surfaceIntensity?: number[][];
  title?: string;
}

/**
 * 3D Analiz Ekranı Bileşeni
 * - Manyetik vektör animasyonu
 * - Yüzey yoğunluk mesh
 * - Hareket bazlı alan modelleme
 */
export function Analysis3D({
  magneticVector = { x: 30, y: 25, z: 15 },
  surfaceIntensity,
  title = "3D Alan Analizi",
}: Analysis3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Arka planı temizle
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // 3D koordinat eksenleri çiz
      draw3DAxes(ctx, width, height);

      // Yüzey mesh'i çiz
      if (surfaceIntensity) {
        drawSurfaceMesh(
          ctx,
          surfaceIntensity,
          width,
          height,
          rotationRef.current
        );
      }

      // Manyetik vektör animasyonu
      drawMagneticVector(
        ctx,
        magneticVector,
        width,
        height,
        rotationRef.current
      );

      // Rotasyonu güncelle
      rotationRef.current.y += 0.005;
      rotationRef.current.x += 0.002;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [magneticVector, surfaceIntensity]);

  return (
    <Card className="w-full bg-slate-900 border-slate-700 p-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">
          Manyetik Vektör: X={magneticVector.x.toFixed(1)} Y=
          {magneticVector.y.toFixed(1)} Z={magneticVector.z.toFixed(1)} µT
        </p>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="border border-slate-700 rounded-lg bg-slate-950"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-slate-400">
        <div>
          <span className="text-red-400 font-semibold">X-Eksen:</span>{" "}
          {magneticVector.x.toFixed(1)} µT
        </div>
        <div>
          <span className="text-green-400 font-semibold">Y-Eksen:</span>{" "}
          {magneticVector.y.toFixed(1)} µT
        </div>
        <div>
          <span className="text-blue-400 font-semibold">Z-Eksen:</span>{" "}
          {magneticVector.z.toFixed(1)} µT
        </div>
      </div>
    </Card>
  );
}

// Yardımcı Fonksiyonlar

function draw3DAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const axisLength = 80;

  // Eksenleri çiz
  const axes = [
    { color: "#ef4444", x: 1, y: 0, z: 0, label: "X" }, // Kırmızı
    { color: "#22c55e", x: 0, y: 1, z: 0, label: "Y" }, // Yeşil
    { color: "#3b82f6", x: 0, y: 0, z: 1, label: "Z" }, // Mavi
  ];

  for (const axis of axes) {
    const x2 = centerX + axisLength * (axis.x * 0.7 + axis.z * 0.7);
    const y2 = centerY - axisLength * (axis.y + axis.z * 0.5);

    ctx.strokeStyle = axis.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Ok başı
    drawArrow(ctx, centerX, centerY, x2, y2, axis.color);

    // Etiket
    ctx.fillStyle = axis.color;
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(axis.label, x2 + 15, y2 - 10);
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
) {
  const headlen = 8;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawMagneticVector(
  ctx: CanvasRenderingContext2D,
  vector: Vector3D,
  width: number,
  height: number,
  rotation: { x: number; y: number }
) {
  const centerX = width / 2;
  const centerY = height / 2;

  // 3D rotasyon uygula
  const rx = vector.x;
  const ry = vector.y * Math.cos(rotation.x) - vector.z * Math.sin(rotation.x);
  const rz = vector.y * Math.sin(rotation.x) + vector.z * Math.cos(rotation.x);

  const px = rx * Math.cos(rotation.y) + rz * Math.sin(rotation.y);
  const py = ry;
  const pz = -rx * Math.sin(rotation.y) + rz * Math.cos(rotation.y);

  // Perspektif projeksiyon
  const scale = 100 / (100 + pz);
  const x2 = centerX + px * scale * 2;
  const y2 = centerY - py * scale * 2;

  // Vektör çiz
  ctx.strokeStyle = "#fbbf24"; // Sarı
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Ok başı
  drawArrow(ctx, centerX, centerY, x2, y2, "#fbbf24");

  // Başlık
  const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${magnitude.toFixed(1)} µT`, x2 + 20, y2 - 20);

  ctx.globalAlpha = 1;
}

function drawSurfaceMesh(
  ctx: CanvasRenderingContext2D,
  intensityGrid: number[][],
  width: number,
  height: number,
  rotation: { x: number; y: number }
) {
  const centerX = width / 2;
  const centerY = height / 2;
  const cellSize = 8;

  // Grid'i çiz
  for (let y = 0; y < intensityGrid.length; y++) {
    for (let x = 0; x < intensityGrid[y].length; x++) {
      const intensity = intensityGrid[y][x];

      // Yoğunluğa göre renk seç
      let color = "#22c55e"; // Yeşil
      if (intensity > 50 && intensity <= 70) {
        color = "#eab308"; // Sarı
      } else if (intensity > 70) {
        color = "#ef4444"; // Kırmızı
      }

      // 3D koordinat
      const rx = (x - intensityGrid[0].length / 2) * cellSize;
      const ry = (intensity / 100) * 50; // Yükseklik = yoğunluk
      const rz = (y - intensityGrid.length / 2) * cellSize;

      // Rotasyon
      const rotY = rx * Math.cos(rotation.y) + rz * Math.sin(rotation.y);
      const rotX = (rx * Math.sin(rotation.y) - rz * Math.cos(rotation.y)) * Math.cos(rotation.x) - ry * Math.sin(rotation.x);
      const rotZ = (rx * Math.sin(rotation.y) - rz * Math.cos(rotation.y)) * Math.sin(rotation.x) + ry * Math.cos(rotation.x);

      // Perspektif
      const scale = 150 / (150 + rotZ);
      const screenX = centerX + rotY * scale;
      const screenY = centerY - rotX * scale;

      // Küp çiz
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0.3, (intensity / 100) * 0.8);
      ctx.fillRect(screenX - 3, screenY - 3, 6, 6);

      // Çember çiz (yoğunluk göstergesi)
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 2 + (intensity / 100) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }
}
