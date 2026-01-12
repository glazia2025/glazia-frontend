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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
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
    <>
    <div className="fixed h-24 top-0 left-0 w-full bg-white z-[10000]">
      <div className="bg-[#E6E9EB] px-12 py-4 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-between items-center gap-12">
          <Image width={150} height={150} src="/Logo.svg" alt="Glazia Logo" />
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
              href="/categories/aluminium-profiles"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Aluminium Profiles
            </Link>
            <Link
              href="/categories/hardware"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Hardware
            </Link>
            <Link
              href="/categories/railings"
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              Railings
            </Link>
          </div>
          </div>
          <Link className="nav-link" href="/about">About Us</Link>
          <Link className="nav-link" href="/contact">Contact</Link>
          {isAuthenticated && <Link className="nav-link" href="/quotations">Quotations</Link>}
        </div>

        <div>
          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 bg-[#EE1C25] text-white rounded-lg flex items-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
          {isAuthenticated && (
            <div className="flex flex-row justify-between items-center gap-8">
              <Link href="tel:+919958053708">
                <Image width={20} height={20} src="/call.svg" alt="Call Logo" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2"
                >
                  <Image width={20} height={20} src="/user.svg" alt="User Logo" />
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div
                  ref={dropdownRef}
                  className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg ${isUserDropdownOpen ? 'block' : 'hidden'
                    }`}
                >
                  <Link
                    href="/account/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <div
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </div>
                </div>
              </div>
              <div className="relative" onClick={toggleCart}>
                <Image width={20} height={20} src="/cart.svg" alt="Cart Logo" />
                {cart.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[12px] rounded-full w-4 h-4 flex items-center justify-center">
                      {cart.itemCount}
                    </span>
                  )}
              </div>
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
    </div>
    <div style={{alignItems: 'center'}} className="bg-white px-[140px] py-[24px] mt-20 flex gap-12 flex-row items-center justify-center">
      <Link className="text-center" href="/categories/aluminium-profiles" hrefLang="">
        <Image className="shadow-md hover:shadow-xl transition-all duration-300 hover-primary-border" width={120} height={120} src="/new-ui/alpr.svg" alt="Aluminium Profiles" />
        <div>Aluminium Profiles</div>
      </Link>
      <Link className="text-center" href="/categories/hardware" hrefLang="">
        <Image className="shadow-md hover:shadow-xl transition-all duration-300 hover-primary-border" width={120} height={120} src="/new-ui/hardware.svg" alt="Aluminium Profiles" />
        <div>Hardware</div>
      </Link>
      <Link className="text-center" href="/categories/railings" hrefLang="">
        <Image className="shadow-md hover:shadow-xl transition-all duration-300 hover-primary-border" width={120} height={120} src="/new-ui/railing.svg" alt="Aluminium Profiles" />
        <div>Railings</div>
      </Link>

      <div className="border-[#B2B2B2] border-[1px] flex items-center rounded-[24px]">
        <input
          type="text"
          placeholder="Find the product you need"
          className="w-[35vw] px-4 py-2 border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-[#B2B2B2] text-[16px]"
        />
        <button className="bg-[#2F3A4F] rounded-full px-4 py-2 text-white">Search</button>
      </div>

    </div>
    </>
  );
}
