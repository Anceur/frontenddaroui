import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Edit, X, Save, Loader2, AlertCircle, Package, TrendingDown, CheckCircle2 } from 'lucide-react';
import { getIngredientStocks, patchIngredientStock } from '../../shared/api/ingredient-stock';
import type { IngredientStock } from '../../shared/api/ingredient-stock';
import { getIngredients } from '../../shared/api/ingredients';
import type { Ingredient } from '../../shared/api/ingredients';

export default function IngredientStockManagement() {
  const [stocks, setStocks] = useState<IngredientStock[]>([]);
  const [, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch stocks and ingredients
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [stocksData, ingredientsData] = await Promise.all([
        getIngredientStocks(),
        getIngredients(),
      ]);
      setStocks(stocksData);
      setIngredients(ingredientsData);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des données');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter stocks
  const filteredStocks = stocks.filter((stock) => {
    const ingredientName = stock.ingredient_name || stock.ingredient?.name || '';
    const matchesSearch = ingredientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle form submit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStock, setEditingStock] = useState<IngredientStock | null>(null);
  const [limitFormData, setLimitFormData] = useState({
    reorder_level: 0,
  });

  // Handle form submit for limit update
  const handleSubmitLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;

    try {
      setSubmitting(true);
      setError(null);

      await patchIngredientStock(editingStock.id, {
        reorder_level: limitFormData.reorder_level
      });

      setEditingStock(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du seuil');
      console.error('Error updating limit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit limit
  const handleEditLimit = (stock: IngredientStock) => {
    setEditingStock(stock);
    setLimitFormData({
      reorder_level: stock.reorder_level || 0,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <Package size={32} style={{ color: '#FF8C00' }} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Stock des ingrédients
            </h1>
            <p className="text-gray-500 font-medium tracking-wide mt-1">
              Surveillez les niveaux de stock en temps réel et définissez des alertes de réapprovisionnement
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
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest">Alerte système</h3>
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

      {/* Actions Bar */}
      <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-4 mb-8 flex flex-col lg:flex-row gap-4 shadow-xl shadow-orange-500/5 border border-white">
        <div className="relative flex-grow">
          <Search size={22} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Filtrer par nom d'ingrédient..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-semibold text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-orange-50 rounded-[1.5rem] font-bold text-orange-500 hover:border-orange-200 transition-all hover:bg-orange-50 active:scale-95 group"
            disabled={loading}
          >
            <RefreshCw
              size={22}
              className={`${loading ? 'animate-spin' : ''} transition-transform group-hover:rotate-180 duration-500`}
            />
            ACTUALISER
          </button>
        </div>
      </div>

      {/* Stocks Table */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-24 flex flex-col items-center justify-center border border-white shadow-xl shadow-orange-500/5">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 animate-ping rounded-full opacity-20"></div>
            <Loader2 size={56} className="animate-spin text-orange-500 relative z-10" />
          </div>
          <p className="mt-8 font-bold text-gray-400 uppercase tracking-[0.2em] text-sm">Audit des niveaux de stock...</p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-24 text-center border border-white shadow-xl shadow-orange-500/5">
          <div className="mb-8 inline-block p-8 bg-orange-50 rounded-[2.5rem]">
            <Package size={64} className="text-orange-200" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucun enregistrement trouvé</h3>
          <p className="text-gray-400 font-medium max-w-sm mx-auto tracking-wide">
            Aucun stock d'ingrédient ne correspond à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white shadow-2xl shadow-orange-500/5">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-500/40 transition-all relative">
            {/* Scroll indicator shadows */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Informations ingrédient</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Volume actuel</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Seuil d'alerte</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStocks.map((stock) => {
                  const isLow = Number(stock.quantity) <= (Number(stock.reorder_level) || 0);
                  const unit = stock.ingredient_unit || stock.ingredient?.unit || 'N/A';

                  return (
                    <tr key={stock.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                            {stock.ingredient_name || stock.ingredient?.name || 'Ingrédient inconnu'}
                          </span>
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">
                            ID: #{stock.id.toString().padStart(4, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xl font-bold ${isLow ? 'text-red-500' : 'text-gray-800'}`}>
                            {Number(stock.quantity).toFixed(2)}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            {unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500 tracking-tighter ring-1 ring-inset ring-gray-200/50">
                          {stock.reorder_level ? `${Number(stock.reorder_level).toFixed(2)} ${unit}` : 'DÉSACTIVÉ'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        {isLow ? (
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full w-fit shadow-sm shadow-red-500/5 ring-1 ring-red-100/50">
                            <TrendingDown size={14} className="animate-bounce" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">NIVEAU CRITIQUE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full w-fit shadow-sm shadow-green-500/5 ring-1 ring-green-100/50">
                            <CheckCircle2 size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">EN STOCK</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                        <div className="flex justify-end translate-x-2 sm:translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleEditLimit(stock)}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            <Edit size={14} strokeWidth={3} />
                            <span className="hidden sm:inline">MODIFIER L'ALERTE</span>
                            <span className="sm:hidden">MODIFIER</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Limit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-orange-50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-2xl shadow-sm">
                  <TrendingDown size={24} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Définir le seuil
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Surveillance du stock</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStock(null);
                }}
                className="p-2 hover:bg-white rounded-xl transition-all hover:shadow-sm"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitLimit} className="p-8 space-y-8">
              <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
                <p className="text-xs font-bold text-orange-800 leading-relaxed uppercase tracking-wide">
                  Quantité minimale pour <span className="font-bold underline decoration-orange-300">{editingStock?.ingredient_name || editingStock?.ingredient?.name}</span> avant de déclencher une notification de réapprovisionnement.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Niveau de seuil</label>
                  <span className="text-[11px] font-bold text-orange-500 uppercase">Unité : {editingStock?.ingredient_unit || editingStock?.ingredient?.unit}</span>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-2xl text-orange-600"
                    value={limitFormData.reorder_level}
                    onChange={(e) => setLimitFormData({ ...limitFormData, reorder_level: parseFloat(e.target.value) || 0 })}
                    placeholder="0,00"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-200 group-focus-within:text-orange-400 transition-colors">
                    <Save size={24} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStock(null);
                  }}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm"
                  disabled={submitting}
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="flex-grow-[2] px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      ENREGISTRER LE SEUIL
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
