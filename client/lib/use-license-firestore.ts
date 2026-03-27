import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface FirestoreLicenseData {
  isActive: boolean; // Lisans aktif mi?
  expiryDate: Date; // Bitiş tarihi (Firestore Timestamp)
}

export interface LicenseCheckResult {
  isValid: boolean; // Lisans geçerli mi? (aktif VE tarihi dolmadı mı?)
  isLoading: boolean;
  error: string | null;
  licenseData: FirestoreLicenseData | null;
  daysRemaining: number;
  message: string;
}

/**
 * Firestore'dan lisans verisini gerçek zamanlı olarak kontrol eden hook
 * 
 * Kontrol ettiği şeyler:
 * - isActive === true olması
 * - Şu anki tarih < expiryDate olması
 * 
 * @param docPath - Firestore'da lisans verisinin bulunduğu path (örn: "settings/license")
 * @returns Lisans durumu ve kontrol sonuçları
 */
export function useFirestoreLicense(docPath: string = "settings/license"): LicenseCheckResult {
  const [licenseData, setLicenseData] = useState<FirestoreLicenseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Localhost kontrolü - geliştirme ortamı
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      setIsValid(true);
      setIsLoading(false);
      setMessage('✅ Geliştirme ortamında - Lisans kontrolü atlandı');
      setLicenseData({
        isActive: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonrası
      });
      setDaysRemaining(365);
      return; // Firebase'e bağlanma, burada dur
    }

    // Firestore'dan veriyi çektiğinde yapılacak kontrol:
    const unsubscribe = onSnapshot(
      doc(db, docPath),
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Firestore'dan veriyi çektiğinde yapılacak kontrol:
            const bitisTarihi = data.expiryDate.toDate(); // Veritabanındaki tarih
            const simdi = new Date(); // Şu anki zaman
            
            // Lisans verisini sakla
            setLicenseData({
              isActive: data.isActive === true,
              expiryDate: bitisTarihi,
            });

            // KONTROL: SÜRE DOLMAMIŞ VE AKTİF Mİ?
            if (data.isActive === true && simdi < bitisTarihi) {
              // SÜRE DOLMAMIŞ VE AKTİF -> UYGULAMAYI AÇ
              setIsValid(true);
              
              // Kalan gün sayısını hesapla
              const timeDifference = bitisTarihi.getTime() - simdi.getTime();
              const days = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
              setDaysRemaining(Math.max(0, days));
              
              setMessage('✅ Lisans geçerli ve aktif');
              setError(null);
            } else {
              // SÜRE DOLMUŞ VEYA KAPATILMIŞ -> KİLİTLE
              setIsValid(false);
              
              if (data.isActive !== true) {
                setMessage('❌ Lisans kapatılmış');
                setError('Lisans kapatılmış. Lütfen yöneticiyle iletişime geçin.');
              } else {
                setMessage('❌ Lisans süresi dolmuş');
                setError('Lisansınız süresi dolmuştur. Lütfen yenileyin.');
              }
              
              setDaysRemaining(0);
            }
          } else {
            // KILIT EKRANI: Veri bulunamadı
            setIsValid(false);
            setMessage('❌ Lisans bilgileri bulunamadı');
            setError('Lisans bilgileri Firestore\'da bulunamadı. Lütfen yöneticiyle iletişime geçin.');
            setLicenseData(null);
            setDaysRemaining(0);
          }
        } catch (err) {
          console.error('Lisans kontrol hatası:', err);
          setIsValid(false);
          setMessage('❌ Lisans kontrol sırasında hata');
          setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
          setDaysRemaining(0);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Firestore bağlantı hatası:', error);
        setIsValid(false);
        setMessage('❌ Firestore bağlantı hatası');
        setError('Firestore\'a bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        setLicenseData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docPath]);

  return {
    isValid,
    isLoading,
    error,
    licenseData,
    daysRemaining,
    message,
  };
}
