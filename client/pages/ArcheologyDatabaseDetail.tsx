import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ArcheologyDatabaseDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Arkeoloji Veritabanı</h1>
            <p className="text-sm text-gray-600">Tarihsel buluntu katalogları ve kültür varlıkları</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Arkeolojik Veritabanı</h2>
            </div>
            <p className="text-yellow-100">Tarihsel buluntular ve kültürel miras envanteri</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Buluntu Envanteri:</strong> Arkeolojik nesnelerin kataloglanması</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Dönem Sınıflandırması:</strong> Tarihsel periyod tanımı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Konum Haritalama:</strong> Buluntu yerlerinin GPS koordinatları</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span><strong>Tarihleme Analizi:</strong> Radiometrik ve bağlamsal tarihler</span>
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
                      <span className="text-gray-700">Kataloğa Alınan Bulgular</span>
                      <span className="font-bold text-gray-900">8,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Arkeolojik Siteler</span>
                      <span className="font-bold text-gray-900">127</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tarihsel Dönemler</span>
                      <span className="font-bold text-gray-900">15</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-yellow-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Radiocarbon Dating</h4>
              <p className="text-sm">Karbon-14 analizi ile organik maddelerin tarihlenmesi.</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Stratigraphy</h4>
              <p className="text-sm">Tabaka analizi ile bağlamsal tarihleme.</p>
            </div>
            <div className="border-l-4 border-amber-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Object Classification</h4>
              <p className="text-sm">Buluntuların tip ve malzemelere göre sınıflandırması.</p>
            </div>
            <div className="border-l-4 border-yellow-700 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Digital Archiving</h4>
              <p className="text-sm">3D tarama ve foto arşivlemesi.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
              <p className="text-3xl font-bold text-yellow-600">8,234</p>
              <p className="text-sm text-gray-600 mt-1">Kataloğa Alınan Bulgular</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">127</p>
              <p className="text-sm text-gray-600 mt-1">Arkeolojik Siteler</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">15</p>
              <p className="text-sm text-gray-600 mt-1">Tarihsel Dönemler</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-yellow-700 text-center">
              <p className="text-3xl font-bold text-yellow-700">99%</p>
              <p className="text-sm text-gray-600 mt-1">Veri Tamlığı</p>
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
            Veritabanını İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
