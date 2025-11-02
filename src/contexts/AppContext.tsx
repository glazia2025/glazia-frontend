'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  category: string;
  description: string;
  features?: string[];
  specifications?: Record<string, string>;
  discount?: number;
  stockCount?: number;
}

// Profile Product Schema (based on your backend model)
export interface ProfileProduct {
  id: number;
  sapCode: string;
  part: string;
  degree: string;
  description: string;
  per: string; // Unit, Meter, etc.
  kgm: number;
  length: string;
  image?: string;
  isEnabled: boolean;
}

// Hardware Product Schema (based on your backend model)
export interface HardwareProduct {
  id: number;
  sapCode: string;
  perticular: string;
  subCategory: string;
  rate: number;
  system: string;
  moq: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  gstNumber?: string;
  pincode: string;
  city: string;
  state: string;
  completeAddress: string;
  memberSince: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  isAuthenticated: boolean;
  paUrl?: string;
  dynamicPricing?: {
    hardware: {
      [key: string]: number; // e.g., "CORNER JOINERY": 100
    };
    profiles: {
      [key: string]: number; // e.g., "Casement": 0
    };
    _id?: string;
  };
}

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: number;
  image: string;
  quantity: number;
  inStock: boolean;
  category: string;
  subCategory?: string; // For hardware: "CORNER JOINERY", "PLASTIC PART", etc. For profiles: "Casement", "Sliding", etc.
  length: string;
  per: string;
  kgm: number;
}



export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusText: string;
  shippingAddress: string;
  trackingNumber?: string;
}

interface AppState {
  // Products
  products: Product[];
  featuredProducts: Product[];
  categories: string[];
  
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Cart
  cart: {
    items: CartItem[];
    total: number;
    itemCount: number;
    isOpen: boolean;
  };
  

  
  // Orders
  orders: Order[];
  
  // UI State
  loading: {
    products: boolean;
    user: boolean;
    orders: boolean;
  };
  
  // Filters
  selectedCategory: string;
}

// ============================================================================
// ACTIONS
// ============================================================================

