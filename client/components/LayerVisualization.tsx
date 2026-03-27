import { useState } from 'react';
import { Layers, Info, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Layer {
  id: number;
  name: string;
  depth: { min: number; max: number };
  thickness: number;
  color: string;
  density: number;
  composition: string;
  magneticSignature: number;
}

interface LayerVisualizationProps {
  depthMin: number;
  depthMax: number;
  densityLevel: number;
  activityScore: number;
}

export default function LayerVisualization({
  depthMin,
  depthMax,
  densityLevel,
  activityScore,
}: LayerVisualizationProps) {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(0);

  // Katmanları dinamik olarak oluştur
  const generateLayers = (): Layer[] => {
    const layers: Layer[] = [];
    const layerCount = Math.max(2, Math.floor(depthMax / 1.5));
    const layerThickness = depthMax / layerCount;

    const layerTypes = [
      { name: 'Üst Toprak Katmanı', color: '#8b7355', composition: 'Kil ve Kumlu Toprak' },
      { name: 'Depo Katmanı', color: '#7a6a5a', composition: 'Orta Yoğunluklu Toprak' },
      { name: 'Katı Temel', color: '#5a4a3a', composition: 'Taş ve Kaya' },
      { name: 'Jeolojik Tabaka', color: '#3a2a1a', composition: 'Sert Kaya Formasyonu' },
      { name: 'Alt Katman', color: '#2a1a0a', composition: 'Bedrock ve Mineral Birikinti' },
    ];

    for (let i = 0; i < layerCount; i++) {
      const startDepth = i * layerThickness;
      const endDepth = (i + 1) * layerThickness;
      const layerType = layerTypes[Math.min(i, layerTypes.length - 1)];

      layers.push({
        id: i,
        name: layerType.name,
        depth: { min: startDepth, max: endDepth },
        thickness: layerThickness,
        color: layerType.color,
        density: 30 + (i * 15) + densityLevel * 0.2,
        composition: layerType.composition,
        magneticSignature: activityScore * (0.5 + i * 0.15),
      });
    }

    return layers;
  };

  const layers = generateLayers();
  const totalDepth = depthMax - depthMin;
  const scalePercentage = 100 / totalDepth;

  return (
    <Card className="bg-slate-800 border-slate-700 p-4">
      <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 text-blue-400" />
        Zemin Katmanları Analizi
      </h3>

      <div className="space-y-4">
        {/* Katman Görseli */}
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="flex gap-4">
            {/* Katman Yığını */}
            <div className="flex-1">
              <div className="space-y-2">
                {layers.map((layer, idx) => {
                  const heightPercent = (layer.thickness / totalDepth) * 100;
                  const isExpanded = expandedLayer === layer.id;

                  return (
                    <div
                      key={layer.id}
                      className="space-y-1"
                    >
                      <button
                        onClick={() => setExpandedLayer(isExpanded ? null : layer.id)}
                        className="w-full text-left"
                      >
                        <div
                          className={cn(
                            'rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition-all',
                            'flex items-center justify-between p-3 group'
                          )}
                          style={{
                            backgroundColor: layer.color + '40',
                            height: `${Math.max(60, heightPercent * 150)}px`,
                          }}
                        >
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {layer.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {layer.depth.min.toFixed(1)}m - {layer.depth.max.toFixed(1)}m
                            </div>
                          </div>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 text-slate-400 transition-transform',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </div>
                      </button>

                      {/* Genişletilmiş Bilgi */}
                      {isExpanded && (
                        <div className="bg-slate-800 rounded-lg border border-blue-500/30 p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Kalınlık</p>
                              <p className="text-sm font-semibold text-cyan-400">
                                {layer.thickness.toFixed(2)}m
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-400 mb-1">Yoğunluk</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-700 rounded overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500"
                                    style={{ width: `${Math.min(100, layer.density)}%` }}
                                  />
                                </div>
                                <p className="text-xs text-slate-300">
                                  {layer.density.toFixed(0)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 mb-1">Bileşim</p>
                            <p className="text-sm text-slate-300">{layer.composition}</p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400 mb-1">Manyetik İmza</p>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-700 rounded overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full',
                                    layer.magneticSignature < 20
                                      ? 'bg-blue-500'
                                      : layer.magneticSignature < 50
                                        ? 'bg-cyan-500'
                                        : 'bg-red-500'
                                  )}
                                  style={{ width: `${Math.min(100, layer.magneticSignature)}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-300">
                                {layer.magneticSignature.toFixed(1)} µT
                              </p>
                            </div>
                          </div>

                          {/* Tavsiye */}
                          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                            <p className="text-xs text-blue-300">
                              {layer.density < 40
                                ? '✓ Yumuşak zemin - Kolaylıkla araştırılabilir'
                                : layer.density < 70
                                  ? '⚠️ Orta sertlik - Normal kazı zorluk'
                                  : '⚠️ Katı zemin - İleri ekipman gerekebilir'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Derinlik Ölçeği */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs text-slate-400 font-semibold">DEĞİŞİM</div>
              <div className="relative h-96 bg-slate-900 rounded border border-slate-700 p-2 flex items-end gap-1">
                {Array.from({ length: Math.floor(totalDepth) }).map((_, i) => {
                  const depth = depthMin + (i / totalDepth) * totalDepth;
                  const intensity = Math.abs(Math.sin((depth + activityScore / 100) * 2)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded"
                      style={{
                        height: `${intensity * 0.3}%`,
                        opacity: 0.6 + (intensity * 0.004),
                      }}
                      title={`${depth.toFixed(1)}m`}
                    />
                  );
                })}
              </div>
              <div className="text-xs text-slate-400">
                <div>{depthMin.toFixed(1)}m</div>
                <div className="mt-2 text-center">↓</div>
                <div>{depthMax.toFixed(1)}m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Katman İstatistikleri */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Katman Sayısı</p>
            <p className="text-lg font-bold text-cyan-400">{layers.length}</p>
          </div>
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Ort. Yoğunluk</p>
            <p className="text-lg font-bold text-amber-400">
              {(layers.reduce((a, l) => a + l.density, 0) / layers.length).toFixed(0)}%
            </p>
          </div>
          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
            <p className="text-xs text-slate-400 mb-1">Maksimum Derinlik</p>
            <p className="text-lg font-bold text-blue-400">{depthMax.toFixed(1)}m</p>
          </div>
        </div>

        {/* Bilgi */}
        <div className="flex gap-2 text-xs bg-blue-900/20 border border-blue-700/50 rounded p-2">
          <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300">
            Her katmanın yoğunluğu ve manyetik imzası araştırma başarısını etkiler.
          </p>
        </div>
      </div>
    </Card>
  );
}
