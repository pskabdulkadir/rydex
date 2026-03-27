import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RadioactivityDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-lime-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Radyoaktivite</h1>
            <p className="text-sm text-gray-600">Radyoaktif elemanlara ait açık seçiklik</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-yellow-600 to-lime-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Radyoaktivite Analizi</h2>
            </div>
            <p className="text-yellow-100">Nükleer radyasyon ölçümü ve kaynak tespiti</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Gamma Taraması:</strong> Gama radyasyon ölçümü</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Element Tanımı:</strong> Radyoaktif izotop belirleme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Doza Ölçümü:</strong> Radyasyon maruziyeti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Harita Oluşturma:</strong> Radyasyon alanı haritalandırılması</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Dose Rate</span>
                      <span className="font-bold text-gray-900">0.15 µSv/h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Bulunan İzotoplar</span>
                      <span className="font-bold text-gray-900">7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Radyoaktivite Seviyeleri</span>
                      <span className="font-bold text-gray-900">Düşük</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Scintillation Detector</h4>
              <p className="text-sm">Gama ışını tespit sensörü.</p>
            </div>
            <div className="border-l-4 border-lime-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Spectral Analysis</h4>
              <p className="text-sm">Enerji spektrumundan izotop tanımlaması.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Dose Equivalent</h4>
              <p className="text-sm">Biyolojik etkiye göre doza çevirme.</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Background Subtraction</h4>
              <p className="text-sm">Doğal arka plan radyasyonun çıkarılması.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-lime-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">0.15</p>
              <p className="text-sm text-gray-600 mt-1">Dose Rate µSv/h</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-lime-200 text-center">
              <p className="text-3xl font-bold text-lime-600">7</p>
              <p className="text-sm text-gray-600 mt-1">İzotop Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">Düşük</p>
              <p className="text-sm text-gray-600 mt-1">Seviye</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
              <p className="text-3xl font-bold text-emerald-600">98%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-lg h-12"
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
