import { useState, useEffect } from 'react';
import { Package, Search, Download, TrendingUp, DollarSign, Activity, Filter, RefreshCw, Loader2, Calendar, ShoppingCart } from 'lucide-react';
import { getMenuItemMovement, type MenuItemMovement, type MenuItemMovementResponse } from '../../shared/api/analytics';

export default function MenuItemMovement() {
    const [data, setData] = useState<MenuItemMovementResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    
    // Date range state - default to last 30 days
    const getDefaultDates = () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    };
    
    const [dateRange, setDateRange] = useState(getDefaultDates());

    const fetchMovement = async () => {
        try {
            const result = await getMenuItemMovement(dateRange.start, dateRange.end);
            setData(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMovement();
    }, [dateRange]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMovement();
    };

    const filteredMovement = data?.items.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    }) || [];

    const categories = ['All', ...new Set(data?.items.map(item => item.category) || [])];
    const categoryLabel = (cat: string) => (cat === 'All' ? 'Tous' : cat);

    // Calculate summary stats
    const totalRevenue = filteredMovement.reduce((sum, item) => sum + item.revenue, 0);
    const totalProfit = filteredMovement.reduce((sum, item) => sum + item.profit, 0);
    const totalQuantity = filteredMovement.reduce((sum, item) => sum + item.quantity_sold, 0);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Chargement des données de mouvement des produits...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mouvements des produits</h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2 font-medium">
                        <Activity className="w-4 h-4 text-orange-500" />
                        Suivez les ventes détaillées par période personnalisée
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0">
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-blue-600 text-sm font-bold">Quantité totale</p>
                            <p className="text-2xl font-black text-blue-900">{totalQuantity}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-green-600 text-sm font-bold">Revenu total</p>
                            <p className="text-2xl font-black text-green-900">{totalRevenue.toFixed(2)} DA</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-purple-600 text-sm font-bold">Profit total</p>
                            <p className="text-2xl font-black text-purple-900">{totalProfit.toFixed(2)} DA</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-orange-600 text-sm font-bold">Produits vendus</p>
                            <p className="text-2xl font-black text-orange-900">{data?.items_with_sales || 0}/{data?.total_items || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Date Range Pickers */}
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-200 text-gray-700 font-medium"
                    />
                </div>

                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-200 text-gray-700 font-medium"
                    />
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400"
                    />
                </div>

                <div className="relative group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none appearance-none transition-all duration-200 text-gray-700 font-bold cursor-pointer"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Produit</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Catégorie</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap bg-blue-50/30">Qté vendue</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Commandes</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap bg-green-50/30">Revenu</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Coût</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap bg-purple-50/30">Profit</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Marge %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMovement.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/80 transition-all duration-150 group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Package className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-bold">{item.name}</p>
                                                <p className="text-gray-500 text-xs font-medium">{item.price?.toFixed(2)} DA</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center bg-blue-50/10">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-lg font-black text-blue-600">{item.quantity_sold}</span>
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {item.avg_quantity_per_order.toFixed(1)}/cmd
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-base font-bold text-gray-700">{item.order_count}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center bg-green-50/10">
                                        <span className="text-base font-black text-green-600">{item.revenue.toFixed(2)} DA</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-base font-bold text-gray-600">{item.total_cost.toFixed(2)} DA</span>
                                    </td>
                                    <td className="px-6 py-4 text-center bg-purple-50/10">
                                        <span className={`text-base font-black ${item.profit >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                            {item.profit.toFixed(2)} DA
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-base font-black ${item.profit_margin >= 50 ? 'text-green-600' : item.profit_margin >= 20 ? 'text-orange-600' : 'text-red-600'}`}>
                                                {item.profit_margin.toFixed(1)}%
                                            </span>
                                            {item.profit_margin >= 50 && (
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredMovement.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-inner">
                            <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Aucun produit trouvé</h3>
                        <p className="text-gray-500 mt-2 font-medium">Essayez de modifier votre recherche ou vos filtres</p>
                    </div>
                )}
            </div>
        </div>
    );
}
