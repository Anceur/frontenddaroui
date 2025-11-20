import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type Ingredient = {
  id: number;
  name: string;
  unit: string;
};

export type CreateIngredientData = {
  name: string;
  unit: string;
};

export type UpdateIngredientData = {
  name?: string;
  unit?: string;
};

// Get all ingredients
export async function getIngredients(): Promise<Ingredient[]> {
  try {
    const response = await axios.get<Ingredient[]>(`${API}/ingredients/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredients:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch ingredients');
    }
    throw new Error('Network error: Failed to fetch ingredients');
  }
}

// Get a single ingredient by ID
export async function getIngredient(ingredientId: number): Promise<Ingredient> {
  try {
    const response = await axios.get<Ingredient>(`${API}/ingredients/${ingredientId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch ingredient');
    }
    throw new Error('Network error: Failed to fetch ingredient');
  }
}

// Create a new ingredient
export async function createIngredient(ingredientData: CreateIngredientData): Promise<Ingredient> {
  try {
    const response = await axios.post<Ingredient>(`${API}/ingredients/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating ingredient:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create ingredient');
  }
}

// Update an ingredient (full update)
export async function updateIngredient(ingredientId: number, ingredientData: UpdateIngredientData): Promise<Ingredient> {
  try {
    const response = await axios.put<Ingredient>(`${API}/ingredients/${ingredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update ingredient');
  }
}

// Partially update an ingredient
export async function patchIngredient(ingredientId: number, ingredientData: UpdateIngredientData): Promise<Ingredient> {
  try {
    const response = await axios.patch<Ingredient>(`${API}/ingredients/${ingredientId}/`, ingredientData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update ingredient';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update ingredient');
  }
}

// Delete an ingredient
export async function deleteIngredient(ingredientId: number): Promise<void> {
  try {
    await axios.delete(`${API}/ingredients/${ingredientId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting ingredient:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete ingredient');
    }
    throw new Error('Network error: Failed to delete ingredient');
  }
}

