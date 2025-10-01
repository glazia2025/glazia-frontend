'use client';

import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { cartApi, orderApi, checkoutApi } from '../services';
import { CartItem } from '../contexts/AppContext';
import { useApp } from '../contexts/AppContext';

/**
 * Hook for cart API operations
 */
export const useCartApi = () => {
  const { syncCartWithServer } = useApp();

  // Get cart data
  const useCart = (immediate: boolean = false) => {
    return useApi(
      () => cartApi.getCart(),
      { 
        immediate,
        onSuccess: (data) => {
          // Sync server cart with local state
          if (data && syncCartWithServer) {
            syncCartWithServer(data.items);
          }
        }
      }
    );
  };

  // Add item to cart
  const useAddToCart = () => {
    return useMutation<CartItem, { productId: string; quantity: number }>(
      ({ productId, quantity }) => cartApi.addToCart(productId, quantity),
      {
        onSuccess: (data) => {
          // Optionally sync with local state
          console.log('Item added to cart:', data);
        }
      }
    );
  };

  // Update cart item
  const useUpdateCartItem = () => {
    return useMutation<CartItem, { productId: string; quantity: number }>(
      ({ productId, quantity }) => cartApi.updateCartItem(productId, quantity)
    );
  };

  // Remove item from cart
  const useRemoveFromCart = () => {
    return useMutation<{ success: boolean }, { productId: string }>(
      ({ productId }) => cartApi.removeFromCart(productId)
    );
  };

  // Clear cart
  const useClearCart = () => {
    return useMutation<{ success: boolean }, void>(
      () => cartApi.clearCart()
    );
  };

  // Sync local cart with server
  const useSyncCart = () => {
    return useMutation<any, { items: CartItem[] }>(
      ({ items }) => cartApi.syncCart(items)
    );
  };

  return {
    useCart,
    useAddToCart,
    useUpdateCartItem,
    useRemoveFromCart,
    useClearCart,
    useSyncCart,
  };
};

/**
 * Hook for order API operations
 */
export const useOrderApi = () => {
  
  // Get user orders
  const useOrders = (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
      sortOrder?: 'asc' | 'desc';
    } = {},
    immediate: boolean = false
  ) => {
    return useApi(
      () => orderApi.getOrders(params),
      { immediate }
    );
  };

  // Get single order
  const useOrder = (orderId: string, immediate: boolean = false) => {
    return useApi(
      () => orderApi.getOrderById(orderId),
      { immediate }
    );
  };

  // Create new order
  const useCreateOrder = () => {
    return useMutation<any, {
      items: CartItem[];
      shippingAddress: any;
      billingAddress?: any;
      paymentMethod: string;
      notes?: string;
    }>(
      (orderData) => orderApi.createOrder(orderData)
    );
  };

  // Update order
  const useUpdateOrder = () => {
    return useMutation<any, { orderId: string; updateData: any }>(
      ({ orderId, updateData }) => orderApi.updateOrder(orderId, updateData)
    );
  };

  // Cancel order
  const useCancelOrder = () => {
    return useMutation<any, { orderId: string; reason?: string }>(
      ({ orderId, reason }) => orderApi.cancelOrder(orderId, reason)
    );
  };

  // Track order
  const useTrackOrder = (orderId: string, immediate: boolean = false) => {
    return useApi(
      () => orderApi.trackOrder(orderId),
      { immediate }
    );
  };

  // Get order invoice
  const useOrderInvoice = () => {
    return useMutation<any, { orderId: string }>(
      ({ orderId }) => orderApi.getOrderInvoice(orderId)
    );
  };

  // Request return
  const useRequestReturn = () => {
    return useMutation<any, {
      orderId: string;
      returnData: {
        items: Array<{
          productId: string;
          quantity: number;
          reason: string;
        }>;
        reason: string;
        description?: string;
      };
    }>(
      ({ orderId, returnData }) => orderApi.requestReturn(orderId, returnData)
    );
  };

  return {
    useOrders,
    useOrder,
    useCreateOrder,
    useUpdateOrder,
    useCancelOrder,
    useTrackOrder,
    useOrderInvoice,
    useRequestReturn,
  };
};

/**
 * Hook for checkout API operations
 */
export const useCheckoutApi = () => {
  
  // Calculate order totals
  const useCalculateTotals = () => {
    return useMutation<any, {
      items: CartItem[];
      shippingAddress?: any;
      couponCode?: string;
    }>(
      (data) => checkoutApi.calculateTotals(data)
    );
  };

  // Validate coupon
  const useValidateCoupon = () => {
    return useMutation<any, { couponCode: string; cartTotal: number }>(
      ({ couponCode, cartTotal }) => checkoutApi.validateCoupon(couponCode, cartTotal)
    );
  };

  // Get shipping options
  const useShippingOptions = () => {
    return useMutation<any, {
      items: CartItem[];
      address: any;
    }>(
      (data) => checkoutApi.getShippingOptions(data)
    );
  };

  // Process payment
  const useProcessPayment = () => {
    return useMutation<any, {
      orderId: string;
      paymentMethod: string;
      paymentDetails: any;
    }>(
      (paymentData) => checkoutApi.processPayment(paymentData)
    );
  };

  return {
    useCalculateTotals,
    useValidateCoupon,
    useShippingOptions,
    useProcessPayment,
  };
};

/**
 * Combined hook for complete cart and order management
 */
export const useCartOrderData = () => {
  const cartHooks = useCartApi();
  const orderHooks = useOrderApi();
  const checkoutHooks = useCheckoutApi();

  // Quick access methods
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    const { mutate } = cartHooks.useAddToCart();
    return mutate({ productId, quantity });
  }, [cartHooks]);

  const removeFromCart = useCallback(async (productId: string) => {
    const { mutate } = cartHooks.useRemoveFromCart();
    return mutate({ productId });
  }, [cartHooks]);

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    const { mutate } = cartHooks.useUpdateCartItem();
    return mutate({ productId, quantity });
  }, [cartHooks]);

  const createOrder = useCallback(async (orderData: any) => {
    const { mutate } = orderHooks.useCreateOrder();
    return mutate(orderData);
  }, [orderHooks]);

  const calculateTotals = useCallback(async (data: any) => {
    const { mutate } = checkoutHooks.useCalculateTotals();
    return mutate(data);
  }, [checkoutHooks]);

  return {
    ...cartHooks,
    ...orderHooks,
    ...checkoutHooks,
    // Quick access methods
    addToCart,
    removeFromCart,
    updateCartQuantity,
    createOrder,
    calculateTotals,
  };
};
