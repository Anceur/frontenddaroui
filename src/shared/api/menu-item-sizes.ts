import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItemSize = {
  id: number;
  menu_item: number;
  menu_item_id?: number;
  menu_item_name?: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Mega' | 'Family';
  price: number;
  cost_price?: number;
};

export type CreateMenuItemSizeData = {
  menu_item_id: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Mega' | 'Family';
  price: number;
  cost_price?: number;
};

export type UpdateMenuItemSizeData = {
  menu_item_id?: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'Mega' | 'Family';
  price?: number;
  cost_price?: number;
};

// Get all menu item sizes
export async function getMenuItemSizes(): Promise<MenuItemSize[]> {
  try {
    const response = await axios.get<MenuItemSize[]>(`${API}/menu-item-sizes/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item sizes:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item sizes');
    }
    throw new Error('Network error: Failed to fetch menu item sizes');
  }
}

// Get a single menu item size by ID
export async function getMenuItemSize(sizeId: number): Promise<MenuItemSize> {
  try {
    const response = await axios.get<MenuItemSize>(`${API}/menu-item-sizes/${sizeId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item size:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item size');
    }
    throw new Error('Network error: Failed to fetch menu item size');
  }
}

// Create a new menu item size
export async function createMenuItemSize(sizeData: CreateMenuItemSizeData): Promise<MenuItemSize> {
  try {
    const response = await axios.post<MenuItemSize>(`${API}/menu-item-sizes/`, sizeData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating menu item size:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create menu item size';
      const details = error.response.data?.details || error.response.data?.detail;
      if (details) {
        console.error('Validation errors:', details);
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      console.error('Error response:', error.response.data);
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create menu item size');
  }
}

// Update a menu item size (full update)
export async function updateMenuItemSize(sizeId: number, sizeData: UpdateMenuItemSizeData): Promise<MenuItemSize> {
  try {
    const response = await axios.put<MenuItemSize>(`${API}/menu-item-sizes/${sizeId}/`, sizeData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item size:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item size';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item size');
  }
}

// Partially update a menu item size
export async function patchMenuItemSize(sizeId: number, sizeData: UpdateMenuItemSizeData): Promise<MenuItemSize> {
  try {
    const response = await axios.patch<MenuItemSize>(`${API}/menu-item-sizes/${sizeId}/`, sizeData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item size:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item size';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item size');
  }
}

// Delete a menu item size
export async function deleteMenuItemSize(sizeId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-item-sizes/${sizeId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item size:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete menu item size');
    }
    throw new Error('Network error: Failed to delete menu item size');
  }
}

