// NALCO API service for fetching pricing data

export interface NalcoDataPoint {
  id: number;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface NalcoCurrentData {
  id: number;
  nalcoPrice: number;
  date: string;
}

export interface NalcoGraphResponse {
  success: boolean;
  data: NalcoDataPoint[];
  message?: string;
}

export interface NalcoCurrentResponse {
  success: boolean;
  data: NalcoCurrentData;
  message?: string;
}

class NalcoApiService {
  private baseUrl = 'https://api.glazia.inapi/admin';

  /**
   * Fetch all NALCO graph data
   */
  async getNalcoGraphData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get-nalco-graph`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching NALCO graph data:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch NALCO graph data'
      };
    }
  }

  /**
   * Fetch latest NALCO data
   */
  async getCurrentNalcoData(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get-nalco`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching current NALCO data:', error);
      return {
        success: false,
        data: {
          id: 0,
          nalcoPrice: 0,
          date: '',
        },
        message: error instanceof Error ? error.message : 'Failed to fetch current NALCO data'
      };
    }
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  }
}

export const nalcoApiService = new NalcoApiService();
