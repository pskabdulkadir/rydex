import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Network, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NetworkAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ağ Analizi</h1>
            <p className="text-sm text-gray-600">Yapı bağlantıları ve iletişim ağları</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Yapı Ağ Analizi</h2>
            </div>
            <p className="text-green-100">Arkeolojik yerleşim ağları ve yapı bağlantıları</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Node Detection:</strong> Yapı düğümlerinin tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Edge Analysis:</strong> Yapılar arasındaki bağlantılar</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Centrality Measures:</strong> Önemli yapıların tanımlanması</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span><strong>Community Detection:</strong> Yapı kümeleri bulma</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Node Sayısı</span>
                      <span className="font-bold text-gray-900">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Bağlantı Sayısı</span>
                      <span className="font-bold text-gray-900">342</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ağ Yoğunluğu</span>
                      <span className="font-bold text-gray-900">0.28</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Network className="w-6 h-6 text-green-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Graph Theory</h4>
              <p className="text-sm">Temel grafik teorisi analizi ve metrikler.</p>
            </div>
            <div className="border-l-4 border-emerald-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">PageRank Algorithm</h4>
              <p className="text-sm">Yapı önem derecelerinin hesaplanması.</p>
            </div>
            <div className="border-l-4 border-lime-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Community Detection</h4>
              <p className="text-sm">Louvain ve Label propagation algoritmaları.</p>
            </div>
            <div className="border-l-4 border-teal-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Network Visualization</h4>
              <p className="text-sm">Force-directed grafik çizimi ve gösterileri.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">156</p>
              <p className="text-sm text-gray-600 mt-1">Node Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
              <p className="text-3xl font-bold text-emerald-600">342</p>
              <p className="text-sm text-gray-600 mt-1">Bağlantı Sayısı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-lime-200 text-center">
              <p className="text-3xl font-bold text-lime-600">0.28</p>
              <p className="text-sm text-gray-600 mt-1">Ağ Yoğunluğu</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-3xl font-bold text-teal-600">97%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-lg">
            Ağ Modeli İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