type AppAction =
  // Product Actions
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: Product[] }
  | { type: 'SET_CATEGORIES'; payload: string[] }
  | { type: 'SET_LOADING_PRODUCTS'; payload: boolean }
  
  // User Actions
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_AUTHENTICATION'; payload: boolean }
  | { type: 'SET_LOADING_USER'; payload: boolean }
  
  // Cart Actions
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  

  
  // Order Actions
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { id: string; status: Order['status']; statusText: string } }
  | { type: 'SET_LOADING_ORDERS'; payload: boolean }
  
  // Search & Filter Actions
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AppState = {
  products: [],
  featuredProducts: [],
  categories: ['All', 'Aluminium Profiles', 'Hardware'],
  
  user: null,
  isAuthenticated: false,
  
  cart: {
    items: [],
    total: 0,
    itemCount: 0,
    isOpen: false,
  },
  

  orders: [],
  
  loading: {
    products: false,
    user: false,
    orders: false,
  },

  selectedCategory: 'All',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper function to get dynamic pricing adjustment for an item
const getDynamicPricingAdjustment = (item: CartItem): number => {
  console.log('🔍 getDynamicPricingAdjustment called for item:', item.name, 'category:', item.category, 'subCategory:', item.subCategory);

  if (typeof window === 'undefined') {
    console.log('❌ Window is undefined, returning 0');
    return 0;
  }

  try {
    const userData = localStorage.getItem('glazia-user');
    console.log('📦 User data from localStorage:', userData ? 'Found' : 'Not found');

    if (!userData) {
      console.log('❌ No user data in localStorage, returning 0');
      return 120;
    }

    const user = JSON.parse(userData);
    const dynamicPricing = user.dynamicPricing;
    console.log('💰 Dynamic pricing object:', dynamicPricing);

    if (!dynamicPricing) {
      console.log('❌ No dynamic pricing in user data, returning 0');
      return 120;
    }

    // Default adjustment value when specific pricing is not found
    const DEFAULT_ADJUSTMENT = 120;

    // Check if it's a hardware item
    if (item.category?.toLowerCase().includes("hardware")) {
      // For hardware items, use the subCategory to match against hardware pricing keys
      if (item.subCategory) {
        const adjustment = dynamicPricing.hardware?.[item.subCategory];
        if (adjustment !== undefined && typeof adjustment === 'number' && adjustment != 0) {
          console.log(`🎯 Dynamic pricing applied for hardware "${item.subCategory}": +${adjustment}`);
          return adjustment;
        } else {
          const reason = adjustment == 0 ? 'adjustment is 0' : 'subcategory not found in pricing';
          console.log(`🎯 Default pricing applied for hardware "${item.subCategory}": +${DEFAULT_ADJUSTMENT} (${reason})`);
          return DEFAULT_ADJUSTMENT;
        }
      }
    } else {
      // For profile items, use the subCategory to match against profile pricing keys
      if (item.subCategory) {
        const adjustment = dynamicPricing.profiles?.[item.subCategory];
        if (adjustment !== undefined && typeof adjustment === 'number' && adjustment != 0) {
          console.log(`🎯 Dynamic pricing applied for profile "${item.subCategory}": +${adjustment}`);
          return adjustment;
        } else {
          const reason = adjustment == 0 ? 'adjustment is 0' : 'subcategory not found in pricing';
          console.log(`🎯 Default pricing applied for profile "${item.subCategory}": +${DEFAULT_ADJUSTMENT} (${reason})`);
          return DEFAULT_ADJUSTMENT;
        }
      }
    }

    return 0;
  } catch (error) {
    console.error('Error getting dynamic pricing:', error);
    return 0;
  }
};

const calculateCartTotal = (items: CartItem[]): number => {
  console.log('🧮 calculateCartTotal called with', items.length, 'items');
  let total = 0;

  const nalcoPriceStr = typeof window !== 'undefined' ? window.localStorage.getItem('nalcoPrice') || '0' : '0';
  const nalcoPrice = parseFloat(nalcoPriceStr); // Use parseFloat instead of parseInt
  console.log('NALCO Price from localStorage:', nalcoPriceStr, 'Parsed:', nalcoPrice);

  items.forEach((item, index) => {
    console.log(`🛒 Processing cart item ${index + 1}:`, item.name, 'category:', item.category, 'subCategory:', item.subCategory);
    const dynamicAdjustment = getDynamicPricingAdjustment(item);
    console.log(`💰 Dynamic adjustment for "${item.name}":`, dynamicAdjustment);

    if (item.category?.toLowerCase().includes("hardware")) {
      // Hardware category → (price + dynamic adjustment) × quantity
      const basePrice = parseFloat(item.price) || 0; // Handle string prices properly
      const adjustedPrice = basePrice + dynamicAdjustment;
      total = total + adjustedPrice * item.quantity;

      if (dynamicAdjustment > 0) {
        console.log(`💰 Hardware item "${item.name}": Base price ${basePrice} + Dynamic ${dynamicAdjustment} = ${adjustedPrice} × ${item.quantity}`);
      }
    } else {
      // Other categories → ((nalcoPrice/1000 + 75) + dynamic adjustment) × quantity × (length/1000) × kgm
      const itemLength = parseFloat(item.length) || 1000; // Default to 1000 if invalid
      const itemKgm = item.kgm || 1; // Default to 1 if invalid
      const basePrice = (nalcoPrice / 1000) + 75;
      const adjustedPrice = basePrice + dynamicAdjustment;
      const itemTotal = adjustedPrice * item.quantity * (itemLength / 1000) * itemKgm;
      total = total + itemTotal;

      if (dynamicAdjustment > 0) {
        console.log(`💰 Profile item "${item.name}": Base price ${basePrice} + Dynamic ${dynamicAdjustment} = ${adjustedPrice}, Total: ${itemTotal}`);
      } else {
        console.log(`Item: ${item.name}, NALCO: ${nalcoPrice}, Length: ${itemLength}, KGM: ${itemKgm}, Qty: ${item.quantity}, Total: ${itemTotal}`);
      }
    }
  });

  console.log('Cart Total Calculated:', total);
  return Math.round(total * 100) / 100; // Round to 2 decimal places
};

const calculateCartItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Helper function to get the adjusted price for display purposes
const getAdjustedItemPrice = (item: CartItem): number => {
  console.log('💲 getAdjustedItemPrice called for item:', item.name);
  const dynamicAdjustment = getDynamicPricingAdjustment(item);
  console.log('💲 Dynamic adjustment received:', dynamicAdjustment);

  if (item.category?.toLowerCase().includes("hardware")) {
    // Hardware category → base price + dynamic adjustment
    const basePrice = parseFloat(item.price) || 0;
    const adjustedPrice = basePrice + dynamicAdjustment;
    console.log('💲 Hardware adjusted price:', basePrice, '+', dynamicAdjustment, '=', adjustedPrice);
    return adjustedPrice;
  } else {
    // Profile items → base price + dynamic adjustment (but this is more complex for profiles)
    // For display purposes, we'll show the base price + adjustment
    const basePrice = parseFloat(item.price) || 0;
    const adjustedPrice = basePrice + dynamicAdjustment;
    console.log('💲 Profile adjusted price:', basePrice, '+', dynamicAdjustment, '=', adjustedPrice);
    return adjustedPrice;
  }
};

// ============================================================================
// REDUCER
// ============================================================================

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    // Product Actions
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    case 'SET_LOADING_PRODUCTS':
      return { ...state, loading: { ...state.loading, products: action.payload } };
    
    // User Actions
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true 
      };
    
    case 'CLEAR_USER':
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false 
      };
    
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
      };
    
    case 'SET_AUTHENTICATION':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_LOADING_USER':
      return { ...state, loading: { ...state.loading, user: action.payload } };
    
    // Cart Actions
    case 'ADD_TO_CART': {
      console.log('🛒 ADD_TO_CART action triggered for item:', action.payload.name, 'category:', action.payload.category, 'subCategory:', action.payload.subCategory);
      const existingItem = state.cart.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.cart.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          cart: {
            ...state.cart,
            items: updatedItems,
            total: calculateCartTotal(updatedItems),
            itemCount: calculateCartItemCount(updatedItems),
          },
        };
      } else {
        const newItems = [...state.cart.items, { ...action.payload, quantity: 1 }];
        return {
          ...state,
          cart: {
            ...state.cart,
            items: newItems,
            total: calculateCartTotal(newItems),
            itemCount: calculateCartItemCount(newItems),
          },
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.cart.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          total: calculateCartTotal(newItems),
          itemCount: calculateCartItemCount(newItems),
        },
      };
    }
    
    case 'UPDATE_CART_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.cart.items.filter(item => item.id !== action.payload.id);
        return {
          ...state,
          cart: {
            ...state.cart,
            items: newItems,
            total: calculateCartTotal(newItems),
            itemCount: calculateCartItemCount(newItems),
          },
        };
      }

      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          total: calculateCartTotal(updatedItems),
          itemCount: calculateCartItemCount(updatedItems),
        },
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          total: 0,
          itemCount: 0,
        },
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        cart: { ...state.cart, isOpen: !state.cart.isOpen },
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        cart: { ...state.cart, isOpen: true },
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        cart: { ...state.cart, isOpen: false },
      };
    
    case 'LOAD_CART':
      return {
        ...state,
        cart: {
          ...state.cart,
          items: action.payload,
          total: calculateCartTotal(action.payload),
          itemCount: calculateCartItemCount(action.payload),
        },
      };
    

    
    // Order Actions
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id
            ? { ...order, status: action.payload.status, statusText: action.payload.statusText }
            : order
        ),
      };
    
    case 'SET_LOADING_ORDERS':
      return { ...state, loading: { ...state.loading, orders: action.payload } };
    
    // Filter Actions
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    
    default:
      return state;
  }
};

