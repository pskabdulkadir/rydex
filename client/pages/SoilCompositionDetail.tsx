import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Beaker, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SoilCompositionDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Toprak Bileşimi</h1>
            <p className="text-sm text-gray-600">Kimyasal analiz ve mineral yoğunluğu</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Beaker className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Toprak Kimyasal Analizi</h2>
            </div>
            <p className="text-amber-100">Mineral bileşimi ve besin elementleri ölçümü</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Mineral Taraması:</strong> Metal ve element tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>pH Analizi:</strong> Toprak asitliği/bazlılığı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Besin Elementleri:</strong> N, P, K, Ca, Mg ölçümü</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Ağır Metaller:</strong> Kirlenme tespiti</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">pH Değeri</span>
                      <span className="font-bold text-gray-900">6.8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Organik Madde</span>
                      <span className="font-bold text-gray-900">3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mineral Çeşitleri</span>
                      <span className="font-bold text-gray-900">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Beaker className="w-6 h-6 text-amber-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-amber-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">XRF Spectroscopy</h4>
              <p className="text-sm">X-ray floresans ile element analizi.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">ICP-AES</h4>
              <p className="text-sm">Endüktif kuplajlı plazma ile yapı tayini.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">pH Titration</h4>
              <p className="text-sm">Asit-baz titrasyon ölçümleri.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Atomic Absorption</h4>
              <p className="text-sm">Ağır metal belirlenmesi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50 to-yellow-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">6.8</p>
              <p className="text-sm text-gray-600 mt-1">pH Değeri</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">3.2%</p>
              <p className="text-sm text-gray-600 mt-1">Organik Madde</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">12</p>
              <p className="text-sm text-gray-600 mt-1">Mineral Türü</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">96%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-lg h-12"
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
