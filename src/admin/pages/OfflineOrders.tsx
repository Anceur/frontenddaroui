import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, DollarSign, Package, AlertCircle, Eye } from 'lucide-react';
import { getOfflineOrders, updateOfflineOrderStatus, type OfflineOrder } from '../../shared/api/offline-orders';

export default function OfflineOrdersManagement() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // API state
  const [orders, setOrders] = useState<OfflineOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const pageSize = 10;

  // Fetch offline orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const statusFilter = activeTab !== 'All' ? activeTab : undefined;
      const search = searchQuery.trim() || undefined;

      const data = await getOfflineOrders({
        status: statusFilter,
        search: search,
      });

      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching offline orders:', err);
      const errorMessage = err.message || 'Failed to load offline orders. Please try again.';

      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please log in as admin to view offline orders.');
      } else if (err.response?.status === 500) {
        setError('Server error: ' + (err.response?.data?.detail || errorMessage));
      } else {
        setError(errorMessage);
      }
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery]);

  // Initial fetch and when dependencies change
  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchOrders();
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setError(null);
      await updateOfflineOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Served', 'Paid', 'Canceled'];

  // Mapper pour afficher les libellés des onglets en français (valeurs inchangées)
  const tabLabel = (t: string) => ({
    All: 'Tous',
    Pending: 'En attente',
    Preparing: 'En préparation',
    Ready: 'Prête',
    Served: 'Servie',
    Paid: 'Payée',
    Canceled: 'Annulée',
  } as Record<string, string>)[t] || t;

  // Pagination
  const totalPages = Math.ceil(orders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D' };
      case 'Preparing': return { bg: '#DBEAFE', text: '#3B82F6', border: '#93C5FD' };
      case 'Ready': return { bg: '#D1FAE5', text: '#10B981', border: '#6EE7B7' };
      case 'Served': return { bg: '#E0E7FF', text: '#6366F1', border: '#A5B4FC' };
      case 'Paid': return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
      case 'Canceled': return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
                Commandes hors ligne
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
                Gérez les commandes sur place et importées
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
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((tab) => {
              const count = tab === 'All' ? orders.length : orders.filter(o => o.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeTab === tab
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                >
                  {tabLabel(tab)} ({count})
                </button>
              );
            })}
          </div>

          {/* Search and Badge */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro de table ou ID de commande..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm font-medium h-[46px]">
              <Package size={16} />
              <span>Commandes importées prises en charge</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des commandes hors ligne...</p>
            </div>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2" style={{ borderColor: '#E5E7EB' }}>
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune commande hors ligne trouvée</h3>
            <p className="text-gray-500">
              {searchQuery || activeTab !== 'All' ? 'Essayez de modifier vos filtres' : "Aucune commande n’a encore été passée"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const statusColor = getStatusColor(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-lg"
                  style={{ borderColor: statusColor.border }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold" style={{ color: '#1F2937' }}>
                          Commande n°{order.id}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ background: statusColor.bg, color: statusColor.text }}
                        >
                          {tabLabel(order.status)}
                        </span>
                        {order.is_imported && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded border border-blue-200">
                            Importée
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} />
                          <span className="font-semibold">
                            {order.is_imported ? 'Source externe' : (order.table ? `Table ${order.table.number}` : 'Aucune table')}
                          </span>
                          {!order.is_imported && order.table?.location && (
                            <span className="text-gray-500">({order.table.location})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Package size={16} />
                          <span>{order.items.length} article(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#FF8C00' }}>
                          <DollarSign size={16} />
                          <span>{Number(order.total).toFixed(2)} DA</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Articles :</h4>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                              <span>• {item.quantity}x {item.item.name}</span>
                              {item.size && (
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100">
                                  {item.size.size}
                                </span>
                              )}
                              <span className="text-gray-400">- {Number(item.price).toFixed(2)} DA</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Notes :</span> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status Update Actions */}
                    <div className="flex flex-col gap-2 sm:min-w-[200px]">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all text-sm font-semibold"
                        style={{ color: statusColor.text, background: statusColor.bg }}
                      >
                        <option value="Pending">En attente</option>
                        <option value="Preparing">En préparation</option>
                        <option value="Ready">Prête</option>
                        <option value="Served">Servie</option>
                        <option value="Paid">Payée</option>
                        <option value="Canceled">Annulée</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Affichage de {startIndex + 1} à {Math.min(endIndex, orders.length)} sur {orders.length} commandes
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
