import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
