'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag, Trash2, Zap, LogIn } from 'lucide-react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import OrderPlacement from './OrderPlacement';

const CartSidebar: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, closeCart } = useCartState();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (cart.isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift

      return () => {
        // Unlock scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [cart.isOpen]);

  // Lock body scroll when order placement modal is open
  useEffect(() => {
    if (showOrderPlacement) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll'; // Prevent layout shift

      return () => {
        // Unlock scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showOrderPlacement]);

  if (!cart.isOpen) return null;

  const handleQuickOrder = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    setShowOrderPlacement(true);
  };


  const handleLoginRedirect = () => {
    closeCart();
    router.push('/auth/login');
  };

  const handleOrderSuccess = () => {
    setShowOrderPlacement(false);
    closeCart();
  };

  const handleOrderCancel = () => {
    setShowOrderPlacement(false);
  };

  console.log(cart, 'cart>>>>')

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#00000033] bg-opacity-50 z-50"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({cart.itemCount})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Add some windoors products to get started</p>
                <Link
                  href="/categories"
                  onClick={closeCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 text-xs">{item.category}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.brand}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">₹{item.originalPrice}</span>
                        )}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Subtotal:</span>
                <span className="text-lg font-bold text-gray-900">₹{cart.total.toLocaleString()}</span>
              </div>

              {/* Shipping Info */}
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                {cart.total >= 10000 ? (
                  <p className="text-green-600 font-medium">🎉 Free shipping on this order!</p>
                ) : (
                  <p>Add ₹{(10000 - cart.total).toLocaleString()} more for free shipping</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                {!isAuthenticated && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <p className="text-sm text-yellow-800 text-center">
                      Please login to complete your order
                    </p>
                  </div>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={handleQuickOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Checkout</span>
                  </button>
                ) : (
                  <button
                    onClick={handleQuickOrder}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login to Checkout</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 z-60" onClick={() => setShowLoginPrompt(false)} />

          {/* Modal Content */}
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <LogIn className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please login to your account to continue with checkout and place your order.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={handleLoginRedirect}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Placement Modal */}
      {showOrderPlacement && (
        <>
          {/* Modal Overlay */}
          <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 z-60" onClick={handleOrderCancel} />

          {/* Modal Content */}
          <div className="fixed inset-0 z-70 flex items-center justify-center md:p-4">
            <div className="bg-white md:rounded-lg shadow-xl w-full md:w-[75vw] h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Quick Order</h2>
                  <button
                    onClick={handleOrderCancel}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <OrderPlacement
                  onOrderSuccess={handleOrderSuccess}
                  onCancel={handleOrderCancel}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CartSidebar;
