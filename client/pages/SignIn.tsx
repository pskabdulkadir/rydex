import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { loginLocal } from '@/lib/auth-local';
import { initializeDB as initDB } from '@/lib/local-db';
import { toast } from 'sonner';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      await initDB();
      await loginLocal(email, password);
      toast.success('Giriş başarılı');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error?.message || 'Giriş başarısız';
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
          <p className="text-gray-600">Sisteme giriş yapın</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSignIn} className="space-y-4">
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
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Bağlanılıyor...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Giriş Yap
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Kayıt Olun
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
