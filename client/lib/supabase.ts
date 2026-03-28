import { createClient } from '@supabase/supabase-js';

// Vite'da ortam değişkenleri import.meta.env ile okunur
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation: Supabase anahtarlarının varlığını kontrol et
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('HATA: Supabase anahtarları eksik! .env dosyasını kontrol edin.');
  console.error('VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY gerekli.');
}

// Supabase istemcisini oluştur
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
