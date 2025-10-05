'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  const { addToCart, cart, getCartItem } = useCartState();

  // State management
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(HARDWARE_CATEGORIES[0]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Quantity state for hardware products
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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
  const handleQuantityChange = (id: string, value: string) => {
    const qty = parseInt(value, 10) || 0;
    setQuantities((prev) => ({
      ...prev,
      [id]: qty,
    }));
  };

  const handleQuantityIncrement = (productId: string) => {
    const current = quantities[productId] || 0;
    setQuantities((prev) => ({
      ...prev,
      [productId]: current + 1,
    }));
  };

  const handleQuantityDecrement = (productId: string) => {
    const current = quantities[productId] || 0;
    if (current > 0) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: current - 1,
      }));
    }
  };

  // Add to cart function
  const handleProductSelect = (product: any) => {
    const productId = product.id || product.sapCode;
    const quantity = quantities[productId] || 0;

    if (quantity > 0) {
      const cartItem = {
        id: productId,
        name: product.perticular || product.description || 'Hardware Item',
        brand: 'Glazia',
        price: product.rate || 0,
        originalPrice: product.rate,
        image: product.image || '',
        inStock: true,
        category: 'Hardware'
      };

      console.log('🛒 Adding to cart with quantity:', quantity, 'Product:', cartItem);

      // Add to cart with the specified quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(cartItem);
      }

      // Reset quantity after adding to cart
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0
      }));

      console.log('✅ Successfully added to cart');
    } else {
      alert("Please enter a valid quantity before adding to cart.");
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <a className="hover:text-[#124657}" href="/">Home</a>
              <span className="mx-2">/</span>
              <a className="hover:text-[#124657}" href="/categories">Categories</a>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Hardware</span>
            </nav>
          </div>
        </div>

        {/* Header */}
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

        {/* Loading State */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="text-lg">Loading hardware data...</div>
            <div className="text-sm text-gray-500 mt-2">Fetching hardware options and products</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <a className="hover:text-[#124657}" href="/">Home</a>
            <span className="mx-2">/</span>
            <a className="hover:text-[#124657}" href="/categories">Categories</a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Hardware</span>
          </nav>
        </div>
      </div>

      {/* Header */}
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
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Hardware Categories</h2>
              <div className="flex flex-wrap gap-2">
                {HARDWARE_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      console.log('🎯 Selected category:', category);
                    }}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      activeCategory === category
                        ? 'bg-[#124657} text-white border-[#124657}'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by SAP Code, Description, System..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      CLEAR
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {activeCategory} Products ({filteredProducts.length})
                  {searchQuery && ` - Filtered from ${products.length} total`}
                </h3>
                <div className="text-sm text-gray-500">
                  Cart Items: {cart.itemCount}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#124657} mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading {activeCategory} products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">
                    {searchQuery
                      ? `No products found matching "${searchQuery}"`
                      : `No products found for ${activeCategory}`
                    }
                  </div>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 bg-[#124657} text-white rounded-lg hover:bg-blue-700"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: any, index: number) => {
                    const productId = product.id || product.sapCode;
                    const localQuantity = quantities[productId] || 0;
                    const cartQuantity = getCartQuantityForProduct(product);
                    const displayQuantity = localQuantity || cartQuantity;

                    return (
                      <div key={productId || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="space-y-3">

                          {/* Product Image */}
                          <div className="flex justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.perticular}
                                className="h-36 w-auto object-contain rounded-lg"
                              />
                            ) : (
                              <div className="h-24 w-32 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                                <div className="text-xs text-gray-400 text-center">No Image</div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="text-left">
                            <h4 className="font-semibold text-gray-900 mb-1">{product.perticular || 'Hardware Item'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                              <p className="text-sm text-gray-600">SAP: {product.sapCode}</p>
                              <p className="text-sm text-gray-600">System: {product.system}</p>
                              <p className="text-sm text-gray-600">MOQ: {product.moq}</p>
                            </div>
                            {cartQuantity > 0 && (
                              <p className="text-xs text-[#124657} font-medium mt-1">
                                ✓ {cartQuantity} in cart
                              </p>
                            )}
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">₹{product.rate}</div>
                          </div>

                          <div className="space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityDecrement(productId)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={displayQuantity || ""}
                                  onChange={(e) => handleQuantityChange(productId, e.target.value)}
                                  className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <button
                                  onClick={() => handleQuantityIncrement(productId)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {displayQuantity > 0 && (
                                <span className="text-sm text-gray-600">
                                  Qty: {displayQuantity}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleProductSelect(product)}
                                disabled={displayQuantity <= 0}
                                className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                                  displayQuantity > 0
                                    ? 'bg-[#124657} text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span className="font-medium">
                                  {displayQuantity > 0
                                    ? (cartQuantity > 0 ? 'Update Cart' : 'Add to Cart')
                                    : 'Enter Quantity'
                                  }
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}