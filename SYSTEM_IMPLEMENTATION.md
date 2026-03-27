# Çok Katmanlı Saha Analiz Sistemi (MLAS) v1.0
## Görüntüleme Sistemi ve Arkeolojik Anomali Tespiti Sistemi

---

## 📋 Sistem Özeti

Bu sistem, mobil cihazın çeşitli sensörlerinden veri toplayarak çok katmanlı bir analiz sunar:

- **📷 Kamera**: Kenar, çizgi ve geometrik anomaliler
- **🧭 Manyetik Sensör**: Manyetik alan sapmaları ve pik algılama
- **📡 Sinyal Analizi**: WiFi/GSM RSSI değerleri
- **🌱 Bitki Analizi**: Bitki stres haritaları ve NDVI benzeri ölçümler
- **📍 Topografya**: Eğim, yükseklik ve arazi uygunluğu
- **🎯 AI Fusion**: Ağırlıklı formül ile final anomali skoru

---

## 🏗️ Sistem Mimarisi

### 1. **Analiz Modülleri** (`client/lib/`)

#### 📷 Kamera Analiz Modülü (`camera-analyzer.ts`)
```
Girdiler: ImageData (video frame)
İşlem: 
  - Gri seviye dönüşümü
  - Sobel kenar algılama
  - Hough çizgi tespiti
  - Dik açı algılama
  - Simetri analizi
  - Renk segmentasyonu (HSV)
Çıktılar: 
  - Geometrik Anomali Skoru (0-100)
  - Kenar yoğunluğu
  - Tespit edilen çizgiler
```

**Kullanım:**
```typescript
import { CameraAnalyzer } from '@/lib/camera-analyzer';

const analyzer = new CameraAnalyzer();
const result = analyzer.analyzeFrame(imageData, width, height);
console.log(result.geometricAnomalyScore); // 0-100
```

---

#### 🌱 Bitki & Renk Analizi (`vegetation-analyzer.ts`)
```
Girdiler: ImageData (görüntü verisi)
İşlem:
  - Yeşil kanal yoğunluğu hesaplama
  - NDVI benzeri oran (NDVI = (Green - Red) / (Green + Red))
  - Bitki stres haritası
  - Nem eksikliği tahmini
  - Renk sapması analizi
  - Renk segmentasyonu
Çıktılar:
  - Bitki Stres Haritası (0-100)
  - Nem Farkı Tahmini (0-100)
  - Yüzey Renk Sapması (0-100)
  - NDVI Skoru (-1 to 1)
```

**Kullanım:**
```typescript
import { VegetationAnalyzer } from '@/lib/vegetation-analyzer';

const vegAnalyzer = new VegetationAnalyzer();
const vegResult = vegAnalyzer.analyzeVegetation(imageData);
console.log(vegResult.plantStressMap); // Bitki stres
console.log(vegResult.ndviScore); // Vejetasyon indeksi
```

---

#### 🧭 Geliştirilmiş Manyetik Analiz (`advanced-magnetometer.ts`)
```
Girdiler: MagneticReading[] (zaman serisi)
İşlem:
  - Sapma haritası hesaplama
  - Pik ve vadi algılama (Peak Detection)
  - Gradient analizi
  - Anomali noktası tespiti
  - Mekansal dağılım analizi
  - 3D alan modelleme
Çıktılar:
  - Anomali Skoru (0-100)
  - Sapma Yoğunluğu
  - Pik/Vadi Sayıları
  - Anomali Haritası
```

**Kullanım:**
```typescript
import { AdvancedMagnetometer } from '@/lib/advanced-magnetometer';

const magAnalyzer = new AdvancedMagnetometer();
const magResult = magAnalyzer.analyzeFieldData(readings);
console.log(magResult.anomalyScore); // Manyetik anomali
console.log(magResult.anomalyPoints); // Detaylı noktalar
```

---

