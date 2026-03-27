import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VisionAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Görüntü İşleme</h1>
            <p className="text-sm text-gray-600">Yapay zeka destekli görsel tanıma ve sınıflandırma</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Yapay Zeka Görüntü Analizi</h2>
            </div>
            <p className="text-indigo-100">Derin öğrenme ve makine öğrenmesi ile görsel tanıma</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>CNN Modeller:</strong> Derin sinir ağları</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Nesne Algılama:</strong> YOLO/R-CNN algoritmaları</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Sınıflandırma:</strong> ResNet/VGG modelleri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span><strong>Segmentasyon:</strong> Mask R-CNN</span>
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
                      <span className="text-gray-700">Modeller</span>
                      <span className="font-bold text-gray-900">15+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tanıdığı Sınıflar</span>
                      <span className="font-bold text-gray-900">1000+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Doğruluk</span>
                      <span className="font-bold text-gray-900">96.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6 text-indigo-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Aktarım Öğrenmesi</h4>
              <p className="text-sm">Eğitilmiş modelleri yeni veriye uyarlama.</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Veri Artırması</h4>
              <p className="text-sm">Eğitim verilerini çeşitli dönüşümlerle artırma.</p>
            </div>
            <div className="border-l-4 border-violet-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Dikkat Mekanizmaları</h4>
              <p className="text-sm">Önemli bölgelere ağırlık verme.</p>
            </div>
            <div className="border-l-4 border-pink-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Topluluk Yöntemleri</h4>
              <p className="text-sm">Birden fazla modeli birleştirme.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="text-3xl font-bold text-indigo-600">15+</p>
              <p className="text-sm text-gray-600 mt-1">Modeller</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">1000+</p>
              <p className="text-sm text-gray-600 mt-1">Sınıflar</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-violet-200 text-center">
              <p className="text-3xl font-bold text-violet-600">96.5%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-3xl font-bold text-pink-600">45ms</p>
              <p className="text-sm text-gray-600 mt-1">Tepki Süresi</p>
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
