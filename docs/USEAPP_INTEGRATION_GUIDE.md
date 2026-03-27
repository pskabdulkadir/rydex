# UseApp Component İntegrasyon Kılavuzu

## 📚 Genel Bakış

`UseApp` bileşeni, tüm üye panellerinde kullanmak üzere tasarlanmıştır. Bu bileşen:

1. ✅ Subscription durumunu gösterir
2. ✅ Uygulama erişim durumunu kontrol eder
3. ✅ "Uygulamayı Kullan" butonuyla anında erişim sağlar
4. ✅ Kalan süre gösterir ve bildirim verir
5. ✅ Paket uzatma seçeneği sunar

---

## 🔧 Kurulum

### Adım 1: Import Et

```typescript
import { UseApp } from '@/components/UseApp';
import { getActiveSubscription, hasAppAccess } from '@/lib/payment-verification';
```

### Adım 2: Bileşeni Sayfaya Ekle

```typescript
{hasActiveSubscription && (
  <UseApp 
    userId={user?.id} 
    showExtendButton={true} 
    compact={false} 
  />
)}
```

---

## 📋 UseApp Props

| Prop | Tür | Açıklama | Zorunlu |
|------|-----|----------|---------|
| `userId` | string | Kullanıcı ID'si | Hayır |
| `showExtendButton` | boolean | Paket uzatma butonu göster | Hayır |
| `compact` | boolean | Kompakt mod (sidebar için) | Hayır |
| `className` | string | Ek CSS sınıfları | Hayır |

---

## 🎯 Kullanım Örnekleri

### Örnek 1: Ana Üye Panelinde

```typescript
// client/pages/MemberPanel.tsx
import { UseApp } from '@/components/UseApp';

export default function MemberPanel() {
  const { user } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    const sub = getActiveSubscription();
    setHasActiveSubscription(sub ? sub.daysRemaining > 0 : false);
  }, []);

  return (
    <div className="space-y-6">
      {/* UseApp Bileşeni - Tam Mod */}
      {hasActiveSubscription && (
        <UseApp userId={user?.id} showExtendButton={true} compact={false} />
      )}
      
      {/* Diğer paneller */}
    </div>
  );
}
```

### Örnek 2: Sidebar'da (Kompakt Mod)

```typescript
// Sidebar bileşeninde
{hasActiveSubscription && (
  <UseApp 
    userId={user?.id} 
    showExtendButton={true} 
    compact={true}
    className="mb-6"
  />
)}
```

### Örnek 3: Dashboard Sayfasında

```typescript
// client/pages/Index.tsx veya başka dashboard sayfasında
import { UseApp } from '@/components/UseApp';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section - UseApp */}
      <UseApp userId={user?.id} />
      
      {/* Dashboard İçeriği */}
    </div>
  );
}
```

---

## 🔐 Payment Verification Sisteminin Çalışması

### Akış Diyagramı

```
Checkout Sayfası
    ↓
Ödeme İşlemi
    ↓
payment-verification.ts → createPaymentRecord()
    ↓
verifyPayment() → Subscription oluştur
    ↓
localStorage'a kaydet
    ↓
MemberPanel polling başlar (startPaymentVerificationPolling)
    ↓
UseApp bileşeni subscription'ı okur
    ↓
"Uygulamayı Kullan" butonu aktif olur
```

### Kod Akışı

1. **Ödeme Başarılı** → `Checkout.tsx:handlePayment()`
```typescript
const paymentRecord = createPaymentRecord(userId, pkg.id, pkg.price, paymentMethod);
const verificationResult = verifyPayment(paymentRecord.id, userId);
localStorage.setItem('subscription', JSON.stringify(verificationResult.subscription));
```

2. **MemberPanel Polling** → `MemberPanel.tsx:useEffect()`
```typescript
const stopPolling = startPaymentVerificationPolling(user.id, (subscription) => {
  setLocalSubscription(subscription);
  toast.success('✅ Ödemeniz başarıyla doğrulanmıştır!');
});
```

3. **UseApp Render** → `UseApp.tsx`
```typescript
const subscription = getActiveSubscription();
const hasAccess = hasAppAccess(userId);
// Eğer hasAccess = true ise "Uygulamayı Aç" butonu aktif
```

---

## 🚀 Yeni Üye Paneleri Oluştururken

Yeni bir üye paneli sayfası oluştururken **otomatik olarak** UseApp bileşeni eklemek için şu adımları izleyin:

### 1. Import Et
```typescript
import { UseApp } from '@/components/UseApp';
import { getActiveSubscription } from '@/lib/payment-verification';
```

### 2. State ve Effect Ekle
```typescript
const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

useEffect(() => {
  const sub = getActiveSubscription();
  setHasActiveSubscription(sub ? sub.daysRemaining > 0 : false);
}, []);
```

