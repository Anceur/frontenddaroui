import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  User,
  History,
  Filter,
  X,
  AlertCircle,
  Loader2,
  Calendar,
  Hash,
  Scale,
} from 'lucide-react';
import { getIngredientTraces } from '../../shared/api/ingredient-traces';
import type { IngredientTrace, IngredientTraceFilters } from '../../shared/api/ingredient-traces';
import { getIngredients } from '../../shared/api/ingredients';

export default function IngredientTracesManagement() {
  const [traces, setTraces] = useState<IngredientTrace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTraces, setTotalTraces] = useState<number>(0);
  const pageSize = 20;

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Ingredients list for filter dropdown
  const [ingredients, setIngredients] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(false);

  // Fetch ingredients for filter
  const fetchIngredients = useCallback(async () => {
    try {
      setLoadingIngredients(true);
      const data = await getIngredients();
      setIngredients(data.map(ing => ({ id: ing.id, name: ing.name })));
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  // Fetch traces from API
  const fetchTraces = useCallback(async () => {
    try {
      setError(null);

      const filters: IngredientTraceFilters = {
        page: currentPage,
        page_size: pageSize,
      };

      if (selectedIngredient) {
        filters.ingredient = selectedIngredient;
      }

      if (selectedOrder.trim()) {
        const orderId = selectedOrder.replace('#', '').trim();
        if (orderId) {
          const orderNum = parseInt(orderId, 10);
          if (!isNaN(orderNum)) {
            filters.order = orderNum;
          }
        }
      }

      const response = await getIngredientTraces(filters);
      setTraces(response.traces || []);
      setTotalPages(response.total_pages || 1);
      setTotalTraces(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching ingredient traces:', err);
      const errorMessage = err.message || 'Échec du chargement des traces d\'ingrédients. Veuillez réessayer.';

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentification requise. Veuillez vous connecter en tant qu\'administrateur pour voir les traces d\'ingrédients.');
      } else {
        setError(errorMessage);
      }
      setTraces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, selectedIngredient, selectedOrder]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchIngredients();
    fetchTraces();
  }, [fetchTraces]);

  // Separate effect for ingredients (only fetch once)
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Filter traces by search query
  const filteredTraces = traces.filter((trace) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      trace.ingredient_name?.toLowerCase().includes(query) ||
      trace.ingredient?.name?.toLowerCase().includes(query) ||
      trace.used_by_username?.toLowerCase().includes(query) ||
      trace.order_display?.toLowerCase().includes(query) ||
      `order #${trace.order_id}`.toLowerCase().includes(query) ||
      String(trace.order_id || '').includes(query)
    );
  });

  // Format date/time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `il y a ${diffMins} min`;
      if (diffHours < 24) return `il y a ${diffHours} h`;
      if (diffDays < 7) return `il y a ${diffDays} j`;
      return formatDateTime(dateString);
    } catch {
      return dateString;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchTraces();
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedIngredient(null);
    setSelectedOrder('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedIngredient !== null || selectedOrder.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <History size={32} style={{ color: '#FF8C00' }} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Traçabilité des ingrédients
            </h1>
            <p className="text-gray-500 font-medium tracking-wide mt-1">
              Historique de consommation des ingrédients et journaux des transactions de stock
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 animate-in slide-in-from-top duration-300">
          <div className="bg-red-50/50 backdrop-blur-md border border-red-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-red-500 p-2 rounded-xl shadow-lg shadow-red-200">
              <AlertCircle size={20} className="text-white" />
            </div>
            <div className="flex-grow">
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest">Erreur de suivi</h3>
              <p className="text-red-600 font-bold">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 hover:bg-red-100/50 rounded-xl transition-colors"
            >
              <X size={20} className="text-red-400" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Journaux totaux', value: totalTraces.toLocaleString('fr-FR'), icon: History, color: 'orange' },
          { label: 'Plage de données', value: `Page ${currentPage} / ${totalPages}`, icon: Calendar, color: 'blue' },
          { label: 'Éléments visibles', value: filteredTraces.length, icon: Filter, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 border border-white shadow-xl shadow-gray-200/50 flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-4 mb-8 flex flex-col lg:flex-row gap-4 shadow-xl shadow-orange-500/5 border border-white">
        <div className="relative flex-grow">
          <Search size={22} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Rechercher par ingrédient, commande ou nom du personnel..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-semibold text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-bold transition-all active:scale-95 ${showFilters || hasActiveFilters
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
              : 'bg-white border-2 border-orange-50 text-orange-500 hover:border-orange-200'
              }`}
          >
            <Filter size={22} />
            FILTRES
            {hasActiveFilters && (
              <span className="bg-white text-orange-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {[selectedIngredient, selectedOrder].filter(Boolean).length}
              </span>
            )}
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-orange-50 rounded-[1.5rem] font-bold text-orange-500 hover:border-orange-200 transition-all hover:bg-orange-50 active:scale-95 group"
            disabled={refreshing}
          >
            <RefreshCw
              size={22}
              className={`${refreshing ? 'animate-spin' : ''} transition-transform group-hover:rotate-180 duration-500 text-orange-500`}
            />
            SYNCHRO
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-8 mb-8 border border-white shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={16} /> Paramètres avancés
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-bold text-orange-500 hover:underline">
                RÉINITIALISER LES FILTRES
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Ingrédient</label>
              <select
                value={selectedIngredient || ''}
                onChange={(e) => {
                  setSelectedIngredient(e.target.value ? parseInt(e.target.value, 10) : null);
                  setCurrentPage(1);
                }}
                className="w-full px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 outline-none font-semibold text-gray-700 transition-all appearance-none"
                disabled={loadingIngredients}
              >
                <option value="">Tous les ingrédients</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Référence commande</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  placeholder="ex. 1024"
                  value={selectedOrder}
                  onChange={(e) => {
                    setSelectedOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 outline-none font-semibold text-gray-700 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white shadow-2xl shadow-orange-500/5">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-400 animate-ping rounded-full opacity-20"></div>
              <Loader2 size={56} className="animate-spin text-orange-500 relative z-10" />
            </div>
            <p className="mt-8 font-bold text-gray-300 uppercase tracking-[0.2em] text-sm text-center">Reconstruction de l\'historique d\'utilisation...</p>
          </div>
        ) : filteredTraces.length === 0 ? (
          <div className="p-24 text-center">
            <div className="mb-8 inline-block p-8 bg-orange-50 rounded-[2.5rem]">
              <Package size={64} className="text-orange-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun journal trouvé</h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto tracking-wide">
              {searchQuery || hasActiveFilters
                ? 'Aucune trace d\'utilisation ne correspond aux filtres spécifiés.'
                : 'La surveillance du système n\'a pas encore enregistré de transactions d\'ingrédients.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-500/40 transition-all relative">
            {/* Scroll indicator shadows */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Données temporelles</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Composant</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Référence visuelle</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTraces.map((trace) => {
                  const unit = trace.ingredient_unit || trace.ingredient?.unit || '';
                  return (
                    <tr key={trace.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-orange-100 transition-colors">
                            <Clock size={18} className="text-orange-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{formatRelativeTime(trace.timestamp)}</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{formatDateTime(trace.timestamp)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex items-center gap-3">
                          <Scale size={18} className="text-orange-500" />
                          <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">
                            {trace.ingredient_name || trace.ingredient?.name || 'Ingrédient inconnu'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-red-500">-{trace.quantity_used}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{unit}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-gray-400">FLUX DE STOCK :</span>
                            <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {trace.stock_before} → {trace.stock_after}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        {trace.order_id ? (
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full w-fit ring-1 ring-blue-100">
                            <Hash size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">COMMANDE n°{trace.order_id}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-400 rounded-full w-fit ring-1 ring-gray-200">
                            <span className="text-[10px] font-bold uppercase tracking-widest">SYSTÈME MANUEL</span>
                          </div>
                        )}
                        {trace.notes && (
                          <p className="text-[10px] text-gray-400 italic mt-1.5 max-w-[200px] truncate">{trace.notes}</p>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-300">
                            <User size={16} />
                          </div>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">
                            {trace.used_by_username || 'SYSTÈME'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Console */}
        {!loading && filteredTraces.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Affichage de la <span className="text-orange-500">{currentPage}</span> sur <span className="text-orange-500">{totalPages}</span> pages • <span className="text-orange-500">{totalTraces}</span> journaux globaux
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-orange-500 hover:bg-orange-50 disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="px-6 py-3 bg-white rounded-2xl shadow-sm border border-orange-100 font-bold text-orange-600">
                {currentPage}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-orange-500 hover:bg-orange-50 disabled:opacity-20 transition-all active:scale-90"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
