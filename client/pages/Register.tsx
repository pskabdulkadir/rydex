import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PACKAGES } from '@shared/packages';
import { supabase } from '@/lib/supabase';

export default function Register() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const navigate = useNavigate();

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
    // Kullanıcı adında boşluk ve özel karakterleri kontrol et
    if (/\s/.test(username)) {
      setError('Kullanıcı adı boşluk içeremez');
      return false;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      setError('Kullanıcı adı sadece harf, rakam, nokta, tire ve alt çizgi içerebilir');
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
      // Email oluştururken boşlukları sil ve küçük harf yap
      const cleanEmail = `${username.trim().toLowerCase()}@yeralti.com`;

      console.log('📝 Kayıt işlemi başlandı:', {
        username: username.trim(),
        email: cleanEmail,
        phone: phone.trim(),
      });

      // 1. Kullanıcıyı Supabase Auth sistemine kaydet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            username: username.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (authError) {
        console.error('🔴 Supabase Auth Hata Detayları:', {
          message: authError.message,
          status: authError.status,
          code: (authError as any).code,
          error: authError,
        });

        // Hata türlerine göre özel mesajlar
        if (authError.message.includes('already registered')) {
          throw new Error('Bu email adresi zaten kayıtlı. Lütfen giriş yapın.');
        } else if (authError.message.includes('Invalid email')) {
          throw new Error('Geçersiz email adresi. Kullanıcı adında özel karakterler olmadığından emin olun.');
        } else if (authError.message.includes('password')) {
          throw new Error('Şifre en az 6 karakter olmalı.');
        } else if (authError.message.includes('CORS')) {
          throw new Error('CORS hatasıydı. Lütfen tekrar deneyin.');
        } else if (authError.status === 400) {
          throw new Error(`Supabase Hatası: ${authError.message}`);
        }

        throw authError;
      }

      if (!authData.user?.id) {
        throw new Error('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
      }

      console.log('✅ Supabase Auth başarılı, User ID:', authData.user.id);

      // 2. Kullanıcı bilgilerini 'users' tablosuna yaz
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            username: username.trim(),
            phone: phone.trim(),
            email: cleanEmail,
            approval_status: 'approved'
          }
        ]);

      if (dbError) {
        console.error('🔴 Veritabanı Insert Hatası:', dbError);
        // Database error'u ignore et, auth başarılı olduysa devam et
        toast.warning('Profil bilgileri kaydedilemedi ama kimlik doğrulama başarılı');
      } else {
        console.log('✅ Kullanıcı veritabanına kaydedildi');
      }

      // 3. Token ve user info'yu localStorage'a kaydet
      localStorage.setItem('auth_token', authData.session?.access_token || '');
      localStorage.setItem('userId', authData.user.id);
      localStorage.setItem('userName', username.trim());

      toast.success('Kayıt başarılı! Paket seçimine yönlendiriliyorsunuz...');

      // Eğer seçilen paket varsa checkout'a git, aksi halde pricing'e git
      if (selectedPackageId) {
        navigate('/checkout', { state: { packageId: selectedPackageId } });
      } else {
        navigate('/pricing');
      }
    } catch (error) {
      let message = 'Kayıt başarısız';

      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        message = (error as any).message;
      }

      console.error('❌ Kayıt hatası:', error);
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
