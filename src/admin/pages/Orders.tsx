import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone, DollarSign, Package, AlertCircle } from 'lucide-react';
import { getOrders, getOrderStatusCounts } from '../../shared/api/orders';
import type { Order, OrderStatusCounts } from '../../shared/api/orders';

export default function OrdersManagement() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // API state
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusCounts, setStatusCounts] = useState<OrderStatusCounts>({
    All: 0,
    Pending: 0,
    Preparing: 0,
    Ready: 0,
    Delivered: 0,
    Canceled: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const pageSize = 6;

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      const statusFilter = activeTab !== 'All' ? activeTab : undefined;
      const search = searchQuery.trim() || undefined;
      
      const response = await getOrders({
        status: statusFilter,
        search: search,
        page: currentPage,
        page_size: pageSize,
      });

      setOrders(response.orders || []);
      setTotalPages(response.total_pages || 1);
      setTotalOrders(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.message || 'Failed to load orders. Please try again.';
      
      // Check if it's an authentication error
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication required. Please log in as admin to view orders.');
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
  }, [activeTab, searchQuery, currentPage]);

  // Fetch status counts
  const fetchStatusCounts = useCallback(async () => {
    try {
      const counts = await getOrderStatusCounts();
      setStatusCounts(counts || {
        All: 0,
        Pending: 0,
        Preparing: 0,
        Ready: 0,
        Delivered: 0,
        Canceled: 0,
      });
    } catch (err: any) {
      console.error('Error fetching status counts:', err);
      // Don't set error state for status counts failure, just log it
      // Set default counts
      setStatusCounts({
        All: 0,
        Pending: 0,
        Preparing: 0,
        Ready: 0,
        Delivered: 0,
        Canceled: 0,
      });
    }
  }, []);

  // Initial fetch and when dependencies change
  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  // Fetch status counts on mount and when orders change
  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await Promise.all([fetchOrders(), fetchStatusCounts()]);
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

  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Canceled'];

  // Use orders directly from API (backend handles pagination and filtering)
  // No need for client-side filtering/pagination since backend does it
  const paginatedOrders = orders;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return { bg: '#FEF3C7', text: '#F59E0B', border: '#FCD34D' };
      case 'Preparing': return { bg: '#DBEAFE', text: '#3B82F6', border: '#93C5FD' };
      case 'Ready': return { bg: '#D1FAE5', text: '#10B981', border: '#6EE7B7' };
      case 'Delivered': return { bg: '#E0E7FF', text: '#6366F1', border: '#A5B4FC' };
      case 'Canceled': return { bg: '#FEE2E2', text: '#EF4444', border: '#FCA5A5' };
      default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    }
  };

  const getStatusCount = (status: string) => {
    return statusCounts[status as keyof OrderStatusCounts] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          📦 Orders Management
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage and track all your orders</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error loading orders</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border mb-6 p-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: activeTab === tab ? '#FF8C00' : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : '#333333',
              }}
            >
              {tab}
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.2)' : '#FFFAF0',
                  color: activeTab === tab ? '#FFFFFF' : '#FF8C00'
                }}
              >
                {loading ? '...' : getStatusCount(tab)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border p-4 mb-6 flex flex-wrap items-center gap-4" style={{ borderColor: '#FFD700' }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[250px]">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: '#999999' }}
          />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition-all"
            style={{ borderColor: '#FFD700', color: '#333333' }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-4 pr-10 py-2 rounded-lg border focus:outline-none cursor-pointer appearance-none"
            style={{ borderColor: '#FFD700', color: '#333333' }}
          >
            <option value="date">Sort by: Date</option>
            <option value="total">Sort by: Total</option>
            <option value="customer">Sort by: Customer</option>
          </select>
          <ChevronDown 
            size={18} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ color: '#999999' }}
          />
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          onMouseEnter={(e) => {
            if (!refreshing) {
            e.currentTarget.style.backgroundColor = '#FFFAF0';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>

        {/* View Toggle */}
        <div className="flex gap-2 border rounded-lg p-1" style={{ borderColor: '#FFD700' }}>
          <button
            onClick={() => setViewMode('cards')}
            className="px-3 py-1 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'cards' ? '#FF8C00' : 'transparent',
              color: viewMode === 'cards' ? '#FFFFFF' : '#333333'
            }}
          >
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className="px-3 py-1 rounded text-sm font-medium transition-all"
            style={{
              backgroundColor: viewMode === 'table' ? '#FF8C00' : 'transparent',
              color: viewMode === 'table' ? '#FFFFFF' : '#333333'
            }}
          >
            Table
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !refreshing && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw size={32} className="animate-spin mx-auto mb-4" style={{ color: '#FF8C00' }} />
            <p style={{ color: '#999999' }}>Loading orders...</p>
          </div>
        </div>
      )}

      {/* Orders Display */}
      {!loading && !error && (
        <>
          {paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: '#FFD700' }}>
              <Package size={48} className="mx-auto mb-4" style={{ color: '#999999' }} />
              <p className="text-lg font-medium mb-2" style={{ color: '#333333' }}>No orders found</p>
              <p style={{ color: '#999999' }}>
                {searchQuery ? 'Try adjusting your search criteria' : 'No orders match the current filter'}
              </p>
            </div>
          ) : (
            <>
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {paginatedOrders.map((order) => {
            const statusColor = getStatusColor(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border p-6 hover:shadow-lg transition-all cursor-pointer"
                style={{ borderColor: '#FFD700' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold" style={{ color: '#333333' }}>
                    {order.id}
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      border: `1px solid ${statusColor.border}`
                    }}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={16} style={{ color: '#999999' }} />
                    <span className="text-sm" style={{ color: '#333333' }}>{order.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} style={{ color: '#999999' }} />
                    <span className="text-sm" style={{ color: '#333333' }}>{order.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} style={{ color: '#999999' }} />
                    <span className="text-sm" style={{ color: '#333333' }}>{order.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} style={{ color: '#999999' }} />
                    <span className="text-sm" style={{ color: '#333333' }}>{order.time}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4 pb-4 border-b" style={{ borderColor: '#FFFAF0' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} style={{ color: '#FF8C00' }} />
                    <span className="text-sm font-semibold" style={{ color: '#FF8C00' }}>Items:</span>
                  </div>
                  <ul className="text-sm space-y-1" style={{ color: '#666666' }}>
                    {order.items.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} style={{ color: '#10B981' }} />
                    <span className="text-xl font-bold" style={{ color: '#333333' }}>
                              ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                    </span>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{ backgroundColor: '#FF8C00', color: '#FFFFFF' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFD700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF8C00';
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border overflow-hidden mb-6" style={{ borderColor: '#FFD700' }}>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)' }}>
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold" style={{ color: '#FF8C00' }}>Order ID</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold" style={{ color: '#FF8C00' }}>Customer</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden md:table-cell" style={{ color: '#FF8C00' }}>Items</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold" style={{ color: '#FF8C00' }}>Total</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold" style={{ color: '#FF8C00' }}>Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden lg:table-cell" style={{ color: '#FF8C00' }}>Time</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold" style={{ color: '#FF8C00' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, idx) => {
                  const statusColor = getStatusColor(order.status);
                  return (
                    <tr 
                      key={order.id}
                      className="border-t hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#FFFAF0' }}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-semibold text-xs sm:text-sm" style={{ color: '#333333' }}>{order.id}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div>
                          <p className="font-medium text-xs sm:text-sm" style={{ color: '#333333' }}>{order.customer}</p>
                          <p className="text-xs hidden sm:block" style={{ color: '#999999' }}>{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <span className="text-xs sm:text-sm" style={{ color: '#666666' }}>
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-semibold text-xs sm:text-sm" style={{ color: '#10B981' }}>
                                  ${typeof order.total === 'number' ? order.total.toFixed(2) : order.total}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold inline-block"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                        <span className="text-xs sm:text-sm" style={{ color: '#666666' }}>{order.time}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <button
                          className="px-3 py-1 rounded text-sm font-medium transition-all"
                          style={{ backgroundColor: '#FF8C00', color: '#FFFFFF' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFD700';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FF8C00';
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
              {totalPages > 0 && (
                <div className="bg-white rounded-lg border p-4 flex items-center justify-between flex-wrap gap-4" style={{ borderColor: '#FFD700' }}>
        <p className="text-sm" style={{ color: '#999999' }}>
                    Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders
        </p>
        
        <div className="flex items-center gap-2">
          <button
                      onClick={() => {
                        const newPage = Math.max(1, currentPage - 1);
                        setCurrentPage(newPage);
                      }}
                      disabled={currentPage === 1 || loading}
            className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          >
            <ChevronLeft size={18} />
          </button>
          
                    {/* Show page numbers - limit to 5 visible pages */}
                    {(() => {
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start if we're near the end
                      if (endPage - startPage < maxVisiblePages - 1) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      const pages = [];
                      
                      // First page
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            disabled={loading}
                            className="w-10 h-10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: currentPage === 1 ? '#FF8C00' : 'transparent',
                              color: currentPage === 1 ? '#FFFFFF' : '#333333',
                              border: `1px solid ${currentPage === 1 ? '#FF8C00' : '#FFD700'}`
                            }}
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="px-2" style={{ color: '#999999' }}>
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Page range
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            disabled={loading}
                            className="w-10 h-10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: currentPage === i ? '#FF8C00' : 'transparent',
                              color: currentPage === i ? '#FFFFFF' : '#333333',
                              border: `1px solid ${currentPage === i ? '#FF8C00' : '#FFD700'}`
                            }}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Last page
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="px-2" style={{ color: '#999999' }}>
                              ...
                            </span>
                          );
                        }
                        pages.push(
            <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={loading}
                            className="w-10 h-10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                              backgroundColor: currentPage === totalPages ? '#FF8C00' : 'transparent',
                              color: currentPage === totalPages ? '#FFFFFF' : '#333333',
                              border: `1px solid ${currentPage === totalPages ? '#FF8C00' : '#FFD700'}`
              }}
            >
                            {totalPages}
            </button>
                        );
                      }
                      
                      return pages;
                    })()}
          
          <button
                      onClick={() => {
                        const newPage = Math.min(totalPages, currentPage + 1);
                        setCurrentPage(newPage);
                      }}
                      disabled={currentPage === totalPages || loading}
            className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
