import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, UserPlus, Mail, Lock, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createLocalAccount } from '@/lib/auth-local';
import { initializeDB as initDB } from '@/lib/local-db';
import { toast } from 'sonner';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      await initDB();
      await createLocalAccount(email, password, displayName);
      toast.success('Hesap başarıyla oluşturuldu');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.message || 'Kayıt başarısız';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Görüntüleme Sistemi</h1>
          <p className="text-gray-600">Yeni hesap oluşturun</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Adınız
              </label>
              <Input
                type="text"
                placeholder="Adınız Soyadınız"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-posta
              </label>
              <Input
                type="email"
                placeholder="orneginiz@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Şifre
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="border-gray-300"
              />
              <p className="text-xs text-gray-600 mt-1">En az 6 karakter</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Hesap Oluştur
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/signin"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Giriş Yapın
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-600">
          Tüm veriler cihazınızda yerel olarak saklanır. Herhangi bir sunucuya gönderilmez.
        </p>
      </div>
    </div>
  );
}
