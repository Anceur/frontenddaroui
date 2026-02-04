import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type LoyalCustomer = {
  id: number;
  name: string;
  phone: string;
  loyaltyCardNumber: string;
};

export type Order = {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Canceled';
  date: string;
  time: string;
  paymentMethod: string;
  notes?: string;
  loyalCustomer?: LoyalCustomer | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderResponse = {
  orders: Order[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type OrderStatusCounts = {
  All: number;
  Pending: number;
  Confirmed: number;
  Preparing: number;
  Ready: number;
  Delivered: number;
  Canceled: number;
};

export type CreateOrderData = {
  customer: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  status?: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Canceled';
  paymentMethod?: string;
  notes?: string;
  loyalCustomerId?: number | null;
};

export type UpdateOrderData = {
  customer?: string;
  phone?: string;
  address?: string;
  items?: string[];
  total?: number;
  status?: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Canceled';
  paymentMethod?: string;
  notes?: string;
  loyalCustomerId?: number | null;
};

// Get all orders with optional filters
export async function getOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}): Promise<OrderResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const queryString = queryParams.toString();
    const url = queryString ? `${API}/orders/?${queryString}` : `${API}/orders/`;
    const response = await axios.get<OrderResponse>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch orders');
    }
    throw new Error('Network error: Failed to fetch orders');
  }
}

// Get a single order by ID
export async function getOrder(orderId: string): Promise<Order> {
  try {
    const response = await axios.get<Order>(`${API}/orders/${orderId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch order');
    }
    throw new Error('Network error: Failed to fetch order');
  }
}

// Create a new order
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  try {
    const response = await axios.post<Order>(`${API}/orders/`, orderData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create order');
  }
}

// Update an order (full update)
export async function updateOrder(orderId: string, orderData: UpdateOrderData): Promise<Order> {
  try {
    const response = await axios.put<Order>(`${API}/orders/${orderId}/`, orderData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update order');
  }
}

// Partially update an order
export async function patchOrder(orderId: string, orderData: UpdateOrderData): Promise<Order> {
  try {
    const response = await axios.patch<Order>(`${API}/orders/${orderId}/`, orderData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update order');
  }
}

// Delete an order
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await axios.delete(`${API}/orders/${orderId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete order');
    }
    throw new Error('Network error: Failed to delete order');
  }
}

// Get order status counts
export async function getOrderStatusCounts(): Promise<OrderStatusCounts> {
  try {
    const response = await axios.get<OrderStatusCounts>(`${API}/orders/status-counts/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order status counts:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch order counts');
    }
    throw new Error('Network error: Failed to fetch order counts');
  }
}

