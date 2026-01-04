// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Profile endpoints (Aluminium Profiles)
  PROFILES: {
    OPTIONS: '/api/user/getProducts', // Keep for backward compatibility
    CATEGORIES: '/api/profile/categories', // New endpoint for categories list
    CATEGORY_FULL: '/api/profile/category/:id/full', // New endpoint for full category data
    CATEGORY_PRODUCTS: '/api/user/getProducts',
    CATEGORY_RATES: '/profiles/categories/:category/rates',
    PRODUCT_DETAIL: '/profiles/products/:id',
    SEARCH: '/profiles/search',
    FILTERS: '/profiles/filters',
  },

  // Hardware endpoints (temporarily using profiles endpoint for testing)
  HARDWARE: {
    OPTIONS: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
    PRODUCTS: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
    BY_SUBCATEGORY: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
    PRODUCT_DETAIL: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
    SEARCH: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
    FILTERS: '/api/admin/getHardwares?reqOption=CORNER%20JOINERY',
  },

  // Railings endpoints (using profiles endpoint but filtering for railings data)
  RAILINGS: {
    OPTIONS: '/api/user/getProducts',
    CATEGORIES: '/api/railings/categories',
    CATEGORY_PRODUCTS: '/api/user/getProducts',
    CATEGORY_RATES: '/railings/categories/:category/rates',
    PRODUCT_DETAIL: '/railings/products/:id',
    SEARCH: '/railings/search',
    FILTERS: '/railings/filters',
  },

  // Legacy product endpoints (for backward compatibility)
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    FEATURED: '/products/featured',
    BY_CATEGORY: '/products/category/:categoryId',
    FILTERS: '/products/filters',
  },

  // Category endpoints
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: '/categories/:id',
    PRODUCTS: '/categories/:id/products',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/getUser',
    ORDERS: '/api/user/getOrders',
    ADDRESSES: '/user/addresses',
  },
  
  // Cart endpoints
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders/:id',
    CREATE: '/orders',
    UPDATE: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
  },
  
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_OTP: '/auth/send-otp',
  },
} as const;

// Request types
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Profile Product Schema (based on your backend model)
export interface ProfileProduct {
  id: number;
  sapCode: string;
  part: string;
  degree: string;
  description: string;
  per: string; // Unit, Meter, etc.
  kgm: number;
  length: string;
  image?: string;
  isEnabled: boolean;
}

// Profile Category Schema
export interface ProfileCategory {
  options: string[];
  rate: Record<string, string>;
  enabled: Record<string, boolean>;
  catEnabled: boolean;
  products?: Record<string, ProfileProduct[]>;
}

// Profile Options Schema (main structure)
export interface ProfileOptions {
  categories: Record<string, ProfileCategory>;
}

// Hardware Product Schema (based on your backend model)
export interface HardwareProduct {
  id: number;
  sapCode: string;
  perticular: string;
  subCategory: string;
  rate: number;
  system: string;
  moq: string;
  image?: string;
}

// Hardware Options Schema
export interface HardwareOptions {
  options: string[];
  products: Record<string, HardwareProduct[]>;
}

// API Request Parameters
export interface ProfileListParams {
  category?: string;
  option?: string;
  enabled?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'part' | 'description' | 'kgm' | 'id';
  sortOrder?: 'asc' | 'desc';
}

export interface HardwareListParams {
  subCategory?: string;
  option?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'perticular' | 'rate' | 'id';
  sortOrder?: 'asc' | 'desc';
  minRate?: number;
  maxRate?: number;
}

export interface ProfileSearchParams {
  q: string;
  category?: string;
  option?: string;
  filters?: {
    degree?: string;
    per?: string;
    minKgm?: number;
    maxKgm?: number;
    length?: string;
  };
  page?: number;
  limit?: number;
}

export interface HardwareSearchParams {
  q: string;
  subCategory?: string;
  option?: string;
  filters?: {
    system?: string;
    minRate?: number;
    maxRate?: number;
    moq?: string;
  };
  page?: number;
  limit?: number;
}

// Legacy product types (for backward compatibility)
export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  brand?: string;
}

export interface ProductSearchParams {
  q: string;
  category?: string;
  filters?: Record<string, string | number | boolean>;
  page?: number;
  limit?: number;
}

// Base API client class
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = `${API_BASE_URL}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  private buildURL(endpoint: string, params?: Record<string, string | number>): string {
    let url = endpoint;

    // Replace path parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, String(value));
      });
    }

    return `${this.baseURL}${url}`;
  }

  private buildQueryString(query?: Record<string, string | number | boolean>): string {
    if (!query || Object.keys(query).length === 0) return '';

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    return `?${params.toString()}`;
  }

  private async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      query,
    } = config;

    const url = this.buildURL(endpoint, params) + this.buildQueryString(query);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD methods
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST' });
  }

  async put<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT' });
  }

  async patch<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH' });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();