// ============================================================================
// CONTEXT & PROVIDER
// ============================================================================

interface AppContextType {
  state: AppState;

  // Product Actions
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setCategories: (categories: string[]) => void;
  setLoadingProducts: (loading: boolean) => void;

  // User Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  setAuthentication: (isAuth: boolean) => void;
  setLoadingUser: (loading: boolean) => void;

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;



  // Order Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status'], statusText: string) => void;
  setLoadingOrders: (loading: boolean) => void;

  // Filter Actions
  setSelectedCategory: (category: string) => void;

  // Computed Values
  getFilteredProducts: () => Product[];
  getCartItem: (id: string) => CartItem | undefined;
  getProductById: (id: string) => Product | undefined;
  getAdjustedItemPrice: (item: CartItem) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ============================================================================
  // EFFECTS FOR PERSISTENCE
  // ============================================================================

  // Load data from localStorage on mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Load cart
    const savedCart = localStorage.getItem('glazia-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }



    // Check authentication
    const token = localStorage.getItem('authToken');
    if (token) {
      dispatch({ type: 'SET_AUTHENTICATION', payload: true });
      // Load user data if available
      const savedUser = localStorage.getItem('glazia-user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          dispatch({ type: 'SET_USER', payload: userData });
        } catch (error) {
          console.error('Error loading user from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('glazia-cart', JSON.stringify(state.cart.items));
    }
  }, [state.cart.items]);



  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (state.user) {
        localStorage.setItem('glazia-user', JSON.stringify(state.user));
      } else {
        localStorage.removeItem('glazia-user');
      }
    }
  }, [state.user]);

  // ============================================================================
  // ACTION CREATORS
  // ============================================================================

  // Product Actions
  const setProducts = useCallback((products: Product[]) => {
    dispatch({ type: 'SET_PRODUCTS', payload: products });
  }, []);

  const setFeaturedProducts = useCallback((products: Product[]) => {
    dispatch({ type: 'SET_FEATURED_PRODUCTS', payload: products });
  }, []);

  const setCategories = useCallback((categories: string[]) => {
    dispatch({ type: 'SET_CATEGORIES', payload: categories });
  }, []);

  const setLoadingProducts = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_PRODUCTS', payload: loading });
  }, []);

  // User Actions
  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const clearUser = useCallback(() => {
    dispatch({ type: 'CLEAR_USER' });
    localStorage.removeItem('authToken');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  }, []);

  const setAuthentication = useCallback((isAuth: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATION', payload: isAuth });
  }, []);

  const setLoadingUser = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_USER', payload: loading });
  }, []);

  // Cart Actions
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  }, []);

  const updateCartQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const openCart = useCallback(() => {
    dispatch({ type: 'OPEN_CART' });
  }, []);

  const closeCart = useCallback(() => {
    dispatch({ type: 'CLOSE_CART' });
  }, []);



  // Order Actions
  const setOrders = useCallback((orders: Order[]) => {
    dispatch({ type: 'SET_ORDERS', payload: orders });
  }, []);

  const addOrder = useCallback((order: Order) => {
    dispatch({ type: 'ADD_ORDER', payload: order });
  }, []);

  const updateOrderStatus = useCallback((id: string, status: Order['status'], statusText: string) => {
    dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { id, status, statusText } });
  }, []);

  const setLoadingOrders = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_ORDERS', payload: loading });
  }, []);

  // Filter Actions
  const setSelectedCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  }, []);

  // ============================================================================
  // COMPUTED VALUES & SELECTORS
  // ============================================================================

  const getFilteredProducts = useCallback((): Product[] => {
    let filtered = state.products;

    // Filter by category
    if (state.selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === state.selectedCategory);
    }

    return filtered;
  }, [state.products, state.selectedCategory]);

  const getCartItem = useCallback((id: string): CartItem | undefined => {
    return state.cart.items.find(item => item.id === id);
  }, [state.cart.items]);

  const getProductById = useCallback((id: string): Product | undefined => {
    return state.products.find(product => product.id === id);
  }, [state.products]);

  const getAdjustedItemPriceCallback = useCallback((item: CartItem): number => {
    return getAdjustedItemPrice(item);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AppContextType = {
    state,

    // Product Actions
    setProducts,
    setFeaturedProducts,
    setCategories,
    setLoadingProducts,

    // User Actions
    setUser,
    clearUser,
    updateUser,
    setAuthentication,
    setLoadingUser,

    // Cart Actions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,



    // Order Actions
    setOrders,
    addOrder,
    updateOrderStatus,
    setLoadingOrders,

    // Filter Actions
    setSelectedCategory,

    // Computed Values
    getFilteredProducts,
    getCartItem,
    getProductById,
    getAdjustedItemPrice: getAdjustedItemPriceCallback,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Specialized hooks for specific parts of the state
export const useProducts = () => {
  const { state, setProducts, setFeaturedProducts, setLoadingProducts, getFilteredProducts, getProductById } = useApp();
  return {
    products: state.products,
    featuredProducts: state.featuredProducts,
    categories: state.categories,
    loading: state.loading.products,
    setProducts,
    setFeaturedProducts,
    setLoadingProducts,
    getFilteredProducts,
    getProductById,
  };
};

export const useAuth = () => {
  const { state, setUser, clearUser, updateUser, setAuthentication, setLoadingUser } = useApp();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading.user,
    setUser,
    clearUser,
    updateUser,
    setAuthentication,
    setLoadingUser,
  };
};

export const useCartState = () => {
  const { state, addToCart, removeFromCart, updateCartQuantity, clearCart, toggleCart, openCart, closeCart, getCartItem, getAdjustedItemPrice } = useApp();
  return {
    cart: state.cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getCartItem,
    getAdjustedItemPrice,
  };
};



export const useOrders = () => {
  const { state, setOrders, addOrder, updateOrderStatus, setLoadingOrders } = useApp();
  return {
    orders: state.orders,
    loading: state.loading.orders,
    setOrders,
    addOrder,
    updateOrderStatus,
    setLoadingOrders,
  };
};


