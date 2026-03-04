import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2,
  AlertCircle, ChevronDown, PlusCircle,
} from 'lucide-react';
import {
  getMenuItemExtras, createMenuItemExtra, updateMenuItemExtra, deleteMenuItemExtra,
} from '../../shared/api/menu-item-extras';
import { getMenuItems } from '../../shared/api/menu-items';
import type { MenuItemExtra, CreateMenuItemExtraData } from '../../shared/api/menu-item-extras';
import type { MenuItem } from '../../shared/api/menu-items';

export default function MenuItemExtrasManagement() {
  const [extras, setExtras] = useState<MenuItemExtra[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExtra, setEditingExtra] = useState<MenuItemExtra | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<Omit<CreateMenuItemExtraData, 'menu_item_id'> & { menu_item_id: number }>({
    menu_item_id: 0,
    name: '',
    price: 0,
    cost_price: 0,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Get unique categories from menu items
  const categories = [...new Set(menuItems.map((item) => item.category))].sort();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [extrasData, itemsData] = await Promise.all([
        getMenuItemExtras(),
        getMenuItems(),
      ]);
      setExtras(extrasData);
      setMenuItems(itemsData);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredExtras = extras.filter((extra) => {
    const q = searchQuery.toLowerCase();
    return (
      extra.name.toLowerCase().includes(q) ||
      (extra.menu_item_name || '').toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory && !editingExtra) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }
    if (!formData.name.trim()) {
      setError('Le nom du supplément est requis');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      if (editingExtra) {
        // تعديل supplément واحد فقط
        await updateMenuItemExtra(editingExtra.id, {
          name: formData.name,
          price: formData.price,
          cost_price: formData.cost_price,
        });
      } else {
        // إضافة supplément على كل منتجات الفئة المختارة
        const itemsInCategory = menuItems.filter(
          (item) => item.category === selectedCategory
        );

        if (itemsInCategory.length === 0) {
          setError('Aucun article trouvé dans cette catégorie');
          return;
        }

        await Promise.all(
          itemsInCategory.map((item) =>
            createMenuItemExtra({
              menu_item_id: item.id,
              name: formData.name,
              price: formData.price,
              cost_price: formData.cost_price,
            })
          )
        );
      }

      resetForm();
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Échec de l'enregistrement du supplément");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (extra: MenuItemExtra) => {
    setEditingExtra(extra);
    setFormData({
      menu_item_id: extra.menu_item_id,
      name: extra.name,
      price: extra.price,
      cost_price: extra.cost_price || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItemExtra(id);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du supplément');
    }
  };

  const resetForm = () => {
    setFormData({ menu_item_id: 0, name: '', price: 0, cost_price: 0 });
    setSelectedCategory('');
    setEditingExtra(null);
    setIsModalOpen(false);
  };

  // Group extras by menu item for display
  const groupedExtras = filteredExtras.reduce<Record<string, MenuItemExtra[]>>((acc, extra) => {
    const key = extra.menu_item_name || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(extra);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 lg:mb-10">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-orange-100 rounded-2xl">
            <PlusCircle size={32} style={{ color: '#FF8C00' }} />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Suppléments des articles
            </h1>
            <p className="text-gray-500 font-medium tracking-wide mt-1">
              Gérez les suppléments et extras payants pour vos produits du menu
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
            placeholder="Rechercher par supplément ou article..."
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
            <RefreshCw
              size={22}
              className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}
              style={{ color: '#FF8C00' }}
            />
          </button>
          <button
            onClick={() => {
              setEditingExtra(null);
              setSelectedCategory('');
              setFormData({ menu_item_id: 0, name: '', price: 0, cost_price: 0 });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all w-full lg:w-auto whitespace-nowrap overflow-hidden relative group"
            style={{ backgroundColor: '#FF8C00' }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Plus size={22} className="relative z-10" />
            <span className="relative z-10">Ajouter un supplément</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100 p-20 flex flex-col items-center justify-center gap-4 animate-pulse">
          <Loader2 size={48} className="animate-spin text-orange-500" />
          <p className="text-orange-900/40 font-bold uppercase tracking-widest text-xs">Chargement des suppléments</p>
        </div>
      ) : filteredExtras.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-20 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusCircle size={40} className="text-gray-200" />
          </div>
          <p className="text-gray-400 font-bold text-lg">Aucun supplément trouvé</p>
          <p className="text-gray-300 font-medium mt-2">Ajoutez des extras comme "Fromage supplémentaire", "Sauce piquante", etc.</p>
          <button
            onClick={() => {
              setEditingExtra(null);
              setSelectedCategory('');
              setFormData({ menu_item_id: 0, name: '', price: 0, cost_price: 0 });
              setIsModalOpen(true);
            }}
            className="mt-6 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-orange-500/20 transition-all"
            style={{ backgroundColor: '#FF8C00' }}
          >
            Créer le premier supplément
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExtras).map(([itemName, itemExtras]) => (
            <div key={itemName} className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Group Header */}
              <div className="px-8 py-5 bg-gradient-to-r from-orange-50/60 to-transparent border-b border-gray-100 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">{itemName}</h2>
                <span className="ml-auto px-3 py-1 bg-orange-100 rounded-full text-xs font-bold text-orange-600">
                  {itemExtras.length} supplément{itemExtras.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Extras Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Nom du supplément</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Prix de vente</th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Coût de production</th>
                      <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {itemExtras.map((extra) => (
                      <tr key={extra.id} className="hover:bg-orange-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-300 flex-shrink-0" />
                            <span className="text-sm font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                              {extra.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-lg font-bold text-orange-600">
                            +{Number(extra.price).toFixed(0)}{' '}
                            <span className="text-[10px] font-semibold opacity-60">DA</span>
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-bold text-gray-400">
                            {Number(extra.cost_price || 0).toFixed(2)}{' '}
                            <span className="text-[10px]">DA</span>
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-end gap-1 sm:gap-2 translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                              onClick={() => handleEdit(extra)}
                              className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Modifier le supplément"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(extra.id)}
                              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Supprimer le supplément"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-orange-50 overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gradient-to-r from-orange-50/50 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <PlusCircle size={20} className="text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {editingExtra ? 'Modifier le supplément' : 'Nouveau supplément'}
                </h2>
              </div>
              <button onClick={resetForm} className="p-2 hover:bg-white rounded-full transition-all group">
                <X size={20} className="text-gray-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">

              {/* Category selector - only shown when adding new */}
              {!editingExtra && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Sélectionner une catégorie...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none" />
                  </div>

                  {/* Show how many items will be affected */}
                  {selectedCategory && (
                    <p className="text-xs text-orange-500 font-semibold ml-1">
                      ✓ Ce supplément sera ajouté à{' '}
                      <span className="font-bold">
                        {menuItems.filter((i) => i.category === selectedCategory).length}
                      </span>{' '}
                      article(s) de la catégorie "{selectedCategory}"
                    </p>
                  )}
                </div>
              )}

              {/* Extra name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Nom du supplément <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex. Fromage supplémentaire, Sauce piquante..."
                />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Prix de vente (DA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-orange-600 text-lg"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Coût de production (DA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all outline-none font-bold text-gray-500"
                    value={formData.cost_price || 0}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.name && formData.price > 0 && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <p className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">Aperçu</p>
                  <p className="text-sm font-bold text-gray-700">
                    {formData.name}{' '}
                    <span className="text-orange-600">+{formData.price} DA</span>
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
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
            <h2 className="text-2xl font-bold text-gray-800 mb-3 tracking-tighter">Supprimer le supplément ?</h2>
            <p className="text-gray-400 mb-10 leading-relaxed font-medium">
              Cela supprimera définitivement ce supplément. Les commandes existantes ne seront pas affectées.
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
    </div>
  );
}