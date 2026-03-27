import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Radio, TrendingUp, Grid3X3, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ARAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AR Analizi</h1>
            <p className="text-sm text-gray-600">Artırılmış gerçeklik tarama ve marker tespiti</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Artırılmış Gerçeklik Analizi</h2>
            </div>
            <p className="text-indigo-100">3D görselleştirme ve marker tabanlı konum tespiti</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Marker Tespiti:</strong> QR kod ve görsel marker tanıması</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>3D Proyeksyon:</strong> Gerçek zamanlı nesne konumlandırma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Derinlik Tahmini:</strong> Nesnelerin mesafe ve boyut hesabı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Hareket Izleme:</strong> Dinamik objelerin takibi</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tespit Edilen Marker</span>
                      <span className="font-bold text-gray-900">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">3D Model Sayısı</span>
                      <span className="font-bold text-gray-900">28</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama FPS</span>
                      <span className="font-bold text-gray-900">60</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-indigo-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">ARCore/ARKit Entegrasyonu</h4>
              <p className="text-sm">Mobil AR platformları ile native entegrasyon.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Marker Tanıma</h4>
              <p className="text-sm">ArUco ve QR kod marker algılama algoritmaları.</p>
            </div>
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">SLAM Teknolojisi</h4>
              <p className="text-sm">Eşzamanlı konum belirleme ve harita oluşturma.</p>
            </div>
            <div className="border-l-4 border-sky-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3D Grafik Renderley</h4>
              <p className="text-sm">WebGL ve Three.js ile yüksek performanslı 3D gösterim.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="text-3xl font-bold text-indigo-600">156</p>
              <p className="text-sm text-gray-600 mt-1">Marker Tespiti</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">28</p>
              <p className="text-sm text-gray-600 mt-1">3D Modeller</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200 text-center">
              <p className="text-3xl font-bold text-cyan-600">60 FPS</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Hızı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-sky-200 text-center">
              <p className="text-3xl font-bold text-sky-600">96%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-lg h-12"
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
