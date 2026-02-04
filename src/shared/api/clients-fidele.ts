import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backenddaroui.onrender.com';

export interface ClientFidele {
    id: number;
    name: string;
    phone: string;
    loyalty_card_number: string;
    total_spent: string;
    created_at: string;
    updated_at: string;
}

export interface CreateClientFideleData {
    name: string;
    phone: string;
}

export interface UpdateClientFideleData {
    name?: string;
    phone?: string;
}

export const getClientsFidele = async (): Promise<ClientFidele[]> => {
    const response = await axios.get(`${API_URL}/clients-fidele/`, {
        withCredentials: true,
    });
    return response.data;
};

export const createClientFidele = async (data: CreateClientFideleData): Promise<ClientFidele> => {
    const response = await axios.post(`${API_URL}/clients-fidele/`, data, {
        withCredentials: true,
    });
    return response.data;
};

export const updateClientFidele = async (id: number, data: UpdateClientFideleData): Promise<ClientFidele> => {
    const response = await axios.put(`${API_URL}/clients-fidele/${id}/`, data, {
        withCredentials: true,
    });
    return response.data;
};

export const deleteClientFidele = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/clients-fidele/${id}/`, {
        withCredentials: true,
    });
};
