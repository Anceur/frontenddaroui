import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Plus, Trash2, X, Save, Loader2, AlertCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { getSupplierHistory, createSupplierHistory, deleteSupplierHistory } from '../../shared/api/supplier-history';
import type { SupplierHistory, CreateSupplierHistoryData, CreateSupplierTransactionItemData } from '../../shared/api/supplier-history';
import { getSuppliers } from '../../shared/api/suppliers';
import type { Supplier } from '../../shared/api/suppliers';
import { getIngredients } from '../../shared/api/ingredients';
import type { Ingredient } from '../../shared/api/ingredients';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SupplierHistoryManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierIdParam = searchParams.get('supplier');

  const [history, setHistory] = useState<SupplierHistory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(
    supplierIdParam ? parseInt(supplierIdParam) : null
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [detailsModalData, setDetailsModalData] = useState<SupplierHistory | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [items, setItems] = useState<CreateSupplierTransactionItemData[]>([]);

  // Fetch ingredients
  const fetchIngredients = useCallback(async () => {
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const [formData, setFormData] = useState<CreateSupplierHistoryData>({
    supplier: selectedSupplier || 0,
    transaction_type: 'purchase',
    amount: 0,
    description: '',
  });

  const transactionTypes = [
    { value: 'purchase', label: 'Achat', description: 'Augmente la dette' },
    { value: 'payment', label: 'Paiement', description: 'Réduit la dette' },
  ];

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
    }
  }, []);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSupplierHistory(selectedSupplier || undefined);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Échec du chargement de l’historique des fournisseurs');
      console.error('Error fetching supplier history:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Filter history
  const filteredHistory = history.filter((entry) =>
    entry.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.transaction_type_display?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.supplier === 0) {
      setError('Veuillez sélectionner un fournisseur');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);

      await createSupplierHistory({
        ...formData,
        items_data: items.length > 0 ? items : undefined
      });

      // Reset form and close modal
      setFormData({
        supplier: selectedSupplier || 0,
        transaction_type: 'purchase',
        amount: 0,
        description: '',
      });
      setItems([]);
      setIsModalOpen(false);

      await fetchHistory();
      // Refresh suppliers to update debt
      await fetchSuppliers();
    } catch (err: any) {
      setError(err.message || 'Échec de la création de la transaction');
      console.error('Error creating transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      await deleteSupplierHistory(id);
      setDeleteConfirm(null);
      await fetchHistory();
      // Refresh suppliers to update debt
      await fetchSuppliers();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression de la transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  // Open modal for new transaction
  const openNewModal = () => {
    setFormData({
      supplier: selectedSupplier || 0,
      transaction_type: 'purchase',
      amount: 0,
      description: '',
    });
    setItems([]);
    setIsModalOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get transaction color
  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'purchase') {
      return 'text-red-600';
    }
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate('/suppliers')}
            className="p-2 rounded-lg border hover:bg-gray-50"
            style={{ borderColor: '#FFD700' }}
          >
            <ArrowLeft size={20} style={{ color: '#FF8C00' }} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: '#FF8C00' }}>
            📜 Historique des fournisseurs
          </h1>
        </div>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Suivez les transactions et paiements des fournisseurs</p>
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
            placeholder="Rechercher des transactions..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg"
            value={selectedSupplier || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              setSelectedSupplier(value);
              navigate(value ? `/supplier-history?supplier=${value}` : '/supplier-history');
            }}
          >
            <option value="">Tous les fournisseurs</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <button
            onClick={fetchHistory}
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
            Ajouter une transaction
          </button>
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-8 flex items-center justify-center" style={{ borderColor: '#FFD700' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: '#FFD700' }}>
          <p className="text-gray-500">Aucune transaction trouvée</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#FFD700' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50" style={{ borderBottom: '1px solid #FFD700' }}>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Créé par</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.supplier_name || 'N/D'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.transaction_type === 'purchase' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                        {entry.transaction_type_display || entry.transaction_type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getTransactionColor(entry.transaction_type, entry.amount)}`}>
                      {entry.transaction_type === 'payment' ? '-' : '+'}
                      DZD {Math.abs(Number(entry.amount)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.created_by_username || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setDetailsModalData(entry);
                          }}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(entry.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Supprimer
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

      {/* Transaction Details Modal */}
      {detailsModalData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Détails de la transaction
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">#{detailsModalData.id} - {formatDate(detailsModalData.created_at)}</p>
              </div>
              <button
                onClick={() => setDetailsModalData(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fournisseur</h4>
                  <p className="text-gray-900 font-medium">{detailsModalData.supplier_name}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${detailsModalData.transaction_type === 'purchase' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {detailsModalData.transaction_type_display || detailsModalData.transaction_type}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Montant</h4>
                  <p className={`font-bold text-lg ${getTransactionColor(detailsModalData.transaction_type, detailsModalData.amount)}`}>
                    {detailsModalData.transaction_type === 'payment' ? '-' : '+'}
                    DZD {Math.abs(Number(detailsModalData.amount)).toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Enregistré par</h4>
                  <p className="text-gray-900">{detailsModalData.created_by_username || 'System'}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {detailsModalData.description || 'Aucune description.'}
                  </p>
                </div>
              </div>

              {/* Items Section (Only for purchases) */}
              {detailsModalData.transaction_type === 'purchase' && detailsModalData.items && detailsModalData.items.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-1 bg-orange-100 rounded text-orange-600">
                      <DollarSign size={16} />
                    </div>
                    Articles achetés
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                          <th className="px-4 py-3 text-left">Ingrédient</th>
                          <th className="px-4 py-3 text-right">Quantité</th>
                          <th className="px-4 py-3 text-right">Prix/Unité</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {detailsModalData.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-900 font-medium">{item.ingredient_name}</td>
                            <td className="px-4 py-3 text-right text-gray-600">
                              {item.quantity} <span className="text-xs text-gray-400">{item.ingredient_unit}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">DZD {Number(item.price_per_unit).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">DZD {Number(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold text-gray-900 border-t border-gray-200">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-right">Montant total de l'achat :</td>
                          <td className="px-4 py-3 text-right text-orange-600">DZD {Math.abs(Number(detailsModalData.amount)).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setDetailsModalData(null)}
                className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ajouter une transaction
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Créer une nouvelle transaction fournisseur</p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    supplier: selectedSupplier || 0,
                    transaction_type: 'purchase',
                    amount: 0,
                    description: '',
                  });
                  setItems([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Fournisseur <span className="text-orange-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm"
                      value={formData.supplier}
                      onChange={(e) => setFormData({ ...formData, supplier: parseInt(e.target.value) })}
                    >
                      <option value={0}>Sélectionnez un fournisseur</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name} (Dette : DZD {Number(supplier.debt).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Type de transaction <span className="text-orange-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm"
                      value={formData.transaction_type}
                      onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value as any })}
                    >
                      {transactionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 px-1">
                      {formData.transaction_type === 'purchase' ? '➕ Augmente la dette (achat de stock)' : '➖ Réduit la dette (paiement du fournisseur)'}
                    </p>
                  </div>
                </div>

                {formData.transaction_type === 'purchase' && (
                  <div className="border border-orange-100 rounded-2xl p-5 bg-orange-50/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                          <Plus size={16} />
                        </div>
                        <h3 className="font-semibold text-gray-900">Articles de l'achat</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItems([...items, { quantity: 1, price_per_unit: 0 }])}
                        className="text-sm px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-50 font-medium shadow-sm transition-all"
                      >
                        + Ajouter un article
                      </button>
                    </div>

                    {items.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-orange-200/50 rounded-xl bg-white/50">
                        <p className="text-sm text-gray-500">Aucun article ajouté pour le moment.</p>
                        <p className="text-xs text-gray-400 mt-1">Ajoutez des articles pour calculer le total automatiquement, ou saisissez un montant manuel ci-dessous.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, index) => (
                          <div key={index} className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                            <div className="flex gap-3 items-start">
                              <div className="flex-grow space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ingrédient</label>
                                <select
                                  className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                  value={item.ingredient_id || (item.name ? 'new' : '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'new') {
                                      const newItems = [...items];
                                      newItems[index] = { ...item, ingredient_id: undefined, name: '', unit: 'kg' };
                                      setItems(newItems);
                                    } else {
                                      const ing = ingredients.find(i => i.id === parseInt(val));
                                      const newItems = [...items];
                                      newItems[index] = {
                                        ...item,
                                        ingredient_id: parseInt(val),
                                        name: undefined,
                                        price_per_unit: item.price_per_unit || ing?.price || 0
                                      };
                                      const total = newItems.reduce((sum, i) => sum + (i.quantity * i.price_per_unit), 0);
                                      setFormData(prev => ({ ...prev, amount: total }));
                                      setItems(newItems);
                                    }
                                  }}
                                >
                                  <option value="">Sélectionner un ingrédient...</option>
                                  <option value="new">+ Créer un nouvel ingrédient</option>
                                  {ingredients.map(ing => (
                                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = items.filter((_, i) => i !== index);
                                  const total = newItems.reduce((sum, i) => sum + (i.quantity * i.price_per_unit), 0);
                                  setFormData(prev => ({ ...prev, amount: total }));
                                  setItems(newItems);
                                }}
                                className="mt-6 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Supprimer l'article"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            {item.name !== undefined && !item.ingredient_id && (
                              <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1.5">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Nouveau nom</label>
                                  <input
                                    type="text"
                                    placeholder="Saisir le nom"
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                    value={item.name}
                                    onChange={(e) => {
                                      const newItems = [...items];
                                      newItems[index] = { ...item, name: e.target.value };
                                      setItems(newItems);
                                    }}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</label>
                                  <select
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                    value={item.unit}
                                    onChange={(e) => {
                                      const newItems = [...items];
                                      newItems[index] = { ...item, unit: e.target.value };
                                      setItems(newItems);
                                    }}
                                  >
                                    <option value="kg">kg</option>
                                    <option value="l">l</option>
                                    <option value="piece">pc</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-3 pt-1">
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</label>
                                <input
                                  type="number"
                                  min="0" step="0.01"
                                  className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const newItems = [...items];
                                    newItems[index] = { ...item, quantity: val };
                                    const total = newItems.reduce((sum, i) => sum + (i.quantity * i.price_per_unit), 0);
                                    setFormData(prev => ({ ...prev, amount: total }));
                                    setItems(newItems);
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prix/Unité</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0" step="0.01"
                                    className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                                    value={item.price_per_unit}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      const newItems = [...items];
                                      newItems[index] = { ...item, price_per_unit: val };
                                      const total = newItems.reduce((sum, i) => sum + (i.quantity * i.price_per_unit), 0);
                                      setFormData(prev => ({ ...prev, amount: total }));
                                      setItems(newItems);
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1.5 text-right">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</label>
                                <div className="text-sm font-bold text-gray-900 py-2">
                                  DZD {(item.quantity * item.price_per_unit).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Montant total <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm font-bold">DZD</span>
                    </div>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      className={`w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-lg font-bold ${items.length > 0 ? 'bg-gray-100 text-gray-500' : 'text-gray-900'}`}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      readOnly={items.length > 0}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-sm resize-none"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ajouter des notes à propos de cette transaction..."
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    supplier: selectedSupplier || 0,
                    transaction_type: 'purchase',
                    amount: 0,
                    description: '',
                  });
                  setItems([]);
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 outline-none"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-md shadow-orange-200 focus:ring-2 focus:ring-orange-500/40 outline-none flex justify-center items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Enregistrer la transaction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer cette transaction ? Cela annulera la modification de la dette.
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
