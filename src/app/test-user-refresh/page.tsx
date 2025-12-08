'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useUserDataRefresh } from '@/hooks/useUserDataRefresh';
import Link from 'next/link';

export default function TestUserRefreshPage() {
  const { state } = useApp();
  const { refreshUserData, getCurrentUserData } = useUserDataRefresh();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [refreshStatus, setRefreshStatus] = useState<string>('');

  // Function to read current localStorage data
  const readLocalStorageData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('glazia-user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setLocalStorageData(parsed);
          setLastRefresh(new Date().toLocaleTimeString());
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          setLocalStorageData(null);
        }
      } else {
        setLocalStorageData(null);
      }
    }
  };

  // Read localStorage data on component mount and set up interval
  useEffect(() => {
    readLocalStorageData();
    
    // Set up interval to check for changes every 2 seconds
    const interval = setInterval(readLocalStorageData, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Function to simulate login (for testing)
  const simulateLogin = () => {
    const mockToken = 'test-token-' + Date.now();
    const mockUserData = {
      id: 'test-user-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+91 9876543210',
      company: 'Test Company',
      gstNumber: 'TEST123456789',
      pincode: '110001',
      city: 'Delhi',
      state: 'Delhi',
      completeAddress: 'Test Address, Delhi',
      memberSince: 'December 2024',
      totalOrders: 5,
      totalSpent: 50000,
      loyaltyPoints: 100,
      paUrl: '',
      isAuthenticated: true,
      dynamicPricing: {
        default: 30,
        premium: 25
      }
    };

    localStorage.setItem('authToken', mockToken);
    localStorage.setItem('glazia-user', JSON.stringify(mockUserData));
    readLocalStorageData();
  };

  // Function to simulate logout (for testing)
  const simulateLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('glazia-user');
    readLocalStorageData();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            User Data Refresh Test Page
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page demonstrates the automatic user data refresh functionality. 
              The UserDataRefresher component will automatically fetch fresh user data 
              from the API whenever you navigate to a different route or refresh the page.
            </p>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={simulateLogin}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Simulate Login
              </button>
              <button
                onClick={simulateLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Simulate Logout
              </button>
              <button
                onClick={readLocalStorageData}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Refresh Data
              </button>
              <button
                onClick={async () => {
                  setRefreshStatus('Refreshing...');
                  const result = await refreshUserData();
                  setRefreshStatus(result.success ? 'Success!' : `Error: ${result.error}`);
                  readLocalStorageData();
                  setTimeout(() => setRefreshStatus(''), 3000);
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Manual API Refresh
              </button>
            </div>

            {refreshStatus && (
              <div className={`p-2 rounded mb-4 ${
                refreshStatus.includes('Error') ? 'bg-red-100 text-red-700' :
                refreshStatus === 'Refreshing...' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {refreshStatus}
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <Link href="/" className="text-blue-500 hover:underline">
                Go to Home (test route change)
              </Link>
              <Link href="/categories" className="text-blue-500 hover:underline">
                Go to Categories (test route change)
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="text-purple-500 hover:underline"
              >
                Refresh Page (test page refresh)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Context State */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Context State</h2>
              <div className="text-sm">
                <p><strong>Authenticated:</strong> {state.isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>User Name:</strong> {state.user?.name || 'N/A'}</p>
                <p><strong>User Email:</strong> {state.user?.email || 'N/A'}</p>
                <p><strong>User Phone:</strong> {state.user?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* localStorage Data */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">
                localStorage Data 
                {lastRefresh && <span className="text-sm text-gray-500">(Last checked: {lastRefresh})</span>}
              </h2>
              {localStorageData ? (
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {localStorageData.id}</p>
                  <p><strong>Name:</strong> {localStorageData.name}</p>
                  <p><strong>Email:</strong> {localStorageData.email}</p>
                  <p><strong>Phone:</strong> {localStorageData.phone}</p>
                  <p><strong>Company:</strong> {localStorageData.company}</p>
                  <p><strong>City:</strong> {localStorageData.city}</p>
                  <p><strong>Total Orders:</strong> {localStorageData.totalOrders}</p>
                  <p><strong>Total Spent:</strong> ₹{localStorageData.totalSpent}</p>
                </div>
              ) : (
                <p className="text-gray-500">No user data in localStorage</p>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1">
              <li>Click "Simulate Login" to create test user data</li>
              <li>Navigate to different pages using the links above</li>
              <li>Check browser console for refresh logs</li>
              <li>Refresh the page to see the refresh on page load</li>
              <li>Open browser dev tools → Application → Local Storage to see data updates</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
