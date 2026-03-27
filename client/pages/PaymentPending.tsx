import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PACKAGES } from '@shared/packages';

export default function PaymentPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [checkCount, setCheckCount] = useState(0);

  const packageId = searchParams.get('packageId') || 'starter';
  const userId = localStorage.getItem('userId') || 'demo-user';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const userName = localStorage.getItem('userName') || 'Kullanıcı';

  const pkg = PACKAGES[packageId as keyof typeof PACKAGES];

  // Onay durumunu kontrol et
  useEffect(() => {
    checkApprovalStatus();
    const interval = setInterval(() => {
      checkApprovalStatus();
      setCheckCount(prev => prev + 1);
    }, 5000); // Her 5 saniyede bir kontrol et

    return () => clearInterval(interval);
  }, [userId]);

  const checkApprovalStatus = async () => {
    try {
      // localStorage'dan kullanıcı durumunu kontrol et
      const userDataStr = localStorage.getItem(`user_${userId}`);
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.approval_status === 'approved') {
          setApprovalStatus('approved');
          toast.success('✅ Üyeliğiniz admin tarafından onaylandı!');
          setTimeout(() => {
            navigate('/member-panel');
          }, 2000);
          return;
        } else if (userData.approval_status === 'rejected') {
          setApprovalStatus('rejected');
          toast.error('❌ Üyeliğiniz reddedilmiştir.');
          return;
        }
      }

      // API'den kontrol et (opsiyonel)
      // const response = await fetch(`/api/user/${userId}/approval-status`);
      // Şimdilik localStorage kullanıyoruz
    } catch (error) {
      console.error('Onay durumu kontrol hatası:', error);
    }
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/905425783748', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate('/landing')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Ana Sayfaya Dön
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {approvalStatus === 'pending' && (
          <div className="space-y-8">
            {/* Pending Status Card */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                  <Clock className="w-20 h-20 text-amber-400 animate-spin" />
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Siparişiniz Alındı! 🎉
              </h1>

              <p className="text-lg text-amber-100 mb-6">
                Ödemeniz başarıyla kaydedildi. Admin onayı bekleniyor...
              </p>

              <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold text-amber-300 mb-2">Paket Detayları</h2>
                <div className="space-y-2 text-amber-100">
                  <p><strong>Paket:</strong> {pkg?.name || packageId}</p>
                  <p><strong>Süre:</strong> {pkg?.duration || 'Belirlenmedi'}</p>
                  <p><strong>Fiyat:</strong> {pkg?.price?.toLocaleString('tr-TR') || '0'} ₺</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Onay Süreci</h2>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-green-400">
                      ✓
                    </div>
                    <div className="w-0.5 h-12 bg-slate-700 my-1"></div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-white font-semibold">Ödeme Alındı</h3>
                    <p className="text-slate-400 text-sm">Siparişiniz sisteme kaydedildi</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      approvalStatus === 'approved'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse'
                    }`}>
                      {approvalStatus === 'approved' ? '✓' : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="w-0.5 h-12 bg-slate-700 my-1"></div>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-white font-semibold">Admin Onayı Bekleniyor</h3>
                    <p className="text-slate-400 text-sm">
                      {approvalStatus === 'approved'
                        ? 'Başarıyla onaylandı!'
                        : 'Genellikle 1-2 saat içinde tamamlanır'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                      approvalStatus === 'approved'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-slate-700 border-slate-600 text-slate-500'
                    }`}>
                      {approvalStatus === 'approved' ? '✓' : '3'}
                    </div>
                  </div>
                  <div className="pt-1">
                    <h3 className={`font-semibold ${
                      approvalStatus === 'approved' ? 'text-white' : 'text-slate-500'
                    }`}>
                      Erişim Sağlanacak
                    </h3>
                    <p className="text-slate-500 text-sm">
                      {approvalStatus === 'approved'
                        ? 'Panel erişiminiz aktif hale getirildi'
                        : 'Onay sonrası otomatik aktif olacak'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Notification */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">E-Posta Bildirimi</h3>
                    <p className="text-slate-400 text-sm">
                      {userEmail} adresine onay durumu gönderilecektir
                    </p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Canlı Destek</h3>
                    <p className="text-slate-400 text-sm">
                      Sorularınız için WhatsApp üzerinden iletişim kurabilirsiniz
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleContactSupport}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Desteği
              </button>
              <button
                onClick={() => navigate('/landing')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Ana Sayfaya Dön
              </button>
            </div>

            {/* Status Check Counter */}
            <div className="text-center text-slate-500 text-sm pt-4">
              Durum otomatik olarak kontrol ediliyor... ({checkCount})
            </div>
          </div>
        )}

        {approvalStatus === 'approved' && (
          <div className="space-y-8">
            {/* Approved Card */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-20 h-20 text-green-400" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Hoş Geldiniz! 🎊
              </h1>

              <p className="text-lg text-green-100 mb-6">
                Üyeliğiniz başarıyla onaylandı. Şimdi pannele erişebilirsiniz.
              </p>

              <p className="text-slate-300 mb-8">
                Panel açılıyor... lütfen bekleyin.
              </p>

              <button
                onClick={() => navigate('/member-panel')}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                Şimdi Pannele Git →
              </button>
            </div>
          </div>
        )}

        {approvalStatus === 'rejected' && (
          <div className="space-y-8">
            {/* Rejected Card */}
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-20 h-20 text-red-400" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                Başvuru Reddedildi
              </h1>

              <p className="text-lg text-red-100 mb-6">
                Üzgünüz, başvurunuz admin tarafından reddedilmiştir.
              </p>

              <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-red-100 text-sm">
                  Daha fazla bilgi veya itiraz için lütfen destek ekibi ile iletişime geçiniz.
                </p>
              </div>

              <button
                onClick={handleContactSupport}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors inline-block"
              >
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Destek ile İletişime Geç
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700/30 py-6 px-4 sm:px-6 lg:px-8 bg-slate-950/50 mt-12">
        <div className="max-w-4xl mx-auto text-center text-slate-400 text-sm">
          <p>Sorularınız mı var? <a href="https://wa.me/905425783748" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">WhatsApp</a> üzerinden destek alabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
}
