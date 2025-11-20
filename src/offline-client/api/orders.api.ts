import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-django-5ssb.onrender.com';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CreateOrderData = {
  customer: string;
  phone: string;
  address?: string;
  items: CartItem[];
  total: number;
  orderType?: 'delivery' | 'dine_in' | 'takeaway';
  tableNumber?: string;
};

export type OrderResponse = {
  success: boolean;
  message: string;
  order: {
    id: string;
    customer: string;
    phone: string;
    address: string;
    items: string[];
    total: number;
    status: string;
    orderType: string;
    tableNumber?: string;
    date: string;
    time: string;
  };
};

export async function createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
  try {
    const response = await axios.post<OrderResponse>(
      `${API_URL}/orders/public/`,
      {
        customer: orderData.customer,
        phone: orderData.phone,
        address: orderData.address || '',
        items: orderData.items,
        total: orderData.total,
        orderType: orderData.orderType || 'delivery',
        tableNumber: orderData.tableNumber || null,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create order');
  }
}

// Offline Order API (no customer data required)
export type CreateOfflineOrderData = {
  table_number: string;
  items: CartItem[];
  total: number;
  notes?: string;
};

export type OfflineOrderResponse = {
  success: boolean;
  message: string;
  order: {
    id: number;
    table: {
      id: number;
      number: string;
    };
    total: number;
    status: string;
    items: Array<{
      id: number;
      item: {
        id: number;
        name: string;
      };
      size: {
        id: number;
        size: string;
      } | null;
      quantity: number;
      price: number;
    }>;
    created_at: string;
    updated_at: string;
  };
};

export async function createOfflineOrder(orderData: CreateOfflineOrderData): Promise<OfflineOrderResponse> {
  try {
    const response = await axios.post<OfflineOrderResponse>(
      `${API_URL}/offline-orders/`,
      {
        table_number: orderData.table_number,
        items: orderData.items,
        total: orderData.total,
        notes: orderData.notes || '',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating offline order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create offline order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create offline order');
  }
}

