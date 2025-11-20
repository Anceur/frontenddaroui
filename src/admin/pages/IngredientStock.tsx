import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, Package } from 'lucide-react';
import { getIngredientStocks, createIngredientStock, updateIngredientStock, deleteIngredientStock } from '../../shared/api/ingredient-stock';
import type { IngredientStock, CreateIngredientStockData, UpdateIngredientStockData } from '../../shared/api/ingredient-stock';
import { getIngredients } from '../../shared/api/ingredients';
import type { Ingredient } from '../../shared/api/ingredients';

export default function IngredientStockManagement() {
  const [stocks, setStocks] = useState<IngredientStock[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingStock, setEditingStock] = useState<IngredientStock | null>(null);
  const [formData, setFormData] = useState<CreateIngredientStockData>({
    ingredient_id: 0,
    quantity: 0,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
      setError(err.message || 'Failed to fetch data');
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ingredient_id === 0) {
      setError('Please select an ingredient');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      if (editingStock) {
        await updateIngredientStock(editingStock.id, formData);
      } else {
        await createIngredientStock(formData);
      }

      setFormData({ ingredient_id: 0, quantity: 0 });
      setEditingStock(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to save ingredient stock');
      console.error('Error saving ingredient stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (stock: IngredientStock) => {
    setEditingStock(stock);
    setFormData({
      ingredient_id: stock.ingredient_id || stock.ingredient.id,
      quantity: stock.quantity,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteIngredientStock(id);
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete ingredient stock');
      console.error('Error deleting ingredient stock:', err);
    }
  };

  // Open modal for new stock
  const openNewModal = () => {
    setEditingStock(null);
    setFormData({ ingredient_id: 0, quantity: 0 });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          📦 Ingredient Stock
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage ingredient stock levels and quantities</p>
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
            placeholder="Search by ingredient name..."
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
            Add Stock
          </button>
        </div>
      </div>

      {/* Stocks Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <Package size={48} className="mx-auto mb-2 opacity-50" style={{ color: '#FF8C00' }} />
          <p className="text-gray-500">No ingredient stocks found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#FFD700' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50" style={{ borderBottom: '1px solid #FFD700' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stock.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stock.ingredient_name || stock.ingredient?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Number(stock.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.ingredient_unit || stock.ingredient?.unit || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stock.last_updated ? new Date(stock.last_updated).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(stock)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(stock.id)}
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
                {editingStock ? 'Edit Ingredient Stock' : 'Add New Ingredient Stock'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingStock(null);
                  setFormData({ ingredient_id: 0, quantity: 0 });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.ingredient_id}
                  onChange={(e) => setFormData({ ...formData, ingredient_id: parseInt(e.target.value) })}
                  disabled={editingStock !== null}
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStock(null);
                    setFormData({ ingredient_id: 0, quantity: 0 });
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
              Are you sure you want to delete this ingredient stock record? This action cannot be undone.
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
    </div>
  );
}

