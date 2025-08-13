import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { auditLogPresets } from '../services/auditService';

interface AdminAuthContextType {
  currentAdmin: User | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: ReactNode;
}

const ADMIN_EMAILS = ['yamane@potentialight.com'];

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function adminLogin(email: string, password: string) {
    if (!ADMIN_EMAILS.includes(email)) {
      throw new Error('管理者アカウントではありません');
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 管理者ログインの監査ログを記録
      await auditLogPresets.userLogin(
        result.user.uid,
        result.user.email || email,
        true,
        undefined,
        navigator.userAgent
      );
      
      return result;
    } catch (error) {
      // 管理者ログイン失敗の監査ログを記録
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

  async function adminLogout() {
    try {
      if (currentAdmin) {
        // 管理者ログアウトの監査ログを記録
        await auditLogPresets.userLogout(
          currentAdmin.uid,
          currentAdmin.email || 'unknown',
          undefined
        );
      }
      
      return signOut(auth);
    } catch (error) {
      console.error('管理者ログアウトエラー:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentAdmin(user);
      
      if (user && user.email) {
        const adminStatus = ADMIN_EMAILS.includes(user.email);
        setIsAdmin(adminStatus);
        
        // 管理者でない場合は一般ユーザーとして扱う
        if (!adminStatus) {
          setCurrentAdmin(null);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentAdmin,
    adminLogin,
    adminLogout,
    loading,
    isAdmin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}
