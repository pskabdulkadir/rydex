import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';

interface MagneticDataPoint {
  time: number;
  nanoTesla: number;
  frequency: string;
}

export default function MagneticSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState<MagneticDataPoint[]>([]);
  const [currentNT, setCurrentNT] = useState(0);
  const [frequency, setFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const [simulationTime, setSimulationTime] = useState(0);

  const frequencyValues = {
    low: { min: 20, max: 80, label: 'Düşük (20-80nT)' },
    medium: { min: 100, max: 300, label: 'Orta (100-300nT)' },
    high: { min: 350, max: 600, label: 'Yüksek (350-600nT)' },
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulationTime((prev) => prev + 1);

      // Sinüs dalgası + rastgele gürültü
      const { min, max } = frequencyValues[frequency];
      const range = (max - min) / 2;
      const center = (min + max) / 2;
      
      const wave = Math.sin((simulationTime * Math.PI) / 20) * range;
      const noise = (Math.random() - 0.5) * range * 0.3;
      const newNT = Math.max(min, Math.min(max, center + wave + noise));
      
      setCurrentNT(Math.round(newNT));

      setData((prev) => {
        const newData = [
          ...prev,
          {
            time: simulationTime,
            nanoTesla: Math.round(newNT),
            frequency,
          },
        ];
        return newData.slice(-50); // Son 50 veriyi tut
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, frequency, simulationTime]);

  const handleReset = () => {
    setData([]);
    setCurrentNT(0);
    setSimulationTime(0);
    setIsRunning(false);
  };

  const avgNT = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.nanoTesla, 0) / data.length) : 0;
  const maxNT = data.length > 0 ? Math.max(...data.map((d) => d.nanoTesla)) : 0;

  return (
    <div className="space-y-4">
      {/* Ana Gösterge */}
      <Card className="bg-slate-800 border-slate-700 p-6">
        <div className="text-center">
          <div className="text-6xl font-black text-blue-400 mb-2">{currentNT}</div>
          <div className="text-sm text-slate-400 mb-4">nanoTesla (nT)</div>
          
          {/* Sınıflandırma */}
          <div className="flex justify-center gap-4 mb-6">
            <div className={`px-4 py-2 rounded text-sm font-bold ${
              currentNT < 100 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              Düşük
            </div>
            <div className={`px-4 py-2 rounded text-sm font-bold ${
              currentNT >= 100 && currentNT < 250 ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              Orta
            </div>
            <div className={`px-4 py-2 rounded text-sm font-bold ${
              currentNT >= 250 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              Yüksek
            </div>
          </div>

          {/* Kontroller */}
          <div className="flex gap-2 justify-center mb-4">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 ${
                isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Duraklat
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Başlat
                </>
              )}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Sıfırla
            </Button>
          </div>

          {/* Frekans Seçimi */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase font-bold">Frekans Modu</p>
            <div className="flex gap-2 justify-center">
              {(Object.keys(frequencyValues) as Array<keyof typeof frequencyValues>).map((freq) => (
                <button
                  key={freq}
                  onClick={() => setFrequency(freq)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    frequency === freq
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                  }`}
                >
                  {frequencyValues[freq].label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Ortalama</p>
          <p className="text-2xl font-bold text-white">{avgNT}</p>
          <p className="text-xs text-slate-500">nT</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Maksimum</p>
          <p className="text-2xl font-bold text-white">{maxNT}</p>
          <p className="text-xs text-slate-500">nT</p>
        </Card>
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-xs text-slate-400 uppercase font-bold mb-1">Veri Noktası</p>
          <p className="text-2xl font-bold text-white">{data.length}</p>
          <p className="text-xs text-slate-500">kayıt</p>
        </Card>
      </div>

      {/* Dalga Grafiği */}
      {data.length > 0 && (
        <Card className="bg-slate-800 border-slate-700 p-4">
          <p className="text-sm font-bold text-white mb-3">Manyetik Alan Grafiği</p>
          <div className="h-24 bg-slate-900 rounded border border-slate-700 p-2 overflow-x-auto">
            <svg width={Math.max(200, data.length * 4)} height="80" className="w-full">
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              
              {/* Arka plan çizgileri */}
              {[0, 25, 50, 75].map((i) => (
                <line
                  key={`grid-${i}`}
                  x1="0"
                  y1={i}
                  x2={Math.max(200, data.length * 4)}
                  y2={i}
                  stroke="#334155"
                  strokeDasharray="2,2"
                  strokeWidth="1"
                />
              ))}

              {/* Veri çizgisi */}
              {data.length > 1 && (
                <polyline
                  points={data
                    .map((d, i) => {
                      const { min, max } = frequencyValues[d.frequency];
                      const range = max - min;
                      const y = 80 - ((d.nanoTesla - min) / range) * 80;
                      return `${i * 4},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              )}

              {/* Son nokta */}
              {data.length > 0 && (
                <circle
                  cx={(data.length - 1) * 4}
                  cy={80 - ((currentNT - frequencyValues[frequency].min) / (frequencyValues[frequency].max - frequencyValues[frequency].min)) * 80}
                  r="3"
                  fill="#ef4444"
                />
              )}
            </svg>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {frequencyValues[frequency].label} - Saat: {simulationTime}s
          </p>
        </Card>
      )}

      {/* Bilgi */}
      <Card className="bg-blue-900/20 border-blue-700/50 p-4">
        <p className="text-sm text-blue-200">
          💡 <strong>Simülatör:</strong> Gerçek manyetik alanın davranışını taklit eder. Yapı türüne göre farklı frekans modları seçin.
        </p>
      </Card>
    </div>
  );
}
