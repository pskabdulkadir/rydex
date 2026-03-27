import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Vibrate, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SeismicActivityDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sismik Aktivite</h1>
            <p className="text-sm text-gray-600">Deprem eğilimi ve kırık analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Vibrate className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Sismik Aktivite Analizi</h2>
            </div>
            <p className="text-red-100">Deprem kaydı ve fay yapılarının tespiti</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Deprem Kaydı:</strong> P ve S dalgalarının tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Büyüklük Tahmini:</strong> Richter ve moment magnitude</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Fay Analizi:</strong> Kırık geometrisi ve hareketi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Risk Değerlendirmesi:</strong> Sismik tehlike haritası</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-red-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Magnitüd</span>
                      <span className="font-bold text-gray-900">4.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Yıllık Frekans</span>
                      <span className="font-bold text-gray-900">34</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Fay Sayısı</span>
                      <span className="font-bold text-gray-900">8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Vibrate className="w-6 h-6 text-red-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Phase Picking</h4>
              <p className="text-sm">Otomatik P ve S dalgası tespiti.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Hypocenter Location</h4>
              <p className="text-sm">Deprem merkezinin konumunun belirlenmesi.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Focal Mechanism</h4>
              <p className="text-sm">Deprem kesme mekanizmasının çöpmesi.</p>
            </div>
            <div className="border-l-4 border-rose-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Seismic Hazard</h4>
              <p className="text-sm">İstatistiksel deprem risk analizi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">4.2</p>
              <p className="text-sm text-gray-600 mt-1">Ort. Magnitüd</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">34</p>
              <p className="text-sm text-gray-600 mt-1">Yıllık Frekans</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">8</p>
              <p className="text-sm text-gray-600 mt-1">Fay Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-rose-200 text-center">
              <p className="text-3xl font-bold text-rose-600">96%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg h-12"
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
