import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type Customer = {
  name: string;
  phone: string;
  address: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  first_order_date: string | null;
};

export type CustomersResponse = {
  customers: Customer[];
  total: number;
};

// Get all customers
export async function getCustomers(): Promise<CustomersResponse> {
  try {
    const response = await axios.get<CustomersResponse>(`${API}/customers/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch customers');
    }
    throw new Error('Network error: Failed to fetch customers');
  }
}


