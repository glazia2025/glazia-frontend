'use client';

import { useCallback } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { hardwareApi, HardwareListParams, HardwareSearchParams, HardwareProduct, HardwareOptions } from '../services';

/**
 * Hook for Hardware API operations
 * Based on your HardwareOptions MongoDB schema
 */
export const useHardwareApi = () => {
  
  // Get all hardware options
  const useHardwareOptions = (immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareOptions(),
      { immediate }
    );
  };

  // Get all hardware products
  const useHardwareProducts = (params: HardwareListParams = {}, immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareProducts(params),
      { immediate }
    );
  };

  // Get paginated hardware products
  const usePaginatedHardwareProducts = (params: HardwareListParams = {}, immediate: boolean = false) => {
    return usePaginatedApi(
      (page, limit) => hardwareApi.getHardwareProducts({ ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get products by subcategory
  const useProductsBySubCategory = (
    subCategory: string,
    params: Omit<HardwareListParams, 'subCategory'> = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => hardwareApi.getProductsBySubCategory(subCategory, params),
      { immediate }
    );
  };

  // Get paginated products by subcategory
  const usePaginatedProductsBySubCategory = (
    subCategory: string,
    params: Omit<HardwareListParams, 'subCategory'> = {},
    immediate: boolean = false
  ) => {
    return usePaginatedApi(
      (page, limit) => hardwareApi.getProductsBySubCategory(subCategory, { ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get single hardware product
  const useHardwareProduct = (id: number, immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareProductById(id),
      { immediate }
    );
  };

  // Search hardware products
  const useHardwareSearch = () => {
    return useMutation<HardwareProduct[], HardwareSearchParams>(
      (params) => hardwareApi.searchHardware(params)
    );
  };

  // Get hardware filters
  const useHardwareFilters = (subCategory?: string, immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareFilters(subCategory),
      { immediate }
    );
  };

  // Get products by option
  const useProductsByOption = (
    option: string,
    params: HardwareListParams = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => hardwareApi.getProductsByOption(option, params),
      { immediate }
    );
  };

  // Get subcategories
  const useSubCategories = (immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getSubCategories(),
      { immediate }
    );
  };

  // Get hardware options list
  const useHardwareOptionsList = (immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareOptionsList(),
      { immediate }
    );
  };

  // Get hardware with pagination
  const useHardwareWithPagination = (params: HardwareListParams, immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareWithPagination(params),
      { immediate }
    );
  };

  // Get products by rate range
  const useProductsByRateRange = () => {
    return useMutation<HardwareProduct[], {
      minRate: number;
      maxRate: number;
      params?: HardwareListParams;
    }>(
      ({ minRate, maxRate, params = {} }) => hardwareApi.getProductsByRateRange(minRate, maxRate, params)
    );
  };

  // Get products by system
  const useProductsBySystem = (
    system: string,
    params: HardwareListParams = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => hardwareApi.getProductsBySystem(system, params),
      { immediate }
    );
  };

  // Get products by MOQ
  const useProductsByMOQ = (
    moq: string,
    params: HardwareListParams = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => hardwareApi.getProductsByMOQ(moq, params),
      { immediate }
    );
  };

  // Get featured hardware
  const useFeaturedHardware = (limit?: number, immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getFeaturedHardware(limit),
      { immediate }
    );
  };

  // Get hardware statistics
  const useHardwareStats = (immediate: boolean = false) => {
    return useApi(
      () => hardwareApi.getHardwareStats(),
      { immediate }
    );
  };

  // Get hardware by specifications
  const useHardwareBySpecs = () => {
    return useMutation<HardwareProduct[], {
      system?: string;
      minRate?: number;
      maxRate?: number;
      moq?: string;
      subCategory?: string;
    }>(
      (specs) => hardwareApi.getHardwareBySpecs(specs)
    );
  };

  // Compare hardware products
  const useCompareHardware = () => {
    return useMutation<any, { productIds: number[] }>(
      ({ productIds }) => hardwareApi.compareHardware(productIds)
    );
  };

  // Get recommended hardware
  const useRecommendedHardware = (
    baseProductId: number,
    limit: number = 5,
    immediate: boolean = false
  ) => {
    return useApi(
      () => hardwareApi.getRecommendedHardware(baseProductId, limit),
      { immediate }
    );
  };

  // Export hardware
  const useExportHardware = () => {
    return useMutation<any, {
      format: 'csv' | 'excel' | 'json';
      params?: HardwareListParams;
    }>(
      ({ format, params = {} }) => hardwareApi.exportHardware(format, params)
    );
  };

  // Get hardware quote
  const useHardwareQuote = () => {
    return useMutation<any, {
      productIds: number[];
      quantities: number[];
    }>(
      ({ productIds, quantities }) => hardwareApi.getHardwareQuote(productIds, quantities)
    );
  };

  return {
    useHardwareOptions,
    useHardwareProducts,
    usePaginatedHardwareProducts,
    useProductsBySubCategory,
    usePaginatedProductsBySubCategory,
    useHardwareProduct,
    useHardwareSearch,
    useHardwareFilters,
    useProductsByOption,
    useSubCategories,
    useHardwareOptionsList,
    useHardwareWithPagination,
    useProductsByRateRange,
    useProductsBySystem,
    useProductsByMOQ,
    useFeaturedHardware,
    useHardwareStats,
    useHardwareBySpecs,
    useCompareHardware,
    useRecommendedHardware,
    useExportHardware,
    useHardwareQuote,
  };
};

/**
 * Combined hook for easy access to all hardware operations
 */
export const useHardwareData = () => {
  // Quick access methods for common operations - directly call API service
  const loadHardwareOptions = useCallback(async () => {
    return hardwareApi.getHardwareOptions();
  }, []);

  const loadHardwareProducts = useCallback(async (params: HardwareListParams = {}) => {
    return hardwareApi.getHardwareProducts(params);
  }, []);

  const loadProductsBySubCategory = useCallback(async (subCategory: string, params: HardwareListParams = {}) => {
    return hardwareApi.getProductsBySubCategory(subCategory, params);
  }, []);

  const searchHardware = useCallback(async (params: HardwareSearchParams) => {
    return hardwareApi.searchHardware(params);
  }, []);

  const loadFeaturedHardware = useCallback(async (limit?: number) => {
    return hardwareApi.getFeaturedHardware(limit);
  }, []);

  const getHardwareBySpecs = useCallback(async (specs: any) => {
    return hardwareApi.getHardwareBySpecs(specs);
  }, []);

  const compareHardware = useCallback(async (productIds: number[]) => {
    return hardwareApi.compareHardware(productIds);
  }, []);

  const getHardwareQuote = useCallback(async (productIds: number[], quantities: number[]) => {
    return hardwareApi.getHardwareQuote(productIds, quantities);
  }, []);

  return {
    // Quick access methods
    loadHardwareOptions,
    loadHardwareProducts,
    loadProductsBySubCategory,
    searchHardware,
    loadFeaturedHardware,
    getHardwareBySpecs,
    compareHardware,
    getHardwareQuote,
  };
};

/**
 * Hook for real-time hardware data with automatic refresh
 */
export const useRealTimeHardware = (
  params: HardwareListParams = {},
  refreshInterval: number = 30000 // 30 seconds
) => {
  const { useHardwareProducts } = useHardwareApi();
  
  const {
    data,
    loading,
    error,
    success,
    execute,
    reset
  } = useHardwareProducts(params, true);

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
