import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Maximize2, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VolumetricMeasurementDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hacimsel Ölçüm</h1>
            <p className="text-sm text-gray-600">3D hacim hesaplama ve kavite tespiti</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Maximize2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">3D Hacim ve Kavite Analizi</h2>
            </div>
            <p className="text-teal-100">Üç boyutlu nesne ölçümleri ve hacimlendirme</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>3D Ölçümleme:</strong> Lidar ve stereo kameraradan veri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>Hacim Hesaplama:</strong> Cavalieri prensibi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>Kavite Tespiti:</strong> Boşluk ve deliğin bulunması</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span><strong>Yüzey Alan:</strong> 3D model yüzey alanı ölçümü</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ölçülen Hacim</span>
                      <span className="font-bold text-gray-900">185.3 m³</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Yüzey Alanı</span>
                      <span className="font-bold text-gray-900">456.2 m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tespit Kavitesi</span>
                      <span className="font-bold text-gray-900">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Maximize2 className="w-6 h-6 text-teal-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Point Cloud Processing</h4>
              <p className="text-sm">Lidar noktalarından 3D model oluşturma.</p>
            </div>
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Mesh Generation</h4>
              <p className="text-sm">Delaunay üçgenlemesi ile yüzey oluşturma.</p>
            </div>
            <div className="border-l-4 border-sky-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Voxel Grid</h4>
              <p className="text-sm">Hacim piksellerine bölünerek hacim hesaplama.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Marching Cubes</h4>
              <p className="text-sm">İsosurface extraction algoritması.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-teal-50 to-cyan-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">185m³</p>
              <p className="text-sm text-gray-600 mt-1">Hacim</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200 text-center">
              <p className="text-3xl font-bold text-cyan-600">456m²</p>
              <p className="text-sm text-gray-600 mt-1">Yüzey Alanı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-sky-200 text-center">
              <p className="text-3xl font-bold text-sky-600">3</p>
              <p className="text-sm text-gray-600 mt-1">Kavite</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">99%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-lg">
            Model İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
