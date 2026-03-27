import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Minimize2, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GravitationalFieldDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yerçekimi Alanı</h1>
            <p className="text-sm text-gray-600">Yerçekimi anomalileri ve yoğunluk farklılıkları</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Minimize2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Yerçekimi Alanı Analizi</h2>
            </div>
            <p className="text-slate-100">Gravimetrik ölçümler ve yoğunluk haritalandırması</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-slate-600 font-bold">•</span>
                      <span><strong>Gravimetri Ölçümü:</strong> Mutlak ve bağıl yerçekimi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-slate-600 font-bold">•</span>
                      <span><strong>Anomali Hesabı:</strong> Bouguer ve serbest hava anomalileri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-slate-600 font-bold">•</span>
                      <span><strong>Yoğunluk İnversion:</strong> Yerçekimi verilerindeninvers çözüm</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-slate-600 font-bold">•</span>
                      <span><strong>Mineral Tespiti:</strong> Yoğun cisimlerin bulunması</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-slate-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Yerçekimi Anomalisi</span>
                      <span className="font-bold text-gray-900">±45 mGal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Yoğunluk</span>
                      <span className="font-bold text-gray-900">2.65 g/cm³</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Çözünürlük</span>
                      <span className="font-bold text-gray-900">25m</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Minimize2 className="w-6 h-6 text-slate-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-slate-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Bouguer Correction</h4>
              <p className="text-sm">Yerçekimi verilerine bouguer düzeltmesi uygulaması.</p>
            </div>
            <div className="border-l-4 border-slate-700 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Terrain Correction</h4>
              <p className="text-sm">Topografyan neden olan etkilerin düzeltilmesi.</p>
            </div>
            <div className="border-l-4 border-gray-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3D Inversion</h4>
              <p className="text-sm">Yerçekimi verisinden 3D yoğunluk modeli çıkarma.</p>
            </div>
            <div className="border-l-4 border-gray-700 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Reduction to Pole</h4>
              <p className="text-sm">Manyetik ekvator anomalileri kutbu dönüştürme.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-slate-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
              <p className="text-3xl font-bold text-slate-600">±45</p>
              <p className="text-sm text-gray-600 mt-1">Anomali mGal</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
              <p className="text-3xl font-bold text-slate-600">2.65</p>
              <p className="text-sm text-gray-600 mt-1">Yoğunluk g/cm³</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
              <p className="text-3xl font-bold text-slate-600">25m</p>
              <p className="text-sm text-gray-600 mt-1">Çözünürlük</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
              <p className="text-3xl font-bold text-slate-600">95%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-lg h-12"
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
