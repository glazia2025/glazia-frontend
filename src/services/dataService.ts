import { Product, User, Order } from '@/contexts/AppContext';

// ============================================================================
// MOCK PRODUCT DATA
// ============================================================================

export const mockProducts: Product[] = [
  // Aluminium Profiles
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
    category: 'Aluminium Profiles',
    description: 'High-performance UPVC window profile with excellent thermal insulation and energy efficiency.',
    features: ['Energy Efficient', 'Multi-Chamber', 'Lead-Free', 'Weather Resistant'],
    specifications: {
      'Profile Depth': '70mm',
      'Chambers': '3-chamber system',
      'Material': 'UPVC',
      'Thermal Conductivity': '0.13 W/mK',
      'Sound Insulation': '42 dB',
      'Security Class': 'RC2'
    },
    discount: 11,
    stockCount: 150
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
    category: 'Aluminium Profiles',
    description: 'Premium aluminum door profile with thermal break technology for superior performance.',
    features: ['Thermal Break', 'High Security', 'Weather Resistant', 'Corrosion Resistant'],
    specifications: {
      'Profile Depth': '80mm',
      'Material': 'Aluminum 6063-T5',
      'Thermal Break': 'Yes',
      'Finish': 'Powder Coated',
      'Load Capacity': '150 kg',
      'Security Class': 'RC3'
    },
    discount: 13,
    stockCount: 85
  },
  {
    id: '3',
    name: 'Composite Window Profile',
    brand: 'Glazia',
    price: 350,
    originalPrice: 400,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 180,
    inStock: true,
    category: 'Aluminium Profiles',
    description: 'Advanced composite window profile combining strength and insulation properties.',
    features: ['Composite Material', 'High Strength', 'Low Maintenance', 'UV Resistant'],
    specifications: {
      'Profile Depth': '75mm',
      'Material': 'Wood-Aluminum Composite',
      'Thermal Conductivity': '0.15 W/mK',
      'Fire Rating': 'B1',
      'Warranty': '25 years'
    },
    discount: 12,
    stockCount: 65
  },

  // Hardware Products
  {
    id: '4',
    name: 'Multi-Point Locking System',
    brand: 'Glazia',
    price: 1850,
    originalPrice: 2100,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 280,
    inStock: true,
    category: 'Hardware',
    description: 'Advanced multi-point locking system for enhanced security and smooth operation.',
    features: ['Anti-Theft', 'Smooth Operation', 'Durable', '5-Point Locking'],
    specifications: {
      'Locking Points': '5',
      'Material': 'Stainless Steel',
      'Finish': 'Satin Chrome',
      'Security Grade': 'Grade 1',
      'Operation': 'Key & Handle',
      'Warranty': '10 years'
    },
    discount: 12,
    stockCount: 45
  },
  {
    id: '5',
    name: 'Window Handle Set Premium',
    brand: 'Glazia',
    price: 850,
    originalPrice: 950,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 195,
    inStock: true,
    category: 'Hardware',
    description: 'Premium window handle set with key lock mechanism and ergonomic design.',
    features: ['Key Lock', 'Ergonomic Design', 'Anti-Corrosion', 'Easy Installation'],
    specifications: {
      'Material': 'Zinc Alloy',
      'Finish': 'Powder Coated',
      'Lock Type': 'Key Lock',
      'Handle Length': '120mm',
      'Load Capacity': '100 kg',
      'Color Options': '5'
    },
    discount: 11,
    stockCount: 120
  },
  {
    id: '6',
    name: 'Heavy Duty Hinges Set',
    brand: 'Glazia',
    price: 1200,
    originalPrice: 1350,
    image: '/api/placeholder/300/300',
    rating: 4.8,
    reviews: 145,
    inStock: true,
    category: 'Hardware',
    description: 'Heavy duty hinges designed for large windows and doors with smooth operation.',
    features: ['Heavy Duty', 'Smooth Operation', 'Adjustable', 'Weather Sealed'],
    specifications: {
      'Load Capacity': '200 kg',
      'Material': 'Stainless Steel 316',
      'Adjustment': '3D Adjustable',
      'Opening Angle': '180°',
      'Finish': 'Brushed Steel',
      'Set Contents': '3 Hinges'
    },
    discount: 11,
    stockCount: 75
  },
  {
    id: '7',
    name: 'Window Operator Mechanism',
    brand: 'Glazia',
    price: 950,
    originalPrice: 1100,
    image: '/api/placeholder/300/300',
    rating: 4.5,
    reviews: 98,
    inStock: true,
    category: 'Hardware',
    description: 'Precision window operator mechanism for casement and awning windows.',
    features: ['Precision Control', 'Weather Resistant', 'Low Maintenance', 'Smooth Operation'],
    specifications: {
      'Type': 'Casement Operator',
      'Material': 'Die-Cast Aluminum',
      'Gear Ratio': '4:1',
      'Opening Force': '150N',
      'Travel Distance': '300mm',
      'Finish': 'Anodized'
    },
    discount: 14,
    stockCount: 55
  },
  {
    id: '8',
    name: 'Door Closer System',
    brand: 'Glazia',
    price: 1450,
    originalPrice: 1600,
    image: '/api/placeholder/300/300',
    rating: 4.6,
    reviews: 167,
    inStock: true,
    category: 'Hardware',
    description: 'Automatic door closer system with adjustable closing speed and force.',
    features: ['Automatic Closing', 'Adjustable Speed', 'Fire Rated', 'Silent Operation'],
    specifications: {
      'Door Weight': 'Up to 120 kg',
      'Closing Force': 'EN 2-6',
      'Material': 'Aluminum Body',
      'Fire Rating': '4 hours',
      'Temperature Range': '-40°C to +60°C',
      'Warranty': '5 years'
    },
    discount: 9,
    stockCount: 40
  },
  {
    id: '9',
    name: 'Security Lock Cylinder',
    brand: 'Glazia',
    price: 650,
    originalPrice: 750,
    image: '/api/placeholder/300/300',
    rating: 4.7,
    reviews: 234,
    inStock: true,
    category: 'Hardware',
    description: 'High-security lock cylinder with anti-pick and anti-drill protection.',
    features: ['Anti-Pick', 'Anti-Drill', 'Bump Resistant', 'Master Key System'],
    specifications: {
      'Security Level': 'High Security',
      'Material': 'Brass',
      'Key System': 'Master Key Compatible',
      'Cylinder Length': '30/30mm',
      'Keys Included': '3',
      'Certification': 'EN 1303'
    },
    discount: 13,
    stockCount: 200
  },
  {
    id: '10',
    name: 'Weather Stripping Kit',
    brand: 'Glazia',
    price: 280,
    originalPrice: 320,
    image: '/api/placeholder/300/300',
    rating: 4.4,
    reviews: 89,
    inStock: true,
    category: 'Hardware',
    description: 'Complete weather stripping kit for enhanced insulation and energy efficiency.',
    features: ['Energy Efficient', 'Weather Resistant', 'Easy Installation', 'Long Lasting'],
    specifications: {
      'Material': 'EPDM Rubber',
      'Length': '10 meters',
      'Temperature Range': '-40°C to +120°C',
      'Compression': '25%',
      'Color': 'Black/White',
      'Adhesive': 'Included'
    },
    discount: 12,
    stockCount: 300
  },
  {
    id: '11',
    name: 'Glass Gasket System',
    brand: 'Glazia',
    price: 180,
    originalPrice: 200,
    image: '/api/placeholder/300/300',
    rating: 4.3,
    reviews: 67,
    inStock: true,
    category: 'Hardware',
    description: 'Professional glass gasket system for secure glass installation.',
    features: ['Secure Fit', 'Weather Sealed', 'UV Resistant', 'Professional Grade'],
    specifications: {
      'Material': 'EPDM',
      'Glass Thickness': '4-32mm',
      'Shore Hardness': '65±5',
      'Length': '50 meters',
      'Color': 'Black',
      'Profile': 'Various Sizes'
    },
    discount: 10,
    stockCount: 180
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
    description: 'Complete hardware kit for sliding window systems with smooth operation.',
    features: ['Smooth Sliding', 'Heavy Duty', 'Adjustable', 'Complete Kit'],
    specifications: {
      'Window Weight': 'Up to 150 kg',
      'Track Material': 'Aluminum',
      'Roller Type': 'Ball Bearing',
      'Track Length': '2 meters',
      'Adjustment': 'Height & Lateral',
      'Kit Contents': 'Complete Hardware'
    },
    discount: 10,
    stockCount: 60
  }
];

