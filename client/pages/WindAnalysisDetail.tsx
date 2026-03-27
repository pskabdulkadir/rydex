import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Wind, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WindAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rüzgar Analizi</h1>
            <p className="text-sm text-gray-600">Rüzgar yönü, hızı ve enerji potansiyeli</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Wind className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Rüzgar Enerjisi ve Akışı Analizi</h2>
            </div>
            <p className="text-cyan-100">Anemometre ölçümleri ve rüzgar haritaları</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><strong>Rüzgar Hızı:</strong> Anlık ve ortalama hız ölçümü</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><strong>Rüzgar Yönü:</strong> Pusula yönü belirleme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><strong>Gust Tarama:</strong> Ani rüzgar patlamaları</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-600 font-bold">•</span>
                      <span><strong>Enerji Potansiyeli:</strong> Rüzgar enerjisi hesaplama</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-cyan-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ort. Rüzgar Hızı</span>
                      <span className="font-bold text-gray-900">8.5 m/s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Rüzgar Yönü</span>
                      <span className="font-bold text-gray-900">NW (315°)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Enerji Potansiyeli</span>
                      <span className="font-bold text-gray-900">420 W/m²</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Wind className="w-6 h-6 text-cyan-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Cup Anemometer Analysis</h4>
              <p className="text-sm">Kap anemometresinden hız hesaplama.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Wind Rose Diagram</h4>
              <p className="text-sm">Rüzgar yönü dağılım gösterimi.</p>
            </div>
            <div className="border-l-4 border-sky-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Power Law Extrapolation</h4>
              <p className="text-sm">Yüksekliğe göre rüzgar profili tahminleri.</p>
            </div>
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Weibull Distribution</h4>
              <p className="text-sm">Rüzgar hızı olasılık dağılımı.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-cyan-200 text-center">
              <p className="text-3xl font-bold text-cyan-600">8.5</p>
              <p className="text-sm text-gray-600 mt-1">Ort. Hız (m/s)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">NW</p>
              <p className="text-sm text-gray-600 mt-1">Rüzgar Yönü</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-sky-200 text-center">
              <p className="text-3xl font-bold text-sky-600">420</p>
              <p className="text-sm text-gray-600 mt-1">Enerji (W/m²)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">98%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12"
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
