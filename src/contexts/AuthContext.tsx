import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { auditLogPresets } from '../services/auditService';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async function login(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 監査ログを記録（成功）
      await auditLogPresets.userLogin(
        result.user.uid,
        result.user.email || email,
        true,
        undefined, // IPアドレスは取得できない場合
        navigator.userAgent
      );
      
      return result;
    } catch (error) {
      // 監査ログを記録（失敗）
      await auditLogPresets.userLogin(
        'unknown',
        email,
        false,
        undefined,
        navigator.userAgent
      );
      
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 監査ログを記録（成功）
      await auditLogPresets.userLogin(
        result.user.uid,
        result.user.email || 'google-user',
        true,
        undefined,
        navigator.userAgent
      );
      
      return result;
    } catch (error) {
      // 監査ログを記録（失敗）
      await auditLogPresets.userLogin(
        'unknown',
        'google-user',
        false,
        undefined,
        navigator.userAgent
      );
      
      throw error;
    }
  }

  async function logout() {
    try {
      if (currentUser) {
        // 監査ログを記録
        await auditLogPresets.userLogout(
          currentUser.uid,
          currentUser.email || 'unknown',
          undefined
        );
      }
      
      return signOut(auth);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
