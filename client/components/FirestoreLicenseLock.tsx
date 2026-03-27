import React from 'react';
import { Lock, AlertCircle, Loader2, Clock, Power } from 'lucide-react';
import { LicenseCheckResult } from '@/lib/use-license-firestore';

interface FirestoreLicenseLockProps {
  licenseCheck: LicenseCheckResult;
  children: React.ReactNode;
}

/**
 * Firestore lisans kontrol ekranı
 * 
 * Şunları gösterir:
 * - Yükleme ekranı (loading sırasında)
 * - Kilit ekranı (lisans geçersiz ise)
 * - İçerik (lisans geçerli ise)
 */
export const FirestoreLicenseLock: React.FC<FirestoreLicenseLockProps> = ({
  licenseCheck,
  children,
}) => {
  // Yükleme sırasında
  if (licenseCheck.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Lisans kontrol ediliyor...</p>
          <p className="text-slate-500 text-sm mt-2">Lütfen bekleyiniz...</p>
        </div>
      </div>
    );
  }

  // Lisans geçerli ise içeriği göster
  if (licenseCheck.isValid) {
    return <>{children}</>;
  }

  // KİLİT EKRANI: Lisans geçersiz
  const isExpired = licenseCheck.error?.includes('süresi dolmuş') || false;
  const isInactive = licenseCheck.error?.includes('kapatılmış') || false;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black p-4">
      <div className="w-full max-w-md">
        {/* Kilit simgesi ve dekorasyon */}
        <div className="mb-8">
          <div className="relative flex justify-center mb-8">
            {/* Parlayan arka plan efekti */}
            <div className="absolute inset-0 flex justify-center">
              <div className="w-32 h-32 bg-red-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Kilit simgesi */}
            <div className="relative bg-gradient-to-br from-red-600 to-red-700 p-6 rounded-full shadow-2xl">
              <Lock className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Ana başlık */}
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {isExpired && 'Lisans Süresi Dolmuş'}
          {isInactive && 'Lisans Kapatılmış'}
          {!isExpired && !isInactive && 'Erişim Reddedildi'}
        </h1>

        {/* Alt başlık / açıklama */}
        <p className="text-slate-400 text-center mb-8">
          {isExpired && 'Lisansınız süresi dolmuştur. Sisteme erişim sağlanamaz.'}
          {isInactive && 'Lisansınız kapatılmış durumda. Sisteme erişim sağlanamaz.'}
          {!isExpired && !isInactive && 'Sisteme erişim sağlamak için geçerli bir lisansa ihtiyacınız vardır.'}
        </p>

        {/* Hata mesajı kutusu */}
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-6 mb-8">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Hata Detayı</p>
              <p className="text-red-300 text-sm mt-1">{licenseCheck.error}</p>
            </div>
          </div>

          {/* Durum bilgileri */}
          <div className="space-y-2 text-xs text-red-300/80 mt-4 pt-4 border-t border-red-700/30">
            {licenseCheck.licenseData && (
              <>
                <div className="flex items-center gap-2">
                  {isInactive ? (
                    <>
                      <Power className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Durum: Kapatılmış</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Bitiş: {licenseCheck.licenseData.expiryDate.toLocaleDateString('tr-TR')}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Açıklama paneli */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4 mb-8">
          <h2 className="text-slate-300 font-semibold text-sm flex items-center gap-2">
            <span className="text-lg">ℹ️</span> Ne yapmalısınız?
          </h2>

          <ol className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <span className="font-bold text-slate-500 flex-shrink-0 w-6">1.</span>
              <span>{isExpired ? 'Lisansınızı yenileyin' : 'Yöneticinizle iletişime geçin'}</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-500 flex-shrink-0 w-6">2.</span>
              <span>Yeni lisans anahtarı alın</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-slate-500 flex-shrink-0 w-6">3.</span>
              <span>Sayfayı yenileyerek tekrar deneyin</span>
            </li>
          </ol>
        </div>

        {/* Yenileme düğmesi */}
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
        >
          Sayfayı Yenile
        </button>

        {/* Alt bilgi */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 text-xs">
            Lisans Kontrol Sistemi • Firestore Entegrasyonu
          </p>
        </div>
      </div>
    </div>
  );
}
