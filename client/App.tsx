import "./global.css";

import { useEffect, useState, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Outlet, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DeviceLock } from "@/components/DeviceLock";

import { LocationProvider } from "@/lib/location-context";
import { CameraProvider } from "@/lib/camera-context";
import { NetworkProvider } from "@/lib/network-context";
import { AccessControlProvider } from "@/lib/access-control-context";
import { AuthProvider } from "@/lib/auth-context";
import { AdminProvider } from "@/lib/admin-context";
import { useConnectionSync } from "@/lib/use-connection-sync";
import { initializeSync } from "@/lib/sync-manager";
import { initializeDB } from "@/lib/local-db";
import { useDemo } from "@/lib/hooks/useDemo";

// Lazy loaded pages for better performance
const Scanner = lazy(() => import("./pages/Scanner"));
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MemberPanel = lazy(() => import("./pages/MemberPanel"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentExpired = lazy(() => import("./pages/PaymentExpired"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const CameraAnalysisDetail = lazy(() => import("./pages/CameraAnalysisDetail"));
const ApplicationFeaturesDetail = lazy(() => import("./pages/ApplicationFeaturesDetail"));
const MagnetometerDetail = lazy(() => import("./pages/MagnetometerDetail"));
const Viewer3DDetail = lazy(() => import("./pages/Viewer3DDetail"));
const SatelliteAnalysisDetail = lazy(() => import("./pages/SatelliteAnalysisDetail"));
const ThermalEnergyDetail = lazy(() => import("./pages/ThermalEnergyDetail"));
const RadarScanDetail = lazy(() => import("./pages/RadarScanDetail"));
const TreasureDetectionDetail = lazy(() => import("./pages/TreasureDetectionDetail"));
const MapDetectionsDetail = lazy(() => import("./pages/MapDetectionsDetail"));
const ScanHistoryDetail = lazy(() => import("./pages/ScanHistoryDetail"));
const ARAnalysisDetail = lazy(() => import("./pages/ARAnalysisDetail"));
const AreaScanDetail = lazy(() => import("./pages/AreaScanDetail"));
const StructureScanDetail = lazy(() => import("./pages/StructureScanDetail"));
const AdvancedAnalyticsDetail = lazy(() => import("./pages/AdvancedAnalyticsDetail"));
const TopographyDetail = lazy(() => import("./pages/TopographyDetail"));
const VegetationDetail = lazy(() => import("./pages/VegetationDetail"));
const SignalAnalysisDetail = lazy(() => import("./pages/SignalAnalysisDetail"));
const OceanAnalysisDetail = lazy(() => import("./pages/OceanAnalysisDetail"));
const ClimateDataDetail = lazy(() => import("./pages/ClimateDataDetail"));
const WindAnalysisDetail = lazy(() => import("./pages/WindAnalysisDetail"));
const SoilCompositionDetail = lazy(() => import("./pages/SoilCompositionDetail"));
const MicroorganismsDetail = lazy(() => import("./pages/MicroorganismsDetail"));
const RadioactivityDetail = lazy(() => import("./pages/RadioactivityDetail"));
const VisionAnalysisDetail = lazy(() => import("./pages/VisionAnalysisDetail"));
const PressureMappingDetail = lazy(() => import("./pages/PressureMappingDetail"));
const TimeSeriesAnalysisDetail = lazy(() => import("./pages/TimeSeriesAnalysisDetail"));
const VolumetricMeasurementDetail = lazy(() => import("./pages/VolumetricMeasurementDetail"));
const GravitationalFieldDetail = lazy(() => import("./pages/GravitationalFieldDetail"));
const SeismicActivityDetail = lazy(() => import("./pages/SeismicActivityDetail"));
const NetworkAnalysisDetail = lazy(() => import("./pages/NetworkAnalysisDetail"));
const ArcheologyDatabaseDetail = lazy(() => import("./pages/ArcheologyDatabaseDetail"));
const RadarScannerPage = lazy(() => import("./pages/RadarScannerPage"));
const AreaScanner = lazy(() => import("./pages/AreaScanner"));
const StructureScanner = lazy(() => import("./pages/StructureScanner"));
const AR = lazy(() => import("./pages/AR"));
const Camera = lazy(() => import("./pages/Camera"));
const History = lazy(() => import("./pages/History"));
const Detections = lazy(() => import("./pages/Detections"));
const Magnetometer = lazy(() => import("./pages/Magnetometer"));
const MapPage = lazy(() => import("./pages/Map"));
const Viewer3DPage = lazy(() => import("./pages/Viewer3D"));
const RealDataPage = lazy(() => import("./pages/RealData"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const TwoFactorAuth = lazy(() => import("./pages/TwoFactorAuth"));
const RefundManagement = lazy(() => import("./pages/RefundManagement"));
const PaymentReconciliation = lazy(() => import("./pages/PaymentReconciliation"));
const SupportTickets = lazy(() => import("./pages/SupportTickets"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="mt-4 text-slate-600">Yükleniyor...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

// Sensör izni isteme fonksiyonu
async function requestSensorPermissions() {
  try {
    if (typeof DeviceMotionEvent !== "undefined" && typeof (DeviceMotionEvent as any).requestPermission === "function") {
      const motionPermission = await (DeviceMotionEvent as any).requestPermission();
      if (motionPermission === "granted") {
        window.addEventListener("devicemotion", () => {});
      }
    }

    if (typeof DeviceOrientationEvent !== "undefined" && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      const orientationPermission = await (DeviceOrientationEvent as any).requestPermission();
      if (orientationPermission === "granted") {
        window.addEventListener("deviceorientation", () => {});
      }
    }

    if ("permissions" in navigator) {
      try {
        await navigator.permissions.query({ name: "magnetometer" as any });
      } catch (e) {
      }
    }

    const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraStream.getTracks().forEach(track => track.stop());

    return true;
  } catch (error) {
    console.warn("Bazı sensör izinleri reddedildi veya kullanılamadı:", error);
    return false;
  }
}

// APP LAYOUT - App sayfaları için wrapper
function AppLayout() {
  useConnectionSync();
  const navigate = useNavigate();
  const location = useLocation();
  const { demoStatus } = useDemo();

  const [systemInitialized, setSystemInitialized] = useState(
    localStorage.getItem("systemInitialized") === "true"
  );

  // ==========================================
  // /APP ALTINDA SÜRÜ KONTROL
  // Demo mode VEYA Subscription gerekli
  // ==========================================
  const [subscriptionCheckId, setSubscriptionCheckId] = useState<number | null>(null);

  useEffect(() => {
    const checkSubscription = () => {
      // Demo mode aktifse subscription kontrolünü skip et (3 dakika demo süresi var)
      if (demoStatus.isActive) {
        // Demo süresi biterse uyarı ver ve yönlendir
        if (demoStatus.timeRemaining <= 0) {
          console.error('❌ DEMO SÜRESI DOLDU!');
          localStorage.removeItem('demoMode');
          localStorage.removeItem('demoStartTime');
          localStorage.removeItem('demoExpireTime');
          toast.error('⏰ Demo süresi dolmuştur. Lütfen paket satın alın.', {
            description: 'Sisteme geri yönlendiriliyorsunuz...',
            duration: 3000
          });
          setTimeout(() => {
            navigate('/pricing', { replace: true, state: { from: location.pathname } });
          }, 2000);
        }
        return;
      }

      // Demo değilse subscription ZORUNLU
      const savedSub = localStorage.getItem('subscription');

      // Subscription yoksa pricing'e yönlendir
      if (!savedSub) {
        console.warn('⏰ Demo veya Subscription bulunamadı - paket satın alınması gerekli');
        toast.error('❌ Aktif paket gereklidir', {
          description: 'Paket satın alma sayfasına yönlendiriliyorsunuz...',
          duration: 2000
        });
        setTimeout(() => {
          navigate('/pricing', { replace: true, state: { from: location.pathname } });
        }, 1000);
        return;
      }

      try {
        const sub = JSON.parse(savedSub);
        const now = Date.now();
        const daysRemaining = Math.max(0, Math.ceil((sub.endDate - now) / (1000 * 60 * 60 * 24)));
        const hoursRemaining = Math.max(0, Math.ceil((sub.endDate - now) / (1000 * 60 * 60)));
        const minutesRemaining = Math.max(0, Math.ceil((sub.endDate - now) / (1000 * 60)));

        // Subscription süresi bitmiş ise pricing'e yönlendir
        if (minutesRemaining <= 0) {
          console.error('❌ SUBSCRIPTION SÜRESI BITTI!');
          localStorage.removeItem('subscription');

          toast.error('⏰ Aboneliğinizin süresi dolmuştur!', {
            description: 'Paket satın alma sayfasına yönlendiriliyorsunuz...',
            duration: 3000
          });

          setTimeout(() => {
            navigate('/pricing', { replace: true, state: { from: location.pathname } });
          }, 2000);
          return;
        }

        // Subscription bitişine yakın uyarı ver (30 dakika kaldı)
        if (minutesRemaining <= 30 && minutesRemaining > 29) {
          toast.warning('⚠️ Aboneliğinizin süresi yakında bitecektir!', {
            description: `${minutesRemaining} dakika kaldı - Yenileme yapınız`,
            duration: 5000
          });
        }

        // Subscription aktif
        console.log(`✅ Subscription aktif - Kalan: ${daysRemaining > 0 ? daysRemaining + ' gün' : minutesRemaining + ' dakika'}`);
      } catch (e) {
        console.warn('⚠️ Subscription parse hatası:', e);
        toast.error('❌ Paket bilgisinde hata oluştu', {
          description: 'Lütfen tekrar paket satın alınız',
          duration: 3000
        });
        setTimeout(() => {
          navigate('/pricing', { replace: true, state: { from: location.pathname } });
        }, 1000);
        return;
      }
    };

    // İlk kontrol hemen yap
    checkSubscription();

    // Daha sık kontrol et (5 saniyede bir, ama minute'e göre kontrol aralığını ayarla)
    // Kontrol sıklığı: dakika cinsinden 5 saniye, saat cinsinden 30 saniye
    const interval = setInterval(checkSubscription, 5000);
    setSubscriptionCheckId(interval as unknown as number);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [navigate, location.pathname, demoStatus.isActive, demoStatus.timeRemaining]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global Hata Yakalandı:", event.message);
      toast.error("Beklenmeyen Hata", { description: event.message });
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error && event.reason.message === "Görüntü indirilemedi") {
        return;
      }
      console.error("Beklenmeyen Promise Hatası:", event.reason);
      toast.error("Beklenmeyen Hata", { description: "İşlem sırasında bir hata oluştu." });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Sistem başlatılmamışsa buton göster
  if (!systemInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="inline-block p-4 bg-blue-100 rounded-full">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Görüntüleme Sistemi</h1>
          <p className="text-slate-600 mb-6">
            Sistemi başlatmak için lütfen "Sistemi Başlat" düğmesine tıklayın.
          </p>
          <button
            onClick={async () => {
              const success = await requestSensorPermissions();
              localStorage.setItem("systemInitialized", "true");
              setSystemInitialized(true);
              if (!success) {
                console.warn("Bazı izinler verilmedi, sistem kısıtlı modda çalışacak");
              }
            }}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg"
          >
            Sistemi Başlat
          </button>
        </div>
      </div>
    );
  }

  // Sistem başlatıldıysa, Outlet'i render et (nested routes)
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

// ROUTER WRAPPER - Public ve Protected rotaları yönetir
function RootRouter() {
  return (
    <Routes>
      {/* ANA SAYFA - Public */}
      <Route path="/" element={<Landing />} />

      {/* PUBLIC SAYFALAR - DeviceLock yok */}
      <Route path="/rydex" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/member-login" element={<Login />} />
      <Route path="/member-register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/member-panel" element={<MemberPanel />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-pending" element={<PaymentPending />} />
      <Route path="/payment-expired" element={<PaymentExpired />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* PROTECTED APP ROUTES - DeviceLock ile korumalı (sadece dev modunda) */}
      <Route path="/app" element={
        import.meta.env.DEV ? (
          <DeviceLock>
            <AccessControlProvider userId={localStorage.getItem('userId') || 'demo-user'}>
              <AppLayout />
            </AccessControlProvider>
          </DeviceLock>
        ) : (
          <AccessControlProvider userId={localStorage.getItem('userId') || 'demo-user'}>
            <AppLayout />
          </AccessControlProvider>
        )
      }>
        <Route index element={<Scanner />} />
        <Route path="dashboard" element={<Index />} />
        <Route path="camera-analysis" element={<CameraAnalysisDetail />} />
        <Route path="application-features" element={<ApplicationFeaturesDetail />} />
        <Route path="magnetometer" element={<MagnetometerDetail />} />
        <Route path="viewer-3d" element={<Viewer3DDetail />} />
        <Route path="satellite-analysis" element={<SatelliteAnalysisDetail />} />
        <Route path="thermal-energy" element={<ThermalEnergyDetail />} />
        <Route path="radar-scan" element={<RadarScanDetail />} />
        <Route path="treasure-detection" element={<TreasureDetectionDetail />} />
        <Route path="map-detections" element={<MapDetectionsDetail />} />
        <Route path="scan-history" element={<ScanHistoryDetail />} />
        <Route path="ar-analysis" element={<ARAnalysisDetail />} />
        <Route path="area-scan" element={<AreaScanDetail />} />
        <Route path="structure-scan" element={<StructureScanDetail />} />
        <Route path="advanced-analytics" element={<AdvancedAnalyticsDetail />} />
        <Route path="topography" element={<TopographyDetail />} />
        <Route path="vegetation" element={<VegetationDetail />} />
        <Route path="signal-analysis" element={<SignalAnalysisDetail />} />
        <Route path="ocean-analysis" element={<OceanAnalysisDetail />} />
        <Route path="climate-data" element={<ClimateDataDetail />} />
        <Route path="wind-analysis" element={<WindAnalysisDetail />} />
        <Route path="soil-composition" element={<SoilCompositionDetail />} />
        <Route path="microorganisms" element={<MicroorganismsDetail />} />
        <Route path="radioactivity" element={<RadioactivityDetail />} />
        <Route path="vision-analysis" element={<VisionAnalysisDetail />} />
        <Route path="pressure-mapping" element={<PressureMappingDetail />} />
        <Route path="time-series-analysis" element={<TimeSeriesAnalysisDetail />} />
        <Route path="volumetric-measurement" element={<VolumetricMeasurementDetail />} />
        <Route path="gravitational-field" element={<GravitationalFieldDetail />} />
        <Route path="seismic-activity" element={<SeismicActivityDetail />} />
        <Route path="network-analysis" element={<NetworkAnalysisDetail />} />
        <Route path="archeology-database" element={<ArcheologyDatabaseDetail />} />
        <Route path="radar-scanner" element={<RadarScannerPage />} />
        <Route path="area-scanner" element={<AreaScanner />} />
        <Route path="structure-scanner" element={<StructureScanner />} />
        <Route path="ar" element={<AR />} />
        <Route path="camera" element={<Camera />} />
        <Route path="magnetometer-app" element={<Magnetometer />} />
        <Route path="magnetometer/history" element={<History />} />
        <Route path="magnetometer/detections" element={<Detections />} />
        <Route path="magnetometer/map" element={<MapPage />} />
        <Route path="viewer-3d-app" element={<Viewer3DPage />} />
        <Route path="real-data" element={<RealDataPage />} />
        <Route path="radar" element={<RadarScannerPage />} />
        <Route path="area" element={<AreaScanner />} />
        <Route path="structure" element={<StructureScanner />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="two-factor-auth" element={<TwoFactorAuth />} />
        <Route path="refund-management" element={<RefundManagement />} />
        <Route path="payment-reconciliation" element={<PaymentReconciliation />} />
        <Route path="support-tickets" element={<SupportTickets />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
        initializeSync();
      } catch (error) {
        console.error("Uygulama başlatma hatası:", error);
        toast.error("Başlatma Hatası", { description: "Uygulama başlatılırken bir sorun oluştu." });
      }
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AdminProvider>
          <AuthProvider>
            <NetworkProvider>
              <LocationProvider>
                <CameraProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                      <RootRouter />
                    </BrowserRouter>
                  </TooltipProvider>
                </CameraProvider>
              </LocationProvider>
            </NetworkProvider>
          </AuthProvider>
        </AdminProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
// firebase admin sdk aktif edildi
