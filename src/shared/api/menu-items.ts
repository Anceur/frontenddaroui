import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type MenuItem = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string | null;
  featured?: boolean;
  sizes?: Array<{
    id: number;
    size: string;
    price: number;
  }>;
};

export type CreateMenuItemData = {
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: File | string | null;
  featured?: boolean;
};

export type UpdateMenuItemData = {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: File | string | null;
  featured?: boolean;
};

// Get all menu items
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await axios.get<MenuItem[]>(`${API}/menu-items/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu items');
    }
    throw new Error('Network error: Failed to fetch menu items');
  }
}

// Get a single menu item by ID
export async function getMenuItem(itemId: number): Promise<MenuItem> {
  try {
    const response = await axios.get<MenuItem>(`${API}/menu-items/${itemId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch menu item');
    }
    throw new Error('Network error: Failed to fetch menu item');
  }
}

// Create a new menu item
export async function createMenuItem(itemData: CreateMenuItemData): Promise<MenuItem> {
  try {
    const formData = new FormData();
    formData.append('name', itemData.name);
    if (itemData.description) formData.append('description', itemData.description);
    formData.append('price', itemData.price.toString());
    formData.append('category', itemData.category);
    if (itemData.image && itemData.image instanceof File) {
      formData.append('image', itemData.image);
    }
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    const response = await axios.post<MenuItem>(`${API}/menu-items/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create menu item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create menu item');
  }
}

// Update a menu item (full update)
export async function updateMenuItem(itemId: number, itemData: UpdateMenuItemData): Promise<MenuItem> {
  try {
    const formData = new FormData();
    if (itemData.name) formData.append('name', itemData.name);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.price !== undefined) formData.append('price', itemData.price.toString());
    if (itemData.category) formData.append('category', itemData.category);
    if (itemData.image && itemData.image instanceof File) {
      formData.append('image', itemData.image);
    }
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    const response = await axios.put<MenuItem>(`${API}/menu-items/${itemId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item');
  }
}

// Partially update a menu item
export async function patchMenuItem(itemId: number, itemData: UpdateMenuItemData): Promise<MenuItem> {
  try {
    const formData = new FormData();
    if (itemData.name) formData.append('name', itemData.name);
    if (itemData.description !== undefined) formData.append('description', itemData.description);
    if (itemData.price !== undefined) formData.append('price', itemData.price.toString());
    if (itemData.category) formData.append('category', itemData.category);
    if (itemData.image && itemData.image instanceof File) {
      formData.append('image', itemData.image);
    } else if (itemData.image === null) {
      formData.append('image', '');
    }
    if (itemData.featured !== undefined) {
      formData.append('featured', itemData.featured.toString());
    }

    const response = await axios.patch<MenuItem>(`${API}/menu-items/${itemId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update menu item';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update menu item');
  }
}

// Delete a menu item
export async function deleteMenuItem(itemId: number): Promise<void> {
  try {
    await axios.delete(`${API}/menu-items/${itemId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Menu item not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete menu item');
    }
    throw new Error('Network error: Failed to delete menu item');
  }
}

