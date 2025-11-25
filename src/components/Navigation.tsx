"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowRight, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AppContext";

// Navigation categories data
const navigationCategories = [
  {
    id: 'aluminium-profiles',
    title: 'Aluminium Profiles',
    description: 'High performance system aluminium profiles for windows and doors',
    image: '/profile.jpg',
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
  const pathname = usePathname();


  return (
    <nav className="border-t" style={{ backgroundColor: '#FFF', borderTop: '1px solid #097d13ff' }}>
      <div className="container mx-auto px-4">
        {/* Compact Navigation Cards - Always Visible */}
        <div className="py-6">

          {/* Main Category Cards */}
          <div className="flex flex-start gap-2">
            {navigationCategories.map((category) => {
              const isActive = pathname?.includes(category.id);
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="w-40 group relative bg-white overflow-hidden transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center gap-1"

                >
                  {/* Compact Card Layout */}
                  <div className="p-4">
                      {/* Icon/Image Container */}
                      <div className="relative w-25 h-25 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={category.image}
                          alt={category.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl shadow-sm border border-gray-200"
                          onError={(e) => {
                            // Fallback to gradient background if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg text-center leading-tight mb-1 group-hover:text-[#124657] transition-colors ${
                      isActive ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {category.title}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
