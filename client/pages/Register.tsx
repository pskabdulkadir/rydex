import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username || !phone) {
      toast.error('Tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      // 1. Firebase Auth ile gerçek mail ve şifreyle kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Kullanıcı detaylarını Firestore'a (veritabanına) kaydet
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        username: username,
        phone: phone,
        role: 'user',
        approval_status: 'pending', // Yönetici onayı bekliyor
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Kayıt başarılı!', {
        description: 'Yönetici onayı bekleniyor. Giriş sayfasına yönlendiriliyorsunuz...'
      });
      
      // Giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error: any) {
      console.error('Kayıt Hatası:', error.message);
      
      let errorMessage = 'Kayıt başarısız';
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'Bu e-posta zaten kullanılıyor';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Şifre en az 6 karakter olmalıdır';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Geçersiz e-posta adresi';
      } else {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Görüntüleme Sistemi</h1>
          <p className="text-gray-600">Yeni üyelik oluşturun</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Kullanıcı Adı
              </label>
              <Input
                type="text"
                placeholder="Kullanıcı adınız"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-posta Adresi
              </label>
              <Input
                type="email"
                placeholder="orneginiz@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="border-gray-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefon Numaranız
              </label>
              <Input
                type="tel"
                placeholder="+90 (5XX) XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="border-gray-300"
                required
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
                required
              />
              <p className="text-xs text-gray-600 mt-1">En az 6 karakter</p>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Kayıt Ol
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Giriş Yapın
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-600">
          Kayıt olduktan sonra yönetici onayı beklenecektir.
        </p>
      </div>
    </div>
  );
}
