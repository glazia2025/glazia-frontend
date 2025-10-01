'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Eye, Plus, Minus, X } from 'lucide-react';
import { useCartState, useProducts } from '@/contexts/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsPage() {
  const { cart, addToCart, removeFromCart, updateCartQuantity, getCartItem } = useCartState();
  const { products } = useProducts();

  console.log(products, 'products');
  
  // Sample products from both categories
  const allProducts = [
    // Windoor Profiles
    {
      id: '1',
      name: 'UPVC Window Profile 70mm Series',
      brand: 'Glazia',
      price: 285,
      originalPrice: 320,
      image: '/api/placeholder/300/300',
      rating: 4.9,
      reviews: 450,
      inStock: true,
      category: 'Windoor Profiles',
      description: 'High-performance UPVC window profile with excellent thermal insulation'
    },
    {
      id: '2',
      name: 'Aluminum Door Profile System',
      brand: 'Glazia',
      price: 420,
      originalPrice: 480,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 320,
      inStock: true,
      category: 'Windoor Profiles',
      description: 'Premium aluminum door profile with thermal break technology'
    },
    {
      id: '3',
      name: 'Composite Window Frame Profile',
      brand: 'Glazia',
      price: 350,
      originalPrice: 400,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 280,
      inStock: true,
      category: 'Windoor Profiles',
      description: 'Advanced composite profile combining strength and insulation'
    },
    {
      id: '4',
      name: 'Thermal Break Door Profile',
      brand: 'Glazia',
      price: 520,
      originalPrice: 580,
      image: '/api/placeholder/300/300',
      rating: 4.9,
      reviews: 195,
      inStock: true,
      category: 'Windoor Profiles',
      description: 'Energy-efficient door profile with superior thermal performance'
    },
    // Hardware Products
    {
      id: '5',
      name: 'Multi-Point Locking System',
      brand: 'Glazia',
      price: 4500,
      originalPrice: 5200,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 156,
      inStock: true,
      category: 'Hardware',
      description: 'Advanced multi-point locking system for enhanced security'
    },
    {
      id: '6',
      name: 'Window Handle Set',
      brand: 'Glazia',
      price: 850,
      originalPrice: 950,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 89,
      inStock: true,
      category: 'Hardware',
      description: 'Premium window handle with key lock mechanism'
    },
    {
      id: '7',
      name: 'Heavy Duty Hinges',
      brand: 'Glazia',
      price: 1200,
      originalPrice: 1400,
      image: '/api/placeholder/300/300',
      rating: 4.9,
      reviews: 203,
      inStock: true,
      category: 'Hardware',
      description: 'Heavy duty hinges for large doors and windows'
    },
    {
      id: '8',
      name: 'Friction Stay Set',
      brand: 'Glazia',
      price: 650,
      originalPrice: 750,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 124,
      inStock: true,
      category: 'Hardware',
      description: 'Adjustable friction stay for casement windows'
    },
    {
      id: '9',
      name: 'Door Closer System',
      brand: 'Glazia',
      price: 3200,
      originalPrice: 3600,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 78,
      inStock: true,
      category: 'Hardware',
      description: 'Automatic door closer with adjustable speed control'
    },
    {
      id: '10',
      name: 'Window Operator',
      brand: 'Glazia',
      price: 2100,
      originalPrice: 2400,
      image: '/api/placeholder/300/300',
      rating: 4.5,
      reviews: 95,
      inStock: true,
      category: 'Hardware',
      description: 'Manual window operator for awning windows'
    },
    {
      id: '11',
      name: 'UPVC Door Profile 80mm Series',
      brand: 'Glazia',
      price: 380,
      originalPrice: 420,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 267,
      inStock: true,
      category: 'Windoor Profiles',
      description: 'Premium UPVC door profile with enhanced security features'
    },
    {
      id: '12',
      name: 'Sliding Window Hardware Kit',
      brand: 'Glazia',
      price: 1800,
      originalPrice: 2000,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 142,
      inStock: true,
      category: 'Hardware',
      description: 'Complete hardware kit for sliding window systems'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All' 
    ? allProducts 
    : allProducts.filter(product => product.category === selectedCategory);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  // Get cart item quantity
  const getCartItemQuantity = (productId: string) => {
    if (!cart || !cart.items) return 0;
    const cartItem = cart.items.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle add to cart
  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      inStock: product.inStock,
      category: product.category
    });
  };

  // Handle quantity update
  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateCartQuantity(productId, newQuantity);
    }
  };

  const categories = ['All', 'Windoor Profiles', 'Hardware'];

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
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">All Products</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our complete range of windoor profiles and hardware solutions manufactured by Glazia
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(1);
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-300'
                  }`}
                >
                  {category}
                  {category !== 'All' && (
                    <span className="ml-2 text-sm opacity-75">
                      ({allProducts.filter(p => p.category === category).length})
                    </span>
                  )}
                  {category === 'All' && (
                    <span className="ml-2 text-sm opacity-75">
                      ({allProducts.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Products Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {currentProducts.length} of {filteredProducts.length} products
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {currentProducts.map((product) => {
              const cartQuantity = getCartItemQuantity(product.id);
              const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative aspect-square bg-gray-200 flex items-center justify-center">
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium z-10">
                        {discount}% OFF
                      </div>
                    )}
                    <span className="text-gray-500 font-medium">{product.category}</span>
                    <div className="absolute top-2 right-2 flex flex-col gap-2">

                      <Link 
                        href={`/products/${product.id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <p className="text-sm text-blue-600 font-medium">{product.brand}</p>
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">In Stock</span>
                      </div>
                    </div>
                    
                    {cartQuantity === 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => handleQuantityUpdate(product.id, cartQuantity - 1)}
                            className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 font-medium">{cartQuantity}</span>
                          <button
                            onClick={() => handleQuantityUpdate(product.id, cartQuantity + 1)}
                            className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
