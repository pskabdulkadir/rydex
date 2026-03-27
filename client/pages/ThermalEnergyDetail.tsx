import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Flame, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ThermalEnergyDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Termal Enerji</h1>
            <p className="text-sm text-gray-600">3D ısı dağılımı ve enerji rezervleri</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-red-600 to-orange-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Termal Enerji Analizi</h2>
            </div>
            <p className="text-red-100">3D ısı dağılımı ve jeotermal kaynak analizi</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Termal Görüntüleme:</strong> Kızılötesi ölçümleri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>3D Harita:</strong> Derinlik bazlı ısı dağılımı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Jeotermal İndeks:</strong> Enerji potansiyeli hesaplama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span><strong>Akışkan Modeli:</strong> Sıcak su/buhar hareketi</span>
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
                      <span className="text-gray-700">Max Yüzey Sıcaklığı</span>
                      <span className="font-bold text-gray-900">78.5°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Jeotermal Potansiyel</span>
                      <span className="font-bold text-gray-900">8.7 MW</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Derinlik Aralığı</span>
                      <span className="font-bold text-gray-900">0-1500m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Flame className="w-6 h-6 text-red-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Thermal Image Processing</h4>
              <p className="text-sm">Kızılötesi kamera verilerinin işlenmesi.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Heat Flow Modeling</h4>
              <p className="text-sm">Fourier ısı denklemleri ile sıcaklık simulasyonu.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3D Kriging</h4>
              <p className="text-sm">Üç boyutlu ısı dağılımı interpolasyonu.</p>
            </div>
            <div className="border-l-4 border-rose-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Geothermal Gradient</h4>
              <p className="text-sm">Derinliğe göre sıcaklık artış hızı.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-red-50 to-orange-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-red-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">78.5°</p>
              <p className="text-sm text-gray-600 mt-1">Max Sıcaklık</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">8.7 MW</p>
              <p className="text-sm text-gray-600 mt-1">Enerji Potansiyeli</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">1500m</p>
              <p className="text-sm text-gray-600 mt-1">Max Derinlik</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-rose-200 text-center">
              <p className="text-3xl font-bold text-rose-600">97%</p>
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
