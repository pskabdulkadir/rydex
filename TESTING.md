# 🧪 Magnetometer Uygulaması - Test Senaryoları

## 📋 Test Planı

### 1. **Başlangıç Testleri**

#### Test 1.1: Ana Sayfa Yükleme
- **Adım**: Uygulamayı açın
- **Beklenen Sonuç**: Ana sayfa yüklenecek, "Görüntüleme Sistemi" başlığı ve 4 buton (Maceraya Başla, Haritayı İncele, Magnetometer) görülecek
- **Status**: ✅ PASS/❌ FAIL

#### Test 1.2: Magnetometer Sayfasına Erişim
- **Adım**: Ana sayfada "Magnetometer" butonuna tıklayın
- **Beklenen Sonuç**: Magnetometer ana ekranı yüklenecek, yasal disclaimer gösterilecek
- **Status**: ✅ PASS/❌ FAIL

### 2. **Sensör ve Kalibrasyon Testleri**

#### Test 2.1: Ölçüm Başlatma
- **Adım**: "BAŞLAT" butonuna tıklayın
- **Beklenen Sonuç**: 
  - X, Y, Z değerleri güncellemeye başlamalı
  - Toplam µT değeri gösterilmeli
  - Trend analizi başlamalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 2.2: Kalibrasyon Yapılması
- **Adım**: Ölçüm çalışırken "Kalibrasyon Yap" butonuna tıklayın
- **Beklenen Sonuç**:
  - Progress bar gösterilmeli
  - 100% tamamlandığında başlangıç değeri kaydedilmeli
  - "✅ Kalibrasyon Tamamlandı" mesajı gösterilmeli
- **Status**: ✅ PASS/❌ FAIL

#### Test 2.3: Ölçüm Durdurma
- **Adım**: Başlatılan ölçümü "DURDUR" butonuna tıklayarak durdurun
- **Beklenen Sonuç**: Ölçüm verileri güncellenmeyi durdurmalı
- **Status**: ✅ PASS/❌ FAIL

### 3. **Uyarı Sistemi Testleri**

#### Test 3.1: Eşik Değer Ayarı
- **Adım**: Slider ile eşiği 80 µT olarak ayarlayın, ölçümü başlatın
- **Beklenen Sonuç**:
  - Eşik değeri görsel olarak güncellenecek
  - Ölçüm değeri eşiği aştığında uyarı tetiklenecek
- **Status**: ✅ PASS/❌ FAIL

#### Test 3.2: Sesli Uyarı
- **Adım**: Eşiki 50 µT'ye ayarlayın, ölçümü başlatın
- **Beklenen Sonuç**: Değer 50 µT'yi aştığında ses duyulmalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 3.3: Titreşim Uyarısı
- **Adım**: Mobil tarayıcıda eşiği 50 µT'ye ayarlayın
- **Beklenen Sonuç**: Değer eşiği aştığında cihaz titreşmeli
- **Status**: ✅ PASS/❌ FAIL

### 4. **Grafik Testleri**

#### Test 4.1: Grafik Sayfasına Erişim
- **Adım**: "Grafik" sekmesinden grafik sayfasına gidin
- **Beklenen Sonuç**: Grafik sayfası yüklenecek
- **Status**: ✅ PASS/❌ FAIL

#### Test 4.2: Canlı Grafik Güncelleme
- **Adım**: Grafik sayfasında "BAŞLAT" butonuna tıklayın
- **Beklenen Sonuç**:
  - Manyetik alan grafiği canlı olarak güncellenmeli
  - 100 veri noktasına kadar saklanmalı
  - İstatistikler (Ort., Max, Min) doğru hesaplanmalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 4.3: XYZ Grafikleri
- **Adım**: Grafik sayfasında XYZ eksenlerini gözlemleyin
- **Beklenen Sonuç**:
  - 3 farklı renkte (Kırmızı, Yeşil, Mavi) çizgiler gösterilmeli
  - Her biri canlı güncellenmeli
- **Status**: ✅ PASS/❌ FAIL

### 5. **Hazine Tespit Testleri**

#### Test 5.1: Kaynak Tespiti
- **Adım**: Detections sayfasında "BAŞLAT" butonuna tıklayın
- **Beklenen Sonuç**:
  - Anomaliler tespit edilecek
  - Kaynak türüne göre kategorize edilecek
  - Her tespit için güven düzeyi gösterilecek
- **Status**: ✅ PASS/❌ FAIL

#### Test 5.2: Kaynak Kategorileri
- **Adım**: Tespit edilen kaynakları gözlemleyin
- **Beklenen Sonuç**:
  - Hazine (💎) - Şiddet > 120 µT
  - Madeni (⛏️) - Şiddet > 95 µT
  - Değerli Materyal (✨) - Şiddet > 110 µT
  - Yer Altı Yapısı (🏗️) - Şiddet > 80 µT
