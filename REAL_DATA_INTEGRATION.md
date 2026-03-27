# Gerçek Veri Sistemi - Entegrasyon Kılavuzu

Bu dokuman, ArchaeoScanner uygulamasının gerçek veri kaynakları (NOAA, USGS, UNESCO, vb.) ile entegrasyonunu açıklar.

## 📋 Sistem Mimarisi

```
┌─────────────────────────────────────────┐
│  Android APK (Capacitor)                │
│  ┌───────────────────────────────────┐  │
│  │ React SPA Frontend                │  │
│  │  - RealDataScanner Komponenti     │  │
│  │  - Offline Storage Hook           │  │
│  │  - Location Service               │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ Servisler                         │  │
│  │  - location-service.ts (GPS)      │  │
│  │  - real-data-fetcher.ts (API)     │  │
│  │  - scan-state-manager.ts (State)  │  │
│  │  - offline-storage.ts (IndexedDB) │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↓        ↓        ↓        ↓
    NOAA   USGS  UNESCO  Open-Elevation
  (Magnetic) (Geology) (Archaeology) (DEM)
```

## 🚀 Hızlı Başlangıç

### 1. Proje Kurulumu

```bash
# Bağımlılıkları yükle
pnpm install

# Build et
pnpm build:client

# Türkçe tüm cevapları sağlamak için test et
pnpm dev
```

### 2. Gerçek Veri Sayfasına Erişim

Uygulamada şu URL'ye gidin:
```
http://localhost:8080/real-data
```

Veya navigasyonda "Gerçek Veri Taraması" bölümünü arayın.

### 3. Tarama Akışı

```
1. "Taramayı Başlat" butonuna tıkla
   ↓
2. GPS konumunu al
   ↓
3. Veri kaynakları kullanılarak tarama başla:
   - NOAA API → Manyetik alan verileri
   - USGS API → Jeoloji ve maden yatakları
   - UNESCO API → Arkeolojik siteler
   - Open Elevation → Topografik veriler
   ↓
4. Tarama tamamlanırsa → Tüm verileri göster
   ↓
5. Verileri cihazda offline olarak sakla (IndexedDB)
```

## 🔧 Yazılan Dosyalar

### Servisler

| Dosya | Amaç |
|-------|------|
| `client/services/location-service.ts` | Capacitor GPS entegrasyonu |
| `client/services/real-data-fetcher.ts` | NOAA, USGS, UNESCO API çağrıları |
| `client/services/scan-state-manager.ts` | Tarama durumu yönetimi (önemli: tarama öncesi veri gösterilmez) |
| `client/services/offline-storage.ts` | IndexedDB'ye tarama ve cache kaydı |

### Bileşenler

| Dosya | Amaç |
|-------|------|
| `client/components/RealDataScanner.tsx` | Ana UI - tarama ve sonuç gösterilmesi |
| `client/pages/RealData.tsx` | Sayfaüstü yapı ve belgelendirme |

### React Hook'ları

| Dosya | Amaç |
|-------|------|
| `client/hooks/useOfflineStorage.ts` | Offline depolama işlemleri için |

### Konfigürasyon

| Dosya | Amaç |
|-------|------|
| `capacitor.config.ts` | Android APK yapılandırması |
| `ANDROID_BUILD.md` | Adım adım Android kurulum rehberi |
| `package.json` | Capacitor ve API bağımlılıkları |

## 📍 Önemli Notlar

### Tarama Öncesi / Sonrası Mantığı

**Kural:** Tarama yapılmadan HİÇ BİR veri gösterilmez!

```typescript
// scan-state-manager.ts'de

getDisplayData() {
  if (!currentSession) return { showData: false };
  
  // Sadece "completed" durumunda veri gösterilir
  if (currentSession.status === "completed") {
    return { showData: true, data: realData };
  }
  
  return { showData: false };
}
```

### Konum Doğruluğu

```typescript
// GPS doğruluğunu kontrol et
const isAccurate = locationService.isAccurate(50); // 50 metre
```

### Cache ve Offline Depolama

- Tarama sonuçları **IndexedDB**'ye kaydedilir
- 30 gün boyunca saklanır
- 50MB limit vardır (otomatik temizleme)
- İnternet olmayan durumlarda cache'ten kullanılabilir

## 🌐 API Kaynakları ve Limitler

### 1. NOAA Magnetic Data

```typescript
// URL: https://www.ncei.noaa.gov/
// Limit: Limit yok (public API)
// Bilgiler: Toplam İntensite, Deklinasyon, İnklinasyon

const magneticData = await realDataFetcher.fetchMagneticData({
  latitude: 39.9,
  longitude: 32.8,
});
```

### 2. USGS Mineral Data

```typescript
// URL: https://mrdata.usgs.gov/api/
// Limit: Limit yok (public API)
// Bilgiler: Maden yatakları, jeoloji, depremler

const geologyData = await realDataFetcher.fetchGeologyData({
  latitude: 39.9,
  longitude: 32.8,
});
```

### 3. UNESCO World Heritage

