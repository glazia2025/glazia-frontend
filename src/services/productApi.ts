import { apiClient, API_ENDPOINTS, ApiResponse, ProductListParams, ProductSearchParams } from './api';
import { Product, Category } from '../contexts/AppContext';

// Product API service class
export class ProductApiService {
  
  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.LIST, {
      query: params,
    });
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.DETAIL, {
      params: { id },
    });
  }

  /**
   * Search products
   */
  async searchProducts(params: ProductSearchParams): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.SEARCH, {
      query: params,
    });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const query = limit ? { limit } : {};
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.FEATURED, {
      query,
    });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string, 
    params: Omit<ProductListParams, 'category'> = {}
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS.BY_CATEGORY, {
      params: { categoryId },
      query: params,
    });
  }

  /**
   * Get available product filters for a category
   */
  async getProductFilters(categoryId?: string): Promise<ApiResponse<{
    priceRange: { min: number; max: number };
    brands: string[];
    specifications: Record<string, string[]>;
    availability: string[];
  }>> {
    const query = categoryId ? { category: categoryId } : {};
    return apiClient.get(API_ENDPOINTS.PRODUCTS.FILTERS, {
      query,
    });
  }

  /**
   * Get all product categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);
  }

  /**
   * Get category details
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL, {
      params: { id },
    });
  }

  /**
   * Get products for a specific category (alternative endpoint)
   */
  async getCategoryProducts(
    categoryId: string,
    params: ProductListParams = {}
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_ENDPOINTS.CATEGORIES.PRODUCTS, {
      params: { id: categoryId },
      query: params,
    });
  }
}

// Category API service class
export class CategoryApiService {
  
  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST);
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.DETAIL, {
      params: { id },
    });
  }

  /**
   * Get products for a category
   */
  async getCategoryProducts(
    categoryId: string,
    params: ProductListParams = {}
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(API_ENDPOINTS.CATEGORIES.PRODUCTS, {
      params: { id: categoryId },
      query: params,
    });
  }
}

// User API service class
export class UserApiService {
  
  /**
   * Get user profile
   */
  async getProfile(): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.USER.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.USER.PROFILE, {
      body: data,
    });
  }

  /**
   * Get user orders
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    sortKey?: string;
  } = {}): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.USER.ORDERS, {
      query: {
        page: params.page || 1,
        limit: params.limit || 10,
        sortOrder: params.sortOrder || 'desc',
        sortKey: params.sortKey || 'createdAt',
      },
    });
  }

  /**
   * Get user wishlist
   */
  async getWishlist(): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.USER.WISHLIST);
  }



  /**
   * Get user addresses
   */
  async getAddresses(): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.USER.ADDRESSES);
  }

  /**
   * Add new address
   */
  async addAddress(address: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.USER.ADDRESSES, {
      body: address,
    });
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, address: any): Promise<ApiResponse<any>> {
    return apiClient.put(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`, {
      body: address,
    });
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`${API_ENDPOINTS.USER.ADDRESSES}/${addressId}`);
  }
}

// Create and export service instances
export const productApi = new ProductApiService();
export const categoryApi = new CategoryApiService();
export const userApi = new UserApiService();
