'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageModal from '@/components/ImageModal';
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
      <div className="min-h-screen pt-[120px]" style={{ backgroundColor: '#D2D7DA' }}>
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#124657]"></div>
            <div className="text-lg">Loading hardware data...</div>
            <div className="text-sm text-gray-500 mt-2">Fetching hardware options and products</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px]" style={{ backgroundColor: '#D2D7DA' }}>
      <Header />
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <a className="transition-colors hover-primary" href="/">Home</a>
            <span className="mx-2">/</span>
            <a className="transition-colors hover-primary" href="/categories">Categories</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Hardware</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hardware</h1>
              <p className="text-gray-600">Complete hardware solutions for windows and doors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {HARDWARE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  console.log('🎯 Selected category:', category);
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  activeCategory === category
                    ? 'border-[#124657] bg-[#124657] text-white'
                    : 'border-gray-200 hover:border-[#124657] hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{category}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Products - {activeCategory}
          </h2>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any, index: number) => {
                const productId = product.id || product.sapCode;
                const localQuantity = quantities[productId] || 0;
                const cartQuantity = getCartQuantityForProduct(product);
                const displayQuantity = cartQuantity + localQuantity;

                return (
                  <div key={productId || index} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gray-50 p-4 border-b">
                      <div className="flex justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.perticular || product.description || 'Hardware Item'}
                            className="h-24 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(product.image, product.perticular || product.description || 'Hardware Item')}
                            title="Click to view larger image"
                          />
                        ) : (
                          <div className="h-24 w-32 bg-white border border-gray-300 rounded flex items-center justify-center">
                            <div className="text-xs text-gray-400 text-center">No Image</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                        <div className="bg-gray-100 p-1 text-center font-medium">System</div>
                        <div className="bg-gray-100 p-1 text-center font-medium">MOQ</div>
                        <div className="bg-white p-1 text-center border">{product.system || '-'}</div>
                        <div className="bg-white p-1 text-center border">{product.moq || '-'}</div>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{product.perticular || product.description || 'Hardware Item'}</h3>
                        <p className="text-xs text-gray-600">SAP Code: {product.sapCode}</p>
                        {cartQuantity > 0 && (
                          <p className="text-xs font-medium" style={{ color: '#124657' }}>
                            ✓ {cartQuantity} in cart
                          </p>
                        )}
                      </div>

                      <div className="mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">Rate: ₹{product.rate}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityDecrement(productId)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{displayQuantity}</span>
                          <button
                            onClick={() => handleQuantityIncrement(productId)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleProductSelect(product)}
                          disabled={localQuantity === 0}
                          className="px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-[#0f3a4a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="font-medium">
                            {localQuantity === 0
                              ? 'Adjust Quantity'
                              : localQuantity > 0
                              ? 'Add to Cart'
                              : 'Remove from Cart'
                            }
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
    </div>
  );
}
