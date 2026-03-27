import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Waves, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OceanAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Okyanus Analizi</h1>
            <p className="text-sm text-gray-600">Su taraması, dalga analizi ve tuz konsantrasyonu</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Waves className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Su ve Okyanus Analizi</h2>
            </div>
            <p className="text-blue-100">Hidrodinamik ve su kimyası ölçümleri</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Dalga Analizi:</strong> Dalga yüksekliği ve periyodları</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Tuz Konsantrasyonu:</strong> Salinite ölçümü</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Su Sıcaklığı:</strong> Termal haritalar</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Akıntı Analizi:</strong> Su hareketleri ve akışlar</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ort. Dalga Yüksekliği</span>
                      <span className="font-bold text-gray-900">1.8m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Salinite</span>
                      <span className="font-bold text-gray-900">35.2 PSU</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Su Sıcaklığı</span>
                      <span className="font-bold text-gray-900">18.5°C</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Waves className="w-6 h-6 text-blue-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Spectral Wave Analysis</h4>
              <p className="text-sm">Fourier analiz ile dalga spektrumu çıkarma.</p>
            </div>
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Conductivity Measurement</h4>
              <p className="text-sm">Salinite ve iyon konsantrasyonu ölçümü.</p>
            </div>
            <div className="border-l-4 border-sky-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Thermal Imaging</h4>
              <p className="text-sm">Kızılötesi ölçümü ile su sıcaklığı haritası.</p>
            </div>
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Current Modeling</h4>
              <p className="text-sm">Sürekli akıntı modelleme algoritmaları.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">1.8m</p>
              <p className="text-sm text-gray-600 mt-1">Dalga Yüksekliği</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200 text-center">
              <p className="text-3xl font-bold text-cyan-600">35.2</p>
              <p className="text-sm text-gray-600 mt-1">Salinite (PSU)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-sky-200 text-center">
              <p className="text-3xl font-bold text-sky-600">18.5°</p>
              <p className="text-sm text-gray-600 mt-1">Su Sıcaklığı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">96%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg h-12"
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
