'use client';

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { authApi, userApi } from '../services';
import { useApp } from '../contexts/AppContext';

/**
 * Hook for authentication API operations
 */
export const useAuthApi = () => {
  const { setUser, setAuthentication, clearUser } = useApp();

  // Send OTP
  const useSendOtp = () => {
    return useMutation<any, { mobileNumber: string }>(
      ({ mobileNumber }) => authApi.sendOtp(mobileNumber)
    );
  };

  // Verify OTP
  const useVerifyOtp = () => {
    return useMutation<any, {
      mobileNumber: string;
      otp: string;
      otpId: string;
    }>(
      (data) => authApi.verifyOtp(data),
      {
        onSuccess: (response) => {
          if (response.userExists && response.token) {
            // User exists and is logged in
            localStorage.setItem('authToken', response.token);
            setAuthentication(true);
            if (response.user) {
              setUser(response.user);
            }
          }
          // If user doesn't exist, the login component will handle registration
        }
      }
    );
  };

  // Register new user
  const useRegister = () => {
    return useMutation<any, {
      mobileNumber: string;
      userName: string;
      email: string;
      gstNumber?: string;
      pincode: string;
      city: string;
      state: string;
      completeAddress: string;
    }>(
      (userData) => authApi.register(userData),
      {
        onSuccess: (response) => {
          if (response.success && response.token) {
            localStorage.setItem('authToken', response.token);
            setAuthentication(true);
            setUser(response.user);
          }
        }
      }
    );
  };

  // Login with credentials
  const useLogin = () => {
    return useMutation<any, {
      email?: string;
      mobileNumber?: string;
      password: string;
    }>(
      (credentials) => authApi.login(credentials),
      {
        onSuccess: (response) => {
          if (response.success && response.token) {
            localStorage.setItem('authToken', response.token);
            setAuthentication(true);
            setUser(response.user);
          }
        }
      }
    );
  };

  // Logout
  const useLogout = () => {
    return useMutation<any, void>(
      () => authApi.logout(),
      {
        onSuccess: () => {
          localStorage.removeItem('authToken');
          setAuthentication(false);
          clearUser();
        }
      }
    );
  };

  // Refresh token
  const useRefreshToken = () => {
    return useMutation<any, { refreshToken: string }>(
      ({ refreshToken }) => authApi.refreshToken(refreshToken),
      {
        onSuccess: (response) => {
          if (response.success && response.token) {
            localStorage.setItem('authToken', response.token);
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken);
            }
          }
        }
      }
    );
  };

  // Verify authentication
  const useVerifyAuth = (immediate: boolean = false) => {
    return useApi(
      () => authApi.verifyAuth(),
      { 
        immediate,
        onSuccess: (response) => {
          if (response.valid && response.user) {
            setAuthentication(true);
            setUser(response.user);
          } else {
            setAuthentication(false);
            clearUser();
            localStorage.removeItem('authToken');
          }
        },
        onError: () => {
          setAuthentication(false);
          clearUser();
          localStorage.removeItem('authToken');
        }
      }
    );
  };

  // Request password reset
  const useRequestPasswordReset = () => {
    return useMutation<any, {
      email?: string;
      mobileNumber?: string;
    }>(
      (data) => authApi.requestPasswordReset(data)
    );
  };

  // Reset password
  const useResetPassword = () => {
    return useMutation<any, {
      resetId: string;
      newPassword: string;
      confirmPassword: string;
    }>(
      (data) => authApi.resetPassword(data)
    );
  };

  // Change password
  const useChangePassword = () => {
    return useMutation<any, {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }>(
      (data) => authApi.changePassword(data)
    );
  };

  // Update profile
  const useUpdateProfile = () => {
    return useMutation<any, {
      userName?: string;
      email?: string;
      gstNumber?: string;
      pincode?: string;
      city?: string;
      state?: string;
      completeAddress?: string;
    }>(
      (profileData) => authApi.updateProfile(profileData),
      {
        onSuccess: (response) => {
          if (response.success && response.user) {
            setUser(response.user);
          }
        }
      }
    );
  };

  // Delete account
  const useDeleteAccount = () => {
    return useMutation<any, { password: string }>(
      ({ password }) => authApi.deleteAccount(password),
      {
        onSuccess: () => {
          localStorage.removeItem('authToken');
          setAuthentication(false);
          clearUser();
        }
      }
    );
  };

  // Get user sessions
  const useUserSessions = (immediate: boolean = false) => {
    return useApi(
      () => authApi.getUserSessions(),
      { immediate }
    );
  };

  // Revoke session
  const useRevokeSession = () => {
    return useMutation<any, { sessionId: string }>(
      ({ sessionId }) => authApi.revokeSession(sessionId)
    );
  };

  // Revoke all sessions
  const useRevokeAllSessions = () => {
    return useMutation<any, void>(
      () => authApi.revokeAllSessions()
    );
  };

  return {
    useSendOtp,
    useVerifyOtp,
    useRegister,
    useLogin,
    useLogout,
    useRefreshToken,
    useVerifyAuth,
    useRequestPasswordReset,
    useResetPassword,
    useChangePassword,
    useUpdateProfile,
    useDeleteAccount,
    useUserSessions,
    useRevokeSession,
    useRevokeAllSessions,
  };
};

