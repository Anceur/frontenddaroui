import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw, Loader2, AlertCircle, CheckCircle, X, MapPin, Users, Clock } from 'lucide-react';
import { getTables, createTable, updateTable, deleteTable, type Table, type CreateTableData } from '../../shared/api/tables';

export default function TablesManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<CreateTableData>({
    number: '',
    capacity: 4,
    is_available: true,
    location: '',
    notes: '',
  });

  // Fetch tables
  const fetchTables = useCallback(async () => {
    try {
      setError(null);
      const data = await getTables();
      setTables(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Échec du chargement des tables';
      setError(errorMessage);
      console.error('Error fetching tables:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
  };

  // Handle create/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingTable) {
        await updateTable(editingTable.id, formData);
      } else {
        await createTable(formData);
      }
      setIsModalOpen(false);
      setEditingTable(null);
      setFormData({ number: '', capacity: 4, is_available: true, location: '', notes: '' });
      await fetchTables();
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement de la table');
      console.error('Error saving table:', err);
    }
  };

  // Handle edit
  const handleEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      capacity: table.capacity,
      is_available: table.is_available,
      location: table.location,
      notes: table.notes,
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (tableId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette table ? Cette action est irréversible.")) {
      return;
    }
    try {
      setError(null);
      await deleteTable(tableId);
      await fetchTables();
    } catch (err: any) {
      setError(err.message || 'Échec de la suppression de la table');
      console.error('Error deleting table:', err);
    }
  };

  // Filter tables
  const filteredTables = tables.filter(table =>
    table.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (table.location && table.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
                Gestion des tables
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
                Gérez les tables du restaurant et leur disponibilité
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border-2"
                style={{ borderColor: '#E5E7EB', color: '#374151' }}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Actualiser
              </button>
              <button
                onClick={() => {
                  setEditingTable(null);
                  setFormData({ number: '', capacity: 4, is_available: true, location: '', notes: '' });
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
                style={{ background: '#FF8C00' }}
              >
                <Plus size={18} />
                Ajouter une table
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro de table ou emplacement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tables Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2" style={{ borderColor: '#E5E7EB' }}>
            <MapPin size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune table trouvée</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Essayez d\'ajuster votre recherche' : 'Commencez par ajouter votre première table'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ background: '#FF8C00' }}
              >
                <Plus size={18} className="inline mr-2" />
                Ajouter une table
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-lg"
                style={{ borderColor: table.is_available ? '#10B981' : '#EF4444' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-1" style={{ color: '#1F2937' }}>
                      Table {table.number}
                    </h3>
                    {table.location && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={14} />
                        {table.location}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      table.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {table.is_available ? 'Disponible' : 'Occupée'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>Capacité : {table.capacity} personnes</span>
                  </div>
                  {table.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2">{table.notes}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(table)}
                    className="flex-1 px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ background: '#FEF3C7', color: '#92400E' }}
                  >
                    <Edit2 size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    className="px-3 py-2 rounded-lg font-semibold transition-all flex items-center justify-center"
                    style={{ background: '#FEE2E2', color: '#991B1B' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                  {editingTable ? 'Modifier la table' : 'Ajouter une nouvelle table'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTable(null);
                    setFormData({ number: '', capacity: 4, is_available: true, location: '', notes: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de table <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
                    placeholder="ex. 1, 2, VIP-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity || 4}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emplacement
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
                    placeholder="ex. Fenêtre, Terrasse, Salle principale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
                    rows={3}
                    placeholder="Informations supplémentaires sur cette table..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available ?? true}
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                    Table disponible
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTable(null);
                      setFormData({ number: '', capacity: 4, is_available: true, location: '', notes: '' });
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all border-2"
                    style={{ borderColor: '#E5E7EB', color: '#374151' }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition-all"
                    style={{ background: '#FF8C00' }}
                  >
                    {editingTable ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
