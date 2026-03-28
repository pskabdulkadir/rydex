import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, UserPlus, AlertCircle, Package, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { PACKAGES } from '@shared/packages';

export default function Register() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  // localStorage'dan seçilen paketi al
  useEffect(() => {
    const packageId = localStorage.getItem('selectedPackageId');
    if (packageId) {
      setSelectedPackageId(packageId);
    }
  }, []);

  const validateForm = () => {
    if (!username.trim()) {
      setError('Kullanıcı adı gerekli');
      return false;
    }
    if (username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalı');
      return false;
    }
    if (!phone.trim()) {
      setError('Telefon numarası gerekli');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Geçerli bir telefon numarası girin');
      return false;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        username,
        phone,
        password
      });

      toast.success('Kayıt başarılı! Paket seçimine yönlendiriliyorsunuz...');

      // Eğer seçilen paket varsa checkout'a git, aksi halde pricing'e git
      if (selectedPackageId) {
        navigate('/checkout', { state: { packageId: selectedPackageId } });
      } else {
        // Paket seçme sayfasına git
        navigate('/pricing');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Kayıt başarısız';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-blue-100 rounded-full">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">rydex'e Üye Ol</h1>
        <p className="text-center text-gray-600 mb-8">Yeni bir hesap oluşturun</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınız"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">En az 3 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 (5XX) XXX XX XX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Örnek: 05551234567</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre Tekrar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kayıt Ol
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Zaten hesabınız var mı?{' '}
            <Link to="/member-login" className="text-blue-600 hover:text-blue-700 font-medium">
              Giriş Yapın
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            to="/rydex"
            className="text-center block text-sm text-gray-600 hover:text-gray-700"
          >
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </Card>
    </div>
  );
}
