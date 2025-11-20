import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type IngredientTrace = {
  id: number;
  ingredient: {
    id: number;
    name: string;
    unit: string;
    stock: number;
    reorder_level: number;
    is_low_stock: boolean;
  };
  ingredient_id?: number;
  ingredient_name?: string;
  ingredient_unit?: string;
  order: number | null;
  order_id: number | null;
  order_display: string | null;
  quantity_used: number;
  timestamp: string;
  used_by: number | null;
  used_by_username: string | null;
  stock_before: number | null;
  stock_after: number | null;
};

export type IngredientTraceListResponse = {
  traces: IngredientTrace[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type IngredientTraceFilters = {
  ingredient?: number;
  order?: number;
  page?: number;
  page_size?: number;
};

// Get all ingredient traces with optional filters
export async function getIngredientTraces(
  filters?: IngredientTraceFilters
): Promise<IngredientTraceListResponse> {
  try {
    const params: Record<string, string | number> = {};
    
    if (filters?.ingredient) {
      params.ingredient = filters.ingredient;
    }
    if (filters?.order) {
      params.order = filters.order;
    }
    if (filters?.page) {
      params.page = filters.page;
    }
    if (filters?.page_size) {
      params.page_size = filters.page_size;
    }
    
    const response = await axios.get<IngredientTraceListResponse>(
      `${API}/ingredient-traces/`,
      {
        params,
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredient traces:', error);
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error('You do not have permission to view ingredient traces. Admin access required.');
      }
      throw new Error(
        error.response.data?.error ||
        error.response.data?.detail ||
        'Failed to fetch ingredient traces'
      );
    }
    throw new Error('Network error: Failed to fetch ingredient traces');
  }
}

// Get a single ingredient trace by ID
export async function getIngredientTrace(traceId: number): Promise<IngredientTrace> {
  try {
    const response = await axios.get<IngredientTrace>(
      `${API}/ingredient-traces/${traceId}/`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ingredient trace:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Ingredient trace not found');
      }
      if (error.response.status === 403) {
        throw new Error('You do not have permission to view this trace. Admin access required.');
      }
      throw new Error(
        error.response.data?.error ||
        error.response.data?.detail ||
        'Failed to fetch ingredient trace'
      );
    }
    throw new Error('Network error: Failed to fetch ingredient trace');
  }
}

