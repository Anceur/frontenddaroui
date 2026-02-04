import axios from 'axios';
import { API } from '../../shared/api/API';

axios.defaults.withCredentials = true;

// ============================================
// TYPES
// ============================================

export type ChefOrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Served' | 'Canceled';

export type ChefOrder = {
  id: number;
  customer?: string;
  phone?: string;
  address?: string;
  table_number?: string | null;
  order_type?: 'delivery' | 'dine_in' | 'takeaway';
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
    size?: string | null;
  }>;
  total: number;
  status: ChefOrderStatus;
  created_at: string;
  updated_at: string;
  is_offline?: boolean; // Flag to distinguish offline orders
  is_imported?: boolean; // Flag for imported orders
  table?: {
    id: number;
    number: string;
  };
};

export type ChefOrderItem = {
  id: number;
  order_id: number;
  item: {
    id: number;
    name: string;
    image?: string | null;
  };
  size?: {
    id: number;
    size: string;
    price: number;
  } | null;
  quantity: number;
};

export type ChefOrderStatusCounts = {
  all: number;
  new: number;
  preparing: number;
  ready: number;
  completed: number;
};

export type ChefMenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string | null;
  featured?: boolean;
  available?: boolean;
  sizes?: Array<{
    id: number;
    size: string;
    price: number;
  }>;
  ingredients?: Array<{
    ingredient: {
      id: number;
      name: string;
      unit: string;
    };
    quantity: number;
  }>;
};

export type ChefIngredient = {
  id: number;
  name: string;
  unit: string;
  stock: number;
  reorder_level: number;
  is_low_stock: boolean;
};

export type OrderDetailItem = {
  id: number;
  item: {
    id: number;
    name: string;
    image?: string | null;
  };
  size?: {
    id: number;
    size: string;
    price: number;
  } | null;
  quantity: number;
  ingredients?: Array<{
    ingredient: {
      id: number;
      name: string;
      unit: string;
    };
    quantity: number;
  }>;
};

export type OrderDetails = {
  id: number;
  customer: string;
  phone: string;
  address: string;
  table_number?: string | null;
  order_type: 'delivery' | 'dine_in' | 'takeaway';
  total: number;
  status: ChefOrderStatus;
  created_at: string;
  updated_at: string;
  is_offline?: boolean;
  is_imported?: boolean;
  items: OrderDetailItem[];
};

// ============================================
// ORDER API FUNCTIONS
// ============================================

/**
 * Map backend order status to chef panel status
 */
function mapOrderStatus(status: string): ChefOrderStatus {
  const statusMap: Record<string, ChefOrderStatus> = {
    'Pending': 'Pending',
    'Preparing': 'Preparing',
    'Ready': 'Ready',
    'Delivered': 'Delivered',
    'Served': 'Served',
    'Canceled': 'Canceled',
  };
  return statusMap[status] || 'Pending';
}

/**
 * Get offline orders for chef panel
 */
