import React, { useState } from 'react';
import { Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useLicense } from '@/lib/use-license';
import { toast } from 'sonner';

interface LicenseModalProps {
  isOpen: boolean;
  onClose?: () => void;
  mode?: 'initial' | 'renewal'; // İlk açılış ya da yenileme
  onSuccess?: () => void;
}

export default function LicenseModal({
  isOpen,
  onClose,
  mode = 'initial',
  onSuccess,
}: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activateLicense } = useLicense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Kısa simülasyon
      await new Promise(resolve => setTimeout(resolve, 1000));

      const result = activateLicense(licenseKey);

      if (result.success) {
        toast.success(result.message);
        setLicenseKey('');
        
        // İlk açılışta close tuşu yok, sadece success event
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const errorMessage = '❌ Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isInitial = mode === 'initial';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Başlık */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {isInitial ? 'Sistemi Başlat' : 'Lisans Yenile'}
          </h2>

          <p className="text-center text-gray-600 mb-6">
            {isInitial
              ? 'Sistemi kullanmak için lisans anahtarını girin'
              : 'Lisansınız süresi dolmak üzere. Lütfen yeni lisans anahtarını girin'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {/* Lisans Key Girişi */}
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-2">
                Lisans Anahtarı
              </label>
              <Input
                id="licenseKey"
                type="text"
                placeholder=""
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value.toUpperCase());
                  setError(null);
                }}
                disabled={isSubmitting}
                className="font-mono text-lg tracking-wider"
                autoFocus
              />
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Gönder Butonu */}
            <Button
              type="submit"
              disabled={isSubmitting || !licenseKey.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Lisansı Aktiflestir
                </>
              )}
            </Button>
          </form>

          {/* Bilgilendirme */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-2">
            <p>
              <strong>ℹ️ Lisans Bilgileri:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Her lisans 12 ay geçerlidir</li>
              <li>Geçerli lisans olmadan sistem çalışmaz</li>
              <li>Süresi dolunca yenileme gerekir</li>
              <li>Lisans bilgileri güvenli şekilde saklanır</li>
            </ul>
          </div>

          {/* Alt Bilgi */}
          {!isInitial && onClose && (
            <div className="mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 w-full py-2 rounded hover:bg-gray-100"
              >
                Kapat
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
