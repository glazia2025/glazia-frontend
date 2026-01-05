"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Phone, LogOut, ChevronDown, LayoutDashboard, Dock } from "lucide-react";
import { useCartState, useAuth } from "@/contexts/AppContext";
import NalcoPriceDisplay from "./NalcoPriceDisplay";
import NalcoGraphModal from "./NalcoGraphModal";
import LoginModal from "./LoginModal";
import PhoneTrackModal from "./PhoneTrackModal";

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNalcoModalOpen, setIsNalcoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const { cart, toggleCart } = useCartState();
  const { isAuthenticated, clearUser } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
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
      <div className="bg-[#E6E9EB] px-12 py-4 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-between items-center gap-12">
          <Image width={200} height={200} src="/Logo.svg" alt="Glazia Logo" />
          <Link className="nav-link" href="/">Home</Link>
          <div className="relative">
            <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2"
          >
            <span>Products</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div
            ref={dropdownRef}
            className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg ${isDropdownOpen ? 'block' : 'hidden'
              }`}
          >
            <Link
              href="/account/dashboard"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Aluminium Profiles
            </Link>
            <Link
              href="/account/orders"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Hardware
            </Link>
            <Link
              href="/account/orders"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Railings
            </Link>
          </div>
          </div>
          <Link className="nav-link" href="/">About Us</Link>
          <Link className="nav-link" href="/">Contact</Link>
          <Link className="nav-link" href="/">Blogs</Link>
        </div>

        <div>
          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-[#0f3a4a] flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
          {isAuthenticated && (
            <div className="flex flex-row justify-between items-center gap-8">
              <Image width={20} height={20} src="/call.svg" alt="Call Logo" />
              <Image width={20} height={20} src="/user.svg" alt="User Logo" />
              <Image width={20} height={20} src="/cart.svg" alt="Cart Logo" />
              <NalcoPriceDisplay onClick={() => setIsNalcoModalOpen(true)} />
            </div>
          )}
        </div>
        

      </div>


      {/* NALCO Graph Modal */}
      <NalcoGraphModal
        isOpen={isNalcoModalOpen}
        onClose={() => setIsNalcoModalOpen(false)}
      />

      <PhoneTrackModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={() => setIsNalcoModalOpen(true)}
        reason="view_nalco_graph"
        title="View NALCO graph"
        description="Please share your phone number to view the NALCO graph."
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
}
