import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  FirebaseUser,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';

export interface UserProfileData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  planName: 'Starter' | 'Pro Creator' | 'Studio' | 'Enterprise';
  credits: number;
  totalGenerated: number;
  monthlyQuota: number;
  renewalDate: string;
  createdAt?: any;
  lastLoginAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfileData | null;
  loading: boolean;
  isCloudSynced: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number, newPlan?: 'Starter' | 'Pro Creator' | 'Studio' | 'Enterprise') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Sync / Create user profile in Firestore
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    const userPath = `users/${firebaseUser.uid}`;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      let snap;
      try {
        snap = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userPath);
      }

      if (snap.exists()) {
        const data = snap.data() as UserProfileData;
        setUserProfile(data);
        setIsCloudSynced(true);
        // Update last login
        try {
          await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            photoURL: firebaseUser.photoURL || data.photoURL || '',
            displayName: firebaseUser.displayName || data.displayName || 'Creator',
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, userPath);
        }
      } else {
        // First-time user creation (Commercial Bonus: 200 free starter trial credits)
        const initialProfile: UserProfileData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Creator',
          photoURL: firebaseUser.photoURL || '',
          planName: 'Starter',
          credits: 200,
          totalGenerated: 0,
          monthlyQuota: 500,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(userRef, initialProfile);
          setUserProfile(initialProfile);
          setIsCloudSynced(true);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, userPath);
        }
      }
    } catch (err) {
      console.warn('Firestore sync profile fallback to local memory:', err);
      // Fallback local memory profile
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'user@example.com',
        displayName: firebaseUser.displayName || 'AI Creator',
        photoURL: firebaseUser.photoURL || '',
        planName: 'Pro Creator',
        credits: 3200,
        totalGenerated: 14,
        monthlyQuota: 5000,
        renewalDate: '2026-09-01',
      });
      setIsCloudSynced(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setIsCloudSynced(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        if (name) {
          await updateProfile(result.user, { displayName: name });
        }
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!userProfile) return true; // Guest fallback
    if (userProfile.credits < amount) return false;

    const newCredits = Math.max(0, userProfile.credits - amount);
    const newTotal = (userProfile.totalGenerated || 0) + 1;

    setUserProfile(prev => prev ? { ...prev, credits: newCredits, totalGenerated: newTotal } : null);

    if (user) {
      const userPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          credits: newCredits,
          totalGenerated: newTotal,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to sync deducted credits to Firestore:', e);
      }
    }
    return true;
  };

  const addCredits = async (amount: number, newPlan?: 'Starter' | 'Pro Creator' | 'Studio' | 'Enterprise') => {
    if (!userProfile) return;

    const updatedCredits = userProfile.credits + amount;
    const updatedPlan = newPlan || userProfile.planName;

    setUserProfile(prev => prev ? { ...prev, credits: updatedCredits, planName: updatedPlan } : null);

    if (user) {
      const userPath = `users/${user.uid}`;
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          credits: updatedCredits,
          planName: updatedPlan,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Failed to sync added credits to Firestore:', e);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await syncUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isCloudSynced,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      deductCredits,
      addCredits,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
