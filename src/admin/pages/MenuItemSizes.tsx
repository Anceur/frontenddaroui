import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, Cookie, ChevronDown } from 'lucide-react';
import { getMenuItemSizes, createMenuItemSize, updateMenuItemSize, deleteMenuItemSize } from '../../shared/api/menu-item-sizes';
import { getMenuItems } from '../../shared/api/menu-items';
import { getIngredients } from '../../shared/api/ingredients';
import { getMenuItemSizeIngredients, createMenuItemSizeIngredient, updateMenuItemSizeIngredient, deleteMenuItemSizeIngredient } from '../../shared/api/menu-item-size-ingredients';
import type { MenuItemSize, CreateMenuItemSizeData } from '../../shared/api/menu-item-sizes';
import type { MenuItem } from '../../shared/api/menu-items';
import type { Ingredient } from '../../shared/api/ingredients';
import type { MenuItemSizeIngredient, CreateMenuItemSizeIngredientData } from '../../shared/api/menu-item-size-ingredients';

export default function MenuItemSizesManagement() {
  const [sizes, setSizes] = useState<MenuItemSize[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSize, setEditingSize] = useState<MenuItemSize | null>(null);
  const [formData, setFormData] = useState<CreateMenuItemSizeData>({
    menu_item_id: 0,
    size: 'M',
    price: 0,
    cost_price: 0,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Ingredients management state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedSizeForIngredients, setSelectedSizeForIngredients] = useState<MenuItemSize | null>(null);
  const [sizeIngredients, setSizeIngredients] = useState<MenuItemSizeIngredient[]>([]);
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState<boolean>(false);
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState<boolean>(false);
  const [editingSizeIngredient, setEditingSizeIngredient] = useState<MenuItemSizeIngredient | null>(null);
  const [ingredientFormData, setIngredientFormData] = useState<CreateMenuItemSizeIngredientData>({
    size_id: 0,
    ingredient_id: 0,
    quantity: 0,
  });
  const [submittingIngredient, setSubmittingIngredient] = useState<boolean>(false);
  const [deleteIngredientConfirm, setDeleteIngredientConfirm] = useState<number | null>(null);

  // Fetch sizes and menu items
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sizesData, itemsData, ingredientsData] = await Promise.all([
        getMenuItemSizes(),
        getMenuItems(),
        getIngredients(),
      ]);
      setSizes(sizesData);
      setMenuItems(itemsData);
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

  // Filter sizes
  const filteredSizes = sizes.filter((size) => {
    const menuItemName = size.menu_item_name || '';
    const matchesSearch = menuItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      size.size.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.menu_item_id === 0) {
      setError("Veuillez sélectionner un article du menu");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      if (editingSize) {
        await updateMenuItemSize(editingSize.id, formData);
      } else {
        await createMenuItemSize(formData);
      }

      setFormData({ menu_item_id: 0, size: 'M', price: 0, cost_price: 0 });
      setEditingSize(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement de la taille');
      console.error('Error saving size:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (size: MenuItemSize) => {
    setEditingSize(size);
    setFormData({
      menu_item_id: size.menu_item || size.menu_item_id || 0,
      size: size.size,
      price: size.price,
      cost_price: size.cost_price || 0,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItemSize(id);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression de la taille');
      console.error('Error deleting size:', err);
    }
  };

  // Open modal for new size
  const openNewModal = () => {
    setEditingSize(null);
    setFormData({ menu_item_id: 0, size: 'M', price: 0, cost_price: 0 });
    setIsModalOpen(true);
  };

  // Handle open ingredients modal
  const handleManageIngredients = async (size: MenuItemSize) => {
    try {
      setSelectedSizeForIngredients(size);
      setError(null);
      const ingredients = await getMenuItemSizeIngredients(size.id);
      setSizeIngredients(ingredients);
      setIsIngredientsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des ingrédients');
      console.error('Error fetching size ingredients:', err);
    }
  };

  // Fetch size ingredients
  const fetchSizeIngredients = async () => {
    if (!selectedSizeForIngredients) return;
    try {
      const ingredients = await getMenuItemSizeIngredients(selectedSizeForIngredients.id);
      setSizeIngredients(ingredients);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des ingrédients');
      console.error('Error fetching size ingredients:', err);
    }
  };

  // Handle ingredient form submit
  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSizeForIngredients || ingredientFormData.ingredient_id === 0) {
      setError('Veuillez sélectionner un ingrédient');
      return;
    }
    try {
      setSubmittingIngredient(true);
      setError(null);

      if (editingSizeIngredient) {
        await updateMenuItemSizeIngredient(editingSizeIngredient.id, ingredientFormData);
      } else {
        await createMenuItemSizeIngredient({
          ...ingredientFormData,
          size_id: selectedSizeForIngredients.id,
        });
      }

      setIngredientFormData({ size_id: 0, ingredient_id: 0, quantity: 0 });
      setEditingSizeIngredient(null);
      setIsIngredientFormOpen(false);
      await fetchSizeIngredients();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement de l\'ingrédient');
      console.error('Error saving ingredient:', err);
    } finally {
      setSubmittingIngredient(false);
    }
  };

  // Handle edit ingredient
  const handleEditIngredient = (sizeIngredient: MenuItemSizeIngredient) => {
    setEditingSizeIngredient(sizeIngredient);
    setIngredientFormData({
      size_id: sizeIngredient.size_id || selectedSizeForIngredients?.id || 0,
      ingredient_id: sizeIngredient.ingredient_id || sizeIngredient.ingredient.id,
      quantity: sizeIngredient.quantity,
    });
    setIsIngredientFormOpen(true);
  };

  // Handle delete ingredient
  const handleDeleteIngredient = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItemSizeIngredient(id);
      setDeleteIngredientConfirm(null);
      await fetchSizeIngredients();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression de l\'ingrédient');
      console.error('Error deleting ingredient:', err);
    }
  };

  // Open new ingredient form
  const openNewIngredientForm = () => {
    setEditingSizeIngredient(null);
    setIngredientFormData({
      size_id: selectedSizeForIngredients?.id || 0,
      ingredient_id: 0,
      quantity: 0,
    });
    setIsIngredientFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <Cookie size={32} style={{ color: '#FF8C00' }} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Tailles des articles
            </h1>
            <p className="text-gray-500 font-medium tracking-wide mt-1">
              Configurez les portions et les prix de vos articles de menu
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 animate-in slide-in-from-top duration-300">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div className="flex-grow">
              <p className="text-red-800 font-bold text-sm uppercase tracking-wider">Erreur rencontrée</p>
              <p className="text-red-600/80 text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-400 group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col lg:flex-row gap-4 items-center transition-all">
        <div className="relative flex-grow w-full">
          <Search size={22} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom d'article ou de taille..."
            className="pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl w-full focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-medium placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
          <button
            onClick={fetchData}
            className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
            disabled={loading}
          >
            <RefreshCw size={22} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} style={{ color: '#FF8C00' }} />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all w-full lg:w-auto whitespace-nowrap overflow-hidden relative group"
            style={{ backgroundColor: '#FF8C00' }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <Plus size={22} className="relative z-10" />
            <span className="relative z-10">Ajouter une taille</span>
          </button>
        </div>
      </div>

      {/* Sizes Section */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 p-20 flex flex-col items-center justify-center gap-4 animate-pulse">
          <Loader2 size={48} className="animate-spin text-orange-500" />
          <p className="text-orange-900/40 font-bold uppercase tracking-widest text-xs">Synchronisation de l'inventaire</p>
        </div>
      ) : filteredSizes.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold text-lg">Aucune configuration de taille trouvée</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-orange-500 font-bold hover:underline underline-offset-4"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-gray-100 hover:scrollbar-thumb-orange-500/40 transition-all relative">
            {/* Scroll indicator shadows */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 md:hidden"></div>
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Référence produit</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Libellé de taille</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Prix de vente</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Coût de production</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSizes.map((size) => (
                  <tr key={size.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {size.menu_item_name || 'Article générique'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase text-gray-500 tracking-tighter">
                        {size.size}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <span className="text-lg font-bold text-orange-600">
                        {Number(size.price).toFixed(2)} <span className="text-[10px] font-semibold opacity-60">DA</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <span className="text-sm font-bold text-gray-400">
                        {Number(size.cost_price || 0).toFixed(2)} <span className="text-[10px]">DA</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      <div className="flex justify-end gap-1 sm:gap-2 translate-x-2 sm:translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => handleManageIngredients(size)}
                          className="p-2 sm:p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          title="Composition des ingrédients"
                        >
                          <Cookie size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => handleEdit(size)}
                          className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(size.id)}
                          className="p-2 sm:p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
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

      {/* Add/Edit Size Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-orange-50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Save size={20} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingSize ? 'Modifier la configuration' : 'Définir la taille'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all group">
                <X size={20} className="text-gray-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Article parent</label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                    value={formData.menu_item_id}
                    onChange={(e) => {
                      const newItemId = parseInt(e.target.value);

                      // Auto-select first available size for this item
                      const standardSizes = ['M', 'L', 'Mega'];
                      const usedSizes = sizes
                        .filter(s =>
                          (s.menu_item === newItemId || s.menu_item_id === newItemId) &&
                          (!editingSize || s.id !== editingSize.id)
                        )
                        .map(s => s.size);

                      const availableSizes = standardSizes.filter(s => !usedSizes.includes(s as any));
                      let newSize = formData.size;

                      // If current size is taken, switch to first available
                      if (!availableSizes.includes(newSize as string) && availableSizes.length > 0) {
                        newSize = availableSizes[0] as any;
                      }

                      setFormData({ ...formData, menu_item_id: newItemId, size: newSize });
                    }}
                  >
                    <option value={0}>Sélectionner un produit...</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Spécification de taille</label>
                  <div className="relative">
                    <select
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer uppercase"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value as CreateMenuItemSizeData['size'] })}
                    >
                      {/* Define standard sizes */}
                      {(() => {
                        const standardSizes = [
                          { value: 'M', label: 'Moyen' },
                          { value: 'L', label: 'Grand' },
                          { value: 'Mega', label: 'Méga' }
                        ];

                        // Get already used sizes for this item
                        const usedSizes = sizes
                          .filter(s =>
                            (s.menu_item === formData.menu_item_id || s.menu_item_id === formData.menu_item_id) && // Match item
                            (!editingSize || s.id !== editingSize.id) // Exclude current editing item
                          )
                          .map(s => s.size);

                        // Filter available sizes
                        const availableSizes = standardSizes.filter(s => !usedSizes.includes(s.value));

                        // If current selection is invalid (e.g. initial load or just switched item), 
                        // but we need to show it if it's the editing one. 
                        // Actually, if we are creating new, we might default to first available.

                        return availableSizes.length > 0 ? (
                          availableSizes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))
                        ) : (
                          <option value="" disabled>Plus de tailles disponibles</option>
                        );
                      })()}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                  </div>
                  {/* Warning if no sizes available */}
                  {(() => {
                    const usedSizesCount = sizes.filter(s =>
                      (s.menu_item === formData.menu_item_id || s.menu_item_id === formData.menu_item_id) &&
                      (!editingSize || s.id !== editingSize.id)
                    ).length;
                    // Hardcoded 3 sizes for now
                    if (usedSizesCount >= 3 && formData.menu_item_id !== 0) {
                      return (
                        <div className="absolute -bottom-6 left-0 text-[10px] text-orange-500 font-bold flex items-center gap-1">
                          <AlertCircle size={10} /> Toutes les tailles sont configurées pour cet article
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Prix de vente (DA)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-orange-600 text-lg"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Coût de production unitaire (DA)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-500"
                  value={formData.cost_price || 0}
                  onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl text-gray-400 font-bold hover:bg-gray-50 transition-all uppercase tracking-tighter text-sm"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] px-6 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest"
                  style={{ backgroundColor: '#FF8C00' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={18} />
                      Enregistrer
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
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[60] p-4 transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-10 border border-red-50 text-center">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-100/50">
              <Trash2 size={48} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tighter">Supprimer la taille ?</h2>
            <p className="text-gray-400 mb-10 leading-relaxed font-medium">
              Cela supprimera définitivement cette taille de portion et sa recette d'ingrédients du système.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="w-full py-5 bg-red-500 rounded-[1.25rem] text-white font-bold hover:bg-red-600 shadow-xl shadow-red-500/30 transition-all uppercase text-xs tracking-widest"
              >
                Confirmer la suppression
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-all text-sm"
              >
                Annuler l'action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients Management Modal */}
      {isIngredientsModalOpen && selectedSizeForIngredients && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-orange-50">
            <div className="p-10 border-b border-gray-50 flex justify-between items-start bg-gradient-to-br from-orange-50/20 to-transparent">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-3 py-1 bg-orange-100 rounded-full text-[10px] font-bold uppercase text-orange-600 tracking-widest">Créateur de recette</div>
                  <span className="text-gray-200">/</span>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">{selectedSizeForIngredients.size}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 tracking-tighter">
                  {selectedSizeForIngredients.menu_item_name}
                </h2>
                <p className="text-gray-400 font-medium mt-1">Composition précise des ingrédients pour un portionnement spécialisé</p>
              </div>
              <button
                onClick={() => {
                  setIsIngredientsModalOpen(false);
                  setSelectedSizeForIngredients(null);
                  setSizeIngredients([]);
                  setIsIngredientFormOpen(false);
                }}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all group"
              >
                <X size={24} className="text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
              {/* Add Ingredient Button Card */}
              <div className="mb-10 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                    <Cookie size={24} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 tracking-tighter">Ingrédients actifs</h3>
                    <p className="text-xs text-gray-400 font-bold">{sizeIngredients.length} ingrédients listés</p>
                  </div>
                </div>
                <button
                  onClick={openNewIngredientForm}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                  <Plus size={18} />
                  Ajouter au mélange
                </button>
              </div>

              {/* Ingredients List Table */}
              {sizeIngredients.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Cookie size={32} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold tracking-tight">Recette pure ? Aucun ingrédient défini pour l'instant.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sizeIngredients.map((sizeIngredient) => (
                    <div key={sizeIngredient.id} className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 translate-x-8 -translate-y-8 rounded-full"></div>
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg tracking-tighter mb-1">{sizeIngredient.ingredient.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-orange-600">{Number(sizeIngredient.quantity).toFixed(2)}</span>
                            <span className="text-xs font-bold uppercase text-gray-300 tracking-widest">{sizeIngredient.ingredient.unit}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditIngredient(sizeIngredient)}
                            className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteIngredientConfirm(sizeIngredient.id)}
                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-end">
              <button
                onClick={() => setIsIngredientsModalOpen(false)}
                className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-400 uppercase text-xs tracking-widest hover:border-gray-300 transition-all"
              >
                Fermer la recette
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Ingredient Modal */}
      {isIngredientFormOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-[70] p-4 transition-all animate-in zoom-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-orange-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 tracking-tighter flex items-center gap-2">
              <Plus size={20} className="text-orange-500" />
              {editingSizeIngredient ? 'Ajuster le ratio' : 'Ajouter un composant'}
            </h3>

            <form onSubmit={handleIngredientSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sélection</label>
                <div className="relative">
                  <select
                    required
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                    value={ingredientFormData.ingredient_id}
                    onChange={(e) => setIngredientFormData({ ...ingredientFormData, ingredient_id: parseInt(e.target.value) })}
                    disabled={editingSizeIngredient !== null}
                  >
                    <option value={0}>Choisir un ingrédient...</option>
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Volume / Poids</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-orange-600 text-xl"
                  value={ingredientFormData.quantity}
                  onChange={(e) => setIngredientFormData({ ...ingredientFormData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIngredientFormOpen(false)}
                  className="flex-1 py-4 bg-gray-50 rounded-xl text-gray-400 font-bold hover:bg-gray-100 transition-all text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-orange-500 rounded-xl text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all text-xs uppercase tracking-widest"
                  disabled={submittingIngredient}
                >
                  {submittingIngredient ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ingredient Delete Confirmation */}
      {deleteIngredientConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-[80] p-4 transition-all">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-xs w-full p-8 text-center border border-red-50">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Supprimer l'ingrédient ?</h3>
            <p className="text-sm text-gray-400 mb-8 font-medium">Cela modifiera le ratio de la recette pour cette taille.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteIngredientConfirm(null)}
                className="flex-1 py-3 text-gray-400 font-bold hover:bg-gray-50 rounded-xl text-xs transition-all"
              >
                Non
              </button>
              <button
                onClick={() => handleDeleteIngredient(deleteIngredientConfirm)}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl text-xs hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
