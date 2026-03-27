import React, { useState, useEffect } from 'react';

/**  3D Küp Görselleştirmesi */
export function Cube3DVisualization({ 
  title = "3D Model",
  rotationSpeed = 0.5,
  color = "rgba(59, 130, 246, 0.8)"
}: { 
  title?: string;
  rotationSpeed?: number;
  color?: string;
}) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => ({
        x: r.x + rotationSpeed * 0.3,
        y: r.y + rotationSpeed * 0.5,
        z: r.z + rotationSpeed * 0.2
      }));
    }, 50);
    return () => clearInterval(interval);
  }, [rotationSpeed]);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-center h-48" style={{
        perspective: '1000px'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: 'transform 0.05s linear'
        }}>
          {/* Küpün 6 yüzü */}
          {[
            { transform: 'translateZ(50px)', label: 'Ön' },
            { transform: 'rotateY(180deg) translateZ(50px)', label: 'Arka' },
            { transform: 'rotateY(90deg) translateZ(50px)', label: 'Sağ' },
            { transform: 'rotateY(-90deg) translateZ(50px)', label: 'Sol' },
            { transform: 'rotateX(90deg) translateZ(50px)', label: 'Üst' },
            { transform: 'rotateX(-90deg) translateZ(50px)', label: 'Alt' }
          ].map((face, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                background: color,
                opacity: 0.7,
                border: '2px solid rgba(255,255,255,0.3)',
                transform: face.transform,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {face.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**  Hologram Görselleştirmesi */
export function HologramVisualization({
  title = "Hologram",
  rings = 5,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308"]
}: {
  title?: string;
  rings?: number;
  colors?: string[];
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => r + 2);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <svg width="100%" height="200" className="bg-gray-900 rounded-lg" viewBox="0 0 300 200">
        <defs>
          <radialGradient id="holo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
        </defs>

        {/* Arka plan ışınları */}
        <g opacity="0.3">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const x1 = 150 + Math.cos(angle) * 80;
            const y1 = 100 + Math.sin(angle) * 80;
            return (
              <line
                key={i}
                x1="150"
                y1="100"
                x2={x1}
                y2={y1}
                stroke="#3b82f6"
                strokeWidth="1"
                opacity={(i % 3) * 0.3}
              />
            );
          })}
        </g>

        {/* Dönen halkalar */}
        {Array.from({ length: rings }).map((_, i) => {
          const radius = (i + 1) * (60 / rings);
          return (
            <circle
              key={i}
              cx="150"
              cy="100"
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="2"
              opacity="0.6"
              style={{
                transform: `rotate(${rotation + i * 30}deg)`,
                transformOrigin: '150px 100px',
                transition: 'none'
              }}
            />
          );
        })}

        {/* Merkez noktası */}
        <circle cx="150" cy="100" r="6" fill="#3b82f6" opacity="0.8" />
        <circle cx="150" cy="100" r="10" fill="url(#holo-glow)" />
      </svg>
    </div>
  );
}

/**  Yapı Katman Diyagramı */
export function StructureLayers({
  title = "Yapı Katmanları",
  layers = [
    { name: "Yüzey", depth: 0, color: "#8b7355" },
    { name: "Toprak", depth: 2, color: "#a0826d" },
    { name: "Taş", depth: 5, color: "#7a7a7a" },
    { name: "Yapı", depth: 8, color: "#d4a574" },
    { name: "Hazine", depth: 12, color: "#fbbf24" }
  ]
}: {
  title?: string;
  layers?: Array<{ name: string; depth: number; color: string }>;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <div className="bg-gray-900 rounded-lg p-4">
        <svg width="100%" height="250" viewBox="0 0 200 250" className="mb-2">
          {layers.map((layer, idx) => {
            const y = (idx / (layers.length - 1)) * 200;
            const nextY = idx < layers.length - 1 ? ((idx + 1) / (layers.length - 1)) * 200 : 200;
            const height = nextY - y;

            return (
              <g key={idx}>
                <rect
                  x="20"
                  y={y}
                  width="160"
                  height={height}
                  fill={layer.color}
                  stroke="#ffffff"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <text x="190" y={y + height / 2} fontSize="11" fill="#ffffff" textAnchor="start" dominantBaseline="middle">
                  {layer.name}
                </text>
                <text x="10" y={y + height / 2} fontSize="10" fill="#ffffff" textAnchor="end" dominantBaseline="middle" opacity="0.6">
                  {layer.depth}m
                </text>
              </g>
            );
          })}
        </svg>
        <div className="text-xs text-gray-400 text-center">Derinlik Profili</div>
      </div>
    </div>
  );
}

