"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Shield, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut,
  Home,
  BarChart3
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminUser, isAdminAuthenticated, adminLogout, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAdminAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAdminAuthenticated, loading, router]);

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home, current: pathname === '/admin/dashboard' },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, current: pathname === '/admin/orders' },
    { name: 'Products', href: '/admin/products', icon: Package, current: pathname === '/admin/products' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: pathname === '/admin/analytics' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#124657] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="admin-content">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[10010] lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar fixed inset-y-0 left-0 z-[10020] w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-[#124657]">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex flex-col h-full">
          <div className="flex-1 px-4 py-8 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-[#124657] text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#124657]'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-[#124657] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {adminUser?.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{adminUser?.username}</p>
                <p className="text-xs text-gray-500 capitalize">{adminUser?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[10000]">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-[#124657] hover:text-[#0f3a4a] font-medium"
              >
                View Main Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-gray-50 min-h-[calc(100vh-4rem)] overflow-x-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
