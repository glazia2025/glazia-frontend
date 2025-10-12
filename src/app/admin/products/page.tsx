"use client";

import { useState, useEffect } from 'react';
import {
  Search,
  Package,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminApiService, AdminProduct, AdminCategory, AdminSubCategory } from '@/services/adminApi';

import { apiClient } from '@/services/api';

// Fixed hardware categories (same as hardware page)
const HARDWARE_CATEGORIES = [
  "CORNER JOINERY",
  "PLASTIC PART",
  "HANDLE",
  "LOCKING PARTS",
  "HINGES",
  "HANDLES",
  "ROLLERS"
];

export default function AdminProductsPage() {

  const [profileProducts, setProfileProducts] = useState<AdminProduct[]>([]);
  const [hardwareProducts, setHardwareProducts] = useState<AdminProduct[]>([]);
  const [profileCategories, setProfileCategories] = useState<AdminCategory[]>([]);
  const [hardwareCategories, setHardwareCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'profiles' | 'hardware'>('profiles');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);


  const loadData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'hardware') {
        // Only load hardware data if not already loaded
        if (hardwareProducts.length === 0) {
          await loadHardwareData();
        }
      } else {
        // Only load profiles data if not already loaded
        if (profileProducts.length === 0) {
          await loadProfilesData();
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or when active tab changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadProfilesData = async () => {
    try {
      console.log('🔄 Loading profiles data...');

      // Use the same API call as ProfileTable component
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      const response = await apiClient.get('/api/admin/getProducts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Profiles API response:', response);

      // Handle API response format
      let profileData: any = null;
      if (response && typeof response === 'object') {
        if ('categories' in response) {
          profileData = response.categories;
        } else if ('data' in response && response.data && 'categories' in response.data) {
          profileData = response.data.categories;
        } else {
          profileData = response;
        }
      }

      if (profileData) {
        const products: AdminProduct[] = [];
        const categories: AdminCategory[] = [];

        // Process profiles data following ProfileTable pattern
        Object.entries(profileData).forEach(([categoryName, categoryData]: [string, any]) => {
          let categoryProductCount = 0;
          const subCategories: AdminSubCategory[] = [];

          if (categoryData.options && Array.isArray(categoryData.options)) {
            // Handle options as array (like ProfileTable)
            categoryData.options.forEach((optionName: string) => {
              const optionProducts = categoryData.products?.[optionName] || [];

              optionProducts.forEach((product: any) => {
                products.push({
                  id: `profile_${optionName}_${product.id || product._id}`,
                  sapCode: product.sapCode || product.part || `PROF_${product.id}`,
                  name: `${product.description} - ${product.part || product.sapCode}`,
                  description: product.description,
                  category: categoryName,
                  subCategory: optionName,
                  price: categoryData.rate?.[optionName] || product.kgm || 0,
                  isActive: categoryData.catEnabled !== false && categoryData.enabled?.[optionName] !== false,
                  inStock: product.isEnabled !== false,
                  specifications: {
                    part: product.part,
                    kgm: product.kgm,
                    degree: product.degree,
                    per: product.per,
                    length: product.length,
                    rate: categoryData.rate?.[optionName]
                  },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  // Profile-specific fields
                  part: product.part,
                  kgm: product.kgm,
                  degree: product.degree,
                  per: product.per,
                  length: product.length,
                  unit: product.unit,
                  image: product.image,
                  type: 'profile' as const,
                  // Store original IDs for API calls
                  _id: product._id || product.id,
                  categoryKey: categoryName,
                  optionKey: optionName
                });
                categoryProductCount++;
              });

              // Add option as subcategory
              subCategories.push({
                id: `profile_option_${categoryName}_${optionName}`,
                name: optionName,
                categoryId: `profile_cat_${categoryName}`,
                isActive: categoryData.enabled?.[optionName] !== false,
                productCount: optionProducts.length
              });
            });
          }

          categories.push({
            id: `profile_cat_${categoryName}`,
            name: categoryName,
            isActive: categoryData.catEnabled !== false,
            productCount: categoryProductCount,
            subCategories: subCategories
          });
        });

        console.log('📦 Processed profiles:', { products: products.length, categories: categories.length });
        setProfileProducts(products);
        setProfileCategories(categories);
      }
    } catch (error) {
      console.error('❌ Error loading profiles:', error);
    }
  };

  const loadHardwareData = async () => {
    try {
      console.log('🔄 Loading hardware data...');
      const products: AdminProduct[] = [];
      const categories: AdminCategory[] = [];
      const subCategoryGroups: Record<string, any[]> = {};

      // Load hardware data for each category (following HardwareTable pattern)
      for (const category of HARDWARE_CATEGORIES) {
        try {
          console.log(`📡 Fetching hardware for category: ${category}`);
          const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
          const encodedCategory = encodeURIComponent(category);

          // Use same API pattern as HardwareTable
          const response = await apiClient.get(
            `/api/admin/getHardwares?reqOption=${encodedCategory}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(`✅ Hardware response for ${category}:`, response);

          // Handle API response format (following hardware page pattern)
          // Hardware page expects: response.products[category]
          let hardwareData: any = null;
          if (response && typeof response === 'object') {
            console.log(`📊 Full response for ${category}:`, response);

            // Check if response has products property with category key (like hardware page)
            if ('products' in response && response.products && response.products[category]) {
              hardwareData = response.products[category];
              console.log(`✅ Found products for ${category}:`, hardwareData);
            } else if ('data' in response && response.data) {
              const responseData = response.data;
              console.log(`📊 Response data for ${category}:`, responseData);

              // Check if data has products property for this category
              if (responseData.products && responseData.products[category]) {
                hardwareData = responseData.products[category];
              } else if (responseData[category]) {
                hardwareData = responseData[category];
              } else if (Array.isArray(responseData)) {
                hardwareData = responseData;
              }
            } else if (Array.isArray(response)) {
              hardwareData = response;
            } else {
              // Try to find products in any property
              Object.keys(response).forEach(key => {
                if (response[key] && Array.isArray(response[key]) && response[key].length > 0) {
                  console.log(`🔍 Found products array in key: ${key}`);
                  hardwareData = response[key];
                }
              });
            }
          }

          console.log(`🔍 Processed hardware data for ${category}:`, hardwareData);

          // Process products array (HardwareTable expects products array)
          if (hardwareData && Array.isArray(hardwareData) && hardwareData.length > 0) {
            console.log(`📦 Processing ${hardwareData.length} products for ${category}`);
            hardwareData.forEach((product: any) => {
              const subCategory = product.subCategory || category;

              if (!subCategoryGroups[subCategory]) {
                subCategoryGroups[subCategory] = [];
              }
              subCategoryGroups[subCategory].push(product);

              products.push({
                id: `hardware_${subCategory}_${product.id || product._id}`,
                sapCode: product.sapCode || `HW_${product.id}`,
                name: `${product.perticular || product.description || 'Hardware Item'} - ${product.sapCode}`,
                description: product.perticular || product.description || 'Hardware Item',
                category: category,
                subCategory: subCategory,
                price: product.rate || 0,
                isActive: true,
                inStock: true,
                specifications: {
                  perticular: product.perticular,
                  system: product.system,
                  moq: product.moq,
                  rate: product.rate
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                // Hardware-specific fields (from HardwareTable)
                perticular: product.perticular,
                rate: product.rate,
                system: product.system,
                moq: product.moq,
                image: product.image,
                type: 'hardware' as const,
                // Store original IDs for API calls
                _id: product._id || product.id,
                categoryKey: category,
                optionKey: subCategory
              });
            });
          } else {
            console.warn(`⚠️ No valid hardware data found for ${category}. Data:`, hardwareData);
          }
        } catch (categoryError) {
          console.error(`❌ Error loading hardware category ${category}:`, categoryError);
        }
      }

      // Create categories from subcategory groups
      Object.entries(subCategoryGroups).forEach(([subCategoryName, productList]) => {
        categories.push({
          id: `hardware_cat_${subCategoryName}`,
          name: subCategoryName,
          isActive: true,
          productCount: productList.length,
          subCategories: []
        });
      });

      console.log('📦 Processed hardware:', {
        products: products.length,
        categories: categories.length,
        productSample: products.slice(0, 2),
        categorySample: categories.slice(0, 2)
      });

      console.log('🔄 Setting hardware products:', products);
      setHardwareProducts(products);
      setHardwareCategories(categories);
    } catch (error) {
      console.error('❌ Error loading hardware:', error);
    }
  };

  const handleProductStatusUpdate = async (productId: string, isActive: boolean) => {
    try {
      setUpdatingStatus(productId);

      // Find the product to get its details
      const product = getCurrentProducts().find(p => p.id === productId);
      if (!product) return;

      if (product.type === 'profile' && product.categoryKey && product.optionKey) {
        // Use ProfileTable pattern for profiles
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        const updatedProduct = { ...product, isEnabled: isActive };

        await apiClient.put(
          `/api/admin/edit-product/${product.categoryKey}/${product.optionKey}/${product._id}`,
          {
            body: updatedProduct,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (product.type === 'hardware' && product.categoryKey) {
        // Use HardwareTable pattern for hardware (no specific status endpoint, use edit)
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        const updatedProduct = { ...product, isEnabled: isActive };

        await apiClient.put(
          `/api/admin/edit-hardware/${product.categoryKey}/${product._id}`,
          {
            body: updatedProduct,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Fallback to existing admin API
        await adminApiService.updateProductStatus(productId, isActive);
      }

      if (activeTab === 'profiles') {
        setProfileProducts(profileProducts.map(prod =>
          prod.id === productId
            ? { ...prod, isActive, updatedAt: new Date().toISOString() }
            : prod
        ));
      } else {
        setHardwareProducts(hardwareProducts.map(prod =>
          prod.id === productId
            ? { ...prod, isActive, updatedAt: new Date().toISOString() }
            : prod
        ));
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCategoryStatusUpdate = async (categoryId: string, isActive: boolean) => {
    try {
      setUpdatingStatus(categoryId);
      await adminApiService.updateCategoryStatus(categoryId, isActive);

      if (activeTab === 'profiles') {
        setProfileCategories(profileCategories.map(category =>
          category.id === categoryId
            ? { ...category, isActive }
            : category
        ));
      } else {
        setHardwareCategories(hardwareCategories.map(category =>
          category.id === categoryId
            ? { ...category, isActive }
            : category
        ));
      }
    } catch (error) {
      console.error('Error updating category status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSubCategoryStatusUpdate = async (subCategoryId: string, isActive: boolean) => {
    try {
      setUpdatingStatus(subCategoryId);
      await adminApiService.updateSubCategoryStatus(subCategoryId, isActive);

      if (activeTab === 'profiles') {
        setProfileCategories(profileCategories.map(category => ({
          ...category,
          subCategories: category.subCategories.map(subCat =>
            subCat.id === subCategoryId
              ? { ...subCat, isActive }
              : subCat
          )
        })));
      } else {
        setHardwareCategories(hardwareCategories.map(category => ({
          ...category,
          subCategories: category.subCategories.map(subCat =>
            subCat.id === subCategoryId
              ? { ...subCat, isActive }
              : subCat
          )
        })));
      }
    } catch (error) {
      console.error('Error updating subcategory status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleSaveProduct = async (updates: Partial<AdminProduct>) => {
    if (!selectedProduct) return;

    try {
      setUpdatingStatus(selectedProduct.id);

      if (selectedProduct.type === 'profile' && selectedProduct.categoryKey && selectedProduct.optionKey) {
        // Use ProfileTable pattern for profiles
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        await apiClient.put(
          `/api/admin/edit-product/${selectedProduct.categoryKey}/${selectedProduct.optionKey}/${selectedProduct._id}`,
          {
            body: { ...selectedProduct, ...updates },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (selectedProduct.type === 'hardware' && selectedProduct.categoryKey) {
        // Use HardwareTable pattern for hardware
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        await apiClient.put(
          `/api/admin/edit-hardware/${selectedProduct.categoryKey}/${selectedProduct._id}`,
          {
            body: { ...selectedProduct, ...updates },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Fallback to existing admin API
        await adminApiService.updateProduct(selectedProduct.id, updates);
      }

      if (activeTab === 'profiles') {
        setProfileProducts(profileProducts.map(product =>
          product.id === selectedProduct.id
            ? { ...product, ...updates, updatedAt: new Date().toISOString() }
            : product
        ));
      } else {
        setHardwareProducts(hardwareProducts.map(product =>
          product.id === selectedProduct.id
            ? { ...product, ...updates, updatedAt: new Date().toISOString() }
            : product
        ));
      }

      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      setUpdatingStatus(selectedProduct.id);

      if (selectedProduct.type === 'profile' && selectedProduct.categoryKey && selectedProduct.optionKey) {
        // Use ProfileTable pattern for profiles
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        await apiClient.delete(
          `/api/admin/delete-product/${selectedProduct.categoryKey}/${selectedProduct.optionKey}/${selectedProduct._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else if (selectedProduct.type === 'hardware' && selectedProduct.categoryKey) {
        // Use HardwareTable pattern for hardware
        const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
        await apiClient.delete(
          `/api/admin/delete-hardware/${selectedProduct.categoryKey}/${selectedProduct._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Fallback to existing admin API
        await adminApiService.deleteProduct(selectedProduct.id);
      }

      if (activeTab === 'profiles') {
        setProfileProducts(profileProducts.filter(product => product.id !== selectedProduct.id));
      } else {
        setHardwareProducts(hardwareProducts.filter(product => product.id !== selectedProduct.id));
      }

      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getCurrentProducts = () => {
    return activeTab === 'profiles' ? profileProducts : hardwareProducts;
  };

  const getCurrentCategories = () => {
    return activeTab === 'profiles' ? profileCategories : hardwareCategories;
  };

  const currentProducts = getCurrentProducts();
  console.log(`🔍 Current products for ${activeTab}:`, {
    count: currentProducts.length,
    sample: currentProducts.slice(0, 2),
    activeTab,
    searchQuery,
    categoryFilter
  });

  const filteredProducts = currentProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sapCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.subCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  console.log(`📋 Filtered products for ${activeTab}:`, {
    count: filteredProducts.length,
    sample: filteredProducts.slice(0, 2)
  });

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Products & Categories</h1>
            <button
              onClick={() => {
                // Force reload current tab data
                if (activeTab === 'hardware') {
                  setHardwareProducts([]);
                  setHardwareCategories([]);
                } else {
                  setProfileProducts([]);
                  setProfileCategories([]);
                }
                loadData();
              }}
              disabled={loading}
              className="admin-btn-primary px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh {activeTab === 'hardware' ? 'Hardware' : 'Profiles'}
            </button>
          </div>

          {/* Loading Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <div className="py-2 px-1 border-b-2 border-[#124657] text-[#124657] font-medium text-sm">
                Loading...
              </div>
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products & Categories</h1>
            <p className="text-gray-600">Manage your product catalog and categories</p>
          </div>
          <button className="bg-[#124657] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a4a] flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('profiles');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profiles'
                  ? 'border-[#124657] text-[#124657]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aluminium Profiles ({profileProducts.length})
              {loading && activeTab === 'profiles' && (
                <RefreshCw className="w-3 h-3 ml-2 animate-spin inline" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('hardware');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'hardware'
                  ? 'border-[#124657] text-[#124657]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Hardware ({hardwareProducts.length})
              {loading && activeTab === 'hardware' && (
                <RefreshCw className="w-3 h-3 ml-2 animate-spin inline" />
              )}
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} by name, SAP code, or description...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-form-input w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All {activeTab === 'profiles' ? 'Categories' : 'Subcategories'}</option>
                {getCurrentCategories().map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>



            {/* Products Table */}
            <div className="admin-table overflow-hidden">
              <div className="admin-table-container">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">SAP: {product.sapCode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{product.category}</div>
                            {product.subCategory && (
                              <div className="text-sm text-gray-500">{product.subCategory}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleProductStatusUpdate(product.id, !product.isActive)}
                              disabled={updatingStatus === product.id}
                              className={`${
                                product.isActive ? 'text-green-600' : 'text-gray-400'
                              } hover:opacity-75 disabled:opacity-50`}
                            >
                              {product.isActive ? (
                                <ToggleRight className="w-6 h-6" />
                              ) : (
                                <ToggleLeft className="w-6 h-6" />
                              )}
                            </button>
                            <span className={`text-sm ${
                              product.isActive ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProduct(product)}
                              className="text-[#124657] hover:text-[#0f3a4a] inline-flex items-center"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-800 inline-flex items-center"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} found
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery || categoryFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : `No ${activeTab} have been loaded yet. Check your API connection.`
                    }
                  </p>
                  {!searchQuery && categoryFilter === 'all' && (
                    <button
                      onClick={loadData}
                      className="mt-4 admin-btn-primary px-4 py-2 text-sm font-medium rounded-lg"
                    >
                      Retry Loading
                    </button>
                  )}
                </div>
              )}
            </div>

        {/* Category Management Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                {activeTab === 'profiles' ? 'Profile Categories' : 'Hardware Categories'}
              </h2>
              <button className="bg-[#124657] text-white px-4 py-2 rounded-lg hover:bg-[#0f3a4a] flex items-center text-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add {activeTab === 'profiles' ? 'Category' : 'Subcategory'}
              </button>
            </div>

            <div className="space-y-4">
              {getCurrentCategories().map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {category.subCategories.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedCategories.has(category.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.productCount} products</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCategoryStatusUpdate(category.id, !category.isActive)}
                          disabled={updatingStatus === category.id}
                          className={`admin-toggle ${
                            category.isActive ? 'text-green-600' : 'text-gray-400'
                          } hover:opacity-75 disabled:opacity-50`}
                        >
                          {category.isActive ? (
                            <ToggleRight className="w-6 h-6" />
                          ) : (
                            <ToggleLeft className="w-6 h-6" />
                          )}
                        </button>
                        <span className={`text-sm ${
                          category.isActive ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button className="text-[#124657] hover:text-[#0f3a4a] text-sm">
                        Edit
                      </button>
                    </div>
                  </div>

                  {expandedCategories.has(category.id) && category.subCategories.length > 0 && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          {activeTab === 'profiles' ? 'Options' : 'Products'}
                        </h4>
                        <div className="space-y-2">
                          {category.subCategories.map((subCategory) => (
                            <div key={subCategory.id} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div>
                                <span className="text-sm font-medium text-gray-900">{subCategory.name}</span>
                                <span className="text-sm text-gray-500 ml-2">({subCategory.productCount} products)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSubCategoryStatusUpdate(subCategory.id, !subCategory.isActive)}
                                  disabled={updatingStatus === subCategory.id}
                                  className={`admin-toggle ${
                                    subCategory.isActive ? 'text-green-600' : 'text-gray-400'
                                  } hover:opacity-75 disabled:opacity-50`}
                                >
                                  {subCategory.isActive ? (
                                    <ToggleRight className="w-5 h-5" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5" />
                                  )}
                                </button>
                                <span className={`text-xs ${
                                  subCategory.isActive ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {subCategory.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Product Modal */}
        {showViewModal && selectedProduct && (
          <div className="admin-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10050] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SAP Code</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProduct.sapCode}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedProduct.type}</p>
                      </div>
                      {selectedProduct.subCategory && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedProduct.subCategory}</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <p className="mt-1 text-sm text-gray-900">₹{selectedProduct.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                    <p className="text-sm text-gray-700">{selectedProduct.description}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Status</h3>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProduct.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedProduct.inStock
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  {selectedProduct.type === 'profile' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProduct.part && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Part</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.part}</p>
                          </div>
                        )}
                        {selectedProduct.kgm && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Weight (kg/m)</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.kgm}</p>
                          </div>
                        )}
                        {selectedProduct.degree && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Degree</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.degree}</p>
                          </div>
                        )}
                        {selectedProduct.length && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Length</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.length}</p>
                          </div>
                        )}
                        {selectedProduct.unit && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Unit</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.unit}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedProduct.type === 'hardware' && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Hardware Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProduct.system && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">System</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.system}</p>
                          </div>
                        )}
                        {selectedProduct.moq && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">MOQ</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedProduct.moq}</p>
                          </div>
                        )}
                        {selectedProduct.rate && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Rate</label>
                            <p className="mt-1 text-sm text-gray-900">₹{selectedProduct.rate.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Timestamps</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedProduct.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Updated At</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedProduct.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditProduct(selectedProduct);
                    }}
                    className="admin-btn-primary px-4 py-2 text-sm font-medium rounded-lg"
                  >
                    Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <div className="admin-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10050] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  const updates: any = {
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    sapCode: formData.get('sapCode') as string,
                    price: parseFloat(formData.get('price') as string),
                    isActive: formData.get('isActive') === 'on'
                  };

                  // Handle image file upload
                  const imageFile = formData.get('imageFile') as File;
                  if (imageFile && imageFile.size > 0) {
                    // Convert image to base64 for API
                    const reader = new FileReader();
                    reader.onload = () => {
                      updates.image = reader.result as string;

                      // Add profile-specific fields if it's a profile product
                      if (selectedProduct.type === 'profile') {
                        updates.part = formData.get('part') as string;
                        updates.degree = formData.get('degree') as string;
                        updates.per = formData.get('per') as string;
                        updates.kgm = parseFloat(formData.get('kgm') as string) || 0;
                        updates.length = formData.get('length') as string;
                        updates.unit = formData.get('unit') as string;
                      }

                      // Add hardware-specific fields if it's a hardware product
                      if (selectedProduct.type === 'hardware') {
                        updates.perticular = formData.get('perticular') as string;
                        updates.system = formData.get('system') as string;
                        updates.moq = formData.get('moq') as string;
                        updates.rate = parseFloat(formData.get('rate') as string) || 0;
                      }

                      handleSaveProduct(updates);
                    };
                    reader.readAsDataURL(imageFile);
                  } else {
                    // No new image uploaded, keep existing image
                    updates.image = selectedProduct.image;

                    // Add profile-specific fields if it's a profile product
                    if (selectedProduct.type === 'profile') {
                      updates.part = formData.get('part') as string;
                      updates.degree = formData.get('degree') as string;
                      updates.per = formData.get('per') as string;
                      updates.kgm = parseFloat(formData.get('kgm') as string) || 0;
                      updates.length = formData.get('length') as string;
                      updates.unit = formData.get('unit') as string;
                    }

                    // Add hardware-specific fields if it's a hardware product
                    if (selectedProduct.type === 'hardware') {
                      updates.perticular = formData.get('perticular') as string;
                      updates.system = formData.get('system') as string;
                      updates.moq = formData.get('moq') as string;
                      updates.rate = parseFloat(formData.get('rate') as string) || 0;
                    }

                    handleSaveProduct(updates);
                  }
                }}>
                  <div className="space-y-4">
                    {/* Basic Product Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SAP Code *
                        </label>
                        <input
                          type="text"
                          name="sapCode"
                          defaultValue={selectedProduct.sapCode}
                          className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={selectedProduct.name}
                          className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        defaultValue={selectedProduct.description}
                        rows={3}
                        className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image *
                      </label>
                      <input
                        type="file"
                        name="imageFile"
                        accept="image/*"
                        className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Validate file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size must be less than 5MB');
                              e.target.value = '';
                              return;
                            }

                            // Validate file type
                            if (!file.type.startsWith('image/')) {
                              alert('Please select a valid image file');
                              e.target.value = '';
                              return;
                            }

                            // Create preview
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const preview = document.getElementById('imagePreview') as HTMLImageElement;
                              if (preview && event.target?.result) {
                                preview.src = event.target.result as string;
                                preview.style.display = 'block';
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
                      </p>

                      {/* Image Preview */}
                      <div className="mt-3">
                        <img
                          id="imagePreview"
                          src={selectedProduct.image || ''}
                          alt="Product preview"
                          className="w-24 h-24 object-cover rounded border"
                          style={{ display: selectedProduct.image ? 'block' : 'none' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {!selectedProduct.image && (
                          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="price"
                          defaultValue={selectedProduct.price}
                          step="0.01"
                          className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        />
                      </div>

                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          name="isActive"
                          defaultChecked={selectedProduct.isActive}
                          className="h-4 w-4 text-[#124657] focus:ring-[#124657] border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Product is active
                        </label>
                      </div>
                    </div>

                    {/* Profile-specific fields */}
                    {selectedProduct.type === 'profile' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Profile Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Part
                            </label>
                            <input
                              type="text"
                              name="part"
                              defaultValue={selectedProduct.part || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Degree
                            </label>
                            <input
                              type="text"
                              name="degree"
                              defaultValue={selectedProduct.degree || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Per
                            </label>
                            <input
                              type="text"
                              name="per"
                              defaultValue={selectedProduct.per || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              KGM
                            </label>
                            <input
                              type="number"
                              name="kgm"
                              defaultValue={selectedProduct.kgm || 0}
                              step="0.001"
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Length
                            </label>
                            <input
                              type="text"
                              name="length"
                              defaultValue={selectedProduct.length || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              name="unit"
                              defaultValue={selectedProduct.unit || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hardware-specific fields */}
                    {selectedProduct.type === 'hardware' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Hardware Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Particular
                            </label>
                            <input
                              type="text"
                              name="perticular"
                              defaultValue={selectedProduct.perticular || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              System
                            </label>
                            <input
                              type="text"
                              name="system"
                              defaultValue={selectedProduct.system || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              MOQ
                            </label>
                            <input
                              type="text"
                              name="moq"
                              defaultValue={selectedProduct.moq || ''}
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rate
                            </label>
                            <input
                              type="number"
                              name="rate"
                              defaultValue={selectedProduct.rate || 0}
                              step="0.01"
                              className="admin-form-input w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Product Metadata */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Product Information</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Category:</strong> {selectedProduct.category}</p>
                        <p><strong>Type:</strong> {selectedProduct.type}</p>
                        {selectedProduct.subCategory && (
                          <p><strong>Subcategory:</strong> {selectedProduct.subCategory}</p>
                        )}
                        <p><strong>Created:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                        <p><strong>Updated:</strong> {new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingStatus === selectedProduct.id}
                      className="admin-btn-primary px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50"
                    >
                      {updatingStatus === selectedProduct.id ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Product Modal */}
        {showDeleteModal && selectedProduct && (
          <div className="admin-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10050] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Delete Product</h2>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Are you sure you want to delete this product? This action cannot be undone.
                  </p>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">SAP Code: {selectedProduct.sapCode}</p>
                    <p className="text-sm text-gray-600">Category: {selectedProduct.category}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={updatingStatus === selectedProduct.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {updatingStatus === selectedProduct.id ? 'Deleting...' : 'Delete Product'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
