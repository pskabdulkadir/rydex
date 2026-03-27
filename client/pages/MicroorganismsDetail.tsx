import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Microscope, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MicroorganismsDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mikroorganizmalar</h1>
            <p className="text-sm text-gray-600">Bakteri, mantar ve biyolojik aktivite tespiti</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-purple-600 to-violet-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Microscope className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Biyolojik Aktivite Analizi</h2>
            </div>
            <p className="text-purple-100">Bakteri ve mantar florasının tanımlanması</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Bakteri Tespiti:</strong> CFU sayım ve tanımlama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Mantar Analizi:</strong> Mantarların sınıflandırılması</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>DNA Dizileme:</strong> Genetik tanımlama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span><strong>Kirlenme Tespiti:</strong> Patolojik bakteri</span>
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
                      <span className="text-gray-700">Bakteri Türleri</span>
                      <span className="font-bold text-gray-900">42</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Mantar Türleri</span>
                      <span className="font-bold text-gray-900">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Biyomass</span>
                      <span className="font-bold text-gray-900">5.3 kg/m³</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-purple-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">PCR Amplification</h4>
              <p className="text-sm">DNA bölgelerinin seçmeli çoğaltılması.</p>
            </div>
            <div className="border-l-4 border-violet-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Gel Electrophoresis</h4>
              <p className="text-sm">Protein ve DNA ayrıştırması.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">MALDI-TOF MS</h4>
              <p className="text-sm">Hızlı bakteri tanımlaması ve sınıflandırması.</p>
            </div>
            <div className="border-l-4 border-pink-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Plate Counting</h4>
              <p className="text-sm">Koloni oluşturan birim sayımı.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-violet-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">42</p>
              <p className="text-sm text-gray-600 mt-1">Bakteri Türü</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-violet-200 text-center">
              <p className="text-3xl font-bold text-violet-600">18</p>
              <p className="text-sm text-gray-600 mt-1">Mantar Türü</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="text-3xl font-bold text-indigo-600">5.3</p>
              <p className="text-sm text-gray-600 mt-1">Biyomass kg/m³</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-3xl font-bold text-pink-600">95%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
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
