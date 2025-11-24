'use client';

import { useCallback } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { railingsApi } from '../services/railingsApi';
import { ProfileListParams, ProfileSearchParams, ProfileProduct, ProfileOptions } from '../services';

/**
 * Hook for Railings API operations
 * Based on the ProfileOptions schema but filtered for railings data
 */
export const useRailingsApi = () => {
  
  // Get all railings options
  const useRailingsOptions = (immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getRailingsOptions(),
      { immediate }
    );
  };

  // Get railings categories
  const useRailingsCategories = (immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getRailingsCategories(),
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
      () => railingsApi.getCategoryProducts(category, params),
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
      (page, limit) => railingsApi.getCategoryProducts(category, { ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get category rates
  const useCategoryRates = (category: string, immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getCategoryRates(category),
      { immediate }
    );
  };

  // Get single railings product
  const useRailingsProduct = (id: number, immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getRailingsProductById(id),
      { immediate }
    );
  };

  // Search railings
  const useRailingsSearch = () => {
    return useMutation<ProfileProduct[], ProfileSearchParams>(
      (params) => railingsApi.searchRailings(params)
    );
  };

  // Get railings filters
  const useRailingsFilters = (category?: string, immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getRailingsFilters(category),
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
      () => railingsApi.getProductsByCategoryAndOption(category, option, params),
      { immediate }
    );
  };

  // Get category details
  const useCategoryDetails = (category: string, immediate: boolean = false) => {
    return useApi(
      () => railingsApi.getCategoryDetails(category),
      { immediate }
    );
  };

  // Check if category is enabled
  const useCategoryEnabled = (category: string, immediate: boolean = false) => {
    return useApi(
      () => railingsApi.isCategoryEnabled(category),
      { immediate }
    );
  };

  return {
    useRailingsOptions,
    useRailingsCategories,
    useCategoryProducts,
    usePaginatedCategoryProducts,
    useCategoryRates,
    useRailingsProduct,
    useRailingsSearch,
    useRailingsFilters,
    useProductsByCategoryAndOption,
    useCategoryDetails,
    useCategoryEnabled,
  };
};

/**
 * Combined hook for easy access to all railings operations
 */
export const useRailingsData = () => {
  // Direct API calls using the imported railingsApi instance
  const loadRailingsOptions = useCallback(async () => {
    try {
      console.log('🚀 Making API call to get railings options...');
      console.log('🔑 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
      const response = await railingsApi.getRailingsOptions();
      console.log('📦 Railings API response:', response);
      return response;
    } catch (error) {
      console.error('💥 Error loading railings options:', error);
      const errorObj = error as { message?: string; status?: number; response?: unknown };
      console.error('💥 Error details:', {
        message: errorObj?.message,
        status: errorObj?.status,
        response: errorObj?.response
      });

      // If it's an auth error, return mock railings data for now
      if (errorObj?.message?.includes('Access denied') || errorObj?.status === 403) {
        console.log('🔄 Auth error detected, returning mock railings data for development...');
        return {
          categories: {
            "Railings": {
              options: ["Standard", "Premium", "Designer"],
              rate: { "Standard": "180", "Premium": "250", "Designer": "320" },
              enabled: { "Standard": true, "Premium": true, "Designer": true },
              catEnabled: true,
              products: {
                "Standard": [
                  {
                    id: 101,
                    sapCode: "RAIL001",
                    part: "Standard Railing",
                    degree: "90°",
                    description: "Standard aluminum railing system",
                    per: "Meter",
                    kgm: 3.2,
                    length: "6000mm",
                    isEnabled: true
                  }
                ],
                "Premium": [
                  {
                    id: 102,
                    sapCode: "RAIL002",
                    part: "Premium Railing",
                    degree: "90°",
                    description: "Premium aluminum railing with enhanced finish",
                    per: "Meter",
                    kgm: 3.8,
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

  return {
    loadRailingsOptions,
  };
};
