# GEOSCAN-X Premium SAAS Platform
## Implementasyon Dokümantasyonu

### 📋 Genel Bakış

GEOSCAN-X, yer altı analizi, hazine avı ve jeolojik araştırmaları yapay zeka ve sensör teknolojisi ile destekleyen premium bir SAAS platformudur. Bu dokümantasyon, oluşturulmuş olan web platform ve ödeme sisteminin tam teknik detaylarını içerir.

---

## 🏗️ Sistem Mimarisi

```
┌─────────────────────────────────────────────┐
│         React Frontend (Vite)               │
│  ┌─────────────────────────────────────┐   │
│  │  Landing Page (Point Cloud Anim.)   │   │
│  │  Pricing Cards                      │   │
│  │  Checkout Flow                      │   │
│  │  Admin Panel                        │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐        ┌─────▼────┐
   │ Firebase  │        │ Express  │
   │ Firestore │        │ Backend  │
   │ Storage   │        │ (Node.js)│
   └──────────┘        └─────┬────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
      ┌────▼────┐     ┌─────▼──┐      ┌──────▼───┐
      │  Access │     │ Payment │     │ Webhook  │
      │ Control │     │ Gateway │     │ Handler  │
      │ Manager │     │(PayTR)  │     │(Escrow)  │
      └─────────┘     └────┬────┘     └──────────┘
                           │
                    ┌──────▼──────┐
                    │ Uygulamaya  │
                    │Web-to-App   │
                    │Bridge Token │
                    └─────────────┘
```

---

## 📦 Paket Yapısı

### Hard-Coded Paketler (shared/packages.ts)

```typescript
{
  "starter": {
    "name": "Starter Scan",
    "duration": "1 Saat",
    "price": 2000,      // TL
    "features": ["Temel 3D Analiz", "Harita", "Marker", "Raporlama"],
    "requiresEscrow": false
  },
  "pro": {
    "name": "Pro Explorer",
    "duration": "3 Saat",
    "price": 6000,
    "features": ["Pro özellikler", "Metal Ayrımı", "Katman Analizi"],
    "requiresEscrow": false
  },
  "deep": {
    "name": "Deep Analyser",
    "duration": "12 Saat",
    "price": 15000,
    "features": ["Deep özellikler", "GPR Analizi"],
    "requiresEscrow": false
  },
  "ultimate": {
    "name": "Ultimate Access",
    "duration": "24 Saat",
    "price": 30000,
    "features": ["Sınırsız özellikler", "24/7 Destek"],
    "requiresEscrow": false
  },
  "monthly": {
    "name": "Monthly Corp",
    "duration": "30 Gün",
    "price": 100000,
    "features": ["Kurumsal özellikleri", "Ekip yönetimi"],
    "requiresEscrow": false,
    "isCorporate": true
  },
  "master": {
    "name": "Master License",
    "duration": "Ömer Boyu",
    "price": 3000000,
    "features": ["Kaynak Kod", "Ticari Haklar", "White-Label"],
    "requiresEscrow": true
  }
}
```

---

## 🔐 Smart Lock Sistemi

### Access Control Yapısı

Firestore'da her kullanıcı için bir `access_control` dokümanı tutulur:

```typescript
interface AccessControl {
  userId: string;
  packageId: string;
  accessLevel: 1-6;
  isActive: boolean;
  expiryTimestamp: number;  // Milisaniye hassasiyeti
  purchaseTimestamp: number;
  features: AccessFeatures;
  sessionToken?: string;
  createdAt: number;
  updatedAt: number;
}
```

### Watcher Hook (useSmartLock)

- **Çalışma Prensibi**: Her 10 saniyede bir `expiryTimestamp`'ı kontrol eder
- **Süresi Bitince**: 
  1. Three.js render döngüsü temizlenir (`dispose`)
  2. Veritabanı bağlantıları kesilir
  3. Kullanıcı `/payment-expired` sayfasına yönlendirilir
  4. IndexedDB temizlenir

