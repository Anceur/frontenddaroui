import React, { useState } from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Clock, User, MapPin, Phone, DollarSign, Package } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Canceled';
  date: string;
  time: string;
  paymentMethod: string;
}

export default function OrdersManagement() {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const allOrders: Order[] = [
    {
      id: '#1234',
      customer: 'John Doe',
      phone: '+1 234 567 8900',
      address: '123 Main St, Downtown',
      items: ['Burger Deluxe', 'French Fries', 'Coke'],
      total: 45.99,
      status: 'Pending',
      date: '2024-10-26',
      time: '14:30',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#1235',
      customer: 'Sarah Johnson',
      phone: '+1 234 567 8901',
      address: '456 Oak Ave, Uptown',
      items: ['Pizza Margherita', 'Garlic Bread', 'Sprite'],
      total: 38.50,
      status: 'Preparing',
      date: '2024-10-26',
      time: '14:25',
      paymentMethod: 'Cash'
    },
    {
      id: '#1236',
      customer: 'Mike Wilson',
      phone: '+1 234 567 8902',
      address: '789 Pine Rd, Midtown',
      items: ['Chicken Wings', 'Onion Rings', 'Pepsi'],
      total: 32.75,
      status: 'Ready',
      date: '2024-10-26',
      time: '14:20',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#1237',
      customer: 'Emma Davis',
      phone: '+1 234 567 8903',
      address: '321 Elm St, Suburbs',
      items: ['Caesar Salad', 'Grilled Chicken', 'Water'],
      total: 28.00,
      status: 'Delivered',
      date: '2024-10-26',
      time: '13:45',
      paymentMethod: 'Debit Card'
    },
    {
      id: '#1238',
      customer: 'David Brown',
      phone: '+1 234 567 8904',
      address: '654 Maple Dr, Downtown',
      items: ['Double Burger', 'Milkshake', 'Cookies'],
      total: 52.20,
      status: 'Preparing',
      date: '2024-10-26',
      time: '14:35',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#1239',
      customer: 'Lisa Anderson',
      phone: '+1 234 567 8905',
      address: '987 Birch Ln, Uptown',
      items: ['Fish Tacos', 'Nachos', 'Lemonade'],
      total: 41.80,
      status: 'Canceled',
      date: '2024-10-26',
      time: '13:30',
      paymentMethod: 'Cash'
    },
    {
      id: '#1240',
      customer: 'Tom Martinez',
      phone: '+1 234 567 8906',
      address: '147 Cedar St, Midtown',
      items: ['Steak Sandwich', 'Sweet Potato Fries', 'Iced Tea'],
      total: 47.50,
      status: 'Ready',
      date: '2024-10-26',
      time: '14:15',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#1241',
      customer: 'Anna White',
      phone: '+1 234 567 8907',
      address: '258 Spruce Ave, Suburbs',
      items: ['Veggie Wrap', 'Fruit Smoothie', 'Granola Bar'],
      total: 24.99,
      status: 'Pending',
      date: '2024-10-26',
      time: '14:40',
      paymentMethod: 'Debit Card'
    }
  ];

  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Canceled'];

  const filteredOrders = allOrders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredOrders.length / 6);
  const startIndex = (currentPage - 1) * 6;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + 6);

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
    if (status === 'All') return allOrders.length;
    return allOrders.filter(order => order.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          📦 Orders Management
        </h1>
        <p style={{ color: '#999999' }}>Manage and track all your orders</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border mb-6 p-2" style={{ borderColor: '#FFD700' }}>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
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
                {getStatusCount(tab)}
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
            onChange={(e) => setSearchQuery(e.target.value)}
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
          className="px-4 py-2 rounded-lg border font-medium flex items-center gap-2 transition-all"
          style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFAF0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <RefreshCw size={18} />
          Refresh
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

      {/* Orders Display */}
      {viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                      ${order.total.toFixed(2)}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Items</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Total</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: '#FF8C00' }}>Actions</th>
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
                      <td className="px-6 py-4">
                        <span className="font-semibold" style={{ color: '#333333' }}>{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium" style={{ color: '#333333' }}>{order.customer}</p>
                          <p className="text-xs" style={{ color: '#999999' }}>{order.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#666666' }}>
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold" style={{ color: '#10B981' }}>
                          ${order.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            border: `1px solid ${statusColor.border}`
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm" style={{ color: '#666666' }}>{order.time}</span>
                      </td>
                      <td className="px-6 py-4">
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
      <div className="bg-white rounded-lg border p-4 flex items-center justify-between" style={{ borderColor: '#FFD700' }}>
        <p className="text-sm" style={{ color: '#999999' }}>
          Showing {startIndex + 1} to {Math.min(startIndex + 6, filteredOrders.length)} of {filteredOrders.length} orders
        </p>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          >
            <ChevronLeft size={18} />
          </button>
          
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className="w-10 h-10 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: currentPage === idx + 1 ? '#FF8C00' : 'transparent',
                color: currentPage === idx + 1 ? '#FFFFFF' : '#333333',
                border: `1px solid ${currentPage === idx + 1 ? '#FF8C00' : '#FFD700'}`
              }}
            >
              {idx + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: '#FFD700', color: '#FF8C00' }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}