import { RequestHandler } from "express";
import { getDatabase } from "../database";

/**
 * GÖREV 6: Search Functionality
 * - Tüm verilerde arama (users, payments, subscriptions, scans)
 * - Filtre seçenekleri (tarih, durum, tip, vb)
 * - Sıralama
 * - Sayfalama (Pagination)
 */

interface SearchQuery {
  q?: string; // Arama terimi
  type?: string; // users, payments, subscriptions, scans
  status?: string; // pending, completed, active, cancelled, vb
  sort?: string; // field:asc|desc
  page?: number;
  limit?: number;
  dateFrom?: number;
  dateTo?: number;
  [key: string]: any;
}

interface SearchResult {
  success: boolean;
  query: SearchQuery;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: any[];
  filters?: {
    types: string[];
    statuses: string[];
  };
}

// Bellekte veri depolama (demo için)
const usersDb = new Map<string, any>();
const paymentsDb = new Map<string, any>();
const subscriptionsDb = new Map<string, any>();
const scansDb = new Map<string, any>();

/**
 * Tüm verilerde global arama
 */
export const handleGlobalSearch: RequestHandler = async (req, res) => {
  try {
    const {
      q = "",
      type,
      status,
      sort = "created_at:desc",
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = req.query as any;

    // Query validasyonu
    if (!q && !type) {
      return res.status(400).json({
        success: false,
        error: "Arama terimi (q) veya tip (type) gerekli",
      });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * pageLimit;

    let results: any[] = [];
    let total = 0;

    // Arama gerçekleştir
    if (type === "users" || !type) {
      const userResults = searchUsers(q, {
        status,
        dateFrom,
        dateTo,
      });
      results.push(...userResults);
      total = userResults.length;
    }

    if (type === "payments" || !type) {
      const paymentResults = searchPayments(q, {
        status,
        dateFrom,
        dateTo,
      });
      if (!type) {
        results.push(...paymentResults.map(p => ({ ...p, _type: "payment" })));
      } else {
        results = paymentResults;
      }
      if (type === "payments") total = paymentResults.length;
    }

    if (type === "subscriptions" || !type) {
      const subResults = searchSubscriptions(q, {
        status,
        dateFrom,
        dateTo,
      });
      if (!type) {
        results.push(...subResults.map(s => ({ ...s, _type: "subscription" })));
      } else {
        results = subResults;
      }
      if (type === "subscriptions") total = subResults.length;
    }

    if (type === "scans" || !type) {
      const scanResults = searchScans(q, {
        status,
        dateFrom,
        dateTo,
      });
      if (!type) {
        results.push(...scanResults.map(s => ({ ...s, _type: "scan" })));
      } else {
        results = scanResults;
      }
      if (type === "scans") total = scanResults.length;
    }

    // Sıralama
    const [sortField, sortOrder] = (sort as string).split(":") || [];
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (aVal === undefined || bVal === undefined) return 0;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortOrder === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    total = results.length;
    const totalPages = Math.ceil(total / pageLimit);
    const paginatedResults = results.slice(skip, skip + pageLimit);

    res.json({
      success: true,
      query: { q, type, status, sort, page: pageNum, limit: pageLimit },
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages,
      data: paginatedResults,
      filters: {
        types: ["users", "payments", "subscriptions", "scans"],
        statuses: getAvailableStatuses(type),
      },
    } as SearchResult);
  } catch (error) {
    console.error("Global arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Arama yapılırken hata oluştu",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Kullanıcıları ara
 */
export const handleSearchUsers: RequestHandler = async (req, res) => {
  try {
    const {
      q = "",
      status,
      sort = "created_at:desc",
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = req.query as any;

    const results = searchUsers(q, { status, dateFrom, dateTo });
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Sıralama
    const [sortField, sortOrder] = (sort as string).split(":") || [];
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortOrder === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    const total = results.length;
    const skip = (pageNum - 1) * pageLimit;
    const totalPages = Math.ceil(total / pageLimit);
    const paginatedResults = results.slice(skip, skip + pageLimit);

    res.json({
      success: true,
      query: { q, status, sort, page: pageNum, limit: pageLimit },
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages,
      data: paginatedResults,
    });
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Kullanıcı arama yapılırken hata oluştu",
    });
  }
};

/**
 * Ödemeleri ara
 */
export const handleSearchPayments: RequestHandler = async (req, res) => {
  try {
    const {
      q = "",
      status,
      sort = "created_at:desc",
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = req.query as any;

    const results = searchPayments(q, { status, dateFrom, dateTo });
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Sıralama
    const [sortField, sortOrder] = (sort as string).split(":") || [];
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    const total = results.length;
    const skip = (pageNum - 1) * pageLimit;
    const totalPages = Math.ceil(total / pageLimit);
    const paginatedResults = results.slice(skip, skip + pageLimit);

    res.json({
      success: true,
      query: { q, status, sort, page: pageNum, limit: pageLimit },
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages,
      data: paginatedResults,
    });
  } catch (error) {
    console.error("Ödeme arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Ödeme arama yapılırken hata oluştu",
    });
  }
};

/**
 * Subscription'ları ara
 */
export const handleSearchSubscriptions: RequestHandler = async (req, res) => {
  try {
    const {
      q = "",
      status,
      sort = "created_at:desc",
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = req.query as any;

    const results = searchSubscriptions(q, { status, dateFrom, dateTo });
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Sıralama
    const [sortField, sortOrder] = (sort as string).split(":") || [];
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    const total = results.length;
    const skip = (pageNum - 1) * pageLimit;
    const totalPages = Math.ceil(total / pageLimit);
    const paginatedResults = results.slice(skip, skip + pageLimit);

    res.json({
      success: true,
      query: { q, status, sort, page: pageNum, limit: pageLimit },
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages,
      data: paginatedResults,
    });
  } catch (error) {
    console.error("Subscription arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Subscription arama yapılırken hata oluştu",
    });
  }
};

/**
 * Taramaları ara
 */
export const handleSearchScans: RequestHandler = async (req, res) => {
  try {
    const {
      q = "",
      status,
      sort = "created_at:desc",
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
    } = req.query as any;

    const results = searchScans(q, { status, dateFrom, dateTo });
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    // Sıralama
    const [sortField, sortOrder] = (sort as string).split(":") || [];
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return 0;
      });
    }

    const total = results.length;
    const skip = (pageNum - 1) * pageLimit;
    const totalPages = Math.ceil(total / pageLimit);
    const paginatedResults = results.slice(skip, skip + pageLimit);

    res.json({
      success: true,
      query: { q, status, sort, page: pageNum, limit: pageLimit },
      total,
      page: pageNum,
      limit: pageLimit,
      totalPages,
      data: paginatedResults,
    });
  } catch (error) {
    console.error("Tarama arama hatası:", error);
    res.status(500).json({
      success: false,
      error: "Tarama arama yapılırken hata oluştu",
    });
  }
};

/**
 * Yardımcı Fonksiyonlar
 */

function searchUsers(
  query: string,
  filters: { status?: string; dateFrom?: number; dateTo?: number }
): any[] {
  let results = Array.from(usersDb.values());

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        user.displayName?.toLowerCase().includes(q) ||
        user.uid?.toLowerCase().includes(q)
    );
  }

  if (filters.status) {
    results = results.filter((u) => u.status === filters.status);
  }

  if (filters.dateFrom && filters.dateTo) {
    results = results.filter(
      (u) =>
        u.createdAt >= filters.dateFrom && u.createdAt <= filters.dateTo
    );
  }

  return results;
}

