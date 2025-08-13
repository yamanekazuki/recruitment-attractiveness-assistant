import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';

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

// 管理者のメールアドレスリスト
const ADMIN_EMAILS = [
  'yamane@potentialight.com' // あなたのメールアドレス
];

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  async function adminLogin(email: string, password: string) {
    // 管理者メールアドレスかチェック
    if (!ADMIN_EMAILS.includes(email)) {
      throw new Error('管理者アカウントではありません');
    }
    
    return signInWithEmailAndPassword(auth, email, password);
  }

  function adminLogout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && ADMIN_EMAILS.includes(user.email || '')) {
        setCurrentAdmin(user);
        setIsAdmin(true);
      } else {
        setCurrentAdmin(null);
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
