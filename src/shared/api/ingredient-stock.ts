import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type IngredientStock = {
  id: number;
  ingredient: {
    id: number;
    name: string;
    unit: string;
  };
  ingredient_id?: number;
  ingredient_name?: string;
  ingredient_unit?: string;
  quantity: number;
  reorder_level?: number;
  last_updated: string;
};

export type CreateIngredientStockData = {
  ingredient_id: number;
  quantity: number;
};

export type UpdateIngredientStockData = {
  ingredient_id?: number;
  reorder_level?: number;
};

// Get all ingredient stocks
export async function getIngredientStocks(): Promise<IngredientStock[]> {
  try {
    const response = await axios.get<IngredientStock[]>(`${API}/ingredient-stocks/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredient stocks:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch ingredient stocks');
    }
    throw new Error('Network error: Failed to fetch ingredient stocks');
  }
}

// Get a single ingredient stock by ID
export async function getIngredientStock(stockId: number): Promise<IngredientStock> {
  try {
    const response = await axios.get<IngredientStock>(`${API}/ingredient-stocks/${stockId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredient stock:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient stock not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch ingredient stock');
    }
    throw new Error('Network error: Failed to fetch ingredient stock');
  }
}

// Create a new ingredient stock
export async function createIngredientStock(stockData: CreateIngredientStockData): Promise<IngredientStock> {
  try {
    const response = await axios.post<IngredientStock>(`${API}/ingredient-stocks/`, stockData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating ingredient stock:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create ingredient stock';
      const details = error.response.data?.details || error.response.data?.detail;
      if (details) {
        throw new Error(`${errorMessage}: ${typeof details === 'string' ? details : JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create ingredient stock');
  }
}

// Update an ingredient stock (full update)
export async function updateIngredientStock(stockId: number, stockData: UpdateIngredientStockData): Promise<IngredientStock> {
  try {
    const response = await axios.put<IngredientStock>(`${API}/ingredient-stocks/${stockId}/`, stockData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating ingredient stock:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient stock not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update ingredient stock';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update ingredient stock');
  }
}

// Partially update an ingredient stock
export async function patchIngredientStock(stockId: number, stockData: UpdateIngredientStockData): Promise<IngredientStock> {
  try {
    const response = await axios.patch<IngredientStock>(`${API}/ingredient-stocks/${stockId}/`, stockData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating ingredient stock:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient stock not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update ingredient stock';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update ingredient stock');
  }
}

// Delete an ingredient stock
export async function deleteIngredientStock(stockId: number): Promise<void> {
  try {
    await axios.delete(`${API}/ingredient-stocks/${stockId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting ingredient stock:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient stock not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete ingredient stock');
    }
    throw new Error('Network error: Failed to delete ingredient stock');
  }
}

