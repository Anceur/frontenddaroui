
import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Calendar,
    AlertTriangle, CheckCircle2, Info, ArrowUpRight, ArrowDownRight,
    Activity, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { getEarningsAnalytics } from '../../shared/api/earnings';
import type { EarningsAnalytics } from '../../shared/api/earnings';

const EarningsDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<EarningsAnalytics | null>(null);
    const [dateRange, setDateRange] = useState('Ce mois-ci');

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    // Helper to map range to days
    const getDaysFromRange = (range: string): number => {
        switch (range) {
            case "Aujourd'hui": return 1;
            case 'Hier': return 1;
            case '7 derniers jours': return 7;
            case 'Ce mois-ci': return 30;
            case 'Mois dernier': return 30;
            case 'Cette année': return 365;
            default: return 30;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const days = getDaysFromRange(dateRange);
            const result = await getEarningsAnalytics(days);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Échec du chargement des données de gains');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-DZ', {
            style: 'currency',
            currency: 'DZD',
            minimumFractionDigits: 0
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-xl border border-red-200 m-8">
                <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-red-800 mb-2">Erreur lors du chargement des données</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                    onClick={fetchData}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    const { summary, chart_data, comparison_chart, performance, insights } = data;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analyse des gains nets</h1>
                    <p className="text-gray-500 mt-1">Surveillez la rentabilité et la santé financière de votre restaurant.</p>
                </div>

                <div className="flex space-x-4">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100 px-3 py-2">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:outline-none"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Aujourd'hui</option>
                            <option>Hier</option>
                            <option>7 derniers jours</option>
                            <option>Ce mois-ci</option>
                            <option>Mois dernier</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-5 w-5 text-gray-500 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        <span className="text-sm font-bold text-gray-700">Actualiser</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Net Period Earnings */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                        {summary.change_percentage !== 0 && (
                            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${summary.change_percentage > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {summary.change_percentage > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                                {Math.abs(summary.change_percentage).toFixed(1)}%
                            </div>
                        )}
                    </div>
                    <p className="text-sm font-medium text-gray-400">Gains nets (période)</p>
                    <p className={`text-2xl font-bold mt-1 ${summary.current_earnings >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(summary.current_earnings)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">vs {formatCurrency(summary.previous_earnings)} période précédente</p>
                </div>

                {/* Today */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <Calendar className="text-blue-600" size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Gains aujourd'hui</p>
                    <p className={`text-2xl font-bold mt-1 ${summary.today_earnings >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(summary.today_earnings)}
                    </p>
                </div>

                {/* Month */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 rounded-xl">
                            <Activity className="text-purple-600" size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Gains ce mois-ci</p>
                    <p className={`text-2xl font-bold mt-1 ${summary.month_earnings >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(summary.month_earnings)}
                    </p>
                </div>

                {/* Health Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${performance.profitable_days >= performance.loss_days ? 'bg-green-50' : 'bg-red-50'}`}>
                            <CheckCircle2 className={performance.profitable_days >= performance.loss_days ? 'text-green-600' : 'text-red-600'} size={24} />
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Ratio de rentabilité</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                        {performance.profitable_days}/{performance.profitable_days + performance.loss_days} jours
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Jours bénéficiaires vs jours déficitaires</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Main Line Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Tendance des gains</h3>
                            <p className="text-sm text-gray-400">Rentabilité nette jour par jour</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chart_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(val: number) => [formatCurrency(val), 'Gains']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR', { dateStyle: 'long' })}
                                />
                                <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#16a34a"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Period Comparison Bar Chart */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Comparaison de période</h3>
                    <p className="text-sm text-gray-400 mb-8">Cette période vs période précédente — {getDaysFromRange(dateRange)} jours</p>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparison_chart} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    formatter={(val: number) => [formatCurrency(val), 'Gains']}
                                />
                                <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                                    {comparison_chart.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#94a3b8'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">Différence</span>
                        <span className={`text-lg font-bold ${summary.current_earnings >= summary.previous_earnings ? 'text-green-600' : 'text-red-600'}`}>
                            {summary.current_earnings >= summary.previous_earnings ? '+' : ''}
                            {formatCurrency(summary.current_earnings - summary.previous_earnings)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Indicators */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={24} className="text-green-600" />
                        Performances
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-green-600 shadow-sm">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-green-800 font-medium">Meilleure journée de gains</p>
                                    <p className="text-xs text-green-600">{performance.best_day.date ? new Date(performance.best_day.date).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : 'N/D'}</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-green-700">{formatCurrency(performance.best_day.amount)}</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-red-600 shadow-sm">
                                    <TrendingDown size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-red-800 font-medium">Pire journée de gains</p>
                                    <p className="text-xs text-red-600">{performance.worst_day.date ? new Date(performance.worst_day.date).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : 'N/D'}</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-red-700">{formatCurrency(performance.worst_day.amount)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Jours bénéficiaires</p>
                                <p className="text-2xl font-black text-green-600">{performance.profitable_days}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Jours déficitaires</p>
                                <p className="text-2xl font-black text-red-600">{performance.loss_days}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights & Warnings */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Info size={24} className="text-blue-600" />
                        Analyses financières
                    </h3>

                    <div className="space-y-4">
                        {insights.length > 0 ? (
                            insights.map((insight, idx) => (
                                <div key={idx} className="flex gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                    <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-amber-900 font-bold text-sm mb-1 uppercase tracking-tight">Signal d'alerte</h4>
                                        <p className="text-amber-800 text-sm leading-relaxed">{insight}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex gap-4 p-5 bg-green-50 rounded-2xl border border-green-100">
                                <div className="shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h4 className="text-green-900 font-bold text-sm mb-1">Opérations stables</h4>
                                    <p className="text-green-800 text-sm leading-relaxed">Aucune anomalie de coût significative détectée pour cette période. Les gains suivent de près les tendances de revenus.</p>
                                </div>
                            </div>
                        )}

                        <div className="p-5 border border-dashed border-gray-200 rounded-2xl">
                            <h4 className="text-gray-900 font-bold text-sm mb-2">💡 Astuce opérationnelle</h4>
                            <p className="text-gray-600 text-sm italic">« Concentrez-vous sur la réduction des gaspillages pendant les week-ends. Même une réduction de 5 % des pertes peut améliorer sensiblement les gains mensuels nets. »</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EarningsDashboard;
