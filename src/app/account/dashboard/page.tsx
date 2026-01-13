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
  CreditCard,
  FileText,
  Download,
  ExternalLink,
  ClipboardList,
  Wallet
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
  const [partnerAgreementUrl, setPartnerAgreementUrl] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!window.localStorage.getItem('authToken')) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated]);

  // Load partner agreement URL from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('glazia-user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.paUrl) {
            setPartnerAgreementUrl(user.paUrl);
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, []);

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
          id: order._id,
          date: order.createdAt,
          items: order.products.length,
          total: order.totalAmount,
          status: order.deliveryType,
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
      title: 'Create Quotation',
      description: 'Generate quotes for customers',
      icon: FileText,
      href: '/quotations/create',
      color: 'bg-orange-500'
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
    <div className="">
      {/* Main Site Header */}
      <Header />
      <div>

        {/* Welcome Banner with Suspense */}
      <Suspense fallback={null}>
        <WelcomeBanner onClose={() => {}} />
      </Suspense>

      <div className="bg-[#D6DADE]">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-[500] text-gray-900 mb-1 sm:mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Loyalty Points: {user.loyaltyPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="gap-8">
          {/* Main Content */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Stats Cards */}
              <div className="w-full lg:w-[35%] grid grid-cols-1 gap-4 sm:gap-6">
                <div className="bg-white border border-[3px] border-[#D6DADE] p-4 sm:p-6 flex items-center">
                  <ClipboardList size={52} strokeWidth={2} absoluteStrokeWidth />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    </div>
                </div>

                <div className="bg-white border border-[3px] border-[#D6DADE] p-4 sm:p-6 flex items-center">
                  <Wallet size={52} strokeWidth={2} absoluteStrokeWidth />
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">₹{orders.reduce((acc, order) => acc + order.totalAmount, 0).toLocaleString()}</p>
                    </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="w-full bg-white border border-[3px] border-[#D6DADE] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/account/orders" className="text-[#EE1C25] hover:underline text-sm">
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
                      <div onClick={() => window.location.href = `/account/orders/${order.id}`} key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start sm:items-center">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-900">{order.id}</h3>
                            <p className="text-sm text-gray-600">{order.items} items • {order.date}</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
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

            {/* Partner Agreement Section */}
            {partnerAgreementUrl && (
              <div className="bg-white border border-[3px] border-[#D6DADE] p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-[#124657]" />
                    Partner Agreement
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <a
                      href={partnerAgreementUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-black text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open in New Tab
                    </a>
                    <a
                      href={partnerAgreementUrl}
                      download="Partner_Agreement.pdf"
                      className="inline-flex items-center px-3 py-2 bg-[#EE1C25] text-white text-sm font-medium"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </div>
                </div>

                {/* PDF Viewer */}
                <div className="overflow-hidden">
                  <iframe
                    src={partnerAgreementUrl}
                    className="w-full h-64 sm:h-96"
                    title="Partner Agreement"
                    style={{ border: 'none' }}
                  />
                </div>

                <div className="mt-4 p-4">
                  <div>
                    <h3 className="text-[18px] font-[600] text-[#2F3A4F]">Agreement Status</h3>
                    <p className="text-[14px] font[400] text-[#606060] mt-1">
                      Your partner agreement has been <b>successfully signed and is active</b>. This document contains the terms and conditions of our partnership.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
            {/* Profile Summary */}
            <div className="bg-white w-full border border-[3px] border-[#D6DADE] p-4 sm:p-6">
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
                {/* <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="text-sm text-gray-600">Member since {user.memberSince}</p>
                </div> */}
              </div>
              {/* <Link
                href="/account/profile"
                className="mt-4 w-full bg-[#124657} hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block text-center"
              >
                Edit Profile
              </Link> */}
            </div>
            {/* Support */}
            <div className="w-full border border-[3px] border-[#D6DADE] p-4 sm:p-6">
              <h3 className="font-semibold mb-2">Want to update your details?</h3>
              <p className="text-sm 700 mb-4">
                Simply contact us and we&apos;ll take care of it.
              </p>
              <Link
                href="/contact"
                className="bg-[#EE1C25] text-white py-2 px-4 text-sm font-medium inline-block"
              >
                Contact Support
              </Link>
            </div>
          </div>
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
