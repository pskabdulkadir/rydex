import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Activity, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScanHistoryDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tarama Geçmişi</h1>
            <p className="text-sm text-gray-600">Ölçüm geçmişi ve istatistikler</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-purple-600 to-pink-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Tarama Geçmişi ve İstatistikler</h2>
            </div>
            <p className="text-purple-100">Tüm tarama verilerinin kayıt ve karşılaştırma analizi</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Tarama Kayıtları:</strong> Tarihsel veriler veritabanında depolama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Karşılaştırma:</strong> Farklı zamanlardaki veriler arasında analiz</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Trendler:</strong> Zaman içindeki değişimleri takip etme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>İstatistikler:</strong> Ortalama, standart sapma ve yüzdelikler</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Toplam Tarama</span>
                      <span className="font-bold text-gray-900">324</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Bu Ay</span>
                      <span className="font-bold text-gray-900">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ort. Tarama Süresi</span>
                      <span className="font-bold text-gray-900">15.3 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Veritabanı Indexleme</h4>
              <p className="text-sm">Hızlı veri erişimi için optimize edilmiş veritabanı yapıları.</p>
            </div>
            <div className="border-l-4 border-pink-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Zaman Serisi Depolama</h4>
              <p className="text-sm">Kronolojik olarak organize edilmiş veri yapıları.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kompresyon Algoritmaları</h4>
              <p className="text-sm">Büyük veri setlerini verimli bir şekilde depolama.</p>
            </div>
            <div className="border-l-4 border-violet-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Veri Visualizasyonu</h4>
              <p className="text-sm">Grafikler ve çizelgeler ile zaman içindeki değişimleri gösterme.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">324</p>
              <p className="text-sm text-gray-600 mt-1">Toplam Taramalar</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-3xl font-bold text-pink-600">42</p>
              <p className="text-sm text-gray-600 mt-1">Bu Ay</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="text-3xl font-bold text-indigo-600">15.3m</p>
              <p className="text-sm text-gray-600 mt-1">Ort. Süre</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-violet-200 text-center">
              <p className="text-3xl font-bold text-violet-600">99%</p>
              <p className="text-sm text-gray-600 mt-1">Kullanılabilirlik</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-lg h-12"
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
