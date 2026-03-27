import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Camera, TrendingUp, Eye, Grid3X3, BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CameraAnalysisDetail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-gray-300 p-4 bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kamera Analizi</h1>
            <p className="text-sm text-gray-600">Görsel tanıma ve kenar tespiti teknolojisi</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6 py-8">
        {/* Örnek Görüntü */}
        <Card className="overflow-hidden shadow-xl border-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Kamera Görüntü İşleme</h2>
            </div>
            <p className="text-blue-100">Yapay zeka destekli gerçek zamanlı görüntü analizi</p>
          </div>
          <div className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Açıklama */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sistem Özellikleri</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Kenar Tespiti:</strong> Nesnelerin sınırlarını belirleme</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Simetri Analizi:</strong> Geometrik şekil tespiti</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Renk Anomalileri:</strong> Anormal renk dağılımı</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Netlik Ölçümü:</strong> Görüntü kalite kontrolü</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span><strong>Kontrast Analizi:</strong> Yerelleştirme hassasiyeti</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Kullanım Alanları</h4>
                  <p className="text-sm text-gray-700">
                    Metal detektörü taraması sırasında metalik cisimleri belirlemek, toprağın yapısını analiz etmek ve gömülü objelerin olası konumlarını tahmin etmek için kullanılır.
                  </p>
                </div>
              </div>

              {/* Sağ taraf - Uygulama Özellikleri ve Tarama */}
              <div className="space-y-4">
                {/* Uygulama Özellikleri Butonu */}
                <button
                  onClick={() => navigate('/application-features')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 px-6 rounded-lg font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Uygulama Özellikleri
                </button>
                <p className="text-sm text-gray-600 text-center">
                  20 yer altı tarama ve analiz özelliğine erişin. Konum, koordinat, derinlik ve alan bilgilerinizi girin.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    Detaylı tarama ve parametreleri ayarlamak için <strong>"Uygulama Özellikleri"</strong> bölümüne gidin. Orada konumunuzu otomatik olarak alabilir veya manuel olarak koordinat, derinlik ve alan bilgilerini girebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detaylı Açıklama */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-blue-600" />
            İşleme Teknikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Canny Edge Detection</h4>
              <p className="text-sm">Nesnelerin kenarlarını çok hassas bir şekilde tespit eden algoritma. Toprağın içine gömülü objelerin sınırlarını belirlemeye yardımcı olur.</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Hough Transform</h4>
              <p className="text-sm">Doğru çizgileri ve daireleri tespit etmek için kullanılan matematiksel teknik. Metalik cisimlerin şeklini belirlemeye yardımcı olur.</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Kontras Geliştirme</h4>
              <p className="text-sm">Görüntüdeki ışık-gölge farkını artırarak zayıf kontrastlı bölgeleri vurgular. Belirsiz nesneleri daha belirgin hale getirir.</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Histogram Eşitleme</h4>
              <p className="text-sm">Görüntü piksellerinin dağılımını düzenleyerek daha iyi kontrast sağlar. Farklı ışık koşullarında tutarlı sonuçlar verir.</p>
            </div>
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Morfolojik İşlemler</h4>
              <p className="text-sm">Görüntüdeki boşlukları doldurma ve çıkıntıları kesme işlemleri. Nesneleri daha düzenli ve tanınabilir hale getirir.</p>
            </div>
            <div className="border-l-4 border-indigo-600 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Yapı Analizi</h4>
              <p className="text-sm">Tespit edilen şekillerin iç yapısını analiz ederek nesne türünü belirleme. Metal, seramik, cam gibi farklı materyalleri ayırt edebilir.</p>
            </div>
          </div>
        </Card>

        {/* Başarı Metrikleri */}
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Performans Metrikleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">94%</p>
              <p className="text-sm text-gray-600 mt-1">Ortalama Doğruluk</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">45 FPS</p>
              <p className="text-sm text-gray-600 mt-1">İşlem Hızı</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">120ms</p>
              <p className="text-sm text-gray-600 mt-1">Tepki Süresi</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200 text-center">
              <p className="text-3xl font-bold text-orange-600">8MP</p>
              <p className="text-sm text-gray-600 mt-1">Çözünürlük</p>
            </div>
          </div>
        </Card>

        {/* Butonlar */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg h-12"
          >
            Ana Sayfaya Dön
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-12 text-lg"
          >
            PDF Rapor İndir
          </Button>
        </div>
      </main>
    </div>
  );
}
