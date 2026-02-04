import { createOrder, getSecurityToken } from '../api/orders.api';
import type { CreateOrderData, OrderResponse, SecurityToken } from '../api/orders.api';

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
  subtotal: number;
  tax_amount: number;
  total: number;
  orderType?: 'delivery' | 'dine_in' | 'takeaway';
  tableNumber?: string;
  notes?: string;
  loyalty_number?: string;
}

export class OrderService {
  private static securityToken: SecurityToken | null = null;
  private static tokenTimestamp: number = 0;

  /**
   * Get security token (with caching to avoid too many requests)
   */
  static async getSecurityToken(): Promise<SecurityToken> {
    const now = Date.now();
    // Cache token for 30 seconds
    if (this.securityToken && (now - this.tokenTimestamp) < 30000) {
      return this.securityToken;
    }

    try {
      console.log('OrderService - Fetching security token...');
      this.securityToken = await getSecurityToken();
      this.tokenTimestamp = now;
      console.log('OrderService - Security token fetched successfully');
      return this.securityToken;
    } catch (error) {
      console.error('OrderService - Error getting security token:', error);
      // Don't throw - let the order proceed without token (backend will handle gracefully)
      // This prevents the entire order flow from breaking if token endpoint is down
      throw error;
    }
  }

  /**
   * Submit an order to the backend with security validation
   */
  static async submitOrder(data: OrderSubmissionData): Promise<OrderResponse> {
    try {
      // Try to get security token, but don't fail if it's not available
      let securityToken: SecurityToken | undefined;
      try {
        securityToken = await this.getSecurityToken();

        // Ensure minimum time has passed (3 seconds) since token generation
        if (securityToken) {
          const timeSinceToken = (Date.now() / 1000) - securityToken.timestamp;
          if (timeSinceToken < 3) {
            // Wait for remaining time
            const waitTime = (3 - timeSinceToken) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      } catch (tokenError) {
        console.warn('OrderService - Could not get security token, proceeding without it:', tokenError);
        // Continue without security token - backend will handle validation
        // This allows orders to still be placed if token endpoint is temporarily unavailable
      }

      const orderData: CreateOrderData = {
        customer: data.customer,
        phone: data.phone,
        address: data.address,
        items: data.items,
        subtotal: data.subtotal,
        tax_amount: data.tax_amount,
        total: data.total,
        orderType: data.orderType || 'delivery',
        tableNumber: data.tableNumber,
        notes: data.notes,
        loyalty_number: data.loyalty_number,
        security_token: securityToken,
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

