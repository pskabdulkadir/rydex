import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PACKAGES, calculateExpiryTimestamp } from '@shared/packages';
import { Currency, CurrencyInfo } from '@shared/api';
import { Shield, ArrowLeft, CreditCard, AlertCircle, Banknote, MessageCircle, DollarSign } from 'lucide-react';
import { launchAppAfterPayment, getBridge } from '@/lib/web-to-app-bridge';
import { Invoice } from '@/components/Invoice';
import { toast } from 'sonner';
import {
  validateCreditCard,
  validateBankTransfer,
  validateEmail,
  maskCardNumber,
  getCardType
} from '@/lib/payment-validation';
import { createPaymentRecord, verifyPayment, startPaymentVerificationPolling } from '@/lib/payment-verification';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';

type PaymentMethod = 'credit-card' | 'bank-transfer';

interface BankAccount {
  id: string;
  accountHolder: string;
  iban: string;
  bankName: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PaymentMethodType {
  id: string;
  type: 'credit-card' | 'bank-transfer';
  isEnabled: boolean;
  label: string;
  description: string;
  updatedAt: number;
}

interface CouponType {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  isActive: boolean;
  expiryDate?: number;
  createdAt: number;
  updatedAt: number;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const subscriptionStatus = useSubscriptionStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('TRY');
  const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyInfo[]>([]);
  const [convertedPrice, setConvertedPrice] = useState(0);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    iban: ''
  });
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');

  // Checkout ayarları
  const [checkoutSettings, setCheckoutSettings] = useState({
    bankAccounts: [] as BankAccount[],
    paymentMethods: [] as PaymentMethodType[],
    coupons: [] as CouponType[]
  });

  // Banka transferi seçildiğinde otomatik ilk aktif bankayı doldur
  useEffect(() => {
    if (paymentMethod === 'bank-transfer' && checkoutSettings.bankAccounts.length > 0) {
      const activeBank = checkoutSettings.bankAccounts.find(b => b.isActive);
      if (activeBank && !bankDetails.iban) {
        setBankDetails({
          iban: activeBank.iban,
          accountHolder: activeBank.accountHolder
        });
      }
    }
  }, [paymentMethod, checkoutSettings.bankAccounts]);

  // Para birimlerini yükle
  useEffect(() => {
    loadSupportedCurrencies();
  }, []);

  const loadSupportedCurrencies = async () => {
    try {
      setCurrencyLoading(true);
      const response = await fetch('/api/currency/supported');
      const data = await response.json();
      if (data.success) {
        setSupportedCurrencies(data.data);
      }
    } catch (error) {
      console.warn('Para birimleri yüklenemedi:', error);
      // Varsayılan para birimlerini ayarla
      setSupportedCurrencies([
        { code: 'TRY', symbol: '₺', name: 'Türk Lirası', exchangeRate: 1, locale: 'tr-TR' },
        { code: 'USD', symbol: '$', name: 'Amerikan Doları', exchangeRate: 0.032, locale: 'en-US' },
        { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.035, locale: 'de-DE' },
        { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini', exchangeRate: 0.041, locale: 'en-GB' },
      ]);
    } finally {
      setCurrencyLoading(false);
    }
  };

  // Para birimi değiştiğinde fiyatı dönüştür
  useEffect(() => {
    if (supportedCurrencies.length > 0 && pkg) {
      convertPrice(pkg.price, selectedCurrency);
    }
  }, [selectedCurrency, supportedCurrencies]);

  const convertPrice = async (amount: number, targetCurrency: Currency) => {
    try {
      const response = await fetch('/api/currency/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          fromCurrency: 'TRY',
          toCurrency: targetCurrency
        })
      });

      const data = await response.json();
      if (data.success) {
        setConvertedPrice(data.data.convertedAmount);
      }
    } catch (error) {
      console.warn('Fiyat dönüştürme hatası:', error);
      const baseCurrency = supportedCurrencies.find(c => c.code === 'TRY');
      const targetInfo = supportedCurrencies.find(c => c.code === targetCurrency);
      if (baseCurrency && targetInfo) {
        setConvertedPrice(amount * (targetInfo.exchangeRate / baseCurrency.exchangeRate));
      }
    }
  };

  // Checkout ayarlarını yükle ve real-time senkronizasyon
  useEffect(() => {
    loadCheckoutSettings();

    // localStorage değişimlerini dinle (real-time update)
    const handleStorageChange = () => {
      loadCheckoutSettings();
    };
    window.addEventListener('storage', handleStorageChange);

    // Her 2 saniyede bir localStorage kontrol et (aynı sekme içinde)
    const syncInterval = setInterval(() => {
      const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]');
      if (savedBanks.length > 0) {
        setCheckoutSettings(prev => ({
          ...prev,
          bankAccounts: savedBanks
        }));
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  const loadCheckoutSettings = async () => {
    try {
      // Mock ödeme yöntemleri ve banka hesapları
      const mockPaymentMethods: PaymentMethodType[] = [
        {
          id: 'pm_credit_card',
          type: 'credit-card',
          isEnabled: true,
          label: 'Kredi Kartı',
          description: 'Visa, Mastercard, American Express',
          updatedAt: Date.now()
        },
        {
          id: 'pm_bank_transfer',
          type: 'bank-transfer',
          isEnabled: true,
          label: 'Banka Transferi',
          description: 'EFT / Havale ile ödeme',
          updatedAt: Date.now()
        }
      ];

      const mockBankAccounts: BankAccount[] = [
        {
          id: 'bank_001',
          accountHolder: 'Abdulkadir Kan',
          iban: 'TR93 0001 0009 9999 9999 9999 99',
          bankName: 'İş Bankası',
          isActive: true,
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now()
        }
      ];

      try {
        // Önce localStorage'dan oku
        const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]') as BankAccount[];
        let bankAccounts = savedBanks.length > 0 ? savedBanks : mockBankAccounts;

        // API'den fetch etmeyi dene
        const [bankRes, paymentRes, couponRes] = await Promise.all([
          fetch('/api/checkout-settings/bank-accounts'),
          fetch('/api/checkout-settings/payment-methods'),
          fetch('/api/checkout-settings/coupons')
        ]);

        const bankData = bankRes.ok ? await bankRes.json() : { data: bankAccounts };
        const paymentData = paymentRes.ok ? await paymentRes.json() : { data: mockPaymentMethods };
        const couponData = couponRes.ok ? await couponRes.json() : { data: [] };

        // Eğer API'den veri gelmişse localStorage'a kaydet
        const apiBanks = bankData.data?.length ? bankData.data : bankAccounts;
        if (apiBanks !== bankAccounts) {
          localStorage.setItem('checkout_bank_accounts', JSON.stringify(apiBanks));
          bankAccounts = apiBanks;
        }

        setCheckoutSettings({
          bankAccounts: bankAccounts,
          paymentMethods: paymentData.data?.length ? paymentData.data : mockPaymentMethods,
          coupons: ((couponData.data || []) as CouponType[]).filter((c: CouponType) => c.isActive)
        });

        // İlk etkin ödeme yöntemini seç
        const allPaymentMethods = paymentData.data?.length ? paymentData.data : mockPaymentMethods;
        const enabledPayments = (allPaymentMethods as PaymentMethodType[]).filter((pm: PaymentMethodType) => pm.isEnabled);
        if (enabledPayments.length > 0) {
          setPaymentMethod(enabledPayments[0].type);
        }
      } catch (fetchErr) {
        // API başarısız olursa localStorage'dan oku
        console.warn('API\'den veriler yüklenemedi, localStorage kullanılıyor:', fetchErr);
        const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]') as BankAccount[];
        const finalBanks = savedBanks.length > 0 ? savedBanks : mockBankAccounts;

        setCheckoutSettings({
          bankAccounts: finalBanks,
          paymentMethods: mockPaymentMethods,
          coupons: []
        });
        setPaymentMethod('credit-card');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Checkout ayarları yükleme hatası:', err);
      setIsLoading(false);
    }
  };

  // Uygun kuponlar (aktif ve süresi dolmamış)
  const availableCoupons = checkoutSettings.coupons.filter(c => {
    if (!c.isActive) return false;
    if (c.expiryDate && c.expiryDate < Date.now()) return false;
    return true;
  });

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (pkg.price * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  const handleApplyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (!coupon) {
      toast.error('Geçersiz kupon kodu');
      return;
    }

    // Kupon süresi dolmuş mu kontrol et
    if (coupon.expiryDate && coupon.expiryDate < Date.now()) {
      toast.error('Bu kupon kodunun süresi dolmuştur');
      return;
    }

    // Minimum satın alma tutarını kontrol et
    if (pkg.price < coupon.minPurchase) {
      toast.error(`Minimum ₺${coupon.minPurchase.toLocaleString('tr-TR')} alışverişte geçerlidir`);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponCode('');
    toast.success(`✅ Kupon uygulandı: ${coupon.type === 'percentage' ? `%${coupon.value}` : `₺${coupon.value.toLocaleString('tr-TR')}`}`);
  };

  const getTotal = () => {
    const discount = calculateDiscount();
    return pkg.price - discount;
  };

  const packageId = location.state?.packageId || 'starter';
  const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

  // Ödeme başarılı oldu mu kontrol et (URL parametrelerinden)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');

    if (success === 'true') {
      const pkgId = params.get('packageId') || 'starter';
      const userId = localStorage.getItem('userId') || 'demo-user';

      // Ödeme işlemi başarılı, onay bekleme sayfasına yönlendir
      console.log('✅ Ödeme başarılı, onay bekleme sayfasına yönlendiriliyor...');

      // Kısa bir delay sonra yönlendir
      setTimeout(() => {
        navigate(`/payment-pending?packageId=${pkgId}`);
      }, 500);
    }
  }, [pkg, navigate]);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Paket Bulunamadı</h1>
          <button
            onClick={() => navigate('/landing')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  // Master License Escrow bildirimi gönder
  const sendEscrowNotification = async (userId: string, email: string, packageId: string) => {
    try {
      const amount = PACKAGES[packageId as keyof typeof PACKAGES]?.price || 0;

      // API'ye Escrow bildirimi gönder
      const response = await fetch('/api/payment/escrow-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          packageId,
          amount
        })
      });

      const data = await response.json();
      if (data.success) {
        console.log('🔐 Master License Escrow bildirimi gönderildi');

        // Ayrıca localStorage'a da kaydet (Admin panel'de gösterilmesi için)
        const request = {
          id: `escrow_${Date.now()}`,
          userId,
          email,
          amount,
          status: 'pending' as const,
          createdAt: Date.now()
        };

        const saved = localStorage.getItem('escrowRequests') || '[]';
        const requests = JSON.parse(saved);
        localStorage.setItem('escrowRequests', JSON.stringify([...requests, request]));

        toast.info('🔐 Master License Escrow talebi oluşturuldu. Admin onayı beklemektedir.');
      }
    } catch (error) {
      console.error('Escrow bildirimi gönderme hatası:', error);
      // Hata olsa bile devam et
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    setPaymentProcessing(true);

    try {
      // Ödeme yöntemi doğrulaması
      if (paymentMethod === 'credit-card') {
        const cardValidation = validateCreditCard(
          cardDetails.cardNumber,
          cardDetails.cardName,
          cardDetails.expiryDate,
          cardDetails.cvv
        );

        if (!cardValidation.valid) {
          setError(cardValidation.errors.join(', '));
          toast.error('Kart Doğrulama Hatası', {
            description: cardValidation.errors.join('\n')
          });
          setIsLoading(false);
          setPaymentProcessing(false);
          return;
        }
      } else if (paymentMethod === 'bank-transfer') {
        const bankValidation = validateBankTransfer(
          bankDetails.iban,
          bankDetails.accountHolder
        );

        if (!bankValidation.valid) {
          setError(bankValidation.errors.join(', '));
          toast.error('Banka Bilgisi Doğrulama Hatası', {
            description: bankValidation.errors.join('\n')
          });
          setIsLoading(false);
          setPaymentProcessing(false);
          return;
        }
      }

      const userId = localStorage.getItem('userId') || 'demo-user';
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

      // Email doğrulaması
      if (!validateEmail(userEmail)) {
        setError('Geçersiz e-posta adresi');
        toast.error('Geçersiz E-Posta Adresi');
        setIsLoading(false);
        setPaymentProcessing(false);
        return;
      }

      // Ödeme kaydını oluştur (TRY cinsinden)
      const paymentRecord = createPaymentRecord(userId, pkg.id, pkg.price, paymentMethod);
      console.log('📝 Ödeme kaydı oluşturuldu:', paymentRecord.id);
      console.log(`💱 Para Birimi: ${selectedCurrency} (${convertedPrice})`);

      // Invoice oluştur
      try {
        const invoiceResponse = await fetch('/api/invoice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            paymentId: paymentRecord.id,
            packageId: pkg.id,
            amount: convertedPrice,
            currency: selectedCurrency,
            userEmail,
            userName: localStorage.getItem('userName') || 'Müşteri'
          })
        });

        if (invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          console.log('📄 Fatura oluşturuldu:', invoiceData.invoiceNumber);

          // Invoice ID'yi kaydet
          localStorage.setItem('lastInvoiceId', invoiceData.invoiceId);
          localStorage.setItem('lastInvoiceNumber', invoiceData.invoiceNumber);
        }
      } catch (invoiceError) {
        console.warn('Fatura oluşturulamadı:', invoiceError);
        // Ödeme işlemi devam et, fatura isteğe bağlı
      }

      // İş akışı: Mock sistem (demo için)
      // Gerçek sistemde payment gateway entegrasyonu yapılmalı

      // Ödemeyi doğrula (demo için anında doğrulama)
      const verificationResult = verifyPayment(paymentRecord.id, userId);

      if (verificationResult.success && verificationResult.subscription) {
        console.log('✅ Ödeme doğrulandı ve subscription aktif edildi:', verificationResult.subscription);

        // localStorage'a subscription'ı kaydet
        localStorage.setItem('subscription', JSON.stringify(verificationResult.subscription));

        // Ödeme doğrulama polling'i başlat
        const stopPolling = startPaymentVerificationPolling(userId, (subscription) => {
          console.log('✅ Ödeme doğrulandı ve subscription aktif edildi:', subscription);
          toast.success('✅ Ödemeniz başarıyla doğrulanmıştır!');

          // 2 saniye sonra yönlendir
          setTimeout(() => {
            navigate(`/payment-success?packageId=${pkg.id}&paymentId=${paymentRecord.id}`, {
              state: {
                subscription,
                paymentRecord
              }
            });
          }, 2000);
        });

        // Success sayfasına yönlendir
        toast.success('🎉 Ödeme başarıyla tamamlandı!');

        setTimeout(() => {
          navigate(`/payment-success?packageId=${pkg.id}&paymentId=${paymentRecord.id}`, {
            state: {
              subscription: verificationResult.subscription,
              paymentRecord
            }
          });
        }, 1000);
      } else {
        // API'ye fallback - gerçek ödeme gateway'i
        try {
          const response = await fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              packageId: pkg.id,
              amount: pkg.price,
              email: userEmail,
              paymentId: paymentRecord.id,
              returnUrl: window.location.origin + '/checkout?success=true&packageId=' + pkg.id
            })
          });

          const data = await response.json();

          if (data.success) {
            console.log('💳 Ödeme başlatıldı, Session Token:', data.sessionToken);

            // Session token'ı localStorage'a kaydet
            if (data.sessionToken) {
              getBridge().saveTokenLocally(data.sessionToken);
              console.log('✅ Session token kaydedildi');
            }

            // Ödeme sayfasına yönlendir
            if (data.paymentUrl) {
              toast.success('Ödeme sayfasına yönlendiriliyorsunuz...');
              setTimeout(() => {
                window.location.href = data.paymentUrl;
              }, 500);
            }
          } else {
            setError(data.message || 'Ödeme başlatılamadı');
            toast.error('Ödeme başlatılamadı: ' + (data.message || 'Bilinmeyen hata'));
          }
        } catch (fallbackError) {
          console.error('API fallback hatası:', fallbackError);
          setError('Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
          toast.error('Ödeme işlemi başarısız oldu');
        }
      }
    } catch (err) {
      console.error('Ödeme hatası:', err);
      const errorMsg = 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
      setPaymentProcessing(false);
    }
  };

  // Fatura gösteriliyorsa
  if (showInvoice && invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/landing')}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri Dön
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Ödemeniz Başarılı!</h1>
            <p className="text-slate-400">Lütfen faturanızı indirin veya yazdırın</p>
          </div>
          <Invoice {...invoiceData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/rydex')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri Dön
        </button>
      </div>

      {/* Checkout Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm">
            <h1 className="text-3xl font-bold text-white mb-8">Siparişi Tamamla</h1>

            {/* Package Summary */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">{pkg.name}</h2>
                  <p className="text-sm text-slate-400 mt-1">{pkg.duration}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400">
                    {convertedPrice > 0 ? convertedPrice.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) : pkg.price.toLocaleString('tr-TR')}
                  </div>
                  <span className="text-slate-400">{supportedCurrencies.find(c => c.code === selectedCurrency)?.symbol || '₺'}</span>
                </div>
              </div>

              {/* Para Birimi Seçimi */}
              <div className="mb-6 pb-6 border-b border-slate-700/50">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Para Birimini Seç
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {supportedCurrencies.length > 0 ? supportedCurrencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setSelectedCurrency(currency.code)}
                      disabled={currencyLoading}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold flex flex-col items-center gap-1 ${
                        selectedCurrency === currency.code
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border-slate-700/50 bg-slate-800/30 text-slate-300 hover:border-slate-600'
                      } ${currencyLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="text-lg">{currency.symbol}</span>
                      <span className="text-xs">{currency.code}</span>
                    </button>
                  )) : (
                    <div className="col-span-4 text-center text-slate-400 text-sm">
                      Para birimleri yükleniyor...
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Paket Özellikleri:</h3>
                <ul className="space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Technical Info */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-6 mb-8">
              <h3 className="text-sm font-semibold text-blue-400 mb-3">Teknik Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Erişim Türü:</p>
                  <p className="text-slate-300 font-semibold">{pkg.technicalAccess}</p>
                </div>
                <div>
                  <p className="text-slate-500">Geçerlilik:</p>
                  <p className="text-slate-300 font-semibold">{pkg.duration}</p>
                </div>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-1 w-4 h-4 accent-blue-500 rounded"
                />
                <span className="text-sm text-slate-400">
                  Hizmet şartlarını ve gizlilik politikasını kabul ediyorum.
                  <a href="#" className="text-blue-400 hover:text-blue-300 ml-1">
                    Şartları Oku
                  </a>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm sticky top-6">
            <h3 className="text-xl font-bold text-white mb-6">Ödeme Yöntemi</h3>

            {/* Supported Methods */}
            <div className="space-y-3 mb-8">
              {isLoading ? (
                <div className="text-slate-400 text-sm text-center py-4">Ödeme yöntemleri yükleniyor...</div>
              ) : checkoutSettings.paymentMethods.filter(pm => pm.isEnabled).length > 0 ? (
                checkoutSettings.paymentMethods
                  .filter(pm => pm.isEnabled)
                  .map(method => (
                    <label key={method.id} className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === method.type
                        ? 'border-blue-500 bg-blue-500/5'
                        : 'border-slate-700/50 hover:border-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === method.type}
                        onChange={() => setPaymentMethod(method.type)}
                        className="accent-blue-500"
                      />
                      <span className="ml-3 text-white font-semibold flex items-center gap-2">
                        {method.type === 'credit-card' && <CreditCard className="w-4 h-4" />}
                        {method.type === 'bank-transfer' && <Banknote className="w-4 h-4" />}
                        {method.label}
                      </span>
                      <p className="text-xs text-slate-400 ml-7 mt-1">{method.description}</p>
                    </label>
                  ))
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <p className="font-semibold mb-1">⚠️ Ödeme Yöntemi Kullanılamıyor</p>
                  <p>Şu anda aktif bir ödeme yöntemi bulunmamaktadır. Lütfen destek ekibi ile iletişime geçin.</p>
                </div>
              )}
            </div>

            {/* Payment Forms */}
            {paymentMethod === 'credit-card' && (
              <div className="space-y-4 mb-8 pb-6 border-b border-slate-700/50">
                <h4 className="text-sm font-semibold text-slate-300">Kart Bilgileri</h4>
                <input
                  type="text"
                  placeholder="Kart Sahibinin Adı"
                  value={cardDetails.cardName}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <div>
                  <input
                    type="text"
                    placeholder="Kart Numarası (13-19 haneli)"
                    value={cardDetails.cardNumber}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '').slice(0, 19);
                      setCardDetails({ ...cardDetails, cardNumber: cleaned });
                    }}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                  {cardDetails.cardNumber && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {getCardType(cardDetails.cardNumber)}
                      </span>
                      <span className={cardDetails.cardNumber.length >= 13 && cardDetails.cardNumber.length <= 19 ? 'text-green-400' : 'text-yellow-400'}>
                        {cardDetails.cardNumber.length} hane
                      </span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank-transfer' && (
              <div className="space-y-4 mb-8 pb-6 border-b border-slate-700/50">
                <h4 className="text-sm font-semibold text-amber-400">Banka Transferi Bilgileri</h4>
                {checkoutSettings.bankAccounts.filter(b => b.isActive).length > 0 ? (
                  <>
                    {checkoutSettings.bankAccounts.filter(b => b.isActive).map((bank, idx) => (
                      <div key={bank.id} className={`bg-amber-500/5 border-l-4 border-l-amber-500 p-4 rounded space-y-3 text-sm text-slate-300 ${idx > 0 ? 'mt-4' : ''}`}>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Alıcı Adı:</p>
                          <p className="font-semibold">{bank.accountHolder}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">IBAN:</p>
                          <p className="font-semibold font-mono">{bank.iban}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Banka:</p>
                          <p className="font-semibold">{bank.bankName}</p>
                        </div>
                      </div>
                    ))}
                    <input
                      type="text"
                      placeholder="Dekontu Referans (İsteğe Bağlı)"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                    />
                  </>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    ⚠️ Banka transfer bilgileri şu anda kullanılamıyor. Lütfen başka bir ödeme yöntemi seçin.
                  </div>
                )}
              </div>
            )}

            {/* Processing Message */}
            {paymentProcessing && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 flex-shrink-0 mt-0.5"></div>
                <div>
                  <p className="text-blue-400 text-sm font-semibold">Ödeme işleniyor...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Lütfen bekleyin, ödeme sayfasına yönlendirileceksiniz.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-semibold">Hata</p>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-400">Güvenli İşlem</p>
                <p className="text-xs text-slate-400 mt-1">
                  Emanet (Escrow) sistemi ile korumalı. SSL şifreli bağlantı.
                </p>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
              <p className="text-sm font-semibold text-slate-300 mb-3">Kupon Kodunuz Varsa:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kupon kodu girin"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Uygula
                </button>
              </div>
              {appliedCoupon && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  ✓ {appliedCoupon.code} kuponu uygulandı
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="border-t border-slate-700/50 pt-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">Ara Toplam:</span>
                <span className="text-white font-semibold">{pkg.price.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400">KDV (0%):</span>
                <span className="text-white font-semibold">0 ₺</span>
              </div>
              {appliedCoupon && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400">İndirim ({appliedCoupon.code}):</span>
                  <span className="text-green-400 font-semibold">
                    -{calculateDiscount().toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg">
                <span className="text-white font-bold">Toplam:</span>
                <span className="text-yellow-400 font-bold text-2xl">
                  {getTotal().toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 mb-3"
            >
              <CreditCard className="w-5 h-5" />
              {isLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>

            {/* Invoice Download Button */}
            <button
              onClick={async () => {
                const invoiceId = localStorage.getItem('lastInvoiceId');
                if (invoiceId) {
                  try {
                    const response = await fetch(`/api/invoice/${invoiceId}/view`);
                    const html = await response.text();

                    // Yeni pencerede aç
                    const printWindow = window.open('', '', 'width=900,height=700');
                    if (printWindow) {
                      printWindow.document.write(html);
                      printWindow.document.close();
                      setTimeout(() => printWindow.print(), 250);
                    }
                  } catch (error) {
                    toast.error('Fatura açılamadı');
                  }
                } else {
                  toast.error('Henüz fatura oluşturulmamış');
                }
              }}
              className="w-full py-2 border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-slate-200 font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              📄 Faturayı Göster/İndir
            </button>

            {/* Master License Notice */}
            {pkg.requiresEscrow && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
                <p className="text-xs text-amber-400 font-semibold mb-1">🔐 Master License</p>
                <p className="text-xs text-slate-400">
                  Emanet süreci başlatılacak. Admin onayı sonrası kaynak kodu alacaksınız.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - WhatsApp İletişim */}
      <footer className="border-t border-slate-700/30 py-8 px-4 sm:px-6 lg:px-8 bg-slate-950/50 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-bold text-white mb-4">Sorularınız Mı Var?</h3>
          <p className="text-slate-400 mb-6">Ödeme sırasında yardıma ihtiyacınız varsa, hemen WhatsApp'tan iletişime geçin!</p>
          <a
            href="https://wa.me/905425783748"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp: +90 542 578 37 48
          </a>
          <p className="text-slate-500 text-sm mt-6">Canlı destek ekibimiz size yardımcı olmak için hazır</p>
        </div>
      </footer>
    </div>
  );
}
