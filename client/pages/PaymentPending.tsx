import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Payment Pending sayfası - Admin onayı kaldırılmıştır
 * Bu sayfa artık kullanılmamaktadır. Tüm istekler doğrudan Payment Success'e yönlendirilir.
 */
export default function PaymentPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Hemen payment-success sayfasına yönlendir
    const packageId = searchParams.get('packageId') || 'starter';

    console.log('⏭️ Payment Pending sayfasından Payment Success sayfasına yönlendiriliyor...');

    navigate(`/payment-success?packageId=${packageId}`, { replace: true });
  }, [navigate, searchParams]);

  // Payment Success sayfasına yönlendiriliyor...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-300">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
