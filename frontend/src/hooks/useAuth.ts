import { useState, useEffect } from 'react';

export type UserRole = 'District Admin' | 'Store Supervisor' | 'Pharmacist' | 'Associate' | 'User';

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  storeId: string | null;
  storeName: string | null;
  fullName: string | null;
  loading: boolean;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    role: 'User',
    storeId: null,
    storeName: null,
    fullName: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role') as UserRole;
    const storeId = localStorage.getItem('store_id');
    const storeName = localStorage.getItem('store_name');
    const fullName = localStorage.getItem('full_name');

    if (token && role) {
      setAuth({
        isAuthenticated: true,
        role: role,
        storeId: storeId,
        storeName: storeName,
        fullName: fullName,
        loading: false,
      });
    } else {
      setAuth({
        isAuthenticated: false,
        role: 'User',
        storeId: null,
        storeName: null,
        fullName: null,
        loading: false,
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('store_id');
    localStorage.removeItem('store_name');
    localStorage.removeItem('full_name');
    setAuth({
      isAuthenticated: false,
      role: 'User',
      storeId: null,
      storeName: null,
      fullName: null,
      loading: false,
    });
    window.location.href = '/login';
  };

  return { ...auth, logout };
};
