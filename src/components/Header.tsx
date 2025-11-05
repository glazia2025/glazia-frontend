"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Phone, LogOut, ChevronDown } from "lucide-react";
import { useCartState, useAuth } from "@/contexts/AppContext";
import NalcoPriceDisplay from "./NalcoPriceDisplay";
import NalcoGraphModal from "./NalcoGraphModal";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNalcoModalOpen, setIsNalcoModalOpen] = useState(false);
  const { cart, toggleCart } = useCartState();
  const { isAuthenticated, clearUser } = useAuth();
  const router = useRouter();
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
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-[10000]">
      {/* Top Bar */}
      <div className="bg-[#124657] text-white py-1">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <Link href="tel:+919876543210" className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              +91 9958053708
            </Link>
          </div>
          <div className="hidden md:block">Free Shipping on Aluminium Orders Above ₹1000000*</div>
          <div className="flex items-center space-x-4">
            <NalcoPriceDisplay
              onClick={() => setIsNalcoModalOpen(true)}
              className="block"
            />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4 bg-white">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl flex gap-2 font-bold text-[#124657}" style={{alignItems: 'center'}}>
              <img src="/logo_n.png" alt="Glazia Logo" className="w-10" />
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
          </div>
        </div>


      </div>



      {/* NALCO Graph Modal */}
      <NalcoGraphModal
        isOpen={isNalcoModalOpen}
        onClose={() => setIsNalcoModalOpen(false)}
      />
    </header>
  );
}
