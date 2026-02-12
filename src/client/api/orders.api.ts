import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backenddaroui.onrender.com';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type SecurityToken = {
  timestamp: number;
  nonce: string;
  signature: string;
};

export type CreateOrderData = {
  customer: string;
  phone: string;
  address?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  orderType?: 'delivery' | 'dine_in' | 'takeaway';
  tableNumber?: string;
  notes?: string;
  loyalty_number?: string;
  security_token?: SecurityToken;
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
    subtotal: number;
    tax_amount: number;
    total: number;
    status: string;
    orderType: string;
    tableNumber?: string;
    notes?: string;
    loyalty_number?: string;
    date: string;
    time: string;
  };
};

export async function getSecurityToken(): Promise<SecurityToken> {
  try {
    const response = await axios.get<{ success: boolean; security_token: SecurityToken }>(
      `${API_URL}/orders/security-token/`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false, // Public endpoint, no credentials needed
      }
    );

    if (!response.data || !response.data.security_token) {
      console.error('Invalid security token response:', response.data);
      throw new Error('Invalid security token response from server');
    }

    return response.data.security_token;
  } catch (error: any) {
    console.error('Error fetching security token:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${API_URL}/orders/security-token/`
    });

    if (error.response) {
      // Server responded with error
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to get security token';
      throw new Error(`${errorMessage}. Please refresh and try again.`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Could not reach server. Please check your connection and try again.');
    } else {
      // Something else happened
      throw new Error(`Failed to get security token: ${error.message}. Please refresh and try again.`);
    }
  }
}

export async function createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
  try {
    const response = await axios.post<OrderResponse>(
      `${API_URL}/orders/public/`,
      {
        customer: orderData.customer,
        phone: orderData.phone,
        address: orderData.address || '',
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        total: orderData.total,
        orderType: orderData.orderType || 'delivery',
        tableNumber: orderData.tableNumber || null,
        notes: orderData.notes || '',
        ...(orderData.loyalty_number && { loyalty_number: orderData.loyalty_number }),
        security_token: orderData.security_token,
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
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: `${API_URL}/orders/public/`
    });

    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create order';
      const details = error.response.data?.details;
      const detail = error.response.data?.detail;

      // Build detailed error message
      let fullErrorMessage = errorMessage;
      if (details) {
        if (typeof details === 'string') {
          fullErrorMessage += `: ${details}`;
        } else if (Array.isArray(details)) {
          fullErrorMessage += `: ${details.join(', ')}`;
        } else {
          fullErrorMessage += `: ${JSON.stringify(details)}`;
        }
      } else if (detail) {
        fullErrorMessage += `: ${detail}`;
      }

      throw new Error(fullErrorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Could not reach server. Please check your connection and try again.');
    } else {
      // Something else happened
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }
}

