# Ödeme Sistemi - Tam Entegrasyon Kılavuzu

## 📋 İçerik

1. [Sistem Mimarisi](#sistem-mimarisi)
2. [Bileşenler](#bileşenler)
3. [Akış Diyagramları](#akış-diyagramları)
4. [Kullanıcı Akışı](#kullanıcı-akışı)
5. [Admin Akışı](#admin-akışı)
6. [API Endpoints](#api-endpoints)
7. [Hata Yönetimi](#hata-yönetimi)
8. [Testing](#testing)
9. [Sorun Çözme](#sorun-çözme)

---

## Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
├─────────────────────────────────────────────────────────────┤
│
│  ┌──────────────────────────────────────────────────────┐
│  │  Checkout Sayfası (Checkout.tsx)                     │
│  │  - Paket seçimi                                      │
│  │  - Ödeme yöntemi (Kredi kartı / Banka transferi)    │
│  │  - Payment Verification Service entegrasyonu        │
│  └──────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │  Üye Paneli (MemberPanel.tsx)                        │
│  │  - Aktif subscription gösterimi                      │
│  │  - UseApp bileşeni (Uygulamayı Kullan)              │
│  │  - Dekont yükleme                                   │
│  └──────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │  Admin Paneli (AdminPanel.tsx)                       │
│  │  - PaymentControlPanel bileşeni                      │
│  │  - Ödeme onayı/red sistemi                          │
│  └──────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │  Payment Verification Service                        │
│  │  (client/lib/payment-verification.ts)               │
│  │                                                      │
│  │  Ana Fonksiyonlar:                                   │
│  │  - createPaymentRecord()                             │
│  │  - verifyPayment()                                   │
│  │  - approvePayment()                                  │
│  │  - rejectPayment()                                   │
│  │  - getActiveSubscription()                           │
│  │  - hasAppAccess()                                    │
│  │  - getUserPayments()                                 │
│  │  - getPendingPaymentCount()                          │
│  │  - getPaymentStats()                                 │
│  └──────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │  Subscription Status Hook                            │
│  │  (client/lib/hooks/useSubscriptionStatus.ts)        │
│  │                                                      │
│  │  Fonksiyonlar:                                       │
│  │  - useSubscriptionStatus()                           │
│  │  - useAutoOpenOnSubscription()                       │
│  │  - useSubscriptionExpiryWarning()                    │
│  └──────────────────────────────────────────────────────┘
│
├─────────────────────────────────────────────────────────────┤
│                   localStorage (Veri Saklama)                │
├─────────────────────────────────────────────────────────────┤
│
│  paymentRecords:    [ {...}, {...}, ... ]
│  subscription:      { userId, plan, endDate, ... }
│  receipts:          [ {...}, {...}, ... ]
│  userId:            "user_123"
│  adminId:           "admin_123"
│
├─────────────────────────────────────────────────────────────┤
│               Backend API (Express.ts)                       │
├─────────────────────────────────────────────────────────────┤
│
│  POST /api/payment/initiate
│  POST /api/payment/verify
│  GET  /api/payment/status/:orderId
│  POST /api/payment/webhook
│  POST /api/payment/refund
│
└─────────────────────────────────────────────────────────────┘
```

---

## Bileşenler

### 1. **Payment Verification Service** (`client/lib/payment-verification.ts`)

Tüm ödeme işlemlerini yönetir.

**Ana Arayüzler:**

```typescript
export interface PaymentRecord {
  id: string;
  userId: string;
  packageId: string;
  amount: number;
  status: 'pending' | 'verified' | 'failed' | 'approved' | 'rejected';
  paymentMethod: 'credit-card' | 'bank-transfer';
  createdAt: number;
  verifiedAt?: number;
  approvedAt?: number;
  rejectedAt?: number;
  expiresAt: number;
  approvedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  subscription?: {
    plan: string;
    amount: number;
    startDate: number;
    endDate: number;
    daysRemaining: number;
  };
}
```

**Ana Fonksiyonlar:**

| Fonksiyon | Açıklama |
|-----------|----------|
| `createPaymentRecord()` | Yeni ödeme kaydı oluştur |
| `verifyPayment()` | Ödemeyi doğrula ve subscription oluştur |
| `approvePayment()` | Admin tarafından ödemeyi onayla |
| `rejectPayment()` | Admin tarafından ödemeyi reddet |
| `getActiveSubscription()` | Aktif subscription al |
| `hasAppAccess()` | Uygulama erişim kontrolü |
| `getUserPayments()` | Kullanıcıya ait ödeme kayıtları |
| `getPendingPaymentCount()` | Beklemede olan ödeme sayısı |
| `getPaymentStats()` | Ödeme istatistikleri (son 30 gün) |
| `cleanupOldPaymentRecords()` | Eski ödeme kayıtlarını sil |

### 2. **useSubscriptionStatus Hook** (`client/lib/hooks/useSubscriptionStatus.ts`)

Subscription durumunu dinamik olarak izler.

```typescript
const { isActive, daysRemaining, plan, hasAccess, loading, refresh } = useSubscriptionStatus(userId);
```

### 3. **UseApp Bileşeni** (`client/components/UseApp.tsx`)

Aktif paketini gösterir ve uygulamayı açar.

```typescript
<UseApp userId={user?.id} showExtendButton={true} compact={false} />
```

### 4. **PaymentControlPanel** (`client/components/admin/PaymentControlPanel.tsx`)

Admin için ödeme kontrol sistemi.

- Ödeme kayıtlarını görüntüle
- Ödeme onayı/red işlemleri
- Admin notları ekleme
- Real-time filtering ve arama

---

## Akış Diyagramları

### Ödeme Oluşturma Akışı

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Kullanıcı Checkout sayfasında paket seçer                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. createPaymentRecord() → Ödeme kaydı oluşturulur         │
│    Status: 'pending'                                        │
│    localStorage'a kaydedilir                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. verifyPayment() → Ödeme doğrulanır                      │
│    Status: 'verified' (otomatik kredi kartı) veya          │
│    Status: 'pending' → Admin onayı bekler (Banka transferi)│
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Subscription Oluştur                                      │
│    - Bitiş tarihi hesaplanır                               │
│    - localStorage'a kaydedilir                             │
│    - StartPaymentVerificationPolling() başlatılır          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. UseApp Bileşeni Aktifleşir                              │
│    - Kalan gün gösterilir                                  │
│    - "Uygulamayı Aç" butonu aktifleşir                     │
└─────────────────────────────────────────────────────────────┘
```

### Admin Onayı Akışı

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Kullanıcı banka transferi yoluyla ödeme yapıyor         │
│    Status: 'pending' → Admin onayı bekler                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Admin Paneli → Ödeme Kontrol Sekmesi                    │
│    Beklemede olan ödeme listelenir                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Admin "Onayla" veya "Reddet" Butonuna Tıklar           │
└─────────────────────────────────────────────────────────────┘
                           ↓
         ┌──────────────────────────────────┐
         │                                  │
    ┌────▼────┐                    ┌───────▼──────┐
    │ Onayla   │                    │ Reddet       │
    └────┬────┘                    └───────┬──────┘
         │                                  │
    approvePayment()              rejectPayment()
    Status: 'approved'             Status: 'rejected'
    Subscription oluştur           Red sebebi kaydedilir
         │                                  │
         ▼                                  ▼
    Kullanıcıya bildir             Kullanıcıya bildir
```

---

## Kullanıcı Akışı

### 1. Paket Satın Alma

```typescript
// Step 1: Checkout sayfasına git
navigate('/checkout', { state: { packageId: 'pro' } });

// Step 2: Ödeme bilgilerini gir
const handlePayment = async () => {
  // Ödeme kaydı oluştur
  const paymentRecord = createPaymentRecord(
    userId,
    packageId,
    amount,
    paymentMethod
  );

  // Ödemeyi doğrula
  const result = verifyPayment(paymentRecord.id, userId);
  
  if (result.success) {
    // Subscription aktif, uygulamaya yönlendir
    navigate('/member-panel', { state: { subscription: result.subscription } });
  }
};

// Step 3: Üye Panelinde Aktif Subscription'ı Görüntüle
export default function MemberPanel() {
  const subscriptionStatus = useSubscriptionStatus(user?.id);
  
  return (
    <UseApp userId={user?.id} showExtendButton={true} />
  );
}
```

### 2. Uygulamayı Aç

```typescript
const handleLaunchApp = () => {
  if (!hasAppAccess(userId)) {
    toast.error('Erişim hakkınız bulunmamaktadır');
    return;
  }

  localStorage.setItem('systemInitialized', 'true');
  navigate('/'); // Uygulamanın ana sayfasına git
  toast.success('🚀 Uygulama başlatılıyor...');
};
```

### 3. Dekont Yükleme

```typescript
// Üye Paneli → Dekonts Sekmesi
const handleUploadReceipt = async (file: File) => {
  const receipt = {
    id: `receipt_${Date.now()}`,
    file_name: file.name,
    file_url: base64Data,
    status: 'pending',
    amount: activeSubscription.amount,
    uploaded_at: Date.now()
  };

  // API'ye gönder
  await fetch('/api/receipt/upload', {
    method: 'POST',
    body: JSON.stringify(receipt)
  });

  toast.success('Dekont yüklendi. Onay bekleniyor...');
};
```

---

## Admin Akışı

### 1. Admin Paneline Giriş

```typescript
// AdminPanel.tsx
const [selectedTab, setSelectedTab] = useState('dashboard');

// Ödeme Kontrol sekmesine geç
onClick={() => setSelectedTab('payments')}
```

### 2. Beklemede Ödemeyi Kontrol Et

```typescript
// PaymentControlPanel.tsx
const filteredPayments = payments.filter(p => p.status === 'pending');

filteredPayments.map(payment => (
  <PaymentCard key={payment.id}>
    <Button onClick={() => handleApproveClick(payment)}>Onayla</Button>
    <Button onClick={() => handleRejectClick(payment)}>Reddet</Button>
  </PaymentCard>
));
```

### 3. Ödeme Onayı

```typescript
const handleApprove = async () => {
  const adminId = localStorage.getItem('adminId');
  
  const result = approvePayment(
    selectedPayment.id,
    adminId,
    approvalNotes // Optional admin notes
  );

  if (result.success) {
    // Subscription oluşturuldu
    // Kullanıcı artık uygulamaya erişebilir
    toast.success('✅ Ödeme başarıyla onaylandı!');
    
    // Email gönder (optional)
    // notifyUser(selectedPayment.userId, 'approved');
  }
};
```

---

## API Endpoints

### `POST /api/payment/initiate`

Ödemeyi başlatır ve payment gateway'e yönlendirir.

**Request:**
```json
{
  "userId": "user_123",
  "packageId": "pro",
  "amount": 3000,
  "email": "user@example.com",
  "paymentId": "payment_123",
  "returnUrl": "https://app.com/checkout?success=true"
}
```

**Response:**
```json
{
  "success": true,
  "sessionToken": "session_123",
  "paymentUrl": "https://payment-gateway.com/pay?session=123",
  "paymentId": "payment_123"
}
```

### `POST /api/payment/verify`

Ödeme durumunu doğrula (webhook tarafından çağrılır).

**Request:**
```json
{
  "paymentId": "payment_123",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "paymentId": "payment_123",
  "userId": "user_123"
}
```

### `GET /api/payment/status/:orderId`

Sipariş durumunu kontrol et.

**Response:**
```json
{
  "success": true,
  "status": "completed",
  "orderId": "order_123"
}
```

### `POST /api/payment/webhook`

Payment gateway webhook (Stripe, PayTR, etc.)

**Request:**
```json
{
  "event": "payment.success",
  "data": {
    "paymentId": "payment_123",
    "amount": 3000,
    "currency": "TRY"
  }
}
```

---

## Hata Yönetimi

### Ortak Hata Senaryoları

| Hata | Çözüm |
|------|-------|
| "Ödeme kaydı bulunamadı" | Payment ID'si yanlış veya kayıt silinmiş |
| "Bu ödeme zaten doğrulanmıştır" | Duplikat işlem, refresh edin |
| "Ödeme miktarı paket fiyatı ile uyuşmuyor" | Fiyat değişmiş olabilir, yeniden deneyin |
| "Kullanıcının uygulama erişimi yok" | Subscription süresi dolmuş |
| "Admin onayı bekleniyor" | Banka transferi seçtiysek, admin onayını bekle |

### Toast Notifikasyonları

```typescript
// Başarılı
toast.success('✅ Ödemeniz başarıyla doğrulanmıştır!');

// Uyarı
toast.warning('⏰ Aboneliğinizin süresi 7 gün kalmıştır!');

// Hata
toast.error('❌ Ödeme başarısız oldu');

// Bilgi
toast.info('🔐 Master License Escrow talebi oluşturuldu');
```

---

## Testing

### Testleri Çalıştır

```bash
npm run test -- payment-integration.test.ts
```

### Test Senaryoları

Dosya: `client/lib/__tests__/payment-integration.test.ts`

**Kapsanan Alanlar:**

1. ✅ Ödeme kaydı oluşturma
2. ✅ Ödeme doğrulama
3. ✅ Tekrar doğrulama koruması
4. ✅ Admin onayı
5. ✅ Admin red
6. ✅ Subscription işlemleri
7. ✅ Erişim kontrol
8. ✅ İstatistikleri
9. ✅ Eski kayıt temizleme
10. ✅ Entegrasyon senaryoları

---

## Sorun Çözme

### Scenario 1: Ödeme Belirli Bir Durumda Takılı

**Sorun:** Ödeme pending durumunda kalıyor

**Çözüm:**
```typescript
// Admin olarak ödemeyi manuel olarak onayla
const payment = getAllPayments().find(p => p.id === 'payment_123');
approvePayment(payment.id, adminId, 'Manuel onay');
```

### Scenario 2: Subscription Gösterilmiyor

**Sorun:** UseApp bileşeni "Aktif Paket Yok" gösteriyor

**Çözüm:**
```typescript
// 1. localStorage'ı kontrol et
const sub = localStorage.getItem('subscription');
console.log('Subscription:', sub);

// 2. Ödeme kaydını kontrol et
const payments = getAllPayments();
console.log('Payment records:', payments);

// 3. Subscription yenile
const hook = useSubscriptionStatus();
hook.refresh();
```

### Scenario 3: Admin Onayı Çalışmıyor

**Sorun:** ApprovePayment() başarısız

**Çözüm:**
1. Admin ID'si ayarlanmış mı kontrol et: `localStorage.getItem('adminId')`
2. Payment ID'si doğru mu kontrol et
3. Ödeme durumu "pending" mi kontrol et

### Scenario 4: Real-time Güncelleme Çalışmıyor

**Sorun:** Ödeme onaylandı ama üye panelinde güncellenmiyor

**Çözüm:**
```typescript
// localStorage'ı dinleme mekanizmasını yenile
window.dispatchEvent(new Event('storage'));

// veya sayfayı yenile
window.location.reload();
```

---

## Best Practices

### 1. Always Check Access

```typescript
const hasAccess = hasAppAccess(userId);
if (!hasAccess) {
  navigate('/checkout');
  return;
}
```

### 2. Use Hooks for Subscription Status

```typescript
const { isActive, daysRemaining, isExpiringSoon } = useSubscriptionStatus(userId);

useEffect(() => {
  if (isExpiringSoon) {
    // Show renewal warning
  }
}, [isExpiringSoon]);
```

### 3. Handle Payment Verification Polling

```typescript
useEffect(() => {
  const stopPolling = startPaymentVerificationPolling(userId, (subscription) => {
    // Subscription aktif edildi
  });
  return stopPolling;
}, [userId]);
```

### 4. Clean Up Old Records Regularly

```typescript
useEffect(() => {
  // Sayfa yüklendiğinde 90+ gün eski kayıtları sil
  cleanupOldPaymentRecords(90);
}, []);
```

---

## Kontrol Listesi - Ödeme Sistemi Kurulumu

- [x] Payment Verification Service kuruldu
- [x] UseApp bileşeni entegre edildi
- [x] Subscription Status Hook oluşturuldu
- [x] Admin Payment Control Panel kuruldu
- [x] Checkout sayfası entegre edildi
- [x] MemberPanel güncellemeleri tamamlandı
- [x] Entegrasyon testleri yazıldı
- [x] Dokümantasyon hazırlandı

---

## Destek ve İletişim

Sorularınız veya sorunlar için:

📞 WhatsApp: +90 542 578 37 48
📧 Email: support@example.com

---

**Son Güncelleme:** 2024
**Versiyon:** 1.0.0