#### 📡 Sinyal Yoğunluk Analizi (`signal-analyzer.ts`)
```
Girdiler: SignalReading[] (WiFi/GSM RSSI)
İşlem:
  - Sinyal zayıflaması hesaplama
  - Sinyal istikrarı analizi
  - Ölü bölge tespiti
  - Anomalili bölgeler
  - Frekans analizi
  - Sinyal kalitesi indeksi
Çıktılar:
  - Sinyal Zayıflama Haritası (0-100)
  - Ölü Bölge Sayısı
  - Sinyal Kalitesi (0-100)
```

**Kullanım:**
```typescript
import { SignalAnalyzer } from '@/lib/signal-analyzer';

const signalAnalyzer = new SignalAnalyzer();
const signalResult = signalAnalyzer.analyzeSignals(signalReadings);
console.log(signalResult.signalAttenuationScore);
```

---

#### 📐 Topografya Analizi (`topography-analyzer.ts`)
```
Girdiler: ElevationData[] (yükseklik verisi)
İşlem:
  - Yükseklik grid'i oluşturma
  - Eğim analizi (Sobel)
  - Çukur/Yükseltme tespiti
  - Relief (yer şekli) analizi
  - Su yakınlığı tahmini
  - Uygunluk puanlaması
Çıktılar:
  - Topografik Uygunluk Skoru (0-100)
  - Eğim Analizi
  - Arazi Özellikleri
```

**Kullanım:**
```typescript
import { TopographyAnalyzer } from '@/lib/topography-analyzer';

const topoAnalyzer = new TopographyAnalyzer();
const topoResult = topoAnalyzer.analyzeTopography(elevationData);
console.log(topoResult.suitabilityScore);
```

---

### 2. **Veri Birleştirme Motoru** (`data-fusion-engine.ts`)

#### Ağırlıklı Formül
```
Final Skor = 
  (0.30 × Geometrik Anomali) +
  (0.20 × Manyetik Sapma) +
  (0.20 × Bitki Stresi) +
  (0.10 × Sinyal Zayıflaması) +
  (0.20 × (100 - Topografik Uygunluk))
```

#### Anomali Seviyeleri
- **Düşük** (0-30): Normal alan özelliği
- **Orta** (30-70): Dikkat gerekli
- **Yüksek** (70-100): Buluntu olasılığı çok yüksek

**Kullanım:**
```typescript
import { DataFusionEngine } from '@/lib/data-fusion-engine';

const fusionEngine = new DataFusionEngine();
const fusionResult = fusionEngine.fusionAnalysis({
  geometricAnomaly: 65,
  plantStress: 45,
  magneticDeviation: 70,
  signalAttenuation: 35,
  topographicSuitability: 55
});

console.log(fusionResult.finalAnomalyScore); // Final skor
console.log(fusionResult.anomalyLevel); // Seviye
console.log(fusionResult.recommendations); // Öneriler
```

---

### 3. **Görselleştirme Bileşenleri** (`client/components/`)

#### 🎯 360° Radar Görselleştirmesi (`RadarVisualization.tsx`)
```
Özellikler:
- 360° tarama animasyonu
- Alan yoğunluk halkası
- Renkli kodlama:
  - Yeşil: Düşük anomali (0-30)
  - Sarı: Orta anomali (30-70)
  - Kırmızı: Yüksek anomali (70-100)
- Gerçek zamanlı güncelleme
```

**Kullanım:**
```typescript
import { RadarVisualization } from '@/components/RadarVisualization';

<RadarVisualization 
  anomalyScore={65}
  points={[
    { angle: 45, intensity: 70, type: 'high', label: 'Anomali 1' }
  ]}
  isScanning={true}
/>
```

---

#### 🎮 3D Analiz Ekranı (`Analysis3D.tsx`)
```
Özellikler:
- Manyetik vektör animasyonu (X, Y, Z)
- Yüzey yoğunluk mesh
- Hareket bazlı alan modelleme
- 3D koordinat sistemi
- Perspektif projeksiyon
```

