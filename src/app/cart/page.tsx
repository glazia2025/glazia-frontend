'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Heart } from 'lucide-react';
import { useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useCartState();

  const shippingCost = cart.total >= 10000 ? 0 : 150;
  const tax = Math.round(cart.total * 0.18); // 18% GST
  const finalTotal = cart.total + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900">Shopping Cart</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            href="/categories"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any windoors products to your cart yet.
              Browse our extensive collection to find the perfect profiles and hardware.
            </p>
            <Link
              href="/categories"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Cart Items ({cart.itemCount})
                    </h2>
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                <div className="divide-y">
                  {cart.items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 text-xs text-center">{item.category}</span>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.brand}</p>
                          
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-lg font-semibold text-gray-900">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              item.inStock 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Qty:</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Actions */}
                            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 text-sm">
                              <Heart className="w-4 h-4" />
                              <span>Save for Later</span>
                            </button>
                            
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center space-x-1 text-gray-600 hover:text-red-600 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({state.itemCount} items)</span>
                    <span className="font-medium">₹{state.total.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${shippingCost}`
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST 18%)</span>
                    <span className="font-medium">₹{tax.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">₹{finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {state.total < 10000 && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      Add ₹{(10000 - state.total).toLocaleString()} more for free shipping!
                    </p>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((state.total / 10000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block mb-4"
                >
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/categories"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
