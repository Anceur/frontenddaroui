import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export interface StaffMember {
  id: number;
  user?: number | null;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  image?: string | null;
  is_active: boolean;
  username?: string; // Virtual for UI
}

export interface CreateStaffData {
  name: string;
  role: string;
  phone?: string;
  address?: string;
  image?: File | null;
  has_account: boolean;
  username?: string;
  password?: string;
}

// Get all staff members
export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    const response = await axios.get<StaffMember[]>(`${API}/staff/`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching staff:', error);
    throw error;
  }
}

// Create a new staff member
export async function createStaff(staffData: CreateStaffData): Promise<StaffMember> {
  try {
    const formData = new FormData();
    formData.append('name', staffData.name);
    formData.append('role', staffData.role);
    formData.append('has_account', String(staffData.has_account));

    if (staffData.username) formData.append('username', staffData.username);
    if (staffData.password) formData.append('password', staffData.password);
    if (staffData.phone) formData.append('phone', staffData.phone);
    if (staffData.address) formData.append('address', staffData.address);
    if (staffData.image) formData.append('image', staffData.image);

    const response = await axios.post<StaffMember>(`${API}/staff/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating staff:', error);
    throw error;
  }
}

// Update staff member
export async function updateStaff(staffId: number, staffData: Partial<CreateStaffData>): Promise<StaffMember> {
  try {
    const formData = new FormData();
    if (staffData.name) formData.append('name', staffData.name);
    if (staffData.role) formData.append('role', staffData.role);
    if (staffData.phone !== undefined) formData.append('phone', staffData.phone || '');
    if (staffData.address !== undefined) formData.append('address', staffData.address || '');
    if (staffData.password) formData.append('password', staffData.password);
    if (staffData.image) formData.append('image', staffData.image);

    const response = await axios.patch<StaffMember>(`${API}/staff/${staffId}/`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating staff:', error);
    throw error;
  }
}

// Delete staff member (delete user)
export async function deleteStaff(staffId: number): Promise<void> {
  try {
    await axios.delete(`${API}/staff/${staffId}/`, { withCredentials: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
}

