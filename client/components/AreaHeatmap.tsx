import { useEffect, useRef } from 'react';

export type PaletteName = 'default' | 'thermal' | 'grayscale' | 'spectral';

const palettes: Record<PaletteName, (score: number) => string> = {
  default: (score) => {
    if (score < 20) return '#3b82f6'; // Blue
    if (score < 40) return '#10b981'; // Green
    if (score < 60) return '#f59e0b'; // Amber
    if (score < 80) return '#f97316'; // Orange
    return '#ef4444'; // Red
  },
  thermal: (score) => {
    if (score < 15) return '#000033'; // Deep Blue
    if (score < 30) return '#4b0082'; // Indigo
    if (score < 50) return '#ff00ff'; // Magenta
    if (score < 70) return '#ff4500'; // OrangeRed
    if (score < 90) return '#ffdd00'; // Yellow
    return '#ffffff'; // White
  },
  grayscale: (score) => {
    const value = Math.floor((score / 100) * 255);
    return `rgb(${value}, ${value}, ${value})`;
  },
  spectral: (score) => {
    const hue = (1 - score / 100) * 240; // Blue (high) to Red (low)
    return `hsl(${hue}, 100%, 50%)`;
  },
};

const paletteLegends: Record<PaletteName, { label: string; color: string }[]> = {
  default: [
    { label: 'Düşük', color: '#3b82f6' },
    { label: 'Orta', color: '#10b981' },
    { label: 'Yüksek', color: '#f59e0b' },
    { label: 'Yoğun', color: '#ef4444' },
  ],
  thermal: [
    { label: 'Soğuk', color: '#4b0082' },
    { label: 'Ilık', color: '#ff00ff' },
    { label: 'Sıcak', color: '#ff4500' },
    { label: 'Çok Sıcak', color: '#ffdd00' },
  ],
  grayscale: [
    { label: 'Düşük', color: '#333333' },
    { label: 'Orta', color: '#888888' },
    { label: 'Yüksek', color: '#cccccc' },
    { label: 'Yoğun', color: '#ffffff' },
  ],
  spectral: [
    { label: 'Düşük', color: 'hsl(0, 100%, 50%)' },
    { label: 'Orta', color: 'hsl(60, 100%, 50%)' },
    { label: 'Yüksek', color: 'hsl(120, 100%, 50%)' },
    { label: 'Yoğun', color: 'hsl(180, 100%, 50%)' },
  ],
};

export interface HeatmapCell {
  x: number;
  y: number;
  score: number; // 0-100
}

interface AreaHeatmapProps {
  cells: HeatmapCell[];
  gridSize: number;
  areaWidth: number;
  areaHeight: number;
  showLabels?: boolean;
  hotspot?: HeatmapCell | null;
  palette?: PaletteName;
  clustering?: boolean;
}

export default function AreaHeatmap({
  cells,
  gridSize,
  showLabels = true,
  hotspot = null,
  palette = 'default',
  clustering = false,
}: AreaHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create lookup map for scores
    const scoreMap = new Map<string, number>();
    cells.forEach((cell) => {
      scoreMap.set(`${cell.x},${cell.y}`, cell.score);
    });

    // Draw grid and heatmap
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const score = scoreMap.get(`${x},${y}`) || 0;

        // Cell background based on score and palette
        ctx.fillStyle = score > 0 ? palette : '#0f172a';
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

        // Cell border
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);

        // Draw score text if enabled and score > 5
        if (showLabels && score > 5) {
          ctx.fillStyle = score > 70 && palette !== 'grayscale' ? '#ffffff' : '#e2e8f0';
          ctx.font = `${Math.floor(cellWidth * 0.3)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(Math.round(score).toString(), x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2);
        }
      }
    }

    // Mark hotspot
    if (hotspot) {
      const hotspotX = hotspot.x;
      const hotspotY = hotspot.y;
      
      // Draw hotspot marker
      const centerX = (hotspotX + 0.5) * cellWidth;
      const centerY = (hotspotY + 0.5) * cellHeight;

      // Pulsing circle
      const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;
      const radius = cellWidth * 0.3 + cellWidth * 0.2 * pulse;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clustering visualization
    if (clustering) {
      const clusters: HeatmapCell[][] = [];
      const visited = new Set<string>();
      const threshold = 60; // Cluster threshold

      cells.forEach(cell => {
        if (cell.score >= threshold && !visited.has(`${cell.x},${cell.y}`)) {
          const cluster: HeatmapCell[] = [];
          const queue = [cell];
          visited.add(`${cell.x},${cell.y}`);

          while (queue.length > 0) {
            const current = queue.shift()!;
            cluster.push(current);

            // Check neighbors
            const neighbors = cells.filter(c => 
              Math.abs(c.x - current.x) <= 1 && 
              Math.abs(c.y - current.y) <= 1 &&
              c.score >= threshold &&
              !visited.has(`${c.x},${c.y}`)
            );

            neighbors.forEach(n => {
              visited.add(`${n.x},${n.y}`);
              queue.push(n);
            });
          }
          if (cluster.length > 1) clusters.push(cluster);
        }
      });

      // Draw clusters
      clusters.forEach(cluster => {
        const minX = Math.min(...cluster.map(c => c.x));
        const maxX = Math.max(...cluster.map(c => c.x));
        const minY = Math.min(...cluster.map(c => c.y));
        const maxY = Math.max(...cluster.map(c => c.y));

        ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)'; // Yellow for clusters
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          minX * cellWidth, 
          minY * cellHeight, 
          (maxX - minX + 1) * cellWidth, 
          (maxY - minY + 1) * cellHeight
        );
        ctx.setLineDash([]);
      });
    }

    // Draw compass/orientation
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('N', 10, 20);
    ctx.font = '12px sans-serif';
    ctx.fillText('Kuzey', 25, 18);
  }, [cells, gridSize, showLabels, hotspot, palette, clustering]);

  const resizeCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const currentLegend = paletteLegends[palette];

  return (
    <div className="w-full h-full flex flex-col">
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair bg-slate-900"
      />

      {/* Legend */}
      <div className="bg-slate-800 border-t border-slate-700 p-3">
        <div className="flex items-center justify-center gap-3 text-xs">
          {currentLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
