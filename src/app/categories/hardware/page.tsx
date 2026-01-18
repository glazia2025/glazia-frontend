'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useAuth, useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageModal from '@/components/ImageModal';
import LoginModal from '@/components/LoginModal';
import { apiClient } from '@/services/api';

// Fixed hardware categories
const HARDWARE_CATEGORIES = [
  "CORNER JOINERY",
  "PLASTIC PART",
  "HANDLE",
  "LOCKING PARTS",
  "HINGES",
  "HANDLES",
  "ROLLERS"
];

export default function HardwarePage() {
  const { addToCart, getCartItem, updateCartQuantity } = useCartState();

  // State management
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(HARDWARE_CATEGORIES[0]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Quantity state for hardware products
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // State for image modal
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: '',
    productName: ''
  });

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? products.filter((product) => {
        const query = searchQuery.toLowerCase();
        const sapCode = (product.sapCode || '').toLowerCase();
        const perticular = (product.perticular || '').toLowerCase();
        const system = (product.system || '').toLowerCase();
        const subCategory = (product.subCategory || '').toLowerCase();

        return (
          sapCode.includes(query) ||
          perticular.includes(query) ||
          system.includes(query) ||
          subCategory.includes(query)
        );
      })
    : products;
  const visibleProducts = isAuthenticated
    ? filteredProducts
    : filteredProducts.slice(0, 3);
  const showViewMore = !isAuthenticated && filteredProducts.length > 3;

  // Fetch hardware data for selected category
  useEffect(() => {
    const fetchHardwareData = async () => {
      console.log('🔄 Fetching hardware data for category:', activeCategory);
      setLoading(true);

      try {
        // Call API with selected category as reqOption parameter
        const encodedCategory = encodeURIComponent(activeCategory);
        const response = await apiClient.get(`/api/admin/getHardwares?reqOption=${encodedCategory}`);

        console.log('✅ Hardware API response:', response);

        // Extract products from response
        if (response) {
          const productsData = response.products[activeCategory] || [];
          console.log('📦 Products for', activeCategory, ':', productsData);
          setProducts(productsData);
        } else {
          console.warn('⚠️ No data in response');
          setProducts([]);
        }
      } catch (error) {
        console.error('❌ Failed to fetch hardware data:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHardwareData();
  }, [activeCategory]); // Re-fetch when category changes

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Get cart quantity for a product
  const getCartQuantityForProduct = (product: any): number => {
    const productId = product.id || product.sapCode;
    const cartItem = getCartItem(productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Quantity control functions
  const handleQuantityIncrement = (productId: string) => {
    const current = quantities[productId] || 0;
    setQuantities((prev) => ({
      ...prev,
      [productId]: current + 1,
    }));
  };

  const handleQuantityDecrement = (productId: string) => {
    const current = quantities[productId] || 0;
    const cartQuantity = getCartQuantityForProduct({ id: productId });

    // Allow going negative to represent removing from cart
    // But don't go below negative cart quantity (can't remove more than what's in cart)
    if (current > -cartQuantity) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: current - 1,
      }));
    }
  };

  // Update cart function
  const handleProductSelect = (product: any) => {
    const productId = product.id || product.sapCode;
    const localQuantity = quantities[productId] || 0;
    const cartQuantity = getCartQuantityForProduct(product);

    if (localQuantity !== 0) {
      if (localQuantity > 0) {
        // Adding items to cart
        const cartItem = {
          id: productId,
          name: product.perticular || product.description || 'Hardware Item',
          brand: 'Glazia',
          price: product.rate || 0,
          originalPrice: product.rate,
          image: product.image || '',
          inStock: true,
          category: 'Hardware',
          subCategory: activeCategory, // Pass the hardware subcategory (e.g., "CORNER JOINERY")
          length: '1000', // Default length for hardware items
          per: 'piece',   // Hardware is sold per piece
          kgm: 1          // Default weight for hardware items
        };

        console.log('🛒 Adding to cart with quantity:', localQuantity, 'Product:', cartItem);

        // Add to cart with the specified quantity
        for (let i = 0; i < localQuantity; i++) {
          addToCart(cartItem);
        }
      } else {
        // Removing items from cart (localQuantity is negative)
        const removeQuantity = Math.abs(localQuantity);
        console.log('🗑️ Removing from cart with quantity:', removeQuantity, 'Product ID:', productId);

        // Update cart quantity directly
        const newCartQuantity = Math.max(0, cartQuantity - removeQuantity);
        updateCartQuantity(productId, newCartQuantity);
      }

      // Reset local quantity after updating cart
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0
      }));

      console.log('✅ Successfully updated cart');
    } else {
      alert("Please adjust the quantity before updating cart.");
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Handle image click to open modal
  const handleImageClick = (imageSrc: string, productName: string) => {
    setImageModal({
      isOpen: true,
      imageSrc,
      imageAlt: productName,
      productName
    });
  };

  // Close image modal
  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageSrc: '',
      imageAlt: '',
      productName: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-[120px]" style={{ backgroundColor: '#FFF' }}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#EE1C25]"></div>
            <div className="text-lg">Loading hardware data...</div>
            <div className="text-sm text-gray-500 mt-2">Fetching hardware options and products</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="" style={{ backgroundColor: '#FFF' }}>
      <Header />

      <div className="bg-[#D6DADE]">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-[500] text-gray-900 mb-1 sm:mb-2">Hardware</h1>
              <p className="text-gray-600">Complete hardware solutions for windows and doors</p>
            </div>
          </div>
        </div>
      </div>


       <div className="block md:hidden flex flex-row flex-wrap items-start gap-2 p-4">
        {HARDWARE_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              console.log('🎯 Selected category:', category);
            }}
            className={`text-[14px] px-3 py-1 border border-1 rounded-lg border-[#2F3A4F] font-[500] ${
              activeCategory === category
                ? 'text-[#FFFFFF] bg-[#2F3A4F]'
                : 'text-[#1F2933]'
            }`}
          >
            <div className="font-medium">{category}</div>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-between items-start border-[3px] border-[#D6DADE] bg-white mx-4 my-6 sm:my-8">
        <div className="bg-white w-full lg:w-[20%] rounded-lg p-4 sm:p-6">
          <div className="hidden md:block flex flex-col items-start gap-4">
            {HARDWARE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  console.log('🎯 Selected category:', category);
                }}
                className={`text-[18px] font-[500] ${
                  activeCategory === category
                    ? 'text-[#EE1C25]'
                    : 'text-[#1F2933]'
                }`}
              >
                <div className="font-medium">{category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#124657] focus:border-transparent"
              />
            </div>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div> */}

        <div className="bg-white w-full p-4 sm:p-6 border-t-[3px] border-[#D6DADE] lg:border-t-0 lg:border-l-[3px]">

          {filteredProducts.length === 0 && searchQuery ? (
            <div className="text-center py-8">
              <div className="text-gray-600">
                No products found matching {searchQuery}
              </div>
              <button
                onClick={handleClearSearch}
                className="mt-2 text-[#124657] hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600">No products available for this category</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visibleProducts.map((product: any, index: number) => {
                const productId = product.id || product.sapCode;
                const localQuantity = quantities[productId] || 0;
                const cartQuantity = getCartQuantityForProduct(product);
                const displayQuantity = cartQuantity + localQuantity;

                return (
                  <div key={productId || index} className="bg-white border border-1 border-[#D6DADE] overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.description}
                            className="h-64 w-full object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(product.image || '', product.description)}
                            title="Click to view larger image"
                          />
                        ) : (
                          <div className="h-64 w-full bg-white border border-gray-300 rounded flex items-center justify-center">
                            <div className="text-xs text-gray-400 text-center">Technical Drawing</div>
                          </div>
                        )}
                      </div>

                    <div className='bg-[#D6DADE] p-3'>
                      <h3 className="font-[18px] flex flex-row justify-between font-[600] text-[#1a1e22] mb-4">
                        <div>{product.perticular || product.description || 'Hardware Item'}</div>
                        <div className='text-[10px] text-[#EE1C25] font-[500]'>
                          {cartQuantity > 0 && `${cartQuantity} Item already added to cart`}
                        </div>
                      </h3>
                      <div className='grid grid-cols-[1fr_2fr] text-[#1a1e22] text-[13px]'>
                        <div className="">System</div>
                        <div className="text-right">{product.system || '-'}</div>
                        <div className="">MOQ</div>
                        <div className="text-right">{product.moq || '-'}</div>
                        <p className="">SAP Code</p>
                        <div className="text-right">{product.sapCode}</div>
                        <p className="">Rate</p>
                        <div className="text-right">{isAuthenticated ? `₹${product.rate}` : 'Login to view rate'}</div>
                      </div>
                    </div>

                    <div className="px-3 py-1  bg-[#2F3A4F]">
                      {
                        isAuthenticated ? <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8 text-white">
                          <button
                            onClick={() => handleQuantityDecrement(productId)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#2F3A4F] text-center">{displayQuantity}</span>
                          <button
                            onClick={() => handleQuantityIncrement(productId)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleProductSelect(product)}
                          disabled={localQuantity === 0}
                          className="px-4 py-2 bg-[#EE1C25] text-white rounded-lg hover:bg-[#0f3a4a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="font-[400]">
                            {localQuantity === 0
                              ? 'Add to Cart'
                              : localQuantity > 0
                              ? 'Add to Cart'
                              : 'Remove from Cart'
                            }
                          </span>
                        </button>
                      </div> : <div className="text-center">
                          <p className="text-xs text-gray-600">Login to add to cart</p>
                        </div>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {showViewMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2 bg-[#EE1C25] text-white"
              >
                View more
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
        productName={imageModal.productName}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
