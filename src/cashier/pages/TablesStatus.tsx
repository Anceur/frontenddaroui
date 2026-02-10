import { useState, useEffect, useCallback } from 'react';
import { Table, CheckCircle, XCircle, RefreshCw, Loader2, Lock, Unlock, Users, MapPin } from 'lucide-react';
import { getTablesStatus, updateTableOccupancy, endTableSession, type TableStatus } from '../../shared/api/cashier';

export default function TablesStatus() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });
  const [updatingTable, setUpdatingTable] = useState<number | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      setError(null);
      const data = await getTablesStatus();
      setTables(data.tables);
      setStats({
        total: data.total,
        occupied: data.occupied,
        available: data.available,
      });
    } catch (err: any) {
      console.error('Error fetching tables:', err);
      setError(err.message || 'Échec du chargement des tables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTables();
  };

  const handleToggleOccupancy = async (tableId: number, currentStatus: boolean) => {
    // If marking as available (freeing the table), also end the session
    if (currentStatus) {
      if (!confirm(`Libérer la table et terminer la session ?`)) {
        return;
      }
    }

    setUpdatingTable(tableId);
    try {
      // If freeing the table (currently occupied), end the session first
      if (currentStatus) {
        await endTableSession(tableId);
      }
      
      await updateTableOccupancy(tableId, !currentStatus);
      await fetchTables();
    } catch (error: any) {
      alert(error.message || 'Échec de la mise à jour du statut de la table');
    } finally {
      setUpdatingTable(null);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement des tables...</p>
        </div>
      </div>
    );
  }

  const occupancyRate = stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">Statut des Tables</h2>
            <p className="text-gray-500 font-medium mt-1">Surveiller et gérer la disponibilité des tables</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 rounded-xl font-bold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm disabled:opacity-50 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-200">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tables */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border-2 border-gray-100 hover:border-gray-200 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
              <Table className="w-6 h-6 text-gray-600" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total des Tables</p>
            <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </div>

        {/* Available */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg shadow-green-200/30 p-6 border-2 border-green-200 hover:border-green-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white/70 rounded-xl group-hover:bg-white transition-colors shadow-sm">
              <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-green-700 text-sm font-semibold uppercase tracking-wider mb-1">Disponibles</p>
            <p className="text-4xl font-bold text-green-700">{stats.available}</p>
          </div>
        </div>

        {/* Occupied */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg shadow-red-200/30 p-6 border-2 border-red-200 hover:border-red-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white/70 rounded-xl group-hover:bg-white transition-colors shadow-sm">
              <XCircle className="w-6 h-6 text-red-600" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-red-700 text-sm font-semibold uppercase tracking-wider mb-1">Occupées</p>
            <p className="text-4xl font-bold text-red-700">{stats.occupied}</p>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-lg shadow-orange-200/30 p-6 border-2 border-orange-200 hover:border-orange-300 transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white/70 rounded-xl group-hover:bg-white transition-colors shadow-sm">
              <Users className="w-6 h-6 text-orange-600" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-orange-700 text-sm font-semibold uppercase tracking-wider mb-1">Taux d'Occupation</p>
            <p className="text-4xl font-bold text-orange-700">{occupancyRate}%</p>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => {
          const isOccupied = !table.is_available;
          const isUpdating = updatingTable === table.id;

          return (
            <div
              key={table.id}
              className={`rounded-2xl shadow-xl p-6 transition-all duration-300 border-2 backdrop-blur-sm ${isOccupied
                  ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-2xl hover:shadow-red-200/50 hover:border-red-300'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-2xl hover:shadow-green-200/50 hover:border-green-300'
                } ${isUpdating ? 'opacity-60' : ''} group`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shadow-sm ${isOccupied ? 'bg-red-200/50' : 'bg-green-200/50'}`}>
                    <Table className={`w-5 h-5 ${isOccupied ? 'text-red-700' : 'text-green-700'}`} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">#{table.number}</h3>
                </div>
                {isOccupied ? (
                  <XCircle className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" strokeWidth={2.5} />
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} className="shrink-0" />
                  <span className="text-sm font-semibold">Capacité : {table.capacity}</span>
                </div>
                {table.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm font-semibold">{table.location}</span>
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="space-y-2 pt-4 border-t-2 border-gray-200/50">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${isOccupied
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                      }`}
                  >
                    {isOccupied ? 'Occupée' : 'Disponible'}
                  </span>
                  <button
                    onClick={() => handleToggleOccupancy(table.id, isOccupied)}
                    disabled={isUpdating}
                    className={`p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 ${isOccupied
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    title={isOccupied ? 'Marquer comme Disponible' : 'Marquer comme Occupée'}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isOccupied ? (
                      <Unlock className="w-5 h-5" strokeWidth={2.5} />
                    ) : (
                      <Lock className="w-5 h-5" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tables.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
          <Table size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Aucune Table Trouvée</h3>
          <p className="text-gray-500">Ajoutez des tables pour commencer à gérer les places de votre restaurant.</p>
        </div>
      )}
    </div>
  );
}