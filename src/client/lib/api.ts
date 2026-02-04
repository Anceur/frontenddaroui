import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  category: string;
  image?: string | null;
  featured?: boolean;
  sizes?: Array<{
    id: number;
    size: string;
    price: string | number;
  }>;
}

/**
 * Fetch all menu items from the public API endpoint
 */
export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  try {
    const response = await axios.get<MenuItem[]>(`${API_URL}/menu-items/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu items');
    }
    throw new Error('Network error: Failed to fetch menu items');
  }
};

/**
 * Fetch tables (if needed in the future)
 */
export const fetchTables = async () => {
  try {
    // TODO: Implement when tables endpoint is available
    const response = await axios.get(`${API_URL}/tables/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    throw new Error('Failed to fetch tables');
  }
};
export interface PromotionItem {
  id?: number;
  menu_item: number;
  menu_item_size?: number | null;
  menu_item_name?: string;
  size_label?: string;
  quantity: number;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  promotion_type: 'percentage' | 'fixed_amount' | 'combo_fixed_price';
  value: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  status: 'draft' | 'active' | 'archived';
  display_status: string;
  applicable_items: number[];
  applicable_sizes: number[];
  combo_items: PromotionItem[];
}

/**
 * Fetch all active promotions from the public API endpoint
 */
export const fetchPromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await axios.get<Promotion[]>(`${API_URL}/promotions/public/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching promotions:', error);
    return []; // Return empty array on error to avoid crashing client
  }
};

export const fetchRestaurantStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/public/restaurant-status/`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching restaurant status:', error);
    // If getting status fails, assume Open to fail safely? Or Closed?
    // Let's assume Open if status check fails (e.g. 500), but log it.
    // Or return default open.
    return { is_open: true };
  }
};
