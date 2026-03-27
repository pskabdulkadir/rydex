import { useEffect, useRef, useState } from 'react';
import { Radio, Eye, Maximize2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MagneticFieldVisualizationProps {
  activityScore: number;
  areaRadius: number;
  densityLevel: number;
}

type ViewMode = '2d' | '3d-iso' | 'heatmap';

export default function MagneticFieldVisualization({
  activityScore,
  areaRadius,
  densityLevel,
}: MagneticFieldVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const animate = () => {
      timeRef.current += 0.02;

      // Arka plan temizle
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, width, height);

      // Grid çiz
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (viewMode === '2d') {
        drawMagneticField2D(ctx, centerX, centerY, width, height);
      } else if (viewMode === '3d-iso') {
        drawMagneticField3DIso(ctx, centerX, centerY, width, height);
      } else {
        drawMagneticHeatmap(ctx, centerX, centerY, width, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawMagneticField2D = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      w: number,
      h: number
    ) => {
      // Manyetik alan vektörleri
      const spacing = 30;
      const maxIntensity = Math.min(100, activityScore * 1.5);

      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          const dx = x - cx;
          const dy = y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(cx * cx + cy * cy);

          if (distance < maxDist * areaRadius / 3) {
            const angle =
              Math.atan2(dy, dx) +
              Math.sin(timeRef.current + distance * 0.01) * 0.5;
            const magnitude =
              (maxIntensity / 100) *
              Math.max(0, 1 - distance / (maxDist * areaRadius / 3)) *
              (1 + Math.sin(timeRef.current + distance * 0.02) * 0.3);

            // Vektör rengi
            let color = '#22c55e';
            if (magnitude > 0.6) color = '#eab308';
            if (magnitude > 0.8) color = '#ef4444';

            const arrowLength = magnitude * 15;
            const endX = x + Math.cos(angle) * arrowLength;
            const endY = y + Math.sin(angle) * arrowLength;

            // Vektör çizgi
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7 + magnitude * 0.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // Ok başı
            const headlen = 6;
            const angle2 = Math.atan2(endY - y, endX - x);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(
              endX - headlen * Math.cos(angle2 - Math.PI / 6),
              endY - headlen * Math.sin(angle2 - Math.PI / 6)
            );
            ctx.lineTo(
              endX - headlen * Math.cos(angle2 + Math.PI / 6),
              endY - headlen * Math.sin(angle2 + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1;

      // Merkez nokta
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Başlık
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Manyetik Alan - 2D Görünüş (${activityScore.toFixed(0)}%)`,
        w / 2,
        20
      );
    };

    const drawMagneticField3DIso = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      w: number,
      h: number
    ) => {
      const spacing = 40;
      const depth = areaRadius * 3;
      const maxIntensity = Math.min(100, activityScore * 1.5);

      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          for (let z = 0; z < depth; z += spacing * 1.5) {
            const dx = x - cx;
            const dy = y - cy;
            const dz = z - depth / 2;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const maxDist = Math.sqrt(
              cx * cx + cy * cy + (depth / 2) * (depth / 2)
            );

            if (distance < maxDist * (areaRadius / 3)) {
              const magnitude =
                (maxIntensity / 100) *
                Math.max(0, 1 - distance / (maxDist * (areaRadius / 3))) *
                (1 + Math.sin(timeRef.current + distance * 0.02) * 0.3);

              // ISO projeksiyon
              const scale = 0.5 + (z / depth) * 0.5;
              const isoX = x - (z * 0.3);
              const isoY = y + (z * 0.15);

              let color = '#22c55e';
              if (magnitude > 0.6) color = '#eab308';
              if (magnitude > 0.8) color = '#ef4444';

              ctx.fillStyle = color;
              ctx.globalAlpha = 0.5 + magnitude * 0.4;
              ctx.beginPath();
              const size = 4 + magnitude * 4;
              ctx.arc(isoX, isoY, size * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      ctx.globalAlpha = 1;

      // Başlık
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Manyetik Alan - 3D İzometrik (${activityScore.toFixed(0)}%)`,
        w / 2,
        20
      );
    };

    const drawMagneticHeatmap = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      w: number,
      h: number
    ) => {
      const pixelSize = 10;
      const maxIntensity = Math.min(100, activityScore * 1.5);

      for (let x = 0; x < w; x += pixelSize) {
        for (let y = 0; y < h; y += pixelSize) {
          const dx = x - cx;
          const dy = y - cy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(cx * cx + cy * cy);

          if (distance < maxDist * areaRadius / 2) {
            const intensity =
              (maxIntensity / 100) *
              Math.max(0, 1 - distance / (maxDist * areaRadius / 2)) *
              (1 + Math.sin(timeRef.current + distance * 0.02) * 0.3) *
              (1 + densityLevel / 100);

            let color = '#0f172a';
            if (intensity > 0.2) color = '#1e3a8a';
            if (intensity > 0.4) color = '#059669';
            if (intensity > 0.6) color = '#d97706';
            if (intensity > 0.8) color = '#dc2626';
            if (intensity > 0.95) color = '#fbbf24';

            ctx.fillStyle = color;
            ctx.globalAlpha = intensity;
            ctx.fillRect(x, y, pixelSize, pixelSize);
          }
        }
      }

      ctx.globalAlpha = 1;

      // Başlık
      ctx.fillStyle = '#e0e7ff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Manyetik Yoğunluk Haritası (${activityScore.toFixed(0)}%)`,
        w / 2,
        20
      );

      // Efsane
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.globalAlpha = 0.7;
      const legendY = h - 20;
      const colors = [
        { color: '#1e3a8a', label: 'Düşük' },
        { color: '#059669', label: 'Orta' },
        { color: '#d97706', label: 'Yüksek' },
        { color: '#dc2626', label: 'Çok Yüksek' },
        { color: '#fbbf24', label: 'Kritik' },
      ];
      let legendX = 10;
      colors.forEach(({ color, label }) => {
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY, 10, 10);
        ctx.fillStyle = '#e0e7ff';
        ctx.fillText(label, legendX + 15, legendY + 8);
        legendX += 90;
      });
      ctx.globalAlpha = 1;
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode, activityScore, areaRadius, densityLevel]);

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            Manyetik Alan Analizi
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setViewMode('2d')}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-all',
                viewMode === '2d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              2D
            </button>
            <button
              onClick={() => setViewMode('3d-iso')}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-all',
                viewMode === '3d-iso'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              3D ISO
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={cn(
                'px-2 py-1 rounded text-xs font-medium transition-all',
                viewMode === 'heatmap'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              )}
            >
              Harita
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <canvas
            ref={canvasRef}
            width={500}
            height={300}
            className="w-full h-auto block"
          />
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Yoğunluk</p>
            <p className="text-sm font-bold text-blue-400">
              {(activityScore * 1.2).toFixed(1)} µT
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Alan Çapı</p>
            <p className="text-sm font-bold text-cyan-400">{areaRadius.toFixed(2)}m</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Yoğunluk Seviyesi</p>
            <p className="text-sm font-bold text-amber-400">{densityLevel.toFixed(0)}%</p>
          </div>
        </div>

        {/* Açıklama */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3 text-xs text-blue-300">
          <p className="mb-1 font-semibold flex items-center gap-1">
            <Eye className="w-3 h-3" /> Görünüş Seçenekleri
          </p>
          <ul className="space-y-1 ml-4">
            <li>• <strong>2D</strong>: İki boyutlu manyetik vektör alanı</li>
            <li>• <strong>3D ISO</strong>: İzometrik üç boyutlu görünüş</li>
            <li>• <strong>Harita</strong>: Yoğunluk ısı haritası</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
