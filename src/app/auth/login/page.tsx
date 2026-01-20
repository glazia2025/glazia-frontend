'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowLeft, Shield, Clock } from 'lucide-react';
import axios from 'axios';
import UserRegistrationForm from '@/components/UserRegistrationForm';
import { API_BASE_URL } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');




  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to send OTP
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { phoneNumber });
      setStep('otp');
      setCountdown(30);
      startCountdown();
    } catch (err) {
      console.log("error", error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };


  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, { phoneNumber, otp: otpValue });
      const { userExists, token, existingUser } = response.data;

      console.log('🔐 Verify OTP Response:', response.data);

      if (!userExists) {
        // If user doesn't exist, show the registration form
        setStep('register');
      } else if (userExists && existingUser) {
        // Store token
        localStorage.setItem("authToken", token);

        // Transform and store user data from existingUser
        const userData = {
          id: existingUser._id || existingUser.id,
          name: existingUser.userName || existingUser.name,
          email: existingUser.email || '',
          phone: existingUser.phoneNumber || phoneNumber,
          company: existingUser.company || '',
          gstNumber: existingUser.gstNumber || '',
          pincode: existingUser.pincode || '',
          city: existingUser.city || '',
          state: existingUser.state || '',
          completeAddress: existingUser.address || '',
          memberSince: existingUser.createdAt,
          totalOrders: existingUser.totalOrders || 0,
          totalSpent: existingUser.totalSpent || 0,
          loyaltyPoints: existingUser.loyaltyPoints || 0,
          paUrl: existingUser.paUrl || '',
          isAuthenticated: true,
          dynamicPricing: existingUser.dynamicPricing
        };

        console.log('👤 Transformed User Data:', userData);

        // Store user data in localStorage
        localStorage.setItem('glazia-user', JSON.stringify(userData));

        // Redirect to dashboard
        window.location.href="/";
      }
    } catch (err) {
      console.error('❌ OTP Verification Error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(30);
      startCountdown();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/" className="flex items-center text-[#124657} hover:text-blue-700 mb-8">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {step === 'phone' && 'Sign in to your account'}
              {step === 'otp' && 'Verify your mobile number'}
              {step === 'register' && 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'phone' && 'Enter your mobile number to receive an OTP'}
              {step === 'otp' && `We've sent a 6-digit code to +91 ${phoneNumber}`}
              {step === 'register' && 'Complete your profile to get started'}
            </p>
          </div>
        </div>

        {step === 'phone' && (
          <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter 10-digit mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                We&apos;ll send you a verification code via SMS
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || phoneNumber.length !== 10}
                className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                style={{ backgroundColor: '#124657' }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-[#124657} hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[#124657} hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && index > 0) {
                        const prevInput = document.getElementById(`otp-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                style={{ backgroundColor: '#124657' }}
              >
                <Shield className="w-5 h-5 mr-2" />
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Resend OTP in {countdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-sm text-[#124657} hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-sm text-gray-600 hover:underline"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}

        {step === 'register' && (
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-[#124657} mr-2" />
                <p className="text-sm text-blue-800">
                  Mobile number +91 {phoneNumber} is verified. Please complete your registration.
                </p>
              </div>
            </div>

            <UserRegistrationForm phoneNumber={phoneNumber} />
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              Secure Login
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              OTP Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