```typescript
// URL: https://whc.unesco.org/
// Limit: Limit yok (public API)
// Bilgiler: Dünya mirası siteleri

const unescoSites = await realDataFetcher.fetchUnescoData({
  latitude: 39.9,
  longitude: 32.8,
});
```

### 4. Open Context (Archaeology)

```typescript
// URL: https://opencontext.org/api/
// Limit: Limit yok (public API)
// Bilgiler: Arkeolojik siteler ve buluntular

const archSites = await realDataFetcher.fetchOpenContextData({
  latitude: 39.9,
  longitude: 32.8,
});
```

### 5. Open Elevation (DEM)

```typescript
// URL: https://api.open-elevation.com/
// Limit: 30 istek/dakika (pro subscriptions mevcut)
// Bilgiler: Yükseklik, topografya

const elevationData = await realDataFetcher.fetchTerrainData({
  latitude: 39.9,
  longitude: 32.8,
});
```

## 🔐 Güvenlik Notları

1. **API Anahtarları:** Şu anda gerekli değil (public API'ler)
2. **CORS:** Web sürümünde tarayıcı CORS'u kontrol edebilir
3. **APK Sürümü:** Native iOS/Android izinleri otomatik istenir

## 📱 Android APK Yapması

### Hızlı Yol

```bash
# 1. Client build et
pnpm build:client

# 2. Capacitor'ı senkronize et
pnpm cap:sync

# 3. Android Studio aç
pnpm cap:open:android

# 4. Android Studio'da Build → Build APK(s) tıkla
```

### Detaylı Talimatlar

Bkz. `ANDROID_BUILD.md`

## 🧪 Test Etme

### Web'de Test

```bash
# Dev sunucuyu başlat
pnpm dev

# Tarayıcıda aç
open http://localhost:8080/real-data
```

### Android Emülatörde Test

```bash
# Emülatör başlat (Android Studio Device Manager)
# Sonra:
pnpm cap:run:android
```

## 🐛 Sorun Giderme

### "Konum alınamadı"
- GPS'in açık olup olmadığını kontrol et
- Emülatöre Extended controls → Location simulation ekle
- GPS doğruluğu 5-50 metre arasında değişebilir

### "API'dan veri çekilemedi"
- İnternet bağlantısını kontrol et
- API'nin erişilebilir olup olmadığını kontrol et (curl ile test)
- CORS hatası varsa web proxy kullan

### "IndexedDB hatası"
- Tarayıcı depolama limitini kontrol et
- Private/Incognito modunda test etme
- `offlineStorage.clearAllData()` ile cache'i sıfırla

### "APK'da GPS çalışmıyor"
- `AndroidManifest.xml`'de izinlerin olup olmadığını kontrol et
- Cihazda konumu açık tut
- Gerçek cihazda test et (emülatör sınırlı)

## 📊 Örnek Veri Akışı

```json
// Input: Konum
{
  "latitude": 39.9,
  "longitude": 32.8,
  "accuracy": 25.5,
  "radius": 50
}

// Output: Sonuç
{
  "location": { "latitude": 39.9, "longitude": 32.8 },
  "timestamp": "2025-02-22T10:30:00Z",
  "dataQuality": "high",
  
  "magneticData": {
    "totalIntensity": 45200,
    "declination": 3.5,
    "inclination": 55.2,
    "horizontalIntensity": 28900
  },
  
  "geologyData": {
    "deposits": [ ... ]  // Maden yatakları
  },
  
  "archaeologyData": {
    "unescoSites": [ ... ],  // UNESCO siteleri
    "archaeologicalSites": [ ... ]  // Arkeolojik siteler
  },
  
  "terrainData": {
    "elevation": 650,  // metre
    "slope": 12.5,     // derece
    "landform": "dağlık"
  },
  
  "metadata": {
    "sourcesUsed": ["NOAA", "USGS", "UNESCO", "Open-Elevation"],
    "requestTime": 3500,  // milisaniye
    "successRate": 100    // yüzde
  }
}
```

## 🎯 Gelecek İyileştirmeler

- [ ] Offline haritalar (Vector Tiles)
- [ ] Daha fazla veri kaynağı (GeoNames, Wikidata)
- [ ] Veri kaynaklarını kontrol panelinden seç
- [ ] Kişiselleştirilebilir doğruluk seviyeleri
- [ ] Uydu görüntüleri (Sentinel, Landsat)
- [ ] Zaman serisi analizi
- [ ] Veri ihracatı (GeoJSON, KML, CSV)
- [ ] Web haritası üzerinde sonuçlar
- [ ] Arşiv sorgulaması (tarihsel veriler)

## 📚 Kaynaklar

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Geolocation](https://capacitorjs.com/docs/apis/geolocation)
- [NOAA World Magnetic Model](https://www.ncei.noaa.gov/products/world-magnetic-model/)
- [USGS API](https://mrdata.usgs.gov/api/)
- [UNESCO World Heritage List](https://whc.unesco.org/en/list/json/)
- [Open Context](https://opencontext.org/api/)
- [Open Elevation API](https://open-elevation.com/)

## 💡 İletişim ve Destek

Sorular veya öneriler için:
- GitHub Issues açabilirsiniz
- [Builder.io Desteği](https://www.builder.io/c/docs)
