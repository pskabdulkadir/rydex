# 🧪 Sistem Entegrasyon Testi ve Kontrol Listesi

## 📋 Test Adımları

### 1️⃣ Payment Verification Service Test

#### Test 1.1: Payment Record Oluşturma
```typescript
// browser console'da test et:

import { createPaymentRecord } from '@/lib/payment-verification';

const record = createPaymentRecord('user123', 'pro', 2500, 'credit-card');
console.log('✅ Payment record oluşturuldu:', record);

// Beklemeler:
// - record.id != null
// - record.status === 'pending'
// - record.amount === 2500
```

#### Test 1.2: Payment Verification
```typescript
import { verifyPayment, getActiveSubscription } from '@/lib/payment-verification';

const result = verifyPayment(record.id, 'user123');
console.log('✅ Payment doğrulandı:', result);

// Beklemeler:
// - result.success === true
// - result.subscription != null
// - result.subscription.plan === 'pro'
```

#### Test 1.3: Active Subscription Kontrolü
```typescript
const sub = getActiveSubscription();
console.log('✅ Aktif subscription:', sub);

// Beklemeler:
// - sub.daysRemaining > 0
// - sub.endDate > Date.now()
```

---

### 2️⃣ Checkout Sayfası Testi

#### Test 2.1: Paket Seçim
1. `http://localhost:8080/rydex` sayfasına git
2. "Paketleri Keşfet" veya "Fiyatlandırma" seç
3. Herhangi bir paket seç (örn. "Pro")
4. "Seç" butonuna tıkla
5. Checkout sayfasına yönlendirilmelisin

#### Test 2.2: Ödeme İşlemi (Mock)
1. Checkout sayfasında "Siparişi Tamamla" görüntüleme
2. Ödeme yöntemi seç (Kredi Kartı veya Banka Transferi)
3. Bilgileri doldur:
   - **Kredi Kartı**: 
     - Ad: Test User
     - Kart No: 4532123456789010
     - Tarih: 12/25
     - CVV: 123
4. "Ödemeyi Tamamla" butonuna tıkla
5. **Bekleme**: Payment Success sayfasına yönlendirilmelisin

#### Test 2.3: Payment Success Sayfası
1. Success sayfasında "Ödeme Başarılı!" başlığını görmelisin
2. "Uygulamayı Aç" butonuna tıkla
3. Ana uygulamaya yönlendirilmelisin (/)

---

### 3️⃣ MemberPanel Testi (UseApp Bileşeni)

#### Test 3.1: Login ve Panel Erişimi
1. `http://localhost:8080/member-login` sayfasına git
2. Kullanıcı giriş yap (veya önceki ödemeleri kontrol et)
3. Üye Paneli'ne yönlendirilmelisin
4. Genel Bakış tab'ında **UseApp bileşeni** görülmelidir

#### Test 3.2: UseApp Bileşeni Görünümü
Üye Panelinde şunları kontrol et:

**Başlık**:
```
🎉 Uygulamayı Kullan
Satın aldığınız paketi hemen kullanmaya başlayabilirsiniz.
```

**Paket Detayları**:
- ✅ Plan adı gösterilmeli (Pro, Ultimate vb.)
- ✅ Ödenen tutar gösterilmeli (₺ cinsinden)
- ✅ Kalan gün gösterilmeli (30 gün kaldı vb.)
- ✅ Kullanım süresi progress bar'ı

**Özellikler Listesi**:
- ✅ Sınırsız Tarama
- ✅ Premium Analitikler
- ✅ Öncelikli Destek
- ✅ İleri Raporlar

**Butonlar**:
- ✅ "🚀 Uygulamayı Şimdi Aç" (yeşil, ana buton)
- ✅ "⏱️ Süreyi Uzat" (7 günden az kaldıysa)

#### Test 3.3: Uygulama Açma
1. "🚀 Uygulamayı Şimdi Aç" butonuna tıkla
2. Ana uygulama sayfasına (Scanner) yönlendirilmelisin
3. Sistem başlatma modalı görünmüş olmalı

---

### 4️⃣ Subscription Polling Testi

#### Test 4.1: Real-time Subscription Update
1. MemberPanel açık bırak
2. Başka tab'da `http://localhost:8080/checkout` aç
3. Paket seç ve ödeme gerçekleştir
4. İlk tab'a dön (MemberPanel)
5. **Bekleme**: 5 saniye içinde UseApp bileşeni güncellenmelidir

#### Test 4.2: Toast Notification
Ödeme başarılı olduğunda:
```
✅ Ödemeniz başarıyla doğrulanmıştır!
🚀 Uygulama açılmaya hazırdır. "Uygulamayı Kullan" butonunu tıklayabilirsiniz.
```
Notification'lar ekranda görülmeli

---

### 5️⃣ Admin Panel Testi

#### Test 5.1: Admin Login
1. `http://localhost:8080/admin-login` sayfasına git
2. Admin giriş yap
   - **Email**: admin@example.com
   - **Password**: admin123

#### Test 5.2: Escrow İstekleri Yükleme
1. Admin Panel'de "Genel Bakış" tab'ında olmalısın
2. Escrow İstekleri bölümünde:
   - **Bekleme**: localStorage'dan otomatik yüklenen Escrow istekleri
   - **Beklenecek**: Pending, Approved, Rejected, Delivered istekleri

