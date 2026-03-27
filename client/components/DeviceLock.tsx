import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getDeviceId } from "../lib/device";
import { Loader2, Lock } from "lucide-react";

interface DeviceLockProps {
  children: React.ReactNode;
}

export const DeviceLock: React.FC<DeviceLockProps> = ({ children }) => {
  const [deviceId] = useState(() => getDeviceId());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Localhost kontrolü - geliştirme ortamı
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      console.log("🛠️ Localhost algılandı: Güvenlik devre dışı bırakıldı.");
      setIsAuthorized(true);
      setLoading(false);
      return; // Firebase'e bağlanma, burada dur
    }
    
    // Canlı sistemde Firebase bağlantısı
    const docRef = doc(db, "authorized_devices", deviceId.trim());
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let expiryDate;
        if (data.expiryDate?.toDate) {
          expiryDate = data.expiryDate.toDate();
        } else {
          expiryDate = new Date(data.expiryDate);
        }

        const approved = data.isApproved === true;
        const notExpired = !expiryDate || isNaN(expiryDate.getTime()) || expiryDate >= today;

        if (approved && notExpired) {
          setIsAuthorized(true);
          setIsExpired(false);
        } else {
          setIsAuthorized(false);
          setIsExpired(!notExpired && approved);
        }
      } else {
        setIsAuthorized(false);
        setIsExpired(false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Auth Hatası:", error);
      setIsAuthorized(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [deviceId]);

  // Yükleme ekranı
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="mt-4 text-slate-400">Geliştirici modu hazırlanıyor...</p>
      </div>
    );
  }

  // Erişim Engellendi Ekranı (Sadece Canlıda Hata Varsa Görünür)
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] p-6 text-center text-white font-sans">
        <div className="mb-8 p-8 rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-zinc-800 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />
          <div className="bg-red-500/10 p-5 rounded-2xl w-fit mx-auto mb-8 border border-red-500/20">
            <Lock className="w-14 h-14 text-red-500" />
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight">Erişim Engellendi</h1>
          <div className="space-y-6">
            <div className="bg-zinc-950/80 p-5 rounded-xl border border-zinc-800 backdrop-blur-sm">
              <p className="text-zinc-500 text-xs mb-2 uppercase tracking-[0.2em] font-bold">Cihaz Kimliğiniz (ID)</p>
              <code className="text-xl font-mono text-primary font-bold block select-all">{deviceId}</code>
            </div>
            <div className="space-y-4 px-2">
              <p className="text-zinc-400 text-sm leading-relaxed">
                {isExpired ? "Lisans süreniz dolmuştur." : "Cihazınız yetkilendirilmemiş."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