function searchPayments(
  query: string,
  filters: { status?: string; dateFrom?: number; dateTo?: number }
): any[] {
  let results = Array.from(paymentsDb.values());

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (payment) =>
        payment.id?.toLowerCase().includes(q) ||
        payment.userId?.toLowerCase().includes(q) ||
        payment.transactionId?.toLowerCase().includes(q)
    );
  }

  if (filters.status) {
    results = results.filter((p) => p.status === filters.status);
  }

  if (filters.dateFrom && filters.dateTo) {
    results = results.filter(
      (p) =>
        p.createdAt >= filters.dateFrom && p.createdAt <= filters.dateTo
    );
  }

  return results;
}

function searchSubscriptions(
  query: string,
  filters: { status?: string; dateFrom?: number; dateTo?: number }
): any[] {
  let results = Array.from(subscriptionsDb.values());

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (sub) =>
        sub.id?.toLowerCase().includes(q) ||
        sub.userId?.toLowerCase().includes(q) ||
        sub.plan?.toLowerCase().includes(q)
    );
  }

  if (filters.status) {
    results = results.filter((s) => s.status === filters.status);
  }

  if (filters.dateFrom && filters.dateTo) {
    results = results.filter(
      (s) =>
        s.createdAt >= filters.dateFrom && s.createdAt <= filters.dateTo
    );
  }

  return results;
}