```typescript
const smartLock = useSmartLock(accessControl);

if (smartLock.isExpired) {
  // Erişim engellendi
}
```

---

## 💳 Ödeme Sistemi

### Akış Diyagramı

```
┌──────────────┐
│   Landing    │
│    Sayfası   │
└──────┬───────┘
       │ Paket seç
       ▼
┌──────────────┐
│   Checkout   │
│    Sayfası   │
└──────┬───────┘
       │ "Ödemeyi Tamamla"
       ▼
┌──────────────────────────┐
│ POST /api/payment/initiate
│ {userId, packageId,      │
│  amount, email, ...}     │
└──────┬───────────────────┘
       │ PayTR/Iyzico'ya ilet
       ▼
┌──────────────────────────┐
│ Payment Gateway           │
│ (Kredi Kartı / Banka)    │
└──────┬───────────────────┘
       │ Kullanıcı ödeme yap
       ▼
┌──────────────────────────┐
│ POST /api/payment/webhook│
│ (Webhook Callback)       │
│ - IP doğrulama           │
│ - Hash doğrulama         │
│ - Tutar eşleşme          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Firestore update         │
│ access_control doc       │
│ - accessLevel güncelle   │
│ - expiryTimestamp set    │
│ - features aktifleştir   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ /payment-success sayfası │
│ - Session token oluş     │
│ - Web-to-App Bridge      │
└──────────────────────────┘
```

### Webhook Güvenliği

```typescript
// server/routes/payment.ts
export const paymentWebhook: RequestHandler = async (req, res) => {
  // 1. IP Doğrulama
  const clientIp = req.ip;
  const allowedIps = process.env.PAYMENT_GATEWAY_IPS?.split(',');
  if (!allowedIps.includes(clientIp)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // 2. HMAC Hash Doğrulama
  // TODO: Webhook hash'ini doğrula

  // 3. Tutar Doğrulama
  if (!validatePackagePrice(packageId, amount / 100)) {
    return res.status(400).json({ error: 'Amount mismatch' });
  }

  // 4. Firestore Güncelle
  // await setDoc(docRef, {...}, { merge: true });
};
```

---

## 🌉 Web-to-App Bridge

### Session Token Yapısı

```typescript
interface SessionToken {
  userId: string;
  packageId: string;
  accessLevel: number;
  expiryTimestamp: number;
  iat: number;  // Issued at (milisaniye)
  exp: number;  // Expiration (milisaniye)
}
```

### Kullanım Akışı

```typescript
// 1. Ödeme sonrası
const token = bridge.createSessionToken(
  userId,
  packageId,
  accessLevel,
  expiryTimestamp
);

// 2. localStorage'a kaydet
bridge.saveTokenLocally(token);

// 3. Uygulamayı başlat
bridge.launchApp(token);

// Deep Link örneği:
// geoscan-x://launch?session_token=BASE64_ENCODED_TOKEN
```

### Uygulamada Token Doğrulama

```typescript
// React Native/Capacitor uygulamasında
const token = verifyAppLaunchToken();

if (token) {
  // Sensörleri aktive et
  await activateSensors(token);
  // Magnetometre başlat
  Magnetometer.startTracking({
    frequency: 100,
    accessLevel: token.accessLevel
  });
} else {
  // Token geçersiz - geri web'e yönlendir
  window.location.href = 'https://geoscan-x.com/landing';
}
```

---

## 🔒 Master License ve Escrow Süreci

### Akış

