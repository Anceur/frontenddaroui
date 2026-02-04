import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export interface TableStatus {
  id: number;
  number: string;
  capacity: number;
  location: string;
  is_available: boolean;
  is_occupied: boolean;
  notes: string;
}

export interface TablesStatusResponse {
  tables: TableStatus[];
  total: number;
  occupied: number;
  available: number;
}

export interface PendingOrdersResponse {
  online_orders: any[];
  offline_orders: any[];
  total_pending: number;
}

// Get all tables with their status
export async function getTablesStatus(): Promise<TablesStatusResponse> {
  try {
    const response = await axios.get<TablesStatusResponse>(`${API}/cashier/tables-status/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tables status:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to fetch tables status';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to fetch tables status');
  }
}

// End table session by table ID
export async function endTableSession(tableId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axios.post(`${API}/public/table-sessions/end/`, {
      table_id: tableId
    }, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error ending table session:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to end table session';
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to end table session');
  }
}

// Get all pending orders (unconfirmed)
export async function getPendingOrders(): Promise<PendingOrdersResponse> {
  try {
    const response = await axios.get<PendingOrdersResponse>(`${API}/cashier/pending-orders/`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pending orders:', error);
    console.error('Error response:', error.response?.data);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to fetch pending orders';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to fetch pending orders');
  }
}

// Confirm an order
export async function confirmOrder(orderType: 'online' | 'offline', orderId: number): Promise<any> {
  try {
    const response = await axios.post(
      `${API}/cashier/confirm-order/`,
      {
        order_type: orderType,
        order_id: orderId,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error confirming order:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to confirm order';
      const details = error.response.data?.details;
      const traceback = error.response.data?.traceback;
      if (traceback) {
        console.error('Backend traceback:', traceback);
      }
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to confirm order');
  }
}

// Decline an order
export async function declineOrder(orderType: 'online' | 'offline', orderId: number, reason: string = 'Declined by cashier'): Promise<any> {
  try {
    const response = await axios.post(
      `${API}/cashier/decline-order/`,
      {
        order_type: orderType,
        order_id: orderId,
        reason: reason
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error declining order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to decline order';
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to decline order');
  }
}

// Get order details
export async function getOrderDetails(orderType: 'online' | 'offline', orderId: number): Promise<any> {
  try {
    const response = await axios.get(`${API}/cashier/order-detail/`, {
      params: {
        order_type: orderType,
        order_id: orderId,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to fetch order details';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to fetch order details');
  }
}

// Update table occupancy status
export async function updateTableOccupancy(tableId: number, isOccupied: boolean): Promise<any> {
  try {
    const response = await axios.patch(
      `${API}/cashier/tables/${tableId}/occupancy/`,
      {
        is_occupied: isOccupied,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating table occupancy:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to update table occupancy';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update table occupancy');
  }
}

// Create offline order manually (cashier)
export interface CreateOrderItem {
  item_id: number;
  size_id?: number | null;
  quantity: number;
  price?: number; // Optional price override
}

export interface CreateOrderRequest {
  table_id?: number | null;
  items: CreateOrderItem[];
  is_imported?: boolean;
}

export async function createOfflineOrder(data: CreateOrderRequest): Promise<any> {
  try {
    const response = await axios.post(
      `${API}/cashier/create-order/`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating offline order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to create order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create order');
  }
}

// Get ticket data for printing
export interface TicketData {
  restaurant_name: string;
  order_id: string;
  client_name?: string;
  client_phone?: string;
  client_number?: string;
  order_type?: string;
  table_number?: string;
  address?: string;
  items: Array<{
    name: string;
    size?: string;
    quantity: number;
    price: string;
  }>;
  subtotal?: string;
  tax?: string;
  total: string;
  revenue: string;
  notes: string;
  date: string;
  time: string;
}

export async function getOrderTicket(orderType: 'online' | 'offline', orderId: number): Promise<TicketData> {
  try {
    const response = await axios.get(`${API}/cashier/orders/${orderId}/ticket/`, {
      params: {
        type: orderType,
      },
      withCredentials: true,
    });
    return response.data.ticket;
  } catch (error: any) {
    console.error('Error fetching ticket data:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to fetch ticket data';
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to fetch ticket data');
  }
}

export interface OrderHistoryResponse {
  online_orders: any[];
  offline_orders: any[];
  count: number;
}

export async function getOrderHistory(year?: string, month?: string, day?: string): Promise<OrderHistoryResponse> {
  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    if (day) params.append('day', day);

    const response = await axios.get<OrderHistoryResponse>(`${API}/cashier/order-history/`, {
      params,
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching order history:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to fetch order history';
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to fetch order history');
  }
}

// Create manual online order (cashier)
export interface ManualOnlineOrderData {
  customer: string;
  phone: string;
  order_type: 'delivery' | 'takeaway';
  address?: string;
  items: {
    menu_item_id: number;
    size?: string;
    size_id?: number | null;
    quantity: number;
  }[];
  notes?: string;
  loyalty_number?: string;
}

export async function createManualOnlineOrder(data: ManualOnlineOrderData): Promise<any> {
  try {
    const response = await axios.post(
      `${API}/cashier/manual-online-order/`,
      data,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating manual online order:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || error.response.data?.detail || 'Failed to create order';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create order');
  }
}

