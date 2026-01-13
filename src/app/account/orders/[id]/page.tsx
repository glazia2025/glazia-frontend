'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  Copy,
  Calendar,
  CreditCard,
  User,
  Upload,
  AlertCircle,
  IndianRupee
} from 'lucide-react';
import { DataService } from '@/services/dataService';
import Header from '@/components/Header';

interface OrderProduct {
  productId: string;
  description: string;
  quantity: number;
  amount: number;
  _id: string;
}

interface OrderPayment {
  amount: number;
  cycle: number;
  proofAdded: boolean;
  isApproved: boolean;
  _id: string;
}

interface OrderUser {
  userId: string;
  name: string;
  city: string;
  phoneNumber: string;
  _id: string;
}

interface OrderDetails {
  _id: string;
  user: OrderUser;
  products: OrderProduct[];
  payments: OrderPayment[];
  totalAmount: number;
  isComplete: boolean;
  deliveryType: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentPaymentCycle, setCurrentPaymentCycle] = useState<OrderPayment | null>(null);

  const orderId = params.id as string;

  // Helper functions to work with the new data structure
  const getOrderStatus = (order: OrderDetails) => {
    if (order?.isComplete) return 'delivered';

    const hasApprovedPayments = order?.payments?.some(p => p.isApproved);
    const allPaymentsApproved = order?.payments?.every(p => p.isApproved);

    if (allPaymentsApproved) return 'shipped';
    if (hasApprovedPayments) return 'processing';
    return 'pending';
  };

  const getOrderStatusText = (order: OrderDetails) => {
    const status = getOrderStatus(order);
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      default: return 'Pending Payment';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getNextPaymentCycle = (payments: OrderPayment[]) => {
    const approvedPayments = payments?.filter(p => p.isApproved);
    const nextCycle = approvedPayments?.length + 1;
    return payments?.find(p => p.cycle === nextCycle && !p.proofAdded);
  };

  // Payment proof upload handlers
  const handleUploadProofClick = (payment: OrderPayment) => {
    setCurrentPaymentCycle(payment);
    setShowUploadModal(true);
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, GIF, or PDF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setSelectedFile(base64String);
      };
      reader.onerror = () => {
        setError('Failed to read file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !currentPaymentCycle || !order) {
      return;
    }

    setUploadingProof(true);
    setUploadProgress(0);

    console.log(currentPaymentCycle, 'currentPaymentCycle');

    try {

      const payload = {
        proof: selectedFile,
        orderId: order._id,
        paymentId: currentPaymentCycle._id
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const token = localStorage.getItem('authToken');
      const response = await fetch('https://api.glazia.in/api/user/upload-payment-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'sec-ch-ua-platform': '"macOS"',
          'Referer': 'https://www.glazia.in/',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(payload),
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Payment proof uploaded successfully:', result);

        // Refresh order data
        const updatedOrder = await DataService.getOrderById(orderId);
        if (updatedOrder) {
          setOrder(updatedOrder);
        }

        // Close modal and show success
        setShowUploadModal(false);
        alert('Payment proof uploaded successfully! It will be reviewed by our team.');
      } else {
        const errorData = await response.json();
        console.error('❌ Upload failed:', errorData);
        alert('Failed to upload payment proof. Please try again.');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('An error occurred while uploading. Please try again.');
    } finally {
      setUploadingProof(false);
      setUploadProgress(0);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setCurrentPaymentCycle(null);
    setUploadProgress(0);
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const orderData = await DataService.getOrderById(orderId);
        console.log(orderData, 'orderData');
        if (orderData) {
          setOrder(orderData);
        } else {
          setError('Order not found');
        }
      } catch (error) {
        console.error('Error loading order details:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-[#124657]" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-[120px]">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-[120px]">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || 'Order not found'}
              </h3>
              <p className="text-gray-600 mb-6">
                The order you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Link
                href="/account/orders"
                className="bg-[#124657] hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div>

        <div className="bg-[#D6DADE]">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
                <Link
                  href="/account/orders"
                  className="flex items-center text-[#124657] hover:text-[#EE1C25]"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Orders
                </Link>
                <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-[500] text-gray-900">Order Details</h1>
                  <p className="text-gray-600">Order #{order._id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusIcon(getOrderStatus(order))}
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getOrderStatus(order))}`}>
                  {getOrderStatusText(order)}
                </span>
              </div>
            </div>
          </div>
        </div>


        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-start sm:items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start sm:items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                      </div>
                    </div>
                    <div className="flex items-start sm:items-center space-x-3">
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Type</p>
                        <p className="font-medium text-gray-900">{order.deliveryType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order?.products?.map((product, index) => (
                      <div key={product._id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-start sm:items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{product.description}</h3>
                            <p className="text-sm text-gray-600">Product ID: {product.productId}</p>
                            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                            <p className="text-sm text-gray-600">Brand: Glazia</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-gray-900">₹{product.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">₹{(product.amount / product.quantity).toFixed(2)} per unit</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-medium text-gray-900">{order?.user?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">City</p>
                        <p className="font-medium text-gray-900">{order?.user?.city}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone Number</p>
                        <p className="font-medium text-gray-900">{order?.user?.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Delivery Type</p>
                        <p className="font-medium text-gray-900">{order.deliveryType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {order?.payments?.map((payment, index) => (
                      <div key={payment._id} className="border rounded-lg p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                          <span className="font-medium text-gray-900">Payment Cycle {payment.cycle}</span>
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">₹{payment.amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payment.isApproved
                                ? 'bg-green-100 text-green-800'
                                : payment.proofAdded
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.isApproved ? 'Approved' : payment.proofAdded ? 'Proof Submitted' : 'Pending'}
                            </span>
                            {payment.proofAdded && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Proof Added
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Proof Button for Next Payment */}
                    {(() => {
                      const nextPayment = getNextPaymentCycle(order?.payments);
                      if (nextPayment) {
                        return (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                            <h3 className="font-medium text-gray-900 mb-2">
                              Payment Cycle {nextPayment.cycle} - Proof Required
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Amount: ₹{nextPayment.amount.toLocaleString()}
                            </p>
                            <button
                              onClick={() => handleUploadProofClick(nextPayment)}
                              disabled={uploadingProof}
                              className="inline-flex items-center px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto justify-center"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {uploadingProof ? 'Uploading...' : 'Upload Payment Proof'}
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  {getOrderStatus(order) === 'shipped' && (
                    <button className="w-full flex items-center justify-center space-x-2 bg-[#124657] hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                      <Truck className="w-4 h-4" />
                      <span>Track Order</span>
                    </button>
                  )}

                  <button className="w-full flex items-center justify-center space-x-2 border border-[#124657] text-[#124657] hover:bg-blue-50 px-4 py-3 rounded-lg font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Download Invoice</span>
                  </button>

                  {order?.isComplete && (
                    <button className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors">
                      <Package className="w-4 h-4" />
                      <span>Reorder Items</span>
                    </button>
                  )}

                  <Link
                    href="/contact"
                    className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Support</span>
                  </Link>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Timeline</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Order Placed</p>
                        <p className="text-sm text-gray-600">{formatDate(order?.createdAt)}</p>
                      </div>
                    </div>

                    {getOrderStatus(order) !== 'pending' && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getOrderStatus(order) === 'processing' || getOrderStatus(order) === 'shipped' || getOrderStatus(order) === 'delivered'
                              ? 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            <Clock className={`w-4 h-4 ${
                              getOrderStatus(order) === 'processing' || getOrderStatus(order) === 'shipped' || getOrderStatus(order) === 'delivered'
                                ? 'text-blue-600'
                                : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Payment Processing</p>
                          <p className="text-sm text-gray-600">Payment verification in progress</p>
                        </div>
                      </div>
                    )}

                    {(getOrderStatus(order) === 'shipped' || getOrderStatus(order) === 'delivered') && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Truck className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Shipped</p>
                          <p className="text-sm text-gray-600">Your order is on the way</p>
                        </div>
                      </div>
                    )}

                    {getOrderStatus(order) === 'delivered' && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order Delivered</p>
                          <p className="text-sm text-gray-600">Your order has been delivered</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Proof Upload Modal */}
      {showUploadModal && currentPaymentCycle && (
      <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Payment Proof
              </h3>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Payment Cycle {currentPaymentCycle.cycle} - ₹{currentPaymentCycle.amount.toLocaleString()}
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="proof-upload"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="proof-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload payment proof
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF or PDF up to 5MB
                    </p>
                  </div>
                </label>
              </div>

              {/* Selected File Display */}
              {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img 
                        src={selectedFile} 
                        alt="Payment proof" 
                        className="max-w-full h-32 object-contain mx-auto rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {uploadingProof && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uploading...</span>
                    <span className="text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#124657] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              onClick={closeUploadModal}
              disabled={uploadingProof}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadProof}
              disabled={!selectedFile || uploadingProof}
              className="px-4 py-2 text-sm font-medium text-white bg-[#124657] rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadingProof ? 'Uploading...' : 'Upload Proof'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
