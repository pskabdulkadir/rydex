import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Radar, RotateCw, Activity, AlertCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RadarScanDetail() {
  const navigate = useNavigate();
  const [rotationAngle, setRotationAngle] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Radar Tarama</h1>
            <p className="text-sm text-gray-600">360° radar görüntüleme ve aktivite skoru</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Radar Görüntüsü */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Radar className="w-8 h-8" />
              <h2 className="text-2xl font-bold">360° Radar Tarama</h2>
            </div>
            <p className="text-cyan-100">Tüm yönlerden metallikleri tespit eden çevre radar</p>
          </div>
          <div className="p-6 bg-white space-y-6">
            {/* Radar Gösterimi */}
            <div className="relative mx-auto w-96 h-96 max-w-full">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Arka plan daireler */}
                <circle cx="200" cy="200" r="180" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="200" cy="200" r="135" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="200" cy="200" r="90" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                <circle cx="200" cy="200" r="45" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Yön çizgileri */}
                <line x1="200" y1="20" x2="200" y2="380" stroke="#e5e7eb" strokeWidth="1" />
                <line x1="20" y1="200" x2="380" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                
                {/* Tekstler */}
                <text x="200" y="30" textAnchor="middle" className="text-xs fill-gray-600">K</text>
                <text x="200" y="380" textAnchor="middle" className="text-xs fill-gray-600">G</text>
                <text x="20" y="205" className="text-xs fill-gray-600">B</text>
                <text x="380" y="205" className="text-xs fill-gray-600">D</text>

                {/* Radar haraç */}
                <g transform={`rotate(${rotationAngle} 200 200)`}>
                  <line x1="200" y1="200" x2="200" y2="40" stroke="#0ea5e9" strokeWidth="2" opacity="0.7" />
                  <path d="M 200 200 L 190 80 L 200 40 L 210 80 Z" fill="#0ea5e9" opacity="0.3" />
                </g>

                {/* Tespit edilenler */}
                <circle cx="300" cy="150" r="8" fill="#ef4444" opacity="0.7" />
                <circle cx="150" cy="280" r="6" fill="#eab308" opacity="0.7" />
                <circle cx="280" cy="240" r="7" fill="#f97316" opacity="0.7" />
                <circle cx="120" cy="140" r="5" fill="#22c55e" opacity="0.7" />
              </svg>
            </div>

            {/* Kontroller */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-3">
                <RotateCw className="w-4 h-4 inline mr-1" />
                Dönme Açısı: {rotationAngle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-3">
                <Button variant="outline" onClick={() => setRotationAngle(0)} className="flex-1">
                  Sıfırla
                </Button>
                <Button variant="outline" onClick={() => setRotationAngle((p) => (p + 30) % 360)} className="flex-1">
                  Döndür
                </Button>
              </div>
            </div>

            {/* Tespit Özeti */}
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 space-y-2">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-cyan-600" />
                Tespit Edilen Anomaliler
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex gap-2">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-1.5" />
                  Yüksek Anomali: 310° yönünde, 85m mesafede
                </li>
                <li className="flex gap-2">
                  <span className="inline-block w-2 h-2 bg-orange-600 rounded-full mt-1.5" />
                  Orta Anomali: 250° yönünde, 120m mesafede
                </li>
                <li className="flex gap-2">
                  <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-1.5" />
                  Düşük Anomali: 260° yönünde, 140m mesafede
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Radar Özeliğiekleri */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-600" />
            Radar Özellikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <h4 className="font-semibold text-gray-900 mb-3">Teknik Spesifikasyonlar</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Frekans: 5.8 GHz</li>
                <li>• Dalga Boyu: 51.7 mm</li>
                <li>• Çözünürlük: 10cm</li>
                <li>• Maksimum Menzil: 200 metre</li>
                <li>• Tarama Hızı: 360°/saniye</li>
                <li>• Hassasiyet: ±2cm</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Son Tarama İstatistikleri</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Tarama Süresi: 45 saniye</li>
                <li>• Veri Noktaları: 18,000</li>
                <li>• Ortalama Sinyal Gücü: -65 dB</li>
                <li>• Gürültü Seviyesi: -75 dB</li>
                <li>• SNR (Sinyal/Gürültü): 10 dB</li>
                <li>• Kalite Puanı: 92%</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Mesafe Analizi */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-cyan-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-600" />
            Mesafe Bazlı Anomali Dağılımı
          </h3>
          <div className="space-y-3">
            {[
              { range: '0-50m', count: 3, strength: '95%' },
              { range: '50-100m', count: 5, strength: '78%' },
              { range: '100-150m', count: 2, strength: '54%' },
              { range: '150-200m', count: 1, strength: '32%' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-300">
                <span className="font-semibold text-gray-900 w-20">{item.range}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-6 flex-1 bg-gradient-to-r from-cyan-300 to-blue-500 rounded" style={{ opacity: item.count / 5 }} />
                    <span className="text-sm font-semibold text-gray-700">{item.count} tespit</span>
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
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            Harita Verisini Kart Al
          </Button>
        </div>
      </main>
    </div>
  );
}
