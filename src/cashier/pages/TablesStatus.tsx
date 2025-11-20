import { useState, useEffect, useCallback } from 'react';
import { Table, CheckCircle, XCircle, RefreshCw, Loader2, Lock, Unlock } from 'lucide-react';
import { getTablesStatus, updateTableOccupancy, type TableStatus } from '../../shared/api/cashier';

export default function TablesStatus() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, occupied: 0, available: 0 });

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
      setError(err.message || 'Failed to load tables');
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
    try {
      // Cashier can freely toggle table availability without validation
      await updateTableOccupancy(tableId, !currentStatus);
      // Refresh the table list
      await fetchTables();
    } catch (error: any) {
      alert(error.message || 'Failed to update table status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Table Status</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tables</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Table className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-700">{stats.available}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm">Occupied</p>
              <p className="text-3xl font-bold text-red-700">{stats.occupied}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table) => {
          // Use is_available as primary source (is_occupied is inverse)
          const isOccupied = !table.is_available;
          return (
            <div
              key={table.id}
              className={`rounded-lg shadow-lg p-6 transition-all ${
                isOccupied
                  ? 'bg-red-50 border-2 border-red-300'
                  : 'bg-green-50 border-2 border-green-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Table {table.number}</h3>
                {isOccupied ? (
                  <XCircle className="w-6 h-6 text-red-500" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Capacity:</span> {table.capacity}
                </p>
                {table.location && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Location:</span> {table.location}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      isOccupied
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}
                  >
                    {isOccupied ? 'Occupied' : 'Available'}
                  </span>
                  <button
                    onClick={() => handleToggleOccupancy(table.id, isOccupied)}
                    className={`p-2 rounded-lg transition-colors ${
                      isOccupied
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title={isOccupied ? 'Mark as Available' : 'Mark as Occupied'}
                  >
                    {isOccupied ? (
                      <Unlock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

