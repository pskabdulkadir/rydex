import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, MapPin, Zap, Layers, TrendingUp, AlertTriangle, Gem } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TreasureDetectionDetail() {
  const navigate = useNavigate();
  const [selectedTreasure, setSelectedTreasure] = useState<string | null>(null);

  const treasures = [
    {
      id: 'gold',
      name: 'Altın',
      icon: '🏆',
      probability: 78,
      depth: '1.2-1.8m',
      size: 'Orta-Büyük',
      confidence: 94,
      description: 'Altın moneta ve takı parçaları',
    },
    {
      id: 'silver',
      name: 'Gümüş',
      icon: '⚪',
      probability: 65,
      depth: '0.8-1.5m',
      size: 'Küçük-Orta',
      confidence: 87,
      description: 'Gümüş sikkeleri ve çatal-kaşık',
    },
    {
      id: 'copper',
      name: 'Bakır',
      icon: '🪙',
      probability: 82,
      depth: '0.5-1.2m',
      size: 'Orta',
      confidence: 91,
      description: 'Bakır kapları ve dekoratif eşyalar',
    },
    {
      id: 'bronze',
      name: 'Bronz',
      icon: '🗿',
      probability: 72,
      depth: '1.5-2.5m',
      size: 'Orta-Büyük',
      confidence: 85,
      description: 'Bronz heykelcikler ve aletler',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hazine Tespiti</h1>
            <p className="text-sm text-gray-600">Kaynak sınıflandırması ve derinlik tahmini</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Ana Kart */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Gem className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Hazine Türü Sınıflandırması</h2>
            </div>
            <p className="text-yellow-100">Tespit edilen kaynakların türü ve özellikleri</p>
          </div>
          <div className="p-6 bg-white space-y-6">
            {/* Hazine Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treasures.map((treasure) => (
                <button
                  key={treasure.id}
                  onClick={() => setSelectedTreasure(selectedTreasure === treasure.id ? null : treasure.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTreasure === treasure.id
                      ? 'border-yellow-600 bg-yellow-50'
                      : 'border-gray-300 hover:border-yellow-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-3xl mr-2">{treasure.icon}</span>
                      <h4 className="font-bold text-gray-900 inline text-lg">{treasure.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-600">{treasure.probability}%</p>
                      <p className="text-xs text-gray-600">İhtimal</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{treasure.description}</p>
                  
                  {selectedTreasure === treasure.id && (
                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Derinlik:</span>
                        <span className="font-semibold text-gray-900">{treasure.depth}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Boyut:</span>
                        <span className="font-semibold text-gray-900">{treasure.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kesinlik:</span>
                        <span className="font-semibold text-gray-900">{treasure.confidence}%</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* En Olası Hazine */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-r from-yellow-50 to-amber-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            En Yüksek Olasılıklı Hazineniz
          </h3>
          <div className="bg-white p-6 rounded-lg border-2 border-yellow-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-4xl mb-2">🏆</p>
                <h4 className="text-2xl font-bold text-gray-900">Altın Buluntusu</h4>
                <p className="text-gray-600 mt-1">Antik döneme ait altın madeni paralar</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-yellow-600">78%</p>
                <p className="text-sm text-gray-600">Olasılık Skoru</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-yellow-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">Derinlik</p>
                <p className="font-bold text-gray-900">1.5m</p>
              </div>
              <div className="bg-amber-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">Tahmini Ağırlık</p>
                <p className="font-bold text-gray-900">2.3 kg</p>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600 mb-1">Tahmini Değer</p>
                <p className="font-bold text-gray-900">₺85K+</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
              <p className="text-sm text-gray-700">
                <strong>Kazı Önerisi:</strong> Bu bölgenin 1.2-1.8 metre derinliğinde kazı yapılması önerilmektedir. 
                Manyetometre ve radar taraması güçlü işaretler göstermektedir.
              </p>
            </div>
          </div>
        </Card>

        {/* Detaylı Analiz */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-yellow-600" />
            Derinlik Katmanları - Hazine Dağılımı
          </h3>
          <div className="space-y-4">
            {[
              {
                depth: '0-0.5m',
                treasures: ['Bakır kapları (40%)', 'Modern madeni paralar (30%)'],
                difficulty: 'Çok Kolay',
                timeNeeded: '20 dakika',
                icon: '⚙️',
              },
              {
                depth: '0.5-1.5m',
                treasures: ['Gümüş parçaları (65%)', 'Altın takısı (45%)'],
                difficulty: 'Kolay',
                timeNeeded: '45 dakika',
                icon: '⚪',
              },
              {
                depth: '1.5-2.5m',
                treasures: ['Altın madalya (78%)', 'Bronz heykelcikler (72%)'],
                difficulty: 'Orta',
                timeNeeded: '2-3 saat',
                icon: '🏆',
              },
              {
                depth: '2.5-3.5m',
                treasures: ['Büyük bronz kapları (60%)', 'Gömülü hazineler (55%)'],
                difficulty: 'Zor',
                timeNeeded: '4-6 saat',
                icon: '🗿',
              },
            ].map((layer, i) => (
              <div key={i} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border border-gray-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg mb-1">{layer.icon}</p>
                    <h4 className="font-bold text-gray-900">{layer.depth}</h4>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-700">{layer.difficulty}</p>
                    <p className="text-xs text-gray-600">{layer.timeNeeded}</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {layer.treasures.map((treasure, j) => (
                    <li key={j}>• {treasure}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Uyarılar */}
        <Card className="p-6 shadow-lg border-0 bg-orange-50 border-l-4 border-orange-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Önemli Uyarılar
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="text-orange-600 font-bold">⚠️</span>
              <span>Kazı yapılmadan önce yerel kaymakamlık ve belediyeden izin alınması yasal zorunluluktur.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-bold">⚠️</span>
              <span>Tarihî ve kültürel eserlerin çıkarılması yasak olup ağır cezai müeyyideler içerir.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-bold">⚠️</span>
              <span>Yer altı elektrik ve su hatlarını kontrol ettiren kamulaştırma işlemini başlatınız.</span>
            </li>
          </ul>
        </Card>

        {/* Butonlar */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Kazı Planı Oluştur
          </Button>
        </div>
      </main>
    </div>
  );
}
