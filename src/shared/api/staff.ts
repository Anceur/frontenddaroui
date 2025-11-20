import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export interface StaffMember {
  id: number;
  username: string;
  roles: 'admin' | 'cashier' | 'chef';
  phone?: string;
  address?: string;
  image?: string | null;
}

export interface CreateStaffData {
  username: string;
  password: string;
  roles: 'admin' | 'cashier' | 'chef';
  phone?: string;
  address?: string;
  image?: File | null;
}

// Get all staff members
export async function getAllStaff(): Promise<StaffMember[]> {
  try {
    const response = await axios.get<StaffMember[]>(`${API}/create-user/`, { withCredentials: true });
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
    formData.append('username', staffData.username);
    formData.append('password', staffData.password);
    formData.append('roles', staffData.roles);
    if (staffData.phone) formData.append('phone', staffData.phone);
    if (staffData.address) formData.append('address', staffData.address);
    if (staffData.image) formData.append('image', staffData.image);

    const response = await axios.post<StaffMember>(`${API}/create-user/`, formData, {
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
export async function updateStaff(userId: number, staffData: Partial<CreateStaffData> & { password?: string; username?: string; roles?: 'admin' | 'cashier' | 'chef' }): Promise<StaffMember> {
  try {
    const formData = new FormData();
    if (staffData.username) formData.append('username', staffData.username);
    if (staffData.roles) formData.append('roles', staffData.roles);
    if (staffData.phone !== undefined) formData.append('phone', staffData.phone || '');
    if (staffData.address !== undefined) formData.append('address', staffData.address || '');
    if (staffData.password) formData.append('password', staffData.password);
    if (staffData.image) formData.append('image', staffData.image);

    const response = await axios.patch<StaffMember>(`${API}/create-user/${userId}/`, formData, {
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
export async function deleteStaff(userId: number): Promise<void> {
  try {
    await axios.delete(`${API}/create-user/${userId}/`, { withCredentials: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    throw error;
  }
}

