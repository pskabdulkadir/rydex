import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Clock, AlertCircle, Download, RefreshCw, BarChart3, TrendingUp, Users, DollarSign, Activity, Edit2, Trash2, UserPlus, Lock, Unlock, LogOut, Zap, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdmin } from '@/lib/admin-context';
import { isAdminLoggedIn, getAdminUser, logoutAdmin, getAdminToken, refreshAdminToken } from '@/lib/admin-auth';
import { useTokenExpiryWarning } from '@/lib/hooks/useAdminAuth';
import { createAuditLog, getAuditLogs, formatAuditLogForTimeline } from '@/lib/audit-logger';
import CheckoutSettingsAdmin from '@/components/admin/CheckoutSettingsAdmin';
import PendingMembersPanel from '@/components/admin/PendingMembersPanel';
import PaymentControlPanel from '@/components/admin/PaymentControlPanel';
import ReceiptManagementAdmin from '@/components/admin/ReceiptManagementAdmin';
import Breadcrumb from '@/components/Breadcrumb';

interface EscrowRequest {
  id: string;
  userId: string;
  email: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  createdAt: number;
  approvedAt?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'banned';
  joinDate: number;
  lastLogin: number;
  package: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiryDate: number;
  status: 'active' | 'expired' | 'paused';
  minPurchase: number;
  createdAt: number;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const { showWarning, tokenExpiresIn, dismissWarning } = useTokenExpiryWarning();

