// Admin API Service for managing orders, products, and admin operations
import { apiClient, API_BASE_URL, API_ENDPOINTS, ProfileProduct, HardwareProduct, ProfileOptions, HardwareOptions } from './api';
import { profileApi } from './profileApi';
import { hardwareApi } from './hardwareApi';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: AdminOrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: string;
  notes?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  specifications?: any;
}

export interface AdminProduct {
  id: string;
  sapCode: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  isActive: boolean;
  inStock: boolean;
  specifications: any;
  createdAt: string;
  updatedAt: string;
  // Profile-specific fields
  part?: string;
  kgm?: number;
  degree?: string;
  per?: string;
  length?: string;
  unit?: string;
  // Hardware-specific fields
  perticular?: string;
  rate?: number;
  system?: string;
  moq?: string;
  type: 'profile' | 'hardware';
  image?: string;
  // Additional fields for ProfileTable compatibility
  _id?: string;
  categoryKey?: string;
  optionKey?: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  isActive: boolean;
  subCategories: AdminSubCategory[];
  productCount: number;
}

export interface AdminSubCategory {
  id: string;
  name: string;
  categoryId: string;
  isActive: boolean;
  productCount: number;
}

class AdminApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Orders Management
  async getAllOrders(): Promise<AdminOrder[]> {
    try {
      // Mock data for now - replace with actual API call
      const mockOrders: AdminOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+91 9876543210',
          status: 'pending',
          items: [
            {
              id: '1',
              productId: 'WP001',
              productName: 'Window Profile A1',
              category: 'Aluminium Profiles',
              quantity: 5,
              price: 1200
            }
          ],
          totalAmount: 6000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          shippingAddress: '123 Main St, City, State 12345'
        },
        {
          id: '2',
          orderNumber: 'ORD-002',
          customerName: 'Jane Smith',
          customerEmail: 'jane@example.com',
          customerPhone: '+91 9876543211',
          status: 'processing',
          items: [
            {
              id: '2',
              productId: 'HW001',
              productName: 'Door Handle Premium',
              category: 'Hardware',
              quantity: 2,
              price: 850
            }
          ],
          totalAmount: 1700,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
          shippingAddress: '456 Oak Ave, City, State 12346'
        }
      ];

      return mockOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: AdminOrder['status'], notes?: string): Promise<boolean> {
    try {
      // Mock API call - replace with actual implementation
      console.log(`Updating order ${orderId} to status: ${status}`, { notes });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Products Management
  async getAllProducts(): Promise<AdminProduct[]> {
    try {
      // Get both profiles and hardware data
      const [profilesResponse, hardwareResponse] = await Promise.all([
        profileApi.getProfileOptions(),
        hardwareApi.getHardwareOptions()
      ]);

      const products: AdminProduct[] = [];

      // Process profiles data
      if (profilesResponse.success && profilesResponse.data) {
        const profileOptions = profilesResponse.data;
        Object.entries(profileOptions.categories).forEach(([categoryName, category]) => {
          Object.entries(category.options).forEach(([optionName, option]) => {
            option.products.forEach((product: ProfileProduct) => {
              products.push({
                id: `profile_${product.id}`,
                sapCode: product.part || `PROF_${product.id}`,
                name: `${product.description} - ${product.part}`,
                description: product.description,
                category: 'Aluminium Profiles',
                subCategory: categoryName,
                price: product.kgm || 0,
                isActive: category.enabled && option.enabled,
                inStock: true,
                specifications: {
                  part: product.part,
                  kgm: product.kgm,
                  degree: product.degree,
                  per: product.per,
                  length: product.length,
                  unit: product.unit
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                part: product.part,
                kgm: product.kgm,
                degree: product.degree,
                per: product.per,
                length: product.length,
                unit: product.unit,
                type: 'profile' as const
              });
            });
          });
        });
      }

      // Process hardware data
      if (hardwareResponse.success && hardwareResponse.data) {
        const hardwareOptions = hardwareResponse.data;
        Object.entries(hardwareOptions.products).forEach(([optionName, productList]) => {
          productList.forEach((product: HardwareProduct) => {
            products.push({
              id: `hardware_${product.id}`,
              sapCode: product.sapCode,
              name: product.perticular,
              description: product.perticular,
              category: 'Hardware',
              subCategory: product.subCategory,
              price: product.rate,
              isActive: true, // Default to active, can be managed separately
              inStock: true,
              specifications: {
                system: product.system,
                moq: product.moq,
                rate: product.rate
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              perticular: product.perticular,
              rate: product.rate,
              system: product.system,
              moq: product.moq,
              type: 'hardware' as const
            });
          });
        });
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  async updateProductStatus(productId: string, isActive: boolean): Promise<boolean> {
    try {
      console.log(`Updating product ${productId} active status to: ${isActive}`);

      // Determine if it's a profile or hardware product
      const isProfile = productId.startsWith('profile_');
      const isHardware = productId.startsWith('hardware_');

      if (isProfile) {
        // For profiles, we need to update the category/option enabled status
        // This would require additional API endpoints on the backend
        console.log('Profile visibility update - would need backend API implementation');
      } else if (isHardware) {
        // For hardware, similar approach
        console.log('Hardware visibility update - would need backend API implementation');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return true;
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<AdminProduct>): Promise<boolean> {
    try {
      console.log(`Updating product ${productId}:`, updates);

      // Determine if it's a profile or hardware product
      const isProfile = productId.startsWith('profile_');
      const isHardware = productId.startsWith('hardware_');

      if (isProfile) {
        // For profiles, we would need to update the specific product in the ProfileOptions
        // This would require backend API endpoints for updating individual products
        console.log('Profile update - would need backend API implementation');
      } else if (isHardware) {
        // For hardware, similar approach
        console.log('Hardware update - would need backend API implementation');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      console.log(`Deleting product ${productId}`);

      // Determine if it's a profile or hardware product
      const isProfile = productId.startsWith('profile_');
      const isHardware = productId.startsWith('hardware_');

      if (isProfile) {
        // For profiles, we would need to remove the product from ProfileOptions
        // This would require backend API endpoints for deleting individual products
        console.log('Profile deletion - would need backend API implementation');
      } else if (isHardware) {
        // For hardware, similar approach
        console.log('Hardware deletion - would need backend API implementation');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async getAllCategories(): Promise<AdminCategory[]> {
    try {
      // Get both profiles and hardware data to build category structure
      const [profilesResponse, hardwareResponse] = await Promise.all([
        profileApi.getProfileOptions(),
        hardwareApi.getHardwareOptions()
      ]);

      const categories: AdminCategory[] = [];

      // Process profiles categories
      if (profilesResponse.success && profilesResponse.data) {
        const profileOptions = profilesResponse.data;
        const profileSubCategories: AdminSubCategory[] = [];
        let totalProfileProducts = 0;

        Object.entries(profileOptions.categories).forEach(([categoryName, category]) => {
          let categoryProductCount = 0;
          Object.values(category.options).forEach(option => {
            categoryProductCount += option.products.length;
          });

          profileSubCategories.push({
            id: `profile_${categoryName}`,
            name: categoryName,
            categoryId: 'profiles',
            isActive: category.enabled,
            productCount: categoryProductCount
          });

          totalProfileProducts += categoryProductCount;
        });

        categories.push({
          id: 'profiles',
          name: 'Aluminium Profiles',
          isActive: true,
          productCount: totalProfileProducts,
          subCategories: profileSubCategories
        });
      }

      // Process hardware categories
      if (hardwareResponse.success && hardwareResponse.data) {
        const hardwareOptions = hardwareResponse.data;
        const hardwareSubCategories: AdminSubCategory[] = [];
        let totalHardwareProducts = 0;

        // Group hardware products by subcategory
        const subCategoryGroups: Record<string, number> = {};
        Object.values(hardwareOptions.products).forEach(productList => {
          productList.forEach(product => {
            if (!subCategoryGroups[product.subCategory]) {
              subCategoryGroups[product.subCategory] = 0;
            }
            subCategoryGroups[product.subCategory]++;
            totalHardwareProducts++;
          });
        });

        Object.entries(subCategoryGroups).forEach(([subCategoryName, count]) => {
          hardwareSubCategories.push({
            id: `hardware_${subCategoryName}`,
            name: subCategoryName,
            categoryId: 'hardware',
            isActive: true,
            productCount: count
          });
        });

        categories.push({
          id: 'hardware',
          name: 'Hardware',
          isActive: true,
          productCount: totalHardwareProducts,
          subCategories: hardwareSubCategories
        });
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async updateCategoryStatus(categoryId: string, isActive: boolean): Promise<boolean> {
    try {
      console.log(`Updating category ${categoryId} active status to: ${isActive}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error updating category status:', error);
      throw error;
    }
  }

  async updateSubCategoryStatus(subCategoryId: string, isActive: boolean): Promise<boolean> {
    try {
      console.log(`Updating subcategory ${subCategoryId} active status to: ${isActive}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return true;
    } catch (error) {
      console.error('Error updating subcategory status:', error);
      throw error;
    }
  }

  // Dashboard Stats
  async getDashboardStats() {
    try {
      // Mock data - replace with actual API call
      return {
        totalOrders: 156,
        pendingOrders: 23,
        completedOrders: 133,
        totalProducts: 89,
        activeProducts: 76,
        totalRevenue: 245000,
        todayOrders: 8
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export const adminApiService = new AdminApiService();
