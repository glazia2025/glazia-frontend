// Export all API services and types
export * from './api';
export * from './productApi';
export * from './cartApi';
export * from './authApi';
export * from './profileApi';
export * from './hardwareApi';
export * from './railingsApi';

// Re-export commonly used services for convenience
export { productApi, categoryApi, userApi } from './productApi';
export { cartApi, orderApi, checkoutApi } from './cartApi';
export { authApi } from './authApi';
export { profileApi } from './profileApi';
export { hardwareApi } from './hardwareApi';
export { railingsApi } from './railingsApi';

// API Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API response utilities
export const handleApiResponse = <T>(response: any): T => {
  if (!response.success) {
    throw new ApiError(
      response.message || 'API request failed',
      response.status,
      response.code,
      response.error
    );
  }
  return response.data;
};

// API request retry utility
export const retryApiRequest = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Cache utilities for API responses
export class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Create global cache instance
export const apiCache = new ApiCache();

// Cached API call wrapper
export const cachedApiCall = async <T>(
  key: string,
  apiCall: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> => {
  // Check cache first
  const cached = apiCache.get(key);
  if (cached) {
    return cached;
  }
  
  // Make API call and cache result
  const result = await apiCall();
  apiCache.set(key, result, ttlMs);
  
  return result;
};

// Environment configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.glazia.com',
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3'),
  CACHE_TTL: parseInt(process.env.NEXT_PUBLIC_API_CACHE_TTL || '300000'), // 5 minutes
} as const;

// API status checker
export const checkApiHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime?: number;
}> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: API_CONFIG.VERSION,
    };
  }
};