export async function getChefOfflineOrders(status?: 'Pending' | 'Preparing' | 'Ready'): Promise<ChefOrder[]> {
  try {
    const url = status
      ? `${API}/offline-orders/list/?status=${status}`
      : `${API}/offline-orders/list/`;

    const response = await axios.get<any>(url, { withCredentials: true });

    let ordersData = response.data;
    if (!Array.isArray(ordersData)) {
      if (ordersData.orders && Array.isArray(ordersData.orders)) {
        ordersData = ordersData.orders;
      } else if (ordersData.results && Array.isArray(ordersData.results)) {
        ordersData = ordersData.results;
      } else if (ordersData.data && Array.isArray(ordersData.data)) {
        ordersData = ordersData.data;
      } else {
        if (ordersData.error || ordersData.detail) {
          console.error('API Error:', ordersData.error || ordersData.detail);
          throw new Error(ordersData.error || ordersData.detail || 'Failed to fetch offline orders');
        }
        console.error('Unexpected response format:', ordersData);
        return [];
      }
    }

    // Map offline orders to ChefOrder format
    const orders = ordersData.map((o: any) => ({
      id: o.id,
      customer: o.is_imported ? 'Imported Order' : `Table ${o.table?.number || 'N/A'}`,
      phone: '',
      address: o.is_imported ? 'Imported Source' : `Table ${o.table?.number || 'N/A'}`,
      table_number: o.table?.number || null,
      order_type: 'dine_in' as const,
      total: o.total || 0,
      status: mapOrderStatus(o.status),
      created_at: o.created_at,
      updated_at: o.updated_at,
      is_offline: true,
      is_imported: o.is_imported || false,
      table: o.table,
      items: (o.items || []).map((item: any) => ({
        name: item.item?.name || 'Unknown Item',
        quantity: item.quantity || 1,
        notes: item.notes || '',
        size: item.size?.size || null,
      })),
    }));

    return orders;
  } catch (error: any) {
    console.error('Error fetching offline orders:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch offline orders');
    }
    throw new Error('Network error: Failed to fetch offline orders');
  }
}

/**
 * Get orders for chef panel (both online and offline)
 */
export async function getChefOrders(status?: 'Pending' | 'Preparing' | 'Ready'): Promise<ChefOrder[]> {
  try {
    const response = await axios.get<any>(`${API}/orders/`, {
      withCredentials: true,
    });

    // Handle different response formats
    let ordersData = response.data;
    if (!Array.isArray(ordersData)) {
      // If response is an object with an 'orders' or 'results' key
      if (ordersData.orders && Array.isArray(ordersData.orders)) {
        ordersData = ordersData.orders;
      } else if (ordersData.results && Array.isArray(ordersData.results)) {
        ordersData = ordersData.results;
      } else if (ordersData.data && Array.isArray(ordersData.data)) {
        ordersData = ordersData.data;
      } else {
        // Check if it's an error response
        if (ordersData.error || ordersData.detail) {
          console.error('API Error:', ordersData.error || ordersData.detail);
          throw new Error(ordersData.error || ordersData.detail || 'Failed to fetch orders');
        }
        console.error('Unexpected response format:', ordersData);
        return [];
      }
    }

    let orders = ordersData.map((o: any) => ({
      id: o.id,
      customer: o.customer || '',
      phone: o.phone || '',
      address: o.address || '',
      table_number: o.table_number,
      order_type: o.order_type,
      total: o.total || 0,
      status: mapOrderStatus(o.status),
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: [] as Array<{ name: string; quantity: number; notes?: string }>,
    }));

    // Filter by status if provided
    if (status) {
      const relevantStatuses = status === 'Pending' ? ['Pending'] : status === 'Preparing' ? ['Preparing'] : ['Ready'];
      orders = orders.filter((o: any) => relevantStatuses.includes(o.status));
    }

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        try {
          // Ensure order.id is a number (remove any # prefix if present)
          const orderId = typeof order.id === 'string' ? parseInt(order.id.toString().replace('#', ''), 10) : order.id;
          const itemsResponse = await axios.get<any>(`${API}/order-items/`, {
            params: { order: orderId },
            withCredentials: true,
          });

          // Handle different response formats for order items
          let itemsData = itemsResponse.data;
          if (!Array.isArray(itemsData)) {
            if (itemsData.items && Array.isArray(itemsData.items)) {
              itemsData = itemsData.items;
            } else if (itemsData.results && Array.isArray(itemsData.results)) {
              itemsData = itemsData.results;
            } else {
              itemsData = [];
            }
          }

          const orderItems = itemsData
            .filter((item: ChefOrderItem) => item.item && item.item.name && item.item.name.trim() !== '' && item.item.name.toLowerCase() !== 'x')
            .map((item: ChefOrderItem) => ({
              name: item.item.name + (item.size ? ` [${item.size.size}]` : ''),
              quantity: item.quantity,
              notes: '', // OrderItem model doesn't have notes field yet
              size: item.size ? item.size.size : null, // Include size for display
            }));

          // If no OrderItems found, try to use items from order.items JSONField as fallback
          let finalItems = orderItems;
          if (orderItems.length === 0 && order.items && Array.isArray(order.items) && order.items.length > 0) {
            finalItems = order.items
              .filter((item: any) => {
                if (typeof item === 'string') {
                  return item.trim() !== '' && item.toLowerCase() !== 'x';
                }
                if (typeof item === 'object' && item.name) {
                  return item.name.trim() !== '' && item.name.toLowerCase() !== 'x';
                }
                return false;
              })
              .map((item: any) => ({
                name: typeof item === 'string' ? item : item.name,
                quantity: typeof item === 'object' ? (item.quantity || 1) : 1,
                notes: '',
              }));
          }

          return {
            ...order,
            items: finalItems,
            is_offline: false,
          };
        } catch (error) {
          console.warn(`Failed to fetch items for order ${order.id}:`, error);
          return { ...order, is_offline: false };
        }
      })
    );

    // Mark as online orders
    const onlineOrders = ordersWithItems;

    // Also fetch offline orders and combine
    try {
      const offlineOrders = await getChefOfflineOrders(status);
      return [...onlineOrders, ...offlineOrders];
    } catch (offlineError) {
      console.warn('Failed to fetch offline orders, returning only online orders:', offlineError);
      return onlineOrders;
    }
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch orders');
    }
    throw new Error('Network error: Failed to fetch orders');
  }
}

