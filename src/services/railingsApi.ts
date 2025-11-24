import { 
  apiClient, 
  API_ENDPOINTS, 
  ApiResponse, 
  ProfileOptions, 
  ProfileProduct, 
  ProfileCategory,
  ProfileListParams, 
  ProfileSearchParams 
} from './api';

/**
 * Railings API service class for Railings Products
 * Uses the same structure as profiles but filters for railings-specific data
 */
export class RailingsApiService {
  
  /**
   * Get all railings options with categories
   * Filters the profile data to show only railings-related categories
   */
  async getRailingsOptions(): Promise<ApiResponse<ProfileOptions>> {
    const response = await apiClient.get<ProfileOptions>(API_ENDPOINTS.RAILINGS.OPTIONS);
    
    // Filter the response to include only railings-related categories
    if (response.data && response.data.categories) {
      const railingsCategories: Record<string, ProfileCategory> = {};
      
      // Define which categories are railings-related
      const railingsCategoryNames = ['Railings', 'Balcony', 'Staircase', 'Handrail', 'Balustrade', 'Railing System'];
      
      Object.entries(response.data.categories).forEach(([categoryName, categoryData]) => {
        // Check if category name contains railings-related keywords
        const isRailingsCategory = railingsCategoryNames.some(railingName => 
          categoryName.toLowerCase().includes(railingName.toLowerCase()) ||
          railingName.toLowerCase().includes(categoryName.toLowerCase())
        );
        
        if (isRailingsCategory) {
          railingsCategories[categoryName] = categoryData;
        }
      });
      
      return {
        ...response,
        data: {
          categories: railingsCategories
        }
      };
    }
    
    return response;
  }

  /**
   * Get all available railings categories
   */
  async getRailingsCategories(): Promise<ApiResponse<string[]>> {
    const response = await this.getRailingsOptions();
    const categories = response.data?.categories ? Object.keys(response.data.categories) : [];
    
    return {
      success: true,
      data: categories,
      message: 'Railings categories retrieved successfully'
    };
  }

  /**
   * Get products for a specific railings category
   */
  async getCategoryProducts(
    category: string,
    params: Omit<ProfileListParams, 'category'> = {}
  ): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.RAILINGS.CATEGORY_PRODUCTS, {
      params: { category },
      query: params,
    });
  }

  /**
   * Get rates for a specific railings category
   */
  async getCategoryRates(category: string): Promise<ApiResponse<{
    rates: Record<string, string>;
    enabled: Record<string, boolean>;
    options: string[];
  }>> {
    return apiClient.get(API_ENDPOINTS.RAILINGS.CATEGORY_RATES, {
      params: { category },
    });
  }

  /**
   * Get single railings product by ID
   */
  async getRailingsProductById(id: number): Promise<ApiResponse<ProfileProduct>> {
    return apiClient.get<ProfileProduct>(API_ENDPOINTS.RAILINGS.PRODUCT_DETAIL, {
      params: { id: id.toString() },
    });
  }

  /**
   * Search railings products
   */
  async searchRailings(params: ProfileSearchParams): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.RAILINGS.SEARCH, {
      query: params,
    });
  }

  /**
   * Get railings filters for category
   */
  async getRailingsFilters(category?: string): Promise<ApiResponse<{
    degrees: string[];
    units: string[];
    kgmRange: { min: number; max: number };
    lengths: string[];
  }>> {
    return apiClient.get(API_ENDPOINTS.RAILINGS.FILTERS, {
      query: category ? { category } : {},
    });
  }

  /**
   * Get products by category and option for railings
   */
  async getProductsByCategoryAndOption(
    category: string,
    option: string,
    params: ProfileListParams = {}
  ): Promise<ApiResponse<ProfileProduct[]>> {
    return apiClient.get<ProfileProduct[]>(API_ENDPOINTS.RAILINGS.CATEGORY_PRODUCTS, {
      params: { category, option },
      query: params,
    });
  }

  /**
   * Get category details for railings
   */
  async getCategoryDetails(category: string): Promise<ApiResponse<ProfileCategory>> {
    const response = await this.getRailingsOptions();
    const categoryData = response.data?.categories?.[category];
    
    if (categoryData) {
      return {
        success: true,
        data: categoryData,
        message: 'Category details retrieved successfully'
      };
    }
    
    return {
      success: false,
      data: {} as ProfileCategory,
      error: 'Category not found'
    };
  }

  /**
   * Check if railings category is enabled
   */
  async isCategoryEnabled(category: string): Promise<ApiResponse<boolean>> {
    const response = await this.getCategoryDetails(category);
    return {
      success: true,
      data: response.data?.catEnabled || false,
      message: 'Category status retrieved successfully'
    };
  }
}

// Create and export railings API instance
export const railingsApi = new RailingsApiService();
