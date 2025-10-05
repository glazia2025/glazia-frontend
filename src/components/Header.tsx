"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, ShoppingCart, User, Phone, Settings, LogOut, ChevronDown } from "lucide-react";
import { useCartState, useAuth } from "@/contexts/AppContext";
import NalcoPriceDisplay from "./NalcoPriceDisplay";
import NalcoGraphModal from "./NalcoGraphModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNalcoModalOpen, setIsNalcoModalOpen] = useState(false);
  const { cart, toggleCart } = useCartState();
  const { isAuthenticated, clearUser } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Authentication is now managed by AppContext, no need for local state

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearUser();
    setIsDropdownOpen(false);
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-[#124657] text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              +91 98765 43210
            </span>
            <span className="hidden md:block">Free Shipping on Windoors Orders Above ₹10000</span>
          </div>
          <div className="flex items-center space-x-4">
            <NalcoPriceDisplay
              onClick={() => setIsNalcoModalOpen(true)}
              className="hidden sm:flex"
            />
            <Link href="/track-order" className="hover:underline">Track Order</Link>
            <Link href="/support" className="hover:underline">Support</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-bold text-[#124657}">
              GLAZIA
            </div>
          </Link>



          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/account/dashboard" className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-[#124657}">
                  <span>Dashboard</span>
                </Link>


                {/* User Avatar Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-[#124657} focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-[#124657} rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        href="/account/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden md:flex items-center space-x-1 text-gray-700 hover:text-[#124657}">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>

              </>
            )}

            <button
              onClick={toggleCart}
              className="flex items-center space-x-1 text-gray-700 hover:text-[#124657} relative"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden md:inline">Cart</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>


      </div>

      {/* Navigation Menu */}
      <nav className="border-t" style={{ backgroundColor: '#D2D7DA' }}>
        <div className="container mx-auto px-4">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <ul className="flex flex-col md:flex-row md:space-x-8 py-4">
              <li>
                <Link
                  href="/categories/windoor-profiles"
                  className="block py-2 md:py-0 text-gray-700 font-medium transition-colors hover-primary"
                >
                  Windoor Profiles
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/hardware"
                  className="block py-2 md:py-0 text-gray-700 font-medium transition-colors hover-primary"
                >
                  Hardware
                </Link>
              </li>

              {/* Mobile-only NALCO price display */}
              <li className="md:hidden border-t border-gray-200 pt-2 mt-2">
                <div className="py-2">
                  <NalcoPriceDisplay
                    onClick={() => setIsNalcoModalOpen(true)}
                    className="flex"
                  />
                </div>
              </li>

              {/* Mobile-only authentication links */}
              {isAuthenticated ? (
                <>
                  <li className="md:hidden border-t border-gray-200 pt-2 mt-2">
                    <Link
                      href="/account/dashboard"
                      className="block py-2 text-gray-700 font-medium transition-colors hover-primary"
                    >
                      Dashboard
                    </Link>
                  </li>

                  <li className="md:hidden">
                    <Link
                      href="/account/settings"
                      className="block py-2 text-gray-700 font-medium transition-colors hover-primary"
                    >
                      Settings
                    </Link>
                  </li>
                  <li className="md:hidden">
                    <button
                      onClick={handleLogout}
                      className="block py-2 text-gray-700 font-medium w-full text-left transition-colors hover-primary"
                    >
                      Log out
                    </button>
                  </li>
                </>
              ) : (
                <li className="md:hidden border-t border-gray-200 pt-2 mt-2">
                  <Link href="/auth/login" className="block py-2 text-gray-700 hover:text-[#124657} font-medium">Login</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* NALCO Graph Modal */}
      <NalcoGraphModal
        isOpen={isNalcoModalOpen}
        onClose={() => setIsNalcoModalOpen(false)}
      />
    </header>
  );
}
