import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Compass, Activity, TrendingUp, Zap, AlertCircle, RefreshCw, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MagnetometerReading {
  x: number;
  y: number;
  z: number;
  total: number;
  timestamp: number;
  latitude?: number;
  longitude?: number;
}

export default function MagnetometerDetail() {
  const navigate = useNavigate();
  const [selectedChart, setSelectedChart] = useState<'timeline' | 'heatmap'>('timeline');
  const [magnetometerData, setMagnetometerData] = useState<MagnetometerReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, max: 0, min: 0 });

  // Sunucudan gerçek manyetometre verilerini al
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/magnetometer/data?limit=100');
        if (!response.ok) throw new Error('Veri alınamadı');
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setMagnetometerData(data.data);
          
          // İstatistikleri hesapla
          const totals = data.data.map((d: MagnetometerReading) => d.total);
          setStats({
            avg: totals.reduce((a: number, b: number) => a + b, 0) / totals.length,
            max: Math.max(...totals),
            min: Math.min(...totals),
          });
          
          toast.success(`${data.data.length} manyetometre ölçümü yüklendi`);
        } else {
          toast.info('Henüz manyetometre verisi yok');
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        toast.error('Manyetometre verileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Veriler tekrar yükle
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Manyetometre Analizi</h1>
            <p className="text-sm text-gray-600">Gerçek sensör verileri ile manyetik alan ölçümü ve anomali tespiti</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Ana Kart */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Manyetik Alan Ölçümü</h2>
            </div>
            <p className="text-red-100">Cihaz sensörlerinden alınan gerçek zamanlı manyetik anomali verileri</p>
          </div>
          <div className="p-6 bg-white space-y-6">
            {/* Grafik Seçimi */}
            <div className="flex gap-4">
              <Button
                variant={selectedChart === 'timeline' ? 'default' : 'outline'}
                onClick={() => setSelectedChart('timeline')}
                className="flex-1"
              >
                <Activity className="w-4 h-4 mr-2" />
                Zaman Serisi
              </Button>
              <Button
                variant={selectedChart === 'heatmap' ? 'default' : 'outline'}
                onClick={() => setSelectedChart('heatmap')}
                className="flex-1"
              >
                <Zap className="w-4 h-4 mr-2" />
                Dağılım Haritası
              </Button>
            </div>

            {/* Grafik Alanı */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300 min-h-64">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : magnetometerData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Henüz manyetometre verisi yok</p>
                    <p className="text-sm text-gray-400 mt-1">Ölçüme başlamak için Magnetometer sayfasını ziyaret edin</p>
                  </div>
                </div>
              ) : selectedChart === 'timeline' ? (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Manyetik Alan Değişimi (Son 10 Ölçüm)</h4>
                  <div className="space-y-2">
                    {magnetometerData.slice(-10).map((reading, i) => {
                      const maxTotal = stats.max || 1;
                      const barHeight = Math.max(20, (reading.total / maxTotal) * 100);
                      const time = new Date(reading.timestamp).toLocaleTimeString();
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-gray-600 w-24">{time}</span>
                          <div className="flex-1 h-6 bg-gradient-to-r from-blue-100 to-red-400 rounded" style={{ height: `${barHeight}px` }} />
                          <span className="text-xs text-gray-600 font-mono w-20">{reading.total.toFixed(2)} µT</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-600 text-center mt-4">µT = Mikro Tesla (Manyetik alan gücü birimi)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Manyetik Alan Dağılımı Haritası</h4>
                  <div className="grid grid-cols-6 gap-1">
                    {magnetometerData.slice(-36).map((reading, i) => {
                      const maxTotal = stats.max || 1;
                      const normalized = reading.total / maxTotal;
                      let color = 'bg-blue-400';
                      if (normalized > 0.7) color = 'bg-red-500';
                      else if (normalized > 0.4) color = 'bg-yellow-400';
                      const title = `${reading.total.toFixed(2)} µT`;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded ${color} cursor-pointer hover:opacity-75 transition`}
                          title={title}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Düşük</span>
                    <span>Normal</span>
                    <span>Yüksek</span>
                  </div>
                </div>
              )}
            </div>

            {/* İstatistikler */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-gray-900 mb-2">Ölçüm İstatistikleri</h4>
                {magnetometerData.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li className="flex justify-between">
                      <span>Toplam Ölçüm:</span>
                      <strong>{magnetometerData.length}</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Maksimum:</span>
                      <strong>{stats.max.toFixed(2)} µT</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Minimum:</span>
                      <strong>{stats.min.toFixed(2)} µT</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Ortalama:</span>
                      <strong>{stats.avg.toFixed(2)} µT</strong>
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Veri yok</p>
                )}
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">Sensör Özellikleri</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Dünyanın Manyetik Alanı: 25-65 µT</li>
                  <li>• Tipi: DeviceMotion/WebSensor</li>
                  <li>• Çözünürlük: 0.01 µT</li>
                  <li>• Otomatik Kalibrasyon: Etkin</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
