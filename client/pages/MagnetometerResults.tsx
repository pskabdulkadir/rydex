import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  MapPin,
  Clock,
  TrendingUp,
  Gem,
  Zap,
  AlertCircle,
  Download,
  Share2,
  Zap as Sparkles,
  Shield,
  Layers,
  Target,
} from 'lucide-react';
import { ComprehensiveScanResult } from '@shared/api';

export default function MagnetometerResults() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<ComprehensiveScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = sessionStorage.getItem('lastComprehensiveScanResult');
    if (result) {
      try {
        setScanResult(JSON.parse(result));
      } catch (error) {
        console.error('Sonuç okunamadı:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tarama Sonucu Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Lütfen taramayı baştan başlayın</p>
          <Button onClick={() => navigate('/app')} className="bg-blue-600 hover:bg-blue-700">
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  const treasures = scanResult.features.treasureCatalog?.treasures || [];
  const minerals = scanResult.features.valuableMineral?.minerals || [];
  const mapDetections = scanResult.features.mapDetections;
  const magnetometer = scanResult.features.magnetometer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => navigate('/app')}
              className="hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tarama Sonuçları</h1>
              <p className="text-sm text-gray-600">{scanResult.title}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              İndir
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Paylaş
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Tarama Özeti */}
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tarama Süresi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(scanResult.duration / 1000).toFixed(0)}s
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tespit Sayısı */}
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Tespit Edilen</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mapDetections?.totalDetections || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bulunmuş Hazine */}
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Gem className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Hazine</p>
                <p className="text-2xl font-bold text-gray-900">
                  {treasures.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Maden Tespiti */}
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Değerli Maden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {minerals.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Harita Tespitleri */}
        {mapDetections && mapDetections.totalDetections > 0 && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Harita Tespitleri
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Toplam Tespit</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {mapDetections.totalDetections} tespit bulundu
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-orange-600">
                      {mapDetections.totalDetections}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {mapDetections.clusterCount} bölgede kümelenmiş
                    </p>
                  </div>
                </div>

                {mapDetections.hotspots && mapDetections.hotspots.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Sıcak Noktalar</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {mapDetections.hotspots.slice(0, 5).map((spot: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                          <div>
                            <p className="font-medium text-gray-900">{spot.type}</p>
                            <p className="text-xs text-gray-600">
                              {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                              <p className="text-white font-bold text-sm">
                                {Math.round(spot.intensity)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mapDetections.sourcesUsed && mapDetections.sourcesUsed.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Kullanılan Kaynaklar:</p>
                    <p className="text-xs text-blue-800">
                      {mapDetections.sourcesUsed.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hazine Kataloğu */}
        {treasures.length > 0 && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-amber-600" />
                Bulunmuş Hazineler ({treasures.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treasures.map((treasure: any) => (
                  <div key={treasure.id} className="p-4 border border-amber-200 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{treasure.name}</h4>
                        <p className="text-xs text-gray-600">{treasure.type}</p>
                      </div>
                      <span className="px-2 py-1 bg-amber-200 text-amber-900 rounded text-xs font-semibold">
                        {treasure.confidence}% Güven
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Derinlik</p>
                        <p className="font-semibold text-gray-900">{treasure.depth.toFixed(1)}m</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Tahmin Değeri</p>
                        <p className="font-semibold text-green-600">
                          ${treasure.estimatedValue.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Malzeme</p>
                        <p className="font-semibold text-gray-900">{treasure.material}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Bulunma İhtimali</p>
                        <p className="font-semibold text-blue-600">{treasure.discoveryProbability}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Değerli Madenler */}
        {minerals.length > 0 && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Değerli Madenler ({minerals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-3">
                {minerals.map((mineral: any) => (
                  <div key={mineral.id} className="p-4 border border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{mineral.name}</h4>
                      <span className="text-sm font-semibold text-purple-600">
                        {mineral.rarity}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600">Saflık</p>
                        <p className="font-bold text-gray-900">{mineral.purity}%</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600">Yoğunluk</p>
                        <p className="font-bold text-gray-900">{mineral.concentration}%</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600">Derinlik</p>
                        <p className="font-bold text-gray-900">{mineral.depth.toFixed(1)}m</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-purple-200 flex justify-between">
                      <span className="text-xs text-gray-600">Toplam Değer</span>
                      <span className="font-bold text-green-600">
                        ${mineral.totalValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Manyetik Alan Verileri */}
        {magnetometer && (
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Manyetik Alan Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Temel Ortalama</p>
                  <p className="text-xl font-bold text-blue-600">
                    {magnetometer.baselineAverage}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">nT</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 mb-1">Maks. Sapma</p>
                  <p className="text-xl font-bold text-orange-600">
                    {magnetometer.maxDeviation.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">nT</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Anomali Güveni</p>
                  <p className="text-xl font-bold text-green-600">
                    {magnetometer.anomalyConfidence}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{magnetometer.anomalyDetected ? 'Tespit Edildi' : 'Tespit Yok'}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600 mb-1">Kalibrasyon</p>
                  <p className="text-xl font-bold text-purple-600">
                    {magnetometer.calibrationStatus === 'good' ? '✓ İyi' : magnetometer.calibrationStatus}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Durum</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Konum Bilgisi */}
        <Card className="mb-8 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Tarama Konumu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Adres</p>
                <p className="font-semibold text-gray-900">{scanResult.location.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Koordinatlar</p>
                <p className="font-mono text-gray-900">
                  {scanResult.location.latitude.toFixed(6)}, {scanResult.location.longitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tarama Tarihi</p>
                <p className="font-semibold text-gray-900">
                  {new Date(scanResult.timestamp).toLocaleString('tr-TR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Tarama Süresi</p>
                <p className="font-semibold text-gray-900">{(scanResult.duration / 1000).toFixed(0)} saniye</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Önerilen İşlem */}
        <Card className="mb-8 overflow-hidden border-l-4 border-l-blue-600">
          <CardHeader className="bg-blue-50 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Sistem Önerisi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-900 mb-4">{scanResult.recommendedAction}</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/app')} className="bg-blue-600 hover:bg-blue-700">
                Yeni Tarama Yap
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Raporu İndir
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
