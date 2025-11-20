import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type OrderItem = {
  id: number;
  item: {
    id: number;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string | null;
    featured?: boolean;
  };
  size?: {
    id: number;
    size: string;
    price: number;
  } | null;
  quantity: number;
  order?: string;
  item_id?: number;
  size_id?: number | null;
  order_id?: number;
};

export type CreateOrderItemData = {
  order_id: number;
  item_id: number;
  size_id?: number | null;
  quantity: number;
};

export type UpdateOrderItemData = {
  order_id?: number;
  item_id?: number;
  size_id?: number | null;
  quantity?: number;
};

// Get all order items
export async function getOrderItems(orderId?: number): Promise<OrderItem[]> {
  try {
    const url = orderId 
      ? `${API}/order-items/?order=${orderId}`
      : `${API}/order-items/`;
    const response = await axios.get<OrderItem[]>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order items:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch order items');
    }
    throw new Error('Network error: Failed to fetch order items');
  }
}

// Get a single order item by ID
export async function getOrderItem(itemId: number): Promise<OrderItem> {
  try {
    const response = await axios.get<OrderItem>(`${API}/order-items/${itemId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch order item');
    }
    throw new Error('Network error: Failed to fetch order item');
  }
}

// Create a new order item
export async function createOrderItem(itemData: CreateOrderItemData): Promise<OrderItem> {
  try {
    const response = await axios.post<OrderItem>(`${API}/order-items/`, itemData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating order item:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create order item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create order item');
  }
}

// Update an order item (full update)
export async function updateOrderItem(itemId: number, itemData: UpdateOrderItemData): Promise<OrderItem> {
  try {
    const response = await axios.put<OrderItem>(`${API}/order-items/${itemId}/`, itemData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order item not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update order item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update order item');
  }
}

// Partially update an order item
export async function patchOrderItem(itemId: number, itemData: UpdateOrderItemData): Promise<OrderItem> {
  try {
    const response = await axios.patch<OrderItem>(`${API}/order-items/${itemId}/`, itemData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order item not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update order item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update order item');
  }
}

// Delete an order item
export async function deleteOrderItem(itemId: number): Promise<void> {
  try {
    await axios.delete(`${API}/order-items/${itemId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting order item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete order item');
    }
    throw new Error('Network error: Failed to delete order item');
  }
}

