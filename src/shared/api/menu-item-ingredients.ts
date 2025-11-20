import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItemIngredient = {
  id: number;
  menu_item: {
    id: number;
    name: string;
  };
  ingredient: {
    id: number;
    name: string;
    unit: string;
  };
  quantity: number;
  ingredient_id?: number;
  menu_item_id?: number;
};

export type CreateMenuItemIngredientData = {
  menu_item_id: number;
  ingredient_id: number;
  quantity: number;
};

export type UpdateMenuItemIngredientData = {
  menu_item_id?: number;
  ingredient_id?: number;
  quantity?: number;
};

// Get all menu item ingredients
export async function getMenuItemIngredients(menuItemId?: number): Promise<MenuItemIngredient[]> {
  try {
    const url = menuItemId 
      ? `${API}/menu-item-ingredients/?menu_item=${menuItemId}`
      : `${API}/menu-item-ingredients/`;
    const response = await axios.get<MenuItemIngredient[]>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item ingredients:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item ingredients');
    }
    throw new Error('Network error: Failed to fetch menu item ingredients');
  }
}

// Get a single menu item ingredient by ID
export async function getMenuItemIngredient(itemIngredientId: number): Promise<MenuItemIngredient> {
  try {
    const response = await axios.get<MenuItemIngredient>(`${API}/menu-item-ingredients/${itemIngredientId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item ingredient');
    }
    throw new Error('Network error: Failed to fetch menu item ingredient');
  }
}

// Create a new menu item ingredient
export async function createMenuItemIngredient(ingredientData: CreateMenuItemIngredientData): Promise<MenuItemIngredient> {
  try {
    const response = await axios.post<MenuItemIngredient>(`${API}/menu-item-ingredients/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating menu item ingredient:', error);
    console.error('Error response:', error.response?.data);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create menu item ingredient';
      const details = error.response.data?.details || error.response.data?.detail || error.response.data;
      if (details) {
        console.error('Error details:', details);
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create menu item ingredient');
  }
}

// Update a menu item ingredient (full update)
export async function updateMenuItemIngredient(itemIngredientId: number, ingredientData: UpdateMenuItemIngredientData): Promise<MenuItemIngredient> {
  try {
    const response = await axios.put<MenuItemIngredient>(`${API}/menu-item-ingredients/${itemIngredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item ingredient');
  }
}

// Partially update a menu item ingredient
export async function patchMenuItemIngredient(itemIngredientId: number, ingredientData: UpdateMenuItemIngredientData): Promise<MenuItemIngredient> {
  try {
    const response = await axios.patch<MenuItemIngredient>(`${API}/menu-item-ingredients/${itemIngredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item ingredient');
  }
}

// Delete a menu item ingredient
export async function deleteMenuItemIngredient(itemIngredientId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-item-ingredients/${itemIngredientId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete menu item ingredient');
    }
    throw new Error('Network error: Failed to delete menu item ingredient');
  }
}

