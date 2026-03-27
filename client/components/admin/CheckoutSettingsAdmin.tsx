import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

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

type CheckoutTab = 'bank-accounts' | 'payment-methods' | 'coupons' | 'packages';

export default function CheckoutSettingsAdmin() {
  const [activeTab, setActiveTab] = useState<CheckoutTab>('bank-accounts');
  const [loading, setLoading] = useState(false);

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [newBank, setNewBank] = useState({ accountHolder: '', iban: '', bankName: '' });

  // Payment Methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'credit-card' as 'credit-card' | 'bank-transfer',
    label: '',
    description: '',
    isEnabled: true
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    minPurchase: 0,
  });

  // Package Prices
  const [packagePrices, setPackagePrices] = useState<PackagePrice[]>([]);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [newPackagePrice, setNewPackagePrice] = useState({
    packageId: '',
    originalPrice: 0,
    currentPrice: 0,
  });

  // Kullanılabilir paketler (sabit liste)
  const [availablePackages, setAvailablePackages] = useState<{ id: string; name: string; defaultPrice: number }[]>([
    { id: 'starter_scan', name: 'Starter Scan', defaultPrice: 2000 },
    { id: 'pro_explorer', name: 'Pro Explorer', defaultPrice: 6000 },
    { id: 'deep_analyser', name: 'Deep Analyser', defaultPrice: 15000 },
    { id: 'ultimate_access', name: 'Ultimate Access', defaultPrice: 30000 },
    { id: 'monthly_corp', name: 'Monthly Corp', defaultPrice: 100000 },
    { id: 'master_license', name: 'Master License', defaultPrice: 3000000 }
  ]);

  // Verileri yükle ve senkronizasyon başlat
  useEffect(() => {
    loadCheckoutSettings();
    loadAvailablePackages();

    // Her 5 saniyede bir güncellemeleri kontrol et (gerçek zamanlı senkronizasyon)
    const syncInterval = setInterval(() => {
      loadCheckoutSettings();
    }, 5000);

    return () => clearInterval(syncInterval);
  }, []);

  const loadCheckoutSettings = async () => {
    try {
      setLoading(true);

      // Banka hesapları yükle (localStorage'dan başla)
      const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]');
      if (savedBanks.length > 0) {
        setBankAccounts(savedBanks);
      } else {
        const bankRes = await fetch('/api/checkout-settings/bank-accounts');
        if (bankRes.ok) {
          const data = await bankRes.json();
          const banks = data.data || [];
          setBankAccounts(banks);
          localStorage.setItem('checkout_bank_accounts', JSON.stringify(banks));
        }
      }

      // Ödeme yöntemleri yükle
      const paymentRes = await fetch('/api/checkout-settings/payment-methods');
      if (paymentRes.ok) {
        const data = await paymentRes.json();
        setPaymentMethods(data.data || []);
      }

      // Kuponları yükle
      const couponRes = await fetch('/api/checkout-settings/coupons');
      if (couponRes.ok) {
        const data = await couponRes.json();
        setCoupons(data.data || []);
      }

      // Tüm ayarları yükle (package prices dahil)
      const allRes = await fetch('/api/checkout-settings');
      if (allRes.ok) {
        const data = await allRes.json();
        setPackagePrices(data.data?.packagePrices || []);
      }
    } catch (error) {
      console.error('Checkout ayarları yükleme hatası:', error);
      // localStorage'dan oku
      const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]');
      if (savedBanks.length > 0) {
        setBankAccounts(savedBanks);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePackages = () => {
    // Sabit paket listesi - Varsayılan Paket Fiyatları'nda gösterilecek paketler
    const packages = [
      { id: 'starter_scan', name: 'Starter Scan', defaultPrice: 2000 },
      { id: 'pro_explorer', name: 'Pro Explorer', defaultPrice: 6000 },
      { id: 'deep_analyser', name: 'Deep Analyser', defaultPrice: 15000 },
      { id: 'ultimate_access', name: 'Ultimate Access', defaultPrice: 30000 },
      { id: 'monthly_corp', name: 'Monthly Corp', defaultPrice: 100000 },
      { id: 'master_license', name: 'Master License', defaultPrice: 3000000 }
    ];
    setAvailablePackages(packages);
  };

  // ==================== BANKA HESABI İŞLEMLERİ ====================

  const handleAddBank = async () => {
    if (!newBank.accountHolder || !newBank.iban || !newBank.bankName) {
      toast.error('Tüm alanlar gerekli');
      return;
    }

    try {
      // Yeni banka hesabı objesi oluştur
      const newBankAccount: BankAccount = {
        id: `bank_${Date.now()}`,
        accountHolder: newBank.accountHolder,
        iban: newBank.iban,
        bankName: newBank.bankName,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // localStorage'a kaydet
      const savedBanks = JSON.parse(localStorage.getItem('checkout_bank_accounts') || '[]') as BankAccount[];
      const updatedBanks = [...savedBanks, newBankAccount];
      localStorage.setItem('checkout_bank_accounts', JSON.stringify(updatedBanks));

      // State'i güncelle
      setBankAccounts(updatedBanks);
      setNewBank({ accountHolder: '', iban: '', bankName: '' });
      toast.success('Banka hesabı eklendi ✓');

      // API'ye de göndermeyi dene (başarısız olursa localStorage yeterli)
      fetch('/api/checkout-settings/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBankAccount),
      }).catch(() => console.log('API sync için banka hesabı kaydedildi'));

    } catch (error) {
      toast.error('Banka hesabı eklenirken hata');
    }
  };

  const handleUpdateBank = async (id: string, updates: Partial<BankAccount>) => {
    try {
      // State ve localStorage'u güncelle
      const updatedBanks = bankAccounts.map(b =>
        b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b
      );
      setBankAccounts(updatedBanks);
      localStorage.setItem('checkout_bank_accounts', JSON.stringify(updatedBanks));
      setEditingBankId(null);
      toast.success('Banka hesabı güncellendi ✓');

      // API'ye de göndermeyi dene
      fetch(`/api/checkout-settings/bank-accounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedAt: Date.now() }),
      }).catch(() => console.log('API sync için banka hesabı güncellendi'));
    } catch (error) {
      toast.error('Güncelleme hatası');
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Bu banka hesabını silmek istediğinize emin misiniz?')) return;

    try {
      // State ve localStorage'dan sil
      const updatedBanks = bankAccounts.filter(b => b.id !== id);
      setBankAccounts(updatedBanks);
      localStorage.setItem('checkout_bank_accounts', JSON.stringify(updatedBanks));
      toast.success('Banka hesabı silindi ✓');

      // API'ye de göndermeyi dene
      fetch(`/api/checkout-settings/bank-accounts/${id}`, {
        method: 'DELETE',
      }).catch(() => console.log('API sync için banka hesabı silindi'));
    } catch (error) {
      toast.error('Silme hatası');
    }
  };

  // ==================== ÖDEME YÖNTEMİ İŞLEMLERİ ====================

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.label || !newPaymentMethod.description) {
      toast.error('Label ve açıklama gerekli');
      return;
    }

    try {
      const response = await fetch('/api/checkout-settings/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newPaymentMethod.type,
          label: newPaymentMethod.label,
          description: newPaymentMethod.description,
          isEnabled: newPaymentMethod.isEnabled
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods([...paymentMethods, data.data]);
        setNewPaymentMethod({
          type: 'credit-card' as 'credit-card' | 'bank-transfer',
          label: '',
          description: '',
          isEnabled: true
        });
        toast.success('Ödeme yöntemi eklendi');
      } else {
        toast.error('Hata oluştu');
      }
    } catch (error) {
      toast.error('Ödeme yöntemi eklenirken hata');
    }
  };

  const handleUpdatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    try {
      const response = await fetch(`/api/checkout-settings/payment-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(paymentMethods.map(pm => pm.id === id ? data.data : pm));
        setEditingPaymentId(null);
        toast.success('Ödeme yöntemi güncellendi');
      }
    } catch (error) {
      toast.error('Güncelleme hatası');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/checkout-settings/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
        toast.success('Ödeme yöntemi silindi');
      }
    } catch (error) {
      toast.error('Silme hatası');
    }
  };

  const handleTogglePaymentMethod = async (id: string, isEnabled: boolean) => {
    await handleUpdatePaymentMethod(id, { isEnabled: !isEnabled });
  };

  // ==================== KUPON İŞLEMLERİ ====================

  const handleAddCoupon = async () => {
    if (!newCoupon.code || newCoupon.value <= 0) {
      toast.error('Kupon kodu ve değeri gerekli');
      return;
    }

    try {
      const response = await fetch('/api/checkout-settings/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons([...coupons, data.data]);
        setNewCoupon({ code: '', type: 'percentage', value: 0, minPurchase: 0 });
        toast.success('Kupon eklendi');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Hata oluştu');
      }
    } catch (error) {
      toast.error('Kupon eklenirken hata');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) return;

    try {
      const response = await fetch(`/api/checkout-settings/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCoupons(coupons.filter(c => c.id !== id));
        toast.success('Kupon silindi');
      }
    } catch (error) {
      toast.error('Silme hatası');
    }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/checkout-settings/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(coupons.map(c => c.id === id ? data.data : c));
        toast.success(`Kupon ${!isActive ? 'etkinleştirildi' : 'devre dışı bırakıldı'}`);
      }
    } catch (error) {
      toast.error('Hata oluştu');
    }
  };

  // ==================== PAKET FİYAT İŞLEMLERİ ====================

  const handleAddPackagePrice = async () => {
    if (!newPackagePrice.packageId || newPackagePrice.currentPrice <= 0) {
      toast.error('Paket ve fiyat gerekli');
      return;
    }

    try {
      const response = await fetch(`/api/checkout-settings/package-prices/${newPackagePrice.packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrice: newPackagePrice.originalPrice || newPackagePrice.currentPrice,
          currentPrice: newPackagePrice.currentPrice,
          discount: newPackagePrice.originalPrice > newPackagePrice.currentPrice
            ? newPackagePrice.originalPrice - newPackagePrice.currentPrice
            : 0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPackagePrices(packagePrices.some(p => p.packageId === newPackagePrice.packageId)
          ? packagePrices.map(p => p.packageId === newPackagePrice.packageId ? data.data : p)
          : [...packagePrices, data.data]
        );
        setNewPackagePrice({ packageId: '', originalPrice: 0, currentPrice: 0 });
        toast.success('Paket fiyatı ayarlandı');
      }
    } catch (error) {
      toast.error('Paket fiyatı eklenirken hata');
    }
  };

  const handleUpdatePackagePrice = async (packageId: string, updates: Partial<PackagePrice>) => {
    try {
      const response = await fetch(`/api/checkout-settings/package-prices/${packageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setPackagePrices(packagePrices.map(p => p.packageId === packageId ? data.data : p));
        setEditingPackageId(null);
        toast.success('Paket fiyatı güncellendi');
      }
    } catch (error) {
      toast.error('Güncelleme hatası');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Başlığı */}
      <div className="flex gap-3 border-b border-slate-700/50">
        {(
          [
            { id: 'bank-accounts', label: '🏦 Banka Hesapları' },
            { id: 'payment-methods', label: '💳 Ödeme Yöntemleri' },
            { id: 'coupons', label: '🎟️ Kupon Kodları' },
            { id: 'packages', label: '📦 Paket Fiyatları' },
          ] as { id: CheckoutTab; label: string }[]
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banka Hesapları */}
      {activeTab === 'bank-accounts' && (
        <div className="space-y-6">
          <Card className="p-6 bg-slate-800/30 border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Banka Hesabı Ekle</h3>
            <div className="space-y-4">
              <Input
                placeholder="Hesap Sahibinin Adı"
                value={newBank.accountHolder}
                onChange={(e) => setNewBank({ ...newBank, accountHolder: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Input
                placeholder="IBAN (örn: TR32 0015 7000 0000 0091 7751 22)"
                value={newBank.iban}
                onChange={(e) => setNewBank({ ...newBank, iban: e.target.value.toUpperCase() })}
                className="bg-slate-700/50 border-slate-600 text-white font-mono"
              />
              <Input
                placeholder="Banka Adı"
                value={newBank.bankName}
                onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Button onClick={handleAddBank} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Hesap Ekle
              </Button>
            </div>
          </Card>

          {/* Banka Hesapları Listesi */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Mevcut Hesaplar</h3>
            {bankAccounts.map(bank => (
              <Card key={bank.id} className="p-4 bg-slate-800/30 border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingBankId === bank.id ? (
                      <div className="space-y-2">
                        <Input
                          value={bank.accountHolder}
                          onChange={(e) => {
                            const updated = { ...bank, accountHolder: e.target.value };
                            setBankAccounts(bankAccounts.map(b => b.id === bank.id ? updated : b));
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white text-sm"
                        />
                        <Input
                          value={bank.iban}
                          onChange={(e) => {
                            const updated = { ...bank, iban: e.target.value.toUpperCase() };
                            setBankAccounts(bankAccounts.map(b => b.id === bank.id ? updated : b));
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white text-sm font-mono"
                        />
                        <Input
                          value={bank.bankName}
                          onChange={(e) => {
                            const updated = { ...bank, bankName: e.target.value };
                            setBankAccounts(bankAccounts.map(b => b.id === bank.id ? updated : b));
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-semibold">{bank.accountHolder}</p>
                        <p className="text-slate-400 text-sm font-mono">{bank.iban}</p>
                        <p className="text-slate-500 text-xs">{bank.bankName}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingBankId === bank.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateBank(bank.id, bank)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingBankId(null)}
                          variant="outline"
                          className="border-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setEditingBankId(bank.id)}
                          variant="outline"
                          className="border-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteBank(bank.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ödeme Yöntemleri */}
      {activeTab === 'payment-methods' && (
        <div className="space-y-6">
          <Card className="p-6 bg-slate-800/30 border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Ödeme Yöntemi Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Ödeme Türü</label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value as 'credit-card' | 'bank-transfer' })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="credit-card">Kredi Kartı</option>
                  <option value="bank-transfer">Banka Transferi</option>
                </select>
              </div>
              <Input
                placeholder="Ödeme Yöntemi Adı (örn: Visa, Mastercard)"
                value={newPaymentMethod.label}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, label: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Input
                placeholder="Açıklama (örn: Visa, Mastercard, American Express)"
                value={newPaymentMethod.description}
                onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, description: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPaymentMethod.isEnabled}
                  onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, isEnabled: e.target.checked })}
                  className="accent-blue-500"
                />
                <span className="text-sm">Aktif Olarak Ekle</span>
              </label>
              <Button onClick={handleAddPaymentMethod} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Ödeme Yöntemi Ekle
              </Button>
            </div>
          </Card>

          {/* Ödeme Yöntemleri Listesi */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Mevcut Ödeme Yöntemleri</h3>
            {paymentMethods.map(method => (
              <Card key={method.id} className="p-4 bg-slate-800/30 border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingPaymentId === method.id ? (
                      <div className="space-y-2">
                        <Input
                          value={method.label}
                          onChange={(e) => {
                            const updated = { ...method, label: e.target.value };
                            setPaymentMethods(paymentMethods.map(pm => pm.id === method.id ? updated : pm));
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white text-sm"
                        />
                        <Input
                          value={method.description}
                          onChange={(e) => {
                            const updated = { ...method, description: e.target.value };
                            setPaymentMethods(paymentMethods.map(pm => pm.id === method.id ? updated : pm));
                          }}
                          className="bg-slate-700/50 border-slate-600 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="text-white font-semibold">{method.label}</p>
                        <p className="text-slate-400 text-sm">{method.description}</p>
                        <p className="text-slate-500 text-xs mt-1">Tür: {method.type}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {editingPaymentId === method.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdatePaymentMethod(method.id, method)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingPaymentId(null)}
                          variant="outline"
                          className="border-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => setEditingPaymentId(method.id)}
                          variant="outline"
                          className="border-slate-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleTogglePaymentMethod(method.id, method.isEnabled)}
                          className={method.isEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}
                        >
                          {method.isEnabled ? '✓ Etkin' : '✗ Kapalı'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Kupon Kodları */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <Card className="p-6 bg-slate-800/30 border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Kupon Oluştur</h3>
            <div className="space-y-4">
              <Input
                placeholder="Kupon Kodu (WELCOME20, SAVE500K vb.)"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">İndirim Türü</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white rounded px-3 py-2"
                  >
                    <option value="percentage">Yüzde (%)</option>
                    <option value="fixed">Sabit (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">İndirim Değeri</label>
                  <Input
                    type="number"
                    placeholder="20 veya 500000"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Input
                type="number"
                placeholder="Minimum Satın Alma (0 = sınır yok)"
                value={newCoupon.minPurchase}
                onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: parseFloat(e.target.value) || 0 })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
              <Button onClick={handleAddCoupon} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Kupon Oluştur
              </Button>
            </div>
          </Card>

          {/* Kuponlar Listesi */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Aktif Kuponlar</h3>
            {coupons.map(coupon => (
              <Card key={coupon.id} className="p-4 bg-slate-800/30 border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold font-mono">{coupon.code}</p>
                    <p className="text-slate-400 text-sm">
                      {coupon.type === 'percentage' ? `%${coupon.value} İndirim` : `₺${coupon.value.toLocaleString('tr-TR')} İndirim`}
                      {coupon.minPurchase > 0 && ` • Min: ₺${coupon.minPurchase.toLocaleString('tr-TR')}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleToggleCoupon(coupon.id, coupon.isActive)}
                      className={coupon.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}
                    >
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Paket Fiyatları */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <Card className="p-6 bg-slate-800/30 border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">Paket Fiyatlarını Yönet</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Paket Seç</label>
                <select
                  value={newPackagePrice.packageId}
                  onChange={(e) => setNewPackagePrice({ ...newPackagePrice, packageId: e.target.value })}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white rounded px-3 py-2"
                >
                  <option value="">Paket Seçin...</option>
                  {availablePackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} (Varsayılan: {pkg.defaultPrice > 0 ? `₺${pkg.defaultPrice.toLocaleString('tr-TR')}` : 'Ücretsiz'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Orijinal Fiyat (₺)</label>
                  <Input
                    type="number"
                    placeholder="Orijinal fiyat"
                    value={newPackagePrice.originalPrice}
                    onChange={(e) => setNewPackagePrice({ ...newPackagePrice, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Güncel Fiyat (₺)</label>
                  <Input
                    type="number"
                    placeholder="Güncel fiyat"
                    value={newPackagePrice.currentPrice}
                    onChange={(e) => setNewPackagePrice({ ...newPackagePrice, currentPrice: parseFloat(e.target.value) || 0 })}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              {newPackagePrice.originalPrice > newPackagePrice.currentPrice && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  💰 İndirim: ₺{(newPackagePrice.originalPrice - newPackagePrice.currentPrice).toLocaleString('tr-TR')}
                  ({Math.round(((newPackagePrice.originalPrice - newPackagePrice.currentPrice) / newPackagePrice.originalPrice) * 100)}% tasarruf)
                </div>
              )}
              <Button onClick={handleAddPackagePrice} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Fiyat Ayarla
              </Button>
            </div>
          </Card>

          {/* Paket Fiyatları Listesi */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Paket Fiyatları</h3>
            {packagePrices.length > 0 ? (
              packagePrices.map(price => {
                const pkg = availablePackages.find(p => p.id === price.packageId);
                return (
                  <Card key={price.packageId} className="p-4 bg-slate-800/30 border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {editingPackageId === price.packageId ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-slate-400 block mb-1">Orijinal Fiyat</label>
                                <Input
                                  type="number"
                                  value={price.originalPrice}
                                  onChange={(e) => {
                                    const updated = { ...price, originalPrice: parseFloat(e.target.value) || 0 };
                                    setPackagePrices(packagePrices.map(p => p.packageId === price.packageId ? updated : p));
                                  }}
                                  className="bg-slate-700/50 border-slate-600 text-white text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-400 block mb-1">Güncel Fiyat</label>
                                <Input
                                  type="number"
                                  value={price.currentPrice}
                                  onChange={(e) => {
                                    const updated = { ...price, currentPrice: parseFloat(e.target.value) || 0 };
                                    setPackagePrices(packagePrices.map(p => p.packageId === price.packageId ? updated : p));
                                  }}
                                  className="bg-slate-700/50 border-slate-600 text-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-white font-semibold">{pkg?.name}</p>
                            <div className="text-sm text-slate-400 mt-1 space-y-1">
                              {price.originalPrice > price.currentPrice ? (
                                <>
                                  <p>Orijinal: <span className="line-through">₺{price.originalPrice.toLocaleString('tr-TR')}</span></p>
                                  <p className="text-green-400">Güncel: ₺{price.currentPrice.toLocaleString('tr-TR')}</p>
                                  <p>İndirim: ₺{(price.originalPrice - price.currentPrice).toLocaleString('tr-TR')} ({Math.round(((price.originalPrice - price.currentPrice) / price.originalPrice) * 100)}%)</p>
                                </>
                              ) : (
                                <p>Fiyat: ₺{price.currentPrice.toLocaleString('tr-TR')}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {editingPackageId === price.packageId ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePackagePrice(price.packageId, price)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setEditingPackageId(null)}
                              variant="outline"
                              className="border-slate-600"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setEditingPackageId(price.packageId)}
                              variant="outline"
                              className="border-slate-600"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="p-6 text-center bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <p className="text-slate-400">Henüz paket fiyatı eklenmemiş</p>
              </div>
            )}
          </div>

          {/* Varsayılan Paket Fiyatları */}
          <Card className="p-6 bg-blue-500/10 border border-blue-500/20">
            <h3 className="text-lg font-bold text-blue-400 mb-4">📌 Varsayılan Paket Fiyatları</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePackages.map(pkg => (
                <div key={pkg.id} className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                  <p className="text-white font-semibold text-sm">{pkg.name}</p>
                  <p className="text-slate-300 text-lg font-bold mt-1">
                    {pkg.defaultPrice > 0 ? `₺${pkg.defaultPrice.toLocaleString('tr-TR')}` : 'Ücretsiz'}
                  </p>
                  {!packagePrices.some(p => p.packageId === pkg.id) && (
                    <p className="text-slate-500 text-xs mt-2">⚠️ Henüz fiyat ayarlanmamış</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
