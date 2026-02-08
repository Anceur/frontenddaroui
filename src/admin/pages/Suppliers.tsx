import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, History, DollarSign } from 'lucide-react';
import { getSuppliers, createSupplier, updateSupplier, patchSupplier, deleteSupplier } from '../../shared/api/suppliers';
import type { Supplier, CreateSupplierData, UpdateSupplierData } from '../../shared/api/suppliers';
import { useNavigate } from 'react-router-dom';

export default function SuppliersManagement() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [formData, setFormData] = useState<CreateSupplierData>({
    name: '',
    phone: '',
    supplier_type: '',
    debt: 0,
  });



  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement des fournisseurs');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.phone.includes(searchQuery) ||
    supplier.supplier_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      if (editingSupplier) {
        await patchSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData);
      }

      // Reset form and close modal
      setFormData({ name: '', phone: '', supplier_type: '', debt: 0 });
      setEditingSupplier(null);
      setIsModalOpen(false);

      await fetchSuppliers();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement du fournisseur');
      console.error('Error saving supplier:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone,
      supplier_type: supplier.supplier_type,
      debt: supplier.debt,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteSupplier(id);
      setDeleteConfirm(null);
      await fetchSuppliers();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression du fournisseur');
      console.error('Error deleting supplier:', err);
    }
  };

  // Open modal for new supplier
  const openNewModal = () => {
    setEditingSupplier(null);
    setFormData({ name: '', phone: '', supplier_type: '', debt: 0 });
    setIsModalOpen(true);
  };

  // View supplier history
  const handleViewHistory = (supplierId: number) => {
    navigate(`/supplier-history?supplier=${supplierId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          🏢 Gestion des fournisseurs
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Gérez les fournisseurs et suivez les dettes</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div className="flex-grow">
            <p className="text-red-800 font-medium">Erreur</p>
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
            placeholder="Rechercher des fournisseurs..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSuppliers}
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
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <p className="text-gray-500">Aucun fournisseur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white rounded-lg shadow-sm overflow-hidden border" style={{ borderColor: '#FFD700' }}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{supplier.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{supplier.supplier_type}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Téléphone :</span>
                    <span className="text-gray-900">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign size={16} className="text-gray-500" />
                    <span className="text-gray-500">Dette :</span>
                    <span className={`font-bold ${supplier.debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      DZD {Number(supplier.debt).toFixed(2)}
                    </span>
                  </div>
                </div>

               <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t" style={{ borderColor: '#FFD700' }}>
                <button
                  onClick={() => handleViewHistory(supplier.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50 text-sm"
                  style={{ borderColor: '#FFD700' }}
                >
                  <History size={16} style={{ color: '#FF8C00' }} />
                  <span>Historique</span>
                </button>
                <div className="flex gap-2 sm:flex-1">
                  <button
                    onClick={() => handleEdit(supplier)}
                    className="flex-1 sm:flex-initial text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all text-sm"
                  >
                    <Edit size={16} />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(supplier.id)}
                    className="flex-1 sm:flex-initial text-red-600 hover:text-red-700 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 transition-all text-sm"
                  >
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
                {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSupplier(null);
                  setFormData({ name: '', phone: '', supplier_type: '', debt: 0 });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Saisir le nom du fournisseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Saisir le numéro de téléphone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.supplier_type}
                  onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                  placeholder="Saisir le type de fournisseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dette initiale
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={formData.debt}
                  onChange={(e) => setFormData({ ...formData, debt: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSupplier(null);
                    setFormData({ name: '', phone: '', supplier_type: '', debt: 0 });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Annuler
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
                      Enregistrement...
                    </>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
