import { useState, useEffect, useCallback } from 'react';
import { ApiResponse, ApiError, handleApiResponse, retryApiRequest } from '../services';

// Generic API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// API hook options
interface UseApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const {
    immediate = false,
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await retryApiRequest(apiCall, retries, retryDelay);
      const data = handleApiResponse<T>(response);
      
      setState({
        data,
        loading: false,
        error: null,
        success: true,
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });

      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, retries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const {
    retries = 1, // Fewer retries for mutations
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null, success: false }));

    try {
      const response = await retryApiRequest(() => apiCall(params), retries, retryDelay);
      const data = handleApiResponse<T>(response);
      
      setState({
        data,
        loading: false,
        error: null,
        success: true,
      });

      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });

      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, retries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// Paginated API hook
interface PaginatedApiState<T> extends ApiState<T[]> {
  page: number;
  totalPages: number;
  total: number;
  hasMore: boolean;
}

interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  pageSize?: number;
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  options: UsePaginatedApiOptions = {}
) {
  const {
    immediate = false,
    initialPage = 1,
    pageSize = 10,
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<PaginatedApiState<T>>({
    data: [],
    loading: false,
    error: null,
    success: false,
    page: initialPage,
    totalPages: 0,
    total: 0,
    hasMore: false,
  });

  const fetchPage = useCallback(async (page: number, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await retryApiRequest(() => apiCall(page, pageSize), retries, retryDelay);
      const data = handleApiResponse<T[]>(response);
      
      setState(prev => ({
        ...prev,
        data: append ? [...(prev.data || []), ...data] : data,
        loading: false,
        error: null,
        success: true,
        page,
        totalPages: response.pagination?.totalPages || 0,
        total: response.pagination?.total || 0,
        hasMore: page < (response.pagination?.totalPages || 0),
      }));

      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
      }));

      onError?.(errorMessage);
      throw error;
    }
  }, [apiCall, pageSize, retries, retryDelay, onSuccess, onError]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      return fetchPage(state.page + 1, true);
    }
  }, [state.hasMore, state.loading, state.page, fetchPage]);

  const refresh = useCallback(() => {
    return fetchPage(1, false);
  }, [fetchPage]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      success: false,
      page: initialPage,
      totalPages: 0,
      total: 0,
      hasMore: false,
    });
  }, [initialPage]);

  useEffect(() => {
    if (immediate) {
      fetchPage(initialPage);
    }
  }, [immediate, initialPage, fetchPage]);

  return {
    ...state,
    fetchPage,
    loadMore,
    refresh,
    reset,
  };
}
