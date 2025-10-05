'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Phone,
  Mail,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useAuth, useOrders } from '@/contexts/AppContext';
import { DataService } from '@/services/dataService';
import Header from '@/components/Header';

// Component to handle search params with Suspense
function WelcomeBanner({ onClose }: { onClose: () => void }) {
  const searchParams = useSearchParams();
  const isWelcome = searchParams.get('welcome') === 'true';
  const [showWelcome, setShowWelcome] = useState(isWelcome);

  useEffect(() => {
    if (isWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isWelcome, onClose]);

  if (!showWelcome) return null;

  return (
    <div className="bg-gradient-to-r from-[#124657} to-blue-700 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-xl font-bold">Welcome to Glazia!</h2>
              <p className="text-blue-100">Your account has been created successfully. Start exploring our windoors products.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowWelcome(false);
              onClose();
            }}
            className="text-blue-100 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!window.localStorage.getItem('authToken')) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated]);

  // Load real orders from API
  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token, skipping orders load');
        setLoadingOrders(false);
        return;
      }

      try {
        setLoadingOrders(true);
        const orders = await DataService.getUserOrders();
        console.log('📦 Dashboard - Loaded Orders:', orders);

        setOrders(orders);

        // Get recent 3 orders
        const recent = orders.slice(0, 3).map(order => ({
          id: order.id,
          date: order.date,
          items: order.items.length,
          total: order.total,
          status: order.status,
          statusText: order.statusText
        }));

        console.log('📦 Dashboard - Recent Orders:', recent);
        setRecentOrders(recent);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  // Use real user data from auth context or fallback
  const user = authUser || {
    name: 'Guest User',
    email: '',
    phone: '',
    company: '',
    memberSince: 'Recently',
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  };

  const quickActions = [
    {
      title: 'Browse Products',
      description: 'Explore our windoors catalog',
      icon: Package,
      href: '/categories',
      color: 'bg-blue-500'
    },
    {
      title: 'Track Orders',
      description: 'Check your order status',
      icon: Truck,
      href: '/account/orders',
      color: 'bg-green-500'
    },

    {
      title: 'Profile Settings',
      description: 'Update your information',
      icon: User,
      href: '/account/profile',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Site Header */}
      <Header />

      {/* Welcome Banner with Suspense */}
      <Suspense fallback={null}>
        <WelcomeBanner onClose={() => {}} />
      </Suspense>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Loyalty Points</p>
                <p className="text-lg font-semibold text-[#124657}">{user.loyaltyPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ShoppingBag className="w-6 h-6 text-[#124657}" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">₹{orders.reduce((acc, order) => acc + order.total, 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className={`${action.color} p-3 rounded-lg`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <Link href="/account/orders" className="text-[#124657} hover:underline text-sm">
                  View All Orders
                </Link>
              </div>

              {/* Loading State */}
              {loadingOrders && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#124657} mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading orders...</p>
                </div>
              )}

              {/* Orders List */}
              {!loadingOrders && recentOrders.length > 0 && (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <Package className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-900">{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.items} items • {order.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.statusText}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loadingOrders && recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <Link
                    href="/categories"
                    className="inline-block bg-[#124657} hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.company}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-600">Member since {user.memberSince}</p>
                </div>
              </div>
              <Link
                href="/account/profile"
                className="mt-4 w-full bg-[#124657} hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block text-center"
              >
                Edit Profile
              </Link>
            </div>

            {/* Account Menu */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Menu</h2>
              <nav className="space-y-2">
                <Link href="/account/orders" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  My Orders
                </Link>

                <Link href="/account/addresses" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 mr-3" />
                  Addresses
                </Link>
                <Link href="/account/payments" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 mr-3" />
                  Payment Methods
                </Link>
                <Link href="/account/profile" className="flex items-center p-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 mr-3" />
                  Profile Settings
                </Link>
              </nav>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">
                Our windoors experts are here to help you with product selection and technical support.
              </p>
              <Link
                href="/contact"
                className="bg-[#124657} hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export component with Suspense wrapper
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#124657} mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
