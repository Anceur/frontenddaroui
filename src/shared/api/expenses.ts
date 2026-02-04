import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type ExpenseCategory = 'staff' | 'waste' | 'utilities' | 'repairs' | 'operational' | 'other';

export type Expense = {
    id: number;
    category: ExpenseCategory;
    title: string;
    amount: number;
    ingredient?: number;
    quantity?: number;
    staff_member?: number;
    notes: string;
    date: string;
    created_at: string;
    updated_at: string;
};

export type ExpenseSummary = {
    total: number;
    staff: number;
    waste: number;
    utilities: number;
    repairs: number;
    operational: number;
    other: number;
};

export type ExpenseAnalytics = {
    summary: ExpenseSummary;
    timeseries: Array<{ date: string; amount: number }>;
    categories: Array<{ category: string; amount: number }>;
    top_ingredients: Array<{ name: string; quantity: number; cost: number }>;
    top_suppliers: Array<{ name: string; transactions: number; total: number }>;
};

export const getExpenses = async (category?: string, startDate?: string, endDate?: string): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await axios.get<Expense[]>(`${API}/expenses/?${params.toString()}`);
    return response.data;
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> => {
    const response = await axios.post<Expense>(`${API}/expenses/`, expense);
    return response.data;
};

export const updateExpense = async (id: number, expense: Partial<Expense>): Promise<Expense> => {
    const response = await axios.put<Expense>(`${API}/expenses/${id}/`, expense);
    return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
    await axios.delete(`${API}/expenses/${id}/`);
};

export const getExpenseAnalytics = async (days: number = 30): Promise<ExpenseAnalytics> => {
    const response = await axios.get<ExpenseAnalytics>(`${API}/expenses/analytics/?days=${days}`);
    return response.data;
};
