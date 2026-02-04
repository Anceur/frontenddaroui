import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type Supplier = {
  id: number;
  name: string;
  phone: string;
  supplier_type: 'food' | 'beverage' | 'equipment' | 'other';
  supplier_type_display?: string;
  debt: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateSupplierData = {
  name: string;
  phone: string;
  supplier_type: 'food' | 'beverage' | 'equipment' | 'other';
  debt?: number;
};

export type UpdateSupplierData = {
  name?: string;
  phone?: string;
  supplier_type?: 'food' | 'beverage' | 'equipment' | 'other';
  debt?: number;
};

// Get all suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const response = await axios.get<Supplier[]>(`${API}/suppliers/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch suppliers');
    }
    throw new Error('Network error: Failed to fetch suppliers');
  }
}

// Get a single supplier by ID
export async function getSupplier(supplierId: number): Promise<Supplier> {
  try {
    const response = await axios.get<Supplier>(`${API}/suppliers/${supplierId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supplier:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch supplier');
    }
    throw new Error('Network error: Failed to fetch supplier');
  }
}

// Create a new supplier
export async function createSupplier(supplierData: CreateSupplierData): Promise<Supplier> {
  try {
    const response = await axios.post<Supplier>(`${API}/suppliers/`, supplierData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating supplier:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create supplier';
      const details = error.response.data?.details;
      if (details) {
        console.error('Validation errors:', details);
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      console.error('Error response:', error.response.data);
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create supplier');
  }
}

// Update a supplier (full update)
export async function updateSupplier(supplierId: number, supplierData: UpdateSupplierData): Promise<Supplier> {
  try {
    const response = await axios.put<Supplier>(`${API}/suppliers/${supplierId}/`, supplierData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update supplier';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update supplier');
  }
}

// Partially update a supplier
export async function patchSupplier(supplierId: number, supplierData: UpdateSupplierData): Promise<Supplier> {
  try {
    const response = await axios.patch<Supplier>(`${API}/suppliers/${supplierId}/`, supplierData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating supplier:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update supplier';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update supplier');
  }
}

// Delete a supplier
export async function deleteSupplier(supplierId: number): Promise<void> {
  try {
    await axios.delete(`${API}/suppliers/${supplierId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Supplier not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete supplier');
    }
    throw new Error('Network error: Failed to delete supplier');
  }
}


