import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type SupplierTransactionItem = {
  id: number;
  ingredient: number;
  ingredient_name?: string;
  ingredient_unit?: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
};

export type SupplierHistory = {
  id: number;
  supplier: number;
  supplier_name?: string;
  transaction_type: 'purchase' | 'payment' | 'adjustment' | 'refund';
  transaction_type_display?: string;
  amount: number;
  description?: string;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  items?: SupplierTransactionItem[];
};

export type CreateSupplierTransactionItemData = {
  ingredient_id?: number;
  name?: string; // For new ingredients
  unit?: string;
  quantity: number;
  price_per_unit: number;
};

export type CreateSupplierHistoryData = {
  supplier: number;
  transaction_type: 'purchase' | 'payment' | 'adjustment' | 'refund';
  amount: number;
  description?: string;
  items_data?: CreateSupplierTransactionItemData[];
};

// Get supplier history (optionally filtered by supplier)
export async function getSupplierHistory(supplierId?: number): Promise<SupplierHistory[]> {
  try {
    const url = supplierId
      ? `${API}/supplier-history/?supplier=${supplierId}`
      : `${API}/supplier-history/`;
    const response = await axios.get<SupplierHistory[]>(url, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supplier history:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch supplier history');
    }
    throw new Error('Network error: Failed to fetch supplier history');
  }
}

// Get a single supplier history entry by ID
export async function getSupplierHistoryEntry(historyId: number): Promise<SupplierHistory> {
  try {
    const response = await axios.get<SupplierHistory>(`${API}/supplier-history/${historyId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supplier history entry:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier history entry not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch supplier history entry');
    }
    throw new Error('Network error: Failed to fetch supplier history entry');
  }
}

// Create a new supplier history transaction
export async function createSupplierHistory(historyData: CreateSupplierHistoryData): Promise<SupplierHistory> {
  try {
    const response = await axios.post<SupplierHistory>(`${API}/supplier-history/create/`, historyData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating supplier history:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create supplier history';
      const details = error.response.data?.details;
      if (details) {
        console.error('Validation errors:', details);
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      console.error('Error response:', error.response.data);
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create supplier history');
  }
}

// Delete a supplier history entry
export async function deleteSupplierHistory(historyId: number): Promise<void> {
  try {
    await axios.delete(`${API}/supplier-history/${historyId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting supplier history:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier history entry not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete supplier history');
    }
    throw new Error('Network error: Failed to delete supplier history');
  }
}


