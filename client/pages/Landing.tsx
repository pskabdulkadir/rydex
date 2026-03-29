import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Zap, Radio, MapPin, Eye, Smartphone, Cloud, MessageCircle } from 'lucide-react';
import { PACKAGES, getPackagesByCategory } from '@shared/packages';
import { PricingCard } from '@/components/PricingCard';
import { useDemo } from '@/lib/hooks/useDemo';

type NavTab = 'home' | 'features' | 'benefits' | 'pricing';

export default function Landing() {
  const navigate = useNavigate();
  const { startDemo } = useDemo();
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [activeTab, setActiveTab] = useState<'all' | 'basic' | 'pro' | 'corporate'>('all');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelectPackage = (packageId: string) => {
    // Seçilen paketid'yi localStorage'a kaydet
    localStorage.setItem('selectedPackageId', packageId);
    // Üye ol sayfasına yönlendir
    navigate('/member-register');
  };

  const getPackages = () => {
    if (activeTab === 'all') return Object.values(PACKAGES);
    return getPackagesByCategory(activeTab === 'corporate' ? 'corporate' : activeTab === 'pro' ? 'pro' : 'basic');
  };

  const packages = getPackages();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-lg border-b border-slate-700/30' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveNav('home')}>
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
              🔍
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">rydex</h1>
              <p className="text-xs text-amber-400">Arkeolojik Analiz Sistemi</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveNav('features')}
              className={`text-sm font-semibold transition-colors ${
                activeNav === 'features' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Özellikler
            </button>
            <button
              onClick={() => setActiveNav('benefits')}
              className={`text-sm font-semibold transition-colors ${
                activeNav === 'benefits' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Faydaları
            </button>
            <button
              onClick={() => setActiveNav('pricing')}
              className={`text-sm font-semibold transition-colors ${
                activeNav === 'pricing' ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fiyatlandırma
            </button>
            <button
              onClick={() => navigate('/member-login')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-blue-500/30 text-white rounded-lg text-sm font-semibold transition-all"
            >
              👤 Giriş Yap
            </button>
            <button
              onClick={() => navigate('/member-register')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 border border-green-500/30 text-white rounded-lg text-sm font-semibold transition-all"
            >
              ✨ Üye Ol
            </button>
          </nav>
        </div>
      </header>

      {/* HOME TAB */}
      {activeNav === 'home' && (
        <>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-slate-950 to-slate-950 pointer-events-none" />
            <div className="absolute top-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto">
              {/* Main headline */}
              <div className="text-center mb-8">
                <div className="inline-block mb-6 px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full">
                  <span className="text-amber-300 text-sm font-semibold">🚀 Yeni Nesil Yer Altı Görüntüleme</span>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">TEKNOLOJİYLE</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                    TOPRAĞIN ALTINI GÖRÜN
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  3D Radar ve Analiz Yazılımı ile yer altındaki oda, tünel ve metal anomalilerini akıllı telefonunuzda gerçek zamanlı olarak görüntüleyin.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                {/* DEMO TEST ET BUTTON - Her tarayıcıda gösteril */}
                <button
                  onClick={() => {
                    // ==========================================
                    // 🎯 DEMO TEST BAŞLAT (3 DAKİKA)
                    // Her tarayıcıda yeni demo başlat (localStorage temiz yap)
                    // ==========================================
                    // Önceki demo verilerini temizle
                    localStorage.removeItem('demoMode');
                    localStorage.removeItem('demoStartTime');
                    localStorage.removeItem('demoExpireTime');

                    // Yeni demo başlat
                    startDemo(3); // 3 dakika

                    // localStorage'e kaydedildiğini doğrula
                    console.log('✅ Demo kaydedildi - localStorage kontrol:', {
                      demoMode: localStorage.getItem('demoMode'),
                      demoExpireTime: localStorage.getItem('demoExpireTime')
                    });

                    // Üye kayıt formuna yönlendir (Demo için kaydolmayan kullanıcılar)
                    setTimeout(() => {
                      navigate('/member-register', {
                        state: { demoMode: true }
                      });
                    }, 300);
                  }}
                  className="relative px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-400 hover:via-emerald-400 hover:to-green-500 text-white font-bold text-lg rounded-lg transition-all shadow-2xl shadow-green-500/40 hover:shadow-green-500/60 flex items-center gap-2 group overflow-hidden"
                >
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <Play className="w-5 h-5 group-hover:animate-bounce" />
                  <span>🎮 3 Dakika Demo Test Et</span>

                  {/* Pulse indicator */}
                  <span className="absolute top-2 right-2 w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                </button>
                <button onClick={() => setActiveNav('features')} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Özellikler Gör
                </button>
                <button onClick={() => setActiveNav('pricing')} className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-lg transition-all">
                  Paketleri Keşfet
                </button>
              </div>

              {/* Hero Image Placeholder */}
              <div className="rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl shadow-orange-500/10 bg-slate-900/50 backdrop-blur">
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                  <img 
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb4ea1ece8f44476789e3a025e4638202%2F90db532df36c4318b7c2c18928d39493?format=webp&width=800" 
                    alt="GEOSCAN-X Demo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                </div>
              </div>
            </div>
          </section>

          {/* Key Messages on Home */}
          <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900/50">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: 'Gizem ve Keşif',
                    desc: 'Yer altındaki bilinmeyenleri keşfetme heyecanını yaşayın.',
                  },
                  {
                    title: 'Görünmeyeni Görmek',
                    desc: 'Sıradan gözle görmek imkânsız olan şeyleri teknoloji ile görüntüleyin.',
                  },
                  {
                    title: 'Sadece Duymak Yetmez',
                    desc: 'Dedektörlerin ses yerine görsel kanıtlar ile kesin sonuçlar alın.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-8 text-center">
                    <h3 className="text-2xl font-bold text-amber-300 mb-3">{item.title}</h3>
                    <p className="text-slate-300">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-8 sm:p-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-4">Geleceğin Teknolojisi Cebinizde</h3>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Akıllı telefonunuzu profesyonel bir yer altı görüntüleme radar istasyonuna dönüştürün. 
                  Gerçek zamanlı analiz, 3D detaylı modelleme ve hatasız veri işleme ile keşif yapın.
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* FEATURES TAB */}
      {activeNav === 'features' && (
        <>
          {/* Features Section */}
          <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="text-white">Bu Yazılım</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Neler Yapıyor?</span>
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Sıradan dedektörlerin "bip" sesleriyle vakit kaybetmeyin. Profesyonel bir yer altı görüntüleme sistemi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feature 1 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <Eye className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">3D Görselleştirme</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Three.js altyapısı ile toprağın altındaki oda, tünel ve büyük metal anomalilerini telefon ekranında 3D model olarak döndürün, inceleyin.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <Radio className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Hassas Manyetometre Analizi</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Telefonunuzun manyetik sensörlerini kullanarak yer altındaki yapısal bozulmaları yakalar ve analiz eder.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <Smartphone className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">AR (Artırılmış Gerçeklik)</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Kamerayı toprağa tutun; sanki yerin altı şeffaflaşmış gibi tünel ve boşluk yapılarını canlı görüntü üzerinde görün.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Metal Ayrım Algoritması</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Değerli ve değersiz metal sinyallerini birbirinden ayıran özel filtreleme ile doğru sonuçlar elde edin.
                    </p>
                  </div>
                </div>

                {/* Feature 5 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <MapPin className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Derinlik Tahmini</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Anomali merkezinden alınan verilerle tahmini derinlik hesaplama ve konumlandırma.
                    </p>
                  </div>
                </div>

                {/* Feature 6 */}
                <div className="group">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all duration-300 h-full">
                    <div className="mb-6 inline-block p-3 bg-amber-500/20 group-hover:bg-amber-500/30 rounded-lg transition-colors">
                      <Cloud className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Firebase Bulut Yedekleme</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Sahada aldığınız tüm verileri anında buluta yedekleyin, asla kaybetmeyin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="text-white">3D Derinlik ve</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Teknik Özellikler</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb4ea1ece8f44476789e3a025e4638202%2Fec2f597666da4cbe9ccfdd09cefc6fb3?format=webp&width=800"
                    alt="3D Derinlik Analizi"
                    className="rounded-xl border border-slate-700/50 shadow-2xl"
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all">
                    <h4 className="text-xl font-bold text-amber-400 mb-2">12,500+ Veri Noktası</h4>
                    <p className="text-slate-300">Her tarama için 12,500 üzerinde veri noktası işlenir ve analiz edilir.</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all">
                    <h4 className="text-xl font-bold text-amber-400 mb-2">Three.js 3D Rendering</h4>
                    <p className="text-slate-300">Profesyonel seviye 3D görselleştirme ile detaylı model inceleme.</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all">
                    <h4 className="text-xl font-bold text-amber-400 mb-2">Anomali Ayrım Algoritması</h4>
                    <p className="text-slate-300">Gerçek metal anomalilerini gürültüden ayıran gelişmiş filtreleme.</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all">
                    <h4 className="text-xl font-bold text-amber-400 mb-2">PWA Teknolojisi</h4>
                    <p className="text-slate-300">Çevrim dışı kullanım ve anında güncelleme desteği.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* BENEFITS TAB */}
      {activeNav === 'benefits' && (
        <>
          {/* Benefits Section */}
          <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="text-white">Kimler İçin</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Uygun?</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Hobi */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all">
                  <div className="mb-6">
                    <div className="text-5xl mb-4">🔎</div>
                    <h3 className="text-2xl font-bold text-white">Hobi Meraklıları</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Boşluk, oda ve mezar yapılarını bulmak isteyenler için görsel kanıt sunar.
                  </p>
                </div>

                {/* İnşaat */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all">
                  <div className="mb-6">
                    <div className="text-5xl mb-4">🏗️</div>
                    <h3 className="text-2xl font-bold text-white">İnşaat & Altyapı</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Kepçe girmeden önce yer altındaki eski boruları ve temelleri tespit etmek isteyenler.
                  </p>
                </div>

                {/* Profesyonel */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-amber-500/30 transition-all">
                  <div className="mb-6">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="text-2xl font-bold text-white">Profesyonel Araştırmacılar</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    GPR benzeri analiz yaparak saha raporu oluşturmak isteyenler.
                  </p>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="mt-16 bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-xl p-8 sm:p-12">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">Neden Bizimle Çalışmalısınız?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-2">Piyasa Fiyatlarının Çok Altında</h4>
                      <p className="text-slate-300">On binlerce dolara satılan cihazların sunduğu görsel analizi cebinizdeki telefona getiriyoruz.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-2">Tamamen Yerli Teknoloji</h4>
                      <p className="text-slate-300">Kodlar temiz, sistem tıkır tıkır çalışıyor. Mühendislik ve gerçek sonuçlar.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-2">Gerçek Zamanlı Analiz</h4>
                      <p className="text-slate-300">Binlerce veri noktasını anında işleyen yüksek hızlı motor.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-white mb-2">Veri Güvenliği</h4>
                      <p className="text-slate-300">Firebase tabanlı sistemimizle verileriniz güvende ve sadece sizin kontrolünüzde.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Real Data Section */}
          <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                  <span className="text-white">Gerçek Verilerle</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Saha Analizi</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Manyetometre Verisi', icon: '📡', desc: 'Hassas manyetik alan ölçümü' },
                  { title: '3D Görselleştirme', icon: '🎯', desc: 'Katmanlı derinlik analizi' },
                  { title: 'GPR Analizi', icon: '📍', desc: 'Yer radarı simülasyonu' },
                  { title: 'Metal Ayrımı', icon: '⚡', desc: 'Değerli metal tespiti' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 text-center hover:border-amber-500/30 transition-all">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
                  <img 
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb4ea1ece8f44476789e3a025e4638202%2F22d704aa978d471cb0d3b715714cca0b?format=webp&width=800"
                    alt="Tarım Arazı Analizi"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-white mb-2">Tarım Arazi Analizi</h4>
                    <p className="text-slate-300">Tarım topraklarında yer altı yapıları ve mineral bileşiminin analizi.</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all">
                  <img 
                    src="https://cdn.builder.io/api/v1/image/assets%2Fb4ea1ece8f44476789e3a025e4638202%2F0f1381969f26488c8e964325a72fcd39?format=webp&width=800"
                    alt="Maden Taraması"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-white mb-2">Maden ve Mineral Tespiti</h4>
                    <p className="text-slate-300">Yer altındaki değerli metal ve mineral yataklarının bulunması.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* PRICING TAB */}
      {activeNav === 'pricing' && (
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-white">Paket</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Seçenekleri</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Her bütçe ve ihtiyaç için tasarlanmış paketler. Ödeme yaptığınızda anında erişim sağlanır.
              </p>
            </div>

            {/* Package Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {(['all', 'basic', 'pro', 'corporate'] as const).map((tab) => (
                <button
                  key={tab}
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

            {/* Pricing Cards Grid */}
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

            {/* Pricing note */}
            <div className="max-w-2xl mx-auto bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-300">
                <span className="text-amber-400 font-semibold">💳 Ödeme Seçenekleri:</span> Kredi Kartı, Banka Transferi, Kripto Paraları destekler.
                Emanet (Escrow) sistemi ile güvenli işlem garantili.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Always visible */}
      {activeNav !== 'pricing' && (
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-slate-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-white">Hazır mısınız?</span>
                <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Keşfe Başlayın</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Görmediğiniz yere kazma vurmayın. Önce analiz edin, sonra hareket edin.
            </p>
            <button onClick={() => setActiveNav('pricing')} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-lg transition-all shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 text-lg">
              Paket Seçimi Yap
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-700/30 py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">GEOSCAN-X</h4>
              <p className="text-sm text-slate-400">Arkeolojik Yüzey Araştırması Analiz Cihazı</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><button onClick={() => setActiveNav('features')} className="hover:text-white transition-colors">Özellikler</button></li>
                <li><button onClick={() => setActiveNav('benefits')} className="hover:text-white transition-colors">Faydaları</button></li>
                <li><button onClick={() => setActiveNav('pricing')} className="hover:text-white transition-colors">Fiyatlandırma</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hukuki</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Gizlilik</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Şartlar</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: info@geoscan-x.com</li>
                <li className="hover:text-white transition-colors cursor-pointer">Destek</li>
                <li className="mt-4">
                  <a
                    href="https://wa.me/905425783748"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp: +90 542 578 37 48
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700/30 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 GEOSCAN-X. Tüm hakları saklıdır. | Eğlence amaçlı simülasyon programıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