/**  Isı Haritası */
export function HeatmapVisualization({
  title = "Isı Haritası",
  width = 12,
  height = 12
}: {
  title?: string;
  width?: number;
  height?: number;
}) {
  const generateHeat = (x: number, y: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    return Math.max(0, 1 - distance / maxDistance);
  };

  const getColor = (value: number) => {
    if (value > 0.7) return '#ff0000';
    if (value > 0.5) return '#ff6b00';
    if (value > 0.3) return '#ffff00';
    if (value > 0.1) return '#00ff00';
    return '#0000ff';
  };

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <div className="bg-gray-900 rounded-lg p-4">
        <svg width="100%" height="180" viewBox={`0 0 ${width * 15} ${height * 15}`}>
          {Array.from({ length: height }).map((_, y) =>
            Array.from({ length: width }).map((_, x) => {
              const value = generateHeat(x, y);
              return (
                <rect
                  key={`${x}-${y}`}
                  x={x * 15}
                  y={y * 15}
                  width="14"
                  height="14"
                  fill={getColor(value)}
                  opacity={0.8}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
              );
            })
          )}
        </svg>
        <div className="text-xs text-gray-400 mt-2 flex justify-between px-2">
          <span>Soğuk</span>
          <span>Sıcak</span>
        </div>
      </div>
    </div>
  );
}