  // Giriş kontrol et
  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logoutAdmin();
      toast.success('Çıkış yapıldı');
      navigate('/rydex');
    }
  };

  const handleResetDatabase = () => {
    const confirmMessage = 'UYARI: Tüm localStorage verileri silinecek!\n\nBu işlem geri alınamaz. Devam etmek istiyor musunuz?';

    if (!confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = 'Son onay: Tüm demo ve test verilerini silmek istiyorum. Gerçek kullanıcı verilerine dokunmayacak mısınız?';
    if (!confirm(finalConfirm)) {
      return;
    }

    try {
      // Admin token'ı ve kullanıcı verisini kaydet (geri yüklemek için)
      const adminToken = localStorage.getItem('admin_auth_token');
      const adminUser = localStorage.getItem('admin_user_data');

      // localStorage'dan tüm keyleri al
      const allKeys = Object.keys(localStorage);

      // Admin ile ilişkili keyleri tanımla (koruyacağız)
      const adminRelatedKeys = ['admin_auth_token', 'admin_user_data'];

      // Silinecek keyleri belirle
      const keysToRemove = allKeys.filter(key => {
        // Admin keyleri hariç tut
        if (adminRelatedKeys.includes(key)) return false;

        // Silinecek key pattern'leri
        const demoPatterns = [
          'pending_members', 'approved_members', 'escrowRequests', 'demo_users',
          'test_data', 'audit_logs', 'user_profile', 'subscription', 'auth_token',
          'userId', 'userName', 'userEmail', 'systemInitialized', 'adminUsers',
          'adminCoupons', 'adminStats', 'selectedPackageId', 'magnetometer_history',
          'magnetometer_calibration', 'device_id', 'global_location', 'sessionToken',
          'access_control', 'checkout_bank_accounts', 'paymentRecords', 'offline_mock_mode',
          'lastInvoiceId', 'lastInvoiceNumber', 'system_license_data',
          'REAL_DATA_CACHE', // REAL_DATA_CACHE ile başlayan tüm keyleri sil
        ];

        // Key pattern'lerini kontrol et
        return demoPatterns.some(pattern => key.includes(pattern));
      });

      // Keyleri sil
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Admin bilgilerini geri yükle
      if (adminToken) localStorage.setItem('admin_auth_token', adminToken);
      if (adminUser) localStorage.setItem('admin_user_data', adminUser);

      toast.success('✅ localStorage temizlendi!', {
        description: `${keysToRemove.length} adet demo verisi silindi.`
      });

    } catch (error) {
      toast.error('Veri silme hatası');
      console.error('Reset error:', error);
    }
  };

  const handleDeleteFirestoreUsers = async () => {
    const confirmMessage = 'UYARI: Firestore\'daki TÜM kullanıcılar silinecek!\n\nBu işlem geri alınamaz. Devam etmek istiyor musunuz?';

    if (!confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = 'SON ONAY: Firestore users collection\'ını tamamen silmek istiyorum.';
    if (!confirm(finalConfirm)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_auth_token');
      if (!token) {
        toast.error('Admin kimliği doğrulanmadı');
        return;
      }

      toast.loading('Firestore kullanıcıları siliniyor...');

      const response = await fetch('/api/admin/firestore/delete-users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Firestore silme başarısız');
      }

      const data = await response.json();

      toast.dismiss();
      toast.success(`✅ ${data.deletedCount} Firestore kullanıcısı silindi!`, {
        description: `Tamamlanma zamanı: ${new Date(data.timestamp).toLocaleString('tr-TR')}`
      });

    } catch (error) {
      toast.dismiss();
      toast.error('Firestore kullanıcıları silinemedi');
      console.error('Firestore delete error:', error);
    }
  };

  const [requests, setRequests] = useState<EscrowRequest[]>([
    {
      id: 'escrow_001',
      userId: 'user_abc123',
      email: 'user@example.com',
      amount: 3000000,
      status: 'pending',
      createdAt: Date.now() - 3600000
    },
    {
      id: 'escrow_002',
      userId: 'user_def456',
      email: 'company@example.com',
      amount: 3000000,
      status: 'approved',
      createdAt: Date.now() - 86400000,
      approvedAt: Date.now() - 43200000
    }
  ]);

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'pending' | 'members' | 'all' | 'users' | 'coupons' | 'audit-logs' | 'checkout' | 'receipts' | 'payments'>('dashboard');
  const [pendingReceipts, setPendingReceipts] = useState<any[]>([]);
  const [approvingReceipt, setApprovingReceipt] = useState<string | null>(null);
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard stats'ı localStorage'dan gerçek verilerle hesapla
  useEffect(() => {
    const calculateStats = () => {
      try {
        // 1. Aktif kullanıcıları say (subscription'ı olan)
        let activeUsers = 0;
        let totalRevenue = 0;
        let totalSales = 0;

        // localStorage'daki subscription'ları kontrol et
        const subscriptionStr = localStorage.getItem('subscription');
        if (subscriptionStr) {
          activeUsers += 1;
          try {
            const subscription = JSON.parse(subscriptionStr);
            if (subscription.amount) {
              totalRevenue += subscription.amount;
              totalSales += 1;
            }
          } catch (e) {
            console.warn('Subscription parse hatası:', e);
          }
        }

        // 2. Payment records'lardan verileri al
        const paymentRecords = localStorage.getItem('payment_records');
        if (paymentRecords) {
          try {
            const records = JSON.parse(paymentRecords);
            if (Array.isArray(records)) {
              records.forEach((record: any) => {
                if (record.status === 'completed' && record.amount) {
                  totalRevenue += record.amount;
                  totalSales += 1;
                }
              });
            }
          } catch (e) {
            console.warn('Payment records parse hatası:', e);
          }
        }

        // 3. Subscriptions array'ini kontrol et
        const subscriptionsStr = localStorage.getItem('subscriptions');
        if (subscriptionsStr) {
          try {
            const subscriptions = JSON.parse(subscriptionsStr);
            if (Array.isArray(subscriptions)) {
              activeUsers = subscriptions.filter((s: any) => s.status === 'active').length;
            }
          } catch (e) {
            console.warn('Subscriptions parse hatası:', e);
          }
        }

        // 4. Beklemede olan Escrow isteklerini say
        const escrowStr = localStorage.getItem('escrowRequests');
        let pendingRequests = 0;
        if (escrowStr) {
          try {
            const escrow = JSON.parse(escrowStr);
            if (Array.isArray(escrow)) {
              pendingRequests = escrow.filter((e: any) => e.status === 'pending').length;
            }
          } catch (e) {
            console.warn('Escrow parse hatası:', e);
          }
        }

        // 5. Conversion rate'i hesapla
        // Demo: Sayfaya giren vs satın alan oranı (varsayılan 3.2% veya gerçek verilerden)
        const conversionRate = totalSales > 0 ? (totalSales / (totalSales * 30)) * 100 : 0;

        // 6. Aylık büyüme (son ay vs bu ay)
        const monthlyGrowth = totalRevenue > 0 ? 12.5 : 0; // Real data olmadığında varsayılan

        setStats({
          totalRevenue: Math.max(totalRevenue, 0),
          totalSales: totalSales,
          activeUsers: Math.max(activeUsers, 0),
          pendingRequests: pendingRequests,
          monthlyGrowth: monthlyGrowth,
          conversionRate: Number(conversionRate.toFixed(1))
        });

        console.log('📊 Stats güncellendi:', {
          totalRevenue,
          totalSales,
          activeUsers,
          pendingRequests
        });
      } catch (error) {
        console.error('Stats hesaplama hatası:', error);
      }
    };

    // İlk yüklemede hesapla
    calculateStats();

    // Her 3 saniyede bir localStorage kontrol et (real-time update)
    const interval = setInterval(calculateStats, 3000);

    return () => clearInterval(interval);
  }, []);

  // Escrow istekleri localStorage'dan otomatik yükleme
  useEffect(() => {
    const loadEscrowRequests = () => {
      try {
        const saved = localStorage.getItem('escrowRequests');
        if (saved) {
          const escrowReqs: EscrowRequest[] = JSON.parse(saved);
          setRequests(escrowReqs);
          console.log('📋 Escrow istekleri yüklendi:', escrowReqs.length);
        }
      } catch (error) {
        console.error('Escrow istekleri yükleme hatası:', error);
      }
    };

    loadEscrowRequests();

    // Her 3 saniyede bir localStorage kontrol et (real-time update)
    const interval = setInterval(loadEscrowRequests, 3000);

    return () => clearInterval(interval);
  }, []);

  // Dashboard veriler
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    activeUsers: 0,
    pendingRequests: 0,
    monthlyGrowth: 0,
    conversionRate: 0
  });

  const [salesData, setSalesData] = useState([
    { date: 'Pzr', sales: 0, revenue: 0 },
    { date: 'Pzt', sales: 0, revenue: 0 },
    { date: 'Sal', sales: 0, revenue: 0 },
    { date: 'Çar', sales: 0, revenue: 0 },
    { date: 'Per', sales: 0, revenue: 0 },
    { date: 'Cum', sales: 0, revenue: 0 },
    { date: 'Cmt', sales: 0, revenue: 0 }
  ]);

  // Haftalık satış verilerini localStorage'dan hesapla
  useEffect(() => {
    const calculateWeeklySales = () => {
      try {
        const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

        // Her gün için satış verilerini hesapla
        const newSalesData = dayNames.map((dayName, dayIndex) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + dayIndex);
          const dayStart = new Date(dayDate).setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayDate).setHours(23, 59, 59, 999);

          let daySales = 0;
          let dayRevenue = 0;

          // Payment records'tan gün içindeki satışları bul
          const paymentRecords = localStorage.getItem('payment_records');
          if (paymentRecords) {
            try {
              const records = JSON.parse(paymentRecords);
              if (Array.isArray(records)) {
                records.forEach((record: any) => {
                  if (
                    record.status === 'completed' &&
                    record.createdAt >= dayStart &&
                    record.createdAt <= dayEnd &&
                    record.amount
                  ) {
                    daySales += 1;
                    dayRevenue += record.amount;
                  }
                });
              }
            } catch (e) {
              // Hata yok saydır
            }
          }

          // Subscription'dan bugün eklenmiş olanları kontrol et
          if (dayIndex === dayNames.length - 1) { // Son gün (bugün)
            const subscriptionStr = localStorage.getItem('subscription');
            if (subscriptionStr) {
              try {
                const subscription = JSON.parse(subscriptionStr);
                const subCreatedAt = subscription.startDate || Date.now();
                const subStartDate = new Date(subCreatedAt).setHours(0, 0, 0, 0);
                if (subStartDate >= dayStart && subStartDate <= dayEnd) {
                  if (subscription.amount) {
                    dayRevenue += subscription.amount;
                  }
                }
              } catch (e) {
                // Hata yok saydır
              }
            }
          }

          return {
            date: dayName,
            sales: daySales,
            revenue: dayRevenue
          };
        });

        setSalesData(newSalesData);
        console.log('📈 Haftalık satış verileri güncellendi:', newSalesData);
      } catch (error) {
        console.error('Haftalık satış hesaplama hatası:', error);
      }
    };

    // İlk yüklemede hesapla
    calculateWeeklySales();

    // Her 5 saniyede bir güncelle
    const interval = setInterval(calculateWeeklySales, 5000);
    return () => clearInterval(interval);
  }, []);

  const [users, setUsers] = useState<User[]>([]);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'coupon_001',
      code: 'WELCOME20',
      discountType: 'percentage',
      discountValue: 20,
      maxUses: 100,
      usedCount: 45,
      expiryDate: Date.now() + 7776000000,
      status: 'active',
      minPurchase: 100000,
      createdAt: Date.now() - 2592000000
    },
    {
      id: 'coupon_002',
      code: 'SAVE500K',
      discountType: 'fixed',
      discountValue: 500000,
      maxUses: 50,
      usedCount: 18,
      expiryDate: Date.now() + 3888000000,
      status: 'active',
      minPurchase: 2000000,
      createdAt: Date.now() - 1296000000
    },
    {
      id: 'coupon_003',
      code: 'NEWUSER15',
      discountType: 'percentage',
      discountValue: 15,
      maxUses: 200,
      usedCount: 12,
      expiryDate: Date.now() - 86400000,
      status: 'expired',
      minPurchase: 0,
      createdAt: Date.now() - 5184000000
    }
  ]);

  const [showNewCouponForm, setShowNewCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    maxUses: 100,
    expiryDate: '',
    minPurchase: 0
  });

  // ============ ADVANCED FILTERING ============
  const [filters, setFilters] = useState({
    // Escrow filtreleri
    escrowStartDate: '',
    escrowEndDate: '',
    escrowStatus: 'all' as 'all' | 'pending' | 'approved' | 'rejected' | 'delivered',
    escrowMinAmount: '',
    escrowMaxAmount: '',
    // Kupon filtreleri
    couponStatus: 'all' as 'all' | 'active' | 'expired' | 'paused',
    couponStartDate: '',
    couponEndDate: '',
    couponMinDiscount: '',
    couponMaxDiscount: '',
    // Kullanıcı filtreleri
    userStatus: 'all' as 'all' | 'active' | 'inactive' | 'banned',
    userRole: 'all' as 'all' | 'admin' | 'user' | 'manager',
    userJoinStartDate: '',
    userJoinEndDate: '',
  });

  // ============ SEARCH FUNCTIONALITY ============
  const [searchTerms, setSearchTerms] = useState({
    escrowSearch: '',
    userSearch: '',
    couponSearch: '',
  });

  // Başlangıçta istekleri yükle
  useEffect(() => {
    loadRequests();
  }, []);

  // Receipts sekmesi aktif olduğunda bekleyen dekonları getir
  useEffect(() => {
    if (selectedTab === 'receipts') {
      fetchPendingReceipts();
    }
  }, [selectedTab]);

  const fetchPendingReceipts = async () => {
    try {
      const response = await fetch('/api/receipt/admin/pending', {
        headers: {
          'x-admin-id': adminUser?.adminId || 'admin',
        },
      });
      const data = await response.json();
      if (data.success) {
        setPendingReceipts(data.receipts || []);
      }
    } catch (error) {
      console.error('Bekleyen dekont getirme hatası:', error);
      toast.error('Dekonts yükleme hatası');
    }
  };

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      // localStorage'dan önceden kaydedilmiş istekleri yükle
      const saved = localStorage.getItem('escrowRequests');
      if (saved) {
        const parsedRequests = JSON.parse(saved);
        setRequests([...requests, ...parsedRequests]);
        console.log('✅ Escrow istekleri yüklendi:', parsedRequests.length);
      }
    } catch (error) {
      console.error('İstekler yükleme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: EscrowRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'approved':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'delivered':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
    }
  };

  const getStatusIcon = (status: EscrowRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: EscrowRequest['status']) => {
    const labels = {
      pending: 'Bekleme',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      delivered: 'Teslim Edildi'
    };
    return labels[status];
  };

  const handleApprove = async (request: EscrowRequest) => {
    try {
      const updated = { ...request, status: 'approved' as const, approvedAt: Date.now() };

      // localStorage'a kaydet
      const saved = localStorage.getItem('escrowRequests') || '[]';
      const savedRequests: EscrowRequest[] = JSON.parse(saved);
      const updatedSaved = savedRequests.map(r => r.id === request.id ? updated : r);
      localStorage.setItem('escrowRequests', JSON.stringify(updatedSaved));

      // State'i güncelle
      setRequests(requests.map(req =>
        req.id === request.id ? updated : req
      ));

      // Email gönder
      try {
        await fetch('/api/email/escrow-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: request.email,
            userName: request.userId,
            amount: request.amount,
            packageName: 'Master License'
          })
        });
      } catch (emailError) {
        console.warn('Email gönderme hatası:', emailError);
      }

      // Audit Log Kaydı
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'APPROVE_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          {
            before: { status: request.status },
            after: { status: 'approved' }
          },
          'success',
          undefined,
          { amount: request.amount, userEmail: request.email }
        );
      }

      toast.success(`✅ ${request.userId} onaylandı (Email gönderildi)`);
      console.log('🟢 Master License Escrow onaylandı:', request.userId);
    } catch (error) {
      toast.error('Onay işlemi başarısız');
      console.error('Onay hatası:', error);

      // Audit Log - Başarısız
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'APPROVE_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          undefined,
          'failure',
          error instanceof Error ? error.message : 'Bilinmeyen hata'
        );
      }
    }
  };

  const handleReject = async (request: EscrowRequest) => {
    try {
      const updated = { ...request, status: 'rejected' as const };

      // localStorage'a kaydet
      const saved = localStorage.getItem('escrowRequests') || '[]';
      const savedRequests: EscrowRequest[] = JSON.parse(saved);
      const updatedSaved = savedRequests.map(r => r.id === request.id ? updated : r);
      localStorage.setItem('escrowRequests', JSON.stringify(updatedSaved));

      // State'i güncelle
      setRequests(requests.map(req =>
        req.id === request.id ? updated : req
      ));

      // Email gönder
      try {
        await fetch('/api/email/escrow-rejected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: request.email,
            userName: request.userId,
            amount: request.amount,
            reason: 'Belgeler yetersiz'
          })
        });
      } catch (emailError) {
        console.warn('Email gönderme hatası:', emailError);
      }

      // Audit Log
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'REJECT_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          { before: { status: request.status }, after: { status: 'rejected' } },
          'success',
          undefined,
          { amount: request.amount }
        );
      }

      toast.error(`❌ ${request.userId} reddedildi (Email gönderildi)`);
      console.log('🔴 Master License Escrow reddedildi:', request.userId);
    } catch (error) {
      toast.error('Red işlemi başarısız');
      console.error('Red hatası:', error);
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'REJECT_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          undefined,
          'failure',
          error instanceof Error ? error.message : 'Bilinmeyen hata'
        );
      }
    }
  };

  const handleDeliver = async (request: EscrowRequest) => {
    try {
      const updated = { ...request, status: 'delivered' as const };

      // localStorage'a kaydet
      const saved = localStorage.getItem('escrowRequests') || '[]';
      const savedRequests: EscrowRequest[] = JSON.parse(saved);
      const updatedSaved = savedRequests.map(r => r.id === request.id ? updated : r);
      localStorage.setItem('escrowRequests', JSON.stringify(updatedSaved));

      // State'i güncelle
      setRequests(requests.map(req =>
        req.id === request.id ? updated : req
      ));

      // Email gönder
      try {
        await fetch('/api/email/escrow-delivered', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: request.email,
            userName: request.userId,
            downloadLink: `https://example.com/download/${request.id}`
          })
        });
      } catch (emailError) {
        console.warn('Email gönderme hatası:', emailError);
      }

      // Audit Log
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'DELIVER_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          { before: { status: request.status }, after: { status: 'delivered' } },
          'success',
          undefined,
          { amount: request.amount, userEmail: request.email }
        );
      }

      toast.success(`📦 ${request.userId} ye kaynak kodu gönderildi (Email gönderildi)`);
      console.log('✅ Kaynak kodu teslim edildi:', request.userId);
    } catch (error) {
      toast.error('Teslimat işlemi başarısız');
      console.error('Teslimat hatası:', error);
      if (adminUser) {
        createAuditLog(
          adminUser.adminId,
          adminUser.email,
          adminUser.name,
          'DELIVER_ESCROW',
          'Escrow',
          request.id,
          request.userId,
          undefined,
          'failure',
          error instanceof Error ? error.message : 'Bilinmeyen hata'
        );
      }
    }
  };

  // ============ ARAMA FONKSIYONLARI ============
  const searchEscrowRequests = (data: EscrowRequest[], term: string) => {
    if (!term.trim()) return data;

    const lowerTerm = term.toLowerCase();
    return data.filter(req =>
      req.id.toLowerCase().includes(lowerTerm) ||
      req.userId.toLowerCase().includes(lowerTerm) ||
      req.email.toLowerCase().includes(lowerTerm) ||
      req.amount.toString().includes(term) ||
      req.status.toLowerCase().includes(lowerTerm)
    );
  };

  const searchUsers = (data: User[], term: string) => {
    if (!term.trim()) return data;

    const lowerTerm = term.toLowerCase();
    return data.filter(user =>
      user.id.toLowerCase().includes(lowerTerm) ||
      user.name.toLowerCase().includes(lowerTerm) ||
      user.email.toLowerCase().includes(lowerTerm) ||
      user.package.toLowerCase().includes(lowerTerm) ||
      user.role.toLowerCase().includes(lowerTerm)
    );
  };

  const searchCoupons = (data: Coupon[], term: string) => {
    if (!term.trim()) return data;

    const lowerTerm = term.toLowerCase();
    return data.filter(coupon =>
      coupon.id.toLowerCase().includes(lowerTerm) ||
      coupon.code.toLowerCase().includes(lowerTerm) ||
      coupon.status.toLowerCase().includes(lowerTerm) ||
      coupon.discountValue.toString().includes(term)
    );
  };

  // Filtreleme fonksiyonları
  const getFilteredRequests = () => {
    let result = selectedTab === 'pending'
      ? requests.filter(r => r.status === 'pending')
      : requests;

    // Arama filtresi
    result = searchEscrowRequests(result, searchTerms.escrowSearch);

    // Status filtresi
    if (filters.escrowStatus !== 'all') {
      result = result.filter(r => r.status === filters.escrowStatus);
    }

    // Tarih aralığı filtresi
    if (filters.escrowStartDate) {
      const startDate = new Date(filters.escrowStartDate).getTime();
      result = result.filter(r => r.createdAt >= startDate);
    }
    if (filters.escrowEndDate) {
      const endDate = new Date(filters.escrowEndDate);
      endDate.setHours(23, 59, 59, 999); // Günün sonuna kadar
      result = result.filter(r => r.createdAt <= endDate.getTime());
    }

    // Tutar aralığı filtresi
    if (filters.escrowMinAmount) {
      const minAmount = parseFloat(filters.escrowMinAmount) * 1000000;
      result = result.filter(r => r.amount >= minAmount);
    }
    if (filters.escrowMaxAmount) {
      const maxAmount = parseFloat(filters.escrowMaxAmount) * 1000000;
      result = result.filter(r => r.amount <= maxAmount);
    }

    return result;
  };

  const getFilteredCoupons = () => {
    let result = coupons;

    // Arama filtresi
    result = searchCoupons(result, searchTerms.couponSearch);

    // Status filtresi
    if (filters.couponStatus !== 'all') {
      result = result.filter(c => c.status === filters.couponStatus);
    }

    // Tarih aralığı filtresi
    if (filters.couponStartDate) {
      const startDate = new Date(filters.couponStartDate).getTime();
      result = result.filter(c => c.createdAt >= startDate);
    }
    if (filters.couponEndDate) {
      const endDate = new Date(filters.couponEndDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(c => c.createdAt <= endDate.getTime());
    }

    // İndirim aralığı filtresi
    if (filters.couponMinDiscount) {
      const minDiscount = parseFloat(filters.couponMinDiscount);
      result = result.filter(c => c.discountValue >= minDiscount);
    }
    if (filters.couponMaxDiscount) {
      const maxDiscount = parseFloat(filters.couponMaxDiscount);
      result = result.filter(c => c.discountValue <= maxDiscount);
    }

    return result;
  };

  const getFilteredUsers = () => {
    let result = users;

    // Arama filtresi
    result = searchUsers(result, searchTerms.userSearch);

    // Rol filtresi
    if (filters.userRole !== 'all') {
      result = result.filter(u => u.role === filters.userRole);
    }

    // Status filtresi
    if (filters.userStatus !== 'all') {
      result = result.filter(u => u.status === filters.userStatus);
    }

    // Katılma tarihi aralığı filtresi
    if (filters.userJoinStartDate) {
      const startDate = new Date(filters.userJoinStartDate).getTime();
      result = result.filter(u => u.joinDate >= startDate);
    }
    if (filters.userJoinEndDate) {
      const endDate = new Date(filters.userJoinEndDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(u => u.joinDate <= endDate.getTime());
    }

    return result;
  };

  const isEscrowFiltered = filters.escrowStartDate || filters.escrowEndDate || filters.escrowStatus !== 'all' || filters.escrowMinAmount || filters.escrowMaxAmount;
  const isCouponFiltered = filters.couponStatus !== 'all' || filters.couponStartDate || filters.couponEndDate || filters.couponMinDiscount || filters.couponMaxDiscount;
  const isUserFiltered = filters.userRole !== 'all' || filters.userStatus !== 'all' || filters.userJoinStartDate || filters.userJoinEndDate;

  const clearEscrowFilters = () => {
    setFilters(prev => ({
      ...prev,
      escrowStartDate: '',
      escrowEndDate: '',
      escrowStatus: 'all',
      escrowMinAmount: '',
      escrowMaxAmount: '',
    }));
  };

  const clearCouponFilters = () => {
    setFilters(prev => ({
      ...prev,
      couponStatus: 'all',
      couponStartDate: '',
      couponEndDate: '',
      couponMinDiscount: '',
      couponMaxDiscount: '',
    }));
  };

  const clearUserFilters = () => {
    setFilters(prev => ({
      ...prev,
      userStatus: 'all',
      userRole: 'all',
      userJoinStartDate: '',
      userJoinEndDate: '',
    }));
  };

  const filteredRequests = getFilteredRequests();

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Kullanıcı yönetimi fonksiyonları
  const handleDeleteUser = (userId: string) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Kullanıcı silindi');
    }
  };

  const handleBanUser = (userId: string) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, status: u.status === 'banned' ? 'inactive' : 'banned' } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`${user?.name} ${users.find(u => u.id === userId)?.status === 'banned' ? 'engel kaldırıldı' : 'engellendi'}`);
  };

  const handleChangeRole = (userId: string, newRole: 'admin' | 'user' | 'manager') => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast.success('Rol değiştirildi');
  };

  // Kupon yönetimi
  const handleCreateCoupon = () => {
    if (!newCoupon.code || newCoupon.code.trim() === '') {
      toast.error('Kupon kodu boş olamaz');
      return;
    }
    if (newCoupon.discountValue <= 0) {
      toast.error('İndirim değeri 0\'dan büyük olmalıdır');
      return;
    }

    const coupon: Coupon = {
      id: `coupon_${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discountType: newCoupon.discountType,
      discountValue: newCoupon.discountValue,
      maxUses: newCoupon.maxUses,
      usedCount: 0,
      expiryDate: new Date(newCoupon.expiryDate).getTime(),
      status: 'active',
      minPurchase: newCoupon.minPurchase,
      createdAt: Date.now()
    };

    setCoupons([...coupons, coupon]);
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxUses: 100,
      expiryDate: '',
      minPurchase: 0
    });
    setShowNewCouponForm(false);
    toast.success('✅ Kupon başarıyla oluşturuldu');
  };

  const handleDeleteCoupon = (couponId: string) => {
    if (confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      setCoupons(coupons.filter(c => c.id !== couponId));
      toast.success('Kupon silindi');
    }
  };

  const handleToggleCoupon = (couponId: string) => {
    setCoupons(coupons.map(c =>
      c.id === couponId ? { ...c, status: c.status === 'paused' ? 'active' : 'paused' } : c
    ));
    toast.success('Kupon durumu güncellendi');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/30 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/rydex')} title="Ana sayfaya dön">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 group-hover:border-cyan-400/50 group-hover:bg-slate-700 transition-all">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">Admin Paneli</h1>
                <p className="text-sm text-slate-400">Master License Escrow Yönetimi</p>
              </div>
            </div>

            {/* Quick Stats and Actions */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{pendingCount}</p>
                <p className="text-sm text-slate-400">Bekleme</p>
              </div>
              <div className="h-12 w-px bg-slate-700/30"></div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">
                  {requests.filter(r => r.status === 'approved' || r.status === 'delivered').length}
                </p>
                <p className="text-sm text-slate-400">Onaylandı</p>
              </div>
              <div className="h-12 w-px bg-slate-700/30"></div>
              {adminUser && (
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Giriş Yapan</p>
                    <p className="text-sm font-semibold text-white">{adminUser.name}</p>
                  </div>
                </div>
              )}
              <div className="h-12 w-px bg-slate-700/30"></div>
              <div className="flex gap-2">
                <button
                  onClick={loadRequests}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-slate-300 disabled:text-slate-600 transition-colors"
                  title="Verileri yenile"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Çıkış yap"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Expiry Warning */}
      {showWarning && (
        <div className="border-b border-yellow-500/30 bg-yellow-500/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">
                  Token süresi dolmak üzere
                </p>
                <p className="text-xs text-yellow-300">
                  {tokenExpiresIn && tokenExpiresIn > 0 ? `${tokenExpiresIn} saniye içinde otomatik yenilenecek` : 'Yenileniyor...'}
                </p>
              </div>
            </div>
            <button
              onClick={dismissWarning}
              className="text-yellow-300 hover:text-yellow-400 text-sm font-semibold"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs with Active Highlighting */}
        <div className="flex gap-4 mb-8 border-b border-slate-700/30 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 group ${
              selectedTab === 'dashboard'
                ? 'border-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-blue-500/50'
            }`}
          >
            <BarChart3 className={`w-4 h-4 transition-transform ${selectedTab === 'dashboard' ? 'scale-110' : ''}`} />
            Dashboard
          </button>
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 group ${
              selectedTab === 'pending'
                ? 'border-orange-500 text-white shadow-sm shadow-orange-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-orange-500/50'
            }`}
          >
            Beklemede
            <span className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold ${
              selectedTab === 'pending'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-700/50 text-slate-300'
            }`}>
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('members')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'members'
                ? 'border-green-500 text-white shadow-sm shadow-green-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-green-500/50'
            }`}
          >
            <UserPlus className={`w-4 h-4 transition-transform ${selectedTab === 'members' ? 'scale-110' : ''}`} />
            Onay Bekleyen Üyeler
          </button>
          <button
            onClick={() => setSelectedTab('all')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
              selectedTab === 'all'
                ? 'border-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-blue-500/50'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'users'
                ? 'border-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-cyan-500/50'
            }`}
          >
            <Users className={`w-4 h-4 transition-transform ${selectedTab === 'users' ? 'scale-110' : ''}`} />
            Kullanıcılar ({users.length})
          </button>
          <button
            onClick={() => setSelectedTab('coupons')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'coupons'
                ? 'border-yellow-500 text-white shadow-sm shadow-yellow-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-yellow-500/50'
            }`}
          >
            🎁 Kuponlar ({coupons.length})
          </button>
          <button
            onClick={() => setSelectedTab('audit-logs')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'audit-logs'
                ? 'border-purple-500 text-white shadow-sm shadow-purple-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-purple-500/50'
            }`}
          >
            <Activity className={`w-4 h-4 transition-transform ${selectedTab === 'audit-logs' ? 'scale-110' : ''}`} />
            Denetim Günlüğü
          </button>
          <button
            onClick={() => setSelectedTab('payments')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'payments'
                ? 'border-green-500 text-white shadow-sm shadow-green-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-green-500/50'
            }`}
          >
            <DollarSign className={`w-4 h-4 transition-transform ${selectedTab === 'payments' ? 'scale-110' : ''}`} />
            Ödeme Kontrol
          </button>
          <button
            onClick={() => setSelectedTab('receipts')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'receipts'
                ? 'border-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-amber-500/50'
            }`}
          >
            📄 Dekonts
            {pendingReceipts.length > 0 && (
              <span className={`ml-2 inline-flex items-center justify-center min-w-6 h-6 rounded-full text-xs font-bold ${
                selectedTab === 'receipts'
                  ? 'bg-amber-500 text-white'
                  : 'bg-amber-500/30 text-amber-300'
              }`}>
                {pendingReceipts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab('checkout')}
            className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 whitespace-nowrap flex items-center gap-2 ${
              selectedTab === 'checkout'
                ? 'border-green-500 text-white shadow-sm shadow-green-500/20'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-green-500/50'
            }`}
          >
            💳 Checkout Yönetimi
          </button>
        </div>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/checkout')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                title="Yeni sipariş oluştur"
              >
                <Zap className="w-4 h-4" />
                Yeni Sipariş
              </button>

              <button
                onClick={handleResetDatabase}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                title="localStorage'daki tüm demo verilerini temizle"
              >
                <RefreshCw className="w-4 h-4" />
                localStorage Temizle
              </button>

              <button
                onClick={handleDeleteFirestoreUsers}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                title="Firestore users collection'ını sil"
              >
                <Trash2 className="w-4 h-4" />
                Firestore Kullanıcıları Sil
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Toplam Gelir</h3>
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {(stats.totalRevenue / 1000000).toFixed(1)}M ₺
                </p>
                <p className="text-xs text-green-400">↑ {stats.monthlyGrowth}% bu ayda</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Toplam Satış</h3>
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stats.totalSales}</p>
                <p className="text-xs text-blue-400">Master License satışları</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Aktif Kullanıcı</h3>
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stats.activeUsers}</p>
                <p className="text-xs text-cyan-400">Son 30 gün içinde</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Beklemede İstek</h3>
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{pendingCount}</p>
                <p className="text-xs text-yellow-400">Acil ilgilenilmesi gereken</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Dönüşüm Oranı</h3>
                  <Activity className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{stats.conversionRate}%</p>
                <p className="text-xs text-purple-400">Ziyaretçi → Müşteri</p>
              </div>

              <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-400">Ort. Satış Değeri</h3>
                  <DollarSign className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">
                  {(stats.totalRevenue / stats.totalSales / 1000000).toFixed(1)}M ₺
                </p>
                <p className="text-xs text-orange-400">Paket başına</p>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-6">Haftalık Satış Trendleri</h3>
              <div className="flex items-end justify-between h-64 gap-2 px-2">
                {salesData.map((data, idx) => {
                  const maxRevenue = Math.max(...salesData.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group">
                      <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all group-hover:from-blue-400 group-hover:to-blue-300 relative" style={{ height: `${height}%` }}>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {data.sales} satış
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-4">{data.date}</p>
                      <p className="text-xs text-slate-500 mt-1">{(data.revenue / 1000000).toFixed(1)}M ₺</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-6">Son İşlemler</h3>
              <div className="space-y-4">
                {requests.length > 0 ? (
                  requests.slice(-3).reverse().map((req, idx) => {
                    const timeAgo = (() => {
                      const now = Date.now();
                      const diff = now - req.createdAt;
                      const hours = Math.floor(diff / 3600000);
                      const days = Math.floor(diff / 86400000);

                      if (hours < 1) return 'az önce';
                      if (hours < 24) return `${hours} saat öncesi`;
                      if (days === 1) return '1 gün öncesi';
                      if (days < 7) return `${days} gün öncesi`;
                      return new Date(req.createdAt).toLocaleDateString('tr-TR');
                    })();

                    // Status color mapping
                    const statusColorMap: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
                      pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: Clock, label: '⏳ Beklemede' },
                      approved: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: CheckCircle, label: '✅ Onaylandı' },
                      delivered: { bg: 'bg-green-500/10', text: 'text-green-400', icon: CheckCircle, label: '📦 Teslim Edildi' },
                      rejected: { bg: 'bg-red-500/10', text: 'text-red-400', icon: AlertCircle, label: '❌ Reddedildi' }
                    };

                    const statusInfo = statusColorMap[req.status] || statusColorMap.pending;

                    return (
                      <div key={req.id} className="flex items-center gap-4 pb-4 border-b border-slate-700/30 last:border-b-0">
                        <div className={`w-10 h-10 ${statusInfo.bg} rounded-lg flex items-center justify-center`}>
                          {React.createElement(statusInfo.icon, { className: `w-5 h-5 ${statusInfo.text}` })}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">Master License {req.status === 'pending' ? 'Talebi' : 'Satışı'}</p>
                          <p className="text-xs text-slate-400">{req.email} - {timeAgo}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${statusInfo.text}`}>
                            {statusInfo.label}
                          </p>
                          {req.amount && (
                            <p className="text-xs text-slate-400">₺{(req.amount / 1000000).toFixed(1)}M</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 py-6">Henüz işlem yok</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Members Tab */}
        {selectedTab === 'members' && (
          <div className="space-y-8">
            <PendingMembersPanel adminId={adminUser?.adminId || 'admin'} />
          </div>
        )}

        {/* Coupons Tab */}
        {selectedTab === 'coupons' && (
        <div className="space-y-6">
          {/* Advanced Filtering Panel for Coupons */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚙️ Kupon Filtreleri</span>
                  {isCouponFiltered && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                      Aktif
                    </span>
                  )}
                </h3>
              </div>
              {isCouponFiltered && (
                <button
                  onClick={clearCouponFilters}
                  className="text-sm text-slate-400 hover:text-slate-300 font-semibold underline transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Durum</label>
                <select
                  value={filters.couponStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, couponStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                >
                  <option value="all">Tümü</option>
                  <option value="active">Aktif</option>
                  <option value="expired">Süresi Doldu</option>
                  <option value="paused">Durduruldu</option>
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filters.couponStartDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, couponStartDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filters.couponEndDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, couponEndDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Min Discount Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Min. İndirim</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.couponMinDiscount}
                  onChange={(e) => setFilters(prev => ({ ...prev, couponMinDiscount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Max Discount Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Maks. İndirim</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.couponMaxDiscount}
                  onChange={(e) => setFilters(prev => ({ ...prev, couponMaxDiscount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Filter Summary */}
            {isCouponFiltered && (
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-400">
                  Filtreler:
                  {filters.couponStatus !== 'all' && ` Durum: ${filters.couponStatus}`}
                  {filters.couponStartDate && ` | Başlangıç: ${new Date(filters.couponStartDate).toLocaleDateString('tr-TR')}`}
                  {filters.couponEndDate && ` | Bitiş: ${new Date(filters.couponEndDate).toLocaleDateString('tr-TR')}`}
                  {filters.couponMinDiscount && ` | Min: ${filters.couponMinDiscount}`}
                  {filters.couponMaxDiscount && ` | Maks: ${filters.couponMaxDiscount}`}
                </p>
              </div>
            )}
          </div>

          {/* Sonuç sayısı */}
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-white">{getFilteredCoupons().length}</span> sonuç bulundu (Toplam: {coupons.length})
          </div>

          {/* Create Coupon Button */}
          <button
            onClick={() => setShowNewCouponForm(!showNewCouponForm)}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Yeni Kupon Oluştur
          </button>

          {/* New Coupon Form */}
          {showNewCouponForm && (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Yeni Kupon</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Kupon Kodu (örn: WELCOME20)"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-blue-500 outline-none"
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
                <input
                  type="number"
                  placeholder={newCoupon.discountType === 'percentage' ? 'İndirim % (0-100)' : 'İndirim Tutarı (₺)'}
                  value={newCoupon.discountValue || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Maksimum Kullanım Sayısı"
                  value={newCoupon.maxUses || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="number"
                  placeholder="Minimum Satın Alma Tutarı (₺)"
                  value={newCoupon.minPurchase || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: parseInt(e.target.value) || 0 })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none"
                />
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCoupon}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Oluştur
                </button>
                <button
                  onClick={() => setShowNewCouponForm(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Coupons List */}
          <div className="grid grid-cols-1 gap-4">
            {getFilteredCoupons().length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                <p className="text-slate-400 font-semibold">
                  {isCouponFiltered ? 'Filtre kriterleriyle eşleşen kupon bulunamadı' : 'Henüz kupon yok'}
                </p>
              </div>
            ) : (
              getFilteredCoupons().map((coupon) => (
                <div
                  key={coupon.id}
                  className={`bg-slate-900/50 border rounded-lg p-6 hover:border-slate-600/50 transition-all duration-200 ${
                    coupon.status === 'expired' ? 'border-red-500/30 opacity-60' : 'border-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-yellow-400 font-mono">{coupon.code}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          coupon.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          coupon.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {coupon.status === 'active' ? '✓ Aktif' : coupon.status === 'expired' ? '✕ Süresi Doldu' : '⏸ Durduruldu'}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-3">
                        {coupon.discountType === 'percentage'
                          ? `%${coupon.discountValue} indirim`
                          : `₺${coupon.discountValue.toLocaleString('tr-TR')} indirim`}
                        {coupon.minPurchase > 0 && ` (Min. ₺${coupon.minPurchase.toLocaleString('tr-TR')} alım)`}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-400">Kullanım</p>
                      <p className="text-2xl font-bold text-white">
                        {coupon.usedCount}/{coupon.maxUses}
                      </p>
                      <p className="text-xs text-slate-500">
                        Kalan: {coupon.maxUses - coupon.usedCount}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800/50 rounded-full mb-4 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${(coupon.usedCount / coupon.maxUses) * 100}%` }}
                    />
                  </div>

                  {/* Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="text-slate-400">
                      Son Kullanma: <span className="text-slate-300 font-semibold">{new Date(coupon.expiryDate).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="text-slate-400">
                      Oluşturulma: <span className="text-slate-300 font-semibold">{new Date(coupon.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleCoupon(coupon.id)}
                      className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        coupon.status === 'paused'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      }`}
                    >
                      {coupon.status === 'paused' ? '▶ Etkinleştir' : '⏸ Durdur'}
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-400 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* Users Table */}
        {selectedTab === 'users' && (
        <div className="space-y-6">
          {/* Advanced Filtering Panel for Users */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚙️ Kullanıcı Filtreleri</span>
                  {isUserFiltered && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                      Aktif
                    </span>
                  )}
                </h3>
              </div>
              {isUserFiltered && (
                <button
                  onClick={clearUserFilters}
                  className="text-sm text-slate-400 hover:text-slate-300 font-semibold underline transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Rol</label>
                <select
                  value={filters.userRole}
                  onChange={(e) => setFilters(prev => ({ ...prev, userRole: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                >
                  <option value="all">Tümü</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Yönetici</option>
                  <option value="user">Kullanıcı</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Durum</label>
                <select
                  value={filters.userStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, userStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                >
                  <option value="all">Tümü</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="banned">Engelli</option>
                </select>
              </div>

              {/* Join Start Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Katılma Başlangıç</label>
                <input
                  type="date"
                  value={filters.userJoinStartDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, userJoinStartDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Join End Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Katılma Bitiş</label>
                <input
                  type="date"
                  value={filters.userJoinEndDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, userJoinEndDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Filter Summary */}
            {isUserFiltered && (
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-400">
                  Filtreler:
                  {filters.userRole !== 'all' && ` Rol: ${filters.userRole}`}
                  {filters.userStatus !== 'all' && ` | Durum: ${filters.userStatus}`}
                  {filters.userJoinStartDate && ` | Başlangıç: ${new Date(filters.userJoinStartDate).toLocaleDateString('tr-TR')}`}
                  {filters.userJoinEndDate && ` | Bitiş: ${new Date(filters.userJoinEndDate).toLocaleDateString('tr-TR')}`}
                </p>
              </div>
            )}
          </div>

          {/* Sonuç sayısı */}
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-white">{getFilteredUsers().length}</span> sonuç bulundu (Toplam: {users.length})
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getFilteredUsers().length === 0 ? (
              <div className="col-span-full text-center py-12 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                <p className="text-slate-400 font-semibold">
                  {isUserFiltered ? 'Filtre kriterleriyle eşleşen kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
                </p>
              </div>
            ) : (
              getFilteredUsers().map((user) => (
              <div
                key={user.id}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{user.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                        user.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'admin' ? '👨‍💼 Admin' : user.role === 'manager' ? '📊 Yönetici' : '👤 Kullanıcı'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{user.email}</p>
                    <div className="space-y-2 text-xs text-slate-400">
                      <p>📦 Paket: <span className="text-slate-300 font-semibold">{user.package}</span></p>
                      <p>📅 Katılma: <span className="text-slate-300 font-semibold">{new Date(user.joinDate).toLocaleDateString('tr-TR')}</span></p>
                      <p>🔌 Son giriş: <span className="text-slate-300 font-semibold">{new Date(user.lastLogin).toLocaleDateString('tr-TR')}</span></p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    user.status === 'banned' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {user.status === 'active' ? '✓ Aktif' : user.status === 'banned' ? '✕ Engelli' : '⏸ Pasif'}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="mb-4 p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Rol Seç:</p>
                  <div className="flex gap-2 flex-wrap">
                    {(['user', 'manager', 'admin'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => handleChangeRole(user.id, role)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                          user.role === role
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {role === 'admin' ? '👨‍💼' : role === 'manager' ? '📊' : '👤'} {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-700/30">
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      user.status === 'banned'
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    }`}
                  >
                    {user.status === 'banned' ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Engel Kaldır
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Engelle
                      </>
                    )}
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-1 px-3 py-2 bg-red-600/30 hover:bg-red-600/40 text-red-400 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-2 border border-red-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  )}
                </div>
              </div>
            ))
            )}
          </div>
        </div>
        )}

        {/* All Tab - Tüm Üyeler ve Satın Almalar */}
        {selectedTab === 'all' && (
          <div className="space-y-12">
            {/* Tüm Üyeler */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Tüm Üyeler</h2>
              <PendingMembersPanel adminId={adminUser?.adminId || 'admin'} />
            </div>

            {/* Tüm Satın Almalar */}
            <div className="space-y-4 pt-8 border-t border-slate-700/30">
              <h2 className="text-2xl font-bold text-white">Satın Alma İşlemleri</h2>
              <PaymentControlPanel />
            </div>

            {/* Dekont Yönetimi */}
            <div className="space-y-4 pt-8 border-t border-slate-700/30">
              <h2 className="text-2xl font-bold text-white">💳 Dekont (Havale) Yönetimi</h2>
              <ReceiptManagementAdmin />
            </div>
          </div>
        )}

        {/* Requests Table - Pending tab için */}
        {selectedTab === 'pending' && (
        <div className="space-y-6">
          {/* Search Panel */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Escrow ID, kullanıcı, email veya tutar ile ara..."
                  value={searchTerms.escrowSearch}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, escrowSearch: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
              {searchTerms.escrowSearch && (
                <button
                  onClick={() => setSearchTerms(prev => ({ ...prev, escrowSearch: '' }))}
                  className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors"
                >
                  ✕ Temizle
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filtering Panel */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚙️ Gelişmiş Filtreler</span>
                  {isEscrowFiltered && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full font-semibold">
                      Aktif
                    </span>
                  )}
                </h3>
              </div>
              {isEscrowFiltered && (
                <button
                  onClick={clearEscrowFilters}
                  className="text-sm text-slate-400 hover:text-slate-300 font-semibold underline transition-colors"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Status</label>
                <select
                  value={filters.escrowStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, escrowStatus: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                >
                  <option value="all">Tümü</option>
                  <option value="pending">Bekleme</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                  <option value="delivered">Teslim Edildi</option>
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Başlangıç Tarihi</label>
                <input
                  type="date"
                  value={filters.escrowStartDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, escrowStartDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Bitiş Tarihi</label>
                <input
                  type="date"
                  value={filters.escrowEndDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, escrowEndDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:border-blue-500 outline-none"
                />
              </div>

              {/* Min Amount Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Min. Tutar (M ₺)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.escrowMinAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, escrowMinAmount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  min="0"
                  step="0.1"
                />
              </div>

              {/* Max Amount Filter */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Maks. Tutar (M ₺)</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.escrowMaxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, escrowMaxAmount: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:border-blue-500 outline-none"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {/* Filter Summary */}
            {isEscrowFiltered && (
              <div className="mt-4 pt-4 border-t border-slate-700/30">
                <p className="text-xs text-slate-400">
                  Filtreler:
                  {filters.escrowStatus !== 'all' && ` Status: ${filters.escrowStatus}`}
                  {filters.escrowStartDate && ` | Başlangıç: ${new Date(filters.escrowStartDate).toLocaleDateString('tr-TR')}`}
                  {filters.escrowEndDate && ` | Bitiş: ${new Date(filters.escrowEndDate).toLocaleDateString('tr-TR')}`}
                  {filters.escrowMinAmount && ` | Min: ${filters.escrowMinAmount}M ₺`}
                  {filters.escrowMaxAmount && ` | Maks: ${filters.escrowMaxAmount}M ₺`}
                </p>
              </div>
            )}
          </div>

          {/* Sonuç sayısı */}
          <div className="text-sm text-slate-400">
            <span className="font-semibold text-white">{getFilteredRequests().length}</span> sonuç bulundu (Toplam: {requests.length})
          </div>
        </div>
        )}

        {/* Requests List */}
        {(selectedTab === 'pending' || selectedTab === 'all') && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 border border-slate-700/50 rounded-lg">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-slate-400 font-semibold">Beklemede talep yok</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-bold text-white">{request.userId}</h3>
                      <div className={`flex items-center gap-2 px-3 py-1 border rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-semibold">{getStatusLabel(request.status)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">E-mail: {request.email}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right ml-6">
                    <p className="text-2xl font-bold text-yellow-400">
                      {(request.amount / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-slate-400">Master License</p>
                  </div>
                </div>

                {/* Timeline & Tracking */}
                <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-slate-500">Talep Tarihi:</p>
                      <p className="text-slate-300 font-semibold">
                        {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    {request.approvedAt && (
                      <div>
                        <p className="text-slate-500">Onay Tarihi:</p>
                        <p className="text-green-400 font-semibold">
                          {new Date(request.approvedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Tracking Link */}
                  <div className="pt-4 border-t border-slate-700/30">
                    <button
                      onClick={() => {
                        const trackingInfo = `
Emanet ID: ${request.id}
Kullanıcı: ${request.userId}
E-mail: ${request.email}
Tutar: ${(request.amount / 1000000).toFixed(1)}M ₺
Durum: ${getStatusLabel(request.status)}
Talep Tarihi: ${new Date(request.createdAt).toLocaleDateString('tr-TR')}
${request.approvedAt ? `Onay Tarihi: ${new Date(request.approvedAt).toLocaleDateString('tr-TR')}` : ''}
                        `;
                        console.log('📍 Takip Bilgileri:', trackingInfo);
                        toast.success('✓ Takip bilgileri gösterildi');
                      }}
                      className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                      title="Emanet takip ve detay bilgilerini gör"
                    >
                      <span>📍</span>
                      Takip & Detay Gör
                    </button>
                  </div>
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Onayla
                    </button>
                    <button
                      onClick={() => handleReject(request)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600/30 hover:bg-red-600/40 disabled:bg-slate-600/30 text-red-400 font-semibold rounded-lg transition-colors text-sm border border-red-500/30"
                    >
                      Reddet
                    </button>
                  </div>
                )}

                {request.status === 'approved' && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleDeliver(request)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Kaynak Kodu Gönder
                    </button>
                  </div>
                )}

                {request.status === 'delivered' && (
                  <div className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30 inline-block text-sm font-semibold">
                    ✓ Teslim Edildi
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        )}

        {/* Audit Logs Tab */}
        {selectedTab === 'audit-logs' && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Denetim Günlüğü</h3>
                  <p className="text-sm text-slate-400">Tüm admin işlemleri ve değişiklikleri</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Audit logs'u fetch et
                      toast.success('Denetim günlüğü yenilendi');
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                  </button>
                  <button
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    İndir
                  </button>
                </div>
              </div>

              {/* Audit Log Entries */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/30 transition-all">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Escrow Onaylandı</h4>
                      <p className="text-sm text-slate-400">Admin Kullanıcı - Escrow #escrow_001</p>
                      <p className="text-xs text-slate-500 mt-1">Master License Satışı - ₺3.000.000</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 font-semibold">Bugün, 14:30</p>
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mt-2">Başarılı</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/30 transition-all">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">👥</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Kullanıcı Rolü Değiştirildi</h4>
                      <p className="text-sm text-slate-400">Admin Kullanıcı - User #user_003</p>
                      <p className="text-xs text-slate-500 mt-1">user → manager (Zeynep Kaya)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 font-semibold">Dün, 09:15</p>
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mt-2">Başarılı</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:border-slate-600/30 transition-all">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Kupon Oluşturuldu</h4>
                      <p className="text-sm text-slate-400">Admin Kullanıcı - Coupon #coupon_001</p>
                      <p className="text-xs text-slate-500 mt-1">WELCOME20 - %20 indirim</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 font-semibold">2 gün önce, 11:42</p>
                    <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded mt-2">Başarılı</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-red-700/20 rounded-lg hover:border-slate-600/30 transition-all">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">❌</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Escrow Reddedildi</h4>
                      <p className="text-sm text-slate-400">Admin Kullanıcı - Escrow #escrow_002</p>
                      <p className="text-xs text-slate-500 mt-1">Hata: Eksik belge</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300 font-semibold">3 gün önce, 16:20</p>
                    <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded mt-2">Başarısız</span>
                  </div>
                </div>
              </div>

              {/* Pagination / Load More */}
              <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors">
                Daha Fazla Yükle
              </button>
            </div>
          </div>
        )}

        {/* Receipts Tab - Dekont Yönetimi */}
        {selectedTab === 'receipts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Dekont Yönetimi</h2>
                <p className="text-slate-400 text-sm mt-1">Üyelerin yükledikleri dekonları inceleme ve onaylama</p>
              </div>
              <div className="px-4 py-2 bg-amber-500/20 text-amber-300 rounded-lg font-semibold text-sm">
                ⏳ Onay Bekleyen: {pendingReceipts.length}
              </div>
            </div>

            {pendingReceipts.length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-12 text-center">
                <div className="text-4xl mb-3">✓</div>
                <p className="text-slate-300 font-semibold">Tüm dekonlar incelendi</p>
                <p className="text-slate-400 text-sm mt-2">Onay bekleyen dekont bulunmamaktadır</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReceipts.map((receipt) => (
                  <div key={receipt.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden hover:border-slate-600 transition-all">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        {/* Kullanıcı Bilgileri */}
                        <div>
                          <p className="text-slate-400 text-xs font-semibold mb-1">KULLANICI BİLGİLERİ</p>
                          <p className="text-white font-semibold">{receipt.user_id}</p>
                          <p className="text-slate-400 text-sm">{receipt.subscription_id}</p>
                        </div>

                        {/* Paket Bilgileri */}
                        <div>
                          <p className="text-slate-400 text-xs font-semibold mb-1">PAKET BİLGİLERİ</p>
                          <p className="text-white font-semibold">{receipt.plan.toUpperCase()}</p>
                          <p className="text-yellow-400 font-semibold">{receipt.amount?.toLocaleString('tr-TR')} ₺</p>
                        </div>

                        {/* Yükleme Tarihi */}
                        <div>
                          <p className="text-slate-400 text-xs font-semibold mb-1">YÜKLEME TARİHİ</p>
                          <p className="text-white font-semibold">
                            {new Date(receipt.uploaded_at).toLocaleDateString('tr-TR')}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {new Date(receipt.uploaded_at).toLocaleTimeString('tr-TR')}
                          </p>
                        </div>
                      </div>

                      {/* Dosya Bilgileri */}
                      <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700/30">
                        <p className="text-slate-300 text-sm">
                          <span className="font-semibold">Dosya:</span> {receipt.file_name}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Boyut: {(receipt.file_size / 1024 / 1024).toFixed(2)} MB • Tür: {receipt.mime_type}
                        </p>
                        {receipt.file_url && (
                          <a
                            href={receipt.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                          >
                            📄 Dosyayı Aç
                          </a>
                        )}
                      </div>

                      {/* Onay Notları */}
                      <div className="mb-4">
                        <label className="text-slate-300 text-sm font-semibold block mb-2">
                          Onay Notları (İsteğe bağlı)
                        </label>
                        <textarea
                          value={approvalNotes[receipt.id] || ''}
                          onChange={(e) => setApprovalNotes({
                            ...approvalNotes,
                            [receipt.id]: e.target.value
                          })}
                          placeholder="Reddedilirse sebep yazınız veya genel notlar ekleyiniz..."
                          className="w-full bg-slate-700/30 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                          rows={2}
                        />
                      </div>

                      {/* Aksiyon Butonları */}
                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            setApprovingReceipt(receipt.id);
                            try {
                              // 1. Dekont onay işlemi
                              const response = await fetch('/api/receipt/approve', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'x-admin-id': adminUser?.id || 'admin',
                                },
                                body: JSON.stringify({
                                  receiptId: receipt.id,
                                  status: 'approved',
                                  notes: approvalNotes[receipt.id] || 'Belge onaylandı',
                                }),
                              });

                              const data = await response.json();
                              if (data.success) {
                                toast.success('Dekont onaylandı');
                                // Listeyi güncelle
                                setPendingReceipts(pendingReceipts.filter(r => r.id !== receipt.id));

                                // 2. Subscription'ı aktif et
                                console.log(`📦 Subscription aktif ediliyor... Plan: ${receipt.plan}, Kullanıcı: ${receipt.user_id}`);

                                const subResponse = await fetch('/api/subscription/create', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    userId: receipt.user_id,
                                    plan: receipt.plan,
                                  }),
                                });

                                const subData = await subResponse.json();
                                if (subData.success && subData.subscription) {
                                  toast.success(`✓ Subscription aktif edildi: ${receipt.plan.toUpperCase()}`);
                                  console.log(`✅ Subscription oluşturuldu:`, subData.subscription);
                                } else {
                                  toast.error('Subscription oluşturulamadı, ancak dekont onaylandı');
                                  console.warn('Subscription create hatası:', subData.message);
                                }
                              } else {
                                toast.error(data.message || 'Onaylama başarısız');
                              }
                            } catch (error) {
                              console.error('Hata:', error);
                              toast.error('Onaylama sırasında hata oluştu');
                            } finally {
                              setApprovingReceipt(null);
                            }
                          }}
                          disabled={approvingReceipt !== null}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                        >
                          {approvingReceipt === receipt.id ? '⏳ İşleniyor...' : '✓ Onayla'}
                        </button>

                        <button
                          onClick={async () => {
                            setApprovingReceipt(receipt.id);
                            try {
                              const response = await fetch('/api/receipt/approve', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'x-admin-id': adminUser?.id || 'admin',
                                },
                                body: JSON.stringify({
                                  receiptId: receipt.id,
                                  status: 'rejected',
                                  notes: approvalNotes[receipt.id] || 'Belge yetersiz',
                                }),
                              });

                              const data = await response.json();
                              if (data.success) {
                                toast.success('Dekont reddedildi');
                                setPendingReceipts(pendingReceipts.filter(r => r.id !== receipt.id));
                              } else {
                                toast.error(data.message || 'Red işlemi başarısız');
                              }
                            } catch (error) {
                              toast.error('Red işlemi sırasında hata oluştu');
                            } finally {
                              setApprovingReceipt(null);
                            }
                          }}
                          disabled={approvingReceipt !== null || !approvalNotes[receipt.id]}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                        >
                          {approvingReceipt === receipt.id ? '⏳ İşleniyor...' : '✗ Reddet'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkout Settings Tab */}
        {selectedTab === 'checkout' && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-2">💳 Checkout Yönetimi</h3>
                <p className="text-sm text-slate-400">Banka hesapları, ödeme yöntemleri ve kupon kodlarını yönetin</p>
              </div>
              <CheckoutSettingsAdmin />
            </div>
          </div>
        )}

        {/* Payment Control Tab */}
        {selectedTab === 'payments' && (
          <PaymentControlPanel />
        )}
      </div>

      {/* Footer - WhatsApp İletişim */}
      <footer className="border-t border-slate-700/30 mt-12 py-8 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-lg font-bold text-white mb-4">Admin Desteği</h3>
          <p className="text-slate-400 mb-6">Yönetim paneli ile ilgili sorularınız veya teknik destek için iletişime geçin</p>
          <a
            href="https://wa.me/905425783748"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp: +90 542 578 37 48
          </a>
          <p className="text-slate-500 text-sm mt-6">Teknik destek ekibimiz 24/7 hazır</p>
        </div>
      </footer>
    </div>
  );
}
