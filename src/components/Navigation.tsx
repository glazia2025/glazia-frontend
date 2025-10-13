"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AppContext";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, clearUser } = useAuth();

  const handleLogout = () => {
    clearUser();
    setIsMenuOpen(false);
    window.location.href = '/';
  };

  return (
    <nav className="border-t" style={{ backgroundColor: '#D2D7DA' }}>
      <div className="container mx-auto px-4">
        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-between items-center py-4">
          <span className="text-gray-700 font-medium">Menu</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-[#124657] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          <ul className="flex flex-col md:flex-row md:space-x-8 py-4">
            <li>
              <Link
                href="/categories/aluminium-profiles"
                className="block py-2 md:py-0 text-gray-700 font-medium transition-colors hover-primary"
                onClick={() => setIsMenuOpen(false)}
                style={{ color: window.location.href.includes('aluminium-profiles') ? '#117b23ff' : 'inherit' }}
              >
                Aluminium Profiles
              </Link>
            </li>
            <li>
              <Link
                href="/categories/hardware"
                className="block py-2 md:py-0 text-gray-700 font-medium transition-colors hover-primary"
                onClick={() => setIsMenuOpen(false)}
                style={{ color: window.location.href.includes('hardware') ? '#117b23ff' : 'inherit' }}
              >
                Hardware
              </Link>
            </li>

            {/* Mobile-only authentication links */}
            {isAuthenticated ? (
              <>
                <li className="md:hidden border-t border-gray-200 pt-2 mt-2">
                  <Link
                    href="/account/dashboard"
                    className="block py-2 text-gray-700 font-medium transition-colors hover-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="md:hidden">
                  <Link
                    href="/account/settings"
                    className="block py-2 text-gray-700 font-medium transition-colors hover-primary"
                    onClick={() => setIsMenuOpen(false)}
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
                <Link 
                  href="/auth/login" 
                  className="block py-2 text-gray-700 hover:text-[#124657] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
