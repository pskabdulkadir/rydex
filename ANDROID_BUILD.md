# ArchaeoScanner Android APK Yapı Rehberi

Bu rehber, ArchaeoScanner uygulamasını Android APK dosyası olarak nasıl oluşturacağınızı anlatır.

## Sistem Gereksinimleri

- **Node.js**: v18 veya üzeri
- **Java Development Kit (JDK)**: v11 veya üzeri
- **Android SDK**: API level 21+ (hedef: 34)
- **Android Studio**: İsteğe bağlı (emülatör veya gerçek cihaz gerekli)
- **Capacitor CLI**: Otomatik kurulacak

## Adım 1: Geliştirme Ortamını Hazırla

### 1.1 Java JDK Kurulum
```bash
# macOS (Homebrew)
brew install openjdk@11

# Windows: https://adoptopenjdk.net/ veya https://www.oracle.com/java/technologies/downloads/
# Ubuntu/Debian
sudo apt-get install openjdk-11-jdk
```

### 1.2 Android SDK Kurulum
```bash
# macOS
brew install --cask android-sdk
brew install --cask android-ndk

# veya Android Studio'yu kur ve SDK Manager'dan indir
```

### 1.3 Ortam Değişkenlerini Ayarla
```bash
# ~/.bashrc, ~/.zshrc veya ~/.bash_profile'a ekle

# macOS/Linux
export JAVA_HOME=/usr/libexec/java_home -v 11
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
```

## Adım 2: Proje Bağımlılıklarını Yükle

```bash
# Proje klasöründe
pnpm install

# TypeScript kontrolü
pnpm typecheck
```

## Adım 3: Production Build'i Yap

```bash
# React SPA'sını build et (dist/spa klasörüne)
pnpm build:client

# Not: Server kısmı native APK'da kullanılmayacaktır
```

## Adım 4: Capacitor'u Başlat

### 4.1 İlk kez (Android projesi yoksa)
```bash
# Android projesini ekle
pnpm cap:add:android

# Bunu yapılacak:
# - android/ klasörü oluşturur
# - Android Studio projesi kurulumu
# - Gerekli izinleri AndroidManifest.xml'e ekler
```

### 4.2 Var olan projeyi güncelle
```bash
# Web dosyalarını Android projesine senkronize et
pnpm cap:sync
```

## Adım 5: Android Projesini Aç

```bash
# Android Studio'da aç (otomatik kurulum)
pnpm cap:open:android

# veya manuel
open android/
```

## Adım 6: APK Yapı (İki Yöntem)

### Yöntem A: Android Studio Kullanarak (Kolay)

1. Android Studio'da `android/` klasörünü aç
2. Menüden: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
3. Çıktı konumu: `android/app/release/app-release.apk`

### Yöntem B: Komut Satırından (Gradle)

```bash
# Debug APK (test için hızlı)
cd android/
./gradlew assembleDebug
# Çıktı: app/build/outputs/apk/debug/app-debug.apk

# Release APK (Play Store'a göndermek için)
./gradlew assembleRelease
# Çıktı: app/build/outputs/apk/release/app-release.apk

# veya Capacitor CLI ile
pnpm cap:build:android
```

## Adım 7: İzinleri Yapılandır

Android projesi `android/app/src/main/AndroidManifest.xml`'de aşağıdaki izinleri otomatik ekler:

```xml
<!-- GPS konum izni -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- İnternet izni -->
<uses-permission android:name="android.permission.INTERNET" />
```

**Runtime İzinleri** (Android 6.0+): Uygulama çalışırken izin isteme işleri zaten kodda tanımlıdır.

## Adım 8: Cihazda Çalıştır

### Gerçek Cihaz Kullanarak

```bash
# USB üzerinden cihazı bağla ve debug modunu aç
# Sonra:
pnpm cap:run:android

# veya Android Studio'dan Run butonuna tıkla
```

### Emülatör Kullanarak

```bash
# Android Studio'da: Tools → Device Manager → Emülatör Oluştur
# Emülatörü başlat
# Sonra:
pnpm cap:run:android
```

## Adım 9: APK'yı Cihaza Yükleme

```bash
# USB Debugging açık olmalı
adb install app-release.apk

# Eğer var olan uygulamayı güncelle
adb install -r app-release.apk

# Cihaz listesi
adb devices

# Belirli cihaza yükle
adb -s DEVICE_ID install app-release.apk
```

## Adım 10: Üretim İçin Play Store'a Hazırlık

### 10.1 Signing Sertifikası Oluştur
```bash
# Yeni keystore oluştur (bir kez)
keytool -genkey -v -keystore archaeoscanner-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias archaeoscanner

# Bu dosyayı güvenli bir yerde sakla
```

### 10.2 Build Properties'i Güncelle
`android/gradle.properties` veya `build.gradle` dosyasını düzenle:

```gradle
android {
  signingConfigs {
    release {
      storeFile file("../archaeoscanner-key.jks")
      storePassword = "your_store_password"
      keyAlias = "archaeoscanner"
      keyPassword = "your_key_password"
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}
```

### 10.3 Signed APK Yap
```bash
cd android/
./gradlew assembleRelease
# Çıktı: app/build/outputs/apk/release/app-release.apk
```

## Sorun Giderme

### "Android SDK bulunamadı"
```bash
# ANDROID_HOME'ı kontrol et
echo $ANDROID_HOME

# Android Studio SDK Manager'dan platform tools indir
```

### "Java Home bulunamadı"
```bash
# JAVA_HOME'ı kontrol et
echo $JAVA_HOME

# macOS'te otomatik bulma
/usr/libexec/java_home -v 11
```

### "Gradle build başarısız"
```bash
# Gradle cache'i temizle
cd android/
./gradlew clean
./gradlew assembleDebug

# veya
cd android/
rm -rf .gradle build
./gradlew assembleDebug
```

### "Cihaz bulunamadı"
```bash
# USB debugging açılmış mı kontrol et (Ayarlar → Geliştirici Seçenekleri)
adb kill-server
adb start-server
adb devices
```

### GPS / İnternet Bağlantısı İçin
- Gerçek cihazda GPS açık olduğundan emin ol
- Mobil verisi veya WiFi bağlantısı test et
- Emülatörde "Extended controls"dan GPS/Network simülasyonu aç

## Versiyon Güncelleme

Uygulamanın sürümünü güncelle:

1. `android/app/build.gradle` içinde `versionCode` ve `versionName`'i artır
2. `package.json` içinde `version` güncelle
3. `capacitor.config.ts` içinde `appVersion` güncelle

## Düşük Boyut İçin Optimizasyon

```bash
# Build sırasında
pnpm build:client

# AndroidManifest.xml'de network config ekle
# Çok büyük dosyaları split APK ile dağıt
```

## Kaynaklar

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Geolocation Plugin](https://capacitorjs.com/docs/apis/geolocation)
- [Google Play Console](https://play.google.com/console)
- [Android Studio Guide](https://developer.android.com/studio)

## Notlar

- **İnternet Bağlantısı**: Uygulama internete bağlanınca aktif olur
- **Konum Doğruluğu**: GPS doğruluğu 5-50 metre arasında değişebilir
- **Gerçek Veri**: Tarama başladığında NOAA, USGS, UNESCO API'lerinden gerçek veriler çekilir
- **Offline Mod**: Şu anda offline mod desteklenmiyor (geliştirilecek)

## Çıkış Dosyası

Final APK dosyası:
```
android/app/release/app-release.apk
```

Bu dosyayı:
- Doğrudan cihaza yükleme (`adb install`)
- Google Play Store'a yükleme
- Dağıtım için paylaş
