import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type DashboardStats = {
  orders_today: number;
  revenue_today: number;
  pending_orders: number;
  active_staff: number;
  recent_orders: Array<{
    id: number;
    customer: string;
    status: string;
    total: number;
    created_at: string;
    order_type: string;
  }>;
  top_items: Array<{
    item__name: string;
    total_quantity: number;
  }>;
  status_counts: Record<string, number>;
  low_stock_ingredients: Array<{
    id: number;
    name: string;
    stock: number;
    reorder_level: number;
    unit: string;
  }>;
};

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await axios.get<DashboardStats>(`${API}/dashboard/stats/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch dashboard statistics');
    }
    throw new Error('Network error: Failed to fetch dashboard statistics');
  }
}


