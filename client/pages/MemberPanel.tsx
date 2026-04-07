import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Play,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { UseApp } from '@/components/UseApp';
import { useDemo } from '@/lib/hooks/useDemo';
import { PACKAGES } from '@shared/packages';
import {
  startPaymentVerificationPolling,
  getActiveSubscription,
  cleanupOldPaymentRecords
} from '@/lib/payment-verification';
import { useSubscriptionStatus, useSubscriptionExpiryWarning } from '@/lib/hooks/useSubscriptionStatus';

export default function MemberPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, subscription, loading: authLoading, token } = useAuth();
  const { startDemo } = useDemo();
  const [justPurchased, setJustPurchased] = useState(false);

  const handleGoBack = () => {
    // Eğer history içinde önceki sayfa varsa geri git
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // History yoksa ana sayfaya yönlendir (çıkış yapma!)
      navigate('/', { replace: false });
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Eğer kullanıcı giriş yapmamışsa redirect et (ama auth loading'i bekle)
  useEffect(() => {
    // Location state'ten kaydolduktan sonra mı yoksa satın alma sonrasında mı geldiğini kontrol et
    const locationState = location.state as { subscriptionCompleted?: boolean } | null;
    if (locationState?.subscriptionCompleted) {
      setJustPurchased(true);
      // State'i temizle
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (!authLoading && !user && !token) {
      navigate('/member-login');
      return;
    }

    // ==========================================
    // SÜRÜ KONTROL: Subscription vs Demo
    // ==========================================
    const demoMode = localStorage.getItem('demoMode');
    const savedSub = localStorage.getItem('subscription');

    // Demo süresi aktif ise - Subscription kontrolünü atla (UseApp gösterilecek)
    if (demoMode === 'true') {
      console.log('✅ Demo mode aktif - Subscription kontrol atlanıyor');
      setIsDemoMode(true);
      // Demo mode'da UseApp'ı gösteriyoruz, subscription kontrolü yapma
      return;
    }

    setIsDemoMode(false);

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

  // Subscription'ı load et (localStorage'dan)
  const loadSubscription = () => {
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
        console.log('✅ Subscription yüklendi:', sub.plan, 'Kalan gün:', daysRemaining);
      } catch (e) {
        console.warn('Subscription parse hatası:', e);
      }
    }
  };

  useEffect(() => {
    loadSubscription();
    // Her 5 saniyede bir localStorage'ı kontrol et (admin onayı sonrası güncelleme için)
    const interval = setInterval(loadSubscription, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dekonları getir
  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipt/user', {
        headers: {
          'x-user-id': user?.uid || '',
        },
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

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
      // API başarısız - fallback (localStorage'dan oku)
      console.warn('⚠️ Dekonlar API\'den alınamadı, localStorage kullanılıyor:', error);

      try {
        const savedReceipts = JSON.parse(localStorage.getItem('userReceipts') || '[]');
        setReceipts(savedReceipts);
      } catch (e) {
        console.error('Dekont getirme hatası:', error);
        setReceipts([]);
      }
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

  const handleCancelMembership = async () => {
    // Onay dialog göster
    const confirmed = window.confirm(
      `⚠️ Dikkat!\n\n${subscriptionPlan.toUpperCase()} paketiniz iptal edilecektir.\n\nEmin misiniz?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      // Backend'e cancel isteği gönder
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // localStorage'dan subscription'ı sil
        localStorage.removeItem('subscription');

        // State'i güncelle
        setLocalSubscription(null);

        toast.success('✅ Üyeliğiniz başarıyla iptal edilmiştir');

        // Pricing sayfasına yönlendir
        setTimeout(() => {
          navigate('/pricing');
        }, 1500);
      } else {
        toast.error(data.message || 'Üyelik iptali başarısız');
      }
    } catch (error) {
      console.error('Üyelik iptali hatası:', error);
      toast.error('Üyelik iptali sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = (packageId: string) => {
    // Paketi seç ve ödeme sayfasına yönlendir
    const pkg = PACKAGES[packageId as keyof typeof PACKAGES];
    if (!pkg) {
      toast.error('Paket bulunamadı');
      return;
    }

    // Ödeme sayfasına yönlendir (süreyi uzatmak için de bu kullanılıyor)
    navigate('/pricing', { state: { packageId, action: 'purchase' } });
    toast.info(`📦 ${pkg.name} paketi için ödeme sayfasına yönlendiriliyorsunuz...`);
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
              onClick={() => navigate('/admin')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              title="Admin Paneline Git"
            >
              ⚙️ Admin Paneli
            </Button>
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
              <button
                onClick={() => navigate('/admin')}
                className="w-full px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 rounded-lg text-sm font-semibold transition-all text-left flex items-center gap-2"
                title="Admin Paneline Git"
              >
                ⚙️ Admin Paneli
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
              {/* UseApp Component - Demo aktif VEYA Subscription varsa göster */}
              {(hasActiveSubscription || isDemoMode) && (
                <UseApp userId={user?.uid} showExtendButton={true} compact={false} />
              )}

              {/* Demo Butonu - Subscription yoksa ve demo mode de aktif değilse göster */}
              {!hasActiveSubscription && !isDemoMode && (
                <Card className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">🎮 Ücretsiz Demo Deneyin</h3>
                      <p className="text-slate-300 mb-4">
                        Paket satın almadan önce, yazılımı 3 dakika boyunca ücretsiz deneyebilirsiniz.
                      </p>
                      <ul className="space-y-2 text-sm text-slate-300 mb-6">
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          Tüm özelliklere tam erişim
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          Gerçek tarama yapabilirsiniz
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-green-400">✓</span>
                          Hiç kredi kartı gerekmez
                        </li>
                      </ul>
                      <Button
                        onClick={() => {
                          // Demo verilerini temizle
                          localStorage.removeItem('demoMode');
                          localStorage.removeItem('demoStartTime');
                          localStorage.removeItem('demoExpireTime');

                          // Demo başlat (2 dakika)
                          startDemo(2);

                          // Uygulamaya git
                          localStorage.setItem('systemInitialized', 'true');
                          setTimeout(() => {
                            navigate('/app', {
                              state: { from: '/member-panel' }
                            });
                          }, 300);

                          toast.success('🎮 Demo başlatıldı! 2 dakikanız var.');
                        }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold px-6 py-3"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Demo Başlat
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Subscription Status */}
              <Card className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Abonelik Durumu</h3>
                    <p className="text-slate-400 text-sm">
                      {isDemoMode
                        ? '🎮 Demo Modu Aktif - 2 Dakika Ücretsiz Deneme'
                        : hasActiveSubscription
                        ? `Aktif - ${subscriptionPlan.toUpperCase()} Planı`
                        : 'Hiçbir aktif paket bulunmamaktadır'}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      isDemoMode
                        ? 'bg-purple-500/20'
                        : hasActiveSubscription
                        ? 'bg-green-500/20'
                        : 'bg-yellow-500/20'
                    }`}
                  >
                    {isDemoMode ? (
                      <AlertCircle className="w-6 h-6 text-purple-400" />
                    ) : hasActiveSubscription ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-yellow-400" />
                    )}
                  </div>
                </div>

                {isDemoMode && (
                  <div className="space-y-4 border-t border-slate-700/50 pt-4">
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-purple-200 text-sm">
                        <span className="font-semibold">🎮 Demo Modunda Eksik İşlemler:</span>
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-purple-300">
                        <li>• Tarama sonuçları kaydedilmez</li>
                        <li>• Export/İndirme özelliği devre dışı</li>
                        <li>• Bulut senkronizasyonu yapılmaz</li>
                      </ul>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Demo süresi bitince paket satın alabilir veya yazılımı kullanmaya devam edebilirsiniz.
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={() => {
                          // Uygulamaya erişimi aç
                          localStorage.setItem('systemInitialized', 'true');
                          navigate('/app', { state: { from: '/member-panel' } });
                          toast.success('🎮 Uygulamaya 2 dakika erişim izni verildi');
                        }}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Uygulamayı Kullan (2 Dakika)
                      </Button>
                      <Button
                        onClick={() => navigate('/pricing')}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Paket Satın Al
                      </Button>
                    </div>
                  </div>
                )}

                {hasActiveSubscription && !isDemoMode && (
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

                    {/* Extend Button + Demo Button */}
                    <div className="grid grid-cols-1 gap-2">
                      <Button
                        onClick={() => handleExtendSubscription(subscriptionPlan)}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Süre Uzat
                      </Button>
                      <Button
                        onClick={() => {
                          // Demo başlat (2 dakika)
                          startDemo(2);

                          // Uygulamaya git
                          localStorage.setItem('systemInitialized', 'true');
                          navigate('/app', { state: { from: '/member-panel' } });
                          toast.success('🎮 Demo başlatıldı! 2 dakikanız var.');
                        }}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Demo Dene (2 Dakika)
                      </Button>
                      <Button
                        onClick={handleCancelMembership}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Üyeliğimi İptal Et
                      </Button>
                    </div>
                  </div>
                )}

                {!hasActiveSubscription && !isDemoMode && (
                  <div className="space-y-2 mt-4 border-t border-slate-700/50 pt-4">
                    <Button
                      onClick={() => {
                        // Demo başlat (2 dakika)
                        startDemo(2);

                        // Uygulamaya git
                        localStorage.setItem('systemInitialized', 'true');
                        navigate('/app', { state: { from: '/member-panel' } });
                        toast.success('🎮 Demo başlatıldı! 2 dakikanız var.');
                      }}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Demo Dene (2 Dakika)
                    </Button>
                    <Button
                      onClick={handleOpenPackagesModal}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Paket Satın Al
                    </Button>
                  </div>
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
              {/* Pending Ödeme Talebi - Havale Talimatları */}
              {(() => {
                const pendingPayment = localStorage.getItem('currentPaymentRequest');
                if (!pendingPayment) return null;

                try {
                  const payment = JSON.parse(pendingPayment);
                  return (
                    <Card className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-amber-500/20 rounded-full">
                          <AlertCircle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1">⏳ Havale Bekleniyor</h3>
                          <p className="text-amber-300 text-sm">
                            Ödeme talebiniz oluşturuldu. Lütfen aşağıdaki IBAN'a havale yapıp dekont yükleyiniz.
                          </p>
                        </div>
                      </div>

                      {/* IBAN ve Tutar Bilgisi */}
                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 space-y-3 border border-amber-500/20">
                        <div>
                          <p className="text-xs text-slate-400 font-semibold mb-2">IBAN (Kopyalamak için tıklayın):</p>
                          <button
                            onClick={() => {
                              if (payment.bankAccount?.iban) {
                                navigator.clipboard.writeText(payment.bankAccount.iban);
                                toast.success('IBAN kopyalandı!');
                              }
                            }}
                            className="w-full text-left p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg font-mono text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {payment.bankAccount?.iban} 📋
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Alıcı Adı:</p>
                            <p className="text-white font-semibold">{payment.bankAccount?.accountHolder}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Banka:</p>
                            <p className="text-white font-semibold">{payment.bankAccount?.bankName}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Tutar:</p>
                          <p className="text-xl font-bold text-yellow-400">{payment.amount.toLocaleString('tr-TR')} TRY</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Referans Kodu (Notlar kısmına yazın):</p>
                          <p className="text-sm font-mono font-semibold text-blue-300 bg-slate-800/30 p-2 rounded">
                            {payment.referenceCode || payment.id}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-amber-300 text-center">
                        ✓ Havalesi yaptıktan sonra dekont/fatura dosyasını aşağıdan yükleyiniz
                      </p>
                    </Card>
                  );
                } catch (e) {
                  return null;
                }
              })()}

              {/* Dekont Yükleme Alanı */}
              <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
                <h3 className="text-xl font-bold text-white mb-4">📄 Dekont Yükle</h3>
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
                  {(() => {
                    // Bilgi için pending payment veya subscription kullan
                    let displayPlan = 'Yok';
                    let displayAmount = '-';
                    let isPending = false;

                    const pendingPayment = localStorage.getItem('currentPaymentRequest');
                    if (pendingPayment) {
                      try {
                        const payment = JSON.parse(pendingPayment);
                        displayPlan = payment.plan?.toUpperCase() || 'BEKLEMEDE';
                        displayAmount = payment.amount?.toLocaleString('tr-TR') || '-';
                        isPending = true;
                      } catch (e) {
                        console.warn('Pending payment parse hatası:', e);
                      }
                    } else if (activeSub) {
                      displayPlan = activeSub?.plan?.toUpperCase() || 'AKTİF';
                      displayAmount = (activeSub?.amount || activeSub?.price)?.toLocaleString('tr-TR') || '-';
                    }

                    return (
                      <>
                        <p className="text-slate-300 text-sm">
                          <span className="font-semibold">
                            {isPending ? 'Beklemede Olan Paket:' : 'Aktif Paket:'}
                          </span> {displayPlan}
                          {!isPending && activeSub && <span className="text-green-400 ml-2">Aktif ✓</span>}
                          {isPending && <span className="text-amber-400 ml-2">Onay Bekleniyor ⏳</span>}
                        </p>
                        <p className="text-slate-300 text-sm mt-1">
                          <span className="font-semibold">Ödeme Miktarı:</span> {displayAmount} ₺
                        </p>
                      </>
                    );
                  })()}
                </div>

                <Button
                  onClick={async () => {
                    if (!selectedFile) {
                      toast.error('Lütfen bir dosya seçiniz');
                      return;
                    }

                    // Pending ödeme veya subscription'dan bilgi al
                    let paymentInfo = { subscriptionId: '', plan: 'free', amount: 0 };

                    // 1. Pending ödeme varsa kullan
                    const pendingPayment = localStorage.getItem('currentPaymentRequest');
                    if (pendingPayment) {
                      try {
                        const payment = JSON.parse(pendingPayment);
                        paymentInfo = {
                          subscriptionId: payment.id || '',
                          plan: payment.plan || 'free',
                          amount: payment.amount || 0
                        };
                      } catch (e) {
                        console.warn('Pending payment parse hatası:', e);
                      }
                    }

                    // 2. Subscription varsa kullan
                    if (activeSub) {
                      paymentInfo = {
                        subscriptionId: activeSub?.id || '',
                        plan: activeSub?.plan || 'free',
                        amount: activeSub?.amount || activeSub?.price || 0
                      };
                    }

                    setUploadingReceipt(true);
                    try {
                      // Dosyayı base64 olarak oku
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        const result = e.target?.result as string;
                        if (!result) {
                          toast.error('Dosya okunamadı');
                          setUploadingReceipt(false);
                          return;
                        }
                        const base64 = result.split(',')[1];

                        // API'ye gönder
                        const response = await fetch('/api/receipt/upload', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': user?.uid || '',
                          },
                          body: JSON.stringify({
                            subscriptionId: paymentInfo.subscriptionId,
                            plan: paymentInfo.plan,
                            amount: paymentInfo.amount,
                            currency: 'TRY',
                            fileName: selectedFile.name || 'dekont.jpg',
                            fileUrl: `data:${selectedFile.type || 'image/jpeg'};base64,${base64}`,
                            fileSize: selectedFile.size || 0,
                            mimeType: selectedFile.type || 'image/jpeg',
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
                  disabled={!selectedFile || uploadingReceipt}
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
                                onClick={() => {
                                  // Base64 dosyayı yeni sekmede aç
                                  const link = document.createElement('a');
                                  link.href = receipt.file_url;
                                  link.download = receipt.file_name || 'dekont';
                                  link.target = '_blank';
                                  link.click();
                                }}
                                size="sm"
                                variant="outline"
                                className="mt-2 text-xs border-slate-600 hover:bg-slate-700"
                              >
                                Dosyayı İndir/Aç
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
                      defaultChecked={user?.preferences?.notifications ?? true}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <span className="text-slate-300 text-sm">Bildirimleri Aç</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={user?.preferences?.language === 'tr' ?? true}
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
                <div className="space-y-3">
                  {hasActiveSubscription && (
                    <>
                      <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                        <p className="text-red-300 text-sm">
                          <span className="font-semibold">⚠️ Dikkat:</span> Üyeliğinizi iptal ederseniz, aktif paketiniz sona erecektir.
                        </p>
                      </div>
                      <Button
                        onClick={handleCancelMembership}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Üyeliğimi İptal Et
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Oturumu Kapat
                  </Button>
                </div>
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