/**
 * Update order status (works for both online and offline orders)
 */
export async function updateOrderStatus(orderId: number | string, newStatus: ChefOrderStatus, isOffline: boolean = false): Promise<ChefOrder> {
  try {
    // Ensure orderId is a number (remove any # prefix if present)
    const cleanOrderId = typeof orderId === 'string' ? parseInt(orderId.replace('#', ''), 10) : orderId;
    if (isNaN(cleanOrderId)) {
      throw new Error('Invalid order ID');
    }

    const endpoint = isOffline
      ? `${API}/offline-orders/${cleanOrderId}/`
      : `${API}/orders/${cleanOrderId}/`;

    const response = await axios.patch<any>(
      endpoint,
      { status: newStatus },
      { withCredentials: true }
    );

    // Transform offline order response to match ChefOrder format
    if (isOffline && response.data) {
      const offlineOrder = response.data;
      return {
        id: offlineOrder.id,
        customer: offlineOrder.is_imported ? 'Imported Order' : `Table ${offlineOrder.table?.number || 'N/A'}`,
        phone: '',
        address: offlineOrder.is_imported ? 'Imported Source' : `Table ${offlineOrder.table?.number || 'N/A'}`,
        table_number: offlineOrder.table?.number || null,
        order_type: 'dine_in' as const,
        total: offlineOrder.total || 0,
        status: mapOrderStatus(offlineOrder.status),
        created_at: offlineOrder.created_at,
        updated_at: offlineOrder.updated_at,
        is_offline: true,
        is_imported: offlineOrder.is_imported || false,
        table: offlineOrder.table,
        items: (offlineOrder.items || []).map((item: any) => ({
          name: item.item?.name || 'Unknown Item',
          quantity: item.quantity || 1,
          notes: item.notes || '',
          size: item.size?.size || null,
        })),
      };
    }

    return { ...response.data, is_offline: false };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to update order status');
    }
    throw new Error('Network error: Failed to update order status');
  }
}

/**
 * Get order status counts for chef panel
 */
