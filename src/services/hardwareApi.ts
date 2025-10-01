import { 
  apiClient, 
  API_ENDPOINTS, 
  ApiResponse, 
  HardwareOptions, 
  HardwareProduct,
  HardwareListParams, 
  HardwareSearchParams 
} from './api';

/**
 * Hardware API service class for Hardware Products
 * Based on your HardwareOptions MongoDB schema
 */
export class HardwareApiService {
  
  /**
   * Get all hardware options
   */
  async getHardwareOptions(): Promise<ApiResponse<HardwareOptions>> {
    return apiClient.get<HardwareOptions>(API_ENDPOINTS.HARDWARE.OPTIONS);
  }

  /**
   * Get all hardware products
   */
  async getHardwareProducts(params: HardwareListParams = {}): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>(API_ENDPOINTS.HARDWARE.PRODUCTS, {
      query: params,
    });
  }

  /**
   * Get hardware products by subcategory
   */
  async getProductsBySubCategory(
    subCategory: string,
    params: Omit<HardwareListParams, 'subCategory'> = {}
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>(API_ENDPOINTS.HARDWARE.BY_SUBCATEGORY, {
      params: { subCategory },
      query: params,
    });
  }

  /**
   * Get single hardware product by ID
   */
  async getHardwareProductById(id: number): Promise<ApiResponse<HardwareProduct>> {
    return apiClient.get<HardwareProduct>(API_ENDPOINTS.HARDWARE.PRODUCT_DETAIL, {
      params: { id: id.toString() },
    });
  }

  /**
   * Search hardware products
   */
  async searchHardware(params: HardwareSearchParams): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>(API_ENDPOINTS.HARDWARE.SEARCH, {
      query: params,
    });
  }

  /**
   * Get available hardware filters
   */
  async getHardwareFilters(subCategory?: string): Promise<ApiResponse<{
    subCategories: string[];
    systems: string[];
    moqOptions: string[];
    rateRange: { min: number; max: number };
    options: string[];
  }>> {
    const query = subCategory ? { subCategory } : {};
    return apiClient.get(API_ENDPOINTS.HARDWARE.FILTERS, {
      query,
    });
  }

  /**
   * Get hardware products by option
   */
  async getProductsByOption(
    option: string,
    params: HardwareListParams = {}
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>(API_ENDPOINTS.HARDWARE.PRODUCTS, {
      query: { ...params, option },
    });
  }

  /**
   * Get all available subcategories
   */
  async getSubCategories(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/hardware/subcategories');
  }

  /**
   * Get all available options
   */
  async getHardwareOptionsList(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/hardware/options-list');
  }

  /**
   * Get hardware products with pagination
   */
  async getHardwareWithPagination(params: HardwareListParams): Promise<ApiResponse<{
    products: HardwareProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters: {
      subCategories: string[];
      options: string[];
      systems: string[];
    };
  }>> {
    return apiClient.get('/hardware/paginated', {
      query: params,
    });
  }

  /**
   * Get hardware products by rate range
   */
  async getProductsByRateRange(
    minRate: number,
    maxRate: number,
    params: HardwareListParams = {}
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>(API_ENDPOINTS.HARDWARE.PRODUCTS, {
      query: { ...params, minRate, maxRate },
    });
  }

  /**
   * Get hardware products by system
   */
  async getProductsBySystem(
    system: string,
    params: HardwareListParams = {}
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>('/hardware/by-system', {
      query: { ...params, system },
    });
  }

  /**
   * Get hardware products by MOQ
   */
  async getProductsByMOQ(
    moq: string,
    params: HardwareListParams = {}
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>('/hardware/by-moq', {
      query: { ...params, moq },
    });
  }

  /**
   * Get featured hardware products
   */
  async getFeaturedHardware(limit?: number): Promise<ApiResponse<HardwareProduct[]>> {
    const query = limit ? { limit, featured: true } : { featured: true };
    return apiClient.get<HardwareProduct[]>('/hardware/featured', {
      query,
    });
  }

  /**
   * Get hardware statistics
   */
  async getHardwareStats(): Promise<ApiResponse<{
    totalProducts: number;
    totalSubCategories: number;
    totalOptions: number;
    averageRate: number;
    mostCommonSystem: string;
    mostCommonMOQ: string;
    rateDistribution: Record<string, number>;
  }>> {
    return apiClient.get('/hardware/stats');
  }

  /**
   * Get hardware products by specifications
   */
  async getHardwareBySpecs(specs: {
    system?: string;
    minRate?: number;
    maxRate?: number;
    moq?: string;
    subCategory?: string;
  }): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>('/hardware/by-specs', {
      query: specs,
    });
  }

  /**
   * Compare hardware products
   */
  async compareHardware(productIds: number[]): Promise<ApiResponse<{
    products: HardwareProduct[];
    comparison: {
      rateComparison: Record<string, number>;
      systemComparison: Record<string, string>;
      moqComparison: Record<string, string>;
    };
  }>> {
    return apiClient.post('/hardware/compare', {
      body: { productIds },
    });
  }

  /**
   * Get recommended hardware products
   */
  async getRecommendedHardware(
    baseProductId: number,
    limit: number = 5
  ): Promise<ApiResponse<HardwareProduct[]>> {
    return apiClient.get<HardwareProduct[]>('/hardware/recommendations', {
      query: { baseProductId, limit },
    });
  }

  /**
   * Bulk update hardware products (admin function)
   */
  async bulkUpdateHardware(updates: Array<{
    id: number;
    updates: Partial<HardwareProduct>;
  }>): Promise<ApiResponse<{ updated: number; failed: number }>> {
    return apiClient.put('/hardware/bulk-update', {
      body: { updates },
    });
  }

  /**
   * Export hardware data
   */
  async exportHardware(
    format: 'csv' | 'excel' | 'json',
    params: HardwareListParams = {}
  ): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    return apiClient.get('/hardware/export', {
      query: { ...params, format },
    });
  }

  /**
   * Get hardware price quotes
   */
  async getHardwareQuote(productIds: number[], quantities: number[]): Promise<ApiResponse<{
    products: Array<{
      product: HardwareProduct;
      quantity: number;
      totalRate: number;
      moqMet: boolean;
    }>;
    totalQuote: number;
    validUntil: string;
  }>> {
    return apiClient.post('/hardware/quote', {
      body: { productIds, quantities },
    });
  }
}

// Create and export service instance
export const hardwareApi = new HardwareApiService();
