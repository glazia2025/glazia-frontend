'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';

/**
 * Component that refreshes user data on route changes and page refreshes
 * This ensures the localStorage 'glazia-user' data is always up-to-date
 */
export default function UserDataRefresher() {
  const pathname = usePathname();
  const { state } = useApp();
  const { refreshUserData } = useUserDataRefresh();

  // Enhanced refresh function with better logging
  const handleRefreshUserData = async (trigger: string) => {
    console.log(`🔄 UserDataRefresher: Triggered by ${trigger}`);
    const result = await refreshUserData();

    if (result.success) {
      console.log(`✅ UserDataRefresher: Successfully refreshed user data via ${trigger}`);
    } else {
      console.log(`⚠️ UserDataRefresher: Failed to refresh user data via ${trigger}:`, result.error);

      if (result.tokenExpired) {
        console.log('🔐 UserDataRefresher: User logged out due to token expiration');
      }
    }
  };

  // Refresh user data on route changes
  useEffect(() => {
    // Only refresh if user is authenticated
    if (state.isAuthenticated) {
      console.log('🛣️ UserDataRefresher: Route changed to:', pathname);
      handleRefreshUserData('route change');
    }
  }, [pathname, state.isAuthenticated]);

  // Refresh user data on page load/refresh
  useEffect(() => {
    // This will run once when the component mounts (page load/refresh)
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      console.log('🔄 UserDataRefresher: Page loaded/refreshed');
      handleRefreshUserData('page load');
    }
  }, []);

  // Listen for storage changes (in case user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        if (e.newValue) {
          // User logged in in another tab
          console.log('🔄 UserDataRefresher: Auth token added in another tab');
          handleRefreshUserData('cross-tab login');
        } else {
          // User logged out in another tab
          console.log('🔄 UserDataRefresher: Auth token removed in another tab - Clearing user data');
          localStorage.removeItem('glazia-user');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // This component doesn't render anything
  return null;
}
