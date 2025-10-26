import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, ChevronDown, DollarSign, ShoppingBag, TrendingUp, Users, Truck, Clock, Star } from 'lucide-react';
import * as Chart from 'chart.js/auto';

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
}

export default function NostalgieDashboard() {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const categoriesChartRef = useRef<HTMLCanvasElement>(null);
  const salesChartInstance = useRef<Chart.Chart | null>(null);
  const categoriesChartInstance = useRef<Chart.Chart | null>(null);

  const notifications: Notification[] = [
    { id: 1, text: 'New order #1234 received', time: '2 min ago', unread: true },
    { id: 2, text: 'Low stock alert: French Fries', time: '15 min ago', unread: true },
    { id: 3, text: 'Staff member John clocked in', time: '1 hour ago', unread: false },
  ];

  const unreadCount: number = notifications.filter(n => n.unread).length;

  const recentOrders = [
    { id: '#102', customer: 'John Doe', status: 'Ready', total: '$45.99', time: '5 min ago' },
    { id: '#103', customer: 'Sarah K.', status: 'Pending', total: '$32.50', time: '12 min ago' },
    { id: '#104', customer: 'Mike R.', status: 'Preparing', total: '$67.80', time: '15 min ago' },
    { id: '#105', customer: 'Emma L.', status: 'Ready', total: '$28.00', time: '20 min ago' },
  ];

  const deliveryStatus = [
    { id: '#102', status: 'Out for Delivery', driver: 'James Wilson', time: '5 min' },
    { id: '#104', status: 'En Route', driver: 'Lisa Anderson', time: '12 min' },
    { id: '#98', status: 'Delivered', driver: 'Tom Brown', time: '25 min' },
  ];

  const staffPerformance = [
    { name: 'Sarah Johnson', orders: 45, rating: 4.8, status: 'Active' },
    { name: 'Mike Chen', orders: 38, rating: 4.9, status: 'Active' },
    { name: 'Emma Davis', orders: 42, rating: 4.7, status: 'Break' },
    { name: 'John Smith', orders: 35, rating: 4.6, status: 'Active' },
  ];

  const customerReviews = [
    { customer: 'Alice M.', rating: 5, comment: 'Amazing food! Fast delivery.', time: '1 hour ago' },
    { customer: 'Bob K.', rating: 4, comment: 'Good quality, will order again.', time: '2 hours ago' },
    { customer: 'Carol S.', rating: 5, comment: 'Best burger in town!', time: '3 hours ago' },
  ];

  useEffect(() => {
    // Sales Trends Chart
    if (salesChartRef.current) {
      const ctx = salesChartRef.current.getContext('2d');
      if (ctx) {
        if (salesChartInstance.current) {
          salesChartInstance.current.destroy();
        }
        salesChartInstance.current = new Chart.Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Sales',
              data: [1200, 1900, 1500, 2200, 2800, 3200, 2900],
              borderColor: '#FF8C00',
              backgroundColor: 'rgba(255, 140, 0, 0.1)',
              tension: 0.4,
              fill: true,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value;
                  }
                }
              }
            }
          }
        });
      }
    }

    // Categories Pie Chart
    if (categoriesChartRef.current) {
      const ctx = categoriesChartRef.current.getContext('2d');
      if (ctx) {
        if (categoriesChartInstance.current) {
          categoriesChartInstance.current.destroy();
        }
        categoriesChartInstance.current = new Chart.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Burgers', 'Pizza', 'Fries', 'Drinks', 'Desserts'],
            datasets: [{
              data: [35, 25, 20, 12, 8],
              backgroundColor: ['#FF8C00', '#FFD700', '#FFFAF0', '#999999', '#333333'],
              borderWidth: 2,
              borderColor: '#FFFFFF'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }

    return () => {
      if (salesChartInstance.current) salesChartInstance.current.destroy();
      if (categoriesChartInstance.current) categoriesChartInstance.current.destroy();
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ready': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'Preparing': return '#3B82F6';
      default: return '#999999';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Main Content */}
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#333333' }}>
            Hello, Amar 👋
          </h2>
          <p style={{ color: '#999999' }}>Here's what's happening with your restaurant today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                <ShoppingBag size={24} style={{ color: '#FF8C00' }} />
              </div>
              <span className="text-sm font-semibold text-green-600">+12%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>156</h3>
            <p className="text-sm" style={{ color: '#999999' }}>Orders Today</p>
          </div>

          <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                <DollarSign size={24} style={{ color: '#FF8C00' }} />
              </div>
              <span className="text-sm font-semibold text-green-600">+8%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>$4,890</h3>
            <p className="text-sm" style={{ color: '#999999' }}>Revenue Today</p>
          </div>

          <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                <TrendingUp size={24} style={{ color: '#FF8C00' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: '#FFD700' }}>🔥 Hot</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>Burger</h3>
            <p className="text-sm" style={{ color: '#999999' }}>Top Seller</p>
          </div>

          <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                <Users size={24} style={{ color: '#FF8C00' }} />
              </div>
              <span className="text-sm font-semibold text-green-600">+15%</span>
            </div>
            <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>1,240</h3>
            <p className="text-sm" style={{ color: '#999999' }}>Customers</p>
          </div>
        </div>

        {/* Recent Orders & Delivery Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#FF8C00' }}>
                      {order.customer.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#333333' }}>{order.id} - {order.customer}</p>
                      <p className="text-sm" style={{ color: '#999999' }}>{order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold mb-1" style={{ color: '#333333' }}>{order.total}</p>
                    <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Status */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Delivery Status</h3>
            <div className="space-y-4">
              {deliveryStatus.map((delivery) => (
                <div key={delivery.id} className="p-4 rounded-lg border" style={{ borderColor: '#FFFAF0', backgroundColor: '#FFFAF0' }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white">
                      <Truck size={20} style={{ color: '#FF8C00' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold" style={{ color: '#333333' }}>Order {delivery.id}</p>
                        <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#FF8C00', color: 'white' }}>
                          {delivery.status}
                        </span>
                      </div>
                      <p className="text-sm mb-1" style={{ color: '#999999' }}>Driver: {delivery.driver}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: '#999999' }}>
                        <Clock size={12} /> {delivery.time} ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trends */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Sales Trends</h3>
            <div style={{ height: '300px' }}>
              <canvas ref={salesChartRef}></canvas>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Top Categories</h3>
            <div style={{ height: '300px' }}>
              <canvas ref={categoriesChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Staff & Reviews Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Performance */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Staff Performance</h3>
            <div className="space-y-4">
              {staffPerformance.map((staff) => (
                <div key={staff.name} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFD700)' }}>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: '#333333' }}>{staff.name}</p>
                      <p className="text-sm" style={{ color: '#999999' }}>{staff.orders} orders today</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star size={14} fill="#FFD700" style={{ color: '#FFD700' }} />
                      <span className="font-semibold" style={{ color: '#333333' }}>{staff.rating}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${staff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {staff.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Customer Reviews</h3>
            <div className="space-y-4">
              {customerReviews.map((review, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ borderColor: '#FFFAF0' }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold" style={{ color: '#333333' }}>{review.customer}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#FFD700" style={{ color: '#FFD700' }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm mb-2" style={{ color: '#666666' }}>{review.comment}</p>
                  <p className="text-xs" style={{ color: '#999999' }}>{review.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}