import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { getIngredients, createIngredient, updateIngredient, deleteIngredient } from '../../shared/api/ingredients';
import type { Ingredient, CreateIngredientData, UpdateIngredientData } from '../../shared/api/ingredients';

export default function IngredientsManagement() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [formData, setFormData] = useState<CreateIngredientData>({
    name: '',
    unit: 'g',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getIngredients();
      setIngredients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ingredients');
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
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
      setFormData({ name: '', unit: 'g' });
      setEditingIngredient(null);
      setIsModalOpen(false);
      
      // Refresh ingredients list
      await fetchIngredients();
    } catch (err: any) {
      setError(err.message || 'Failed to save ingredient');
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
      setError(err.message || 'Failed to delete ingredient');
      console.error('Error deleting ingredient:', err);
    }
  };

  // Open modal for new ingredient
  const openNewModal = () => {
    setEditingIngredient(null);
    setFormData({ name: '', unit: 'g' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          🥘 Ingredients Management
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage ingredients and units</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
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
            placeholder="Search ingredients..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchIngredients}
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
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Ingredients Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <p className="text-gray-500">No ingredients found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#FFD700' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50" style={{ borderBottom: '1px solid #FFD700' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIngredients.map((ingredient) => (
                  <tr key={ingredient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ingredient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ingredient.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ingredient)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(ingredient.id)}
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
                {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
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
                  Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter ingredient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., g, ml, piece"
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
              Are you sure you want to delete this ingredient? This action cannot be undone.
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

