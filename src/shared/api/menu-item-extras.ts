import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItemExtra = {
  id: number;
  menu_item_id: number;
  menu_item_name: string;
  name: string;
  price: number;
  cost_price?: number;
};

export type CreateMenuItemExtraData = {
  menu_item_id: number;
  name: string;
  price: number;
  cost_price?: number;
};

export type UpdateMenuItemExtraData = {
  name?: string;
  price?: number;
  cost_price?: number;
};

// Get all extras, optionally filtered by menu item
export async function getMenuItemExtras(menuItemId?: number): Promise<MenuItemExtra[]> {
  try {
    const params = menuItemId ? { menu_item: menuItemId } : {};
    const response = await axios.get<MenuItemExtra[]>(`${API}/menu-item-extras/`, {
      withCredentials: true,
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item extras:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to fetch extras');
    }
    throw new Error('Network error: Failed to fetch extras');
  }
}

// Create a new extra
export async function createMenuItemExtra(data: CreateMenuItemExtraData): Promise<MenuItemExtra> {
  try {
    const response = await axios.post<MenuItemExtra>(`${API}/menu-item-extras/`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating menu item extra:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to create extra');
    }
    throw new Error('Network error: Failed to create extra');
  }
}

// Update an extra
export async function updateMenuItemExtra(extraId: number, data: UpdateMenuItemExtraData): Promise<MenuItemExtra> {
  try {
    const response = await axios.patch<MenuItemExtra>(`${API}/menu-item-extras/${extraId}/`, data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item extra:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to update extra');
    }
    throw new Error('Network error: Failed to update extra');
  }
}

// Delete an extra
export async function deleteMenuItemExtra(extraId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-item-extras/${extraId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item extra:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || 'Failed to delete extra');
    }
    throw new Error('Network error: Failed to delete extra');
  }
}
