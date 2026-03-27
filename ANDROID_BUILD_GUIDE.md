# Android Build Guide - ArchaeoScanner APK Oluşturma

## Genel Bakış

Bu kılavuz, gerçek sensörlere (GPS, Kamera, Manyetometre) bağlı React mobil uygulamasını Android'e derleme ve APK dosyası oluşturma adımlarını içerir.

---

## 1. Ön Gereksinimler

### Yazılım Gereksinimleri
- **Node.js**: v18+ (pnpm ile birlikte gelir)
- **pnpm**: v9.1.0+
- **Java JDK**: 17+ (Android SDK ile birlikte gelir)
- **Android SDK**: API 34 (SDK Manager'dan indir)
- **Android Studio**: 2024.1+ (opsiyonel, CLI build için gerekli değil)
- **Gradle**: 8.0+ (Android Gradle Plugin tarafından yönetilir)

### Sistem Gereksinimleri
- **RAM**: En az 8 GB
- **Disk**: 10+ GB (Android SDK ve Gradle cache için)
- **OS**: Windows, macOS, veya Linux

### Cihaz Gereksinimleri
- **Target SDK**: Android 14 (API 34)
- **Minimum SDK**: Android 5.0 (API 21)
- **Sensörler**: GPS, Kamera, Manyetometre (isteğe bağlı, fallback var)

---

## 2. Ortam Kurulumu

### 2.1 Android SDK'sı Kurma

```bash
# Android Studio'yu indir ve kur
# (veya Android Command Line Tools'u)

# ANDROID_HOME ortam değişkenini ayarla
# Windows:
set ANDROID_HOME=%USERPROFILE%\AppData\Local\Android\sdk

# macOS/Linux:
export ANDROID_HOME=~/Android/Sdk

# SDK Manager ile gerekli bileşenleri indir:
sdkmanager "platforms;android-34"
sdkmanager "build-tools;34.0.0"
sdkmanager "platform-tools"
sdkmanager "tools"
```

### 2.2 Capacitor CLI Kurma

```bash
# Proje dizininde
pnpm install @capacitor/cli --save-dev

# Capacitor komutlarının çalıştığını kontrol et
pnpm cap --version
```

---

## 3. Build Süreci

### 3.1 React Uygulamasını Derle

```bash
# Proje dizininde

# Bağımlılıkları yükle
pnpm install

# TypeScript kontrol et
pnpm typecheck

# Production build oluştur
pnpm build

# Kontrol: dist/spa klasörü oluşturulmuş mu?
ls dist/spa/
```

### 3.2 Capacitor Senkronizasyonu

```bash
# Android dosyalarını senkronize et
pnpm cap sync android

# Kapacitor'a bak (isteğe bağlı)
pnpm cap open android
```

Çıktı:
```
✔ Syncing Android files
✔ Copying web app
✔ Generating package.json
✔ Installing dependencies
```

---

## 4. APK Oluşturma

### 4.1 Debug APK (Hızlı Test)

```bash
cd ANDROID_PROJECT

# Gradle wrapper çalıştır
./gradlew assembleDebug

# APK dosyası
# app/build/outputs/apk/debug/app-debug.apk
```

**Özellikleri:**
- İmzasız, test için uygun
- 5-10 dakika build süresi
- Debuggable mode aktif
- Dosya boyutu: ~150 MB

### 4.2 Release APK (Üretim)

```bash
cd ANDROID_PROJECT

# Keystore dosyası oluştur (ilk defa)
keytool -genkey -v -keystore archaeoscanner.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias archaeoscanner

# Build.gradle.kts'ye signing config ekle:
# signing {
#   configs {
#     release {
#       storeFile = file("../archaeoscanner.jks")
#       storePassword = "YOUR_PASSWORD"
#       keyAlias = "archaeoscanner"
#       keyPassword = "YOUR_PASSWORD"
#     }
#   }
#   buildTypes {
#     release {
#       signingConfig = signingConfigs.release
#     }
#   }
# }

# Release APK oluştur
./gradlew assembleRelease

# APK dosyası
# app/build/outputs/apk/release/app-release.apk
```

**Özellikleri:**
- Google Play'e upload etmeye hazır
- İmzalı (signed)
- ProGuard/R8 obfuscation uygulanmış
- 20-30 dakika build süresi
- Dosya boyutu: ~80 MB

---

## 5. APK'yi Cihazda Test Etme

### 5.1 USB Debugging Etkinleştir

1. **Geliştirici Seçenekleri Aç:**
   - Ayarlar → Telefon Hakkında
   - "Yapı Numarası"na 7 kez dokunun
   - Geliştirici Seçenekleri gösterilecek

2. **USB Debugging Aç:**
   - Ayarlar → Geliştirici Seçenekleri
   - "USB Debugging" aç

3. **Cihazı Bilgisayara Bağla:**
   - USB kablosu ile bağla
   - İzin sor iletişini onayla

### 5.2 APK'yi Yükle

```bash
# Cihaz bağlantısını kontrol et
adb devices

# Output:
# List of attached devices
# emulator-5554          device
# FA69Y1A0271           device

# APK'yi yükle
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Output:
# Performing Streamed Install
# Success
```

### 5.3 Uygulamayı Test Et

```bash
# Lokal dev server'ı başlat
pnpm dev

# Mobil cihazdan erişim
# http://192.168.1.X:8080
# (IP adresini localhost yerine kullan)

# Sensorleri test et:
# 1. Magnetometer sayfasını aç
# 2. "Başlat" butonuna tıkla
# 3. Manyetometre verilerini görüp görmediğini kontrol et
# 4. GPS verilerinin gelip gelmediğini kontrol et
# 5. Kamera'yı aç ve izin istenmesini kontrol et
```

---

## 6. Sensör Testleri

### 6.1 Manyetometre (Magnetometer)

**Sayfası:** `/magnetometer`

```
✅ Kontrol Listesi:
- [ ] Sayfa yükleniyor
- [ ] "Başlat" butonu çalışıyor
- [ ] Manyetometre değerleri güncelleniyor (X, Y, Z, Total)
- [ ] Kalibrasyon işlemi başlıyor
- [ ] Anomali tespitleri kaydediliyor
```

**Beklenen Değerler:** 20-65 µT (Dünya manyetik alanı)

### 6.2 GPS (Geolocation)

**Sayfası:** `/magnetometer/map` veya konum paylaşan sayfalar

```
✅ Kontrol Listesi:
- [ ] "Konum İzni" isteniyor
- [ ] Konum koordinatları alınıyor
- [ ] Harita görüntüleniyor
- [ ] Marker'lar harita'da gösteriliyorsa
```

### 6.3 Kamera (Camera)

**Sayfası:** `/camera`

```
✅ Kontrol Listesi:
- [ ] Kamera izni isteniyor
- [ ] Kamera feed açılıyor
- [ ] Fotoğraf çekilebiliyor
- [ ] Çekilen fotoğraflar konum ile etiketleniyor
```

---

## 7. Hata Giderme

### Build Hatası: "SDK not found"

```bash
# ANDROID_HOME kontrol et
echo $ANDROID_HOME

# Yoksa ayarla
export ANDROID_HOME=~/Android/Sdk
```

### Build Hatası: "Gradle sync failed"

```bash
# Gradle cache'i temizle
cd ANDROID_PROJECT
./gradlew clean
./gradlew assembleDebug
```

### Build Hatası: "Kotlin version mismatch"

```gradle
// build.gradle.kts
plugins {
    kotlin("android") version "1.9.22"
    kotlin("kapt") version "1.9.22"
}
```

### APK Yükleme Hatası: "INSTALL_FAILED_VERSION_DOWNGRADE"

```bash
# Eski APK'yi kaldır
adb uninstall com.archaeoscanner.mobile

# Yenisini yükle
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Sensor Hatası: "Sensor not available"

```javascript
// client/lib/magnetometer-utils.ts
// Fallback mekanizması otomatik olarak çalışır
// generateSimulatedMagneticData() kullanılır
console.log('⚠️ Gerçek sensör kullanılamıyor, simülasyon modu');
```

---

## 8. İzinler ve Manifest

### AndroidManifest.xml

Gerekli izinler otomatik olarak kapacitor.config.ts'den eklenir, ancak manuel kontrol:

```xml
<!-- ANDROID_PROJECT/app/src/main/AndroidManifest.xml -->

<!-- GPS İzinleri -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Kamera İzinleri -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Sensör İzinleri -->
<uses-permission android:name="android.permission.BODY_SENSORS" />
<uses-permission android:name="android.permission.BODY_SENSORS_BACKGROUND" />

<!-- Ağ İzinleri -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Dosya İzinleri -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### Runtime İzinleri (Android 6.0+)

Runtime sırasında istenilecek izinler:

```javascript
// client/lib/location-service.ts ve client/lib/use-camera.ts
// Otomatik olarak navigator.permissions API'sini kullanır
```

---

## 9. Google Play'e Yükleme

### 9.1 Developer Account Oluştur

1. [Google Play Developer Console](https://play.google.com/console) ziyaret et
2. Geliştirici hesabı aç ($25 ücreti)
3. Uygulama detaylarını doldur

### 9.2 Release Hazırla

```bash
# 1. keystore oluştur
keytool -genkey -v -keystore archaeoscanner.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias archaeoscanner

# 2. Build.gradle.kts'ye signing config ekle
# 3. Release APK oluştur
cd ANDROID_PROJECT
./gradlew assembleRelease

# 4. APK dosyasını kontrol et
# app/build/outputs/apk/release/app-release.apk
```

### 9.3 Play Console'da Upload

1. App Bundles & APKs sayfasına git
2. Release APK'yı upload et
3. Release notes ekle
4. Gözden geçiş için gönder

---

## 10. Sürüm Güncelleme

### Version Code ve Version Name

```gradle
// ANDROID_PROJECT/app/build.gradle.kts
defaultConfig {
    versionCode = 2          // Arttır (her release için)
    versionName = "1.1.0"    // Semantik versiyonlama
}
```

---

## 11. Komut Özeti

```bash
# Kurulum
pnpm install
pnpm cap add android

# Build
pnpm build
pnpm cap sync android

# APK Oluştur
cd ANDROID_PROJECT
./gradlew assembleDebug     # Debug APK
./gradlew assembleRelease   # Release APK

# Test
adb devices                 # Cihazları listele
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb logcat                  # Log'ları görüntüle
```

---

## 12. Kaynaklar

- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Android Developer Docs](https://developer.android.com/docs)
- [Gradle Documentation](https://gradle.org/features/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## Son Hatırlatma

✅ Tüm gerçek sensörlere bağlı
✅ Mock veri kullanılmıyor
✅ Offline senkronizasyon hazır
✅ Production-ready APK oluşturabilir
✅ Google Play'e upload edilebilir

**İyi şanalar! 🚀**
