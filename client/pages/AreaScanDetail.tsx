import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Grid3X3, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AreaScanDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alan Tarama</h1>
            <p className="text-sm text-gray-600">Grid tabanlı tarama ve heatmap</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-lime-600 to-green-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Grid3X3 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Alan Tarama ve Grid Analizi</h2>
            </div>
            <p className="text-lime-100">Düzenli grid üzerinde alansal veri toplama ve heatmap oluşturma</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span><strong>Grid Düzeni:</strong> Düzenli kare veya heksagonal grid yapısı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span><strong>Heatmap:</strong> Renk kodlaması ile yoğunluk gösterimi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span><strong>İnterpolasyon:</strong> Ölçüm noktaları arasında değer hesaplama</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span><strong>Veri Normalized:</strong> Farklı ölçeklerin standartlaştırılması</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-lime-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Grid Hücreleri</span>
                      <span className="font-bold text-gray-900">512</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tarama Alanı</span>
                      <span className="font-bold text-gray-900">50 km²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Yoğunluk</span>
                      <span className="font-bold text-gray-900">85.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-lime-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-lime-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Quad-Tree Yapısı</h4>
              <p className="text-sm">Hiyerarşik grid yapısı ile verimli veri taraması.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Bilinear İnterpolasyon</h4>
              <p className="text-sm">Grid hücreleri arasında düz değer geçişleri.</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kriging Algoritması</h4>
              <p className="text-sm">İstatistiksel tabanlı alansal interpolasyon.</p>
            </div>
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Voronoi Diyagramı</h4>
              <p className="text-sm">Hücre tabanlı bölgeleştirme ve alan tanımı.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-lime-50 to-green-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-lime-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-lime-200 text-center">
              <p className="text-3xl font-bold text-lime-600">512</p>
              <p className="text-sm text-gray-600 mt-1">Grid Hücreleri</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">50km²</p>
              <p className="text-sm text-gray-600 mt-1">Tarama Alanı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
              <p className="text-3xl font-bold text-emerald-600">85%</p>
              <p className="text-sm text-gray-600 mt-1">Ortalama Yoğunluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">0.8s</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Süresi</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white text-lg h-12"
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
