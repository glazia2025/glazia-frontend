'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star,

  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { useCartState, useProducts } from '@/contexts/AppContext';

export default function ProductDetailPage() {
  const params = useParams();
  const { cart, addToCart, updateCartQuantity, removeFromCart, getCartItem } = useCartState();

  const { products } = useProducts();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');

  // Mock product data - in real app, fetch based on params.id
  const product = {
    id: params.id,
    name: 'Rehau UPVC Window Profile System',
    brand: 'Rehau',
    category: 'Windoor Profiles',
    price: 2850,
    originalPrice: 3200,
    discount: 11,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stockCount: 45,
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    features: [
      '3-chamber system for superior insulation',
      'Thermal break technology',
      'Weather resistant UPVC material',
      'Energy efficient design',
      'Easy maintenance and cleaning',
      'Available in multiple colors'
    ],
    specifications: {
      'Material': 'UPVC',
      'Profile System': '3-Chamber',
      'Thermal Break': 'Yes',
      'Glass Thickness': '24mm',
      'Color Options': 'White, Brown, Anthracite',
      'Warranty': '10 Years',
      'Certification': 'IS 13210:1991',
      'Origin': 'Germany'
    },
    description: `The Rehau UPVC Window Profile System represents the pinnacle of German engineering in window technology. This premium 3-chamber profile system offers exceptional thermal insulation, weather resistance, and durability. 

    Designed for the Indian climate, this profile system provides superior energy efficiency while maintaining aesthetic appeal. The advanced UPVC formulation ensures long-lasting performance with minimal maintenance requirements.

    Perfect for residential and commercial applications, this system supports various glazing options and hardware configurations to meet diverse architectural requirements.`,
    relatedProducts: [
      { id: 2, name: 'Schuco Aluminum Window Profile', price: 3450, image: '/api/placeholder/200/200' },
      { id: 3, name: 'UPVC Casement Window Profile', price: 2200, image: '/api/placeholder/200/200' },
      { id: 13, name: 'Maco Window Handle Set', price: 850, image: '/api/placeholder/200/200' }
    ]
  };

  const reviews = [
    {
      id: 1,
      user: 'Rajesh Kumar',
      rating: 5,
      date: '2024-01-10',
      comment: 'Excellent quality profile system. Very satisfied with the thermal insulation properties.',
      verified: true
    },
    {
      id: 2,
      user: 'Priya Sharma',
      rating: 4,
      date: '2024-01-05',
      comment: 'Good product, easy installation. The finish quality is impressive.',
      verified: true
    },
    {
      id: 3,
      user: 'Amit Patel',
      rating: 5,
      date: '2023-12-28',
      comment: 'Perfect for our project requirements. Rehau quality is always reliable.',
      verified: true
    }
  ];

  // Cart functionality
  const cartItem = getCartItem(product.id.toString());

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      inStock: product.inStock,
      category: product.category,
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(product.id.toString());
    } else {
      updateCartQuantity(product.id.toString(), newQuantity);
    }
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product.id.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-blue-600">Categories</Link>
            <span className="mx-2">/</span>
            <Link href="/categories/windoor-profiles" className="hover:text-blue-600">Windoor Profiles</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative bg-white rounded-lg shadow-sm overflow-hidden mb-4">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">{product.name}</span>
              </div>
              {product.discount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-200 rounded-lg border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <span className="text-xs text-gray-500">Image {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{product.brand} • {product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                  {product.discount && (
                    <span className="text-green-600 font-medium">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">In Stock ({product.stockCount} available)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                {(() => {
                  if (cartItem) {
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleUpdateQuantity(cartItem.quantity - 1)}
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-16 text-center font-medium">{cartItem.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(cartItem.quantity + 1)}
                            className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          ✓ {cartItem.quantity} item(s) in cart
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-16 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mb-8">
                {(() => {
                  if (cartItem) {
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <span className="text-green-700 font-medium">
                            ✓ Added to Cart ({cartItem.quantity} items)
                          </span>
                          <button
                            onClick={handleRemoveFromCart}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            href="/cart"
                            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                          >
                            View Cart
                          </Link>
                          <Link
                            href="/checkout"
                            className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-center"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => {
                          for (let i = 0; i < quantity; i++) {
                            handleAddToCart();
                          }
                        }}
                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                          product.inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-5 h-5 inline mr-2" />
                        Add {quantity > 1 ? `${quantity} items` : '1 item'} to Cart
                      </button>
                    );
                  }
                })()}

                <div className="grid grid-cols-1 gap-4">

                  <button className="py-3 px-6 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    <Phone className="w-5 h-5 inline mr-2" />
                    Call for Quote
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">10 Year Warranty</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['description', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      selectedTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {selectedTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">{key}</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      Write Review
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{review.user}</span>
                            {review.verified && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-center px-4">{relatedProduct.name}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{relatedProduct.name}</h3>
                  <p className="text-lg font-bold text-gray-900">₹{relatedProduct.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
