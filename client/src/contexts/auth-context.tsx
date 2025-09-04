import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendSignInLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeSignIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendSignInLink = async (email: string): Promise<void> => {
    // For now, let's use a simple approach that works with any domain
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/complete`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
    } catch (error: any) {
      console.error('Email link error:', error);
      throw new Error('Email authentication is not configured. Please use Google sign-in instead.');
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Log current domain for debugging
      console.log('Current domain:', window.location.origin);
      console.log('Auth domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
      
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      if (error.code === 'auth/unauthorized-domain') {
        throw new Error(`This domain (${window.location.origin}) is not authorized for Firebase authentication. Please add it to your Firebase project's authorized domains in the Firebase Console under Authentication > Settings > Authorized domains.`);
      }
      
      throw error;
    }
  };

  const completeSignIn = async (email: string): Promise<void> => {
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      throw new Error('Invalid sign-in link');
    }

    try {
      await signInWithEmailLink(auth, email, window.location.href);
      // Clear stored email
      localStorage.removeItem('emailForSignIn');
    } catch (error) {
      console.error('Error completing sign-in:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    sendSignInLink,
    signInWithGoogle,
    completeSignIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}