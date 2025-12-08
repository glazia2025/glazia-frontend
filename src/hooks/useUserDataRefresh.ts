'use client';

import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { UserApiService } from '@/services/productApi';

/**
 * Hook for manually refreshing user data
 * This can be used by components that need to trigger a user data refresh
 */
export const useUserDataRefresh = () => {
  const { setUser } = useApp();
  const userApi = new UserApiService();

  const refreshUserData = useCallback(async () => {
    try {
      // Check if user is authenticated
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        console.log('🔄 No auth token found, skipping user data refresh');
        return { success: false, error: 'No authentication token' };
      }

      console.log('🔄 Manually refreshing user data from API...');
      
      // Fetch fresh user data from API
      const response = await userApi.getProfile();
      
      if (response.success && response.data) {
        console.log('✅ User data refreshed successfully:', response.data);
        
        // Transform the API response to match the expected user data format
        const userData = {
          id: response.data._id || response.data.id,
          name: response.data.userName || response.data.name,
          email: response.data.email || '',
          phone: response.data.phoneNumber || response.data.phone,
          company: response.data.company || '',
          gstNumber: response.data.gstNumber || '',
          pincode: response.data.pincode || '',
          city: response.data.city || '',
          state: response.data.state || '',
          completeAddress: response.data.completeAddress || '',
          memberSince: response.data.createdAt 
            ? new Date(response.data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
            : 'Recently',
          totalOrders: response.data.totalOrders || 0,
          totalSpent: response.data.totalSpent || 0,
          loyaltyPoints: response.data.loyaltyPoints || 0,
          paUrl: response.data.paUrl || '',
          isAuthenticated: true,
          dynamicPricing: response.data.dynamicPricing || {}
        };

        // Update the context state
        setUser(userData);
        
        // Update localStorage with fresh data
        localStorage.setItem('glazia-user', JSON.stringify(userData));
        
        console.log('💾 User data updated in localStorage and context');
        return { success: true, data: userData };
      } else {
        console.warn('⚠️ Failed to refresh user data:', response.error || 'Unknown error');
        return { success: false, error: response.error || 'Unknown error' };
      }
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      
      // If API call fails and user is supposed to be authenticated, 
      // check if it's a token expiration or API endpoint issue
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('🔐 Token might be expired, clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('glazia-user');
          setUser(null);
          return { success: false, error: 'Token expired', tokenExpired: true };
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          console.log('🚧 API endpoint not available yet, keeping existing data');
          return { success: false, error: 'API endpoint not available' };
        } else {
          console.log('🌐 Network or server error, keeping existing data');
          return { success: false, error: error.message };
        }
      }
      
      return { success: false, error: 'Unknown error occurred' };
    }
  }, [userApi, setUser]);

  // Function to check if user data exists in localStorage
  const hasUserData = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('glazia-user');
      return !!userData;
    }
    return false;
  }, []);

  // Function to get current user data from localStorage
  const getCurrentUserData = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('glazia-user');
      if (userData) {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          return null;
        }
      }
    }
    return null;
  }, []);

  return {
    refreshUserData,
    hasUserData,
    getCurrentUserData
  };
};