export async function getChefOrderCounts(): Promise<ChefOrderStatusCounts> {
  try {
    const [pending, preparing, ready] = await Promise.all([
      getChefOrders('Pending').catch(() => []),
      getChefOrders('Preparing').catch(() => []),
      getChefOrders('Ready').catch(() => []),
    ]);

    // Ensure all are arrays
    const pendingArray = Array.isArray(pending) ? pending : [];
    const preparingArray = Array.isArray(preparing) ? preparing : [];
    const readyArray = Array.isArray(ready) ? ready : [];

    return {
      all: pendingArray.length + preparingArray.length + readyArray.length,
      new: pendingArray.length,
      preparing: preparingArray.length,
      ready: readyArray.length,
      completed: 0,
    };
  } catch (error: any) {
    console.error('Error fetching order counts:', error);
    return {
      all: 0,
      new: 0,
      preparing: 0,
      ready: 0,
      completed: 0,
    };
  }
}

/**
 * Get detailed order information with items and ingredients
 */
export async function getOrderDetails(orderId: number | string, isOffline: boolean = false): Promise<OrderDetails> {
  try {
    // Clean order ID
    const cleanOrderId = typeof orderId === 'string' ? parseInt(orderId.toString().replace('#', ''), 10) : orderId;
    if (isNaN(cleanOrderId)) {
      throw new Error('Invalid order ID');
    }

    // Fetch order
    const endpoint = isOffline ? `${API}/offline-orders/${cleanOrderId}/` : `${API}/orders/${cleanOrderId}/`;
    const orderResponse = await axios.get<any>(endpoint, {
      withCredentials: true,
    });
    const order = orderResponse.data;

    // Fetch order items
    let orderItems: any[] = [];
    if (isOffline) {
      orderItems = order.items || [];
    } else {
      const itemsResponse = await axios.get<any[]>(`${API}/order-items/`, {
        params: { order: cleanOrderId },
        withCredentials: true,
      });
      orderItems = itemsResponse.data;
    }

    // Fetch ingredients for each order item that has a size
    const itemsWithIngredients = await Promise.all(
      orderItems.map(async (orderItem: ChefOrderItem) => {
        let ingredients: Array<{ ingredient: { id: number; name: string; unit: string }; quantity: number }> = [];

        // Only fetch ingredients if the order item has a size
        if (orderItem.size && orderItem.size.id) {
          try {
            const ingredientsResponse = await axios.get<any[]>(`${API}/menu-item-size-ingredients/`, {
              params: { size: orderItem.size.id },
              withCredentials: true,
            });

            ingredients = ingredientsResponse.data.map((si: any) => ({
              ingredient: {
                id: si.ingredient.id,
                name: si.ingredient.name,
                unit: si.ingredient.unit,
              },
              quantity: si.quantity,
            }));
          } catch (error) {
            console.warn(`Failed to fetch ingredients for size ${orderItem.size.id}:`, error);
          }
        }

        return {
          id: orderItem.id,
          item: orderItem.item,
          size: orderItem.size,
          quantity: orderItem.quantity,
          ingredients: ingredients.length > 0 ? ingredients : undefined,
        };
      })
    );

    return {
      id: order.id,
      customer: order.customer || '',
      phone: order.phone || '',
      address: order.address || '',
      table_number: order.table_number || order.tableNumber,
      order_type: order.order_type || order.orderType || 'delivery',
      total: order.total || 0,
      status: mapOrderStatus(order.status),
      created_at: order.created_at,
      updated_at: order.updated_at,
      is_offline: isOffline,
      is_imported: order.is_imported || false,
      items: itemsWithIngredients.filter(item => item.item && item.item.name && item.item.name.trim() !== '' && item.item.name.toLowerCase() !== 'x'),
    };
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Order not found');
      }
      if (error.response.status === 403) {
        throw new Error('Access denied');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch order details');
    }
    throw new Error('Network error: Failed to fetch order details');
  }
}

// ============================================
// MENU API FUNCTIONS
// ============================================

/**
 * Get menu items for chef panel with ingredients
 */
