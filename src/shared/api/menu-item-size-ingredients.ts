import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItemSizeIngredient = {
  id: number;
  size: {
    id: number;
    menu_item_name?: string;
    size: string;
    price: number;
  };
  ingredient: {
    id: number;
    name: string;
    unit: string;
  };
  quantity: number;
  ingredient_id?: number;
  size_id?: number;
};

export type CreateMenuItemSizeIngredientData = {
  size_id: number;
  ingredient_id: number;
  quantity: number;
};

export type UpdateMenuItemSizeIngredientData = {
  size_id?: number;
  ingredient_id?: number;
  quantity?: number;
};

// Get all menu item size ingredients
export async function getMenuItemSizeIngredients(sizeId?: number): Promise<MenuItemSizeIngredient[]> {
  try {
    const url = sizeId 
      ? `${API}/menu-item-size-ingredients/?size=${sizeId}`
      : `${API}/menu-item-size-ingredients/`;
    const response = await axios.get<MenuItemSizeIngredient[]>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item size ingredients:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item size ingredients');
    }
    throw new Error('Network error: Failed to fetch menu item size ingredients');
  }
}

// Get a single menu item size ingredient by ID
export async function getMenuItemSizeIngredient(sizeIngredientId: number): Promise<MenuItemSizeIngredient> {
  try {
    const response = await axios.get<MenuItemSizeIngredient>(`${API}/menu-item-size-ingredients/${sizeIngredientId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item size ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item size ingredient');
    }
    throw new Error('Network error: Failed to fetch menu item size ingredient');
  }
}

// Create a new menu item size ingredient
export async function createMenuItemSizeIngredient(ingredientData: CreateMenuItemSizeIngredientData): Promise<MenuItemSizeIngredient> {
  try {
    const response = await axios.post<MenuItemSizeIngredient>(`${API}/menu-item-size-ingredients/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating menu item size ingredient:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create menu item size ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create menu item size ingredient');
  }
}

// Update a menu item size ingredient (full update)
export async function updateMenuItemSizeIngredient(sizeIngredientId: number, ingredientData: UpdateMenuItemSizeIngredientData): Promise<MenuItemSizeIngredient> {
  try {
    const response = await axios.put<MenuItemSizeIngredient>(`${API}/menu-item-size-ingredients/${sizeIngredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item size ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item size ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item size ingredient');
  }
}

// Partially update a menu item size ingredient
export async function patchMenuItemSizeIngredient(sizeIngredientId: number, ingredientData: UpdateMenuItemSizeIngredientData): Promise<MenuItemSizeIngredient> {
  try {
    const response = await axios.patch<MenuItemSizeIngredient>(`${API}/menu-item-size-ingredients/${sizeIngredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item size ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item size ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item size ingredient');
  }
}

// Delete a menu item size ingredient
export async function deleteMenuItemSizeIngredient(sizeIngredientId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-item-size-ingredients/${sizeIngredientId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item size ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item size ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete menu item size ingredient');
    }
    throw new Error('Network error: Failed to delete menu item size ingredient');
  }
}

