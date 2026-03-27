/**
 * Yerel Kimlik Doğrulama
 * Telefonda yerel olarak hesap yönetimi (şifre hash'lenerek kaydedilir)
 */

import { UserProfile } from '@shared/api';
import { getLocalUser, createLocalUser, updateLocalUser } from './local-db';

interface LocalAuthUser {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string; // bcrypt yerine simple hash
  createdAt: number;
}

const AUTH_KEY = 'hazine-arama-auth';

/**
 * Basit şifre hash'leme (gerçek uygulamada bcrypt kullanılmalı)
 * NOT: Üretim için server tarafında yapılmalı
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Şifre doğrulama
 */
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Hesap oluştur (yerel)
 */
export async function createLocalAccount(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  // Email zaten var mı kontrol et
  const existingAuth = await getStoredAuth();
  if (existingAuth?.email === email) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor');
  }

  const uid = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  const passwordHash = await hashPassword(password);

  // Auth bilgilerini lokal depolama (localStorage)
  const authData: LocalAuthUser = {
    uid,
    email,
    displayName,
    passwordHash,
    createdAt: Date.now(),
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

  // Kullanıcı profili oluştur
  const userProfile: UserProfile = {
    uid,
    email,
    displayName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    preferences: {
      theme: 'light',
      language: 'tr',
      notifications: true,
    },
    statistics: {
      totalScans: 0,
      totalScanTime: 0,
      areasExplored: 0,
    },
  };

  await createLocalUser(userProfile);
  return userProfile;
}

/**
 * Giriş yap (yerel)
 */
export async function loginLocal(
  email: string,
  password: string
): Promise<UserProfile> {
  const authData = await getStoredAuth();

  if (!authData) {
    throw new Error('Hesap bulunamadı');
  }

  if (authData.email !== email) {
    throw new Error('E-posta adı yanlış');
  }

  const passwordValid = await verifyPassword(password, authData.passwordHash);
  if (!passwordValid) {
    throw new Error('Şifre yanlış');
  }

  // Kullanıcı profilini al
  const userProfile = await getLocalUser(authData.uid);
  if (!userProfile) {
    throw new Error('Kullanıcı profili bulunamadı');
  }

  return userProfile;
}

/**
 * Çıkış yap
 */
export function logoutLocal(): void {
  // localStorage'ı temizleme (veriler kalacak, sadece session)
  // Uygulamada gerekli olursa logout işlemi yapılabilir
}

/**
 * Mevcut session'ı al
 */
export async function getCurrentLocalUser(): Promise<UserProfile | null> {
  const authData = getStoredAuth();
  if (!authData) {
    return null;
  }

  const userProfile = await getLocalUser(authData.uid);
  return userProfile || null;
}

/**
 * Şifre değiştir
 */
export async function changeLocalPassword(
  email: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const authData = await getStoredAuth();

  if (!authData || authData.email !== email) {
    throw new Error('Hesap bulunamadı');
  }

  const oldPasswordValid = await verifyPassword(oldPassword, authData.passwordHash);
  if (!oldPasswordValid) {
    throw new Error('Eski şifre yanlış');
  }

  const newPasswordHash = await hashPassword(newPassword);
  const updatedAuth: LocalAuthUser = {
    ...authData,
    passwordHash: newPasswordHash,
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedAuth));
}

/**
 * Depolanan auth bilgisini al
 */
export function getStoredAuth(): LocalAuthUser | null {
  const stored = localStorage.getItem(AUTH_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as LocalAuthUser;
  } catch {
    return null;
  }
}

/**
 * Hesap silme (ve tüm verileri)
 */
export async function deleteLocalAccount(uid: string): Promise<void> {
  // Auth bilgisini sil
  const authData = getStoredAuth();
  if (authData?.uid === uid) {
    localStorage.removeItem(AUTH_KEY);
  }

  // Not: IndexedDB verileri silinmez (kullanıcı isterse manuel silme)
}

/**
 * Hesap var mı kontrol et
 */
export async function hasLocalAccount(): Promise<boolean> {
  return getStoredAuth() !== null;
}
