'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartState, ProfileProduct } from '@/contexts/AppContext';
import { useRailingsData } from '@/hooks';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ImageModal from '@/components/ImageModal';

export default function RailingsPage() {
  const { addToCart, getCartItem, cart, updateCartQuantity } = useCartState();

  const pathname = usePathname();
  const { loadRailingsOptions } = useRailingsData();

  // State for API data structure
  const [apiData, setApiData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Railings');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('7 options');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, any>>({});

  // State for image modal
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageSrc: '',
    imageAlt: '',
    productName: ''
  });

  // Get current products from API data
  const currentProducts = apiData?.[activeCategory]?.products?.[activeSubCategory] || [];

  // Client-side filtering based on search query
  const filteredProducts = searchQuery.trim()
    ? currentProducts.filter((product: ProfileProduct) => {
        const query = searchQuery.toLowerCase();
        const sapCode = (product.sapCode || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const kgm = (product.kgm || '').toString().toLowerCase();

        return (
          sapCode.includes(query) ||
          description.includes(query) ||
          kgm.includes(query)
        );
      })
    : currentProducts;

  // Products to display
  const productsToDisplay = filteredProducts;

  // Debug logging for products display
  console.log('🎯 Current railings state:', {
    activeCategory,
    activeSubCategory,
    searchQuery,
    categories,
    apiData,
    productsToDisplay: productsToDisplay,
    productsLength: productsToDisplay?.length
  });

  // Fetch API data and extract categories dynamically
  const fetchRailingsData = async () => {
    console.log('🔄 Starting to fetch railings API data...');
    setLoading(true);
    try {
      console.log('📡 Calling loadRailingsOptions...');
      const response = await loadRailingsOptions();
      console.log('✅ Railings API response received:', response);
      console.log('🔍 Railings API response structure:', JSON.stringify(response, null, 2));

      // Store the raw API data
      setApiData(response);

      // Extract categories from response.categories
      let extractedCategories: string[] = [];
      const responseData = response as any;

      if (responseData && responseData.categories && typeof responseData.categories === 'object') {
        extractedCategories = Object.keys(responseData.categories);
        setApiData(responseData.categories);
        console.log('📊 Found railings categories:', extractedCategories);
      } else {
        console.log('⚠️ No railings categories found in response structure');
      }

      setCategories(extractedCategories);
      console.log('🏗️ Extracted railings categories:', extractedCategories);

      // Set first category and subcategory as active
      // if (extractedCategories.length > 0) {
      //   const firstCategory = extractedCategories[0];
      //   setActiveCategory(firstCategory);

      //   // Try to find options in the first category
      //   const categoryData = responseData.categories?.[firstCategory];
      //   if (categoryData && categoryData.options && Array.isArray(categoryData.options)) {
      //     const options = categoryData.options;
      //     if (options.length > 0) {
      //       setActiveSubCategory(options[0]);
      //       console.log('🎯 Set active railings category:', firstCategory, 'option:', options[0]);
      //     }
      //   }
      // }
    } catch (error) {
      console.error('❌ Failed to fetch railings API data:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Finished fetching railings API data');
    }
  };

  useEffect(() => {
    fetchRailingsData();
  }, []);

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Get cart quantity for a product
  const getCartQuantityForProduct = (product: ProfileProduct): number => {
    const cartItemId = `${product.sapCode}-${activeCategory}-${activeSubCategory}`;
    const cartItem = getCartItem(cartItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle quantity change
  const handleQuantityChange = (category: string, subCategory: string, id: number, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [`${category}-${subCategory}-${id}`]: {
        category,
        subCategory,
        id,
        quantity: parseInt(value, 10) || 0,
      },
    }));
  };

  // Handle product selection
  const handleProductSelect = (product: ProfileProduct) => {
    const key = `${activeCategory}-${activeSubCategory}-${product.id}`;
    const localQuantity = quantities[key]?.quantity || 0;
    const cartQuantity = getCartQuantityForProduct(product);

    if (localQuantity !== 0) {
      if (localQuantity > 0) {
        // Adding items to cart
        const cartItem = {
          id: `${product.sapCode}-${activeCategory}-${activeSubCategory}`,
          name: product.description,
          brand: 'Glazia',
          price: apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0,
          originalPrice: apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0,
          image: product.image || '/api/placeholder/300/300',
          inStock: product.isEnabled,
          category: `${activeCategory} - ${activeSubCategory}`,
          subCategory: activeCategory,
          kgm: product.kgm,
          length: product.length,
          per: product.per,
        };

        // Add to cart with the specified quantity
        for (let i = 0; i < localQuantity; i++) {
          addToCart(cartItem);
        }
      } else {
        // Removing items from cart
        const removeQuantity = Math.abs(localQuantity);
        const newCartQuantity = Math.max(0, cartQuantity - removeQuantity);
        updateCartQuantity(`${product.sapCode}-${activeCategory}-${activeSubCategory}`, newCartQuantity);
      }

      // Reset local quantity after updating cart
      setQuantities((prev) => ({
        ...prev,
        [key]: { ...prev[key], quantity: 0 }
      }));
    } else {
      alert("Please adjust the quantity before updating cart.");
    }
  };

  // Handle quantity increment/decrement
  const handleQuantityIncrement = (product: ProfileProduct) => {
    const current = quantities[`${activeCategory}-${activeSubCategory}-${product.id}`]?.quantity || 0;
    handleQuantityChange(activeCategory, activeSubCategory, product.id, (current + 1).toString());
  };

  const handleQuantityDecrement = (product: ProfileProduct) => {
    const current = quantities[`${activeCategory}-${activeSubCategory}-${product.id}`]?.quantity || 0;
    const cartQuantity = getCartQuantityForProduct(product);

    // Allow going negative to represent removing from cart
    // But don't go below negative cart quantity (can't remove more than what's in cart)
    if (current > -cartQuantity) {
      handleQuantityChange(activeCategory, activeSubCategory, product.id, (current - 1).toString());
    }
  };

  // Clear all quantities
  const handleClear = () => {
    setQuantities({});
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

  return (
    <>
      <Header />
      <div className="min-h-screen pt-[120px]" style={{ backgroundColor: '#D2D7DA' }}>
        <Navigation />
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <Link
                href="/"
                className="transition-colors hover-primary"
              >
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                href="/categories"
                className="transition-colors hover-primary"
              >
                Categories
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">Railings</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Railings
                </h1>
                <p className="text-gray-600">
                  Premium aluminum railing systems for balconies, staircases, and architectural applications
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#124657]"></div>
              <div className="text-lg">Loading railings data...</div>
            </div>
          ) : (
            <>
              <div className='bg-white rounded-lg shadow-sm border p-6'>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by SAP Code, Description, KGM..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-700 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="mb-6">
                  <p className="text-gray-600">
                    Showing {productsToDisplay?.length || 0} railing products
                    {activeCategory && activeSubCategory && ` for ${activeCategory} - ${activeSubCategory}`}
                    {searchQuery && ` - Filtered from ${currentProducts.length} total`}
                  </p>
                </div>

                {productsToDisplay?.length === 0 && searchQuery ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">
                      No railings found matching "{searchQuery}"
                    </div>
                    <button
                      onClick={handleClearSearch}
                      className="mt-4 px-4 py-2 text-white rounded-lg transition-colors hover-primary-bg-dark"
                      style={{ backgroundColor: '#124657' }}
                    >
                      Clear Search
                    </button>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productsToDisplay?.map((product: ProfileProduct) => {
                    const key = `${activeCategory}-${activeSubCategory}-${product.id}`;
                    const localQuantity = quantities[key]?.quantity || 0;
                    const cartQuantity = getCartQuantityForProduct(product);
                    const quantity = cartQuantity + localQuantity; // Cart quantity + local adjustments
                    const rate = apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0;

                    return (
                      <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Technical Drawing Section */}
                        <div className="bg-gray-50 p-4 border-b">
                          <div className="text-center mb-2">
                          </div>
                          <div className="flex justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.description}
                                className="h-24 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => handleImageClick(product.image || '', product.description)}
                                title="Click to view larger image"
                              />
                            ) : (
                              <div className="h-24 w-32 bg-white border border-gray-300 rounded flex items-center justify-center">
                                <div className="text-xs text-gray-400 text-center">Technical Drawing</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Specifications Table */}
                        <div className="p-3">
                          <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                            <div className="bg-gray-100 p-1 text-center font-medium">Kg/m</div>
                            <div className="bg-gray-100 p-1 text-center font-medium">Length(mm)</div>
                            <div className="bg-white p-1 text-center border">{product.kgm || '40.0'}</div>
                            <div className="bg-white p-1 text-center border">{product.length || '1.673'}</div>
                          </div>

                          <div className="mb-3">
                            <h3 className="font-medium text-gray-900 text-sm mb-1">{product.description}</h3>
                            <p className="text-xs text-gray-600">SAP Code: {product.sapCode}</p>
                            {cartQuantity > 0 && (
                              <p className="text-xs font-medium" style={{ color: '#124657' }}>
                                ✓ {cartQuantity} in cart
                              </p>
                            )}
                          </div>

                          <div className="mb-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">Rate: ₹{rate}/Kg</div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityDecrement(product)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={quantity || ""}
                                  onChange={(e) => handleQuantityChange(activeCategory, activeSubCategory, product.id, e.target.value)}
                                  className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                                />
                                <button
                                  onClick={() => handleQuantityIncrement(product)}
                                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              {quantity > 0 && (
                                <span className="text-sm text-gray-600">
                                  Total: ₹{(quantity * rate).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                              onClick={() => handleProductSelect(product)}
                              disabled={!product.isEnabled || localQuantity === 0}
                              className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                                product.isEnabled && localQuantity !== 0
                                  ? 'text-white hover-primary-bg-dark'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                              style={product.isEnabled && localQuantity !== 0 ? { backgroundColor: '#124657' } : {}}
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
            </div>
            </>
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
    </>
  );
}
