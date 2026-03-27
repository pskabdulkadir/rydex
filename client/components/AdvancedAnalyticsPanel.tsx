import { useState } from 'react';
import { BarChart3, Zap, Layers, Radio, Thermometer, Shield, Eye, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AnalyticsMetrics {
  magneticIntensity: number; // 0-100
  depthVariation: number; // 0-100
  energyDensity: number; // 0-100
  structuralStability: number; // 0-100
  signalClarity: number; // 0-100
  anomalyCount: number;
  detectionConfidence: number; // 0-100
  layerCount: number;
}

interface AdvancedAnalyticsPanelProps {
  activityScore: number;
  config: {
    depth: { min: number; max: number };
    areaRadius: number;
    densityLevel: number;
    stabilityCoefficient: number;
  };
  showHeatmap?: boolean;
}

export default function AdvancedAnalyticsPanel({
  activityScore,
  config,
  showHeatmap = false,
}: AdvancedAnalyticsPanelProps) {
  const [expandedTab, setExpandedTab] = useState<'depth' | 'magnetic' | 'energy' | 'structural'>('magnetic');
  
  // Metrikleri hesapla
  const metrics: AnalyticsMetrics = {
    magneticIntensity: Math.min(100, activityScore * 1.2),
    depthVariation: Math.abs(config.depth.max - config.depth.min) * 20,
    energyDensity: (config.densityLevel + activityScore) / 2,
    structuralStability: config.stabilityCoefficient,
    signalClarity: Math.max(0, 100 - Math.abs(50 - activityScore)),
    anomalyCount: Math.floor((activityScore / 100) * 8),
    detectionConfidence: Math.min(100, activityScore + 10),
    layerCount: Math.max(2, Math.floor(config.depth.max / 1.5)),
  };

  // Derinlik seviyelerine göre renk
  const getDepthColor = (depth: number): string => {
    if (depth < 2) return 'text-blue-400';
    if (depth < 4) return 'text-cyan-400';
    if (depth < 6) return 'text-amber-400';
    return 'text-red-400';
  };

  // Metrik rengini belirle
  const getMetricColor = (value: number): string => {
    if (value < 30) return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
    if (value < 60) return 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300';
    if (value < 80) return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
    return 'bg-red-500/20 border-red-500/50 text-red-300';
  };

  const MetricBar = ({ label, value, icon: Icon, unit = '%' }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-300 font-semibold">{label}</span>
        </div>
        <Badge variant="outline" className="text-xs">{value.toFixed(1)}{unit}</Badge>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            value < 30 ? 'bg-blue-500' : value < 60 ? 'bg-cyan-500' : value < 80 ? 'bg-amber-500' : 'bg-red-500'
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Temel Metrikler */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          Temel Metrikleri
        </h3>
        <div className="space-y-3">
          <MetricBar
            label="Manyetik Yoğunluğu"
            value={metrics.magneticIntensity}
            icon={Radio}
          />
          <MetricBar
            label="Enerji Yoğunluğu"
            value={metrics.energyDensity}
            icon={Zap}
          />
          <MetricBar
            label="İşaret Netliği"
            value={metrics.signalClarity}
            icon={Eye}
          />
          <MetricBar
            label="Yapısal Stabilite"
            value={metrics.structuralStability}
            icon={Shield}
          />
          <MetricBar
            label="Tespit Güvenilirliği"
            value={metrics.detectionConfidence}
            icon={TrendingUp}
          />
        </div>
      </Card>

      {/* Detaylı Analiz Sekmeleri */}
      <Card className="bg-slate-800 border-slate-700 p-4">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Detaylı Analiz
        </h3>

        {/* Tab Düğmeleri */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setExpandedTab('depth')}
            className={cn(
              'px-3 py-2 rounded text-sm font-medium transition-all',
              expandedTab === 'depth'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Derinlik
          </button>
          <button
            onClick={() => setExpandedTab('magnetic')}
            className={cn(
              'px-3 py-2 rounded text-sm font-medium transition-all',
              expandedTab === 'magnetic'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Manyetik
          </button>
          <button
            onClick={() => setExpandedTab('energy')}
            className={cn(
              'px-3 py-2 rounded text-sm font-medium transition-all',
              expandedTab === 'energy'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Enerji
          </button>
          <button
            onClick={() => setExpandedTab('structural')}
            className={cn(
              'px-3 py-2 rounded text-sm font-medium transition-all',
              expandedTab === 'structural'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            )}
          >
            Yapı
          </button>
        </div>

        {/* Derinlik Analizi */}
        {expandedTab === 'depth' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 rounded p-3 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">Minimum Derinlik</p>
                <div className={cn('text-lg font-bold', getDepthColor(config.depth.min))}>
                  {config.depth.min.toFixed(1)}m
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Maksimum Derinlik</p>
                <div className={cn('text-lg font-bold', getDepthColor(config.depth.max))}>
                  {config.depth.max.toFixed(1)}m
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Katman Sayısı</p>
                <div className="text-lg font-bold text-cyan-400">{metrics.layerCount}</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                <p className="text-xs text-blue-300">
                  {metrics.layerCount} katmanlı yapı {config.depth.min.toFixed(1)}m - {config.depth.max.toFixed(1)}m derinlikte tespit edildi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manyetik Analizi */}
        {expandedTab === 'magnetic' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 rounded p-3 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">Manyetik Yoğunluk</p>
                <div className={cn('text-lg font-bold', getMetricColor(metrics.magneticIntensity))}>
                  {metrics.magneticIntensity.toFixed(1)} nT
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Anomali Sayısı</p>
                <div className="text-lg font-bold text-amber-400">{metrics.anomalyCount}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-2">
                  <p className="text-blue-300 font-semibold mb-1">X Ekseni</p>
                  <p className="text-blue-200">{(Math.random() * 50 + 25).toFixed(1)} µT</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-2">
                  <p className="text-cyan-300 font-semibold mb-1">Y Ekseni</p>
                  <p className="text-cyan-200">{(Math.random() * 50 + 25).toFixed(1)} µT</p>
                </div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                <p className="text-xs text-red-300">
                  {metrics.magneticIntensity > 75 ? '⚠️ Yüksek Manyetik Aktivite' : '✓ Normal Manyetik Alan'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enerji Analizi */}
        {expandedTab === 'energy' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 rounded p-3 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">Toplam Enerji Yoğunluğu</p>
                <div className={cn('text-lg font-bold', getMetricColor(metrics.energyDensity))}>
                  {metrics.energyDensity.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Termal Enerji</p>
                  <div className="h-2 bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${config.densityLevel * 0.7}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Elektromanyetik</p>
                  <div className="h-2 bg-slate-700 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${activityScore * 0.8}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                <p className="text-xs text-green-300">
                  ✓ Enerji dağılımı normal seviyede
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Yapısal Analiz */}
        {expandedTab === 'structural' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/50 rounded p-3 space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">Yapısal Stabilite</p>
                <div className={cn('text-lg font-bold', getMetricColor(metrics.structuralStability))}>
                  {metrics.structuralStability.toFixed(1)}%
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Alan Çapı</p>
                <div className="text-lg font-bold text-cyan-400">{config.areaRadius.toFixed(2)}m</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded p-2">
                  <p className="text-indigo-300 font-semibold mb-1">Sağlamlık</p>
                  <p className="text-indigo-200">{(config.stabilityCoefficient * 1.5).toFixed(0)}/150</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded p-2">
                  <p className="text-purple-300 font-semibold mb-1">Yoğunluk</p>
                  <p className="text-purple-200">{config.densityLevel.toFixed(0)}/100</p>
                </div>
              </div>
              <div className={cn(
                'rounded p-2 text-xs',
                metrics.structuralStability > 70
                  ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                  : metrics.structuralStability > 50
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
              )}>
                {metrics.structuralStability > 70
                  ? '✓ Yapı çok stabil'
                  : metrics.structuralStability > 50
                    ? '⚠️ Yapı ılımlı derecede stabil'
                    : '❌ Yapı istikrarsız'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Heatmap Görselleştirmesi */}
      {showHeatmap && (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-400" />
            Enerji Haritası
          </h3>
          <div className="space-y-2">
            {/* Mini Grid */}
            <div className="grid grid-cols-6 gap-1">
              {Array.from({ length: 24 }).map((_, i) => {
                const heat = Math.sin((i + Date.now() / 1000) * 0.3) * 0.5 + 0.5;
                const intensity = activityScore * heat;
                let color = 'bg-blue-600';
                if (intensity > 60) color = 'bg-red-600';
                else if (intensity > 40) color = 'bg-amber-600';
                else if (intensity > 20) color = 'bg-cyan-600';
                return (
                  <div
                    key={i}
                    className={cn('aspect-square rounded', color, 'opacity-70 hover:opacity-100 transition-opacity')}
                    title={`${intensity.toFixed(0)}%`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Düşük</span>
              <span className="flex gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span className="w-3 h-3 rounded bg-cyan-600" />
                <span className="w-3 h-3 rounded bg-amber-600" />
                <span className="w-3 h-3 rounded bg-red-600" />
              </span>
              <span>Yüksek</span>
            </div>
          </div>
        </Card>
      )}

      {/* Bilgi Kutusu */}
      <Card className="bg-blue-900/20 border-blue-700/50 p-3">
        <p className="text-xs text-blue-300">
          💡 <span className="font-semibold">İpucu:</span> Parametreleri ayarlayarak yapının analizini güncelleyin. Manyetik yoğunluk ve enerji dağılımı değişecektir.
        </p>
      </Card>
    </div>
  );
}
