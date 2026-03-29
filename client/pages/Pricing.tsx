import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PricingCard } from '@/components/PricingCard';
import { useAuth } from '@/lib/auth-context';
import { getPackagesByCategory, PACKAGES } from '@shared/packages';
import { toast } from 'sonner';

type PricingTab = 'all' | 'basic' | 'pro' | 'corporate';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PricingTab>('all');

  const packages = useMemo(() => {
    if (activeTab === 'all') {
      return Object.values(PACKAGES);
    }

    if (activeTab === 'corporate') {
      return getPackagesByCategory('corporate');
    }

    return getPackagesByCategory(activeTab === 'pro' ? 'pro' : 'basic');
  }, [activeTab]);

  const handleSelectPackage = (packageId: string) => {
    if (!user) {
      toast.error('Satın almak için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    navigate('/checkout', { state: { packageId } });
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Pricing Planları</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Sizin için uygun olan paketi seçin. "Satın Al" ile doğrudan checkout sayfasına geçip ödemeyi tamamlayabilirsiniz.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {(['all', 'basic', 'pro', 'corporate'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              {tab === 'all' && '📦 Tümü'}
              {tab === 'basic' && '🟢 Başlangıç'}
              {tab === 'pro' && '🔵 Profesyonel'}
              {tab === 'corporate' && '🏢 Kurumsal'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <PricingCard
              key={pkg.id}
              package={pkg}
              onSelect={handleSelectPackage}
              isPopular={pkg.id === 'ultimate' || pkg.id === 'monthly'}
            />
          ))}
        </div>

        <Card className="p-8 bg-slate-900/50 border border-slate-700/50 text-slate-200">
          <h2 className="text-2xl font-bold text-white mb-6">Özellik Karşılaştırması</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-white">Paket</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Süre</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Teknik Erişim</th>
                  <th className="text-left py-3 px-4 font-semibold text-white">Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(PACKAGES).map((pkg) => (
                  <tr key={pkg.id} className="border-b border-slate-800 last:border-b-0">
                    <td className="py-3 px-4 font-medium text-white">{pkg.name}</td>
                    <td className="py-3 px-4 text-slate-300">{pkg.duration}</td>
                    <td className="py-3 px-4 text-slate-300">{pkg.technicalAccess}</td>
                    <td className="py-3 px-4 text-slate-300">₺{pkg.price.toLocaleString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
