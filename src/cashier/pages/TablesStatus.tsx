import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Lock,
  Unlock,
  Users,
  MapPin
} from 'lucide-react';
import {
  getTablesStatus,
  updateTableOccupancy,
  endTableSession,
  type TableStatus
} from '../../shared/api/cashier';

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
      console.error('Erreur lors du chargement des tables :', err);
      setError(err.message || 'Impossible de charger les tables');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTables();
  };

  const handleToggleOccupancy = async (tableId: number, currentStatus: boolean) => {
    if (currentStatus) {
      if (!confirm('Libérer la table et terminer la session ?')) return;
    }

    setUpdatingTable(tableId);
    try {
      if (currentStatus) {
        await endTableSession(tableId);
      }
      await updateTableOccupancy(tableId, !currentStatus);
      await fetchTables();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la mise à jour du statut');
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

  const occupancyRate =
    stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">
              Statut des tables
            </h2>
            <p className="text-gray-500 font-medium mt-1">
              Surveillez et gérez la disponibilité des tables
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 rounded-xl font-bold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm disabled:opacity-50 group"
          >
            <RefreshCw
              className={`w-5 h-5 ${
                refreshing
                  ? 'animate-spin'
                  : 'group-hover:rotate-180 transition-transform duration-500'
              }`}
            />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
          <p className="text-gray-500 text-sm font-semibold uppercase mb-1">
            Total des tables
          </p>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <p className="text-green-700 text-sm font-semibold uppercase mb-1">
            Disponibles
          </p>
          <p className="text-4xl font-bold text-green-700">{stats.available}</p>
        </div>

        <div className="bg-red-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
          <p className="text-red-700 text-sm font-semibold uppercase mb-1">
            Occupées
          </p>
          <p className="text-4xl font-bold text-red-700">{stats.occupied}</p>
        </div>

        <div className="bg-orange-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
          <p className="text-orange-700 text-sm font-semibold uppercase mb-1">
            Taux d’occupation
          </p>
          <p className="text-4xl font-bold text-orange-700">{occupancyRate}%</p>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => {
          const isOccupied = !table.is_available;
          const isUpdating = updatingTable === table.id;

          return (
            <div
              key={table.id}
              className={`rounded-2xl shadow-xl p-6 border-2 ${
                isOccupied
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              } ${isUpdating ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">Table #{table.number}</h3>
                {isOccupied ? (
                  <XCircle className="text-red-500" />
                ) : (
                  <CheckCircle className="text-green-500" />
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                  <Users size={16} /> Capacité : {table.capacity}
                </div>
                {table.location && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <MapPin size={16} /> {table.location}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isOccupied
                      ? 'bg-red-200 text-red-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {isOccupied ? 'Occupée' : 'Disponible'}
                </span>

                <button
                  onClick={() => handleToggleOccupancy(table.id, isOccupied)}
                  disabled={isUpdating}
                  title={
                    isOccupied
                      ? 'Marquer comme disponible'
                      : 'Marquer comme occupée'
                  }
                  className={`p-2 rounded-xl text-white ${
                    isOccupied ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" />
                  ) : isOccupied ? (
                    <Unlock />
                  ) : (
                    <Lock />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200 mt-8">
          <Table size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Aucune table trouvée
          </h3>
          <p className="text-gray-500">
            Ajoutez des tables pour commencer la gestion.
          </p>
        </div>
      )}
    </div>
  );
}
