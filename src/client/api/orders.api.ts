import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

