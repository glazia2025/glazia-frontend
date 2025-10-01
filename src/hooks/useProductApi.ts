'use client';

import { useCallback } from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import { productApi, categoryApi, ProductListParams, ProductSearchParams } from '../services';
import { Product, Category } from '../contexts/AppContext';

/**
 * Hook for product API operations
 */
export const useProductApi = () => {
  
  // Get all products with filtering
  const useProducts = (params: ProductListParams = {}, immediate: boolean = false) => {
    return useApi(
      () => productApi.getProducts(params),
      { immediate }
    );
  };

  // Get paginated products
  const usePaginatedProducts = (params: ProductListParams = {}, immediate: boolean = false) => {
    return usePaginatedApi(
      (page, limit) => productApi.getProducts({ ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get single product
  const useProduct = (id: string, immediate: boolean = false) => {
    return useApi(
      () => productApi.getProductById(id),
      { immediate }
    );
  };

  // Search products
  const useProductSearch = () => {
    return useMutation<Product[], ProductSearchParams>(
      (params) => productApi.searchProducts(params)
    );
  };

  // Get featured products
  const useFeaturedProducts = (limit?: number, immediate: boolean = false) => {
    return useApi(
      () => productApi.getFeaturedProducts(limit),
      { immediate }
    );
  };

  // Get products by category
  const useProductsByCategory = (
    categoryId: string, 
    params: Omit<ProductListParams, 'category'> = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => productApi.getProductsByCategory(categoryId, params),
      { immediate }
    );
  };

  // Get paginated products by category
  const usePaginatedProductsByCategory = (
    categoryId: string,
    params: Omit<ProductListParams, 'category'> = {},
    immediate: boolean = false
  ) => {
    return usePaginatedApi(
      (page, limit) => productApi.getProductsByCategory(categoryId, { ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  // Get product filters
  const useProductFilters = (categoryId?: string, immediate: boolean = false) => {
    return useApi(
      () => productApi.getProductFilters(categoryId),
      { immediate }
    );
  };

  return {
    useProducts,
    usePaginatedProducts,
    useProduct,
    useProductSearch,
    useFeaturedProducts,
    useProductsByCategory,
    usePaginatedProductsByCategory,
    useProductFilters,
  };
};

/**
 * Hook for category API operations
 */
export const useCategoryApi = () => {
  
  // Get all categories
  const useCategories = (immediate: boolean = false) => {
    return useApi(
      () => categoryApi.getCategories(),
      { immediate }
    );
  };

  // Get single category
  const useCategory = (id: string, immediate: boolean = false) => {
    return useApi(
      () => categoryApi.getCategoryById(id),
      { immediate }
    );
  };

  // Get category products
  const useCategoryProducts = (
    categoryId: string,
    params: ProductListParams = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => categoryApi.getCategoryProducts(categoryId, params),
      { immediate }
    );
  };

  // Get paginated category products
  const usePaginatedCategoryProducts = (
    categoryId: string,
    params: ProductListParams = {},
    immediate: boolean = false
  ) => {
    return usePaginatedApi(
      (page, limit) => categoryApi.getCategoryProducts(categoryId, { ...params, page, limit }),
      { immediate, pageSize: params.limit || 12 }
    );
  };

  return {
    useCategories,
    useCategory,
    useCategoryProducts,
    usePaginatedCategoryProducts,
  };
};

/**
 * Combined hook for easy access to all product-related API operations
 */
export const useProductsData = () => {
  const productHooks = useProductApi();
  const categoryHooks = useCategoryApi();

  // Quick access methods for common operations
  const loadProducts = useCallback(async (params: ProductListParams = {}) => {
    const { execute } = productHooks.useProducts(params);
    return execute();
  }, [productHooks]);

  const loadFeaturedProducts = useCallback(async (limit?: number) => {
    const { execute } = productHooks.useFeaturedProducts(limit);
    return execute();
  }, [productHooks]);

  const loadCategories = useCallback(async () => {
    const { execute } = categoryHooks.useCategories();
    return execute();
  }, [categoryHooks]);

  const searchProducts = useCallback(async (params: ProductSearchParams) => {
    const { mutate } = productHooks.useProductSearch();
    return mutate(params);
  }, [productHooks]);

  return {
    ...productHooks,
    ...categoryHooks,
    // Quick access methods
    loadProducts,
    loadFeaturedProducts,
    loadCategories,
    searchProducts,
  };
};

/**
 * Hook for real-time product data with automatic refresh
 */
export const useRealTimeProducts = (
  params: ProductListParams = {},
  refreshInterval: number = 30000 // 30 seconds
) => {
  const { useProducts } = useProductApi();
  
  const {
    data,
    loading,
    error,
    success,
    execute,
    reset
  } = useProducts(params, true);

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
