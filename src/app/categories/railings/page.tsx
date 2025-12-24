'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Eye } from 'lucide-react';
import { useAuth, useCartState } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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

export default function RailingsPage() {
  const [categoryData, setCategoryData] = useState<CategoryFullData | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const { isAuthenticated } = useAuth();
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


  // Load category data when a category is selected
  useEffect(() => {
    const loadCategoryData = async () => {

      try {
        setLoadingCategoryData(true);
        console.log('Loading category data for:', '693518ad370bc6374fda2168');
        const response = await profileApi.getCategoryFullData('693518ad370bc6374fda2168');
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
  }, [profileApi]);

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
    if (!selectedSize) return 0;
    const cartItemId = `${product.sapCode}-Railings-${selectedSize}`;
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
      id: `${product.sapCode}-Railings-${selectedSize}`,
      name: product.description,
      brand: 'Glazia',
      price: rate.toString(),
      originalPrice: rate,
      image: product.image || '/api/placeholder/300/300',
      inStock: true,
      category: `Railings - ${selectedSize}`,
      subCategory: 'Railings',
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

  const productsToDisplay = getFilteredProducts();


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
            <span className="text-gray-900">Railings</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Railings</h1>
              <p className="text-gray-600">High Quality Aluminium railings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Size Selection */}
        {categoryData && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Sub Category</h2>
            {loadingCategoryData ? (
              <div className="space-y-3">
                <div className="text-center text-sm text-gray-600">Loading sub category...</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`size-skeleton-${index}`}
                      className="h-12 rounded-lg border-2 border-gray-200 bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categoryData.sizes.map((sizeData) => sizeData.size.enabled && (
                  <button
                    key={sizeData.size._id}
                    onClick={() => setSelectedSize(sizeData.size.label)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      selectedSize === sizeData.size.label
                        ? 'border-[#124657] bg-[#124657] text-white'
                        : 'border-gray-200 hover:border-[#124657] hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{sizeData.size.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search */}
        {selectedSize && (
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
        )}

        {/* Products */}
        {(selectedSize || loadingCategoryData) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              Products - Railings {selectedSize ? `(${selectedSize})` : ''}
            </h2>

            <h3 style={{marginBottom: '12px'}}>
              Rate: {isAuthenticated  ? `₹${((nalcoPrice / 1000) + 75 + getAdjustedItemPrice({category: 'Railings', subCategory: selectedSize})).toFixed(2)}` : 'Login to view rate'}
            </h3>

            {loadingCategoryData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsToDisplay.map((product) => {
                  const cartQuantity = getCartQuantityForProduct(product);
                  const localQuantity = quantities[product._id] || 0;
                  const displayQuantity = cartQuantity + localQuantity;

                  return (
                  <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

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

                    <div className='p-3'>
                      <div className="grid grid-cols-2 gap-1 text-xs mb-3">
                        <div className="bg-gray-100 p-1 text-center font-medium">Kg/m</div>
                        <div className="bg-gray-100 p-1 text-center font-medium">Length(mm)</div>
                        <div className="bg-white p-1 text-center border">{product.kgm || '40.0'}</div>
                        <div className="bg-white p-1 text-center border">{product.length || '1.673'}</div>
                      </div>

                      <div className=" mb-3">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{product.description}</h3>
                        <p className="text-xs text-gray-600">SAP Code: {product.sapCode}</p>
                        {cartQuantity > 0 && (
                          <p className="text-xs font-medium" style={{ color: '#124657' }}>
                            ✓ {cartQuantity} in cart
                          </p>
                        )}
                      </div>

                      <div className="">
                      {isAuthenticated && <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(product._id, Math.max(0, localQuantity - 1))}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{displayQuantity}</span>
                          <button
                            onClick={() => handleQuantityChange(product._id, localQuantity + 1)}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={localQuantity === 0}
                          className="px-4 py-2 bg-[#124657] text-white rounded-lg hover:bg-[#0f3a4a] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                    
                  </div>
                );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseModal}>
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
    </div>
  );
}
