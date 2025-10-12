"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { useCartState, useProducts } from "@/contexts/AppContext";



const allProducts = [
  {
    id: 1,
    name: "UPVC Window Profile 70mm Series",
    brand: "Glazia",
    price: 285,
    originalPrice: 320,
    rating: 4.9,
    reviews: 450,
    category: "Aluminium Profiles",
    inStock: true,
    discount: 11,
    features: ["Energy Efficient", "Multi-Chamber", "Lead-Free"]
  },
  {
    id: 2,
    name: "Aluminum Door Profile System",
    brand: "Glazia",
    price: 420,
    originalPrice: 480,
    rating: 4.8,
    reviews: 320,
    category: "Aluminium Profiles",
    inStock: true,
    discount: 13,
    features: ["Thermal Break", "High Security", "Weather Resistant"]
  },
  {
    id: 3,
    name: "Multi-Point Locking System",
    brand: "Glazia",
    price: 1850,
    originalPrice: 2100,
    rating: 4.7,
    reviews: 280,
    category: "Hardware",
    inStock: true,
    discount: 12,
    features: ["Anti-Theft", "Smooth Operation", "Durable"]
  },
  {
    id: 4,
    name: "Tilt & Turn Window Hardware Set",
    brand: "Glazia",
    price: 2250,
    originalPrice: 2500,
    rating: 4.9,
    reviews: 190,
    category: "Hardware",
    inStock: true,
    discount: 10,
    features: ["German Engineering", "Easy Maintenance", "Long-lasting"]
  },
  {
    id: 5,
    name: "Double Glazed Unit 24mm",
    brand: "Glazia",
    price: 180,
    originalPrice: 200,
    rating: 4.6,
    reviews: 350,
    category: "Hardware",
    inStock: true,
    discount: 10,
    features: ["Energy Saving", "Sound Insulation", "UV Protection"]
  },
  {
    id: 6,
    name: "EPDM Weather Seal 15mm",
    brand: "Glazia",
    price: 45,
    originalPrice: 52,
    rating: 4.5,
    reviews: 420,
    category: "Hardware",
    inStock: true,
    discount: 13,
    features: ["Weather Resistant", "Flexible", "Long-lasting"]
  },
  {
    id: 7,
    name: "Window Handle Espagnolette",
    brand: "Glazia",
    price: 320,
    originalPrice: 380,
    rating: 4.8,
    reviews: 240,
    category: "Hardware",
    inStock: true,
    discount: 16,
    features: ["Ergonomic Design", "Security Lock", "Premium Finish"]
  },
  {
    id: 8,
    name: "Composite Door Profile 80mm",
    brand: "Glazia",
    price: 650,
    originalPrice: 750,
    rating: 4.7,
    reviews: 160,
    category: "Aluminium Profiles",
    inStock: true,
    discount: 13,
    features: ["Insulated Core", "Recyclable", "Color Stable"]
  },
  {
    id: 9,
    name: "Window Sill Profile",
    brand: "Glazia",
    price: 95,
    originalPrice: 110,
    rating: 4.4,
    reviews: 180,
    category: "Hardware",
    inStock: true,
    discount: 14,
    features: ["Water Drainage", "Easy Installation", "UV Stable"]
  },
  {
    id: 10,
    name: "Structural Glazing Sealant",
    brand: "Glazia",
    price: 280,
    originalPrice: 320,
    rating: 4.6,
    reviews: 95,
    category: "Hardware",
    inStock: true,
    discount: 13,
    features: ["High Strength", "Weather Proof", "Clear Finish"]
  }
];

export default function ProductShowcase() {
  const { cart, addToCart, updateCartQuantity, removeFromCart, getCartItem } = useCartState();

  const { featuredProducts } = useProducts();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image || '/api/placeholder/300/300',
      inStock: product.inStock,
      category: product.category,
    });
  };



  const getCartItemById = (productId: number) => {
    return getCartItem(productId.toString());
  };

  const updateProductQuantity = (productId: number, quantity: number) => {
    updateCartQuantity(productId.toString(), quantity);
  };

  const removeProductFromCart = (productId: number) => {
    removeFromCart(productId.toString());
  };

  // Use featured products from global state, fallback to hardcoded if not loaded
  const productsToShow = featuredProducts.length > 0 ? featuredProducts.slice(0, 8) : allProducts;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Aluminium Product Range
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of aluminium profiles and hardware solutions,
            all manufactured by Glazia with premium quality and reliability.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsToShow.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium z-10">
                    {product.discount}% OFF
                  </div>
                )}
                
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{product.category}</span>
                </div>

                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">

                  <Link
                    href={`/products/${product.id}`}
                    className="p-2 bg-white text-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                <div className="text-sm text-[#124657} font-medium mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-2">
                  <div className="flex items-center mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${
                    product.inStock 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Add to Cart Button */}
                {(() => {
                  const cartItem = getCartItemById(product.id);
                  if (cartItem) {
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateProductQuantity(product.id, cartItem.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateProductQuantity(product.id, cartItem.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-[#124657} hover:bg-blue-700 text-white rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeProductFromCart(product.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="w-full bg-[#124657} hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    );
                  }
                })()}
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-[#124657} hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
}
