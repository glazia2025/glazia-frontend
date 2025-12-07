'use client';

import { useCallback } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { profileApi, ProfileListParams, ProfileSearchParams, ProfileProduct, ProfileOptions } from '../services';

/**
 * Hook for Profile API operations
 * Based on your ProfileOptions MongoDB schema
 */
export const useProfileApi = () => {
  
  // Get all profile options
  const useProfileOptions = (immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfileOptions(),
      { immediate }
    );
  };

  // Get profile categories
  const useProfileCategories = (immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfileCategories(),
      { immediate }
    );
  };

  // Get products for a category
  const useCategoryProducts = (
    category: string,
    params: Omit<ProfileListParams, 'category'> = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => profileApi.getCategoryProducts(category, params),
      { immediate }
    );
  };

  // Get paginated category products
  const usePaginatedCategoryProducts = (
    category: string,
    params: Omit<ProfileListParams, 'category'> = {},
    immediate: boolean = false
  ) => {
    return usePaginatedApi(
      (page, limit) => profileApi.getCategoryProducts(category, { ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get category rates
  const useCategoryRates = (category: string, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getCategoryRates(category),
      { immediate }
    );
  };

  // Get single profile product
  const useProfileProduct = (id: number, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfileProductById(id),
      { immediate }
    );
  };

  // Search profiles
  const useProfileSearch = () => {
    return useMutation<ProfileProduct[], ProfileSearchParams>(
      (params) => profileApi.searchProfiles(params)
    );
  };

  // Get profile filters
  const useProfileFilters = (category?: string, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfileFilters(category),
      { immediate }
    );
  };

  // Get products by category and option
  const useProductsByCategoryAndOption = (
    category: string,
    option: string,
    params: ProfileListParams = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => profileApi.getProductsByCategoryAndOption(category, option, params),
      { immediate }
    );
  };

  // Get category details
  const useCategoryDetails = (category: string, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getCategoryDetails(category),
      { immediate }
    );
  };

  // Check if category is enabled
  const useCategoryEnabled = (category: string, immediate: boolean = false) => {
    return useApi(
      () => profileApi.isCategoryEnabled(category),
      { immediate }
    );
  };

  // Get profiles with pagination
  const useProfilesWithPagination = (params: ProfileListParams, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfilesWithPagination(params),
      { immediate }
    );
  };

  // Get featured profiles
  const useFeaturedProfiles = (limit?: number, immediate: boolean = false) => {
    return useApi(
      () => profileApi.getFeaturedProfiles(limit),
      { immediate }
    );
  };

  // Get profiles by specifications
  const useProfilesBySpecs = () => {
    return useMutation<ProfileProduct[], {
      degree?: string;
      per?: string;
      minKgm?: number;
      maxKgm?: number;
      length?: string;
    }>(
      (specs) => profileApi.getProfilesBySpecs(specs)
    );
  };

  // Get profile statistics
  const useProfileStats = (immediate: boolean = false) => {
    return useApi(
      () => profileApi.getProfileStats(),
      { immediate }
    );
  };

  // Export profiles
  const useExportProfiles = () => {
    return useMutation<any, {
      format: 'csv' | 'excel' | 'json';
      params?: ProfileListParams;
    }>(
      ({ format, params = {} }) => profileApi.exportProfiles(format, params)
    );
  };

  return {
    useProfileOptions,
    useProfileCategories,
    useCategoryProducts,
    usePaginatedCategoryProducts,
    useCategoryRates,
    useProfileProduct,
    useProfileSearch,
    useProfileFilters,
    useProductsByCategoryAndOption,
    useCategoryDetails,
    useCategoryEnabled,
    useProfilesWithPagination,
    useFeaturedProfiles,
    useProfilesBySpecs,
    useProfileStats,
    useExportProfiles,
  };
};

/**
 * Combined hook for easy access to all profile operations
 */
