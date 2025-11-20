import { createOrder } from '../api/orders.api';
import type { CreateOrderData, OrderResponse } from '../api/orders.api';

export interface OrderSubmissionData {
  customer: string;
  phone: string;
  address?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  orderType?: 'delivery' | 'dine_in' | 'takeaway';
  tableNumber?: string;
}

export class OrderService {
  /**
   * Submit an order to the backend
   */
  static async submitOrder(data: OrderSubmissionData): Promise<OrderResponse> {
    try {
      const orderData: CreateOrderData = {
        customer: data.customer,
        phone: data.phone,
        address: data.address,
        items: data.items,
        total: data.total,
        orderType: data.orderType || 'delivery',
        tableNumber: data.tableNumber,
      };

      return await createOrder(orderData);
    } catch (error: any) {
      console.error('OrderService - Error submitting order:', error);
      throw error;
    }
  }

  /**
   * Validate order data before submission
   */
  static validateOrderData(data: OrderSubmissionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.customer || data.customer.trim().length === 0) {
      errors.push('Customer name is required');
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone number is required');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (!data.total || data.total <= 0) {
      errors.push('Order total must be greater than zero');
    }

    if (data.orderType === 'delivery' && (!data.address || data.address.trim().length === 0)) {
      errors.push('Delivery address is required for delivery orders');
    }

    if (data.orderType === 'dine_in' && (!data.tableNumber || data.tableNumber.trim().length === 0)) {
      errors.push('Table number is required for dine-in orders');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

