import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Tag, DollarSign, X, Save, Loader2, AlertCircle, Cookie } from 'lucide-react';
import { getMenuItems, createMenuItem, updateMenuItem, patchMenuItem, deleteMenuItem } from '../../shared/api/menu-items';
import type { MenuItem, CreateMenuItemData, UpdateMenuItemData } from '../../shared/api/menu-items';
import { getIngredients } from '../../shared/api/ingredients';
import { getMenuItemIngredients, createMenuItemIngredient, updateMenuItemIngredient, deleteMenuItemIngredient } from '../../shared/api/menu-item-ingredients';
import type { MenuItemIngredient, CreateMenuItemIngredientData } from '../../shared/api/menu-item-ingredients';
import type { Ingredient } from '../../shared/api/ingredients';

export default function MenuProducts() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // API state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateMenuItemData>({
    name: '',
    description: '',
    price: 0,
    category: 'burger',
    image: null,
    featured: false,
  });

  // Ingredients management state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedItemForIngredients, setSelectedItemForIngredients] = useState<MenuItem | null>(null);
  const [itemIngredients, setItemIngredients] = useState<MenuItemIngredient[]>([]);
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState<boolean>(false);
  const [isIngredientFormOpen, setIsIngredientFormOpen] = useState<boolean>(false);
  const [editingItemIngredient, setEditingItemIngredient] = useState<MenuItemIngredient | null>(null);
  const [ingredientFormData, setIngredientFormData] = useState<CreateMenuItemIngredientData>({
    menu_item_id: 0,
    ingredient_id: 0,
    quantity: 0,
  });
  const [submittingIngredient, setSubmittingIngredient] = useState<boolean>(false);
  const [deleteIngredientConfirm, setDeleteIngredientConfirm] = useState<number | null>(null);

  const categories = ['All', 'burger', 'pizza', 'sandwich', 'plat', 'tacos', 'desserts', 'drinks'];
  
  const categoryLabels: Record<string, string> = {
    'All': 'All',
    'burger': 'Burger',
    'pizza': 'Pizza',
    'sandwich': 'Sandwich & Specials',
    'plat': 'Plat',
    'tacos': 'Tacos',
    'desserts': 'Desserts',
    'drinks': 'Drinks',
  };

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch ingredients
  const fetchIngredients = useCallback(async () => {
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (err: any) {
      console.error('Error fetching ingredients:', err);
    }
  }, []);

  // Fetch item ingredients
  const fetchItemIngredients = async () => {
    if (!selectedItemForIngredients) return;
    try {
      const data = await getMenuItemIngredients(selectedItemForIngredients.id);
      setItemIngredients(data);
    } catch (err: any) {
      console.error('Error fetching item ingredients:', err);
    }
  };

  // Handle manage ingredients
  const handleManageIngredients = async (item: MenuItem) => {
    // Check if item has sizes - if it does, ingredients should be managed via MenuItemSizes page
    // For now, we'll allow managing ingredients for all items
    setSelectedItemForIngredients(item);
    setIsIngredientsModalOpen(true);
    await fetchItemIngredients();
  };

  // Handle ingredient form submit
  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForIngredients || ingredientFormData.ingredient_id === 0) {
      setError('Please select an ingredient');
      return;
    }
    try {
      setSubmittingIngredient(true);
      setError(null);

      if (editingItemIngredient) {
        await updateMenuItemIngredient(editingItemIngredient.id, ingredientFormData);
      } else {
        await createMenuItemIngredient({
          ...ingredientFormData,
          menu_item_id: selectedItemForIngredients.id,
        });
      }

      setIngredientFormData({ menu_item_id: 0, ingredient_id: 0, quantity: 0 });
      setEditingItemIngredient(null);
      setIsIngredientFormOpen(false);
      await fetchItemIngredients();
    } catch (err: any) {
      setError(err.message || 'Failed to save ingredient');
      console.error('Error saving ingredient:', err);
    } finally {
      setSubmittingIngredient(false);
    }
  };

  // Handle edit ingredient
  const handleEditIngredient = (itemIngredient: MenuItemIngredient) => {
    setEditingItemIngredient(itemIngredient);
    setIngredientFormData({
      menu_item_id: itemIngredient.menu_item_id || selectedItemForIngredients?.id || 0,
      ingredient_id: itemIngredient.ingredient_id || itemIngredient.ingredient.id,
      quantity: itemIngredient.quantity,
    });
    setIsIngredientFormOpen(true);
  };

  // Handle delete ingredient
  const handleDeleteIngredient = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItemIngredient(id);
      setDeleteIngredientConfirm(null);
      await fetchItemIngredients();
    } catch (err: any) {
      setError(err.message || 'Failed to delete ingredient');
      console.error('Error deleting ingredient:', err);
    }
  };

  // Open new ingredient form
  const openNewIngredientForm = () => {
    setEditingItemIngredient(null);
    setIngredientFormData({
      menu_item_id: selectedItemForIngredients?.id || 0,
      ingredient_id: 0,
      quantity: 0,
    });
    setIsIngredientFormOpen(true);
  };

  useEffect(() => {
    fetchMenuItems();
    fetchIngredients();
  }, [fetchMenuItems, fetchIngredients]);

  // Filter and sort items
  const filteredItems = menuItems
    .filter(item => {
      const matchesTab = activeTab === 'All' || item.category === activeTab;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return Number(a.price) - Number(b.price);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

  const totalPages = Math.ceil(filteredItems.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + 6);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return menuItems.length;
    return menuItems.filter(item => item.category === category).length;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMenuItems();
  };

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingItem) {
        // Update existing item
        await patchMenuItem(editingItem.id, formData);
      } else {
        // Create new item
        await createMenuItem(formData);
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'burger',
        image: null,
        featured: false,
      });
      setImagePreview(null);
      setEditingItem(null);
      setIsModalOpen(false);
      
      // Refresh menu items
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.message || 'Failed to save menu item');
      console.error('Error saving menu item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: Number(item.price),
      category: item.category,
      image: null,
      featured: item.featured || false,
    });
    setImagePreview(item.image || null);
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteMenuItem(id);
      setDeleteConfirm(null);
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.message || 'Failed to delete menu item');
      console.error('Error deleting menu item:', err);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for new item
  const openNewModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'burger',
      image: null,
      featured: false,
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          🍽️ Menu Products
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage your menu items and products</p>
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
            placeholder="Search menu items..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="category">Sort by Category</option>
              <option value="popular">Sort by Popularity</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 border rounded-lg transition-all hover:bg-gray-50"
            style={{ borderColor: '#FFD700' }}
            disabled={refreshing || loading}
          >
            <RefreshCw size={18} className={refreshing || loading ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
            style={{ backgroundColor: '#FF8C00' }}
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === category
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              style={activeTab === category ? { backgroundColor: '#FF8C00' } : {}}
              onClick={() => setActiveTab(category)}
            >
              {categoryLabels[category]} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <p className="text-gray-500">No menu items found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {paginatedItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden border" style={{ borderColor: '#FFD700' }}>
                <div className="h-48 bg-gray-200 relative">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Tag size={48} className="text-gray-400" />
                    </div>
                  )}
                  {item.featured && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <span className="font-bold" style={{ color: '#FF8C00' }}>${Number(item.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <Tag size={16} className="text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">{categoryLabels[item.category] || item.category}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description || 'No description'}</p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleManageIngredients(item)}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                      title="Manage Ingredients"
                    >
                      <Cookie size={16} />
                      Ingredients
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                className="p-2 rounded-lg border transition-all disabled:opacity-50"
                style={{ borderColor: '#FFD700' }}
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={18} style={{ color: '#FF8C00' }} />
              </button>
              <span className="text-sm" style={{ color: '#999999' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="p-2 rounded-lg border transition-all disabled:opacity-50"
                style={{ borderColor: '#FFD700' }}
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={18} style={{ color: '#FF8C00' }} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                  setImagePreview(null);
                  setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    category: 'burger',
                    image: null,
                    featured: false,
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter menu item name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter menu item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="burger">Burger</option>
                    <option value="pizza">Pizza</option>
                    <option value="sandwich">Sandwich & Specials</option>
                    <option value="plat">Plat</option>
                    <option value="tacos">Tacos</option>
                    <option value="desserts">Desserts</option>
                    <option value="drinks">Drinks</option>
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" style={{ borderColor: '#FFD700' }} />
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Featured / Popular</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                    setImagePreview(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                      category: 'burger',
                      image: null,
                      featured: false,
                    });
                  }}
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
              Are you sure you want to delete this menu item? This action cannot be undone.
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
      {isIngredientsModalOpen && selectedItemForIngredients && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                  Ingredients for {selectedItemForIngredients.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Manage ingredients and quantities for this menu item</p>
              </div>
              <button
                onClick={() => {
                  setIsIngredientsModalOpen(false);
                  setSelectedItemForIngredients(null);
                  setItemIngredients([]);
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
            {itemIngredients.length === 0 ? (
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
                    {itemIngredients.map((itemIngredient) => (
                      <tr key={itemIngredient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {itemIngredient.ingredient.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Number(itemIngredient.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {itemIngredient.ingredient.unit}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditIngredient(itemIngredient)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteIngredientConfirm(itemIngredient.id)}
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
                      {editingItemIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
                    </h3>
                    <button
                      onClick={() => {
                        setIsIngredientFormOpen(false);
                        setEditingItemIngredient(null);
                        setIngredientFormData({ menu_item_id: 0, ingredient_id: 0, quantity: 0 });
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
                        disabled={editingItemIngredient !== null}
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
                          setEditingItemIngredient(null);
                          setIngredientFormData({ menu_item_id: 0, ingredient_id: 0, quantity: 0 });
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
