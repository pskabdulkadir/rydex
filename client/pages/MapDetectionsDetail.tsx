import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Map, TrendingUp, Grid3X3, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MapDetectionsDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Harita Tespitleri</h1>
            <p className="text-sm text-gray-600">Hotspot haritası ve kümeleme analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Map className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Harita ve Konumsal Analiz</h2>
            </div>
            <p className="text-green-100">Coğrafi veriler üzerinde kümeleme ve hotspot analizi</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Hotspot Analizi:</strong> Yüksek aktivite bölgelerini belirleme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Kümeleme:</strong> Yakın konumları gruplandırma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Yoğunluk Haritası:</strong> Konumsal dağılım görselleştirme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Coğrafi Tanımla:</strong> GPS ve uydu bilgileri entegrasyonu</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tespit Sayısı</span>
                      <span className="font-bold text-gray-900">847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Küme Sayısı</span>
                      <span className="font-bold text-gray-900">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Yoğunluk</span>
                      <span className="font-bold text-gray-900">70.6/km²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-green-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">K-Means Kümeleme</h4>
              <p className="text-sm">Benzer konumları gruplandırarak ana aktivite merkezlerini belirler.</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kernel Density Estimation</h4>
              <p className="text-sm">Nokta yoğunluğunu sürekli bir harita olarak gösterir.</p>
            </div>
            <div className="border-l-4 border-lime-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">DBSCAN Algoritması</h4>
              <p className="text-sm">Aykırı değerleri işlemek ve doğal kümeleri bulmak için kullanılır.</p>
            </div>
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Haversine Mesafesi</h4>
              <p className="text-sm">GPS koordinatları arasındaki gerçek mesafeyi hesaplar.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">847</p>
              <p className="text-sm text-gray-600 mt-1">Toplam Tespitler</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600 mt-1">Küme Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">98%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">2.3s</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Süresi</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg h-12"
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
