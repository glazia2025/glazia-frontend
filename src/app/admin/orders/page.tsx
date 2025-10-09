"use client";

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  MapPin,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiClient } from '@/services/api';

// Order interfaces based on your provided structure
interface OrderProduct {
  _id: string;
  productId: string;
  description?: string;
  perticular?: string;
  quantity: number;
  amount: number;
}

interface OrderUser {
  name: string;
  phoneNumber: string;
  city: string;
  email?: string;
}

interface Order {
  _id: string;
  products: OrderProduct[];
  user: OrderUser;
  status?: string;
  totalAmount?: number;
  createdAt: string;
  updatedAt?: string;
}

// Default query parameters (same as your provided constants)
const DEFAULT_ORDER_LIST_QUERY_PARAMS = {
  page: 1,
  limit: 20,
  sortKey: "createdAt",
  sortOrder: "desc",
  filters: {},
};

// Build query params function (similar to your thunk)
const buildQueryParams = (params: any) => {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.append('page', params.page.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.sortKey) searchParams.append('sortKey', params.sortKey);
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  // Add filters if any
  if (params.filters && Object.keys(params.filters).length > 0) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value as string);
    });
  }

  return searchParams.toString() ? `?${searchParams.toString()}` : '';
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState(DEFAULT_ORDER_LIST_QUERY_PARAMS);

  useEffect(() => {
    fetchOrders(queryParams);
  }, [queryParams]);

  // Recreated fetchOrders function without Redux thunk (same API pattern as your provided code)
  const fetchOrders = async (params: any) => {
    console.log("params", params);
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(
        `/api/user/getOrders${buildQueryParams(params)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Orders response:", response);

      // Handle response data (assuming response structure matches your API)
      if (response && response.data) {
        setOrders(response.data);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else {
        setOrders([]);
      }

    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);

      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');

      // Update order status via API (you can implement this endpoint)
      await apiClient.put(`/admin/orders/${orderId}/status`, {
        body: { status: newStatus },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.user.email && order.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         order.user.phoneNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage customer orders and update status</p>
          </div>
          <div className="text-sm text-gray-500">
            Total: {orders.length} orders
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders by number, customer name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-form-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Cards (similar to your provided Orders component) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                View <span style={{ color: "#3b71ca" }}>Orders</span>!
              </h3>
              <button
                onClick={() => fetchOrders(queryParams)}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Render orders (same structure as your provided component) */}
            {filteredOrders?.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order._id} className="border border-gray-200 rounded-lg mb-4 shadow-sm">
                  <div className="p-4">
                    {/* Order Products */}
                    {order.products.map((product) => (
                      <div key={product._id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center">
                          <p className="text-gray-600 text-sm font-medium">
                            {product.productId}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-gray-600 text-sm">
                            {product.description || product.perticular || "N.A"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-gray-600 text-sm">
                            Qty: {product.quantity}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-gray-600 text-sm">
                            Amount: ₹{product.amount}
                          </p>
                        </div>
                      </div>
                    ))}

                    <hr className="my-4 border-gray-200" />

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#386bc0" }}>
                          {order.user.name}
                        </p>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-around gap-2">
                        <p className="text-sm" style={{ color: "#386bc0" }}>
                          Contact - {order.user.phoneNumber}
                        </p>
                        <p className="text-sm" style={{ color: "#386bc0" }}>
                          {order.user.city}
                        </p>
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status || 'pending'}</span>
                        </span>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className="text-[#124657] hover:text-[#0f3a4a] inline-flex items-center text-sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>

                        {/* Status Update Dropdown */}
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingStatus === order._id}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#124657]"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No orders have been placed yet'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="admin-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10050] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order ID</label>
                    <p className="text-sm text-gray-900">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="ml-1 capitalize">{selectedOrder.status || 'pending'}</span>
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-24">Name:</span>
                      <span className="text-gray-900">{selectedOrder.user.name}</span>
                    </div>
                    {selectedOrder.user.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{selectedOrder.user.email}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{selectedOrder.user.phoneNumber}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-900">{selectedOrder.user.city}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product) => (
                      <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{product.productId}</p>
                          <p className="text-sm text-gray-600">{product.description || product.perticular || "N.A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{product.amount}</p>
                          <p className="text-sm text-gray-600">Qty: {product.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₹{selectedOrder.totalAmount?.toLocaleString() ||
                          selectedOrder.products.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