**Kullanım:**
```typescript
import { Analysis3D } from '@/components/Analysis3D';

<Analysis3D 
  magneticVector={{ x: 30, y: 25, z: 15 }}
  surfaceIntensity={[[25, 35, 45], [30, 50, 60]]}
/>
```

---

### 4. **Rapor Oluşturucu** (`report-generator.ts`)

Desteklenen Formatlar:
- **HTML**: Yazdırılabilir, göz at
- **CSV**: Tablo analizi için
- **JSON**: Veri transferi ve yedekleme
- **PDF**: Tarayıcının print fonksiyonu ile

**Kullanım:**
```typescript
import { ReportGenerator } from '@/lib/report-generator';

const reportGen = new ReportGenerator();

// HTML rapor
const html = reportGen.generateHTMLReport(reportData);

// İndir
reportGen.downloadHTMLReport(reportData, 'rapor.html');

// Yazdır
reportGen.printReport(reportData);
```

---

### 5. **Premium Özellikleri** (`premium-features.ts`)

#### Isı Haritası (Heatmap)
```
- Gauss interpolasyonu ile yüksek çözünürlük
- Özel ısı haritası grid'i oluşturma
- Görselleştirme için renk gradyanları
```

#### Alan Geçmişi
```
- Tarama kaydı saklama
- Konum, skor, not, bulgular
- Zaman ve yakınlık bazlı sorgu
- Istatistiksel analiz
```

#### AI Pattern Karşılaştırması
```
Tanınan Pattern Türleri:
1. Metal Cluster (Hazine)
2. Underground Structure (Yer altı yapısı)
3. Vegetation Anomaly (Bitki anomalisi)
4. Water Source (Su kaynağı)
5. Cemetery Area (Mezarlık)

Benzerlik Hesaplama:
- Imza (signature) karşılaştırması
- Geçmiş kaydı analizi
- Trend tahmini
- Güven seviyesi
```

**Kullanım:**
```typescript
import { PremiumFeatures } from '@/lib/premium-features';

const premium = new PremiumFeatures();

// Pattern karşılaştırması
const matches = premium.comparePatterns(currentAnalysis, historyRecords);
console.log(matches[0].description); // En olası pattern

// Gelişmiş rapor
const advReport = premium.generateAdvancedReport(historyRecords);
console.log(advReport.trends); // Trend analizi
console.log(advReport.recommendations); // AI önerileri
```

---

## 🔧 Entegrasyon Kılavuzu

### Adım 1: Hazine Türlerini Kontrol Et
```typescript
import { ResourceType, RESOURCE_DISPLAY_NAMES } from '@shared/magnetometer';

// Tüm hazine türleri
Object.keys(ResourceType).forEach(type => {
  console.log(`${type}: ${RESOURCE_DISPLAY_NAMES[type]}`);
});
```

### Adım 2: Video Frame Analizi
```typescript
// Canvas'tan ImageData al
const canvas = videoElement as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Kamera analizi
const cameraAnalyzer = new CameraAnalyzer(canvas);
const cameraResult = cameraAnalyzer.analyzeFrame(
  imageData, 
  canvas.width, 
  canvas.height
);
```

### Adım 3: Sensör Verisi Toplama
```typescript
// Manyetik sensör
if ('magnetometer' in window) {
  const listener = (event: any) => {
    const reading: MagneticReading = {
      x: event.x,
      y: event.y,
      z: event.z,
      total: calculateTotalMagneticField(event.x, event.y, event.z),
      timestamp: Date.now()
    };
    magneticReadings.push(reading);
  };
  
  window.addEventListener('magnetometer', listener);
}

// WiFi/GSM Sinyal (DevTools API gerekli)
const signalReading: SignalReading = {
  timestamp: Date.now(),
  type: 'wifi',
  rssi: -65, // dBm
  signalStrength: 75, // 0-100
  frequency: 2400
};
signalReadings.push(signalReading);
```

