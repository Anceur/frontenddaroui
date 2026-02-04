import axios from 'axios';
import { API } from './API';

axios.defaults.withCredentials = true;

export type EarningsSummary = {
    current_earnings: number;
    previous_earnings: number;
    today_earnings: number;
    month_earnings: number;
    change_percentage: number;
};

export type ChartPoint = {
    date: string;
    amount: number;
};

export type PerformanceMetrics = {
    best_day: { date: string | null; amount: number };
    worst_day: { date: string | null; amount: number };
    profitable_days: number;
    loss_days: number;
};

export type EarningsAnalytics = {
    summary: EarningsSummary;
    chart_data: ChartPoint[];
    comparison_chart: { name: string; amount: number }[];
    performance: PerformanceMetrics;
    insights: string[];
};

export async function getEarningsAnalytics(days: number = 30): Promise<EarningsAnalytics> {
    try {
        const response = await axios.get<EarningsAnalytics>(`${API}/earnings/analytics/?days=${days}`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching earnings analytics:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch earnings analytics');
    }
}
