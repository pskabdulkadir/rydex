import { RequestHandler } from "express";

// Checkout ayarları bellek içinde depolama (üretimde veritabanı kullanılır)
interface BankAccount {
  id: string;
  accountHolder: string;
  iban: string;
  bankName: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface PaymentMethod {
  id: string;
  type: 'credit-card' | 'bank-transfer';
  isEnabled: boolean;
  label: string;
  description: string;
  updatedAt: number;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  isActive: boolean;
  expiryDate?: number;
  createdAt: number;
  updatedAt: number;
}

interface PackagePrice {
  packageId: string;
  originalPrice: number;
  currentPrice: number;
  discount?: number;
  updatedAt: number;
}

interface CheckoutSettings {
  bankAccounts: BankAccount[];
  paymentMethods: PaymentMethod[];
  coupons: Coupon[];
  packagePrices: PackagePrice[];
  lastUpdatedBy?: string;
  lastUpdatedAt: number;
}

// Varsayılan checkout ayarları
const defaultCheckoutSettings: CheckoutSettings = {
  bankAccounts: [
    {
      id: 'bank_1',
      accountHolder: 'Abdulkadir Kan',
      iban: 'TR32 0015 7000 0000 0091 7751 22',
      bankName: 'QNB Finansbank',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  paymentMethods: [
    {
      id: 'pm_creditcard',
      type: 'credit-card',
      isEnabled: true,
      label: 'Kredi Kartı',
      description: 'Visa, Mastercard, American Express',
      updatedAt: Date.now(),
    },
    {
      id: 'pm_banktransfer',
      type: 'bank-transfer',
      isEnabled: true,
      label: 'Banka Transferi',
      description: 'Türk bankalarına banka transferi',
      updatedAt: Date.now(),
    },
  ],
  coupons: [
    {
      id: 'coupon_1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      minPurchase: 100000,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'coupon_2',
      code: 'SAVE500K',
      type: 'fixed',
      value: 500000,
      minPurchase: 2000000,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'coupon_3',
      code: 'NEWUSER15',
      type: 'percentage',
      value: 15,
      minPurchase: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  packagePrices: [],
  lastUpdatedAt: Date.now(),
};

// Bellekte ayarları sakla
let checkoutSettings: CheckoutSettings = JSON.parse(JSON.stringify(defaultCheckoutSettings));

// ==================== GETTER ENDPOINTS ====================

/**
 * Checkout ayarlarını getir
 * GET /api/checkout-settings
 */
export const handleGetCheckoutSettings: RequestHandler = (_req, res) => {
  try {
    res.json({
      success: true,
      data: checkoutSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Checkout ayarları alınamadı',
    });
  }
};

/**
 * Banka hesaplarını getir
 * GET /api/checkout-settings/bank-accounts
 */
export const handleGetBankAccounts: RequestHandler = (_req, res) => {
  try {
    res.json({
      success: true,
      data: checkoutSettings.bankAccounts,
      count: checkoutSettings.bankAccounts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Banka hesapları alınamadı',
    });
  }
};

/**
 * Ödeme yöntemlerini getir
 * GET /api/checkout-settings/payment-methods
 */
export const handleGetPaymentMethods: RequestHandler = (_req, res) => {
  try {
    res.json({
      success: true,
      data: checkoutSettings.paymentMethods,
      count: checkoutSettings.paymentMethods.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ödeme yöntemleri alınamadı',
    });
  }
};

/**
 * Kupon kodlarını getir
 * GET /api/checkout-settings/coupons
 */
export const handleGetCoupons: RequestHandler = (_req, res) => {
  try {
    res.json({
      success: true,
      data: checkoutSettings.coupons,
      count: checkoutSettings.coupons.length,
      activeCount: checkoutSettings.coupons.filter(c => c.isActive).length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kupon kodları alınamadı',
    });
  }
};

// ==================== BANKA HESABI YÖNETIMI ====================

/**
 * Yeni banka hesabı ekle
 * POST /api/checkout-settings/bank-accounts
 */
export const handleAddBankAccount: RequestHandler = (req, res) => {
  try {
    const { accountHolder, iban, bankName } = req.body;

    if (!accountHolder || !iban || !bankName) {
      return res.status(400).json({
        success: false,
        error: 'Tüm alanlar gerekli: accountHolder, iban, bankName',
      });
    }

    const newAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      accountHolder,
      iban,
      bankName,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    checkoutSettings.bankAccounts.push(newAccount);
    checkoutSettings.lastUpdatedAt = Date.now();

    res.status(201).json({
      success: true,
      message: 'Banka hesabı başarıyla eklendi',
      data: newAccount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Banka hesabı eklenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Banka hesabını güncelle
 * PUT /api/checkout-settings/bank-accounts/:id
 */
export const handleUpdateBankAccount: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { accountHolder, iban, bankName, isActive } = req.body;

    const accountIndex = checkoutSettings.bankAccounts.findIndex(acc => acc.id === id);

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Banka hesabı bulunamadı',
      });
    }

    const account = checkoutSettings.bankAccounts[accountIndex];
    
    if (accountHolder !== undefined) account.accountHolder = accountHolder;
    if (iban !== undefined) account.iban = iban;
    if (bankName !== undefined) account.bankName = bankName;
    if (isActive !== undefined) account.isActive = isActive;
    
    account.updatedAt = Date.now();
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Banka hesabı başarıyla güncellendi',
      data: account,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Banka hesabı güncellenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Banka hesabını sil
 * DELETE /api/checkout-settings/bank-accounts/:id
 */
export const handleDeleteBankAccount: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const accountIndex = checkoutSettings.bankAccounts.findIndex(acc => acc.id === id);

    if (accountIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Banka hesabı bulunamadı',
      });
    }

    const deletedAccount = checkoutSettings.bankAccounts.splice(accountIndex, 1)[0];
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Banka hesabı başarıyla silindi',
      data: deletedAccount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Banka hesabı silinirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// ==================== ÖDEME YÖNTEMİ YÖNETIMI ====================

/**
 * Yeni ödeme yöntemi ekle
 * POST /api/checkout-settings/payment-methods
 */
export const handleAddPaymentMethod: RequestHandler = (req, res) => {
  try {
    const { type, label, description, isEnabled } = req.body;

    if (!type || !label || !description) {
      return res.status(400).json({
        success: false,
        error: 'Tüm alanlar gerekli: type, label, description',
      });
    }

    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type,
      label,
      description,
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      updatedAt: Date.now(),
    };

    checkoutSettings.paymentMethods.push(newMethod);
    checkoutSettings.lastUpdatedAt = Date.now();

    res.status(201).json({
      success: true,
      message: 'Ödeme yöntemi başarıyla eklendi',
      data: newMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ödeme yöntemi eklenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Ödeme yöntemini güncelle (label, description, isEnabled)
 * PUT /api/checkout-settings/payment-methods/:id
 */
export const handleUpdatePaymentMethod: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { isEnabled, label, description } = req.body;

    const methodIndex = checkoutSettings.paymentMethods.findIndex(pm => pm.id === id);

    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ödeme yöntemi bulunamadı',
      });
    }

    const method = checkoutSettings.paymentMethods[methodIndex];

    if (isEnabled !== undefined) method.isEnabled = isEnabled;
    if (label !== undefined) method.label = label;
    if (description !== undefined) method.description = description;
    method.updatedAt = Date.now();

    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Ödeme yöntemi başarıyla güncellendi',
      data: method,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ödeme yöntemi güncellenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Ödeme yöntemini sil
 * DELETE /api/checkout-settings/payment-methods/:id
 */
export const handleDeletePaymentMethod: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const methodIndex = checkoutSettings.paymentMethods.findIndex(pm => pm.id === id);

    if (methodIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ödeme yöntemi bulunamadı',
      });
    }

    const deletedMethod = checkoutSettings.paymentMethods.splice(methodIndex, 1)[0];
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Ödeme yöntemi başarıyla silindi',
      data: deletedMethod,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ödeme yöntemi silinirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// ==================== KUPON YÖNETIMI ====================

/**
 * Yeni kupon oluştur
 * POST /api/checkout-settings/coupons
 */
export const handleCreateCoupon: RequestHandler = (req, res) => {
  try {
    const { code, type, value, minPurchase, expiryDate } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli alanlar: code, type, value',
      });
    }

