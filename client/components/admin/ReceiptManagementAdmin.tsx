import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  FileText,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Receipt {
  id: string;
  file_name: string;
  uploaded_at: number;
  user_id: string;
  plan: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  file_url?: string;
  approved_at?: number;
  approval_notes?: string;
  rejection_reason?: string;
  rejected_at?: number;
}

interface PaymentRequest {
  id: string;
  referenceCode?: string;
  userId: string;
  packageId: string;
  amount: number;
  email: string;
  status: 'pending' | 'pending_receipt' | 'user_uploaded_receipt' | 'admin_approved' | 'admin_rejected';
  createdAt: number;
}

export default function ReceiptManagementAdmin() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Dekonları yükle
  const loadReceipts = async () => {
    try {
      setLoading(true);
      // localStorage'dan dekonları al
      const savedReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
      const savedPayments = JSON.parse(localStorage.getItem('payment_requests') || '[]');

      setReceipts(savedReceipts);
      setPaymentRequests(savedPayments);
    } catch (error) {
      console.error('Dekonları yükleme hatası:', error);
      toast.error('Dekonları yüklemede hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();

    // Real-time güncelleme için interval ayarla
    const interval = setInterval(loadReceipts, 3000);
    return () => clearInterval(interval);
  }, []);

  const getPendingCount = () => receipts.filter(r => r.status === 'pending').length;
  const getApprovedCount = () => receipts.filter(r => r.status === 'approved').length;
  const getRejectedCount = () => receipts.filter(r => r.status === 'rejected').length;

  const handleApprove = async (receipt: Receipt) => {
    setProcessingId(receipt.id);

    try {
      // Dekontu onaylandı olarak işaretle
      const updatedReceipts = receipts.map(r =>
        r.id === receipt.id
          ? {
            ...r,
            status: 'approved' as const,
            approved_at: Date.now(),
            approval_notes: approvalNotes || 'Onaylandı'
          }
          : r
      );

      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      setReceipts(updatedReceipts);

      // Subscription'ı aktive et (API çağrısı)
      const payment = paymentRequests.find(p => p.userId === receipt.user_id);
      if (payment) {
        try {
          const response = await fetch('/api/payment/activate-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referenceCode: payment.id,
              userId: receipt.user_id,
              packageId: payment.packageId,
              adminToken: localStorage.getItem('admin_auth_token')
            })
          });

          const data = await response.json();
          if (data.success) {
            // Ödeme talebini güncelle
            const updatedPayments = paymentRequests.map(p =>
              p.id === payment.id
                ? { ...p, status: 'admin_approved' as const }
                : p
            );
            localStorage.setItem('payment_requests', JSON.stringify(updatedPayments));
            setPaymentRequests(updatedPayments);

            toast.success(`✅ Dekont onaylandı! Subscription ${receipt.user_id} kullanıcısına aktive edildi.`);
          } else {
            toast.error('Subscription aktive edilemedi: ' + data.message);
          }
        } catch (error) {
          console.warn('API hatası (devam ediliyor):', error);
          toast.success('✅ Dekont onaylandı (Subscription API çağrısı başarısız)');
        }
      }

      setSelectedReceipt(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Onay hatası:', error);
      toast.error('Dekont onaylanırken hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (receipt: Receipt, reason: string) => {
    setProcessingId(receipt.id);

    try {
      const updatedReceipts = receipts.map(r =>
        r.id === receipt.id
          ? {
            ...r,
            status: 'rejected' as const,
            rejected_at: Date.now(),
            rejection_reason: reason || 'Admin tarafından reddedildi'
          }
          : r
      );

      localStorage.setItem('receipts', JSON.stringify(updatedReceipts));
      setReceipts(updatedReceipts);

      // Ödeme talebini güncelle
      const payment = paymentRequests.find(p => p.userId === receipt.user_id);
      if (payment) {
        const updatedPayments = paymentRequests.map(p =>
          p.id === payment.id
            ? { ...p, status: 'admin_rejected' as const }
            : p
        );
        localStorage.setItem('payment_requests', JSON.stringify(updatedPayments));
        setPaymentRequests(updatedPayments);
      }

      toast.error(`❌ Dekont reddedildi: ${reason}`);
      setSelectedReceipt(null);
    } catch (error) {
      console.error('Reddetme hatası:', error);
      toast.error('Dekont reddetilirken hata oluştu');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: Receipt['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStatusIcon = (status: Receipt['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Özet Kartları */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Bekleme Dekontu</p>
              <p className="text-2xl font-bold text-white">{getPendingCount()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Onaylanan</p>
              <p className="text-2xl font-bold text-white">{getApprovedCount()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center gap-3">
            <X className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-slate-400 text-sm">Reddedilen</p>
              <p className="text-2xl font-bold text-white">{getRejectedCount()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Dekonlar Listesi */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Dekonlar</h3>
          <Button
            onClick={loadReceipts}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {receipts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Henüz dekont yüklenmemiş</p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border ${getStatusColor(
                          receipt.status
                        )}`}
                      >
                        {getStatusIcon(receipt.status)}
                        {receipt.status === 'pending'
                          ? 'Onay Bekleniyor'
                          : receipt.status === 'approved'
                          ? 'Onaylandı'
                          : 'Reddedildi'}
                      </div>
                      <p className="text-white font-semibold">{receipt.file_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-2">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Kullanıcı ID:</p>
                        <p className="font-mono">{receipt.user_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Paket:</p>
                        <p className="font-semibold text-slate-300">{receipt.plan.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Tutar:</p>
                        <p className="font-semibold text-yellow-400">
                          {receipt.amount.toLocaleString('tr-TR')} {receipt.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Yükleme Tarihi:</p>
                        <p>{new Date(receipt.uploaded_at).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    {receipt.approval_notes && (
                      <div className="mt-2 p-2 bg-green-500/10 rounded border border-green-500/20 text-sm text-green-400">
                        {receipt.approval_notes}
                      </div>
                    )}

                    {receipt.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20 text-sm text-red-400">
                        {receipt.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex items-center gap-2">
                    {receipt.file_url && (
                      <Button
                        onClick={() => window.open(receipt.file_url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-blue-400 hover:bg-slate-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Aç
                      </Button>
                    )}

                    {receipt.status === 'pending' && (
                      <Button
                        onClick={() => setSelectedReceipt(receipt)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={processingId === receipt.id}
                      >
                        {processingId === receipt.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                            İşleniyor...
                          </>
                        ) : (
                          'Onayla/Reddet'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Onay/Reddetme Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-slate-900 border-slate-700/50">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Dekont İşlemi: {selectedReceipt.file_name}
              </h3>

              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 space-y-2">
                <div className="text-sm">
                  <p className="text-slate-400">Kullanıcı:</p>
                  <p className="text-white font-semibold">{selectedReceipt.user_id}</p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-400">Tutar:</p>
                  <p className="text-yellow-400 font-bold text-lg">
                    {selectedReceipt.amount.toLocaleString('tr-TR')} {selectedReceipt.currency}
                  </p>
                </div>
              </div>

              {/* Onay Notları */}
              <textarea
                placeholder="Onay notları (opsiyonel)..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none mb-4 h-20"
              />

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(selectedReceipt)}
                  disabled={processingId === selectedReceipt.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  ✅ Onayla
                </Button>
                <Button
                  onClick={() =>
                    handleReject(
                      selectedReceipt,
                      'Belge uygun değil'
                    )
                  }
                  disabled={processingId === selectedReceipt.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  ❌ Reddet
                </Button>
                <Button
                  onClick={() => setSelectedReceipt(null)}
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
