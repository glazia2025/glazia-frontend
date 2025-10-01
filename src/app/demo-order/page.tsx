'use client';

import React, { useState } from 'react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import OrderPlacement from '@/components/OrderPlacement';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DemoOrderPage: React.FC = () => {
  const { cart, addToCart } = useCartState();
  const { user, setUser, setAuthentication } = useAuth();
  const [showOrderPlacement, setShowOrderPlacement] = useState(false);

  // Demo user data
  const demoUser = {
    id: '685c0c1e960f85e90578c723',
    name: 'Prithvi Raj Tiwari',
    email: 'prithvi@example.com',
    phone: '7500269270',
    company: 'Demo Company',
    gstNumber: 'GST123456789',
    pincode: '263139',
    city: 'Haldwani',
    state: 'Uttarakhand',
    completeAddress: '123 Demo Street, Haldwani, Uttarakhand',
    memberSince: '2024-01-01',
    totalOrders: 5,
    totalSpent: 25000,
    loyaltyPoints: 250,
    isAuthenticated: true
  };

  // Demo product
  const demoProduct = {
    id: 'CCC1417',
    name: '14X17MM CASTED CORNER CLEAT',
    brand: 'Glazia',
    price: 40,
    originalPrice: 50,
    image: '/api/placeholder/300/300',
    inStock: true,
    category: 'Hardware'
  };

  const handleLoginDemo = () => {
    setUser(demoUser);
    setAuthentication(true);
    localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Ijc1MDAyNjkyNzAiLCJ1c2VySWQiOiI2ODVjMGMxZTk2MGY4NWU5MDU3OGM3MjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc1ODAzODIzNywiZXhwIjoxNzY4NDA2MjM3fQ.iSGLxfutpBeIW6hgpsGr_epaY3RZ5ys05QiySAOQ5dU');
  };

  const handleAddDemoProduct = () => {
    addToCart(demoProduct);
  };

  const handleStartOrder = () => {
    if (!user) {
      alert('Please login first');
      return;
    }
    if (cart.items.length === 0) {
      alert('Please add some products to cart first');
      return;
    }
    setShowOrderPlacement(true);
  };

  const handleOrderSuccess = () => {
    setShowOrderPlacement(false);
    alert('Order placed successfully! Check console for details.');
  };

  const handleOrderCancel = () => {
    setShowOrderPlacement(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Placement Demo</h1>

          {/* Flow Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">🛒 Shopping Flow</h2>
            <div className="space-y-2 text-sm text-blue-800">
              <p>✅ <strong>Step 1:</strong> Add products to cart (No login required)</p>
              <p>✅ <strong>Step 2:</strong> Click "Quick Order" or "Checkout" button</p>
              <p>✅ <strong>Step 3:</strong> Login when prompted (if not already logged in)</p>
              <p>✅ <strong>Step 4:</strong> Complete payment and upload proof</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Demo Controls */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Step 1: Add Product to Cart (No Login Required)</h3>
                  <button
                    onClick={handleAddDemoProduct}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Demo Product (₹40)
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    You can add products without logging in!
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Step 2: Try to Checkout</h3>
                  <button
                    onClick={handleStartOrder}
                    disabled={cart.items.length === 0}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Start Order Process
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {!user ? 'You will be prompted to login' : 'Proceed to payment'}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Quick Login (For Testing)</h3>
                  <button
                    onClick={handleLoginDemo}
                    disabled={!!user}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {user ? '✅ Logged in as Demo User' : 'Login as Demo User'}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Display */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Current Status</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">User Status:</h3>
                  <p className="text-sm text-gray-600">
                    {user ? `Logged in as ${user.name}` : 'Not logged in'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Cart Status:</h3>
                  <p className="text-sm text-gray-600">
                    {cart.items.length} items, Total: ₹{cart.total.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Auth Token:</h3>
                  <p className="text-xs text-gray-500 break-all">
                    {localStorage.getItem('authToken')?.substring(0, 50) || 'No token'}...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          {cart.items.length > 0 && (
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
              <div className="space-y-2">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Information */}
          <div className="mt-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">API Information</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Endpoint:</strong> https://api.glazia.in/api/user/pi-generate</p>
              <p><strong>Method:</strong> POST</p>
              <p><strong>Headers:</strong> Authorization: Bearer [token]</p>
              <p><strong>Body:</strong> JSON with user, products, payment, and totalAmount</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Placement Modal */}
      {showOrderPlacement && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleOrderCancel} />
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Placement</h2>
                <OrderPlacement
                  onOrderSuccess={handleOrderSuccess}
                  onCancel={handleOrderCancel}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default DemoOrderPage;
