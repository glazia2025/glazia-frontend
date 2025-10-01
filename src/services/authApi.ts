import { apiClient, API_ENDPOINTS, ApiResponse } from './api';

// Authentication API service class
export class AuthApiService {
  
  /**
   * Send OTP to mobile number
   */
  async sendOtp(mobileNumber: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    otpId: string;
    expiresIn: number;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, {
      body: {
        mobileNumber,
      },
    });
  }

  /**
   * Verify OTP and login/register
   */
  async verifyOtp(data: {
    mobileNumber: string;
    otp: string;
    otpId: string;
  }): Promise<ApiResponse<{
    success: boolean;
    userExists: boolean;
    token?: string;
    user?: any;
    message: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      body: data,
    });
  }

  /**
   * Register new user
   */
  async register(userData: {
    mobileNumber: string;
    userName: string;
    email: string;
    gstNumber?: string;
    pincode: string;
    city: string;
    state: string;
    completeAddress: string;
  }): Promise<ApiResponse<{
    success: boolean;
    token: string;
    user: any;
    message: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
      body: userData,
    });
  }

  /**
   * Login with credentials (alternative login method)
   */
  async login(credentials: {
    email?: string;
    mobileNumber?: string;
    password: string;
  }): Promise<ApiResponse<{
    success: boolean;
    token: string;
    user: any;
    message: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      body: credentials,
    });
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    success: boolean;
    token: string;
    refreshToken: string;
    expiresIn: number;
  }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
      body: {
        refreshToken,
      },
    });
  }

  /**
   * Verify if user is authenticated
   */
  async verifyAuth(): Promise<ApiResponse<{
    valid: boolean;
    user?: any;
    expiresAt?: string;
  }>> {
    return apiClient.get('/auth/verify');
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: {
    email?: string;
    mobileNumber?: string;
  }): Promise<ApiResponse<{
    success: boolean;
    message: string;
    resetId: string;
  }>> {
    return apiClient.post('/auth/forgot-password', {
      body: data,
    });
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    resetId: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.post('/auth/reset-password', {
      body: data,
    });
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.put('/auth/change-password', {
      body: data,
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: {
    userName?: string;
    email?: string;
    gstNumber?: string;
    pincode?: string;
    city?: string;
    state?: string;
    completeAddress?: string;
  }): Promise<ApiResponse<{
    success: boolean;
    user: any;
    message: string;
  }>> {
    return apiClient.put('/auth/profile', {
      body: profileData,
    });
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.delete('/auth/account', {
      body: {
        password,
      },
    });
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<ApiResponse<Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>>> {
    return apiClient.get('/auth/sessions');
  }

  /**
   * Revoke user session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
  }>> {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<ApiResponse<{
    success: boolean;
    message: string;
    revokedCount: number;
  }>> {
    return apiClient.delete('/auth/sessions/all');
  }
}

// Create and export service instance
export const authApi = new AuthApiService();
