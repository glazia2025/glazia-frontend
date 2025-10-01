'use client';

import { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';

export default function TestOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    setToken(authToken);
  }, []);

  const testFetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🧪 Testing order fetch...');
      const ordersData = await DataService.getUserOrders();
      console.log('🧪 Received orders:', ordersData);
      setOrders(ordersData);
    } catch (err: any) {
      console.error('🧪 Error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('No auth token found');
        return;
      }

      console.log('🧪 Testing direct API call...');
      const response = await fetch('http://localhost:5555/api/user/getOrders?limit=10&page=1&sortOrder=desc&sortKey=createdAt', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🧪 Response status:', response.status);
      const data = await response.json();
      console.log('🧪 Response data:', data);
      
      setOrders(data.orders || []);
    } catch (err: any) {
      console.error('🧪 Error:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Orders API Test Page</h1>

        {/* Auth Token Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Token Present:</span>{' '}
              <span className={token ? 'text-green-600' : 'text-red-600'}>
                {token ? '✅ Yes' : '❌ No'}
              </span>
            </p>
            {token && (
              <p className="text-xs text-gray-600 break-all">
                <span className="font-medium">Token:</span> {token.substring(0, 50)}...
              </p>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={testFetchOrders}
              disabled={loading || !token}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              {loading ? 'Loading...' : 'Test DataService.getUserOrders()'}
            </button>
            <button
              onClick={testDirectAPI}
              disabled={loading || !token}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium"
            >
              {loading ? 'Loading...' : 'Test Direct API Call'}
            </button>
          </div>
          {!token && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Please login first to test the API
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Results ({orders.length} orders)
          </h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              No orders found. Click a test button above to fetch orders.
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-medium">{order._id || order.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">
                        {order.createdAt 
                          ? new Date(order.createdAt).toLocaleDateString() 
                          : order.date || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-medium">₹{order.totalAmount || order.total || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-medium capitalize">{order.status || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Products</p>
                      <p className="font-medium">
                        {order.products?.length || order.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  
                  {/* Raw Data */}
                  <details className="mt-4">
                    <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                      View Raw Data
                    </summary>
                    <pre className="mt-2 p-4 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(order, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-blue-900 font-semibold mb-2">📋 Debugging Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open browser DevTools (F12)</li>
            <li>Go to Console tab</li>
            <li>Click one of the test buttons above</li>
            <li>Look for console logs starting with 🧪, 📦, ✅, or ⚠️</li>
            <li>Check Network tab for API request/response</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <a
            href="/account/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </a>
          <a
            href="/account/orders"
            className="text-blue-600 hover:underline"
          >
            View Orders Page
          </a>
          <a
            href="/auth/login"
            className="text-blue-600 hover:underline"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}

