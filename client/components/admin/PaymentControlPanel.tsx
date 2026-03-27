import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Search,
  Filter,
  Eye,
  AlertCircle,
  Download,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { approvePayment, rejectPayment, getAllPayments, PaymentRecord } from '@/lib/payment-verification';

interface Receipt {
  id: string;
  file_name: string;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  uploaded_at: number;
  approved_at?: number;
  approval_notes?: string;
}

export default function PaymentControlPanel() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);

  // Ödeme kayıtlarını yükle
  useEffect(() => {
    loadPaymentRecords();

    // Her 3 saniyede bir yenile
    const interval = setInterval(loadPaymentRecords, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadPaymentRecords = () => {
    try {
      const allPayments = getAllPayments();
      setPayments(allPayments);

      // localStorage'dan dekonları da yükle
      const receiptsData = JSON.parse(localStorage.getItem('receipts') || '[]');
      setReceipts(receiptsData);
    } catch (error) {
      console.error('Ödeme kayıtları yükleme hatası:', error);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveClick = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setApprovalNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectClick = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleApprove = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      const adminId = localStorage.getItem('adminId') || 'admin';
      const result = approvePayment(selectedPayment.id, adminId, approvalNotes);

      if (result.success) {
        toast.success('✅ Ödeme başarıyla onaylandı!');
        setShowApprovalModal(false);
        loadPaymentRecords();
      } else {
        toast.error('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Onay hatası:', error);
      toast.error('Onay sırasında hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      toast.error('Lütfen red sebebini girin');
      return;
    }

    setProcessing(true);
    try {
      const adminId = localStorage.getItem('adminId') || 'admin';
      const result = rejectPayment(selectedPayment.id, adminId, rejectionReason);

      if (result.success) {
        toast.success('✅ Ödeme başarıyla reddedildi!');
        setShowRejectionModal(false);
        loadPaymentRecords();
      } else {
        toast.error('❌ ' + result.message);
      }
    } catch (error) {
      console.error('Red hatası:', error);
      toast.error('Red sırasında hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓ Onaylandı';
      case 'rejected':
        return '✗ Reddedildi';
      case 'pending':
        return '⏳ Beklemede';
      case 'verified':
        return '✓ Doğrulandı';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Ödeme Kontrol Sistemi</h2>
        <p className="text-slate-400">Kullanıcı ödemelerini kontrol et, onayla veya reddet</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
          <p className="text-slate-400 text-sm mb-1">Toplam Ödemeler</p>
          <p className="text-3xl font-bold text-white">{payments.length}</p>
        </Card>
        <Card className="p-4 bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 text-sm mb-1">Onaylanan</p>
          <p className="text-3xl font-bold text-green-400">
            {payments.filter(p => p.status === 'approved').length}
          </p>
        </Card>
        <Card className="p-4 bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-400 text-sm mb-1">Beklemede</p>
          <p className="text-3xl font-bold text-yellow-400">
            {payments.filter(p => p.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4 bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm mb-1">Reddedilen</p>
          <p className="text-3xl font-bold text-red-400">
            {payments.filter(p => p.status === 'rejected').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-300 mb-2">Ara</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Kullanıcı ID veya ödeme ID ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Filtre</label>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'rejected'].map(status => (
                <Button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  className={filterStatus === status ? 'bg-blue-600' : 'border-slate-700'}
                >
                  {status === 'all' && 'Tümü'}
                  {status === 'pending' && 'Beklemede'}
                  {status === 'approved' && 'Onaylı'}
                  {status === 'rejected' && 'Reddedilmiş'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Payments List */}
      <Card className="p-6 bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Ödeme Kayıtları</h3>

        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Ödeme kaydı bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="p-4 bg-slate-900/50 border border-slate-700/30 rounded-lg hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`p-2 rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                      </span>
                      <div>
                        <p className="text-white font-semibold">{payment.id.slice(0, 20)}...</p>
                        <p className="text-xs text-slate-400">{payment.userId}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusColor(payment.status)}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      {payment.amount.toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Paket</p>
                    <p className="text-slate-300 font-semibold">{payment.packageId}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Yöntem</p>
                    <p className="text-slate-300 font-semibold">
                      {payment.paymentMethod === 'credit-card' ? '💳 Kart' : '🏦 Banka'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Bitiş Tarihi</p>
                    <p className="text-slate-300 font-semibold">
                      {new Date(payment.expiresAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Admin Notları</p>
                    <p className="text-slate-300 font-semibold text-xs">
                      {payment.adminNotes ? payment.adminNotes.slice(0, 15) + '...' : '-'}
                    </p>
                  </div>
                </div>

                {/* Admin Notes */}
                {payment.adminNotes && (
                  <div className="mb-3 p-2 bg-slate-800/50 rounded border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Admin Notları:</p>
                    <p className="text-sm text-slate-300">{payment.adminNotes}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {payment.rejectionReason && (
                  <div className="mb-3 p-2 bg-red-500/10 rounded border border-red-500/30">
                    <p className="text-xs text-red-400 mb-1">Red Sebebi:</p>
                    <p className="text-sm text-red-300">{payment.rejectionReason}</p>
                  </div>
                )}

                {/* Actions */}
                {payment.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveClick(payment)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                      disabled={processing}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Onayla
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(payment)}
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm"
                      disabled={processing}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reddet
                    </Button>
                  </div>
                )}

                {payment.status === 'approved' && payment.approvedAt && (
                  <div className="text-xs text-green-400 pt-3 border-t border-slate-700/30">
                    ✓ {payment.approvedBy} tarafından {new Date(payment.approvedAt).toLocaleDateString('tr-TR')} tarihinde onaylandı
                  </div>
                )}

                {payment.status === 'rejected' && payment.rejectedAt && (
                  <div className="text-xs text-red-400 pt-3 border-t border-slate-700/30">
                    ✗ {payment.approvedBy} tarafından {new Date(payment.rejectedAt).toLocaleDateString('tr-TR')} tarihinde reddedildi
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Approval Modal */}
      {showApprovalModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900 border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ödemeyi Onayla</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-slate-800/50 rounded border border-slate-700/30">
                <p className="text-sm text-slate-400">Kullanıcı ID</p>
                <p className="text-white font-semibold">{selectedPayment.userId}</p>
              </div>
              
              <div className="p-3 bg-slate-800/50 rounded border border-slate-700/30">
                <p className="text-sm text-slate-400">Tutar</p>
                <p className="text-lg text-yellow-400 font-bold">
                  {selectedPayment.amount.toLocaleString('tr-TR')} ₺
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Admin Notları (İsteğe Bağlı)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Örn: Dekont kontrol edildi, hesap doğrulandı..."
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowApprovalModal(false)}
                variant="outline"
                className="flex-1 border-slate-700"
                disabled={processing}
              >
                İptal
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={processing}
              >
                {processing ? 'İşleniyor...' : 'Onayla'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-slate-900 border border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ödemeyi Reddet</h3>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-slate-800/50 rounded border border-slate-700/30">
                <p className="text-sm text-slate-400">Kullanıcı ID</p>
                <p className="text-white font-semibold">{selectedPayment.userId}</p>
              </div>
              
              <div className="p-3 bg-red-500/10 rounded border border-red-500/30">
                <p className="text-sm text-red-400">Tutar</p>
                <p className="text-lg text-red-400 font-bold">
                  {selectedPayment.amount.toLocaleString('tr-TR')} ₺
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Red Sebebi <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Örn: Dekont okunamıyor, eksik bilgi, hatalı tutar..."
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRejectionModal(false)}
                variant="outline"
                className="flex-1 border-slate-700"
                disabled={processing}
              >
                İptal
              </Button>
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'İşleniyor...' : 'Reddet'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
