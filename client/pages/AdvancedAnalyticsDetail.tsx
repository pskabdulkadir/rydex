import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdvancedAnalyticsDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 to-pink-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gelişmiş Analitik</h1>
            <p className="text-sm text-gray-600">Manyetik alan haritası ve spektral analiz</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-fuchsia-600 to-pink-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Gelişmiş Veri Analizi</h2>
            </div>
            <p className="text-fuchsia-100">Fourier, dalgacık ve spektral analiz teknikleri</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-fuchsia-600 font-bold">•</span>
                      <span><strong>Spektral Analiz:</strong> Frekans bileşenleri ayrıştırma</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-fuchsia-600 font-bold">•</span>
                      <span><strong>Wavelet Dönüşüm:</strong> Zaman-frekans analizi</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-fuchsia-600 font-bold">•</span>
                      <span><strong>Anomali Çıkarma:</strong> İstatistiksel aykırı değer tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-fuchsia-600 font-bold">•</span>
                      <span><strong>Desen Tanıma:</strong> Makine öğrenmesi ile sınıflandırma</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-fuchsia-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Analiz Veri Noktası</span>
                      <span className="font-bold text-gray-900">10,000+</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Frekans Bantları</span>
                      <span className="font-bold text-gray-900">256</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">İşlem Süresi</span>
                      <span className="font-bold text-gray-900">1.5s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-fuchsia-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-fuchsia-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Fast Fourier Transform</h4>
              <p className="text-sm">Hızlı frekans ayrıştırma algoritması.</p>
            </div>
            <div className="border-l-4 border-pink-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Continuous Wavelet</h4>
              <p className="text-sm">Zaman-frekans lokalizasyonu.</p>
            </div>
            <div className="border-l-4 border-rose-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Principal Component Analysis</h4>
              <p className="text-sm">Boyut indirgeme ve veri sıkıştırma.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">K-Means Kümeleme</h4>
              <p className="text-sm">Veri gruplandırma ve sınıflandırma.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-fuchsia-50 to-pink-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-fuchsia-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-fuchsia-200 text-center">
              <p className="text-3xl font-bold text-fuchsia-600">10K+</p>
              <p className="text-sm text-gray-600 mt-1">Veri Noktası</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-pink-200 text-center">
              <p className="text-3xl font-bold text-pink-600">256</p>
              <p className="text-sm text-gray-600 mt-1">Frekans Bandı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-rose-200 text-center">
              <p className="text-3xl font-bold text-rose-600">99%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-red-200 text-center">
              <p className="text-3xl font-bold text-red-600">1.5s</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Süresi</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-lg h-12"
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