#### Test 5.3: Escrow İsteği Onaylama
1. Pending durumunda bir Escrow isteği bul
2. Üzerine hover gel
3. "Onayla" butonuna tıkla
4. **Bekleme**: 
   - Status → "Approved"
   - Email gönderildi bildirimi
   - Audit log oluşturuldu

#### Test 5.4: Dekonts (Receipts) Yönetimi
1. "Dekonts" sekmesine git
2. Bekleyen dekontları görmelisin
3. Bir dekont seç
4. "Onayla" veya "Reddet" seçeneklerini test et

---

### 6️⃣ Payment API Endpoints Testi

#### Test 6.1: POST /api/payment/verify
```bash
curl -X POST http://localhost:8080/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "payment_123",
    "userId": "user_123"
  }'
```

**Beklenen Sonuç**:
```json
{
  "success": true,
  "verified": true,
  "message": "Ödeme başarıyla doğrulandı"
}
```

#### Test 6.2: POST /api/payment/initiate
```bash
curl -X POST http://localhost:8080/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "packageId": "pro",
    "amount": 2500,
    "email": "test@example.com"
  }'
```

**Beklenen Sonuç**:
```json
{
  "success": true,
  "sessionToken": "session_xxx",
  "paymentUrl": "..."
}
```

#### Test 6.3: GET /api/payment/status/:orderId
```bash
curl -X GET http://localhost:8080/api/payment/status/order_123
```

**Beklenen Sonuç**:
```json
{
  "success": true,
  "status": "completed",
  "orderId": "order_123"
}
```

---

### 7️⃣ localStorage Kontrolleri

#### Test 7.1: Payment Records
```typescript
// Browser console'da:
const payments = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
console.log('Payment Records:', payments);

// Bekleme:
// - Her ödemenin id, userId, packageId, status, createdAt olmalı
```

#### Test 7.2: Subscription
```typescript
const subscription = JSON.parse(localStorage.getItem('subscription') || 'null');
console.log('Subscription:', subscription);

// Bekleme:
// - plan, amount, startDate, endDate, daysRemaining
// - endDate > Date.now() (geçerli)
```

#### Test 7.3: Escrow Requests
```typescript
const escrows = JSON.parse(localStorage.getItem('escrowRequests') || '[]');
console.log('Escrow Requests:', escrows);

// Bekleme:
// - Her isteğin id, userId, email, amount, status, createdAt olmalı
```

---

## ✅ Kontrol Listesi

### Ödeme Akışı
- [ ] Paket seçimi çalışıyor
- [ ] Checkout sayfası açılıyor
- [ ] Ödeme bilgileri doğrulanıyor
- [ ] Payment record oluşturuluyor
- [ ] Ödeme doğrulanıyor
- [ ] Subscription oluşturuluyor
- [ ] Payment Success sayfası gösteriliyorbez

### UseApp Bileşeni
- [ ] MemberPanel'de görüntüleniyor
- [ ] Subscription bilgisi doğru
- [ ] Kalan gün sayısı güncelleniyorbez
- [ ] Progress bar'ı çalışıyor
- [ ] "Uygulamayı Aç" butonu aktif
- [ ] "Süreyi Uzat" butonu gösteriliyorbez (gerekirse)

### Admin Panel
- [ ] Admin giriş yapabiliyor
- [ ] Escrow istekleri yükleniyor (localStorage'dan)
- [ ] Onay/Red işlemleri çalışıyor
- [ ] Email notifications gönderiliyor
- [ ] Audit logs oluşturuluyor

### API Endpoints
- [ ] /api/payment/verify çalışıyor
- [ ] /api/payment/initiate çalışıyor
- [ ] /api/payment/status/:orderId çalışıyor
- [ ] /api/payment/refund çalışıyor

### localStorage Senkronizasyonu
- [ ] Payment records kaydediliyor
- [ ] Subscription güncelleniyor
- [ ] Escrow requests senkronize oluyor
- [ ] Veritabanı ile eşzamanlı (gerçek sistem)

---

## 🔍 Debug Mode

Browser console'da debug için:
```typescript
// Payment verification detaylı log
localStorage.setItem('DEBUG_PAYMENT', 'true');

// Subscription bilgisi kontrol et
JSON.parse(localStorage.getItem('subscription'));

// Tüm payment records
JSON.parse(localStorage.getItem('paymentRecords'));

// Tüm escrow requests
JSON.parse(localStorage.getItem('escrowRequests'));
```

---

## 🚀 Canlı Test Senaryosu

### Senaryo: Yeni Kullanıcı Ödeme Yaptıktan Sonra Uygulamaya Erişim

1. **Kayıt**: Yeni kullanıcı olarak kayıt ol
2. **Landing**: Paket seç (örn. Pro)
3. **Register**: Üyelik bilgilerini doldur
4. **Checkout**: Ödeme yap
5. **Success**: Başarılı sayfasında başarı görmeli
6. **Member Panel**: Giriş yap → UseApp görülmeli
7. **App Access**: "Uygulamayı Aç" → Ana uygulamaya erişmeli
8. **Admin**: Admin Panel'de Escrow onayı → Email gönderilmeli

---

## 📞 Test Sonuçlarını Bildir

Eğer test sırasında sorun bulursan:

1. Console hatasını kaydet (`F12` → Console)
2. Screenshot al
3. Hangi adımda hata olduğunu not et
4. WhatsApp: +90 542 578 37 48
5. Email: info@geoscan-x.com

---

**Durum**: ✅ Hazır Test  
**Versiyon**: 1.0  
**Son Güncelleme**: 2024
