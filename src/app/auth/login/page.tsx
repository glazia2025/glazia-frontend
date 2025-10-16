'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowLeft, Shield, Clock, User, Mail, MapPin, Building, FileText, Download } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Registration form fields
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');


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
      const response = await axios.post("https://api.glazia.in/api/auth/send-otp", { phoneNumber });
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
      const response = await axios.post("https://api.glazia.in/api/auth/verify-otp", { phoneNumber, otp: otpValue });
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
          completeAddress: existingUser.completeAddress || '',
          memberSince: existingUser.createdAt ? new Date(existingUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
          totalOrders: existingUser.totalOrders || 0,
          totalSpent: existingUser.totalSpent || 0,
          loyaltyPoints: existingUser.loyaltyPoints || 0,
          isAuthenticated: true
        };

        console.log('👤 Transformed User Data:', userData);

        // Store user data in localStorage
        localStorage.setItem('glazia-user', JSON.stringify(userData));

        // Redirect to dashboard
        router.push("/account/dashboard");
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

  const generatePartnerAgreement = async () => {
    const agreementContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">GLAZIA</h1>
          <h2 style="color: #374151; font-size: 24px; margin-bottom: 20px;">PARTNER AGREEMENT</h2>
          <p style="color: #6b7280; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Partner Information</h3>
          <table style="width: 100%; margin-top: 15px;">
            <tr><td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td><td style="padding: 8px 0;">${userName}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">+91 ${phoneNumber}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">GST Number:</td><td style="padding: 8px 0;">${gstNumber}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Address:</td><td style="padding: 8px 0;">${completeAddress}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">City:</td><td style="padding: 8px 0;">${city}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">State:</td><td style="padding: 8px 0;">${state}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Pincode:</td><td style="padding: 8px 0;">${pincode}</td></tr>
          </table>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">Terms and Conditions</h3>
          <div style="margin-top: 15px; line-height: 1.6; color: #374151;">
            <p><strong>1. Partnership Scope:</strong> This agreement establishes a business partnership between Glazia and the above-mentioned partner for the distribution and sale of aluminium profiles and hardware solutions.</p>

            <p><strong>2. Product Range:</strong> Partner is authorized to sell Glazia's complete range of:</p>
            <ul style="margin-left: 20px;">
              <li>UPVC Window and Door Profiles</li>
              <li>Aluminum Window and Door Profiles</li>
              <li>Composite Profile Systems</li>
              <li>Window and Door Hardware</li>
              <li>Thermal Break Systems</li>
            </ul>

            <p><strong>3. Quality Assurance:</strong> All products supplied under this agreement meet international standards and are certified for performance and safety.</p>

            <p><strong>4. Support:</strong> Glazia provides technical support, training, and marketing assistance to ensure partner success.</p>

            <p><strong>5. Territory:</strong> Partner's operational territory is defined as ${city}, ${state} and surrounding areas as mutually agreed.</p>

            <p><strong>6. Payment Terms:</strong> Payment terms and credit facilities will be established based on business volume and creditworthiness assessment.</p>

            <p><strong>7. Validity:</strong> This agreement is valid from the date of signing and remains in effect until terminated by either party with 30 days written notice.</p>
          </div>
        </div>

        <div style="margin-top: 50px;">
          <div style="display: flex; justify-content: space-between;">
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #374151; padding-top: 10px; margin-top: 50px;">
                <p style="margin: 0; font-weight: bold;">Partner Signature</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">${userName}</p>
              </div>
            </div>
            <div style="text-align: center; width: 45%;">
              <div style="border-top: 1px solid #374151; padding-top: 10px; margin-top: 50px;">
                <p style="margin: 0; font-weight: bold;">Glazia Representative</p>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>GLAZIA - Premium Aluminium Profiles & Hardware Solutions</p>
          <p>456 Aluminium Plaza, Industrial Estate Phase-II, Pune, Maharashtra 411019</p>
          <p>Phone: +91 98765 43210 | Email: info@glazia.in | Website: www.glazia.in</p>
        </div>
      </div>
    `;

    const opt = {
      margin: 1,
      filename: `Glazia_Partner_Agreement_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    // Dynamically import html2pdf to avoid SSR issues
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(agreementContent).save();
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!userName || !email || !pincode || !city || !state || !completeAddress) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate pincode
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode)) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setIsLoading(true);

    try {
      // Submit registration data
      const registrationData = {
        phoneNumber,
        userName,
        email,
        gstNumber,
        pincode,
        city,
        state,
        completeAddress
      };

      const response = await axios.post("https://api.glazia.in/api/auth/register", registrationData);

      if (response.data.success) {
        // Generate and download partner agreement
        await generatePartnerAgreement();

        // Store token and redirect
        localStorage.setItem("authToken", response.data.token);

        // Show success message and redirect after a delay
        alert('Registration successful! Partner agreement has been downloaded. Redirecting to dashboard...');
        setTimeout(() => {
          router.push("/account/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
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

            <form className="space-y-6" onSubmit={handleRegistrationSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="userName"
                      name="userName"
                      type="text"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your full name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="gstNumber"
                    name="gstNumber"
                    type="text"
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter GST number (if applicable)"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="completeAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Complete Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="completeAddress"
                    name="completeAddress"
                    required
                    rows={3}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your complete business address"
                    value={completeAddress}
                    onChange={(e) => setCompleteAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="6-digit pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
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
                  disabled={isLoading}
                  className="w-full text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
                  style={{ backgroundColor: '#124657' }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isLoading ? 'Creating Account...' : 'Complete Registration & Download Agreement'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Try different mobile number
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Upon successful registration, a partner agreement document will be automatically generated and downloaded. This document contains the terms and conditions of your partnership with Glazia.
                </p>
              </div>
            </form>
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
