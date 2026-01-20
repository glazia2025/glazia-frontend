'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Eye } from 'lucide-react';
import { useAuth, useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import LoginModal from '@/components/LoginModal';
import { ProfileApiService } from '@/services/profileApi';

// Interfaces for the new API structure
interface Product {
  _id: string;
  uniqueKey: string;
  sapCode: string;
  part: string;
  description: string;
  degree: string;
  per: string;
  kgm: number;
  length: number;
  image?: string;
}

interface Size {
  _id: string;
  categoryId: string;
  label: string;
  rate: number;
  enabled: boolean;
}

interface SizeData {
  size: Size;
  products: Product[];
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface CategoryFullData {
  category: Category;
  sizes: SizeData[];
}

export default function AluminiumProfilesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryFullData | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const { isAuthenticated } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [nalcoPrice, setNalcoPrice] = useState<number>(0);

  const { addToCart, getCartItem, getAdjustedItemPrice } = useCartState();
  const profileApi = useMemo(() => new ProfileApiService(), []);

  useEffect(() => {
      if (window.localStorage) {
        const temp = window.localStorage.getItem('nalcoPrice');
        if (temp) {
          setNalcoPrice(parseFloat(temp)); // Use parseFloat to preserve decimal values
        }
      }
    }, []);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await profileApi.getProfileCategories();
        console.log('Categories response:', response);

        if (response.success && response.data && Array.isArray(response.data)) {
          const categoriesData = response.data.map(cat => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description || '',
            enabled: cat.enabled
          }));
          setCategories(categoriesData);
          console.log('Categories loaded:', categoriesData);
          // Auto-select first category
          if (categoriesData.length > 0) {
            setSelectedCategory(categoriesData[0]);
          }
        } else {
          console.error('Invalid response format:', response);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message, error.stack);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [profileApi]);

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

  // Load category data when a category is selected
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!selectedCategory) return;

      try {
        setLoadingCategoryData(true);
        console.log('Loading category data for:', selectedCategory._id);
        const response = await profileApi.getCategoryFullData(selectedCategory._id);
        console.log('Category data response:', response);

        if (response.success && response.data) {
          setCategoryData(response.data);
          console.log('Category data loaded:', response.data);
          // Auto-select first size
          if (response.data.sizes && response.data.sizes.length > 0) {
            setSelectedSize(response.data.sizes[0].size.label);
          }
        }
      } catch (error) {
        console.error('Error loading category data:', error);
      } finally {
        setLoadingCategoryData(false);
      }
    };

    loadCategoryData();
  }, [selectedCategory, profileApi]);

  // Get current products based on selected size
  const getCurrentProducts = (): Product[] => {
    if (!categoryData || !selectedSize) return [];

    const sizeData = categoryData.sizes.find(s => s.size.label === selectedSize && s.size.enabled);
    const products = sizeData?.products.filter(p => p.enabled) || [];
    return sizeData ? products : [];
  };

  // Filter products based on search query
  const getFilteredProducts = (): Product[] => {
    const products = getCurrentProducts();

    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.sapCode.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.part.toLowerCase().includes(query)
    );
  };

  // Helper functions
  const handleImageClick = (imageSrc: string, description: string) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const getCartQuantityForProduct = (product: Product): number => {
    if (!selectedCategory || !selectedSize) return 0;
    const cartItemId = `${product.sapCode}-${selectedCategory.name}-${selectedSize}`;
    const cartItem = getCartItem(cartItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product._id] || 0;
    if (quantity <= 0) {
      return;
    }
    const rate = categoryData?.sizes.find(s => s.size.label === selectedSize)?.size.rate || 0;

    const cartItem = {
      id: `${product.sapCode}-${selectedCategory?.name}-${selectedSize}`,
      name: product.description,
      brand: 'Glazia',
      price: rate.toString(),
      originalPrice: rate,
      image: product.image || '/api/placeholder/300/300',
      inStock: true,
      category: `${selectedCategory?.name} - ${selectedSize}`,
      subCategory: selectedCategory?.name || '',
      kgm: product.kgm,
      length: product.length.toString(),
      per: product.per,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartItem);
    }

    // Reset local quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [product._id]: 0
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const rateAdjustment = selectedCategory && selectedSize
    ? getAdjustedItemPrice({
        category: `${selectedCategory.name} - ${selectedSize}`,
        subCategory: selectedCategory.name,
        name: selectedCategory.name,
      })
    : 0;

  const productsToDisplay = getFilteredProducts();
  const visibleProducts = isAuthenticated
    ? productsToDisplay
    : productsToDisplay.slice(0, 3);
  const showViewMore = !isAuthenticated && productsToDisplay.length > 3;

  if (loading) {
    return (
      <div className="min-h-screen pt-[120px]" style={{ backgroundColor: '#FFF' }}>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[#124657]"></div>
            <div className="text-lg">Loading categories...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="" style={{ backgroundColor: '#FFF' }}>
      <Header />

      {/* Page Header */}
      <div className="bg-[#D6DADE]">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-[500] text-gray-900 mb-1 sm:mb-2">Aluminium Profiles</h1>
              <p className="text-gray-600">High Quality Aluminium profile systems</p>
            </div>
          </div>
        </div>
      </div>

      <div className="block md:hidden bg-white w-full lg:w-[20%] rounded-lg p-4 sm:p-6">
          <div className="flex flex-row items-start gap-2">
            {categories.map((category) => (category.name === 'Railings' || category.enabled === false) ? null : (
              <div
                key={category._id}
                onClick={() => setSelectedCategory(category)}
                className={`text-[14px] px-3 py-1 border border-1 rounded-lg border-[#2F3A4F] font-[500] ${
                  selectedCategory?._id === category._id
                    ? 'text-[#FFFFFF] bg-[#2F3A4F]'
                    : 'text-[#1F2933]'
                }`}
              >
                <div className="font-medium">{category.name}</div>
              </div>
            ))}
          </div>
          {categoryData && (
            <div className="mt-3">
              {loadingCategoryData ? (
                <div className="space-y-3">
                  <div className="text-center text-sm text-gray-600">Loading sub category...</div>
                </div>
              ) : (
                <div className="flex flex-row items-start gap-2">
                  {categoryData.sizes.map((sizeData) => sizeData.size.enabled && (
                    <div
                      key={sizeData.size._id}
                      onClick={() => setSelectedSize(sizeData.size.label)}
                      className={`text-[10px] text-[#444E61] font-[500] px-3 py-1 border border-1 rounded-lg ${
                        selectedSize === sizeData.size.label
                          ? 'bg-[#B2B2B2]'
                          : 'bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="font-medium">{sizeData.size.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      <div className="flex flex-col lg:flex-row justify-between items-start border-[3px] border-[#D6DADE] bg-white mx-4 my-6 sm:my-8">
        {/* Category Selection */}
        <div className="hidden md:block bg-white w-full lg:w-[20%] rounded-lg p-4 sm:p-6">
          <div className="flex flex-col items-start gap-4">
            {categories.map((category) => (category.name === 'Railings' || category.enabled === false) ? null : (
              <div
                key={category._id}
                onClick={() => setSelectedCategory(category)}
                className={`text-[18px] text-left font-[500] ${
                  selectedCategory?._id === category._id
                    ? 'text-[#EE1C25]'
                    : 'text-[#1F2933]'
                }`}
              >
                <div className="font-medium">{category.name}</div>
                {(selectedCategory === category) && categoryData && (
                  <div style={{borderLeft: '1px solid #979CA7'}} className="m-3 pl-3">
                    {loadingCategoryData ? (
                      <div className="space-y-3">
                        <div className="text-center text-sm text-gray-600">Loading sub category...</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-4">
                        {categoryData.sizes.map((sizeData) => sizeData.size.enabled && (
                          <div
                            key={sizeData.size._id}
                            onClick={() => setSelectedSize(sizeData.size.label)}
                            className={`text-[16px] font-[500] ${
                              selectedSize === sizeData.size.label
                                ? 'text-[#EE1C25]'
                                : 'text-[#979CA7]'
                            }`}
                          >
                            <div className="font-medium">{sizeData.size.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        

        {/* Search */}
        {/* {selectedSize && (
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
        )} */}

        {/* Products */}
        {(selectedSize || loadingCategoryData) && (
          <div className="bg-white w-full p-4 sm:p-6 border-t-[3px] border-[#D6DADE] lg:border-t-0 lg:border-l-[3px]">
            <h2 className="text-xl font-semibold mb-4">
              Products - {selectedCategory?.name} {selectedSize ? `(${selectedSize})` : ''} 
            </h2>
            <h3 style={{marginBottom: '12px'}}>
              Rate: {isAuthenticated  ? `₹${((nalcoPrice / 1000) + 75 + rateAdjustment).toFixed(2)} /Kg` : 'Login to view rate'}
            </h3>

            {loadingCategoryData ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`product-skeleton-${index}`}
                    className="h-64 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : productsToDisplay.length === 0 && searchQuery ? (
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
              ) : productsToDisplay.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">No products available for this size</div>
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visibleProducts.map((product) => {
                  const cartQuantity = getCartQuantityForProduct(product);
                  const localQuantity = quantities[product._id] || 0;
                  const displayQuantity = cartQuantity + localQuantity;

                  return (
                  <div key={product._id} className="bg-white border border-1 border-[#D6DADE] overflow-hidden hover:shadow-md transition-shadow">

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
                        <div>{product.description}</div>
                        <div className='text-[10px] text-[#EE1C25] font-[500]'>
                          {cartQuantity > 0 && `${cartQuantity} Item already added to cart`}
                        </div>
                      </h3>
                      <div className='grid grid-cols-2 text-[#1a1e22] text-[13px]'>
                        <div className="">Kg/m</div>
                        <div className="text-right">{product.kgm || '40.0'}</div>
                        <div className="">Length(mm)</div>
                        <div className="text-right">{product.length || '1.673'}</div>
                        <p className="">SAP Code</p>
                        <div className="text-right">{product.sapCode}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1  bg-[#2F3A4F]">
                      {isAuthenticated && <div className="flex items-center text-white justify-between">
                        <div className="flex items-center gap-8">
                          <button
                            onClick={() => handleQuantityChange(product._id, Math.max(0, localQuantity - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#2F3A4F] text-center">{displayQuantity}</span>
                          <button
                            onClick={() => handleQuantityChange(product._id, localQuantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={localQuantity === 0}
                          className="px-4 py-2 bg-[#EE1C25] text-white rounded-lg hover:bg-[#0f3a4a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>}
                      {
                        !isAuthenticated && <div className="text-center">
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
        )}
      </div>

      <Footer />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-[#00000033] bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Product Image</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Product"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
