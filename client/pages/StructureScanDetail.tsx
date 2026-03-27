import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StructureScanDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yapı Tarayıcı</h1>
            <p className="text-sm text-gray-600">Yeraltı yapı tespiti ve analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Yapı ve Yeraltı Analizi</h2>
            </div>
            <p className="text-amber-100">Jeofizik veriler ile yeraltı yapılarının tespiti</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Boşluk Tespiti:</strong> Yeraltı mağara ve boş alanları bulma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Katman Analizi:</strong> Toprak katmanlarının sınırlarını belirleme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Geometri Çıkarma:</strong> Nesne boyutları ve şekilleri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span><strong>Derinlik Haritası:</strong> Yapıların konumlandırılması</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tespit Yapı Sayısı</span>
                      <span className="font-bold text-gray-900">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ortalama Derinlik</span>
                      <span className="font-bold text-gray-900">12.5 m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Doğruluk</span>
                      <span className="font-bold text-gray-900">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-amber-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Tomografi Analizi</h4>
              <p className="text-sm">3D kesit görüntülemesi tekniği ile derinlik tespiti.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Wavelet Dönüşümü</h4>
              <p className="text-sm">Sinyal işlemede katman sınırlarının tespiti.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Horizon Picking</h4>
              <p className="text-sm">Jeolojik katmanların otomatik takibi.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Amplitude Variation</h4>
              <p className="text-sm">Derinliğe göre sinyal değişiminin analizi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">47</p>
              <p className="text-sm text-gray-600 mt-1">Yapı Tespitleri</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">12.5m</p>
              <p className="text-sm text-gray-600 mt-1">Ort. Derinlik</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">92%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">3.2s</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Süresi</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-lg h-12"
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
