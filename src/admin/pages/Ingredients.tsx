import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, ShoppingBag, Truck } from 'lucide-react';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../shared/api/ingredients';
import type { Ingredient, CreateIngredientData } from '../../shared/api/ingredients';
import { getSuppliers } from '../../shared/api/suppliers';
import type { Supplier } from '../../shared/api/suppliers';

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState<CreateIngredientData>({
    name: '',
    unit: 'kg',
    supplier_ids: [],
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIngredients();
      setIngredients(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des ingrédients');
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchSuppliers();
  }, []);

  // Filter ingredients
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ingredient.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingIngredient) {
        // Update existing ingredient
        await updateIngredient(editingIngredient.id, formData);
      } else {
        // Create new ingredient
        await createIngredient(formData);
      }

      // Reset form and close modal
      setFormData({ name: '', unit: 'kg', supplier_ids: [] });
      setEditingIngredient(null);
      setIsModalOpen(false);

      // Refresh ingredients list
      await fetchIngredients();
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement de l'ingrédient");
      console.error('Error saving ingredient:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormData({
      name: ingredient.name,
      unit: ingredient.unit,
      supplier_ids: ingredient.supplier_ids || [],
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteIngredient(id);
      setDeleteConfirm(null);
      await fetchIngredients();
    } catch (err: any) {
      setError(err.message || "Échec de la suppression de l'ingrédient");
      console.error('Error deleting ingredient:', err);
    }
  };

  // Open modal for new ingredient
  const openNewModal = () => {
    setEditingIngredient(null);
    setFormData({ name: '', unit: 'kg', supplier_ids: [] });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <ShoppingBag size={32} style={{ color: '#FF8C00' }} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Ingrédients bruts
            </h1>
            <p className="text-gray-500 font-medium tracking-wide mt-1">
              Composants d'inventaire et normes de mesure
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
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-widest">Action requise</h3>
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
          <Search size={20} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400" />
          <input
            type="text"
            placeholder="Rechercher des matières premières..."
            className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-none rounded-[2rem] focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-semibold text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchIngredients}
            className="p-4 bg-white border-2 border-orange-50 rounded-[1.5rem] hover:border-orange-200 transition-all hover:bg-orange-50 group active:scale-95"
            disabled={loading}
          >
            <RefreshCw
              size={22}
              className={`${loading ? 'animate-spin' : ''} text-orange-500 group-hover:rotate-45 transition-transform`}
            />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-3 px-8 py-4 bg-orange-500 text-white rounded-[1.5rem] font-bold hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={22} strokeWidth={3} />
            ENREGISTRER L'INGRÉDIENT
          </button>
        </div>
      </div>

      {/* Ingredients List */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-20 flex flex-col items-center justify-center border border-white shadow-xl shadow-orange-500/5">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-400 animate-ping rounded-full opacity-20"></div>
            <Loader2 size={48} className="animate-spin text-orange-500 relative z-10" />
          </div>
          <p className="mt-6 font-bold text-gray-400 uppercase tracking-widest text-sm">Synchronisation de l'inventaire...</p>
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-20 text-center border border-white shadow-xl shadow-orange-500/5">
          <div className="mb-6 inline-block p-6 bg-orange-50 rounded-[2rem]">
            <Search size={48} className="text-orange-200" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Inventaire vide</h2>
          <p className="text-gray-400 font-medium">Aucun ingrédient correspondant à vos critères n'a été trouvé.</p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] overflow-hidden border border-white shadow-2xl shadow-orange-500/5">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-500/40 transition-all relative">
            {/* Scroll indicator shadows */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">ID Matériel</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nom</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type d'unité</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Fournisseurs principaux</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 whitespace-nowrap">
                      <span className="text-xs font-bold text-gray-300">#{ingredient.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {ingredient.name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 whitespace-nowrap">
                      <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500 tracking-tighter ring-1 ring-inset ring-gray-200/50">
                        {ingredient.unit}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <div className="flex flex-wrap gap-2">
                        {ingredient.suppliers_list && ingredient.suppliers_list.length > 0 ? (
                          ingredient.suppliers_list.map((s, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 shadow-sm rounded-lg text-[10px] font-bold text-gray-600 uppercase tracking-tight">
                              <Truck size={12} className="text-orange-400" />
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-medium text-gray-300 italic">Non attribué</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 whitespace-nowrap">
                      <div className="flex justify-end gap-1 sm:gap-2 translate-x-2 sm:translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Modifier l'entrée"
                        >
                          <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(ingredient.id)}
                          className="p-2 sm:p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                          title="Supprimer l'entrée"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full border border-orange-50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-2xl shadow-sm">
                  <ShoppingBag size={24} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {editingIngredient ? 'Mettre à jour le matériau' : 'Nouvel ingrédient'}
                  </h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Enregistrement d'inventaire</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white rounded-xl transition-all hover:shadow-sm"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Identification</label>
                <input
                  type="text"
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-semibold text-gray-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex. Mozzarella"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unité de mesure</label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-semibold text-gray-700 appearance-none cursor-pointer"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="kg">kilogrammes (kg)</option>
                    <option value="l">litres (L)</option>
                    <option value="piece">unités (pièce)</option>
                    <option value="g">grammes (g)</option>
                    <option value="ml">millilitres (ml)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fournisseurs autorisés</label>
                <div className="bg-gray-50 rounded-[1.5rem] p-4 max-h-[160px] overflow-y-auto scrollbar-hide border border-transparent focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                  <div className="space-y-2">
                    {suppliers.map((supplier) => (
                      <label key={supplier.id} className="flex items-center gap-3 p-3 bg-white rounded-xl cursor-pointer hover:shadow-sm transition-all border border-gray-100 group">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-2 border-gray-200 text-orange-500 focus:ring-orange-500/20"
                          checked={formData.supplier_ids?.includes(supplier.id)}
                          onChange={(e) => {
                            const current = formData.supplier_ids || [];
                            const updated = e.target.checked
                              ? [...current, supplier.id]
                              : current.filter(id => id !== supplier.id);
                            setFormData({ ...formData, supplier_ids: updated });
                          }}
                        />
                        <span className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">{supplier.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-bold px-1 italic">Associer les matériaux aux fournisseurs enregistrés</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                  disabled={submitting}
                >
                  ANNULER
                </button>
                <button
                  type="submit"
                  className="flex-grow-[1.5] px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={24} />
                      ENREGISTRER
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl border border-red-50">
            <div className="mb-6 inline-block p-6 bg-red-50 rounded-[2rem] text-red-500 shadow-inner">
              <Trash2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirmer la suppression</h2>
            <p className="text-gray-500 font-medium leading-relaxed mb-8">
              Cela supprimera définitivement le matériau des enregistrements d'inventaire. Les recettes de base utilisant cet ingrédient peuvent être affectées.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                ANNULER
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                SUPPRIMER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
