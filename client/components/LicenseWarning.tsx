import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LicenseModal from '@/components/LicenseModal';

interface LicenseWarningProps {
  daysRemaining: number;
  onRenewClick?: () => void;
}

export default function LicenseWarning({
  daysRemaining,
  onRenewClick,
}: LicenseWarningProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || daysRemaining > 30) {
    return null;
  }

  // Süresi dolan lisans
  if (daysRemaining === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-3 px-4 shadow-lg z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
            <div>
              <p className="font-semibold">Lisansınız süresi dolmuştur!</p>
              <p className="text-sm text-red-100">Sistem kilitlenemeden lisansınızı yenileyin.</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
              onRenewClick?.();
            }}
            className="bg-white text-red-600 hover:bg-red-50 font-semibold"
          >
            Şimdi Yenile
          </Button>
        </div>
        <LicenseModal
          isOpen={isModalOpen}
          mode="renewal"
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setIsDismissed(true);
          }}
        />
      </div>
    );
  }

  // 1-30 gün kalan lisans
  const isUrgent = daysRemaining <= 7;

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 py-3 px-4 shadow-lg z-40 transition-colors ${
          isUrgent
            ? 'bg-red-500 text-white'
            : 'bg-amber-500 text-white'
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isUrgent ? 'animate-pulse' : ''}`} />
            <div>
              <p className="font-semibold">
                {isUrgent
                  ? '⚠️ Lisansınız çok yakında sona erecek!'
                  : '📢 Lisansınız bitiş tarihine yaklaşıyor'}
              </p>
              <p className="text-sm opacity-90">
                {daysRemaining} gün kaldı • Lisansınızı yenileyin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setIsModalOpen(true);
                onRenewClick?.();
              }}
              className={isUrgent
                ? 'bg-white text-red-600 hover:bg-red-50'
                : 'bg-white text-amber-700 hover:bg-amber-50'
              }
              variant="default"
              size="sm"
            >
              Yenile
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/70 hover:text-white p-1"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lisans Yenileme Modal */}
      <LicenseModal
        isOpen={isModalOpen}
        mode="renewal"
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setIsDismissed(true);
        }}
      />
    </>
  );
}