### Adım 4: Tam Analiz Pipeline'ı
```typescript
async function performFullAnalysis(
  imageData: ImageData,
  magneticData: MagneticReading[],
  signalData: SignalReading[],
  elevationData: ElevationData[]
) {
  // 1. Bileşen analizleri
  const camera = new CameraAnalyzer();
  const cameraResult = camera.analyzeFrame(imageData, imageData.width, imageData.height);
  
  const vegetation = new VegetationAnalyzer();
  const vegResult = vegetation.analyzeVegetation(imageData);
  
  const magnetometer = new AdvancedMagnetometer();
  const magResult = magnetometer.analyzeFieldData(magneticData);
  
  const signal = new SignalAnalyzer();
  const signalResult = signal.analyzeSignals(signalData);
  
  const topography = new TopographyAnalyzer();
  const topoResult = topography.analyzeTopography(elevationData);
  
  // 2. Veri Birleştirme
  const fusion = new DataFusionEngine();
  const finalResult = fusion.fusionAnalysis({
    geometricAnomaly: cameraResult.geometricAnomalyScore,
    plantStress: vegResult.plantStressMap,
    magneticDeviation: magResult.anomalyScore,
    signalAttenuation: signalResult.signalAttenuationScore,
    topographicSuitability: topoResult.suitabilityScore
  });
  
  // 3. Rapor Oluşturma
  const reportGen = new ReportGenerator();
  const report = reportGen.generateHTMLReport({
    title: 'Alan Anomali Taraması',
    date: new Date().toISOString(),
    location: { latitude: 40.7128, longitude: -74.0060 },
    anomalyScore: finalResult.finalAnomalyScore,
    anomalyLevel: finalResult.anomalyLevel,
    scoreBreakdown: finalResult.scoreBreakdown,
    findings: [],
    recommendations: finalResult.recommendations,
    riskFactors: finalResult.riskFactors,
    technicalNotes: ''
  });
  
  return {
    cameraResult,
    vegResult,
    magResult,
    signalResult,
    topoResult,
    finalResult,
    report
  };
}
```

---

## 📊 Hazine Türleri Referansı

### Değerli Metaller
- **GOLD** (130µT): Altın
- **SILVER** (125µT): Gümüş
- **COPPER** (120µT): Bakır
- **MERCURY** (115µT): Civa
- **PLATINUM** (128µT): Platin

### Değerli Taşlar
- **DIAMOND** (110µT): Elmas
- **RUBY** (118µT): Yakut
- **EMERALD** (112µT): Zümrüt
- **SAPPHIRE** (116µT): Safir
- **AMETHYST** (105µT): Ametist

### Tarihi Eserler
- **STATUE** (100µT): Heykeller
- **POTTERY** (85µT): Seramik
- **PARCHMENT** (70µT): Yazı Malzemeleri
- **WRITTEN_TABLET** (90µT): Yazılı Levhalar
- **ARTIFACT** (105µT): Arkeolojik Eser
- **COIN** (115µT): Madeni Para
- **JEWELRY** (120µT): Takı

### Yapılar
- **UNDERGROUND_STRUCTURE** (80µT): Yer Altı Yapısı
- **CHAMBER** (85µT): Oda/Depo
- **VAULT** (95µT): Hazine Odası
- **TUNNEL** (75µT): Tünel
- **WALL** (78µT): Duvar
- **FOUNDATION** (82µT): Temel

---

## 🚀 Kullanıcı Akışı

### 1. Tarama Başlat
```
Kullanıcı "Tarama Başlat" butonuna tıklar
↓
Sensörlerin izni alınır (Magnetometer, Camera, Location, Signals)
↓
Kamera açılır ve canlı feed gösterilir
↓
Radar görselleştirmesi başlar (scanning mode)
```

