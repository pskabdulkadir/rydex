import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Signal, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SignalAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-blue-100">
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sinyal Analizi</h1>
            <p className="text-sm text-gray-600">WiFi/GSM/LTE sinyal gücü analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-violet-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Signal className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Haberleşme Sinyal Analizi</h2>
            </div>
            <p className="text-violet-100">Kablosuz sinyal gücü ve kalitesi ölçümleri</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-violet-600 font-bold">•</span>
                      <span><strong>WiFi Taraması:</strong> Kablosuz ağ tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-600 font-bold">•</span>
                      <span><strong>GSM/LTE Ölçümü:</strong> Mobil sinyal gücü (dBm)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-600 font-bold">•</span>
                      <span><strong>Sinyal Kalitesi:</strong> SINR ve RSRQ metrikleri</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-violet-600 font-bold">•</span>
                      <span><strong>Harita Oluşturma:</strong> Sinyal gücü haritaları</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-violet-600" />
                    Örnek Veriler
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">WiFi Ağları</span>
                      <span className="font-bold text-gray-900">34</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Ort. LTE Gücü</span>
                      <span className="font-bold text-gray-900">-95 dBm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Sinyal Alanları</span>
                      <span className="font-bold text-gray-900">6</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Signal className="w-6 h-6 text-violet-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-violet-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Path Loss Model</h4>
              <p className="text-sm">Sinyal zayıflaması modellemesi ve tahmin.</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Fading Analysis</h4>
              <p className="text-sm">Sinyal yok oluş bölgelerinin tespiti.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Interference Detection</h4>
              <p className="text-sm">Elektromanyetik parazit ve çakışma analizi.</p>
            </div>
            <div className="border-l-4 border-cyan-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Quality Prediction</h4>
              <p className="text-sm">Bağlantı kalitesi tahmini algoritmaları.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-violet-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-violet-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-violet-200 text-center">
              <p className="text-3xl font-bold text-violet-600">34</p>
              <p className="text-sm text-gray-600 mt-1">WiFi Ağları</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">-95dBm</p>
              <p className="text-sm text-gray-600 mt-1">Ort. LTE Gücü</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-indigo-200 text-center">
              <p className="text-3xl font-bold text-indigo-600">6</p>
              <p className="text-sm text-gray-600 mt-1">Sinyal Alanları</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-cyan-200 text-center">
              <p className="text-3xl font-bold text-cyan-600">97%</p>
              <p className="text-sm text-gray-600 mt-1">Doğruluk</p>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white text-lg h-12"
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