export async function getChefMenuItems(): Promise<ChefMenuItem[]> {
  try {
    const [menuItemsResponse, menuItemSizesResponse] = await Promise.all([
      axios.get<ChefMenuItem[]>(`${API}/menu-items/`, { withCredentials: true }),
      axios.get<any[]>(`${API}/menu-item-sizes/`, { withCredentials: true }),
    ]);

    const menuItems = menuItemsResponse.data;
    const menuItemSizes = menuItemSizesResponse.data;

    // Group sizes by menu item
    const sizesByMenuItem: Record<number, any[]> = {};
    menuItemSizes.forEach((size: any) => {
      const menuItemId = size.menu_item || size.menu_item_id;
      if (!sizesByMenuItem[menuItemId]) {
        sizesByMenuItem[menuItemId] = [];
      }
      sizesByMenuItem[menuItemId].push({
        id: size.id,
        size: size.size,
        price: size.price,
      });
    });

    // Fetch ingredients for each menu item size
    const menuItemsWithSizes = await Promise.all(
      menuItems.map(async (item: ChefMenuItem) => {
        const sizes = sizesByMenuItem[item.id] || [];

        // Fetch ingredients for all sizes of this menu item
        const ingredientsPromises = sizes.map(async (size: any) => {
          try {
            const ingredientsResponse = await axios.get<any[]>(`${API}/menu-item-size-ingredients/`, {
              params: { size: size.id },
              withCredentials: true,
            });
            return ingredientsResponse.data.map((si: any) => ({
              ingredient: {
                id: si.ingredient.id,
                name: si.ingredient.name,
                unit: si.ingredient.unit,
              },
              quantity: si.quantity,
            }));
          } catch (error) {
            return [];
          }
        });

        const allIngredients = (await Promise.all(ingredientsPromises)).flat();

        return {
          ...item,
          available: true, // Default to available (you can add an available field to MenuItem model later)
          sizes: sizes.length > 0 ? sizes : undefined,
          ingredients: allIngredients.length > 0 ? allIngredients : undefined,
        };
      })
    );

    return menuItemsWithSizes;
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu items');
    }
    throw new Error('Network error: Failed to fetch menu items');
  }
}

// ============================================
// INGREDIENTS API FUNCTIONS
// ============================================

/**
 * Get ingredients for chef panel
 */
export async function getChefIngredients(): Promise<ChefIngredient[]> {
  try {
    const response = await axios.get<any[]>(`${API}/ingredients/`, {
      withCredentials: true,
    });

    return response.data.map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      stock: Number(ing.stock || 0),
      reorder_level: Number(ing.reorder_level || 0),
      is_low_stock: ing.is_low_stock || false,
    }));
  } catch (error: any) {
    console.error('Error fetching ingredients:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch ingredients');
    }
    throw new Error('Network error: Failed to fetch ingredients');
  }
}

// ============================================
// STATS API FUNCTIONS
// ============================================

/**
 * Get statistics for chef panel
 */
export async function getChefStats(): Promise<{
  totalOrders: number;
  completedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  pendingOrders: number;
  topDishes: Array<{ name: string; count: number }>;
  avgPreparationTime: number;
  completionRate: number;
}> {
  try {
    const orders = await getChefOrders();

    // Calculate stats
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const readyOrders = orders.filter(o => o.status === 'Ready').length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;

    // Calculate top dishes (simplified - you can enhance this later)
    const dishCounts: Record<string, number> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
      });
    });

    const topDishes = Object.entries(dishCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mock calculations (you can enhance these with real data later)
    const avgPreparationTime = 15; // minutes
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return {
      totalOrders,
      completedOrders,
      preparingOrders,
      readyOrders,
      pendingOrders,
      topDishes,
      avgPreparationTime,
      completionRate,
    };
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return {
      totalOrders: 0,
      completedOrders: 0,
      preparingOrders: 0,
      readyOrders: 0,
      pendingOrders: 0,
      topDishes: [],
      avgPreparationTime: 0,
      completionRate: 0,
    };
  }
}
