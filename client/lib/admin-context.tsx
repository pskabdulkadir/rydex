import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { scheduleTokenRefresh, cancelTokenRefreshSchedule, getAdminToken } from './admin-auth';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'banned';
  joinDate: number;
  lastLogin: number;
  package: string;
}

interface AdminCoupon {
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

interface AdminStats {
  totalRevenue: number;
  totalSales: number;
  activeUsers: number;
  pendingRequests: number;
  monthlyGrowth: number;
  conversionRate: number;
}

interface AdminContextType {
  users: AdminUser[];
  setUsers: (users: AdminUser[]) => void;
  coupons: AdminCoupon[];
  setCoupons: (coupons: AdminCoupon[]) => void;
  stats: AdminStats;
  setStats: (stats: AdminStats) => void;
  getActiveCoupons: () => AdminCoupon[];
  getActiveUserCount: () => number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const DEFAULT_USERS: AdminUser[] = [
  {
    id: 'user_001',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    role: 'user',
    status: 'active',
    joinDate: Date.now() - 2592000000,
    lastLogin: Date.now() - 86400000,
    package: 'Pro'
  },
  {
    id: 'user_002',
    name: 'Fatih Demir',
    email: 'fatih@example.com',
    role: 'user',
    status: 'active',
    joinDate: Date.now() - 5184000000,
    lastLogin: Date.now() - 3600000,
    package: 'Master License'
  },
  {
    id: 'user_003',
    name: 'Zeynep Kaya',
    email: 'zeynep@example.com',
    role: 'manager',
    status: 'active',
    joinDate: Date.now() - 7776000000,
    lastLogin: Date.now() - 172800000,
    package: 'Ultimate'
  },
  {
    id: 'user_004',
    name: 'Ali Çetin',
    email: 'ali@example.com',
    role: 'user',
    status: 'inactive',
    joinDate: Date.now() - 10368000000,
    lastLogin: Date.now() - 1296000000,
    package: 'Basic'
  },
  {
    id: 'user_005',
    name: 'Admin Kullanıcı',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    joinDate: Date.now() - 31536000000,
    lastLogin: Date.now() - 3600000,
    package: 'Master License'
  }
];

const DEFAULT_COUPONS: AdminCoupon[] = [
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
];

const DEFAULT_STATS: AdminStats = {
  totalRevenue: 25500000,
  totalSales: 8,
  activeUsers: 45,
  pendingRequests: 0,
  monthlyGrowth: 12.5,
  conversionRate: 3.2
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(DEFAULT_USERS);
  const [coupons, setCoupons] = useState<AdminCoupon[]>(DEFAULT_COUPONS);
  const [stats, setStats] = useState<AdminStats>(DEFAULT_STATS);

  // localStorage'dan veri yükle
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('adminUsers');
      const savedCoupons = localStorage.getItem('adminCoupons');
      const savedStats = localStorage.getItem('adminStats');

      if (savedUsers) setUsers(JSON.parse(savedUsers));
      if (savedCoupons) setCoupons(JSON.parse(savedCoupons));
      if (savedStats) setStats(JSON.parse(savedStats));
    } catch (error) {
      console.error('Admin verileri yükleme hatası:', error);
    }
  }, []);

  // Token auto-refresh scheduling
  useEffect(() => {
    // Admin token'ı varsa refresh scheduling'i başlat
    const token = getAdminToken();
    if (token) {
      scheduleTokenRefresh();
    }

    return () => {
      // Cleanup: token refresh timeout'unu iptal et
      cancelTokenRefreshSchedule();
    };
  }, []);

  // Verileri localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('adminUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Kullanıcıları kaydetme hatası:', error);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('adminCoupons', JSON.stringify(coupons));
    } catch (error) {
      console.error('Kuponları kaydetme hatası:', error);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('adminStats', JSON.stringify(stats));
    } catch (error) {
      console.error('İstatistikleri kaydetme hatası:', error);
    }
  }, [stats]);

  const getActiveCoupons = () => {
    return coupons.filter(c => c.status === 'active' && new Date(c.expiryDate) > new Date());
  };

  const getActiveUserCount = () => {
    return users.filter(u => u.status === 'active').length;
  };

  const value: AdminContextType = {
    users,
    setUsers,
    coupons,
    setCoupons,
    stats,
    setStats,
    getActiveCoupons,
    getActiveUserCount
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin, AdminProvider içinde kullanılmalıdır');
  }
  return context;
}
