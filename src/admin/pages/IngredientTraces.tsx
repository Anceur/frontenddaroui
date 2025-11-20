import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Package,
  User,
  TrendingDown,
  Filter,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getIngredientTraces } from '../../shared/api/ingredient-traces';
import type { IngredientTrace, IngredientTraceFilters } from '../../shared/api/ingredient-traces';
import { getIngredients } from '../../shared/api/ingredients';

export default function IngredientTracesManagement() {
  const [traces, setTraces] = useState<IngredientTrace[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTraces, setTotalTraces] = useState<number>(0);
  const pageSize = 20;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIngredient, setSelectedIngredient] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Ingredients list for filter dropdown
  const [ingredients, setIngredients] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingIngredients, setLoadingIngredients] = useState<boolean>(false);

  // Fetch ingredients for filter
  const fetchIngredients = useCallback(async () => {
    try {
      setLoadingIngredients(true);
      const data = await getIngredients();
      setIngredients(data.map(ing => ({ id: ing.id, name: ing.name })));
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  // Fetch traces from API
  const fetchTraces = useCallback(async () => {
    try {
      setError(null);
      
      const filters: IngredientTraceFilters = {
        page: currentPage,
        page_size: pageSize,
      };
      
      if (selectedIngredient) {
        filters.ingredient = selectedIngredient;
      }
      
      if (selectedOrder.trim()) {
        // Remove '#' if present
        const orderId = selectedOrder.replace('#', '').trim();
        if (orderId) {
          const orderNum = parseInt(orderId, 10);
          if (!isNaN(orderNum)) {
            filters.order = orderNum;
          }
        }
      }
      
      const response = await getIngredientTraces(filters);
      
      console.log('Ingredient traces API response:', response);
      
      setTraces(response.traces || []);
      setTotalPages(response.total_pages || 1);
      setTotalTraces(response.total || 0);
      
      if (response.traces && response.traces.length > 0) {
        console.log(`Loaded ${response.traces.length} traces`);
      } else {
        console.log('No traces in response (this is normal if no orders have been marked as Ready yet)');
      }
    } catch (err: any) {
      console.error('Error fetching ingredient traces:', err);
      const errorMessage = err.message || 'Failed to load ingredient traces. Please try again.';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please log in as admin to view ingredient traces.');
      } else if (err.response?.status === 500) {
        setError('Server error: ' + (err.response?.data?.detail || errorMessage));
      } else {
        setError(errorMessage);
      }
      setTraces([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, selectedIngredient, selectedOrder]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchIngredients();
    fetchTraces();
  }, [fetchTraces]);
  
  // Separate effect for ingredients (only fetch once)
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Filter traces by search query (client-side filtering)
  // Note: The API already returns filtered/paginated results, but we do client-side
  // search filtering for better UX
  const filteredTraces = traces.filter((trace) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      trace.ingredient_name?.toLowerCase().includes(query) ||
      trace.ingredient?.name?.toLowerCase().includes(query) ||
      trace.used_by_username?.toLowerCase().includes(query) ||
      trace.order_display?.toLowerCase().includes(query) ||
      `order #${trace.order_id}`.toLowerCase().includes(query) ||
      String(trace.order_id || '').includes(query)
    );
  });

  // Format date/time
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return formatDateTime(dateString);
    } catch {
      return dateString;
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchTraces();
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedIngredient(null);
    setSelectedOrder('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = selectedIngredient !== null || selectedOrder.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          📊 Track Ingredients
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>
          Monitor ingredient usage history and track consumption
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg border p-4 mb-6" style={{ borderColor: '#FFD700' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by ingredient, order, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
              style={{ borderColor: '#FFD700' }}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters || hasActiveFilters
                ? 'text-white'
                : 'border'
            }`}
            style={
              showFilters || hasActiveFilters
                ? { backgroundColor: '#FF8C00' }
                : { borderColor: '#FFD700', color: '#333' }
            }
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                {[selectedIngredient, selectedOrder].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
            style={{ borderColor: '#FFD700' }}
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: '#FFD700' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ingredient Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#333' }}>
                  Filter by Ingredient
                </label>
                <select
                  value={selectedIngredient || ''}
                  onChange={(e) => {
                    setSelectedIngredient(e.target.value ? parseInt(e.target.value, 10) : null);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                  style={{ borderColor: '#FFD700' }}
                  disabled={loadingIngredients}
                >
                  <option value="">All Ingredients</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#333' }}>
                  Filter by Order ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 123 or #123"
                  value={selectedOrder}
                  onChange={(e) => {
                    setSelectedOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200"
                  style={{ borderColor: '#FFD700' }}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#999999' }}>
                Total Traces
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF8C00' }}>
                {totalTraces.toLocaleString()}
              </p>
            </div>
            <Package className="text-orange-300" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#999999' }}>
                Current Page
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF8C00' }}>
                {currentPage} / {totalPages}
              </p>
            </div>
            <TrendingDown className="text-orange-300" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: '#999999' }}>
                Showing
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#FF8C00' }}>
                {filteredTraces.length}
              </p>
            </div>
            <Clock className="text-orange-300" size={32} />
          </div>
        </div>
      </div>

      {/* Traces Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#FFD700' }}>
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="animate-spin mx-auto mb-4" style={{ color: '#FF8C00' }} size={32} />
            <p style={{ color: '#999999' }}>Loading ingredient traces...</p>
          </div>
        ) : filteredTraces.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 opacity-50" style={{ color: '#999999' }} size={48} />
            <p className="text-gray-500">
              {searchQuery || hasActiveFilters
                ? 'No traces found matching your filters.'
                : 'No ingredient traces found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#FFFAF0' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Ingredient
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Quantity Used
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Stock Before
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Stock After
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>
                    Used By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#FFD700' }}>
                {filteredTraces.map((trace) => (
                  <tr
                    key={trace.id}
                    className="hover:bg-orange-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} style={{ color: '#999999' }} />
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#333' }}>
                            {formatRelativeTime(trace.timestamp)}
                          </p>
                          <p className="text-xs" style={{ color: '#999999' }}>
                            {formatDateTime(trace.timestamp)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package size={16} style={{ color: '#FF8C00' }} />
                        <span className="text-sm font-medium" style={{ color: '#333' }}>
                          {trace.ingredient_name || trace.ingredient?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-red-600">
                        -{trace.quantity_used} {trace.ingredient_unit || trace.ingredient?.unit || ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm" style={{ color: '#333' }}>
                        {trace.stock_before !== null
                          ? `${trace.stock_before} ${trace.ingredient_unit || trace.ingredient?.unit || ''}`
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold" style={{ color: '#333' }}>
                        {trace.stock_after !== null
                          ? `${trace.stock_after} ${trace.ingredient_unit || trace.ingredient?.unit || ''}`
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {trace.order_id ? (
                        <span className="text-sm font-medium" style={{ color: '#FF8C00' }}>
                          #{trace.order_id}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {trace.used_by_username ? (
                        <div className="flex items-center gap-2">
                          <User size={16} style={{ color: '#999999' }} />
                          <span className="text-sm" style={{ color: '#333' }}>
                            {trace.used_by_username}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredTraces.length > 0 && (
          <div className="px-4 py-4 border-t flex items-center justify-between" style={{ borderColor: '#FFD700' }}>
            <div className="text-sm" style={{ color: '#999999' }}>
              Showing page {currentPage} of {totalPages} ({totalTraces} total traces)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#FFD700' }}
              >
                <ChevronLeft size={20} style={{ color: '#FF8C00' }} />
              </button>
              <span className="px-4 py-2 text-sm font-medium" style={{ color: '#333' }}>
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                style={{ borderColor: '#FFD700' }}
              >
                <ChevronRight size={20} style={{ color: '#FF8C00' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

