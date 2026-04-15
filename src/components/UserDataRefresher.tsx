'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useApp, useAuth } from '@/contexts/AppContext';
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';
import { hasAuthToken } from '@/utils/authCookie';

/**
 * Component that refreshes user data on route changes and page refreshes
 * This ensures the localStorage 'glazia-user' data is always up-to-date
 */
export default function UserDataRefresher() {
  const pathname = usePathname();
  const { state } = useApp();
  const { refreshUserData } = useUserDataRefresh();
  const { clearUser } = useAuth();

  const handleLogout = () => {
    clearUser();
    window.location.pathname="/";
  };

  // Enhanced refresh function with better logging
  const handleRefreshUserData = async (trigger: string) => {
    console.log(`🔄 UserDataRefresher: Triggered by ${trigger}`);
    const result = await refreshUserData();

    console.log(result, '<<>>>Result');

    if (result.success) {
      console.log(`✅ UserDataRefresher: Successfully refreshed user data via ${trigger}`);
    } else {
      console.log(`⚠️ UserDataRefresher: Failed to refresh user data via ${trigger}:`, result.error);
      handleLogout();

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
    if (hasAuthToken()) {
      console.log('🔄 UserDataRefresher: Page loaded/refreshed');
      handleRefreshUserData('page load');
    }
  }, []);

  // This component doesn't render anything
  return null;
}