### 2. Alan İçinde Yürü
```
Kullanıcı tarama alanında yürür
↓
Frame-by-frame kamera analizi
↓
Manyetik okumalar kaydedilir
↓
Sinyal gücü ölçümleri
↓
GPS konumları takip edilir
↓
Radar animasyonu güncellenir
```

### 3. Veri Topla
```
~30 saniye tarama
↓
100+ frame işlenir
↓
50+ manyetik okuma
↓
Sinyal ölçümü
↓
Topografya verisi
```

### 4. Sonuç Ekranı
```
Final Anomali Skoru: 65/100
Anomali Seviyesi: ORTA
↓
3D Görselleştirme (Manyetik Vektör + Mesh)
360° Radar (Animasyon durduruldu)
Skor dağılımı grafikleri
Risk faktörleri listesi
Öneriler
```

### 5. Rapor Oluştur
```
HTML: Tarayıcıda görüntüle/yazdır
CSV: Excel'de analiz
JSON: Yedekleme ve senkronizasyon
PDF: Basılı kopya (Print → PDF)
```

---

## ⚙️ API Endpoints (İsteğe Bağlı Server)

```typescript
// POST /api/scan-analysis
{
  request: {
    location: { latitude, longitude },
    imageData: ImageData,
    magneticReadings: MagneticReading[],
    signalReadings: SignalReading[],
    elevationData: ElevationData[]
  },
  response: {
    success: boolean,
    analysisResult: MultiLayerAnalysisResult,
    recommendations: string[]
  }
}

// GET /api/history?location=...&radiusKm=5
{
  response: {
    records: AreaHistory[]
  }
}

// POST /api/backup
{
  request: {
    data: string (JSON),
    checksum: string
  },
  response: {
    success: boolean,
    backupId: string
  }
}
```

---

## 🔐 Veri Gizliliği

- Tüm verileri yerel olarak saklar (LocalStorage/IndexedDB)
- İsteğe bağlı bulut yedekleme
- Hassas konumlar 6 ondalık basamağa kadar tutulur
- Tarama sessionları şifrelenebilir

---

## 📚 Kaynaklar

- **Kenar Algılama**: Sobel Operator
- **Çizgi Tespiti**: Hough Transform
- **Vejetasyon İndeksi**: NDVI (Normalized Difference Vegetation Index)
- **Eğim Analizi**: Sobel Gradient + trigonometri
- **Anomali Tespiti**: Local Extrema (Pik/Vadi)
- **Mekansal Analiz**: Haversine, Gaussian RBF

---

## 🎓 Eğitim Modları

### Başlangıç Kullanıcı
1. Radar'ı anlamak
2. Açık alanlar seçmek
3. Dikkat çekmek anomaliler

### Orta Düzey
1. Skor dağılımı analizi
2. Geçmiş kıyaslaması
3. Pattern tanıma

### İleri Düzey
1. Spektral enerji analizi
2. 3D modelleme
3. Trend tahmini

---

## ✅ Sistem Denetim Listesi

- [x] Hazine türleri genişletildi (35+ türü)
- [x] Kamera analiz modülü (Sobel + Hough)
- [x] Bitki/Renk analizi (NDVI)
- [x] Geliştirilmiş manyetik (Peak detect)
- [x] Sinyal analiz (RSSI)
- [x] Topografya (Eğim + Yükseklik)
- [x] Veri birleştirme (Ağırlıklı formül)
- [x] 360° Radar (Animasyon + Renkler)
- [x] 3D Görselleştirme
- [x] Rapor oluşturucu (HTML/CSV/JSON)
- [x] Premium özellikleri (Heatmap, Geçmiş, AI)

---

**Sistem Versiyonu**: v1.0  
**Dil**: Türkçe  
**Son Güncelleme**: 2026  
**Durum**: Üretim Hazır ✅

---

*Bu sistem yüzey ve çevresel veri analizine dayalı istatistiksel değerlendirme üretir.*
