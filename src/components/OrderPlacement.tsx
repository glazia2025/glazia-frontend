'use client';

import React, { useState, useRef } from 'react';
import { QrCode, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useCartState, useAuth } from '@/contexts/AppContext';
import { generateGlaziaPaymentQR, formatAmount } from '@/utils/qrCodeGenerator';

interface OrderPlacementProps {
  onOrderSuccess: () => void;
  onCancel: () => void;
}

const OrderPlacement: React.FC<OrderPlacementProps> = ({ onOrderSuccess, onCancel }) => {
  const { cart, clearCart } = useCartState();
  const { user } = useAuth();
  const [step, setStep] = useState<'qr' | 'upload' | 'processing' | 'success'>('qr');
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shipping discount calculation based on order value slabs
  const calculateShippingDiscount = (orderValue: number) => {
    if (orderValue >= 2000000) {
      return 20000; // 20L+ gets 20,000 off
    } else if (orderValue >= 1000000) {
      return 10000; // 10L-19.99L gets 10,000 off
    } else if (orderValue >= 500000) {
      return 5000; // 5L-9.99L gets 5,000 off
    } else if (orderValue >= 1) {
      return 2500; // 1-4.99L gets 2,500 off
    }
    return 0;
  };

  // Calculate totals
  const subtotal = cart.total;
  const shippingDiscount = calculateShippingDiscount(cart.total);
  const tax = Math.round(cart.total * 0.18);
  const finalTotal = cart.total + tax; // Keep product total separate from shipping discount

  // Generate QR Code for payment
  const qrCodeDataURL = generateGlaziaPaymentQR(finalTotal, `GLZ-${Date.now()}`);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      setPaymentProof(base64String);
      setIsUploading(false);
      setStep('upload');
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async () => {
    if (!paymentProof || !user) {
      setError('Payment proof and user information are required');
      return;
    }

    // Validate required user fields
    if (!user.id || !user.name || !user.phone) {
      setError('User information is incomplete. Please update your profile.');
      return;
    }

    setStep('processing');
    setError(null);

    try {
      // Prepare order data according to the API format
      const orderData = {
        user: {
          userId: user.id,
          name: user.name,
          city: user.city || 'Not specified',
          phoneNumber: user.phone
        },
        products: cart.items.map(item => ({
          productId: item.id,
          description: item.name,
          quantity: item.quantity,
          amount: item.price * item.quantity
        })),
        payment: {
          amount: finalTotal,
          proof: paymentProof
        },
        totalAmount: finalTotal,
        deliveryType: "SELF"
      };

      console.log('📦 Order Data:', JSON.stringify(orderData, null, 2));

      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found. Please login again.');
      }

      console.log('🔑 Using auth token:', authToken.substring(0, 20) + '...');

      // Make API call
      const response = await fetch('https://api.glazia.in/api/user/pi-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'sec-ch-ua-platform': '"macOS"',
          'Referer': 'https://www.glazia.in/',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify(orderData)
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Order placed successfully:', result);

      // Clear cart and show success
      clearCart();
      setStep('success');

      // Call success callback after a short delay
      setTimeout(() => {
        onOrderSuccess();
      }, 2000);

    } catch (error) {
      console.error('❌ Error placing order:', error);
      setError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      setStep('upload');
    }
  };

  const renderQRStep = () => (
    <div className="text-center space-y-6">
      {/* UPI Payment Section */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan QR Code to Pay</h3>
          <p className="text-gray-600 mb-4">
            Scan this QR code with any UPI app to pay {formatAmount(finalTotal)}
          </p>

          {/* Actual QR Code */}
          <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center mb-4 p-2">
            <img
              src="/upi.jpeg"
              alt="Payment QR Code"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p><strong>UPI ID:</strong> navdeepkamboj08-3@okhdfcbank</p>
            <p><strong>Amount:</strong> {formatAmount(finalTotal)}</p>
          </div>
        </div>

        {/* Net Banking Details Section */}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Banking Details</h3>
          <div className="text-left space-y-2 max-w-md mx-auto">
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="font-medium text-gray-700">Entity:</span>
              <span className="text-gray-900">Glazia Windoors Pvt Ltd</span>
            </div>
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="font-medium text-gray-700">Bank:</span>
              <span className="text-gray-900">Axis Bank</span>
            </div>
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="font-medium text-gray-700">A/C No:</span>
              <span className="text-gray-900 font-mono">82837539293740</span>
            </div>
            <div className="flex justify-between py-2 border-b border-green-200">
              <span className="font-medium text-gray-700">IFSC:</span>
              <span className="text-gray-900 font-mono">00202030GJSS</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Amount:</span>
              <span className="text-gray-900 font-semibold">{formatAmount(finalTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setStep('upload')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          I've Made the Payment
        </button>
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="w-16 h-16 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Payment Proof</h3>
        <p className="text-gray-600">
          Please upload a screenshot of your payment confirmation
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {paymentProof ? (
          <div className="space-y-4">
            <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">Payment proof uploaded</span>
              </div>
              <img 
                src={paymentProof} 
                alt="Payment proof" 
                className="max-w-full h-32 object-contain mx-auto rounded"
              />
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Place Order
              </button>
              <button
                onClick={() => {
                  setPaymentProof(null);
                  setError(null);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Click to upload payment screenshot</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
          </button>
        )}
      </div>

      <button
        onClick={() => setStep('qr')}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Back to QR Code
      </button>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Order</h3>
        <p className="text-gray-600">Please wait while we confirm your payment and create your order...</p>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Placed Successfully!</h3>
        <p className="text-gray-600">Your order has been confirmed and will be processed shortly.</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({cart.itemCount} items)</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (18% GST)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{finalTotal.toLocaleString()}</span>
          </div>
          {shippingDiscount > 0 && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-green-700 font-medium">Shipping Discount</span>
              <span className="text-green-700 font-medium">₹{shippingDiscount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      {step === 'qr' && renderQRStep()}
      {step === 'upload' && renderUploadStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default OrderPlacement;
