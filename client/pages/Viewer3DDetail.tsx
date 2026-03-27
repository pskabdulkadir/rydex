import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Box, RotateCw, Layers, Maximize2, Palette, Eye, Zap, Gauge, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Viewer3DDetail() {
  const navigate = useNavigate();
  const [rotationX, setRotationX] = useState(15);
  const [rotationY, setRotationY] = useState(25);
  const [zoom, setZoom] = useState(100);
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  // Katman bilgileri
  const layerDetails: { [key: string]: any } = {
    all: {
      label: 'Tüm Katmanlar',
      color: 'bg-gray-400',
      description: 'Tüm katmanları birlikte görüntüle',
      visibility: 100,
      density: 'Karışık',
      composition: 'Toprak, kaya, su ve metal',
      transparency: 0,
      features: [
        'Tüm katmanlar aktif',
        'Tam çözünürlük görüntü',
        'Maksimum detay seviyesi',
        'İşleme yükü: Yüksek'
      ],
      stats: [
        { label: 'Visible Objects', value: '12,450' },
        { label: 'Render Time', value: '45ms' },
        { label: 'Memory Usage', value: '2.1GB' },
        { label: 'FPS', value: '60' }
      ]
    },
    surface: {
      label: 'Yüzey',
      color: 'bg-yellow-500',
      description: 'Toprağın yüzey katmanı ve bitki örtüsü',
      visibility: 95,
      density: '45%',
      composition: 'Toprak, bitki, organik madde',
      transparency: 10,
      features: [
        'En üst katman',
        'Güneş ışığından etkileniyor',
        'En kolay kazı seviyesi',
        'Sabit rakım seviyesi'
      ],
      stats: [
        { label: 'Thickness', value: '0-0.5m' },
        { label: 'Soil Type', value: 'Sandy Loam' },
        { label: 'Moisture Level', value: '35%' },
        { label: 'Temperature', value: '22°C' }
      ]
    },
    soil: {
      label: 'Toprak',
      color: 'bg-amber-600',
      description: 'Ana toprak tabakası',
      visibility: 85,
      density: '78%',
      composition: 'Kil, kum, kaya ve su',
      transparency: 20,
      features: [
        'Ana tarım tabakası',
        'En zengin mineraller',
        'Yönetilen su geçişi',
        'Kök sistemi seviyesi'
      ],
      stats: [
        { label: 'Depth Range', value: '0.5-2m' },
        { label: 'Soil Class', value: 'Class II' },
        { label: 'pH Value', value: '6.8' },
        { label: 'Nutrients', value: 'High' }
      ]
    },
    rocks: {
      label: 'Kayalar',
      color: 'bg-gray-600',
      description: 'Kaya ve taş formasyonları',
      visibility: 75,
      density: '92%',
      composition: '%40 Kireçtaşı, %30 Kumtaşı, %30 Şist',
      transparency: 35,
      features: [
        'Birincil kaya katmanı',
        'Jeolojik stabilite',
        'Maden rezervleri içerir',
        'Serbest su taşıyıcı'
      ],
      stats: [
        { label: 'Depth Range', value: '2-3.5m' },
        { label: 'Rock Type', value: 'Sedimentary' },
        { label: 'Hardness', value: 'Mohs 4-6' },
        { label: 'Porosity', value: '8-12%' }
      ]
    },
    metals: {
      label: 'Metaller',
      color: 'bg-blue-500',
      description: 'Metalik nesneler ve cevher yatakları',
      visibility: 65,
      density: '15%',
      composition: 'Altın, gümüş, bakır, demir',
      transparency: 50,
      features: [
        'Manyetometre tarafından tespit',
        'Değerli maden kaynakları',
        'Elektrik iletkenliği yüksek',
        'Sıkı konsantrasyon bölgeleri'
      ],
      stats: [
        { label: 'Metal Types', value: '4 çeşit' },
        { label: 'Concentration', value: '2.3 g/m³' },
        { label: 'Depth Clusters', value: '8' },
        { label: 'Signal Strength', value: '92dB' }
      ]
    },
    water: {
      label: 'Su',
      color: 'bg-blue-300',
      description: 'Yer altı suyu ve su tabakası',
      visibility: 55,
      density: '35%',
      composition: 'Su, mineraller, organik maddeler',
      transparency: 80,
      features: [
        'Tabii su kaynağı',
        'Sürekli akış sistemi',
        'Mineral deposu taşıyıcı',
        'Yer altı drenaj'
      ],
      stats: [
        { label: 'Water Level', value: '4.2m' },
        { label: 'Flow Rate', value: '0.8m/gün' },
        { label: 'Salinity', value: 'Low' },
        { label: 'Purity', value: '87%' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">3D Görüntüleme</h1>
            <p className="text-sm text-gray-600">3D model oluşturma ve katman analizi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* 3D Görüntüleme Alanı */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-8 h-8" />
              <h2 className="text-2xl font-bold">3D Model Görüntüleyici</h2>
            </div>
            <p className="text-orange-100">Toprağın altındaki yapıların üç boyutlu gösterimi</p>
          </div>
          <div className="p-6 bg-white space-y-6">
            {/* 3D Canvas Benzetim */}
            <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden border-2 border-gray-300 min-h-96 flex items-center justify-center">
              <div
                className="w-48 h-48 bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 rounded-lg shadow-2xl"
                style={{
                  transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom / 100})`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.3s ease-out',
                }}
              />
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs font-mono">
                X: {rotationX}° Y: {rotationY}° Z: {zoom}%
              </div>
            </div>

            {/* Kontrol Paneli */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  <RotateCw className="w-4 h-4 inline mr-1" />
                  X Döndürme: {rotationX}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotationX}
                  onChange={(e) => setRotationX(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  <RotateCw className="w-4 h-4 inline mr-1" />
                  Y Döndürme: {rotationY}°
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotationY}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-2">
                  <Maximize2 className="w-4 h-4 inline mr-1" />
                  Yakınlaştırma: {zoom}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Katman Seçimi */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-3">
                  <Layers className="w-4 h-4 inline mr-2" />
                  Görünür Katmanlar
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'all', label: 'Tüm Katmanlar', color: 'bg-gray-400' },
                    { id: 'surface', label: 'Yüzey', color: 'bg-yellow-500' },
                    { id: 'soil', label: 'Toprak', color: 'bg-amber-600' },
                    { id: 'rocks', label: 'Kayalar', color: 'bg-gray-600' },
                    { id: 'metals', label: 'Metaller', color: 'bg-blue-500' },
                    { id: 'water', label: 'Su', color: 'bg-blue-300' },
                  ].map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(layer.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium group ${
                        selectedLayer === layer.id
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`inline-block w-3 h-3 rounded mr-2 ${layer.color}`} />
                      {layer.label}
                      {selectedLayer === layer.id && (
                        <div className="text-xs text-blue-600 mt-1 font-semibold">✓ Seçildi</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seçilen Katmanın Detayları */}
              {selectedLayer && layerDetails[selectedLayer] && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className={`inline-block w-4 h-4 rounded ${layerDetails[selectedLayer].color}`} />
                        {layerDetails[selectedLayer].label}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{layerDetails[selectedLayer].description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{layerDetails[selectedLayer].visibility}%</p>
                      <p className="text-xs text-gray-600">Görünürlük</p>
                    </div>
                  </div>

                  {/* Özellikler Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Yoğunluk</p>
                      <p className="font-bold text-gray-900">{layerDetails[selectedLayer].density}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Bileşim</p>
                      <p className="font-bold text-gray-900 text-sm">{layerDetails[selectedLayer].composition}</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Şeffaflık</p>
                      <p className="font-bold text-gray-900">{layerDetails[selectedLayer].transparency}%</p>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Durum</p>
                      <p className="font-bold text-green-600 text-sm">✓ Aktif</p>
                    </div>
                  </div>

                  {/* Detaylı Özellikler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-600" />
                        Katman Özellikleri
                      </h5>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {layerDetails[selectedLayer].features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-600 font-bold">▸</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-blue-600" />
                        İstatistikler
                      </h5>
                      <div className="space-y-1 text-sm">
                        {layerDetails[selectedLayer].stats.map((stat: any, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-gray-600">{stat.label}:</span>
                            <span className="font-bold text-gray-900">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* İşlem Butonları */}
                  <div className="flex gap-2 pt-3 border-t border-blue-200">
                    <Button variant="outline" className="flex-1 text-sm" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Detay Göster
                    </Button>
                    <Button variant="outline" className="flex-1 text-sm" size="sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Analiz Et
                    </Button>
                    <Button variant="outline" className="flex-1 text-sm" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Anomali
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Teknik Bilgiler */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-600" />
            3D Model Özellikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">Geometri Bilgileri</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Toplam Vertices: 125,000</li>
                  <li>• Üçgen Sayısı: 250,000</li>
                  <li>• Model Boyutu: 15m x 10m x 8m</li>
                  <li>• Çözünürlük: 5cm hassasiyet</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-2">Taramanın Detayları</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Kullanılan Algılayıcı: LiDAR + Radar</li>
                  <li>• Tarama Noktaları: 5.2 Milyon</li>
                  <li>• İşlem Süresi: 2.5 saat</li>
                  <li>• Veri Boyutu: 2.8 GB</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Katman Analizi */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-orange-50 to-yellow-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            Derinlik Katmanları
          </h3>
          <div className="space-y-4">
            {[
              { depth: '0-0.5m', name: 'Toprak Üst Katmanı', color: 'bg-yellow-300', density: '85%' },
              { depth: '0.5-1m', name: 'Gevşek Toprak', color: 'bg-yellow-500', density: '72%' },
              { depth: '1-2m', name: 'Sıkışık Toprak', color: 'bg-amber-600', density: '88%' },
              { depth: '2-3m', name: 'Kayalar ve Taş', color: 'bg-gray-600', density: '95%' },
              { depth: '3-4m', name: 'Katı Kaya Tabakası', color: 'bg-gray-800', density: '98%' },
            ].map((layer) => (
              <div key={layer.depth} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-32">
                  <p className="font-semibold text-gray-900 text-sm">{layer.depth}</p>
                  <p className="text-xs text-gray-600">{layer.name}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-6 flex-1 rounded ${layer.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{layer.density}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Butonlar */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Modeli Dışa Aktar
          </Button>
        </div>
      </main>
    </div>
  );
}
