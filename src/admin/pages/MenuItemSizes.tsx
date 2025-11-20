import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, Cookie } from 'lucide-react';
import { getMenuItemSizes, createMenuItemSize, updateMenuItemSize, deleteMenuItemSize } from '../../shared/api/menu-item-sizes';
import { getMenuItems } from '../../shared/api/menu-items';
import { getIngredients } from '../../shared/api/ingredients';
import { getMenuItemSizeIngredients, createMenuItemSizeIngredient, updateMenuItemSizeIngredient, deleteMenuItemSizeIngredient } from '../../shared/api/menu-item-size-ingredients';
import type { MenuItemSize, CreateMenuItemSizeData, UpdateMenuItemSizeData } from '../../shared/api/menu-item-sizes';
import type { MenuItem } from '../../shared/api/menu-items';
import type { Ingredient } from '../../shared/api/ingredients';
import type { MenuItemSizeIngredient, CreateMenuItemSizeIngredientData, UpdateMenuItemSizeIngredientData } from '../../shared/api/menu-item-size-ingredients';

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
      setError(err.message || 'Failed to fetch data');
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
      setError('Please select a menu item');
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

      setFormData({ menu_item_id: 0, size: 'M', price: 0 });
      setEditingSize(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save size');
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
      setError(err.message || 'Failed to delete size');
      console.error('Error deleting size:', err);
    }
  };

  // Open modal for new size
  const openNewModal = () => {
    setEditingSize(null);
    setFormData({ menu_item_id: 0, size: 'M', price: 0 });
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
      setError(err.message || 'Failed to fetch ingredients');
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
      setError(err.message || 'Failed to fetch ingredients');
      console.error('Error fetching size ingredients:', err);
    }
  };

  // Handle ingredient form submit
  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSizeForIngredients || ingredientFormData.ingredient_id === 0) {
      setError('Please select an ingredient');
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
      setError(err.message || 'Failed to save ingredient');
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
      setError(err.message || 'Failed to delete ingredient');
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
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          📏 Menu Item Sizes
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage sizes and pricing for menu items</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-lg border p-4 mb-6 flex flex-col sm:flex-row gap-4" style={{ borderColor: '#FFD700' }}>
        <div className="relative flex-grow">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by menu item or size..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 border rounded-lg transition-all hover:bg-gray-50"
            style={{ borderColor: '#FFD700' }}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
            style={{ backgroundColor: '#FF8C00' }}
          >
            <Plus size={18} />
            Add Size
          </button>
        </div>
      </div>

      {/* Sizes Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredSizes.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <p className="text-gray-500">No sizes found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#FFD700' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50" style={{ borderBottom: '1px solid #FFD700' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSizes.map((size) => (
                  <tr key={size.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{size.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{size.menu_item_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{size.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Number(size.price).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleManageIngredients(size)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Manage Ingredients"
                        >
                          <Cookie size={16} />
                          Ingredients
                        </button>
                        <button
                          onClick={() => handleEdit(size)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(size.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Delete
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                {editingSize ? 'Edit Size' : 'Add New Size'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Item *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.menu_item_id}
                  onChange={(e) => setFormData({ ...formData, menu_item_id: parseInt(e.target.value) })}
                >
                  <option value={0}>Select a menu item</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as 'M' | 'L' | 'Mega' })}
                >
                  <option value="M">Medium</option>
                  <option value="L">Large</option>
                  <option value="Mega">Mega</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#FF8C00' }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this size? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingredients Management Modal */}
      {isIngredientsModalOpen && selectedSizeForIngredients && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                  Ingredients for {selectedSizeForIngredients.menu_item_name} - {selectedSizeForIngredients.size}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage ingredients and quantities for this menu item size</p>
              </div>
              <button
                onClick={() => {
                  setIsIngredientsModalOpen(false);
                  setSelectedSizeForIngredients(null);
                  setSizeIngredients([]);
                  setIsIngredientFormOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Add Ingredient Button */}
            <div className="mb-4">
              <button
                onClick={openNewIngredientForm}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
                style={{ backgroundColor: '#FF8C00' }}
              >
                <Plus size={18} />
                Add Ingredient
              </button>
            </div>

            {/* Ingredients List */}
            {sizeIngredients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Cookie size={48} className="mx-auto mb-2 opacity-50" />
                <p>No ingredients added yet. Click "Add Ingredient" to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50" style={{ borderBottom: '1px solid #FFD700' }}>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sizeIngredients.map((sizeIngredient) => (
                      <tr key={sizeIngredient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {sizeIngredient.ingredient.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Number(sizeIngredient.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sizeIngredient.ingredient.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditIngredient(sizeIngredient)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteIngredientConfirm(sizeIngredient.id)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add/Edit Ingredient Form Modal */}
            {isIngredientFormOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#FF8C00' }}>
                      {editingSizeIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsIngredientFormOpen(false);
                        setEditingSizeIngredient(null);
                        setIngredientFormData({ size_id: 0, ingredient_id: 0, quantity: 0 });
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleIngredientSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredient *
                      </label>
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={ingredientFormData.ingredient_id}
                        onChange={(e) => setIngredientFormData({ ...ingredientFormData, ingredient_id: parseInt(e.target.value) })}
                        disabled={editingSizeIngredient !== null}
                      >
                        <option value={0}>Select an ingredient</option>
                        {ingredients.map((ingredient) => (
                          <option key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={ingredientFormData.quantity}
                        onChange={(e) => setIngredientFormData({ ...ingredientFormData, quantity: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsIngredientFormOpen(false);
                          setEditingSizeIngredient(null);
                          setIngredientFormData({ size_id: 0, ingredient_id: 0, quantity: 0 });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={submittingIngredient}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#FF8C00' }}
                        disabled={submittingIngredient}
                      >
                        {submittingIngredient ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Delete Ingredient Confirmation */}
            {deleteIngredientConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4" style={{ color: '#FF8C00' }}>Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to remove this ingredient? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteIngredientConfirm(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteIngredient(deleteIngredientConfirm)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

