import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type Table = {
  id: number;
  number: string;
  capacity: number;
  is_available: boolean;
  location: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CreateTableData = {
  number: string;
  capacity?: number;
  is_available?: boolean;
  location?: string;
  notes?: string;
};

export type UpdateTableData = {
  number?: string;
  capacity?: number;
  is_available?: boolean;
  location?: string;
  notes?: string;
};

// Get all tables
export async function getTables(): Promise<Table[]> {
  try {
    const response = await axios.get<Table[]>(`${API}/tables/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    if (error.response) {
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch tables');
    }
    throw new Error('Network error: Failed to fetch tables');
  }
}

// Get a single table by ID
export async function getTable(tableId: number): Promise<Table> {
  try {
    const response = await axios.get<Table>(`${API}/tables/${tableId}/`, { withCredentials: true });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching table:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Table not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to fetch table');
    }
    throw new Error('Network error: Failed to fetch table');
  }
}

// Create a new table
export async function createTable(tableData: CreateTableData): Promise<Table> {
  try {
    const response = await axios.post<Table>(`${API}/tables/`, tableData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating table:', error);
    if (error.response) {
      const errorMessage = error.response.data?.error || 'Failed to create table';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to create table');
  }
}

// Update a table
export async function updateTable(tableId: number, tableData: UpdateTableData): Promise<Table> {
  try {
    const response = await axios.patch<Table>(`${API}/tables/${tableId}/`, tableData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating table:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Table not found');
      }
      const errorMessage = error.response.data?.error || 'Failed to update table';
      const details = error.response.data?.details;
      if (details) {
        throw new Error(`${errorMessage}: ${JSON.stringify(details)}`);
      }
      throw new Error(errorMessage);
    }
    throw new Error('Network error: Failed to update table');
  }
}

// Delete a table
export async function deleteTable(tableId: number): Promise<void> {
  try {
    await axios.delete(`${API}/tables/${tableId}/`, { withCredentials: true });
  } catch (error: any) {
    console.error('Error deleting table:', error);
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Table not found');
      }
      throw new Error(error.response.data?.error || error.response.data?.detail || 'Failed to delete table');
    }
    throw new Error('Network error: Failed to delete table');
  }
}


