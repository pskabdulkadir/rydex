import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Zap, Volume2, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import RadarScanner from '@/components/RadarScanner';

export default function RadarScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [activityScore, setActivityScore] = useState(45);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastDetection, setLastDetection] = useState<number | null>(null);

  const handleThresholdReached = () => {
    setDetectionCount((prev) => prev + 1);
    setLastDetection(Date.now());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">360° Radar Tarayıcı</h1>
          <div className="w-24"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Radar Display */}
        <div className="flex-1 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden min-h-[600px]">
          <RadarScanner
            activityScore={activityScore}
            isActive={isScanning}
            onThresholdReached={handleThresholdReached}
          />
        </div>

        {/* Control Panel */}
        <div className="w-80 space-y-4 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* Status Card */}
          <Card className="bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-100">Tarama Durumu</h3>
              {isScanning && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300">Aktif</span>
                </div>
              )}
            </div>
            {!isScanning ? (
              <Button
                onClick={() => setIsScanning(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <Zap className="w-4 h-4 mr-2" />
                Radarı Başlat
              </Button>
            ) : (
              <Button
                onClick={() => setIsScanning(false)}
                variant="destructive"
                className="w-full"
              >
                Radarı Durdur
              </Button>
            )}
          </Card>

          {/* Score Control */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Aktivite Skoru
                  </label>
                  <Badge
                    variant="outline"
                    className={`${
                      activityScore > 75
                        ? 'bg-red-500/20 border-red-500 text-red-300'
                        : activityScore > 50
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-blue-500/20 border-blue-500 text-blue-300'
                    }`}
                  >
                    {activityScore}
                  </Badge>
                </div>
                <Slider
                  value={[activityScore]}
                  onValueChange={(value) => setActivityScore(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                  disabled={!isScanning}
                />
                <p className="text-xs text-slate-400 mt-2">
                  75+ → Radar kilitlenir, ses ve titreşim tetiklenir
                </p>
              </div>
            </div>
          </Card>

          {/* Detection Stats */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-4">Tespit İstatistikleri</h3>
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-400 mb-1">Toplam Tespitler</div>
                <div className="text-3xl font-bold text-white">{detectionCount}</div>
              </div>
              {lastDetection && (
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className="text-sm text-slate-400 mb-1">Son Tespit</div>
                  <div className="text-sm text-slate-200">
                    {new Date(lastDetection).toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Features */}
          <Card className="bg-gradient-to-br from-amber-900 to-amber-800 border-amber-700 p-4">
            <h3 className="font-semibold text-amber-100 mb-3">Radar Özellikleri</h3>
            <ul className="text-sm text-amber-100 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-lg">◆</span>
                <span>360° Dönen Radar Işını</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">◈</span>
                <span>Yoğunluk Halkaları</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">◉</span>
                <span>Merkezde Titreşim Efekti</span>
              </li>
              <li className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Skora Göre Ses Frekansı</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>75+ Skorta Radar Kilitlenir</span>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>Cihaz Titreşimi Tetiklenir</span>
              </li>
            </ul>
          </Card>

          {/* Score Classification */}
          <Card className="bg-slate-800 border-slate-700 p-4">
            <h3 className="font-semibold text-white mb-3">Skor Sınıflandırması</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-blue-500/20">
                <span className="text-blue-300">0–30: Düşük</span>
                <div className="w-12 h-2 bg-blue-500 rounded" />
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-yellow-500/20">
                <span className="text-yellow-300">31–60: Orta</span>
                <div className="w-12 h-2 bg-yellow-500 rounded" />
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-orange-500/20">
                <span className="text-orange-300">61–80: Yüksek</span>
                <div className="w-12 h-2 bg-orange-500 rounded" />
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-red-500/20">
                <span className="text-red-300">81–100: Yoğun</span>
                <div className="w-12 h-2 bg-red-500 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
