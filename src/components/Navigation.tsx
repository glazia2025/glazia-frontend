"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AppContext";

// Navigation categories data
const navigationCategories = [
  {
    id: 'aluminium-profiles',
    title: 'Aluminium Profiles',
    description: 'High performance system aluminium profiles for windows and doors',
    image: '/profiles.webp',
    href: '/categories/aluminium-profiles',
    color: '#124657'
  },
  {
    id: 'hardware',
    title: 'Hardware',
    description: 'Complete hardware solutions for aluminium fenestration',
    image: '/hardware.jpg',
    href: '/categories/hardware',
    color: '#124657'
  },
  {
    id: 'railings',
    title: 'Railings',
    description: 'Premium aluminum railing systems for architectural applications',
    image: '/railing.jpg',
    href: '/categories/railings',
    color: '#124657'
  }
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, clearUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    clearUser();
    setIsMenuOpen(false);
    router.push('/');
  };

  return (
    <nav className="border-t" style={{ backgroundColor: '#FFF', borderTop: '1px solid #097d13ff' }}>
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

        {/* Navigation Cards */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
          {/* Desktop Card Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 py-8">
            {navigationCategories.map((category) => {
              const isActive = pathname?.includes(category.id);
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-[#00000011] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#124657] transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {category.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center text-[#124657] font-medium text-sm group-hover:text-[#0d3a47] transition-colors">
                      <span>Explore Products</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Active Border */}
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mobile List Layout */}
          <div className="md:hidden">
            <ul className="flex flex-col space-y-4 py-4">
              {navigationCategories.map((category) => {
                const isActive = pathname?.includes(category.id);
                return (
                  <li key={category.id}>
                    <Link
                      href={category.href}
                      className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {/* Mobile Image */}
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>

                      {/* Mobile Content */}
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${isActive ? 'text-green-600' : 'text-gray-900'}`}>
                          {category.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {category.description}
                        </p>
                      </div>

                      {/* Mobile Active Indicator */}
                      {isActive && (
                        <div className="w-3 h-3 rounded-full bg-green-500 ml-2 flex-shrink-0"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
              {/* Mobile-only authentication links */}
              {isAuthenticated ? (
                <>
                  <li className="border-t border-gray-200 pt-4 mt-4">
                    <Link
                      href="/account/dashboard"
                      className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">📊</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">Dashboard</h3>
                        <p className="text-gray-600 text-sm mt-1">View your account overview</p>
                      </div>
                    </Link>
                  </li>

                  <li>
                    <Link
                      href="/account/settings"
                      className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-lg">⚙️</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">Settings</h3>
                        <p className="text-gray-600 text-sm mt-1">Manage your preferences</p>
                      </div>
                    </Link>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">🚪</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">Log out</h3>
                        <p className="text-gray-600 text-sm mt-1">Sign out of your account</p>
                      </div>
                    </button>
                  </li>
                </>
              ) : (
                <li className="border-t border-gray-200 pt-4 mt-4">
                  <Link
                    href="/auth/login"
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mr-4 flex-shrink-0 flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">🔐</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">Login</h3>
                      <p className="text-gray-600 text-sm mt-1">Sign in to your account</p>
                    </div>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
