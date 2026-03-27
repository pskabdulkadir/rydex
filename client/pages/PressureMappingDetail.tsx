import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Gauge, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PressureMappingDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Basınç Haritalama</h1>
            <p className="text-sm text-gray-600">Yeraltı basınç dağılımı ve boşluk tespiti</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-pink-600 to-rose-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gauge className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Basınç Dağılımı Analizi</h2>
            </div>
            <p className="text-pink-100">Yeraltı boşluk ve fay yapıları tespiti</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><strong>Basınç Ölçümü:</strong> Piezometrik ölçümleri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><strong>Boşluk Tespiti:</strong> Kaverna ve mağara bulma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><strong>Fay Analizi:</strong> Kırık çizgilerinin konumu</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-pink-600 font-bold">•</span>
                      <span><strong>Akifer Haritalama:</strong> Su tabakasının harita çıkarılması</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-pink-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Basınç</span>
                      <span className="font-bold text-gray-900">2450 kPa</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tespit Edilen Boşluk</span>
                      <span className="font-bold text-gray-900">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Fay Sayısı</span>
                      <span className="font-bold text-gray-900">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-pink-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-pink-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Pore Pressure Gradient</h4>
              <p className="text-sm">Basınç gradientinin hesaplanması ve tahmini.</p>
            </div>
            <div className="border-l-4 border-rose-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Seismic Inversion</h4>
              <p className="text-sm">Deprem dalgalarından basınç dağılımı çıkarma.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Velocity Model</h4>
              <p className="text-sm">Akustik hızdan jeoloji çıkarma.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cavern Detection</h4>
              <p className="text-sm">Anomali göstergeleri ile boşluk tespiti.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-pink-50 to-rose-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-pink-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-3xl font-bold text-pink-600">2450</p>
              <p className="text-sm text-gray-600 mt-1">Basınç (kPa)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-rose-200 text-center">
              <p className="text-3xl font-bold text-rose-600">8</p>
              <p className="text-sm text-gray-600 mt-1">Boşluk Tespiti</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">5</p>
              <p className="text-sm text-gray-600 mt-1">Fay Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">94%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-lg h-12"
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
