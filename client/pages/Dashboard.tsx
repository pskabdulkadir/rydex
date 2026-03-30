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
  Calendar,
  Gauge,
  BarChart3,
  ArrowRight,
  Settings,
  Smartphone,
  Hourglass,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { PACKAGES } from '@shared/packages';
import { useDemo } from '@/lib/hooks/useDemo';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { demoStatus } = useDemo();
  const [subscription, setSubscription] = useState<any>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Kontrol et - kullanıcı giriş yapmamışsa redirect et
  // ANCAK: Demo mode aktifse auth kontrolü skip et (herkes demo kullanabilsin)
  useEffect(() => {
    if (!authLoading && !user && !demoStatus.isActive) {
      navigate('/login');
      return;
    }
  }, [user, authLoading, navigate, demoStatus.isActive]);

  // Subscription'ı localStorage'dan çek
  useEffect(() => {
    const savedSub = localStorage.getItem('subscription');
    if (savedSub) {
      try {
        const sub = JSON.parse(savedSub);
        setSubscription(sub);
        
        // Kalan günü hesapla
        const remaining = Math.max(0, Math.ceil((sub.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
        setDaysRemaining(remaining);
      } catch (e) {
        console.warn('Subscription parse hatası:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Çıkış yapıldı');
      navigate('/login');
    } catch (error) {
      toast.error('Çıkış sırasında hata oluştu');
    }
  };

  const getPackageInfo = (packageId: string) => {
    if (!packageId) return undefined;
    return PACKAGES[packageId as keyof typeof PACKAGES];
  };

  const getPackageFeatures = (packageId: string) => {
    if (!packageId) return null;
    const pkg = getPackageInfo(packageId);
    if (!pkg) return null;
    return pkg.features;
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const features = subscription && subscription.packageId ? getPackageFeatures(subscription.packageId) : null;
  const pkg = subscription && subscription.packageId ? getPackageInfo(subscription.packageId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Üye Paneli</h1>
            <p className="text-blue-100">Hoş geldiniz, <span className="font-semibold">{user.username}</span></p>
            <p className="text-blue-100 text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🏠 Ana Sayfaya Dön
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* DEMO MODE - TIMER GÖSTERILMEZ (Sistem arka planda otomatik kontrol eder) */}
        {/* Subscription Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscription ? (
            <>
              {/* Active Subscription Card */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-200 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Aktif Abonelik</h3>
                      <p className="text-sm text-green-700">Pakete sahipsiniz</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t border-green-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">Paket Adı:</span>
                    <span className="text-slate-900 font-bold">{pkg?.name || subscription.packageId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">Başlangıç:</span>
                    <span className="text-slate-900">{new Date(subscription.startDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700 font-semibold">Bitiş Tarihi:</span>
                    <span className="text-slate-900">{new Date(subscription.endDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              </Card>

              {/* Remaining Time Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-200 rounded-lg">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Kalan Süre</h3>
                      <p className="text-sm text-blue-700">Paketinizin geçerliliği</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-blue-600">{daysRemaining}</p>
                    <p className="text-slate-600 font-semibold">Gün Kaldı</p>
                  </div>

                  {daysRemaining <= 7 && daysRemaining > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">Aboneliğiniz yakında bitecek</p>
                    </div>
                  )}

                  {daysRemaining <= 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">Aboneliğiniz süresi doldu</p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            /* No Subscription Card */
            <div className="md:col-span-2">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-200 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Aktif Paket Yok</h3>
                      <p className="text-sm text-orange-700">Uygulamayı kullanmak için bir paket satın almalısınız</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-4"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Paket Seç
                </Button>
              </Card>
            </div>
          )}
        </div>

        {/* Package Features */}
        {features && (
          <Card className="bg-white border-2 border-blue-200 p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Paket Özellikleri
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-semibold text-slate-700">Günlük Tarama Limiti</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{subscription.packageId === 'starter' ? 3 : subscription.packageId === 'pro' ? 10 : subscription.packageId === 'deep' ? 50 : 'Sınırsız'}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-semibold text-slate-700">Maks Tarama Süresi</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{subscription.packageId === 'starter' ? '3600s' : subscription.packageId === 'pro' ? '10800s' : subscription.packageId === 'deep' ? '43200s' : 'Sınırsız'}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-semibold text-slate-700">Özel Analiz</p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  {subscription.packageId === 'ultimate' || subscription.packageId === 'monthly' || subscription.packageId === 'master' ? '✓ Etkin' : '✗ Devre Dışı'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-slate-700">Admin Paneli</p>
                </div>
                <p className="text-lg font-bold text-red-600">
                  {subscription.packageId === 'monthly' || subscription.packageId === 'master' ? '✓ Etkin' : '✗ Devre Dışı'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* System Info */}
        <Card className="bg-white border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-blue-600" />
            Sistem Bilgileri
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold mb-1">Kullanıcı Kimliği</p>
              <p className="text-slate-900 font-mono text-sm truncate">{user.uid}</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold mb-1">Kayıt Tarihi</p>
              <p className="text-slate-900">
                {typeof user.createdAt === 'number'
                  ? new Date(user.createdAt).toLocaleDateString('tr-TR')
                  : new Date(user.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 font-semibold mb-1">Telefon</p>
              <p className="text-slate-900">{user.phone || 'Belirtilmedi'}</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscription && daysRemaining > 0 && (
            <Button
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-6 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Uygulamaya Git
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}

          <Button
            onClick={() => navigate('/pricing')}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-6 text-lg"
          >
            <Package className="w-5 h-5 mr-2" />
            {subscription ? 'Paket Yükselt' : 'Paket Satın Al'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