    // Kupon kodu benzersizliğini kontrol et
    if (checkoutSettings.coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Bu kupon kodu zaten var',
      });
    }

    const newCoupon: Coupon = {
      id: `coupon_${Date.now()}`,
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
      isActive: true,
      expiryDate: expiryDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    checkoutSettings.coupons.push(newCoupon);
    checkoutSettings.lastUpdatedAt = Date.now();

    res.status(201).json({
      success: true,
      message: 'Kupon başarıyla oluşturuldu',
      data: newCoupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kupon oluşturulurken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Kuponu güncelle
 * PUT /api/checkout-settings/coupons/:id
 */
export const handleUpdateCoupon: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, minPurchase, isActive, expiryDate } = req.body;

    const couponIndex = checkoutSettings.coupons.findIndex(c => c.id === id);

    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Kupon bulunamadı',
      });
    }

    const coupon = checkoutSettings.coupons[couponIndex];

    // Kupon kodu güncelleniyor ve başka kuponla çakışıyor mu kontrolü
    if (code && code.toUpperCase() !== coupon.code && 
        checkoutSettings.coupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      return res.status(400).json({
        success: false,
        error: 'Bu kupon kodu zaten var',
      });
    }

    if (code !== undefined) coupon.code = code.toUpperCase();
    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (expiryDate !== undefined) coupon.expiryDate = expiryDate;

    coupon.updatedAt = Date.now();
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Kupon başarıyla güncellendi',
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kupon güncellenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Kuponu sil
 * DELETE /api/checkout-settings/coupons/:id
 */