### 3. Bileşeni Sayfaya Yerleştir
```typescript
{hasActiveSubscription && (
  <UseApp userId={user?.id} showExtendButton={true} compact={false} />
)}
```

---

## 📊 Subscription Durumu Kontrolü

### getActiveSubscription()
Şu anki aktif subscription'ı getir:

```typescript
const subscription = getActiveSubscription();

if (subscription) {
  console.log('Plan:', subscription.plan);        // 'starter', 'pro', vb.
  console.log('Kalan Gün:', subscription.daysRemaining);
  console.log('Son Tarih:', new Date(subscription.endDate));
}
```

### hasAppAccess()
Kullanıcının uygulama erişim izni var mı kontrol et:

```typescript
const hasAccess = hasAppAccess(userId);

if (hasAccess) {
  // Uygulamaya erişime izin ver
} else {
  // Paket satın almaya yönlendir
}
```

---

## 🔔 Bildirimler ve Uyarılar

### Otomatik Uyarılar

UseApp bileşeni şu durumlarda otomatik uyarı verir:

1. **Aktif Paket Yok** → "Aktif Paket Yok" mesajı
2. **7 Günden Az Kaldı** → Paket uzatma butonu gösterilir
3. **Ödeme Başarılı** → Toast notification

### Manual Bildirim

```typescript
import { toast } from 'sonner';

toast.success('✅ Ödeme başarılı!');
toast.warning('⚠️ Paketinizin süresi 3 gün içinde bitecek');
toast.error('❌ Paket bulunamadı');
```

---

## 📱 Responsive Design

UseApp bileşeni otomatik olarak tüm cihazlara uyum sağlar:

- **Mobil** (< 640px): Tek sütun, tam genişlik
- **Tablet** (640px - 1024px): İki sütun
- **Masaüstü** (> 1024px): Tam detaylı görünüm

---

## 🧪 Test Etme

### Mock Subscription Oluştur
```typescript
// browser console'da
const mockSub = {
  id: 'sub_test',
  plan: 'pro',
  amount: 2500,
  startDate: Date.now(),
  endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
  daysRemaining: 30
};
localStorage.setItem('subscription', JSON.stringify(mockSub));
// Sayfayı yenile
```

### UseApp Bileşeni Test
```typescript
// Jest/Vitest testi
import { render, screen } from '@testing-library/react';
import { UseApp } from '@/components/UseApp';

test('UseApp başarıyla render edilir', () => {
  render(<UseApp userId="test-user" />);
  expect(screen.getByText(/Uygulamayı Kullan/i)).toBeInTheDocument();
});
```

---

## 🛠️ API Entegrasyon

### Payment Verification API

#### GET /api/payment/verify
```json
POST /api/payment/verify
Content-Type: application/json

{
  "paymentId": "payment_123",
  "userId": "user_123"
}

Response:
{
  "success": true,
  "verified": true,
  "message": "Ödeme başarıyla doğrulandı"
}
```

#### POST /api/payment/initiate
```json
POST /api/payment/initiate
Content-Type: application/json

{
  "userId": "user_123",
  "packageId": "pro",
  "amount": 2500,
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "sessionToken": "session_123",
  "paymentUrl": "https://payment.gateway.com/..."
}
```

---

## 🚨 Hata Yönetimi

### Common Errors

```typescript
// Subscription bulunamadı
if (!subscription) {
  toast.error('Aktif paket bulunmamaktadır');
  navigate('/pricing');
}

// Erişim reddedildi
if (!hasAppAccess(userId)) {
  toast.error('Bu özelliğe erişim hakkınız yok');
  return null;
}

// Ödeme doğrulaması başarısız
catch (error) {
  toast.error('Ödeme doğrulama başarısız: ' + error.message);
  console.error('Payment verification error:', error);
}
```

---

## 📞 Destek

Sorularınız için:
- **Email**: info@geoscan-x.com
- **WhatsApp**: +90 542 578 37 48
- **Docs**: https://docs.geoscan-x.com

---

## ✅ Kontrol Listesi

Yeni bir üye paneli oluştururken:

- [ ] UseApp bileşeni import ettim
- [ ] payment-verification fonksiyonlarını import ettim
- [ ] hasActiveSubscription state'ini ayarladım
- [ ] getActiveSubscription() useEffect'inde kullanıyorum
- [ ] UseApp bileşenini sayfaya ekledim
- [ ] Subscription yoksa alternatif gösterim sağladım
- [ ] Hata yönetimini ele aldım
- [ ] Toast notification'ları ayarladım

---

**Versiyon**: 1.0  
**Son Güncelleme**: 2024  
**Durum**: ✅ Aktif