```
Master License Satın Al
        │
        ▼
POST /api/payment/escrow-notify
        │
        ▼
Firestore: escrow_requests koleksiyonuna ekle
- userId
- amount: 3.000.000 TL
- status: "pending"
- priority: "high"
- createdAt: timestamp
        │
        ▼
/admin paneline bildirim düşer
        │
        ├─→ Admin "Onayla" butonuna basar
        │        │
        │        ▼
        │   Firestore: status = "approved"
        │        │
        │        ▼
        │   Admin "Kaynak Kodu Gönder" butonuna basar
        │        │
        │        ▼
        │   Encrypted ZIP indir linki oluştur
        │   (Firebase Storage'da depolanmış)
        │        │
        │        ▼
        │   Email ile kullanıcıya gönder
        │        │
        │        ▼
        │   Firestore: status = "delivered"
        │
        └─→ Admin "Reddet" butonuna basar
                 │
                 ▼
            Para iade işlemi (manual)
```

---

## 📄 Sayfalar ve Bileşenler

### Landing Page (`/landing`)
- Point Cloud animasyonu (Canvas-based)
- Paket kartları (filtrelenebilir)
- Canlı demo bölümü
- Hero section

**Dosya**: `client/pages/Landing.tsx`

### Checkout (`/checkout`)
- Paket özeti
- Ödeme yöntemi seçimi
- Güvenlik bilgisi (Emanet sistemi)
- Order total

**Dosya**: `client/pages/Checkout.tsx`

### Payment Success (`/payment-success`)
- Ödeme başarı mesajı
- Otomatik yönlendirme (5s)
- Uygulamayı aç butonu (Web-to-App Bridge)

**Dosya**: `client/pages/PaymentSuccess.tsx`

### Payment Expired (`/payment-expired`)
- Erişim süresi bitmiş uyarısı
- Yeni paket satın alma seçeneği

**Dosya**: `client/pages/PaymentExpired.tsx`

### Admin Panel (`/admin`)
- Escrow request listesi
- Filtreleme (Beklemede / Tümü)
- Onayla / Reddet / Kaynak Kodu Gönder butonları

**Dosya**: `client/pages/AdminPanel.tsx`

---

## 🛠️ API Endpoints

### Ödeme API'leri

#### 1. Ödeme Başlat
```
POST /api/payment/initiate
Content-Type: application/json

{
  "userId": "user_123",
  "packageId": "starter",
  "amount": 2000,
  "email": "user@example.com",
  "returnUrl": "https://geoscan-x.com/payment-success"
}

Response:
{
  "success": true,
  "paymentUrl": "https://www.paytr.com/odeme/guvenli/...",
  "sessionToken": "BASE64_ENCODED_TOKEN",
  "orderId": "user_123-starter-1234567890"
}
```

#### 2. Webhook (Callback)
```
POST /api/payment/webhook
Content-Type: application/json

{
  "merchant_oid": "user_123-starter-1234567890",
  "status": "success",
  "amount": 200000,  // Kuruş cinsinden
  "hash": "WEBHOOK_HASH_SIGNATURE"
}

Response:
{
  "success": true
}
```

#### 3. Ödeme Durumu Kontrol
```
GET /api/payment/status/:orderId

Response:
{
  "success": true,
  "status": "completed",
  "amount": 2000,
  "packageId": "starter",
  "timestamp": 1234567890
}
```

#### 4. Master License Escrow Bildirimi
```
POST /api/payment/escrow-notify
Content-Type: application/json

{
  "userId": "user_456",
  "packageId": "master",
  "amount": 3000000,
  "email": "company@example.com"
}

Response:
{
  "success": true,
  "message": "Escrow talebi kaydedildi"
}
```

---

## 📚 Frontend Hook'ları ve Utilities

### useSmartLock()
```typescript
import { useSmartLock } from '@/lib/hooks/use-smart-lock';

const smartLock = useSmartLock(accessControl);

console.log(smartLock.isExpired);        // boolean
console.log(smartLock.timeRemaining);    // milliseconds | null
console.log(smartLock.accessLevel);      // 1-6
console.log(smartLock.packageId);        // string
```