- **Status**: ✅ PASS/❌ FAIL

#### Test 5.3: Tespitleri Temizleme
- **Adım**: "Temizle" butonuna tıklayın
- **Beklenen Sonuç**: Tüm tespitler silinecek, liste boş olacak
- **Status**: ✅ PASS/❌ FAIL

### 6. **Harita Testleri**

#### Test 6.1: Harita Yükleme
- **Adım**: "Harita" sekmesinde harita sayfasına gidin
- **Beklenen Sonuç**: İnteraktif harita yüklenecek
- **Status**: ✅ PASS/❌ FAIL

#### Test 6.2: Pin Gösterimi
- **Adım**: Haritayı gözlemleyin
- **Beklenen Sonuç**:
  - Tespit edilen kaynaklar renkli pinler olarak görülmeli
  - Her pin başında ilgili emoji olmalı
  - Mavi nokta kullanıcı konumunu göstermeli
- **Status**: ✅ PASS/❌ FAIL

#### Test 6.3: Pin Seçimi ve Detaylar
- **Adım**: Haritadaki bir pin'e tıklayın
- **Beklenen Sonuç**:
  - Pin vurgulanmalı
  - Sayfanın altında tespit detayları gösterilmeli
  - Manyetik şiddet, anomali, güven düzeyi gösterilmeli
- **Status**: ✅ PASS/❌ FAIL

### 7. **Geçmiş ve Dışa Aktarma Testleri**

#### Test 7.1: Geçmiş Kaydı
- **Adım**: Ölçümü başlatın, birkaç dakika bekleyin, History sayfasına gidin
- **Beklenen Sonuç**:
  - Ölçümler tabloda gösterilmeli
  - Tarih/saat doğru olmalı
  - İstatistikler hesaplanmalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 7.2: CSV İndirme
- **Adım**: Geçmiş sayfasında "CSV İndir" butonuna tıklayın
- **Beklenen Sonuç**: CSV dosyası indirilmeli
- **Status**: ✅ PASS/❌ FAIL

#### Test 7.3: Zaman Filtreleme
- **Adım**: "Son Saat" veya "Son 24 Saat" butonlarına tıklayın
- **Beklenen Sonuç**: İstatistikler filtrelenecek, uygun kayıtlar gösterilecek
- **Status**: ✅ PASS/❌ FAIL

### 8. **Performans Testleri**

#### Test 8.1: Bellek Kullanımı
- **Test**: 10 dakika sürekli ölçüm yapın
- **Beklenen Sonuç**:
  - Uygulamada donma/yavaşlama olmamali
  - Grafik düzgün çalışmalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 8.2: Veri Noktası Limiti
- **Test**: Grafik sayfasında 100+ veri noktası oluşturulmak için test edin
- **Beklenen Sonuç**:
  - 100 noktanın üzerinde tutulan eski veri silinmeli
  - Performans korunmalı
- **Status**: ✅ PASS/❌ FAIL

### 9. **Uyumluluk Testleri**

#### Test 9.1: Tarayıcı Uyumluluğu
- **Test Tarayıcıları**:
  - Chrome/Chromium (Desktop)
  - Firefox (Desktop)
  - Safari (Desktop)
  - Chrome Mobile
  - Safari Mobile (iOS)
- **Beklenen Sonuç**: Tüm tarayıcılarda düzgün çalışmalı
- **Status**: ✅ PASS/❌ FAIL

#### Test 9.2: Mobil Responsive
- **Test**: Mobil cihazda veya tarayıcı zoom'unda test edin
- **Beklenen Sonuç**: Düzen mobil ekrana uyarlanmalı
- **Status**: ✅ PASS/❌ FAIL

## 🎯 Test Sonuçları Özeti

| Test Kategorisi | Pass | Fail | Not Tested |
|-----------------|------|------|-----------|
| Başlangıç | ? | ? | ? |
| Sensör/Kalibrasyon | ? | ? | ? |
| Uyarı Sistemi | ? | ? | ? |
| Grafik | ? | ? | ? |
| Hazine Tespit | ? | ? | ? |
| Harita | ? | ? | ? |
| Geçmiş | ? | ? | ? |
| Performans | ? | ? | ? |
| Uyumluluk | ? | ? | ? |

## 🚀 Performans Kuralları

1. **Sensör Örnekleme**: 500ms aralıkla (sistem yükünü düşürmek için)
2. **Grafik Veri Noktası**: Maksimum 100 tutulmalı
3. **Tespitler**: Maksimum 1000 tutulmalı (eski silinecek)
4. **Kalibrasyon**: ~5 saniyede tamamlanmalı

## 📝 Notlar

- LocalStorage'ta saklanan veriler tarayıcı kapatılsa da korunur
- Ses uyarıları tarayıcı sessiz modunda tetiklenmez
- Titreşim özelliği Web Vibration API destekleyen cihazlarda çalışır
