import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Activity, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopographyDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Topografya</h1>
            <p className="text-sm text-gray-600">Yükseklik ve eğim analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Topografik Analiz</h2>
            </div>
            <p className="text-emerald-100">Yükseklik modelleri ve eğim hesaplamaları</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>DEM Oluşturma:</strong> Dijital yükseklik modeli</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Eğim Analizi:</strong> Arazi eğim hesaplama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Teşviye Haritası:</strong> Kontur çizgileri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span><strong>Görünürlük Analizi:</strong> Bakış açısı haritaları</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Yükseklik Aralığı</span>
                      <span className="font-bold text-gray-900">450-820m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Max Eğim</span>
                      <span className="font-bold text-gray-900">35°</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">DEM Çözünürlüğü</span>
                      <span className="font-bold text-gray-900">5m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kriging İnterpolasyonu</h4>
              <p className="text-sm">İstatistiksel tabanlı yükseklik tahmin edilmesi.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Sobel Operatörü</h4>
              <p className="text-sm">Eğim hesaplama için kenar tespiti.</p>
            </div>
            <div className="border-l-4 border-lime-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Flow Accumulation</h4>
              <p className="text-sm">Su akışı analizi ve dren ağları.</p>
            </div>
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Aspect Calculation</h4>
              <p className="text-sm">Yüzey yönlendirmesi hesaplama.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-emerald-50 to-green-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
              <p className="text-3xl font-bold text-emerald-600">450m</p>
              <p className="text-sm text-gray-600 mt-1">Min Yükseklik</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">820m</p>
              <p className="text-sm text-gray-600 mt-1">Max Yükseklik</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-lime-200 text-center">
              <p className="text-3xl font-bold text-lime-600">35°</p>
              <p className="text-sm text-gray-600 mt-1">Max Eğim</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">5m</p>
              <p className="text-sm text-gray-600 mt-1">DEM Çözünürlüğü</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-lg">
            Harita İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