export const useProfilesData = () => {
  // New method to load profile data using the new API structure
  const loadProfileOptions = useCallback(async () => {
    try {
      console.log('🚀 Making API call to get profile categories...');
      console.log('🔑 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');

      // Step 1: Get categories list
      const categoriesResponse = await profileApi.getProfileCategories();
      console.log('📦 Categories response:', categoriesResponse);
      console.log('📦 Categories response type:', typeof categoriesResponse);
      console.log('📦 Categories response data:', categoriesResponse?.data);

      if (!categoriesResponse || !categoriesResponse.data || !Array.isArray(categoriesResponse.data)) {
        console.error('❌ Invalid categories response format:', categoriesResponse);
        throw new Error('Invalid categories response format');
      }

      const categories = categoriesResponse.data;
      console.log('📋 Found categories:', categories);

      // Step 2: Get full data for each category
      const categoriesData: Record<string, any> = {};

      for (const category of categories) {
        try {
          console.log(`🔄 Loading full data for category: ${category.name} (ID: ${category._id})`);
          const fullDataResponse = await profileApi.getCategoryFullData(category._id);
          console.log(`📦 Full data for ${category.name}:`, fullDataResponse);
          console.log(`📊 Full data response type:`, typeof fullDataResponse);
          console.log(`📊 Full data response.data:`, fullDataResponse?.data);

          if (fullDataResponse && fullDataResponse.data && fullDataResponse.data.sizes) {
            const responseData = fullDataResponse.data;
            // Transform the new API structure to match UI expectations
            const transformedData: any = {
              options: responseData.sizes.map((sizeData: any) => sizeData.size.label),
              products: {} as Record<string, any[]>
            };

            // Group products by size label
            responseData.sizes.forEach((sizeData: any) => {
              const sizeLabel = sizeData.size.label;
              transformedData.products[sizeLabel] = sizeData.products || [];
            });

            categoriesData[category.name] = transformedData;
            console.log(`✅ Transformed data for ${category.name}:`, transformedData);
          }
        } catch (categoryError) {
          console.error(`❌ Error loading data for category ${category.name}:`, categoryError);
          // Continue with other categories even if one fails
        }
      }

      console.log('🏗️ Final categories data structure:', categoriesData);

      return {
        categories: categoriesData
      };

    } catch (error) {
      console.error('💥 Error loading profile options:', error);
      const errorObj = error as { message?: string; status?: number; response?: unknown };
      console.error('💥 Error details:', {
        message: errorObj?.message,
        status: errorObj?.status,
        response: errorObj?.response
      });

      // If it's an auth error, return mock data for now
      if (errorObj?.message?.includes('Access denied') || errorObj?.status === 403) {
        console.log('🔄 Auth error detected, returning mock data for development...');
        return {
          categories: {
            "Casement": {
              options: ["Standard", "Premium"],
              rate: { "Standard": "150", "Premium": "200" },
              enabled: { "Standard": true, "Premium": true },
              catEnabled: true,
              products: {
                "Standard": [
                  {
                    id: 1,
                    sapCode: "SAP001",
                    part: "Casement Frame",
                    degree: "90°",
                    description: "Standard casement window frame",
                    per: "Meter",
                    kgm: 2.5,
                    length: "6000mm",
                    isEnabled: true
                  }
                ],
                "Premium": [
                  {
                    id: 2,
                    sapCode: "SAP002",
                    part: "Premium Casement Frame",
                    degree: "90°",
                    description: "Premium casement window frame",
                    per: "Meter",
                    kgm: 3.0,
                    length: "6000mm",
                    isEnabled: true
                  }
                ]
              }
            },
            "Sliding": {
              options: ["Basic", "Advanced"],
              rate: { "Basic": "120", "Advanced": "180" },
              enabled: { "Basic": true, "Advanced": true },
              catEnabled: true,
              products: {
                "Basic": [
                  {
                    id: 3,
                    sapCode: "SAP003",
                    part: "Sliding Frame",
                    degree: "0°",
                    description: "Basic sliding window frame",
                    per: "Meter",
                    kgm: 2.2,
                    length: "6000mm",
                    isEnabled: true
                  }
                ]
              }
            }
          }
        };
      }

      throw error;
    }
  }, []);

  const loadProfileCategories = useCallback(async () => {
    try {
      const response = await profileApi.getProfileCategories();
      return response.data;
    } catch (error) {
      console.error('Error loading profile categories:', error);
      throw error;
    }
  }, []);

  const loadCategoryProducts = useCallback(async (category: string, params: Omit<ProfileListParams, 'category'> = {}) => {
    try {
      const response = await profileApi.getCategoryProducts(category, params);
      return response.data;
    } catch (error) {
      console.error('Error loading category products:', error);
      throw error;
    }
  }, []);

  const searchProfiles = useCallback(async (params: ProfileSearchParams) => {
    try {
      const response = await profileApi.searchProfiles(params);
      return response.data;
    } catch (error) {
      console.error('Error searching profiles:', error);
      throw error;
    }
  }, []);

  const loadFeaturedProfiles = useCallback(async (limit?: number) => {
    try {
      const response = await profileApi.getFeaturedProfiles(limit);
      return response.data;
    } catch (error) {
      console.error('Error loading featured profiles:', error);
      throw error;
    }
  }, []);

  return {
    // Quick access methods
    loadProfileOptions,
    loadProfileCategories,
    loadCategoryProducts,
    searchProfiles,
    loadFeaturedProfiles,
  };
};

/**
 * Hook for real-time profile data with automatic refresh
 */
export const useRealTimeProfiles = (
  category: string,
  params: ProfileListParams = {},
  refreshInterval: number = 30000 // 30 seconds
) => {
  const { useCategoryProducts } = useProfileApi();
  
  const {
    data,
    loading,
    error,
    success,
    execute,
    reset
  } = useCategoryProducts(category, params, true);

  // Set up automatic refresh
  const startAutoRefresh = useCallback(() => {
    const interval = setInterval(() => {
      if (!loading) {
        execute();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [execute, loading, refreshInterval]);

  return {
    data,
    loading,
    error,
    success,
    execute,
    reset,
    startAutoRefresh,
  };
};
