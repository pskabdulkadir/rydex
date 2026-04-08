import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, Subscription } from '@shared/api';

/**
 * Firestore'dan kullanıcı profilini al
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('getUserProfile hatası:', error);
    throw error;
  }
}

/**
 * Firestore'da kullanıcı profili oluştur
 */
export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userProfile: UserProfile = {
      uid,
      email: data.email || '',
      username: data.username || 'Kullanıcı',
      phone: data.phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), userProfile);
  } catch (error) {
    console.error('createUserProfile hatası:', error);
    throw error;
  }
}

/**
 * Firestore'da kullanıcı profilini güncelle
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('updateUserProfile hatası:', error);
    throw error;
  }
}

/**
 * Firestore'dan kullanıcının subscription bilgisini al
 */
export async function getUserSubscription(uid: string): Promise<(Subscription & { daysRemaining: number }) | null> {
  try {
    const subDocRef = doc(db, 'users', uid, 'subscription', 'active');
    const subDocSnap = await getDoc(subDocRef);

    if (subDocSnap.exists()) {
      const data = subDocSnap.data();
      const endDate = data.endDate instanceof Timestamp 
        ? data.endDate.toDate().getTime() 
        : new Date(data.endDate).getTime();
      
      const now = Date.now();
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

      return {
        ...data,
        endDate,
        daysRemaining,
      } as Subscription & { daysRemaining: number };
    }
    return null;
  } catch (error) {
    console.error('getUserSubscription hatası:', error);
    throw error;
  }
}

/**
 * Firestore'da subscription oluştur veya güncelle
 */
export async function setUserSubscription(
  uid: string,
  subscription: Subscription
): Promise<void> {
  try {
    const subDocRef = doc(db, 'users', uid, 'subscription', 'active');
    
    const subscriptionData = {
      ...subscription,
      endDate: Timestamp.fromDate(new Date(subscription.endDate)),
      updatedAt: Timestamp.now(),
    };

    await setDoc(subDocRef, subscriptionData);
    console.log(`✅ Subscription Firestore'a kaydedildi: ${uid}`);
  } catch (error) {
    console.error('setUserSubscription hatası:', error);
    throw error;
  }
}

/**
 * Kullanıcının Firestore'daki profilini güncelle (admin onayı sonrası)
 */
export async function updateUserApprovalStatus(
  uid: string,
  approvalStatus: 'pending' | 'approved' | 'rejected',
  isActive: boolean,
  packageId?: string,
  subscriptionEnd?: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const updateData: any = {
      approval_status: approvalStatus,
      is_active: isActive,
      updatedAt: new Date().toISOString(),
    };

    if (packageId) {
      updateData.current_package = packageId;
    }
    if (subscriptionEnd) {
      updateData.subscription_end = subscriptionEnd;
      updateData.subscription_start = new Date().toISOString();
    }

    await updateDoc(userRef, updateData);
    console.log(`✅ Kullanıcı onay durumu güncellendi: ${uid} -> ${approvalStatus}`);
  } catch (error) {
    console.error('updateUserApprovalStatus hatası:', error);
    throw error;
  }
}

/**
 * Firestore'dan tüm kullanıcıları al (admin paneli için)
 */
export async function getAllUsers(): Promise<any[]> {
  try {
    const { collection, getDocs } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('getAllUsers hatası:', error);
    return [];
  }
}

/**
 * localStorage'daki verileri Firestore'a migrate et
 */
export async function migrateUserDataToFirestore(uid: string): Promise<void> {
  try {
    // localStorage'dan veri oku
    const savedProfile = localStorage.getItem('user_profile');
    const savedSubscription = localStorage.getItem('subscription');

    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      await updateUserProfile(uid, profileData);
    }

    if (savedSubscription) {
      const subscriptionData = JSON.parse(savedSubscription);
      await setUserSubscription(uid, subscriptionData);
    }
  } catch (error) {
    console.error('migrateUserDataToFirestore hatası:', error);
    throw error;
  }
}
