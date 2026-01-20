'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, MapPin, Building, FileText, Download, Briefcase, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import PartnerAgreement from '@/components/PartnerAgreement/PartnerAgreement';
import { supabase } from '@/utils/supabase';
import { API_BASE_URL } from '@/services/api';

interface UserRegistrationFormProps {
  phoneNumber: string;
  onSuccess?: () => void;
  isModal?: boolean;
}

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ phoneNumber, onSuccess }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'details' | 'agreement'>('details');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form fields
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);

  // New fields
  const [authorisedPerson, setAuthorisedPerson] = useState('');
  const [designation, setDesignation] = useState('');




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!userName || !email || !gstNumber || !pincode || !city || !state || !completeAddress || !authorisedPerson || !designation) {
      setError('All fields are required.');
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

    // Validate GST number format (optional - basic validation)
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (gstNumber && !gstRegex.test(gstNumber)) {
      setError('Please enter a valid GST number (e.g., 12ABCDE1234PZ)');
      return;
    }

    if (step === 'details') {
      setStep('agreement');
      return;
    }

    if (step === 'agreement') {
      if (!isAgreed) {
        setError('Please agree to the Partner Agreement to continue');
        return;
      }

      setIsLoading(true);

      try {
        const registrationData = new FormData();
        registrationData.append('name', userName);
        registrationData.append('email', email);
        registrationData.append('gstNumber', gstNumber);
        registrationData.append('city', city);
        registrationData.append('state', state);
        registrationData.append('address', completeAddress);
        registrationData.append('phoneNumber', phoneNumber || '');
        registrationData.append('phoneNumbers', phoneNumber || '');
        registrationData.append('pincode', pincode);
        registrationData.append('authorizedPerson', authorisedPerson);
        registrationData.append('authorizedPersonDesignation', designation);

        if (blob) {
          const fileName = 'partner-agreement.pdf';
          const fileType = blob.type || 'application/pdf';
          const paFile = new File([blob], fileName, { type: fileType });
          registrationData.append('paPdf', paFile);
        }

        const response = await axios.post(`${API_BASE_URL}/api/user/register`, registrationData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          setMessage('User details saved successfully!');

          // Handle success callback for modal or redirect
          if (onSuccess) {
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            // Redirect to dashboard
            setTimeout(() => {
              router.push('/account/dashboard');
            }, 2000);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save details. Please try again.';
        setError(errorMessage);
        console.error('Registration error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 'details' && (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Details</h2>
            <p className="text-gray-600">Complete your business information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Business/Legal Name *
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
                  placeholder="Enter business name"
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
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
              GST Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="gstNumber"
                name="gstNumber"
                type="text"
                required
                className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter GST number"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <label htmlFor="completeAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Complete Business Address *
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
                placeholder="Enter complete business address"
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

          {/* Authorised Person and Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorisedPerson" className="block text-sm font-medium text-gray-700 mb-2">
                Authorised Person *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="authorisedPerson"
                  name="authorisedPerson"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter authorised person name"
                  value={authorisedPerson}
                  onChange={(e) => setAuthorisedPerson(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-2">
                Designation *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark"
            style={{ backgroundColor: '#124657' }}
          >
            {isLoading ? 'Processing...' : 'Continue to Agreement'}
          </button>
        </form>
      )}

      {step === 'agreement' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Partner Agreement</h2>
            <p className="text-gray-600">Review and accept the partnership terms</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><strong>Business Name:</strong> {userName}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Phone:</strong> +91 {phoneNumber}</div>
              <div><strong>GST:</strong> {gstNumber}</div>
              <div><strong>Authorised Person:</strong> {authorisedPerson}</div>
              <div><strong>Designation:</strong> {designation}</div>
              <div><strong>City:</strong> {city}</div>
              <div><strong>State:</strong> {state}</div>
              <div className="md:col-span-2"><strong>Address:</strong> {completeAddress}</div>
            </div>
          </div>

          <PartnerAgreement
            userName={userName}
            completeAddress={completeAddress}
            gstNumber={gstNumber}
            pincode={pincode}
            city={city}
            state={state}
            phoneNumber={phoneNumber}
            email={email}
            setBlob={setBlob}
          />

          <div className="flex items-center space-x-3">
            <input
              id="agreement"
              name="agreement"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <label htmlFor="agreement" className="text-sm text-gray-700">
              I agree to the Partner Agreement terms and conditions
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={isLoading || !isAgreed}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 hover-primary-bg-dark disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#124657' }}
            >
              <Download className="w-5 h-5 mr-2" />
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserRegistrationForm;
