
import axios from 'axios';

export interface PromotionItem {
    id?: number;
    menu_item: number; // ID
    menu_item_size?: number | null; // ID
    menu_item_name?: string;
    size_label?: string;
    quantity: number;
}

export interface Promotion {
    id: number;
    name: string;
    description: string;
    promotion_type: 'percentage' | 'fixed_amount' | 'combo_fixed_price';
    value: string; // Decimal string
    start_date: string;
    end_date: string;
    is_active: boolean;
    status: 'draft' | 'active' | 'archived';
    display_status: string;
    applicable_items: number[]; // IDs
    applicable_sizes: number[]; // IDs
    combo_items: PromotionItem[];
    created_at: string;
}

export interface CreatePromotionData {
    name: string;
    description?: string;
    promotion_type: 'percentage' | 'fixed_amount' | 'combo_fixed_price';
    value: string;
    start_date: string;
    end_date: string;
    is_active?: boolean;
    status?: 'draft' | 'active' | 'archived';
    applicable_items?: number[];
    applicable_sizes?: number[];
    combo_items?: { menu_item: number; menu_item_size?: number | null; quantity: number }[];
}

import { API } from './API';

export const getPromotions = async (): Promise<Promotion[]> => {
    const response = await axios.get(`${API}/promotions/`, {
        withCredentials: true
    });
    return response.data;
};

export const createPromotion = async (data: CreatePromotionData): Promise<Promotion> => {
    const response = await axios.post(`${API}/promotions/`, data, {
        withCredentials: true
    });
    return response.data;
};

export const updatePromotion = async (id: number, data: Partial<CreatePromotionData>): Promise<Promotion> => {
    const response = await axios.put(`${API}/promotions/${id}/`, data, {
        withCredentials: true
    });
    return response.data;
};

export const deletePromotion = async (id: number): Promise<void> => {
    await axios.delete(`${API}/promotions/${id}/`, {
        withCredentials: true
    });
};