/**  Radar Görselleştirmesi */
export function RadarVisualization({
  title = "Radar Taraması",
  score = 75,
  rings = 4
}: {
  title?: string;
  score?: number;
  rings?: number;
}) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(r => (r + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const centerX = 100;
  const centerY = 100;
  const maxRadius = 80;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <svg width="100%" height="220" viewBox="0 0 200 220" className="bg-gray-900 rounded-lg">
        {/* Arka plan halkalar */}
        {Array.from({ length: rings }).map((_, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={(maxRadius / rings) * (i + 1)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Haç çizgileri */}
        <line x1={centerX} y1={centerY - maxRadius - 5} x2={centerX} y2={centerY + maxRadius + 5} stroke="#3b82f6" strokeWidth="1" opacity="0.2" />
        <line x1={centerX - maxRadius - 5} y1={centerY} x2={centerX + maxRadius + 5} y2={centerY} stroke="#3b82f6" strokeWidth="1" opacity="0.2" />

        {/* Dönen tarama hüzmesi */}
        <g style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${centerX}px ${centerY}px`,
          transition: 'none'
        }}>
          <line x1={centerX} y1={centerY} x2={centerX} y2={centerY - maxRadius} stroke="#10b981" strokeWidth="2" opacity="0.8" />
          <polygon
            points={`${centerX},${centerY} ${centerX - 20},${centerY - maxRadius} ${centerX + 20},${centerY - maxRadius}`}
            fill="#10b981"
            opacity="0.3"
          />
        </g>

        {/* Anomali noktaları */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const r = (maxRadius * (50 + Math.random() * 50)) / 100;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill={score > 70 ? "#ef4444" : "#f97316"}
              opacity="0.6"
            />
          );
        })}

        {/* Merkez */}
        <circle cx={centerX} cy={centerY} r="5" fill="#10b981" opacity="0.8" />
      </svg>
      <div className="text-xs text-gray-400 text-center">Aktivite: {score}%</div>
    </div>
  );
}

/**  Spektral Analiz Grafı */
export function SpectralAnalysis({
  title = "Spektral Analiz",
  frequencies = Array.from({ length: 20 }, (_, i) => Math.random())
}: {
  title?: string;
  frequencies?: number[];
}) {
  const maxFreq = Math.max(...frequencies);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <svg width="100%" height="180" viewBox={`0 0 ${frequencies.length * 12} 180`} className="bg-gray-900 rounded-lg">
        {frequencies.map((freq, idx) => {
          const barHeight = (freq / maxFreq) * 160;
          const x = idx * 12;
          const y = 170 - barHeight;
          const hue = (freq / maxFreq) * 120; // Mavi -> Yeşil -> Kırmızı
          const color = `hsl(${120 - hue}, 100%, 50%)`;

          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width="10"
              height={barHeight}
              fill={color}
              opacity="0.8"
            />
          );
        })}
      </svg>
      <div className="text-xs text-gray-400 text-center">Frekans Dağılımı</div>
    </div>
  );
}

/**  Jeoloji Tabakası Animasyon */
export function GeologyAnimation({
  title = "Jeoloji Analizi",
  depth = 15
}: {
  title?: string;
  depth?: number;
}) {
  const [activeDepth, setActiveDepth] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDepth(d => d < depth - 1 ? d + 1 : 0);
    }, 800);
    return () => clearInterval(interval);
  }, [depth]);

  const layers = Array.from({ length: depth }, (_, i) => ({
    depth: i,
    type: ['Toprak', 'Kum', 'Çakıl', 'Taş', 'Şist'][i % 5],
    color: ['#8b7355', '#d4a574', '#a0a0a0', '#696969', '#505050'][i % 5]
  }));

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <div className="bg-gray-900 rounded-lg p-4">
        <svg width="100%" height="200" viewBox="0 0 200 200">
          {layers.map((layer, idx) => {
            const y = (idx / depth) * 160;
            const height = 160 / depth;
            const isActive = idx === activeDepth;

            return (
              <g key={idx}>
                <rect
                  x="20"
                  y={y}
                  width="160"
                  height={height}
                  fill={layer.color}
                  stroke={isActive ? '#10b981' : '#ffffff'}
                  strokeWidth={isActive ? "2" : "1"}
                  opacity={isActive ? 1 : 0.6}
                />
                {isActive && (
                  <>
                    <circle cx="120" cy={y + height / 2} r="8" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                    <text x="130" y={y + height / 2} fontSize="9" fill="#10b981" dominantBaseline="middle" fontWeight="bold">
                      {layer.type}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          <text x="10" y="190" fontSize="11" fill="#ffffff" opacity="0.7">
            Derinlik: {activeDepth} m
          </text>
        </svg>
      </div>
    </div>
  );
}

/**  Manyetik Alan Görselleştirmesi */
export function MagneticFieldVisualization({
  title = "Manyetik Alan Haritası",
  strength = 65
}: {
  title?: string;
  strength?: number;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <svg width="100%" height="180" viewBox="0 0 200 180" className="bg-gray-900 rounded-lg">
        {/* Manyetik alan çizgileri */}
        {Array.from({ length: 7 }).map((_, i) => {
          const startY = (i / 6) * 160;
          const curve = Math.sin(i) * 30;
          return (
            <path
              key={i}
              d={`M 20,${startY} Q 100,${startY + curve} 180,${startY}`}
              stroke={strength > 70 ? "#ef4444" : "#f97316"}
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />
          );
        })}

        {/* Kutup göstergesi */}
        <circle cx="30" cy="30" r="15" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7" />
        <text x="30" y="35" fontSize="12" fill="#ef4444" textAnchor="middle" fontWeight="bold">N</text>

        <circle cx="170" cy="30" r="15" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.7" />
        <text x="170" y="35" fontSize="12" fill="#3b82f6" textAnchor="middle" fontWeight="bold">S</text>

        {/* Güç göstergesi */}
        <text x="100" y="170" fontSize="11" fill="#ffffff" textAnchor="middle" opacity="0.7">
          Kuvvet: {strength}%
        </text>
      </svg>
    </div>
  );
}
