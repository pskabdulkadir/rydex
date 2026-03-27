import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TimeSeriesAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zaman Serisi</h1>
            <p className="text-sm text-gray-600">Geçmiş tarama verilerinin karşılaştırma analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-orange-600 to-amber-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Zaman Serisi Analizi</h2>
            </div>
            <p className="text-orange-100">Temporal değişimlerin trendleri ve öngörüleri</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Trend Analizi:</strong> Uzun dönem değişimler</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Mevsimsellik:</strong> Periyodik desenleri tespit etme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Öngörü Modelleri:</strong> ARIMA ve exponential smoothing</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span><strong>Anomali Tespiti:</strong> Anormal veriler bulma</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Veri Noktası</span>
                      <span className="font-bold text-gray-900">2,400+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Zaman Aralığı</span>
                      <span className="font-bold text-gray-900">36 Ay</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tahmin Doğruluğu</span>
                      <span className="font-bold text-gray-900">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">ARIMA Modeling</h4>
              <p className="text-sm">Otoregresif bütünleşik hareketli ortalama.</p>
            </div>
            <div className="border-l-4 border-amber-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Exponential Smoothing</h4>
              <p className="text-sm">Ağırlıklı ortalama ile düzleştirme.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">STL Decomposition</h4>
              <p className="text-sm">Seri bileşenlerine ayırma: trend, sezonsal, kalıntı.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Change Point Detection</h4>
              <p className="text-sm">Kırılma noktalarının otomatik tespiti.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">2.4K+</p>
              <p className="text-sm text-gray-600 mt-1">Veri Noktası</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">36m</p>
              <p className="text-sm text-gray-600 mt-1">Zaman Aralığı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">92%</p>
              <p className="text-sm text-gray-600 mt-1">Tahmin Doğruluğu</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">3</p>
              <p className="text-sm text-gray-600 mt-1">Modeller</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-lg">
            Rapor İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
