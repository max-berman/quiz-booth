import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sendSignInLink: (email: string) => Promise<void>;
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
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/complete`,
      handleCodeInApp: true,
    };

    console.log('Sending sign-in link to:', email);
    console.log('Action code settings:', actionCodeSettings);
    console.log('Auth object:', auth);
    console.log('Firebase config check:', {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'Set' : 'Missing',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Set' : 'Missing',
    });

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      console.log('Sign-in link sent successfully');
      // Store email in localStorage for completing sign-in
      localStorage.setItem('emailForSignIn', email);
    } catch (error: any) {
      console.error('Detailed error sending sign-in link:', {
        code: error?.code,
        message: error?.message,
        customData: error?.customData,
        stack: error?.stack
      });
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