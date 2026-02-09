import { useState, useEffect } from 'react';
import { Package, Search, Download, Activity, Filter, RefreshCw, Loader2, Calendar, X } from 'lucide-react';
import { getMenuItemMovement, type MenuItemMovement } from '../../shared/api/analytics';

export default function MenuItemMovement() {
    const [movement, setMovement] = useState<MenuItemMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);
    
    // Date Range State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchMovement = async () => {
        try {
            const data = await getMenuItemMovement(startDate || undefined, endDate || undefined);
            setMovement(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMovement();
    }, [startDate, endDate]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchMovement();
    };

    const filteredMovement = movement.filter(item => {
        const matchesSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...new Set(movement.map(item => item.category))];

    const categoryLabel = (cat: string) => (cat === 'All' ? 'Toutes les catégories' : cat);

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Chargement des mouvements des produits...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mouvements des Produits</h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2 font-medium">
                        <Activity className="w-4 h-4 text-orange-500" />
                        Analysez les volumes de ventes par période personnalisée
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 group"
                        title="Rafraîchir"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0">
                        <Download className="w-4 h-4" />
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Controls & Filters Card */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100 mb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search Input */}
                    <div className="relative group lg:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative group">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none appearance-none transition-all duration-200 text-gray-700 font-bold cursor-pointer"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Period selection info or action */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-2xl border border-orange-100/50">
                        <Activity className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-bold text-orange-700 uppercase tracking-tight">Period Analytics Active</span>
                    </div>
                </div>

                {/* Date Range Selectors - "The Calendar Part" */}
                <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-gray-500 font-bold text-sm uppercase tracking-wider">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        Filtrer par dates :
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="flex-1 md:w-44 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none font-medium text-gray-700 transition-all"
                        />
                        <span className="text-gray-400 font-bold">au</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="flex-1 md:w-44 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none font-medium text-gray-700 transition-all"
                        />
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Réinitialiser les dates"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="hidden lg:block ml-auto">
                         <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                             {filteredMovement.length} Produits visibles
                         </span>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden relative">
                {refreshing && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Produit</th>
                                <th className="px-8 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                                
                                {/* Dynamic Period Column OR Standard Columns */}
                                {startDate && endDate ? (
                                    <th className="px-8 py-6 text-center text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50/50">
                                        Période Sélectionnée
                                    </th>
                                ) : (
                                    <>
                                        <th className="px-8 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Aujourd'hui</th>
                                        <th className="px-8 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Ce Mois</th>
                                    </>
                                )}
                                <th className="px-8 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Total Annuel</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMovement.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Package className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-extrabold text-lg">{item.name}</p>
                                                <p className="text-gray-400 text-sm font-bold tracking-tight">{item.price?.toFixed(2)} DA</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-tighter">
                                            {item.category}
                                        </span>
                                    </td>
                                    
                                    {startDate && endDate ? (
                                        <td className="px-8 py-5 text-center bg-orange-50/10">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-2xl font-black text-orange-600">
                                                    {item.period}
                                                </span>
                                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest opacity-60">Quantité</span>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-xl font-black ${item.today > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                                    {item.today}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-xl font-black text-gray-700">{item.month}</span>
                                            </td>
                                        </>
                                    )}

                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xl font-black text-gray-900">{item.year}</span>
                                            {item.year > 100 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
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
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                            <Package className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Aucun produit trouvé</h3>
                        <p className="text-gray-500 mt-2 font-medium">Ajustez vos filtres ou la période sélectionnée</p>
                    </div>
                )}
            </div>
        </div>
    );
}


