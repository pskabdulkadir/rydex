import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Form validasyonu
    if (!trimmedEmail || !trimmedPassword) {
      setError('E-posta ve şifre gereklidir');
      setLoading(false);
      return;
    }

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Geçersiz e-posta adresi');
      setLoading(false);
      return;
    }

    try {
      await login({ email: trimmedEmail, password: trimmedPassword });
      toast.success('Giriş başarılı!');

      // Giriş başarılı olduktan sonra kullanıcı verisini Firestore'dan çek
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Eğer adminse admin paneline, değilse dashboard'a yönlendir
          if (userData.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          // Kullanıcı dokümanı bulunamadıysa dashboard'a yönlendir
          navigate('/dashboard');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giriş başarısız';
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
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Üye Paneline Giriş</h1>
        <p className="text-center text-gray-600 mb-8">Hesabınıza giriş yaparak başlayın</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="orneginiz@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
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
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Giriş Yap
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm">
            Henüz hesabınız yok mu?{' '}
            <Link to="/member-register" className="text-blue-600 hover:text-blue-700 font-medium">
              Üye Ol
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
