import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Cloud, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ClimateDataDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İklim Verileri</h1>
            <p className="text-sm text-gray-600">Sıcaklık, nem ve hava basıncı analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-gray-600 to-slate-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-8 h-8" />
              <h2 className="text-2xl font-bold">İklimsel Koşul Analizi</h2>
            </div>
            <p className="text-gray-100">Meteorolojik veriler ve hava durumu prediksiyon</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-gray-600 font-bold">•</span>
                      <span><strong>Sıcaklık Ölçümü:</strong> Hava sıcaklığı takibi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gray-600 font-bold">•</span>
                      <span><strong>Nem Analizi:</strong> Bağıl nem yüzdesi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gray-600 font-bold">•</span>
                      <span><strong>Basınç Ölçümü:</strong> Atmosferik basınç</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gray-600 font-bold">•</span>
                      <span><strong>İndeks Hesaplama:</strong> ısı indeksi ve soğuk uyarısı</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Sıcaklık</span>
                      <span className="font-bold text-gray-900">22.5°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Bağıl Nem</span>
                      <span className="font-bold text-gray-900">65%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Hava Basıncı</span>
                      <span className="font-bold text-gray-900">1013.25 mb</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-gray-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-gray-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Thermodynamic Modeling</h4>
              <p className="text-sm">Hava kütlesi hareketi ve sıcaklık tahminleri.</p>
            </div>
            <div className="border-l-4 border-slate-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Humidity Calculation</h4>
              <p className="text-sm">Psikrometrik hesaplamalar ve çiğ noktası.</p>
            </div>
            <div className="border-l-4 border-zinc-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Pressure Interpolation</h4>
              <p className="text-sm">Barometrik formüllerle basınç tahminleri.</p>
            </div>
            <div className="border-l-4 border-stone-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Weather Pattern Analysis</h4>
              <p className="text-sm">Cephe ve depresyon analizi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-gray-50 to-slate-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-3xl font-bold text-gray-600">22.5°</p>
              <p className="text-sm text-gray-600 mt-1">Sıcaklık</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-3xl font-bold text-gray-600">65%</p>
              <p className="text-sm text-gray-600 mt-1">Bağıl Nem</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-3xl font-bold text-gray-600">1013</p>
              <p className="text-sm text-gray-600 mt-1">Basınç (mb)</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-3xl font-bold text-gray-600">99%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-lg h-12"
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
