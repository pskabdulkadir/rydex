import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PricingCard } from '@/components/PricingCard';
import { useAuth } from '@/lib/auth-context';
import { getPackagesByCategory, PACKAGES } from '@shared/packages';
import { toast } from 'sonner';

type PricingTab = 'all' | 'basic' | 'pro' | 'corporate';

export default function Pricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PricingTab>('all');

  const pricingState = location.state as { from?: string } | null;

  const handleBackClick = () => {
    const backTo = typeof pricingState?.from === 'string' ? pricingState.from : '/';
    navigate(backTo, { replace: true });
  };

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
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-3">
          <Button
            type="button"
            onClick={handleBackClick}
            variant="ghost"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Geri Dön</span>
          </Button>
        </div>

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
                    <td className="py-3 px-4 text-slate-300">
                      {pkg.requiresEscrow ? 'Müzakere edilir' : `₺${pkg.price.toLocaleString('tr-TR')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ÜRÜN VE HİZMET AYRINTILARI */}
        <div className="mt-16">
          <Card className="p-8 bg-slate-900/50 border border-slate-700/50">
            <h2 className="text-2xl font-bold text-white mb-8">📋 ÜRÜN VE HİZMET AYRINTILARI</h2>

            <div className="text-slate-300 mb-12 leading-relaxed">
              <p className="mb-6">
                Aşağıdaki tüm paketler, <span className="font-semibold text-amber-400">Rydex Yeraltı Dünyası Simülasyon Yazılımı</span> içerisinde belirli sürelerle tanımlanan dijital kullanım haklarını kapsamaktadır. Satın alınan her paket, kullanıcının seçtiği süre boyunca ilgili teknik araçlara erişimini sağlar.
              </p>
            </div>

            {/* Service Packages */}
            <div className="space-y-8">
              {/* Starter */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">📦 1. Starter Scan (Temel Tarama)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>1 Saat kesintisiz erişim.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>Yazılım içindeki temel 3D görselleştirme motoruna erişim, standart harita katmanlarını görüntüleme ve analiz sonuçlarına manuel işaretçi (marker) yerleştirme yetkisidir.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Çıktı:</p>
                    <p>Temel düzeyde simülasyon raporu görüntüleme.</p>
                  </div>
                </div>
              </div>

              {/* Pro */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">📦 2. Pro Explorer (Profesyonel Kaşif)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>3 Saat kesintisiz erişim.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>Starter paketindeki tüm özelliklere ek olarak; simülasyon algoritmasında Metal Ayrımı fonksiyonunun aktif edilmesi ve yeraltı katmanlarının dijital olarak birbirinden ayrıştırılması (Katman Analizi) hizmetidir.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Çıktı:</p>
                    <p>Verilerin dijital olarak dışa aktarılması (Export) imkanı.</p>
                  </div>
                </div>
              </div>

              {/* Deep */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">📦 3. Deep Analyser (Derin Analiz)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>12 Saat kesintisiz erişim.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>Pro paketine ek olarak; GPR (Yer Radarı) simülasyon modülünün aktif edilmesi, çok katmanlı veri analitiği ve yazılımın veri tabanına sınırlı API erişimi sağlanmasıdır.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Çıktı:</p>
                    <p>İleri seviye analitik grafikler ve derinlik kestirim modelleri.</p>
                  </div>
                </div>
              </div>

              {/* Ultimate */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">📦 4. Ultimate Access (Tam Erişim)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>24 Saat kesintisiz erişim.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>Yazılımın tüm modülleri (GPR, Metal Ayrımı, Sensör Verisi) sınırsız olarak kullanıma açılır. Gerçek zamanlı veri akışı simülasyonu ve öncelikli teknik destek hattı dahildir.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Çıktı:</p>
                    <p>Tüm ileri seviye analitik araçları ve özel raporlama modülleri.</p>
                  </div>
                </div>
              </div>

              {/* Monthly */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">🏢 5. Monthly Corp (Kurumsal Aylık)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>30 Takvim Günü.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>5 kullanıcıya kadar ekip yönetimi, 100GB Bulut veri depolama alanı ve kurumsal raporlama modülüdür. Yazılımın API v2 versiyonu ile dış sistemlerle tam entegrasyon hakkı tanınır.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Çıktı:</p>
                    <p>Kurumsal düzey analitik ve ekip işbirliği araçları.</p>
                  </div>
                </div>
              </div>

              {/* Master */}
              <div className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">🔐 6. Master License (Ömür Boyu & Ticari Haklar)</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div>
                    <p className="font-semibold text-amber-400">Hizmet Süresi:</p>
                    <p>Sınırsız / Ömür Boyu.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Teknik Kapsam:</p>
                    <p>Yazılımın kaynak kod erişimi, ticari amaçla yeniden markalandırma (White-Label) hakkı ve yazılımın ticari mülkiyet haklarının devridir.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-400">Güvence:</p>
                    <p>Bu işlem <span className="text-amber-400 font-semibold">Emanet Süreci (Escrow) protokolü</span> ile yasal güvence altına alınarak tamamlanmaktadır.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-blue-400">💡 Bilgi:</span> Fiyatlara KDV dahildir. Master License gibi yüksek tutar işlemlerde müşteri hizmetlerimiz ile iletişime geçerek en uygun koşulları belirleyebilirsiniz.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
