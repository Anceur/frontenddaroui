import { useState, useEffect } from 'react';
import { Package, Search, Download, ArrowUpRight, Activity, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { getMenuItemMovement, type MenuItemMovement } from '../../shared/api/analytics';

export default function MenuItemMovement() {
    const [movement, setMovement] = useState<MenuItemMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    const fetchMovement = async () => {
        try {
            const data = await getMenuItemMovement();
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
    }, []);

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

    // Affichage des libellés de catégories (valeur 'All' conservée pour la logique)
    const categoryLabel = (cat: string) => (cat === 'All' ? 'Tous' : cat);

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
                        Suivez le volume des ventes sur des intervalles quotidien, mensuel et annuel
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
                        Exporter les données
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="relative group md:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom de produit..."
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
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Détails du produit</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Catégorie</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap bg-orange-50/30">Aujourd'hui</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Ce mois-ci</th>
                                <th className="px-8 py-5 text-center text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Cette année</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMovement.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/80 transition-all duration-150 group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Package className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-extrabold text-lg">{item.name}</p>
                                                <p className="text-gray-500 text-sm font-medium">{item.price?.toFixed(2)} DA</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center bg-orange-50/10">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className={`text-xl font-black ${item.today > 10 ? 'text-orange-600' : 'text-gray-700'}`}>
                                                {item.today}
                                            </span>
                                            {item.today > 0 && (
                                                <span className="text-[10px] font-bold text-orange-400 flex items-center gap-0.5">
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    ACTIF
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-xl font-black text-gray-700">{item.month}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xl font-black text-gray-900">{item.year}</span>
                                            {item.year > 100 && (
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
