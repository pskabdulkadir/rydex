import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Satellite, MapPin, Calendar, ImageIcon, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SatelliteAnalysisDetail() {
  const navigate = useNavigate();
  const [selectedBand, setSelectedBand] = useState<string>('rgb');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Uydu Analizi</h1>
            <p className="text-sm text-gray-600">Açık kaynak uydu görüntüleri ve spektral analiz</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Uydu Görüntüsü */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-slate-600 to-gray-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Satellite className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Uydu Spektral Görüntüleme</h2>
            </div>
            <p className="text-slate-200">USGS Landsat 8 ve Sentinel-2 uydu verilerini kullanarak yüksek çözünürlüklü analiz</p>
          </div>
          <div className="p-6 bg-white space-y-6">
            {/* Görüntü Seçimi */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'rgb', label: 'RGB Renkli', desc: 'Doğal renkler' },
                { id: 'ir', label: 'Kızılötesi', desc: 'Enerji gösterimi' },
                { id: 'ndvi', label: 'NDVI', desc: 'Bitki sağlığı' },
                { id: 'dem', label: 'DEM', desc: 'Yükseklik haritası' },
              ].map((band) => (
                <button
                  key={band.id}
                  onClick={() => setSelectedBand(band.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    selectedBand === band.id
                      ? 'border-slate-600 bg-slate-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <ImageIcon className="w-5 h-5 mx-auto mb-2 text-slate-600" />
                  <p className="font-semibold text-sm text-gray-900">{band.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{band.desc}</p>
                </button>
              ))}
            </div>

            {/* Görüntü Gösterimi */}
            <div className="bg-gradient-to-br from-slate-100 to-gray-200 rounded-lg p-6 min-h-96 flex items-center justify-center border-2 border-gray-300">
              <div className="text-center text-gray-600">
                <div className="w-64 h-64 bg-gradient-to-br from-green-400 via-blue-400 to-red-400 rounded-lg shadow-2xl mb-4" />
                <p className="font-medium">Uydu Görüntüsü: {selectedBand.toUpperCase()}</p>
                <p className="text-sm text-gray-600">15m çözünürlük, 30.12.2024 tarihi</p>
              </div>
            </div>

            {/* Uydu Bilgileri */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Satellite className="w-4 h-4" />
                  <span className="text-xs font-semibold">Uydu</span>
                </div>
                <p className="font-bold text-gray-900">Sentinel-2A</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold">Tarih</span>
                </div>
                <p className="font-bold text-gray-900">30.12.2024</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs font-semibold">Çözünürlük</span>
                </div>
                <p className="font-bold text-gray-900">15 metre</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold">Bulut Oranı</span>
                </div>
                <p className="font-bold text-gray-900">2.3%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Spektral Bantlar */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-slate-600" />
            Spektral Bantlar
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Mavi Band (B2)', wavelength: '490nm', use: 'Su taraması, ışık geçişi' },
              { name: 'Yeşil Band (B3)', wavelength: '560nm', use: 'Bitki sağlığı, ışık geçişi' },
              { name: 'Kırmızı Band (B4)', wavelength: '665nm', use: 'Bitki enerji emimi' },
              { name: 'Kızılötesi Band (B8)', wavelength: '842nm', use: 'Bitki yapısı, tohum analizi' },
              { name: 'SWIR Band (B11)', wavelength: '1610nm', use: 'Su ve tarım analizi' },
            ].map((band, i) => (
              <div key={i} className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-gray-300 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{band.name}</p>
                  <p className="text-sm text-gray-600">{band.use}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-slate-600">{band.wavelength}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* İndeksler */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-slate-600" />
            Hesaplanan İndeksler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: 'NDVI (Normalized Difference Vegetation Index)',
                value: '0.62',
                desc: 'Bitki sağlığı göstergesi',
                range: '-1 (sağlıksız) → +1 (sağlıklı)',
              },
              {
                name: 'NDBI (Normalized Difference Built-up Index)',
                value: '0.18',
                desc: 'İnsan yapımı yapılar',
                range: '-1 (doğal) → +1 (yapılı)',
              },
              {
                name: 'NDWI (Normalized Difference Water Index)',
                value: '0.35',
                desc: 'Su içeriği',
                range: '-1 (kuru) → +1 (suya doygun)',
              },
              {
                name: 'NDMI (Normalized Difference Moisture Index)',
                value: '0.42',
                desc: 'Nem oranı',
                range: '-1 (kuru) → +1 (nemli)',
              },
            ].map((idx, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-300">
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{idx.name}</h4>
                <p className="text-3xl font-bold text-slate-600 mb-2">{idx.value}</p>
                <p className="text-sm text-gray-600 mb-1">{idx.desc}</p>
                <p className="text-xs text-gray-500 font-mono">{idx.range}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Butonlar */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Verisi İndir (GeoTIFF)
          </Button>
        </div>
      </main>
    </div>
  );
}
