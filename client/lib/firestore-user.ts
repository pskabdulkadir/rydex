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
    
    // Ensure endDate is a Timestamp
    const subscriptionData = {
      ...subscription,
      endDate: subscription.endDate instanceof Timestamp 
        ? subscription.endDate 
        : Timestamp.fromDate(new Date(subscription.endDate)),
      updatedAt: Timestamp.now(),
    };

    await setDoc(subDocRef, subscriptionData);
  } catch (error) {
    console.error('setUserSubscription hatası:', error);
    throw error;
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