/**
 * Hook for user profile API operations
 */
export const useUserApi = () => {
  const { setUser } = useApp();

  // Get user profile
  const useProfile = (immediate: boolean = false) => {
    return useApi(
      () => userApi.getProfile(),
      { 
        immediate,
        onSuccess: (data) => {
          setUser(data);
        }
      }
    );
  };

  // Update user profile
  const useUpdateProfile = () => {
    return useMutation<any, any>(
      (data) => userApi.updateProfile(data),
      {
        onSuccess: (response) => {
          setUser(response);
        }
      }
    );
  };

  // Get user orders
  const useUserOrders = (params: { page?: number; limit?: number } = {}, immediate: boolean = false) => {
    return useApi(
      () => userApi.getOrders(params),
      { immediate }
    );
  };



  // Get user addresses
  const useAddresses = (immediate: boolean = false) => {
    return useApi(
      () => userApi.getAddresses(),
      { immediate }
    );
  };

  // Add address
  const useAddAddress = () => {
    return useMutation<any, any>(
      (address) => userApi.addAddress(address)
    );
  };

  // Update address
  const useUpdateAddress = () => {
    return useMutation<any, { addressId: string; address: any }>(
      ({ addressId, address }) => userApi.updateAddress(addressId, address)
    );
  };

  // Delete address
  const useDeleteAddress = () => {
    return useMutation<any, { addressId: string }>(
      ({ addressId }) => userApi.deleteAddress(addressId)
    );
  };

  return {
    useProfile,
    useUpdateProfile,
    useUserOrders,
    useWishlist,
    useAddToWishlist,
    useRemoveFromWishlist,
    useAddresses,
    useAddAddress,
    useUpdateAddress,
    useDeleteAddress,
  };
};

/**
 * Combined hook for complete authentication and user management
 */
export const useAuthUserData = () => {
  const authHooks = useAuthApi();
  const userHooks = useUserApi();

  // Quick access methods
  const login = useCallback(async (credentials: any) => {
    const { mutate } = authHooks.useLogin();
    return mutate(credentials);
  }, [authHooks]);

  const logout = useCallback(async () => {
    const { mutate } = authHooks.useLogout();
    return mutate();
  }, [authHooks]);

  const sendOtp = useCallback(async (mobileNumber: string) => {
    const { mutate } = authHooks.useSendOtp();
    return mutate({ mobileNumber });
  }, [authHooks]);

  const verifyOtp = useCallback(async (data: any) => {
    const { mutate } = authHooks.useVerifyOtp();
    return mutate(data);
  }, [authHooks]);

  const register = useCallback(async (userData: any) => {
    const { mutate } = authHooks.useRegister();
    return mutate(userData);
  }, [authHooks]);

  return {
    ...authHooks,
    ...userHooks,
    // Quick access methods
    login,
    logout,
    sendOtp,
    verifyOtp,
    register,
  };
};
