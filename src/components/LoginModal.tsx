'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, Shield, Clock, X, Sparkles, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import UserRegistrationForm from '@/components/UserRegistrationForm';
import Image from 'next/image';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setPhoneNumber('');
      setOtp(['', '', '', '', '', '']);
      setError('');
      setCountdown(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsLoading(true);
    try {
      await axios.post("https://api.glazia.in/api/auth/send-otp", { phoneNumber });
      setStep('otp');
      setCountdown(30);
      startCountdown();
    } catch (err) {
      console.error("Error sending OTP:", err);
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
    if (value && index < 5) {
      document.getElementById(`modal-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`modal-otp-${index - 1}`)?.focus();
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
      if (!userExists) {
        setStep('register');
      } else if (userExists && existingUser) {
        localStorage.setItem("authToken", token);
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
        localStorage.setItem('glazia-user', JSON.stringify(userData));
        onSuccess?.();
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post("https://api.glazia.in/api/auth/send-otp", { phoneNumber });
      setCountdown(30);
      startCountdown();
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    onSuccess?.();
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative z-10 w-full h-[85vh] mx-0 max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl md:w-[70vw] md:h-[80vh] md:mx-4 md:rounded-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10">
          <X className="w-5 h-5" />
        </button>
        {step === 'phone' && (
            <div className="relative md:h-full">
              <div className='hidden md:block bg-[#2F3A4F] absolute rotate-[292deg] left-[-40vw] w-[100vw] h-[46vw] top-0 z-1000' />
              <div style={{transform: 'translateY(-50%)'}} className='hidden md:block absolute text-white left-[4%] top-[50%] z-10001'>
                <div className='text-[32px]'>Welcome To</div>
                <div className='text-[68px] font-[500] mb-6'>Glazia</div>
                <div className='text-[18px]'>Sign in to access exclusive<br />pricing and features</div>
              </div>
            <form onSubmit={handlePhoneSubmit} className="w-full p-6 pt-12 z-10002 space-y-6 md:w-[40%] md:absolute md:right-[4%] md:top-[50%] md:translate-y-[-50%] md:p-8">
              <div className="flex flex-col items-center gap-4">
                <Image width={100} height={100} src="/new-ui/logo-sm.svg" alt="Glazia Logo" />
                <div className='text-[#2F3A4F] text-[30px] font-[600]'>Sign In</div>
              </div>
              <div>
                <label htmlFor="modal-phone" className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">+91</span>
                  </div>
                  <input id="modal-phone" type="tel" required className="w-full pl-14 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#124657] focus:border-transparent text-lg transition-all" placeholder="Enter 10-digit number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} autoFocus />
                  {phoneNumber.length === 10 && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" />We&apos;ll send you a verification code via Whatsapp</p>
              </div>
              {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <button type="submit" disabled={isLoading || phoneNumber.length !== 10} className="w-full bg-[#EE1C25] hover:bg-[#EE1C25] disabled:bg-[#EE1C25] disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#124657]/20">
                {isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</>) : (<><Phone className="w-5 h-5" />Send OTP</>)}
              </button>
              <p className="text-center text-xs text-gray-500">By continuing, you agree to our <a href="/terms" className="text-[#124657] hover:underline">Terms</a> and <a href="/privacy" className="text-[#124657] hover:underline">Privacy Policy</a></p>
            </form>
            </div>
          )}

        {step === 'otp' && (
            <div className="relative md:h-full">
              <div className='hidden md:block bg-[#2F3A4F] absolute rotate-[292deg] left-[-40vw] w-[100vw] h-[46vw] top-0 z-1000' />
              <div style={{transform: 'translateY(-50%)'}} className='hidden md:block absolute text-white left-[4%] top-[50%] z-10001'>
                <div className='text-[32px]'>Welcome To</div>
                <div className='text-[68px] font-[500] mb-6'>Glazia</div>
                <div className='text-[18px]'>Sign in to access exclusive<br />pricing and features</div>
              </div>
            <form onSubmit={handleOtpSubmit} className="w-full p-6 pt-12 z-10002 space-y-6 md:w-[40%] md:absolute md:right-[4%] md:top-[50%] md:translate-y-[-50%] md:p-8">
              <div className="flex flex-col items-center gap-4">
                <Image width={100} height={100} src="/new-ui/logo-sm.svg" alt="Glazia Logo" />
                <div className='text-[#2F3A4F] text-[30px] font-[600]'>Sign In</div>
              </div>
              <div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4 text-center">Enter the 6-digit code</label>
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input key={index} id={`modal-otp-${index}`} type="text" inputMode="numeric" maxLength={1} className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#124657] focus:border-transparent transition-all" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} autoFocus={index === 0} />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2"><Clock className="w-4 h-4" />Resend code in {countdown}s</p>
                  ) : (
                    <button type="button" onClick={resendOtp} disabled={isLoading} className="text-sm text-[#EE1C25] hover:underline font-medium">Resend OTP</button>
                  )}
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}
              <button type="submit" disabled={isLoading || otp.join('').length !== 6} className="w-full bg-[#EE1C25] hover:bg-[#EE1C25] disabled:bg-[#EE1C25] disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#124657]/20">
                {isLoading ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>) : (<><Shield className="w-5 h-5" />Verify OTP</>)}
              </button>
              <button type="button" onClick={() => setStep('phone')} className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2">← Change phone number</button>
            </form>
            </div>
          )}
        
        <div className="p-6 md:p-8">
          {step === 'register' && (
            <div className="max-h-[70vh] overflow-y-auto -mx-6 px-6 md:max-h-[60vh] md:-mx-8 md:px-8">
              <UserRegistrationForm phoneNumber={phoneNumber} onSuccess={handleRegistrationSuccess} isModal={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
