/**
 * API Usage Examples
 * This file demonstrates how to use the new Profile and Hardware APIs
 * based on your MongoDB backend models
 */

'use client';

import React, { useEffect, useState } from 'react';
import { 
  useProfilesData, 
  useHardwareData, 
  ProfileProduct, 
  HardwareProduct,
  ProfileListParams,
  HardwareListParams 
} from '../hooks';

// Example 1: Profile Products Component
export const ProfileProductsExample = () => {
  const { 
    loadProfileCategories, 
    loadCategoryProducts, 
    searchProfiles,
    loadFeaturedProfiles 
  } = useProfilesData();

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [products, setProducts] = useState<ProfileProduct[]>([]);
  const [loading, setLoading] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await loadProfileCategories();
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [loadProfileCategories]);

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const params: ProfileListParams = {
            page: 1,
            limit: 20,
            sortBy: 'part',
            sortOrder: 'asc'
          };
          const productsData = await loadCategoryProducts(selectedCategory, params);
          setProducts(productsData);
        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [selectedCategory, loadCategoryProducts]);

  const handleSearch = async (searchTerm: string) => {
    try {
      setLoading(true);
      const searchResults = await searchProfiles({
        q: searchTerm,
        category: selectedCategory,
        page: 1,
        limit: 20
      });
      setProducts(searchResults);
    } catch (error) {
      console.error('Error searching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Profile Products</h2>
      
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category:</label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search profiles..."
          onChange={(e) => handleSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      {/* Products List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded p-4">
              <h3 className="font-semibold">{product.part}</h3>
              <p className="text-sm text-gray-600">{product.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                  SAP: {product.sapCode}
                </span>
                <span className="text-xs bg-green-100 px-2 py-1 rounded ml-2">
                  {product.degree}
                </span>
              </div>
              <div className="mt-2 text-sm">
                <p>Weight: {product.kgm} kg/m</p>
                <p>Length: {product.length}</p>
                <p>Unit: {product.per}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 2: Hardware Products Component
export const HardwareProductsExample = () => {
  const { 
    loadHardwareProducts, 
    loadProductsBySubCategory, 
    searchHardware,
    getHardwareQuote 
  } = useHardwareData();

  const [products, setProducts] = useState<HardwareProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load hardware products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: HardwareListParams = {
          page: 1,
          limit: 20,
          sortBy: 'perticular',
          sortOrder: 'asc'
        };
        const productsData = await loadHardwareProducts(params);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading hardware products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [loadHardwareProducts]);

  const handleSubCategoryFilter = async (subCategory: string) => {
    try {
      setLoading(true);
      const productsData = await loadProductsBySubCategory(subCategory, {
        page: 1,
        limit: 20
      });
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading subcategory products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuote = async () => {
    if (selectedProducts.length === 0) return;

    try {
      const quantities = selectedProducts.map(() => 1); // Default quantity of 1
      const quote = await getHardwareQuote(selectedProducts, quantities);
      alert(`Total Quote: ₹${quote.totalQuote}`);
    } catch (error) {
      console.error('Error getting quote:', error);
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Hardware Products</h2>
      
      {/* Quote Button */}
      {selectedProducts.length > 0 && (
        <div className="mb-4">
          <button 
            onClick={handleGetQuote}
            className="bg-[#124657} text-white px-4 py-2 rounded"
          >
            Get Quote for {selectedProducts.length} items
          </button>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border rounded p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{product.perticular}</h3>
                  <p className="text-sm text-gray-600">{product.subCategory}</p>
                  <div className="mt-2">
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                      SAP: {product.sapCode}
                    </span>
                    <span className="text-xs bg-green-100 px-2 py-1 rounded ml-2">
                      {product.system}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="font-semibold text-green-600">₹{product.rate}</p>
                    <p>MOQ: {product.moq}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleProductSelection(product.id)}
                  className="ml-2"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example 3: Using Hooks with Real-time Data
export const RealTimeDataExample = () => {
  // This hook will automatically refresh data every 30 seconds
  const { 
    data: profileData, 
    loading: profileLoading, 
    startAutoRefresh: startProfileRefresh 
  } = useRealTimeProfiles('Casement', { limit: 10 });

  const { 
    data: hardwareData, 
    loading: hardwareLoading, 
    startAutoRefresh: startHardwareRefresh 
  } = useRealTimeHardware({ limit: 10 });

  useEffect(() => {
    // Start auto-refresh for both data sources
    const stopProfileRefresh = startProfileRefresh();
    const stopHardwareRefresh = startHardwareRefresh();

    // Cleanup on unmount
    return () => {
      stopProfileRefresh();
      stopHardwareRefresh();
    };
  }, [startProfileRefresh, startHardwareRefresh]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Real-time Data (Auto-refresh every 30s)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Latest Profiles</h3>
          {profileLoading ? (
            <div>Loading profiles...</div>
          ) : (
            <div className="space-y-2">
              {profileData?.slice(0, 5).map(product => (
                <div key={product.id} className="border rounded p-2">
                  <p className="font-medium">{product.part}</p>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Latest Hardware</h3>
          {hardwareLoading ? (
            <div>Loading hardware...</div>
          ) : (
            <div className="space-y-2">
              {hardwareData?.slice(0, 5).map(product => (
                <div key={product.id} className="border rounded p-2">
                  <p className="font-medium">{product.perticular}</p>
                  <p className="text-sm text-gray-600">₹{product.rate}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
