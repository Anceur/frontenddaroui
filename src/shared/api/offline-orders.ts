import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type OfflineOrderItem = {
  id: number;
  item: {
    id: number;
    name: string;
    image?: string | null;
  };
  size?: {
    id: number;
    size: string;
    price: number;
  } | null;
  quantity: number;
  price: number;
  notes: string;
};

export type OfflineOrder = {
  id: number;
  table: {
    id: number;
    number: string;
    capacity: number;
    is_available: boolean;
    location: string;
  };
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Canceled';
  notes: string;
  items: OfflineOrderItem[];
  created_at: string;
  updated_at: string;
};

export type OfflineOrderFilters = {
  status?: string;
  search?: string;
};

// Get all offline orders (admin view)
export async function getOfflineOrders(filters?: OfflineOrderFilters): Promise<OfflineOrder[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    
    const url = `${API}/offline-orders/admin/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get<OfflineOrder[]>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offline orders:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch offline orders');
    }
    throw new Error('Network error: Failed to fetch offline orders');
  }
}

// Get a single offline order
export async function getOfflineOrder(orderId: number): Promise<OfflineOrder> {
  try {
    const response = await axios.get<OfflineOrder>(`${API}/offline-orders/${orderId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching offline order:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Offline order not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch offline order');
    }
    throw new Error('Network error: Failed to fetch offline order');
  }
}

// Update offline order status
export async function updateOfflineOrderStatus(orderId: number, status: string): Promise<OfflineOrder> {
  try {
    const response = await axios.patch<OfflineOrder>(
      `${API}/offline-orders/${orderId}/`,
      { status },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating offline order status:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Offline order not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to update offline order');
    }
    throw new Error('Network error: Failed to update offline order');
  }
}