function searchScans(
  query: string,
  filters: { status?: string; dateFrom?: number; dateTo?: number }
): any[] {
  let results = Array.from(scansDb.values());

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (scan) =>
        scan.id?.toLowerCase().includes(q) ||
        scan.title?.toLowerCase().includes(q) ||
        scan.description?.toLowerCase().includes(q) ||
        scan.address?.toLowerCase().includes(q)
    );
  }

  if (filters.status) {
    results = results.filter((s) => s.status === filters.status);
  }

  if (filters.dateFrom && filters.dateTo) {
    results = results.filter(
      (s) =>
        s.createdAt >= filters.dateFrom && s.createdAt <= filters.dateTo
    );
  }

  return results;
}

function getAvailableStatuses(type?: string): string[] {
  const statusMap: Record<string, string[]> = {
    payments: ["pending", "completed", "failed", "refunded"],
    subscriptions: ["active", "expired", "cancelled"],
    scans: ["pending", "synced", "failed"],
    users: ["active", "inactive", "suspended"],
  };

  if (type && statusMap[type]) {
    return statusMap[type];
  }

  return Object.values(statusMap).flat();
}

/**
 * Verileri döşe (test için)
 */
export function seedSearchData() {
  // Test kullanıcıları
  usersDb.set("user_1", {
    uid: "user_1",
    email: "admin@example.com",
    displayName: "Yönetici",
    createdAt: Date.now() - 86400000 * 30,
    status: "active",
  });

  usersDb.set("user_2", {
    uid: "user_2",
    email: "user@example.com",
    displayName: "Test Kullanıcısı",
    createdAt: Date.now() - 86400000 * 15,
    status: "active",
  });

  // Test ödemeleri
  paymentsDb.set("pay_1", {
    id: "pay_1",
    userId: "user_1",
    amount: 100,
    status: "completed",
    transactionId: "TRX_123456",
    createdAt: Date.now() - 86400000 * 10,
  });

  paymentsDb.set("pay_2", {
    id: "pay_2",
    userId: "user_2",
    amount: 50,
    status: "pending",
    transactionId: "TRX_789012",
    createdAt: Date.now() - 86400000 * 5,
  });

  // Test subscription'ları
  subscriptionsDb.set("sub_1", {
    id: "sub_1",
    userId: "user_1",
    plan: "annual",
    status: "active",
    createdAt: Date.now() - 86400000 * 20,
    endDate: Date.now() + 86400000 * 345,
  });

  subscriptionsDb.set("sub_2", {
    id: "sub_2",
    userId: "user_2",
    plan: "monthly",
    status: "active",
    createdAt: Date.now() - 86400000 * 8,
    endDate: Date.now() + 86400000 * 22,
  });

  // Test taramaları
  scansDb.set("scan_1", {
    id: "scan_1",
    userId: "user_1",
    title: "İstanbul Taraması",
    description: "Tarihi alan taraması",
    address: "İstanbul, Türkiye",
    status: "synced",
    createdAt: Date.now() - 86400000 * 7,
  });

  scansDb.set("scan_2", {
    id: "scan_2",
    userId: "user_2",
    title: "Ankara Araştırması",
    description: "Arkeolojik site analizi",
    address: "Ankara, Türkiye",
    status: "synced",
    createdAt: Date.now() - 86400000 * 3,
  });

  console.log("✅ Arama sistemi test verileri yüklendi");
}
