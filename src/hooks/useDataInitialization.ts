'use client';

import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DataService } from '@/services/dataService';

/**
 * Custom hook to initialize application data on app startup
 * This hook loads products, user data, orders, and other initial data
 */
export const useDataInitialization = () => {
  const {
    state,
    setProducts,
    setFeaturedProducts,
    setCategories,
    setLoadingProducts,
    setUser,
    setOrders,
    setLoadingUser,
    setLoadingOrders,
    setAuthentication
  } = useApp();

  // Initialize products data
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        
        // Load all products
        const products = await DataService.getProducts();
        setProducts(products);
        
        // Load featured products
        const featuredProducts = await DataService.getFeaturedProducts();
        setFeaturedProducts(featuredProducts);
        
        // Load categories
        const categories = await DataService.getCategories();
        setCategories(categories);
        
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    // Only load products if not already loaded
    if (state.products.length === 0) {
      loadProducts();
    }
  }, [state.products.length, setProducts, setFeaturedProducts, setCategories, setLoadingProducts]);

  // Initialize user data if authenticated
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoadingUser(true);
        
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthentication(true);
          
          // Load user data
          const userData = await DataService.getUserData();
          if (userData) {
            setUser(userData);
          }
          
          // Load user orders
          setLoadingOrders(true);
          const orders = await DataService.getUserOrders();
          setOrders(orders);
          setLoadingOrders(false);
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoadingOrders(false);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserData();
  }, [setUser, setOrders, setLoadingUser, setLoadingOrders, setAuthentication]);

  return {
    isProductsLoaded: state.products.length > 0,
    isUserLoaded: !state.loading.user,
    isOrdersLoaded: !state.loading.orders,
    isInitialized: state.products.length > 0 && !state.loading.user
  };
};

/**
 * Hook to refresh specific data sections
 */
export const useDataRefresh = () => {
  const {
    setProducts,
    setFeaturedProducts,
    setUser,
    setOrders,
    setLoadingProducts,
    setLoadingUser,
    setLoadingOrders
  } = useApp();

  const refreshProducts = async () => {
    try {
      setLoadingProducts(true);
      const products = await DataService.getProducts();
      setProducts(products);
      
      const featuredProducts = await DataService.getFeaturedProducts();
      setFeaturedProducts(featuredProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const refreshUserData = async () => {
    try {
      setLoadingUser(true);
      const userData = await DataService.getUserData();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setLoadingUser(false);
    }
  };

  const refreshOrders = async () => {
    try {
      setLoadingOrders(true);
      const orders = await DataService.getUserOrders();
      setOrders(orders);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  return {
    refreshProducts,
    refreshUserData,
    refreshOrders
  };
};
