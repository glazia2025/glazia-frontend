import { apiClient, API_ENDPOINTS, ApiResponse } from './api';
import { CartItem } from '../contexts/AppContext';

// Cart API service class
export class CartApiService {
  
  /**
   * Get user's cart
   */
  async getCart(): Promise<ApiResponse<{
    items: CartItem[];
    itemCount: number;
    totalAmount: number;
    subtotal: number;
    tax: number;
    shipping: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.CART.GET);
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    return apiClient.post(API_ENDPOINTS.CART.ADD, {
      body: {
        productId,
        quantity,
      },
    });
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(productId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return apiClient.put(API_ENDPOINTS.CART.UPDATE, {
      body: {
        productId,
        quantity,
      },
    });
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.CART.REMOVE, {
      body: {
        productId,
      },
    });
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.CART.CLEAR);
  }

  /**
   * Sync local cart with server cart (for logged-in users)
   */
  async syncCart(localCartItems: CartItem[]): Promise<ApiResponse<{
    items: CartItem[];
    itemCount: number;
    totalAmount: number;
  }>> {
    return apiClient.post(`${API_ENDPOINTS.CART.GET}/sync`, {
      body: {
        items: localCartItems,
      },
    });
  }
}

// Order API service class
export class OrderApiService {
  
  /**
   * Get user orders
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.LIST, {
      query: params,
    });
  }

  /**
   * Get order details by ID
   */
  async getOrderById(orderId: string): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.DETAIL, {
      params: { id: orderId },
    });
  }

  /**
   * Create new order
   */
  async createOrder(orderData: {
    items: CartItem[];
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ORDERS.CREATE, {
      body: orderData,
    });
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, updateData: any): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.ORDERS.UPDATE, {
      params: { id: orderId },
      body: updateData,
    });
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ORDERS.CANCEL, {
      params: { id: orderId },
      body: { reason },
    });
  }

  /**
   * Track order
   */
  async trackOrder(orderId: string): Promise<ApiResponse<{
    orderId: string;
    status: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    timeline: Array<{
      status: string;
      timestamp: string;
      description: string;
      location?: string;
    }>;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.ORDERS.DETAIL}/track`, {
      params: { id: orderId },
    });
  }

  /**
   * Get order invoice
   */
  async getOrderInvoice(orderId: string): Promise<ApiResponse<{
    invoiceUrl: string;
    invoiceNumber: string;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.ORDERS.DETAIL}/invoice`, {
      params: { id: orderId },
    });
  }

  /**
   * Request order return
   */
  async requestReturn(orderId: string, returnData: {
    items: Array<{
      productId: string;
      quantity: number;
      reason: string;
    }>;
    reason: string;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`${API_ENDPOINTS.ORDERS.DETAIL}/return`, {
      params: { id: orderId },
      body: returnData,
    });
  }
}

// Checkout API service class
export class CheckoutApiService {
  
  /**
   * Calculate order totals
   */
  async calculateTotals(data: {
    items: CartItem[];
    shippingAddress?: any;
    couponCode?: string;
  }): Promise<ApiResponse<{
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    breakdown: any;
  }>> {
    return apiClient.post('/checkout/calculate', {
      body: data,
    });
  }

  /**
   * Validate coupon code
   */
  async validateCoupon(couponCode: string, cartTotal: number): Promise<ApiResponse<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    message?: string;
  }>> {
    return apiClient.post('/checkout/validate-coupon', {
      body: {
        couponCode,
        cartTotal,
      },
    });
  }

  /**
   * Get shipping options
   */
  async getShippingOptions(data: {
    items: CartItem[];
    address: any;
  }): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    estimatedDays: number;
  }>>> {
    return apiClient.post('/checkout/shipping-options', {
      body: data,
    });
  }

  /**
   * Process payment
   */
  async processPayment(paymentData: {
    orderId: string;
    paymentMethod: string;
    paymentDetails: any;
  }): Promise<ApiResponse<{
    success: boolean;
    transactionId: string;
    paymentStatus: string;
    redirectUrl?: string;
  }>> {
    return apiClient.post('/checkout/process-payment', {
      body: paymentData,
    });
  }
}

// Create and export service instances
export const cartApi = new CartApiService();
export const orderApi = new OrderApiService();
export const checkoutApi = new CheckoutApiService();
