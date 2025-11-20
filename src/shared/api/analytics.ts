import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type AnalyticsData = {
  sales_by_date: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  top_items: Array<{
    name: string;
    category: string;
    total_quantity: number;
    total_revenue: number;
  }>;
  orders_by_hour: Array<{
    hour: string;
    count: number;
  }>;
  average_order_value: number;
  total_revenue: number;
  total_orders: number;
};

// Get analytics data
export async function getAnalytics(days: number = 30): Promise<AnalyticsData> {
  try {
    const response = await axios.get<AnalyticsData>(`${API}/analytics/?days=${days}`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch analytics');
    }
    throw new Error('Network error: Failed to fetch analytics');
  }
}


