import React, { useState } from 'react';
import { Menu, X, User, Bell, LogOut, Home, Table2, ClipboardList, DollarSign, Settings, Clock, TrendingUp, Users, CheckCircle, AlertCircle, Utensils } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  isPositive?: boolean;
}

interface TableStatus {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  guests?: number;
  time?: string;
}

interface RecentOrder {
  id: string;
  table: string;
  items: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  time: string;
}

const WaiterPanel: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [notifications, setNotifications] = useState<number>(3);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tables', label: 'Tables', icon: Table2 },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const stats: StatCard[] = [
    { title: 'Active Tables', value: 5, icon: Table2, change: '+2', isPositive: true },
    { title: 'Orders Today', value: 23, icon: ClipboardList, change: '+12%', isPositive: true },
    { title: 'Total Sales', value: '$1,245', icon: DollarSign, change: '+8%', isPositive: true },
    { title: 'Avg Service Time', value: '12 min', icon: Clock, change: '-3 min', isPositive: true }
  ];

  const tables: TableStatus[] = [
    { id: '1', number: 'T-101', status: 'occupied', guests: 4, time: '25 min' },
    { id: '2', number: 'T-102', status: 'occupied', guests: 2, time: '15 min' },
    { id: '3', number: 'T-103', status: 'available' },
    { id: '4', number: 'T-104', status: 'reserved', time: '6:30 PM' },
    { id: '5', number: 'T-105', status: 'occupied', guests: 6, time: '40 min' },
    { id: '6', number: 'T-106', status: 'available' }
  ];

  const recentOrders: RecentOrder[] = [
    { id: '1', table: 'T-101', items: 'Burger, Fries, Cola', status: 'preparing', time: '5 min ago' },
    { id: '2', table: 'T-102', items: 'Pasta, Wine', status: 'ready', time: '2 min ago' },
    { id: '3', table: 'T-105', items: 'Steak, Salad', status: 'preparing', time: '10 min ago' },
    { id: '4', table: 'T-101', items: 'Dessert x2', status: 'pending', time: '1 min ago' }
  ];

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return '#2ECC71';
      case 'occupied': return '#FF8C00';
      case 'reserved': return '#FFD700';
      case 'pending': return '#999999';
      case 'preparing': return '#FF8C00';
      case 'ready': return '#2ECC71';
      case 'served': return '#999999';
      default: return '#999999';
    }
  };

  const getStatusBg = (status: string): string => {
    switch (status) {
      case 'available': return '#E8F8F5';
      case 'occupied': return '#FFF5E6';
      case 'reserved': return '#FFFDF0';
      case 'pending': return '#F5F5F5';
      case 'preparing': return '#FFF5E6';
      case 'ready': return '#E8F8F5';
      case 'served': return '#F5F5F5';
      default: return '#F5F5F5';
    }
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Navbar */}
     

      {/* Home Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="mb-6 p-6 rounded-lg" style={{ background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)', border: '2px solid #FFD700' }}>
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
            Welcome Back, John! 👋
          </h1>
          <p style={{ color: '#999999' }}>
            Here's your overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-2 transition-transform hover:scale-105" style={{ borderColor: '#FFD700' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                    <Icon size={24} style={{ color: '#FF8C00' }} />
                  </div>
                  {stat.change && (
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: stat.isPositive ? '#E8F8F5' : '#FFF5F5',
                        color: stat.isPositive ? '#2ECC71' : '#E74C3C'
                      }}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>{stat.value}</h3>
                <p className="text-sm" style={{ color: '#999999' }}>{stat.title}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tables Overview */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border-2" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>My Tables</h2>
              <button className="text-sm font-medium px-4 py-2 rounded-lg" style={{ backgroundColor: '#FFFAF0', color: '#FF8C00' }}>
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div 
                  key={table.id} 
                  className="p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
                  style={{ 
                    backgroundColor: getStatusBg(table.status),
                    borderColor: getStatusColor(table.status)
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg" style={{ color: '#333333' }}>{table.number}</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(table.status) }}
                    />
                  </div>
                  <p className="text-xs font-semibold mb-1 capitalize" style={{ color: getStatusColor(table.status) }}>
                    {table.status}
                  </p>
                  {table.guests && (
                    <div className="flex items-center text-xs" style={{ color: '#999999' }}>
                      <Users size={12} className="mr-1" />
                      {table.guests} guests
                    </div>
                  )}
                  {table.time && (
                    <div className="flex items-center text-xs mt-1" style={{ color: '#999999' }}>
                      <Clock size={12} className="mr-1" />
                      {table.time}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>Recent Orders</h2>
              <Utensils size={20} style={{ color: '#FFD700' }} />
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-3 rounded-lg border" style={{ borderColor: '#FFD700', backgroundColor: '#FFFAF0' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: '#333333' }}>{order.table}</p>
                      <p className="text-xs" style={{ color: '#999999' }}>{order.items}</p>
                    </div>
                    <span 
                      className="text-xs font-semibold px-2 py-1 rounded capitalize"
                      style={{ 
                        backgroundColor: getStatusBg(order.status),
                        color: getStatusColor(order.status)
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: '#999999' }}>{order.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button className="p-4 rounded-lg shadow-sm border-2 transition-all hover:scale-105" style={{ backgroundColor: '#FF8C00', borderColor: '#FFD700', color: '#FFFFFF' }}>
            <ClipboardList size={24} className="mx-auto mb-2" />
            <span className="text-sm font-semibold">New Order</span>
          </button>
          <button className="p-4 rounded-lg shadow-sm border-2 transition-all hover:scale-105" style={{ backgroundColor: '#FFFFFF', borderColor: '#FFD700', color: '#333333' }}>
            <Table2 size={24} className="mx-auto mb-2" style={{ color: '#FF8C00' }} />
            <span className="text-sm font-semibold">Assign Table</span>
          </button>
          <button className="p-4 rounded-lg shadow-sm border-2 transition-all hover:scale-105" style={{ backgroundColor: '#FFFFFF', borderColor: '#FFD700', color: '#333333' }}>
            <DollarSign size={24} className="mx-auto mb-2" style={{ color: '#FF8C00' }} />
            <span className="text-sm font-semibold">Process Bill</span>
          </button>
          <button className="p-4 rounded-lg shadow-sm border-2 transition-all hover:scale-105" style={{ backgroundColor: '#FFFFFF', borderColor: '#FFD700', color: '#333333' }}>
            <Bell size={24} className="mx-auto mb-2" style={{ color: '#FF8C00' }} />
            <span className="text-sm font-semibold">Call Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaiterPanel;