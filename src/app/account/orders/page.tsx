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

  // Helper functions to work with raw API data
  const getOrderStatus = (order: any) => {
    if (order.isComplete) return 'delivered';

    const hasApprovedPayments = order.payments?.some((p: any) => p.isApproved);
    const allPaymentsApproved = order.payments?.every((p: any) => p.isApproved);

    if (allPaymentsApproved) return 'shipped';
    if (hasApprovedPayments) return 'processing';
    return 'pending';
  };

  const getOrderStatusText = (order: any) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      default: return 'Pending Payment';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-[#124657}" />;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Site Header */}
      <Header />
      <div>

        <div className="bg-[#D6DADE]">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-[500] text-gray-900 mb-1 sm:mb-2">My Orders</h1>
              <p className="text-gray-600">Track and manage your windoors orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657} mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && (
          <div className="space-y-6">
            {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center space-x-4">
                    {getStatusIcon(getOrderStatus(order))}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order._id}</h3>
                      <p className="text-sm text-gray-600">Ordered on {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-gray-900">₹{order.totalAmount.toLocaleString()}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getOrderStatus(order))}`}>
                      {getOrderStatusText(order)}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">City</p>
                    <p className="font-medium text-gray-900">{order.user?.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Delivery Type</p>
                    <p className="font-medium text-gray-900">{order.deliveryType || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {order.products?.map((product: any, index: number) => (
                    <div key={product._id || index} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
                      <div className="flex items-start sm:items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                          <Package className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.description}</p>
                          <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                          <p className="text-sm text-gray-600">Product ID: {product.productId}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 sm:text-right">₹{product.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {getOrderStatus(order) === 'shipped' && (
                    <button className="flex items-center text-[#124657} hover:text-blue-700 text-sm font-medium">
                      <Truck className="w-4 h-4 mr-1" />
                      Track Order
                    </button>
                  )}
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="flex items-center text-[#124657} hover:text-blue-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="flex items-center text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Download className="w-4 h-4 mr-1" />
                    Download Invoice
                  </button>
                  {order.isComplete && (
                    <button className="bg-[#124657} hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                  className="bg-[#124657} hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Previous</button>
              <button className="px-3 py-2 bg-[#124657} text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