export const handleDeleteCoupon: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const couponIndex = checkoutSettings.coupons.findIndex(c => c.id === id);

    if (couponIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Kupon bulunamadı',
      });
    }

    const deletedCoupon = checkoutSettings.coupons.splice(couponIndex, 1)[0];
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Kupon başarıyla silindi',
      data: deletedCoupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Kupon silinirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

// ==================== PAKET FİYAT YÖNETIMI ====================

/**
 * Paket fiyatını güncelle
 * PUT /api/checkout-settings/package-prices/:packageId
 */
export const handleUpdatePackagePrice: RequestHandler = (req, res) => {
  try {
    const { packageId } = req.params;
    const { originalPrice, currentPrice, discount } = req.body;

    if (currentPrice === undefined) {
      return res.status(400).json({
        success: false,
        error: 'currentPrice alanı gerekli',
      });
    }

    let priceEntry = checkoutSettings.packagePrices.find(p => p.packageId === packageId);

    if (!priceEntry) {
      priceEntry = {
        packageId,
        originalPrice: originalPrice || currentPrice,
        currentPrice,
        discount,
        updatedAt: Date.now(),
      };
      checkoutSettings.packagePrices.push(priceEntry);
    } else {
      if (originalPrice !== undefined) priceEntry.originalPrice = originalPrice;
      priceEntry.currentPrice = currentPrice;
      if (discount !== undefined) priceEntry.discount = discount;
      priceEntry.updatedAt = Date.now();
    }

    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Paket fiyatı başarıyla güncellendi',
      data: priceEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Paket fiyatı güncellenirken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Tüm checkout ayarlarını sıfırla (varsayılana dönüş)
 * POST /api/checkout-settings/reset
 */
export const handleResetCheckoutSettings: RequestHandler = (_req, res) => {
  try {
    checkoutSettings = JSON.parse(JSON.stringify(defaultCheckoutSettings));
    checkoutSettings.lastUpdatedAt = Date.now();

    res.json({
      success: true,
      message: 'Checkout ayarları varsayılan değerlere sıfırlandı',
      data: checkoutSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ayarlar sıfırlanırken hata oluştu',
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
