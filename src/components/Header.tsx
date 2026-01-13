"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ChevronDown, Menu, Search, X } from "lucide-react";
import { useCartState, useAuth } from "@/contexts/AppContext";
import { API_CONFIG } from "@/services";
import NalcoPriceDisplay from "./NalcoPriceDisplay";
import NalcoGraphModal from "./NalcoGraphModal";
import LoginModal from "./LoginModal";
import PhoneTrackModal from "./PhoneTrackModal";

type GlobalSearchProduct = {
  _id?: string;
  sapCode: string;
  part?: string;
  description?: string;
  image?: string;
  enabled?: boolean;
};

type GlobalSearchHardware = {
  _id?: string;
  sapCode: string;
  perticular?: string;
  subCategory?: string;
  rate?: number;
  system?: string;
  moq?: string;
  image?: string;
};

type SearchItem =
  | (GlobalSearchProduct & { type: "product" })
  | (GlobalSearchHardware & { type: "hardware" });

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNalcoModalOpen, setIsNalcoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    products: SearchItem[];
    hardware: SearchItem[];
  } | null>(null);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedSearchItem, setSelectedSearchItem] = useState<SearchItem | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { cart, toggleCart, addToCart } = useCartState();
  const { isAuthenticated, clearUser } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const term = searchQuery.trim();
    if (!term) {
      setSearchResults(null);
      setIsSearchDropdownOpen(false);
      setIsSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsSearchLoading(true);
    setIsSearchDropdownOpen(true);
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/user/global-search?search=${encodeURIComponent(term)}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error(`Search failed with status ${response.status}`);
        }
        const data = await response.json();
        const products = (data.products || []).map((item: GlobalSearchProduct) => ({
          ...item,
          type: "product" as const,
        }));
        const hardware = (data.hardware || []).map((item: GlobalSearchHardware) => ({
          ...item,
          type: "hardware" as const,
        }));

        setSearchResults({ products, hardware });
        setIsSearchDropdownOpen(true);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearchResults({ products: [], hardware: [] });
        }
      } finally {
        setIsSearchLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    clearUser();
    setIsDropdownOpen(false);
    router.push('/');
  };

  const getSearchItemLabel = (item: SearchItem) => {
    if (item.type === "hardware") {
      return item.perticular || item.subCategory || item.sapCode;
    }
    return item.description || item.part || item.sapCode;
  };

  const handleSearchSelect = (item: SearchItem) => {
    setSelectedSearchItem(item);
    setIsSearchModalOpen(true);
    setIsSearchDropdownOpen(false);
  };

  const handleSearchAddToCart = (item: SearchItem) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (item.type === "hardware") {
      addToCart({
        id: item._id || item.sapCode,
        name: item.perticular || item.subCategory || item.sapCode,
        brand: "Glazia",
        price: `${item.rate ?? 0}`,
        originalPrice: item.rate ?? 0,
        image: item.image || "/hardware.jpg",
        inStock: true,
        category: "Hardware",
        subCategory: item.subCategory || "Hardware",
        length: "1000",
        per: "piece",
        kgm: 1,
      });
      return;
    }

    router.push("/categories/aluminium-profiles");
    setIsSearchModalOpen(false);
  };

  return (
    <>
    <div className="fixed h-18 md:h-24 top-0 left-0 w-full bg-white z-[10000]">
      <div className="bg-[#E6E9EB] px-4 md:px-12 py-3 md:py-4 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-between items-center gap-2">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center text-gray-800"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" />
          </button>
          <Link href="/">
            <Image width={100} height={100} src="/Logo.svg" alt="Glazia Logo Mobile" />
          </Link>
          <div className="md:hidden">
            <NalcoPriceDisplay onClick={() => setIsNalcoModalOpen(true)} />
          </div>
          <div className="hidden md:flex items-center gap-12">
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
        </div>

        <div className="hidden md:block">
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
                  ref={userDropdownRef}
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
        <div className="flex md:hidden items-center gap-3">
          <Link href="tel:+919958053708" aria-label="Call">
            <Image width={18} height={18} src="/call.svg" alt="Call" />
          </Link>
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              aria-label="Login"
            >
              <Image width={18} height={18} src="/user.svg" alt="User" />
            </button>
          ) : (
            <Link href="/account/dashboard" aria-label="Account">
              <Image width={18} height={18} src="/user.svg" alt="User" />
            </Link>
          )}
          <button
            type="button"
            className="relative inline-flex items-center justify-center"
            onClick={toggleCart}
            aria-label="Cart"
          >
            <Image width={22} height={22} src="/cart.svg" alt="Cart" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </button>
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
    <div className="md:hidden mt-20" />
    <div style={{alignItems: 'center'}} className="bg-white px-[140px] py-[24px] mt-20 hidden md:flex gap-12 flex-row items-center justify-center">
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

      <div className="hidden md:block" ref={searchDropdownRef}>
        <div className="border-[#B2B2B2] border-[1px] flex items-center rounded-[24px] relative">
          <input
            type="text"
            placeholder="Find the product you need"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={() => {
              if (searchResults || searchQuery.trim()) {
                setIsSearchDropdownOpen(true);
              }
            }}
            className="w-[35vw] px-4 py-2 border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 placeholder:text-[#B2B2B2] text-[16px]"
          />
          <button
            type="button"
            onClick={() => setIsSearchDropdownOpen(true)}
            className="bg-[#2F3A4F] rounded-full px-4 py-2 text-white flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </button>

          {isSearchDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-[10001] max-h-[60vh] overflow-auto">
              {isSearchLoading && (
                <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
              )}
              {!isSearchLoading &&
                (!searchResults ||
                  (searchResults.products.length === 0 && searchResults.hardware.length === 0)) && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No results found for "{searchQuery.trim()}"
                  </div>
                )}
              {!isSearchLoading && searchResults && (
                <>
                  {searchResults.products.length > 0 && (
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500">
                        Profiles
                      </div>
                      {searchResults.products.map((item) => (
                        <button
                          type="button"
                          key={`product-${item._id || item.sapCode}`}
                          onClick={() => handleSearchSelect(item)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                        >
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image || "/profile.jpg"}
                              alt={getSearchItemLabel(item)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {getSearchItemLabel(item)}
                            </div>
                            <div className="text-xs text-gray-500">SAP: {item.sapCode}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.hardware.length > 0 && (
                    <div className="py-2 border-t border-gray-100">
                      <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500">
                        Hardware
                      </div>
                      {searchResults.hardware.map((item) => (
                        <button
                          type="button"
                          key={`hardware-${item._id || item.sapCode}`}
                          onClick={() => handleSearchSelect(item)}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                        >
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image || "/hardware.jpg"}
                              alt={getSearchItemLabel(item)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {getSearchItemLabel(item)}
                            </div>
                            <div className="text-xs text-gray-500">SAP: {item.sapCode}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[10001] md:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu overlay"
        />
        <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl px-6 py-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image width={120} height={40} src="/Logo.svg" alt="Glazia Logo" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            <Link className="text-base" href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-gray-500">Products</span>
              <Link className="text-base" href="/categories/aluminium-profiles" onClick={() => setIsMobileMenuOpen(false)}>Aluminium Profiles</Link>
              <Link className="text-base" href="/categories/hardware" onClick={() => setIsMobileMenuOpen(false)}>Hardware</Link>
              <Link className="text-base" href="/categories/railings" onClick={() => setIsMobileMenuOpen(false)}>Railings</Link>
            </div>
            <Link className="text-base" href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <Link className="text-base" href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            {isAuthenticated && (
              <Link className="text-base" href="/quotations" onClick={() => setIsMobileMenuOpen(false)}>Quotations</Link>
            )}
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            {!isAuthenticated ? (
              <button
                type="button"
                className="w-full px-4 py-2 bg-[#EE1C25] text-white rounded-lg"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                Login
              </button>
            ) : (
              <>
                <Link className="w-full px-4 py-2 border border-gray-200 rounded-lg text-center" href="/account/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-left"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    )}
    {isSearchModalOpen && selectedSearchItem && (
      <div className="fixed inset-0 z-[10002] flex items-end md:items-center justify-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsSearchModalOpen(false)}
          aria-label="Close search result"
        />
        <div className="relative w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl p-6 md:p-8 max-h-[85vh] overflow-auto">
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-56 aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={
                  selectedSearchItem.image ||
                  (selectedSearchItem.type === "hardware" ? "/hardware.jpg" : "/profile.jpg")
                }
                alt={getSearchItemLabel(selectedSearchItem)}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {selectedSearchItem.type === "hardware" ? "Hardware" : "Profile"}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-2">
                {getSearchItemLabel(selectedSearchItem)}
              </h3>
              <div className="text-sm text-gray-500 mt-1">SAP: {selectedSearchItem.sapCode}</div>

              {selectedSearchItem.type === "product" && (
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {selectedSearchItem.part && (
                    <div>Part: {selectedSearchItem.part}</div>
                  )}
                  {selectedSearchItem.description && (
                    <div>{selectedSearchItem.description}</div>
                  )}
                </div>
              )}

              {selectedSearchItem.type === "hardware" && (
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {selectedSearchItem.subCategory && (
                    <div>Category: {selectedSearchItem.subCategory}</div>
                  )}
                  {selectedSearchItem.system && <div>System: {selectedSearchItem.system}</div>}
                  {selectedSearchItem.moq && <div>MOQ: {selectedSearchItem.moq}</div>}
                </div>
              )}

              <div className="mt-6 border-t border-gray-200 pt-4">
                {selectedSearchItem.type === "hardware" && isAuthenticated && (
                  <div className="text-lg font-semibold text-gray-900">
                    ₹{selectedSearchItem.rate ?? 0}
                  </div>
                )}
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm font-medium text-[#EE1C25]"
                  >
                    Login to view price
                  </button>
                )}
                {selectedSearchItem.type === "product" && isAuthenticated && (
                  <div className="text-sm text-gray-500">
                    Select size on the profiles page to view pricing.
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleSearchAddToCart(selectedSearchItem)}
                  className="px-5 py-2.5 bg-[#2F3A4F] text-white rounded-full"
                >
                  {!isAuthenticated
                    ? "Login to add to cart"
                    : selectedSearchItem.type === "product"
                      ? "Select size to add"
                      : "Add to cart"}
                </button>
                {selectedSearchItem.type === "product" && (
                  <button
                    type="button"
                    onClick={() => router.push("/categories/aluminium-profiles")}
                    className="px-5 py-2.5 border border-gray-200 rounded-full text-gray-700"
                  >
                    View profiles
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
