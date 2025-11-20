import { createOfflineOrder } from '../api/orders.api';
import type { CreateOfflineOrderData, OfflineOrderResponse } from '../api/orders.api';

export interface OfflineOrderSubmissionData {
  table_number: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  notes?: string;
}

export class OrderService {
  /**
   * Submit an offline order to the backend (no customer data required)
   */
  static async submitOfflineOrder(data: OfflineOrderSubmissionData): Promise<OfflineOrderResponse> {
    try {
      const orderData: CreateOfflineOrderData = {
        table_number: data.table_number,
        items: data.items,
        total: data.total,
        notes: data.notes || '',
      };

      return await createOfflineOrder(orderData);
    } catch (error: any) {
      console.error('OrderService - Error submitting offline order:', error);
      throw error;
    }
  }

  /**
   * Validate offline order data before submission
   */
  static validateOfflineOrderData(data: OfflineOrderSubmissionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.table_number || data.table_number.trim().length === 0) {
      errors.push('Table number is required');
    }

    if (!data.items || data.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (!data.total || data.total <= 0) {
      errors.push('Order total must be greater than zero');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

