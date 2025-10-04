'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCartState, ProfileProduct } from '@/contexts/AppContext';
import { useProfilesData, useHardwareData } from '@/hooks';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CategoryPage() {
  const { addToCart, getCartItem, cart } = useCartState();

  const pathname = usePathname();
  const { loadProfileOptions } = useProfilesData();
  const { loadHardwareOptions } = useHardwareData();

  // Determine if this is profiles or hardware page
  const isHardwarePage = pathname.includes('/hardware');
  const pageType = isHardwarePage ? 'hardware' : 'profiles';

  // State for API data structure
  const [apiData, setApiData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, any>>({});

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
  console.log('🎯 Current state:', {
    activeCategory,
    activeSubCategory,
    searchQuery,
    categories,
    apiData,
    productsToDisplay: productsToDisplay,
    productsLength: productsToDisplay?.length
  });

  // Fetch API data and extract categories dynamically
  const fetchProfileData = async () => {
    console.log('🔄 Starting to fetch API data...');
    setLoading(true);
    try {
      console.log(`📡 Calling ${isHardwarePage ? 'loadHardwareOptions' : 'loadProfileOptions'}...`);
      const response = isHardwarePage
        ? await loadHardwareOptions()
        : await loadProfileOptions();
      console.log('✅ API response received:', response);
      console.log('🔍 API response structure:', JSON.stringify(response, null, 2));

      // Store the raw API data
      setApiData(response);

      // Extract categories from response.categories
      let extractedCategories: string[] = [];
      const responseData = response as any;

      if (responseData && responseData.categories && typeof responseData.categories === 'object') {
        extractedCategories = Object.keys(responseData.categories);
        setApiData(responseData.categories);
        console.log('📊 Found categories:', extractedCategories);
      } else {
        console.log('⚠️ No categories found in response structure');
      }

      setCategories(extractedCategories);
      console.log('🏗️ Extracted categories:', extractedCategories);

      // Set first category and subcategory as active
      if (extractedCategories.length > 0) {
        const firstCategory = extractedCategories[0];
        setActiveCategory(firstCategory);

        // Try to find options in the first category
        const categoryData = responseData.categories?.[firstCategory];
        if (categoryData && categoryData.options && Array.isArray(categoryData.options)) {
          const options = categoryData.options;
          if (options.length > 0) {
            setActiveSubCategory(options[0]);
            console.log('🎯 Set active category:', firstCategory, 'option:', options[0]);
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch API data:', error);
    } finally {
      setLoading(false);
      console.log('🏁 Finished fetching API data');
    }
  };

  useEffect(() => {
    fetchProfileData();
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

  // Handle quantity change (similar to your handleQuantityChange)
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

  // Handle product selection (similar to your onConfirmRow)
  const handleProductSelect = (product: ProfileProduct) => {
    const key = `${activeCategory}-${activeSubCategory}-${product.id}`;
    const quantity = quantities[key]?.quantity || 0;

    if (quantity > 0) {
      // Add to cart with category-specific data
      const cartItem = {
        id: `${product.sapCode}-${activeCategory}-${activeSubCategory}`,
        name: product.description,
        brand: 'Glazia',
        price: apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0,
        originalPrice: apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0,
        image: product.image || '/api/placeholder/300/300',
        inStock: product.isEnabled,
        category: `${activeCategory} - ${activeSubCategory}`,
        kgm: product.kgm,
        length: product.length,
        per: product.per,
      };

      // Add to cart with the specified quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(cartItem);
      }
    } else {
      alert("Please enter a valid quantity before adding to cart.");
    }
  };

  // Handle quantity increment/decrement
  const handleQuantityIncrement = (product: ProfileProduct) => {
    const current = quantities[`${activeCategory}-${activeSubCategory}-${product.id}`]?.quantity || 0;
    handleQuantityChange(activeCategory, activeSubCategory, product.id, (current + 1).toString());
  };

  const handleQuantityDecrement = (product: ProfileProduct) => {
    const current = quantities[`${activeCategory}-${activeSubCategory}-${product.id}`]?.quantity || 0;
    handleQuantityChange(activeCategory, activeSubCategory, product.id, Math.max(0, current - 1).toString());
  };

  // Clear all quantities (used in JSX)
  const handleClear = () => {
    setQuantities({});
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/categories" className="hover:text-blue-600">Categories</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{isHardwarePage ? 'Hardware' : 'Windoor Profiles'}</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isHardwarePage ? 'Hardware' : 'Windoor Profiles'}
                </h1>
                <p className="text-gray-600">
                  {isHardwarePage
                    ? 'Complete hardware solutions for windows and doors'
                    : 'High-quality UPVC, Aluminum, and Composite window & door profile systems'
                  }
                </p>
              </div>


            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading profile data...</div>
            </div>
          ) : (
            <>
              {/* Dynamic Categories */}
              {categories.length > 0 && (
                <div className="mb-6">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`px-4 py-2 rounded-lg border ${
                          activeCategory === category
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setActiveCategory(category);
                          // Set first option as active when category changes
                          const categoryData = apiData?.[category];
                          if (categoryData && categoryData.options && Array.isArray(categoryData.options)) {
                            const options = categoryData.options;
                            if (options.length > 0) {
                              setActiveSubCategory(options[0]);
                            }
                          }
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Options */}
                  {activeCategory && apiData?.[activeCategory]?.options && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {apiData[activeCategory].options.map((option: string) => (
                        <button
                          key={option}
                          className={`px-4 py-2 rounded-lg border text-sm ${
                            activeSubCategory === option
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setActiveSubCategory(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search by SAP Code, Description, KGM..."
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
                </div>
              )}

              <div className="mb-6">
                <p className="text-gray-600">
                  Showing {productsToDisplay?.length || 0} {isHardwarePage ? 'hardware' : 'profile'} products
                  {activeCategory && activeSubCategory && ` for ${activeCategory} - ${activeSubCategory}`}
                  {searchQuery && ` - Filtered from ${currentProducts.length} total`}
                </p>
              </div>

              {productsToDisplay?.length === 0 && searchQuery ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">
                    No products found matching "{searchQuery}"
                  </div>
                  <button
                    onClick={handleClearSearch}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  const quantity = localQuantity || cartQuantity; // Show local quantity if set, otherwise show cart quantity
                  const rate = apiData?.[activeCategory]?.rate?.[activeSubCategory] || 0;

                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Technical Drawing Section */}
                      <div className="bg-gray-50 p-4 border-b">
                        <div className="text-center mb-2">
                          <div className="text-sm font-medium text-gray-700">Frame 21</div>
                          <div className="text-xs text-gray-500">40.0</div>
                        </div>
                        <div className="flex justify-center">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.description}
                              className="h-24 w-auto object-contain"
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
                        <div className="grid grid-cols-4 gap-1 text-xs mb-3">
                          <div className="bg-gray-100 p-1 text-center font-medium">Glass</div>
                          <div className="bg-gray-100 p-1 text-center font-medium">Ext. Depth</div>
                          <div className="bg-gray-100 p-1 text-center font-medium">Kg. Weight</div>
                          <div className="bg-gray-100 p-1 text-center font-medium">Perimeter</div>
                          <div className="bg-white p-1 text-center border">{product.degree || '6'}</div>
                          <div className="bg-white p-1 text-center border">{product.kgm || '40.0'}</div>
                          <div className="bg-white p-1 text-center border">{product.length || '1.673'}</div>
                          <div className="bg-white p-1 text-center border">{product.per || '40.0'}</div>
                        </div>

                        <div className="mb-3">
                          <h3 className="font-medium text-gray-900 text-sm mb-1">{product.description}</h3>
                          <p className="text-xs text-gray-600">SAP Code: {product.sapCode}</p>
                          {cartQuantity > 0 && (
                            <p className="text-xs text-blue-600 font-medium">
                              ✓ {cartQuantity} in cart
                            </p>
                          )}
                        </div>

                        <div className="mb-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">Rate: ₹{rate}</div>
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
                            disabled={!product.isEnabled || quantity <= 0}
                            className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                              product.isEnabled && quantity > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span className="font-medium">
                              {quantity > 0
                                ? (cartQuantity > 0 ? 'Update Cart' : 'Add to Cart')
                                : 'Enter Quantity'
                              }
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}