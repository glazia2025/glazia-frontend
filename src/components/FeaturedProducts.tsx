"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { useCartState } from "@/contexts/AppContext";
import { profileApi } from "@/services/profileApi";
import { ProfileProduct } from "@/services/api";

// Transform ProfileProduct to display format
interface DisplayProduct {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image?: string;
  category: string;
  inStock: boolean;
  discount?: number;
}

export default function FeaturedProducts() {
  const { addToCart, updateCartQuantity, removeFromCart, getCartItem } = useCartState();
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('🎯 Fetching featured products from API...');

        const response = await profileApi.getProfileOptions();
        console.log('📦 API Response:', response);

        if (response && response.data && response.data.categories) {
          // Extract all products from all categories
          const allProducts: DisplayProduct[] = [];

          Object.entries(response.data.categories).forEach(([categoryName, categoryData]: [string, any]) => {
            if (categoryData.products && Array.isArray(categoryData.products)) {
              categoryData.products.forEach((product: ProfileProduct) => {
                allProducts.push({
                  id: product.id,
                  name: product.description || product.part || 'Product',
                  brand: 'Glazia',
                  price: parseFloat(product.kgm?.toString() || '0') * 10, // Convert kgm to price
                  originalPrice: parseFloat(product.kgm?.toString() || '0') * 12,
                  rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
                  reviews: Math.floor(Math.random() * 300) + 100, // Random reviews 100-400
                  image: '/api/placeholder/300/300',
                  category: categoryName,
                  inStock: true,
                  discount: Math.floor(((parseFloat(product.kgm?.toString() || '0') * 12 - parseFloat(product.kgm?.toString() || '0') * 10) / (parseFloat(product.kgm?.toString() || '0') * 12)) * 100)
                });
              });
            }
          });

          // Take first 8 products
          const featuredProducts = allProducts.slice(0, 8);
          console.log('✅ Featured Products:', featuredProducts);
          setProducts(featuredProducts);
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: DisplayProduct) => {
    addToCart({
      id: product.id.toString(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: product.image || '/api/placeholder/300/300',
      inStock: product.inStock,
      category: product.category,
    });
  };

  const getCartItemById = (productId: string | number) => {
    return getCartItem(productId.toString());
  };

  const updateProductQuantity = (productId: string | number, quantity: number) => {
    updateCartQuantity(productId.toString(), quantity);
  };

  const removeProductFromCart = (productId: string | number) => {
    removeFromCart(productId.toString());
  };

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
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Windoor Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our best-selling windoor profiles and hardware solutions,
            trusted by professionals and contractors worldwide.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products available at the moment.</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.discount && product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium z-10">
                    {product.discount}% OFF
                  </div>
                )}
                
                {/* Placeholder for product image */}
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">{product.category}</span>
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">

                  <Link
                    href={`/products/${product.id}`}
                    className="p-2 bg-white text-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  {product.brand}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

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
                      ₹{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{product.originalPrice.toFixed(2)}
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
                            className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
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
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
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
        )}
      </div>
    </section>
  );
}
