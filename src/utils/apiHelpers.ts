/**
 * API Helper utilities for common operations
 */

import { Product, Category, CartItem } from '../contexts/AppContext';
import { ProductListParams, ProductSearchParams } from '../services';

// URL parameter builders
export const buildProductUrl = (params: ProductListParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
};

export const buildSearchUrl = (params: ProductSearchParams): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'filters' && typeof value === 'object') {
        searchParams.append(key, JSON.stringify(value));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// Data transformation helpers
export const transformProductData = (apiProduct: any): Product => {
  return {
    id: apiProduct.id || apiProduct._id,
    name: apiProduct.name || apiProduct.title,
    description: apiProduct.description || '',
    price: parseFloat(apiProduct.price) || 0,
    originalPrice: parseFloat(apiProduct.originalPrice || apiProduct.price) || 0,
    category: apiProduct.category || 'uncategorized',
    brand: apiProduct.brand || 'Glazia',
    image: apiProduct.image || apiProduct.images?.[0] || '/placeholder-product.jpg',
    images: apiProduct.images || [apiProduct.image] || ['/placeholder-product.jpg'],
    inStock: apiProduct.inStock !== false,
    stockQuantity: parseInt(apiProduct.stockQuantity) || 0,
    rating: parseFloat(apiProduct.rating) || 0,
    reviewCount: parseInt(apiProduct.reviewCount) || 0,
    featured: apiProduct.featured === true,
    specifications: apiProduct.specifications || {},
    features: apiProduct.features || [],
    tags: apiProduct.tags || [],
    sku: apiProduct.sku || '',
    weight: parseFloat(apiProduct.weight) || 0,
    dimensions: apiProduct.dimensions || {},
    createdAt: apiProduct.createdAt || new Date().toISOString(),
    updatedAt: apiProduct.updatedAt || new Date().toISOString(),
  };
};

export const transformCategoryData = (apiCategory: any): Category => {
  return {
    id: apiCategory.id || apiCategory._id,
    name: apiCategory.name,
    slug: apiCategory.slug || apiCategory.name.toLowerCase().replace(/\s+/g, '-'),
    description: apiCategory.description || '',
    image: apiCategory.image || '/placeholder-category.jpg',
    productCount: parseInt(apiCategory.productCount) || 0,
    featured: apiCategory.featured === true,
    parentId: apiCategory.parentId || null,
    order: parseInt(apiCategory.order) || 0,
    createdAt: apiCategory.createdAt || new Date().toISOString(),
    updatedAt: apiCategory.updatedAt || new Date().toISOString(),
  };
};

export const transformCartItemData = (apiCartItem: any): CartItem => {
  return {
    id: apiCartItem.id || apiCartItem._id,
    productId: apiCartItem.productId || apiCartItem.product?.id,
    product: apiCartItem.product ? transformProductData(apiCartItem.product) : undefined,
    quantity: parseInt(apiCartItem.quantity) || 1,
    price: parseFloat(apiCartItem.price) || 0,
    totalPrice: parseFloat(apiCartItem.totalPrice) || (parseFloat(apiCartItem.price) * parseInt(apiCartItem.quantity)),
    addedAt: apiCartItem.addedAt || new Date().toISOString(),
  };
};

// Error handling helpers
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('Network Error') ||
    error?.message?.includes('fetch') ||
    !navigator.onLine
  );
};

export const isAuthError = (error: any): boolean => {
  return (
    error?.status === 401 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('token')
  );
};

// Cache key generators
export const generateCacheKey = (prefix: string, params: Record<string, any> = {}): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);
  
  const paramString = JSON.stringify(sortedParams);
  return `${prefix}:${btoa(paramString)}`;
};

export const generateProductCacheKey = (params: ProductListParams): string => {
  return generateCacheKey('products', params);
};

export const generateCategoryCacheKey = (categoryId?: string): string => {
  return generateCacheKey('categories', { categoryId });
};

// Pagination helpers
export const calculatePagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    startIndex,
    endIndex,
    showing: `${startIndex + 1}-${endIndex} of ${total}`,
  };
};

// Sort and filter helpers
export const sortProducts = (products: Product[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Product[] => {
  return [...products].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const filterProducts = (products: Product[], filters: Record<string, any>): Product[] => {
  return products.filter(product => {
    // Price range filter
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    // Category filter
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // Brand filter
    if (filters.brand && product.brand !== filters.brand) {
      return false;
    }
    
    // In stock filter
    if (filters.inStock === true && !product.inStock) {
      return false;
    }
    
    // Featured filter
    if (filters.featured === true && !product.featured) {
      return false;
    }
    
    // Search query filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    return true;
  });
};

// Format helpers
export const formatPrice = (price: number, currency: string = '₹'): string => {
  return `${currency}${price.toLocaleString('en-IN')}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateMobileNumber = (mobile: string): boolean => {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
};

export const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

export const validateGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};
