"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';

interface AdminUser {
  id: string;
  username: string;
  role: string;
  permissions: string[];
}

interface AdminContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing admin session on mount
  useEffect(() => {
    const checkAdminAuth = () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminUser');
        
        if (adminToken && adminData) {
          const user = JSON.parse(adminData);
          setAdminUser(user);
          setIsAdminAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking admin auth:', error);
        // Clear invalid data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      // Call the same API endpoint as the old admin login
      const response = await apiClient.post('/api/auth/admin/login', {
        body: { username, password }
      });

      // Save the JWT token in localStorage (using same key as old implementation)
      localStorage.setItem('authToken', response.token);

      // Also save as adminToken for compatibility with admin portal
      localStorage.setItem('adminToken', response.token);

      // Decode JWT token to get the role (admin or user)
      const decoded = JSON.parse(atob(response.token.split('.')[1])); // Decode JWT

      const adminUser: AdminUser = {
        id: decoded.id || `admin_${Date.now()}`,
        username: decoded.username || username,
        role: decoded.role || 'admin',
        permissions: decoded.role === 'admin'
          ? ['orders:read', 'orders:write', 'products:read', 'products:write', 'users:read']
          : ['orders:read', 'orders:write', 'products:read']
      };

      // Store admin user data
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      setAdminUser(adminUser);
      setIsAdminAuthenticated(true);

      return true;
    } catch (error: any) {
      console.error('Admin login error:', error);

      // Clear any existing tokens on failed login
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      return false;
    } finally {
      setLoading(false);
    }
  };

  const adminLogout = () => {
    // Remove both token keys for compatibility
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setIsAdminAuthenticated(false);
  };

  const value: AdminContextType = {
    adminUser,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    loading
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
