'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, Eye, Download } from 'lucide-react';
import { useAuth, useOrders } from '@/contexts/AppContext';
import { DataService } from '@/services/dataService';
import Header from '@/components/Header';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/auth/login';
    }
  }, []);

  // Load real orders from API
  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token, redirecting to login');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordersData = await DataService.getUserOrders();
        console.log('📦 Orders Page - Loaded Orders:', ordersData);
        console.log('📦 Orders Page - Number of orders:', ordersData.length);
        setOrders(ordersData);
      } catch (error) {
        console.error('❌ Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Site Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track and manage your windoors orders</p>
            </div>
            <Link
              href="/account/dashboard"
              className="text-blue-600 hover:underline"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && (
          <div className="space-y-6">
            {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">Ordered on {order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.statusText}
                    </span>
                  </div>
                </div>

                {/* Status Information */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {order.trackingNumber && (
                    <div>
                      <p className="text-gray-600">Tracking Number</p>
                      <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.deliveryDate && (
                    <div>
                      <p className="text-gray-600">Delivered On</p>
                      <p className="font-medium text-gray-900">{order.deliveryDate}</p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-gray-600">Estimated Delivery</p>
                      <p className="font-medium text-gray-900">{order.estimatedDelivery}</p>
                    </div>
                  )}
                  {order.estimatedShipping && (
                    <div>
                      <p className="text-gray-600">Estimated Shipping</p>
                      <p className="font-medium text-gray-900">{order.estimatedShipping}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {order.trackingNumber && (
                    <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Truck className="w-4 h-4 mr-1" />
                      Track Order
                    </button>
                  )}
                  <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Download className="w-4 h-4 mr-1" />
                    Download Invoice
                  </button>
                  {order.status === 'delivered' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

            {/* Empty State (if no orders) */}
            {orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                <Link
                  href="/categories"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