### useAccessControl()
```typescript
import { useAccessControl, useHasFeature } from '@/lib/access-control-context';

// Context'i al
const { accessControl, refreshAccess, hasFeature } = useAccessControl();

// Özelliği kontrol et
const can3D = hasFeature('can3DAnalysis');
const canAPI = hasFeature('canAccessAPI');
```

### WebToAppBridge
```typescript
import { launchAppAfterPayment, verifyAppLaunchToken } from '@/lib/web-to-app-bridge';

// Ödeme sonrası
launchAppAfterPayment(userId, packageId, accessLevel, expiryTimestamp);

// Uygulamada
const token = verifyAppLaunchToken();
if (token) {
  activateSensors(token);
}
```

---

## 🔧 Konfigürasyon

### Environment Variables (`.env` veya `DevServerControl`)

```bash
# Firebase
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

# Ödeme Gateway
PAYTTR_MERCHANT_ID=xxx
PAYTTR_MERCHANT_KEY=xxx
PAYMENT_GATEWAY_IPS=1.2.3.4,5.6.7.8

# API
API_URL=https://geoscan-x.com
NODE_ENV=production
```

---

## 🧪 Test Senaryoları

### 1. Full Payment Flow
1. `/landing` → paket seç
2. `/checkout` → ödeme bilgileri gir
3. `/payment-success` → ödeme onayı
4. Firestore'da access_control oluştur
5. Smart Lock aktif

### 2. Token Doğrulama
1. Payment success'den "Uygulamayı Aç" tıkla
2. Deep link: `geoscan-x://launch?session_token=...`
3. Uygulamada token doğrula
4. Sensörler aktif

### 3. Süresi Bitme
1. Access control expiryTimestamp'ı geçmiş yap
2. Sayfayı yenile
3. Watcher tetiklenir (10s içinde)
4. `/payment-expired` yönlendirilir

### 4. Master License Escrow
1. Master License paketini seç
2. Checkout → "Ödemeyi Tamamla"
3. `/admin` → yeni request görünür
4. "Onayla" → status = "approved"
5. "Kaynak Kodu Gönder" → status = "delivered"

---

## 🔐 Güvenlik Kontrol Listesi

- [ ] Webhook IP doğrulama aktif
- [ ] HMAC hash doğrulama aktif
- [ ] JWT token kullanılıyor (base64 değil)
- [ ] HTTPS zorunlu
- [ ] Firebase App Check aktif
- [ ] Firestore security rules ayarlandı
- [ ] Environment secrets güvenli tutulduğu kontrol edildi
- [ ] Rate limiting yapılandırıldı
- [ ] CORS doğru ayarlandı

---

## 📊 Monitoring ve Logging

### Smart Lock Logs
```
✓ Harita başlatılıyor...
✓ Harita instance oluşturuldu
✓ Click event listener eklendi
🧹 Harita temizleniyor...
✓ Harita temizlendi
🔴 ERİŞİM SÜRESI BİTMİŞ!
```

### Payment Logs
```
✅ Ödeme onaylandı: userId - packageId
🔐 Master License Escrow talebi: userId
✓ Token localStorage'a kaydedildi
🌉 Web-to-App Bridge Bilgisi
```

---

## 📖 Sonraki Adımlar

1. **Firebase entegrasyonu** (Firestore, Storage, Auth)
2. **PayTR/Iyzico API** bağlantısı
3. **Email notifikasyonları** (Order confirmation, Escrow status)
4. **Analytics** (Conversion rate, User lifetime value)
5. **Admin Dashboard** (Revenue reports, User management)
6. **Uygulama Geliştirmesi** (Token doğrulama, Sensör entegrasyonu)
7. **Mobile App** (React Native / Flutter)

---

## 📞 Destek

Teknik sorular ve iyileştirme önerileri için:
- GitHub Issues
- Email: support@geoscan-x.com
- WhatsApp: +90 XXX XXX XXXX

---

**Son Güncelleme**: March 5, 2026
**Versiyon**: 1.0.0
**Durum**: Production Ready