export class DataService {
  // Simulate API delay
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Products
  static async getProducts(): Promise<Product[]> {
    await this.delay();
    return mockProducts;
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    await this.delay();
    return mockProducts.slice(0, 8); // Return first 8 products as featured
  }

  static async getProductById(id: string): Promise<Product | null> {
    await this.delay();
    return mockProducts.find(product => product.id === id) || null;
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    await this.delay();
    if (category === 'All') return mockProducts;
    return mockProducts.filter(product => product.category === category);
  }

  // User
  static async getUserData(): Promise<User | null> {
    await this.delay();
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    // Try to get user data from localStorage first
    const savedUser = localStorage.getItem('glazia-user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }

  }
  // Orders
  static async getUserOrders(): Promise<Order[]> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No auth token, returning empty orders');
      return [];
    }

    try {
      const response = await fetch('https://api.glazia.in/api/user/getOrders?limit=10&page=1&sortOrder=desc&sortKey=createdAt', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status);
      }

      const data = await response.json();
      console.log('📦 Orders API Response:', data);
      console.log('📦 Number of orders in response:', data?.length || 0);

      // Transform API orders to app Order format
      if (data && Array.isArray(data)) {
        const transformedOrders = data.map((apiOrder: any) => ({
          id: apiOrder._id || apiOrder.id,
          date: apiOrder.createdAt ? new Date(apiOrder.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          }) : 'N/A',
          items: apiOrder.products?.map((product: any) => ({
            id: product.productId || product._id,
            name: product.description || product.name || 'Product',
            brand: 'Glazia',
            price: product.amount || 0,
            originalPrice: product.amount || 0,
            image: product.image || '/api/placeholder/300/300',
            quantity: product.quantity || 1,
            inStock: true,
            category: product.category || 'General'
          })) || [],
          total: apiOrder.totalAmount || 0,
          status: this.mapOrderStatus(apiOrder.status),
          statusText: this.formatOrderStatus(apiOrder.status),
          shippingAddress: apiOrder.user?.completeAddress || apiOrder.shippingAddress || 'N/A',
          trackingNumber: apiOrder.trackingNumber || undefined,
        }));

        console.log('✅ Transformed Orders:', transformedOrders);
        console.log('✅ Returning', transformedOrders.length, 'orders');
        return transformedOrders;
      }

      console.warn('⚠️ No orders array in response, returning mock orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getUserOrders();
    return orders.find(order => order.id === id) || null;
  }

  // Helper method to map API order status to app status
  private static mapOrderStatus(apiStatus: string): 'processing' | 'shipped' | 'delivered' | 'cancelled' {
    const statusMap: Record<string, 'processing' | 'shipped' | 'delivered' | 'cancelled'> = {
      'pending': 'processing',
      'confirmed': 'processing',
      'processing': 'processing',
      'shipped': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
    };
    return statusMap[apiStatus?.toLowerCase()] || 'processing';
  }

  // Helper method to format order status text
  private static formatOrderStatus(apiStatus: string): string {
    if (!apiStatus) return 'Processing';
    return apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1).toLowerCase().replace(/_/g, ' ');
  }



  // Categories
  static async getCategories(): Promise<string[]> {
    await this.delay();
    return ['All', 'Aluminium Profiles', 'Hardware'];
  }
}
