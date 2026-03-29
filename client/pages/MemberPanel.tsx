import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  LogOut,
  User,
  Clock,
  Package,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Zap,
  Settings,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { UseApp } from '@/components/UseApp';
import { PACKAGES } from '@shared/packages';
import {
  startPaymentVerificationPolling,
  getActiveSubscription,
  cleanupOldPaymentRecords
} from '@/lib/payment-verification';
import { useSubscriptionStatus, useSubscriptionExpiryWarning } from '@/lib/hooks/useSubscriptionStatus';

export default function MemberPanel() {
  const navigate = useNavigate();
  const { user, logout, subscription, loading: authLoading, token } = useAuth();

  const handleGoBack = () => {
    // Eğer history içinde önceki sayfa varsa geri git
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // History yoksa ana sayfaya yönlendir
      navigate('/');
    }
  };
  const subscriptionStatus = useSubscriptionStatus(user?.uid);
  useSubscriptionExpiryWarning();

  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'receipts' | 'settings' | 'website'>('overview');
  const [receipts, setReceipts] = useState<any[]>([]);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [localSubscription, setLocalSubscription] = useState<any>(null);

  // Eğer kullanıcı giriş yapmamışsa redirect et (ama auth loading'i bekle)
  useEffect(() => {
    if (!authLoading && !user && !token) {
      navigate('/member-login');
      return;
    }

    // ==========================================
    // SÜRÜ KONTROL: Subscription vs Demo
    // ==========================================
    const demoMode = localStorage.getItem('demoMode');
    const savedSub = localStorage.getItem('subscription');

    // Demo süresi aktif ise demo timer'ı göster
    if (demoMode === 'true') {
      console.log('✅ Demo mode aktif - Subscription kontrol atlanıyor');
      return;
    }

    // Demo değilse subscription kontrol et
    if (savedSub) {
      try {
        const sub = JSON.parse(savedSub);
        const daysRemaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / (1000 * 60 * 60 * 24)));

        if (daysRemaining <= 0) {
          // Subscription süresi bitmiş - pricing sayfasına yönlendir
          console.warn('⏰ Subscription süresi bitmiş - pricing sayfasına yönlendiriliyor');
          localStorage.removeItem('subscription');
          navigate('/pricing', { replace: true });
          return;
        }

        console.log(`✅ Subscription aktif, kalan gün: ${daysRemaining}`);
      } catch (e) {
        console.error('Subscription parse hatası:', e);
      }
    }
  }, [user, navigate, authLoading]);


  // Ödeme doğrulama polling başlat
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔄 Ödeme doğrulama polling başlatılıyor...');

    // Ödeme durumunu kontrol etmeye başla
    const stopPolling = startPaymentVerificationPolling(user?.uid, (subscription) => {
      console.log('✅ Ödeme başarıyla doğrulandı!', subscription);

      // Subscription'ı state'e yükle
      setLocalSubscription({
        ...subscription,
        daysRemaining: Math.ceil((subscription.endDate - Date.now()) / (1000 * 60 * 60 * 24))
      });

      toast.success('✅ Ödemeniz başarıyla doğrulanmıştır!');
      toast.info('🚀 Uygulama açılmaya hazırdır. "Uygulamayı Kullan" butonunu tıklayabilirsiniz.');
    });

    // Eski ödeme kayıtlarını temizle
    cleanupOldPaymentRecords(90);

    return () => {
      stopPolling();
    };
  }, [user]);

  // Subscription'ı load et
  useEffect(() => {
    const savedSub = localStorage.getItem('subscription');
    if (savedSub) {
      try {
        const sub = JSON.parse(savedSub);
        // Kalan günleri hesapla
        const daysRemaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
        setLocalSubscription({
          ...sub,
          daysRemaining
        });
      } catch (e) {
        console.warn('Subscription parse hatası:', e);
      }
    }
  }, []);

  // Dekonları getir
  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipt/user', {
        headers: {
          'x-user-id': user?.uid || '',
        },
      });
      const data = await response.json();
      if (data.success) {
        setReceipts(data.receipts || []);

        // Eğer onaylanmış dekont varsa ve subscription yoksa, subscription'ı kontrol et
        const approvedReceipts = (data.receipts || []).filter((r: any) => r.status === 'approved');
        if (approvedReceipts.length > 0 && !localSubscription) {
          console.log('✓ Onaylanmış dekont tespit edildi, subscription kontrolü yapılıyor...');
          // Subscription durumu otomatik olarak güncellenmiş olmalı
          // Sayfa yenilenir veya subscription localStorage'dan okunur
        }
      }
    } catch (error) {
      console.error('Dekont getirme hatası:', error);
    }
  };

  // Sayfa yüklendiğinde dekonları getir
  useEffect(() => {
    if (user) {
      fetchReceipts();
    }
  }, [user]);

  // Subscription durumu değiştiğinde güncelle
  useEffect(() => {
    if (subscriptionStatus.isActive) {
      setLocalSubscription({
        plan: subscriptionStatus.plan,
        amount: subscriptionStatus.amount,
        endDate: subscriptionStatus.endDate,
        daysRemaining: subscriptionStatus.daysRemaining
      });
    }
  }, [subscriptionStatus.isActive, subscriptionStatus.plan, subscriptionStatus.daysRemaining]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Çıkış yapıldı');
      navigate('/member-login');
    } catch (error) {
      toast.error('Çıkış sırasında hata oluştu');
    }
  };

  const handleExtendSubscription = async (packageId: string) => {
    setLoading(true);
    try {
      // Paket sayfasına yönlendir
      navigate('/pricing', { state: { packageId } });
      toast.success('Paket satın alma sayfasına yönlendiriliyorsunuz...');
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = (packageId: string) => {
    // Paketi seç ve direkt subscription oluştur (ödeme bypass)
    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
    if (!pkg) {
      toast.error('Paket bulunamadı');
      return;
    }

    // Subscription oluştur
    const startDate = Date.now();
    // Paket süresini günlere çevir (örneğin "30 gün" → 30, "3 ay" → 90)
    let daysInMs = 30 * 24 * 60 * 60 * 1000; // Varsayılan 30 gün

    if (pkg.duration.includes('3 ay') || pkg.duration.includes('3ay')) {
      daysInMs = 90 * 24 * 60 * 60 * 1000;
    } else if (pkg.duration.includes('1 ay') || pkg.duration.includes('1ay')) {
      daysInMs = 30 * 24 * 60 * 60 * 1000;
    } else if (pkg.duration.includes('7 gün') || pkg.duration.includes('7gün')) {
      daysInMs = 7 * 24 * 60 * 60 * 1000;
    }

    const endDate = startDate + daysInMs;
    const daysRemaining = Math.ceil(daysInMs / (24 * 60 * 60 * 1000));

    const subscription = {
      id: `sub_${Date.now()}`,
      plan: packageId,
      amount: pkg.price,
      currency: 'TRY',
      startDate,
      endDate,
      daysRemaining,
      status: 'active'
    };

    // localStorage'a kaydet
    localStorage.setItem('subscription', JSON.stringify(subscription));

    toast.success(`✅ ${pkg.name} paketi aktif edildi! ${daysRemaining} gün kullanabilirsiniz.`);
    console.log('✅ Paket satın alındı:', subscription);

    // Başarı sayfasına yönlendir
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1500);
  };

  const handleOpenPackagesModal = () => {
    // Pricing sayfasına yönlendir (modal yerine)
    navigate('/pricing');
  };

  if (!user) {
    return null;
  }

  // Kullanıcının aktif subscription'ı (localStorage'dan veya auth context'ten)
  const activeSub = localSubscription || subscription;
  const hasActiveSubscription = activeSub ? activeSub.daysRemaining > 0 : false;
  const daysRemaining = activeSub?.daysRemaining ?? 0;
  const subscriptionPlan = activeSub?.plan ?? 'free';
  const endDate = activeSub?.endDate ? new Date(activeSub.endDate) : null;

  // Kalan süre yüzdesini hesapla
  const subscriptionEndDate = user.subscription?.endDate || 0;
  const remainingPercentage = subscriptionEndDate > Date.now()
    ? Math.min(100, Math.max(0, (daysRemaining / 30) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Üye Paneli</h1>
            <p className="text-slate-400">Hoş geldiniz, {user?.username || 'Kullanıcı'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGoBack}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
            >
              ◀ Geri Dön
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Kullanıcı Bilgileri */}
        <div className="lg:col-span-1">
          <Card className="p-6 bg-slate-800/50 border border-slate-700/50 h-fit">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-blue-500/20 rounded-full">
                <User className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h2 className="text-white font-bold text-center text-lg mb-4">{user?.username || 'Kullanıcı'}</h2>

            <div className="space-y-3 border-t border-slate-700/50 pt-4">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Telefon</p>
                <p className="text-slate-300 text-sm">{user?.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Üye Tarihi</p>
                <p className="text-slate-300 text-sm">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Son Giriş</p>
                <p className="text-slate-300 text-sm">
                  {user?.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString('tr-TR')
                    : 'İlk girişiniz'}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 space-y-2 pb-4 border-b border-slate-700/50">
              <button
                onClick={handleGoBack}
                className="w-full px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold transition-all text-left flex items-center gap-2"
              >
                ◀ Geri Dön
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className="w-full px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-semibold transition-all text-left flex items-center gap-2"
              >
                👤 Üye Paneline Dön
              </button>
            </div>

            {/* Tab Buttons */}
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => setActiveTab('overview')}
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 mr-2" />
                Genel Bakış
              </Button>
              <Button
                onClick={() => setActiveTab('packages')}
                variant={activeTab === 'packages' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === 'packages'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-700'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Paketler
              </Button>
              <Button
                onClick={() => setActiveTab('receipts')}
                variant={activeTab === 'receipts' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === 'receipts'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Dekonts
              </Button>
              <Button
                onClick={() => setActiveTab('settings')}
                variant={activeTab === 'settings' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-700'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
              <Button
                onClick={() => setActiveTab('website')}
                variant={activeTab === 'website' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  activeTab === 'website'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-700'
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                Web Sayfası
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* UseApp Component - Uygulamayı Kullan */}
              {hasActiveSubscription && (
                <UseApp userId={user?.id} showExtendButton={true} compact={false} />
              )}

              {/* Subscription Status */}
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Abonelik Durumu</h3>
                    <p className="text-slate-400 text-sm">
                      {hasActiveSubscription
                        ? `Aktif - ${subscriptionPlan.toUpperCase()} Planı`
                        : 'Hiçbir aktif paket bulunmamaktadır'}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      hasActiveSubscription
                        ? 'bg-green-500/20'
                        : 'bg-yellow-500/20'
                    }`}
                  >
                    {hasActiveSubscription ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                </div>

                {hasActiveSubscription && (
                  <div className="space-y-4 border-t border-slate-700/50 pt-4">
                    {/* Kalan Gün */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300">Kalan Süre</span>
                        </div>
                        <span className="text-white font-bold">{daysRemaining} gün</span>
                      </div>
                      <div className="w-full bg-slate-700/30 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${remainingPercentage}%` }}
                        />
                      </div>
                      {endDate && (
                        <p className="text-xs text-slate-400 mt-2">
                          Son tarih: {endDate.toLocaleDateString('tr-TR')}
                        </p>
                      )}
                    </div>

                    {/* Satın Alınan Paket Özellikleri */}
                    {subscriptionPlan !== 'free' && (
                      <div className="bg-slate-900/50 rounded-lg p-4 mt-4 border border-slate-700/30">
                        <h4 className="text-white font-semibold mb-3 text-sm">Paket Özellikleri</h4>
                        <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            Sınırsız Tarama
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            Premium Analitikler
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            Öncelikli Destek
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✓</span>
                            İleri Raporlar
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Extend Button */}
                    <Button
                      onClick={() => handleExtendSubscription(subscriptionPlan)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Süre Uzat
                    </Button>
                  </div>
                )}

                {!hasActiveSubscription && (
                  <Button
                    onClick={handleOpenPackagesModal}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Paket Satın Al
                  </Button>
                )}
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-2">Toplam Tarama</p>
                  <p className="text-3xl font-bold text-white">
                    {user?.statistics?.totalScans ?? 0}
                  </p>
                </Card>
                <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-2">Tarama Süresi</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round((user?.statistics?.totalScanTime ?? 0) / 1000 / 60)}m
                  </p>
                </Card>
                <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-400 text-sm mb-2">Keşfedilen Alanlar</p>
                  <p className="text-3xl font-bold text-white">
                    {user?.statistics?.areasExplored ?? 0}
                  </p>
                </Card>
              </div>
            </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-6">Mevcut Paketler</h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(PACKAGES).map(([key, pkg]) => (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border transition-all ${
                        subscriptionPlan === key
                          ? 'bg-blue-500/10 border-blue-500/30'
                          : 'bg-slate-900/50 border-slate-700/30 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-white font-bold">{pkg.name}</h4>
                            {subscriptionPlan === key && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{pkg.duration}</p>
                          <ul className="space-y-1 text-sm">
                            {pkg.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="text-slate-300 flex items-center gap-2">
                                <span className="text-green-400 text-xs">✓</span> {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-yellow-400 mb-3">
                            {pkg.price.toLocaleString('tr-TR')} ₺
                          </div>
                          <Button
                            onClick={() => handlePurchasePackage(key)}
                            disabled={subscriptionPlan === key || loading}
                            size="sm"
                            className={
                              subscriptionPlan === key
                                ? 'bg-slate-700 text-slate-400'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }
                          >
                            {subscriptionPlan === key ? 'Aktif' : 'Seç'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Receipts Tab */}
          {activeTab === 'receipts' && (
            <div className="space-y-6">
              {/* Dekont Yükleme Alanı */}
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Dekont Yükle</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Ödemenizi kanıtlamak için dekont (fatura, banka ekstres, ödeme belgesi) yükleyiniz.
                  Dosya formatı: PDF, JPG, PNG. Maksimum boyut: 10 MB
                </p>

                {/* Dosya Yükleme Alanı */}
                <div className="border-2 border-dashed border-slate-700/50 rounded-lg p-8 text-center mb-4">
                  <input
                    type="file"
                    id="receipt-file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="receipt-file" className="cursor-pointer">
                    <div className="p-4 bg-blue-500/10 rounded-full inline-block mb-3">
                      <CreditCard className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-slate-300 font-semibold mb-1">Dosya seç veya sürükle</p>
                    <p className="text-slate-400 text-sm">PDF, JPG, PNG (Max 10 MB)</p>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm">
                      ✓ {selectedFile.name} seçildi ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                </div>

                {/* Yükleme Bilgisi */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/30">
                  <p className="text-slate-300 text-sm">
                    <span className="font-semibold">Aktif Paket:</span> {activeSub?.plan?.toUpperCase() || 'Yok'}
                    {activeSub && <span className="text-green-400 ml-2">Aktif ✓</span>}
                  </p>
                  <p className="text-slate-300 text-sm mt-1">
                    <span className="font-semibold">Ödeme Miktarı:</span> {activeSub?.amount?.toLocaleString('tr-TR') || '-'} ₺
                  </p>
                </div>

                <Button
                  onClick={async () => {
                    if (!selectedFile) {
                      toast.error('Lütfen bir dosya seçiniz');
                      return;
                    }

                    setUploadingReceipt(true);
                    try {
                      // Dosyayı base64 olarak oku
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        const base64 = (e.target?.result as string)?.split(',')[1];

                        // API'ye gönder
                        const response = await fetch('/api/receipt/upload', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': user?.id || '',
                          },
                          body: JSON.stringify({
                            subscriptionId: activeSub?.id || '',
                            plan: activeSub?.plan || 'free',
                            amount: activeSub?.price || 0,
                            currency: 'TRY',
                            fileName: selectedFile.name,
                            fileUrl: `data:${selectedFile.type};base64,${base64}`,
                            fileSize: selectedFile.size,
                            mimeType: selectedFile.type,
                          }),
                        });

                        const data = await response.json();
                        if (data.success) {
                          toast.success('Dekont başarıyla yüklendi. Onay bekleniyor...');
                          setSelectedFile(null);
                          // Dekontları yenile
                          fetchReceipts();
                        } else {
                          toast.error(data.message || 'Dekont yükleme başarısız');
                        }
                        setUploadingReceipt(false);
                      };
                      reader.readAsDataURL(selectedFile);
                    } catch (error) {
                      toast.error('Dekont yükleme sırasında hata oluştu');
                      setUploadingReceipt(false);
                    }
                  }}
                  disabled={!selectedFile || uploadingReceipt || !activeSub}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                >
                  {uploadingReceipt ? 'Yükleniyor...' : 'Dekont Yükle'}
                </Button>
              </Card>

              {/* Yüklenmiş Dekonlar */}
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Dekont Geçmişi</h3>

                {receipts.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Henüz dekont yüklenmemiş</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-white font-semibold">{receipt.file_name}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded font-semibold ${
                                  receipt.status === 'approved'
                                    ? 'bg-green-500/20 text-green-400'
                                    : receipt.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {receipt.status === 'approved'
                                  ? '✓ Onaylandı'
                                  : receipt.status === 'rejected'
                                  ? '✗ Reddedildi'
                                  : '⏳ Onay Bekleniyor'}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm">
                              Yükleme: {new Date(receipt.uploaded_at).toLocaleDateString('tr-TR')}
                            </p>
                            {receipt.approved_at && (
                              <p className="text-slate-400 text-sm">
                                Onay: {new Date(receipt.approved_at).toLocaleDateString('tr-TR')}
                              </p>
                            )}
                            {receipt.approval_notes && (
                              <p className="text-slate-300 text-sm mt-2 bg-slate-800/50 p-2 rounded">
                                {receipt.approval_notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-yellow-400 font-semibold text-lg">
                              {receipt.amount.toLocaleString('tr-TR')} ₺
                            </p>
                            {receipt.file_url && (
                              <Button
                                onClick={() => window.open(receipt.file_url, '_blank')}
                                size="sm"
                                variant="outline"
                                className="mt-2 text-xs border-slate-600 hover:bg-slate-700"
                              >
                                Dosyayı Aç
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Hesap Ayarları</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
                    <div>
                      <p className="text-white font-semibold">Kullanıcı Adı</p>
                      <p className="text-slate-400 text-sm">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
                    <div>
                      <p className="text-white font-semibold">Telefon</p>
                      <p className="text-slate-400 text-sm">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/30">
                    <div>
                      <p className="text-white font-semibold">Üyelik Tarihi</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/30">
                  <h4 className="text-white font-semibold mb-3">Tercihler</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={user.preferences.notifications}
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-slate-300 text-sm">Bildirimleri Aç</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={user.preferences.language === 'tr'}
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-slate-300 text-sm">Türkçe Dilini Kullan</span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="p-6 bg-red-500/5 border border-red-500/20">
                <h3 className="text-xl font-bold text-red-400 mb-4">Tehlikeli İşlemler</h3>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Oturumu Kapat
                </Button>
              </Card>
            </div>
          )}

          {/* Website Tab */}
          {activeTab === 'website' && (
            <div className="space-y-6">
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">
                  <Globe className="w-5 h-5 inline mr-2" />
                  Rydex Ana Sayfası
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Web sitemizi aşağıdan ziyaret edebilirsiniz. Yeni paketler ve özellikler hakkında bilgi alabilirsiniz.
                </p>
              </Card>

              <Card className="p-0 bg-slate-800/50 border border-slate-700/50 overflow-hidden">
                <iframe
                  src="/"
                  title="Rydex Ana Sayfası"
                  className="w-full h-[800px] border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </Card>

              <div className="text-center py-4 text-slate-400 text-sm">
                <p>Ana sayfaya tam ekranla erişmek için:</p>
                <Button
                  onClick={() => window.open('/', '_blank')}
                  variant="outline"
                  className="mt-2 border-slate-600 text-blue-400 hover:bg-slate-700"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Yeni Sekmede Aç
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
