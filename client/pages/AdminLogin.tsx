import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { loginAdminLocal, isAdminLoggedIn, scheduleTokenRefresh } from '@/lib/admin-auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Zaten giriş yapılmışsa admin paneline yönlendir
  React.useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      // Email validasyonu
      if (!trimmedEmail) {
        throw new Error('E-posta adresi girin');
      }

      // Şifre validasyonu
      if (!trimmedPassword) {
        throw new Error('Şifre girin');
      }

      // Admin olarak giriş yap (client-side)
      const authToken = await loginAdminLocal({ email: trimmedEmail, password: trimmedPassword });

      // Token refresh scheduling'i başlat
      scheduleTokenRefresh();

      toast.success(`Hoş geldiniz, ${authToken.name}!`);

      // Admin paneline yönlendir
      setTimeout(() => {
        navigate('/admin');
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Giriş başarısız oldu';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Admin login hatası:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Form */}
      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Paneli</h1>
          <p className="text-slate-400 text-center mb-8">Güvenli giriş yapın</p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm font-semibold">Hata</p>
                <p className="text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                E-Posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                autoFocus
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-6"
            >
              <Lock className="w-5 h-5" />
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              🔒 Tüm işlemler SSL şifreli bağlantı ile yapılır. Giriş bilgileriniz güvende.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-3">
          <p className="text-slate-400 text-sm">
            Bu sayfa sadece yöneticiler için tasarlanmıştır
          </p>

          <div className="pt-3 border-t border-slate-700/30">
            <p className="text-slate-400 text-sm">
              Üye misiniz?{' '}
              <Link
                to="/member-login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Üye Giriş
              </Link>
            </p>
          </div>

          <div className="pt-3 border-t border-slate-700/30">
            <Link
              to="/rydex"
              className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
