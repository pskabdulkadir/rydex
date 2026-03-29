import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, Trash2, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface PendingMember {
  id: string;
  username: string;
  phone: string;
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

interface PendingMembersPanelProps {
  adminId?: string;
}

export default function PendingMembersPanel({ adminId = 'admin' }: PendingMembersPanelProps) {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<PendingMember | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Demo üyeleri temizle
  const clearDemoMembers = () => {
    if (!confirm('Tüm demo ve sahte üyeleri temizlemek istediğinize emin misiniz?')) {
      return;
    }

    localStorage.removeItem('pending_members');
    localStorage.removeItem('approved_members');
    setMembers([]);
    toast.success('Demo üyeler başarıyla temizlendi');
  };

  // Onay bekleyen üyeleri yükle
  useEffect(() => {
    loadPendingMembers();
  }, []);

  const loadPendingMembers = async () => {
    try {
      setIsLoading(true);

      // Önce localStorage'dan oku (demo amaçlı)
      const pendingFromStorage = JSON.parse(localStorage.getItem('pending_members') || '[]') as PendingMember[];
      
      // API'den de kontrol et
      try {
        const response = await fetch('/api/admin/members/pending');
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || pendingFromStorage);
        } else {
          setMembers(pendingFromStorage);
        }
      } catch (error) {
        console.error('API hatası, localStorage kullanılıyor:', error);
        setMembers(pendingFromStorage);
      }
    } catch (error) {
      console.error('Üyeler yükleme hatası:', error);
      toast.error('Üyeler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMember = async (memberId: string) => {
    try {
      setApprovingId(memberId);

      const response = await fetch('/api/admin/members/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberId,
          status: 'approved',
          approvedBy: adminId
        })
      });

      const data = await response.json();

      if (data.success) {
        // localStorage'da güncelle
        const updatedMembers = members.filter(m => m.id !== memberId);
        localStorage.setItem('pending_members', JSON.stringify(updatedMembers));
        setMembers(updatedMembers);

        // Onaylanan üyeyi kayıtlı üyelere ekle
        const approved = members.find(m => m.id === memberId);
        if (approved) {
          const approvedMembers = JSON.parse(localStorage.getItem('approved_members') || '[]');
          approvedMembers.push({
            ...approved,
            approval_status: 'approved',
            approved_by: adminId,
            approved_at: new Date().toISOString()
          });
          localStorage.setItem('approved_members', JSON.stringify(approvedMembers));
        }

        toast.success(`✅ ${approved?.username} onaylandı!`);
        setSelectedMember(null);
      } else {
        toast.error('Onay işlemi başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Onay hatası:', error);
      toast.error('Onay işlemi başarısız oldu');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectMember = async (memberId: string) => {
    try {
      setApprovingId(memberId);

      const response = await fetch('/api/admin/members/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberId,
          status: 'rejected',
          approvedBy: adminId,
          reason: rejectionReason || 'Belirtilmemiş'
        })
      });

      const data = await response.json();

      if (data.success) {
        // localStorage'da güncelle
        const updatedMembers = members.filter(m => m.id !== memberId);
        localStorage.setItem('pending_members', JSON.stringify(updatedMembers));
        setMembers(updatedMembers);

        toast.success('❌ Üye başarıyla reddedildi');
        setSelectedMember(null);
        setRejectionReason('');
      } else {
        toast.error('Red işlemi başarısız: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Red işlemi hatası:', error);
      toast.error('Red işlemi başarısız oldu');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/members/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId })
      });

      const data = await response.json();

      if (data.success) {
        // localStorage'da güncelle
        const updatedMembers = members.filter(m => m.id !== memberId);
        localStorage.setItem('pending_members', JSON.stringify(updatedMembers));
        setMembers(updatedMembers);

        toast.success('🗑️ Üye silindi');
        setSelectedMember(null);
      } else {
        toast.error('Silme işlemi başarısız');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Silme işlemi başarısız oldu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Onay Bekleyen Üyeler</h2>
          <p className="text-slate-400">Toplam: {members.length} üye</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearDemoMembers}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 text-red-300 rounded-lg transition-colors text-sm font-semibold"
            title="Demo üyeleri temizle"
          >
            Demo Sil
          </button>
          <button
            onClick={loadPendingMembers}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {members.length === 0 && (
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Tüm Üyeler Onaylandı</h3>
          <p className="text-slate-400">Onay bekleyen üye bulunmamaktadır.</p>
        </div>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map(member => (
          <div
            key={member.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 hover:border-slate-600/50 transition-colors"
          >
            {/* Member Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold truncate">{member.username}</h3>
                <p className="text-slate-400 text-sm">{member.phone}</p>
              </div>
              <div className="bg-amber-500/20 rounded-full p-2">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* Join Date */}
            <div className="mb-4 pb-4 border-b border-slate-700/50">
              <p className="text-xs text-slate-500">Kayıt Tarihi</p>
              <p className="text-sm text-slate-300">
                {new Date(member.created_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleApproveMember(member.id)}
                disabled={approvingId === member.id}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors text-sm flex items-center justify-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                Onayla
              </button>
              <button
                onClick={() => setSelectedMember(member)}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors text-sm flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reddet
              </button>
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Rejection Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">Üye Reddetme</h3>
            </div>

            <p className="text-slate-300 mb-4">
              <strong>{selectedMember.username}</strong> kullanıcısını reddetmek istediğinize emin misiniz?
            </p>

            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Red Sebebi (İsteğe Bağlı)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Red sebebini yazınız..."
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-red-500 outline-none text-sm"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded transition-colors"
              >
                İptal Et
              </button>
              <button
                onClick={() => handleRejectMember(selectedMember.id)}
                disabled={approvingId === selectedMember.id}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
              >
                {approvingId === selectedMember.id ? 'İşleniyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
