import React, { useState } from 'react';
import { Box, Layers, Activity, Maximize, Cpu, Zap, Radio, DoorOpen, Footprints, MapPin, Scan, BarChart3, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HologramViewProps {
  results: { label: string; value: string; icon: any; details: string }[];
  isVisible: boolean;
  activityScore?: number;
  config?: {
    depth: { min: number; max: number };
    areaRadius: number;
    densityLevel: number;
  };
}

export default function HologramView({ results, isVisible, activityScore = 75, config }: HologramViewProps) {
  const [hologramMode, setHologramMode] = useState<'data' | 'field' | 'analysis'>('data');

  if (!isVisible) return null;

  const renderDataMode = () => (
    <div className="relative w-[80%] h-[80%] border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
      {/* Rotating Rings */}
      <div className="absolute inset-0 border-t-2 border-blue-400/50 rounded-full animate-spin [animation-duration:10s]"></div>
      <div className="absolute inset-8 border-b-2 border-indigo-400/50 rounded-full animate-spin-reverse [animation-duration:15s]"></div>
      <div className="absolute inset-16 border-l-2 border-cyan-400/50 rounded-full animate-spin [animation-duration:20s]"></div>
      <div className="absolute inset-24 border-r-2 border-blue-500/30 rounded-full animate-spin-reverse [animation-duration:25s]"></div>

      {/* Central Core */}
      <div className="relative z-10 w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
        <Cpu className="w-12 h-12 text-blue-400 animate-pulse" />
      </div>

      {/* Floating Data Nodes */}
      {results.map((result, idx) => {
        const count = results.length;
        const angle = (idx * 360) / count;
        const radius = 220;
        const x = Math.cos((angle * Math.PI) / 180) * radius;
        const y = Math.sin((angle * Math.PI) / 180) * radius;

        return (
          <div
            key={idx}
            className="absolute transition-all duration-700 hover:scale-110 group cursor-help"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <div className="relative flex flex-col items-center">
              {/* Node Line */}
              <div className="absolute bottom-full w-px h-16 bg-gradient-to-t from-blue-500 to-transparent"></div>

              {/* Node Box */}
              <div className="bg-black/60 backdrop-blur-xl border border-blue-400/50 p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] min-w-[150px] text-center group-hover:border-blue-300 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                <result.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">{result.label}</div>
                <div className="text-sm font-black text-white mt-1">{result.value}</div>
              </div>

              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-blue-500/10 blur-xl rounded-full group-hover:bg-blue-500/20 transition-all"></div>
            </div>
          </div>
        );
      })}

      {/* Hologram Light Rays */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-gradient-to-t from-blue-500/20 to-transparent clip-path-hologram pointer-events-none"></div>
    </div>
  );

  const renderFieldMode = () => (
    <div className="relative w-[80%] h-[80%] border border-cyan-500/30 rounded-lg flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden">
      {/* Manyetik Alan Görselleştirmesi */}
      <svg className="w-full h-full" viewBox="0 0 400 400">
        {/* Grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={`grid-${i}`}>
            <line x1={i * 50} y1="0" x2={i * 50} y2="400" stroke="#164e63" strokeWidth="0.5" opacity="0.5" />
            <line x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#164e63" strokeWidth="0.5" opacity="0.5" />
          </g>
        ))}

        {/* Manyetik vektörleri */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const radius = 100 + Math.sin(angle * Math.PI / 180) * 30;
          const x = 200 + Math.cos(angle * Math.PI / 180) * radius;
          const y = 200 + Math.sin(angle * Math.PI / 180) * radius;
          const nextAngle = angle + 15;
          const x2 = 200 + Math.cos(nextAngle * Math.PI / 180) * radius;
          const y2 = 200 + Math.sin(nextAngle * Math.PI / 180) * radius;

          return (
            <g key={`vector-${i}`}>
              <line x1={x} y1={y} x2={x2} y2={y2} stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
              <polygon points={`${x2},${y2} ${x2-5},${y2-3} ${x2-3},${y2-5}`} fill="#06b6d4" opacity="0.8" />
            </g>
          );
        })}

        {/* Merkez Küre */}
        <circle cx="200" cy="200" r="30" fill="#0891b2" opacity="0.6" />
        <circle cx="200" cy="200" r="30" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
        <circle cx="200" cy="200" r="35" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
        <circle cx="200" cy="200" r="40" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.2" />
      </svg>

      {/* Efsane */}
      <div className="absolute bottom-4 left-4 text-xs text-cyan-300 space-y-1">
        <div>▶ Manyetik Vektör Alanı</div>
        <div>● Merkez Küre</div>
        <div>━ Alan Çizgileri</div>
      </div>
    </div>
  );

  const renderAnalysisMode = () => (
    <div className="relative w-[80%] h-[80%] border border-purple-500/30 rounded-lg flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden bg-slate-900/30 p-6">
      <div className="w-full h-full flex flex-col justify-between">
        {/* Üst - Analiz Başlığı */}
        <div className="text-center text-purple-300 mb-4">
          <div className="text-lg font-bold">3D YAPISAL ANALİZ</div>
          <div className="text-xs text-purple-400">Holografik İşlem Sisteminden Veri</div>
        </div>

        {/* Orta - 3D Gösterim */}
        <div className="grid grid-cols-3 gap-4 flex-1 items-center">
          {/* Sol - Derinlik */}
          <div className="space-y-2">
            <div className="text-xs text-purple-400 text-center">Derinlik Analizi</div>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const depth = (config?.depth.max || 4) * (i / 4);
                const intensity = Math.sin((i + activityScore / 100) * 1.5) * 0.5 + 0.5;
                return (
                  <div key={`depth-${i}`} className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${intensity * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-purple-300 w-12">{depth.toFixed(1)}m</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orta - Merkez İkon */}
          <div className="flex justify-center items-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-purple-500 rounded-full animate-spin opacity-50"></div>
              <div className="absolute inset-2 border-2 border-purple-400 rounded-full opacity-40"></div>
              <div className="absolute inset-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-300" />
              </div>
            </div>
          </div>

          {/* Sağ - Enerji */}
          <div className="space-y-2">
            <div className="text-xs text-purple-400 text-center">Enerji Dağılımı</div>
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const energy = 20 + i * 20;
                const intensity = activityScore / 100 * (i / 4);
                return (
                  <div key={`energy-${i}`} className="flex items-center gap-2">
                    <div className="text-[10px] text-purple-300 w-12 text-right">{energy}%</div>
                    <div className="flex-1 h-2 bg-slate-700 rounded overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${intensity * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alt - Metrikler */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-800/50 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400">Aktivite</div>
            <div className="text-lg font-bold text-white">{activityScore.toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400">Alan</div>
            <div className="text-lg font-bold text-white">{(config?.areaRadius || 2).toFixed(1)}m</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400">Yoğunluk</div>
            <div className="text-lg font-bold text-white">{(config?.densityLevel || 50).toFixed(0)}%</div>
          </div>
          <div className="bg-slate-800/50 border border-purple-500/30 rounded p-2">
            <div className="text-purple-400">Derinlik</div>
            <div className="text-lg font-bold text-white">{(config?.depth.max || 4).toFixed(1)}m</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/60 backdrop-blur-lg flex items-center justify-center animate-in fade-in zoom-in duration-500">
      {hologramMode === 'data' && renderDataMode()}
      {hologramMode === 'field' && renderFieldMode()}
      {hologramMode === 'analysis' && renderAnalysisMode()}

      {/* Mode Controls */}
      <div className="absolute top-6 right-6 flex gap-2 z-50">
        <button
          onClick={() => setHologramMode('data')}
          className={cn(
            'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
            hologramMode === 'data'
              ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
          )}
          title="Veri Düğümleri"
        >
          <Cpu className="w-3 h-3" /> Data
        </button>
        <button
          onClick={() => setHologramMode('field')}
          className={cn(
            'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
            hologramMode === 'field'
              ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
          )}
          title="Manyetik Alan"
        >
          <Radio className="w-3 h-3" /> Field
        </button>
        <button
          onClick={() => setHologramMode('analysis')}
          className={cn(
            'px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1',
            hologramMode === 'analysis'
              ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
          )}
          title="Analiz"
        >
          <BarChart3 className="w-3 h-3" /> Analysis
        </button>
      </div>

      {/* Hologram Controls Overlay */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-blue-300 font-mono text-xs animate-pulse">
        ◆ HOLOGRAM MODU AKTİF - VERİLER 3D OLARAK İŞLENİYOR ◆
      </div>
    </div>
  );
}
