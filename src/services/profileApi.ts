import { 
  apiClient, 
  API_BASE_URL,
  API_ENDPOINTS, 
  ApiResponse, 
  ProfileOptions, 
  ProfileProduct, 
  ProfileCategory,
  ProfileListParams, 
  ProfileSearchParams 
} from './api';

/**
 * Profile API service class for Aluminium Profiles
 * Based on your ProfileOptions MongoDB schema
 */
export class ProfileApiService {
  
  /**
   * Get all profile options with categories
   */
  async getProfileOptions(): Promise<ApiResponse<ProfileOptions>> {
    return apiClient.get<ProfileOptions>(API_ENDPOINTS.PROFILES.OPTIONS);
  }

  /**
   * Get all available profile categories (new API)
   */
  async getProfileCategories(): Promise<ApiResponse<Array<{ _id: string; name: string; [key: string]: any }>>> {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.PROFILES.CATEGORIES}`;
      const response = await fetch(url);
      const rawData = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Wrap raw response in ApiResponse format
      return {
        success: true,
        data: rawData
      };
    } catch (error) {
      console.error('Error fetching profile categories:', error);
      throw error;
    }
  }

  /**
   * Get full category data by ID (new API)
   */
  async getCategoryFullData(categoryId: string): Promise<ApiResponse<any>> {
    try {
      const endpoint = API_ENDPOINTS.PROFILES.CATEGORY_FULL.replace(':id', categoryId);
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url);
      const rawData = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Wrap raw response in ApiResponse format
      return {
        success: true,
        data: rawData
      };
    } catch (error) {
      console.error('Error fetching category full data:', error);
      throw error;
    }
  }

  /**
   * Get products for a specific category
   */
  async getCategoryProducts(
    category: string,
    params: Omit<ProfileListParams, 'category'> = {}
  ): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.PROFILES.CATEGORY_PRODUCTS, {
      params: { category },
      query: params,
    });
  }

  /**
   * Get rates for a specific category
   */
  async getCategoryRates(category: string): Promise<ApiResponse<{
    rates: Record<string, string>;
    enabled: Record<string, boolean>;
    options: string[];
  }>> {
    return apiClient.get(API_ENDPOINTS.PROFILES.CATEGORY_RATES, {
      params: { category },
    });
  }

  /**
   * Get single profile product by ID
   */
  async getProfileProductById(id: number): Promise<ApiResponse<ProfileProduct>> {
    return apiClient.get<ProfileProduct>(API_ENDPOINTS.PROFILES.PRODUCT_DETAIL, {
      params: { id: id.toString() },
    });
  }

  /**
   * Search profile products
   */
  async searchProfiles(params: ProfileSearchParams): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.PROFILES.SEARCH, {
      query: params,
    });
  }

  /**
   * Get available filters for profiles
   */
  async getProfileFilters(category?: string): Promise<ApiResponse<{
    categories: string[];
    degrees: string[];
    units: string[];
    lengths: string[];
    kgmRange: { min: number; max: number };
  }>> {
    const query = category ? { category } : {};
    return apiClient.get(API_ENDPOINTS.PROFILES.FILTERS, {
      query,
    });
  }

  /**
   * Get products by category and option
   */
  async getProductsByCategoryAndOption(
    category: string,
    option: string,
    params: ProfileListParams = {}
  ): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.PROFILES.CATEGORY_PRODUCTS, {
      params: { category },
      query: { ...params, option },
    });
  }

  /**
   * Get category details with all options and rates
   */
  async getCategoryDetails(category: string): Promise<ApiResponse<ProfileCategory>> {
    return apiClient.get<ProfileCategory>(`/profiles/categories/${category}/details`);
  }

  /**
   * Check if category is enabled
   */
  async isCategoryEnabled(category: string): Promise<ApiResponse<{ enabled: boolean }>> {
    return apiClient.get(`/profiles/categories/${category}/enabled`);
  }

  /**
   * Get products with pagination and filtering
   */
  async getProfilesWithPagination(params: ProfileListParams): Promise<ApiResponse<{
    products: ProfileProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      categories: string[];
      options: string[];
      degrees: string[];
    };
  }>> {
    return apiClient.get('/profiles/paginated', {
      query: params,
    });
  }

  /**
   * Get featured profile products
   */
  async getFeaturedProfiles(limit?: number): Promise<ApiResponse<ProfileProduct[]>> {
    const query = limit ? { limit, featured: true } : { featured: true };
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.PROFILES.CATEGORY_PRODUCTS.replace('/:category', ''), {
      query,
    });
  }

  /**
   * Get profile products by specifications
   */
  async getProfilesBySpecs(specs: {
    degree?: string;
    per?: string;
    minKgm?: number;
    maxKgm?: number;
    length?: string;
  }): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>('/profiles/by-specs', {
      query: specs,
    });
  }

  /**
   * Get profile statistics
   */
  async getProfileStats(): Promise<ApiResponse<{
    totalProducts: number;
    totalCategories: number;
    enabledCategories: number;
    averageKgm: number;
    mostCommonDegree: string;
    mostCommonUnit: string;
  }>> {
    return apiClient.get('/profiles/stats');
  }

  /**
   * Bulk update profile products (admin function)
   */
  async bulkUpdateProfiles(updates: Array<{
    id: number;
    updates: Partial<ProfileProduct>;
  }>): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return apiClient.put('/profiles/bulk-update', {
      body: { updates },
    });
  }

  /**
   * Export profile data
   */
  async exportProfiles(
    format: 'csv' | 'excel' | 'json',
    params: ProfileListParams = {}
  ): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    return apiClient.get('/profiles/export', {
      query: { ...params, format },
    });
  }
}

// Create and export service instance
export const profileApi = new ProfileApiService();
