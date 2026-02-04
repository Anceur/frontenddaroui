import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { Search, Bell, ChevronDown, DollarSign, ShoppingBag, TrendingUp, Users, Truck, Clock, Star, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import * as Chart from 'chart.js/auto';
import { AuthContext } from '../../shared/context/Authservice';
import { getDashboardStats, type DashboardStats } from '../../shared/api/dashboard';
import { getAnalytics, type AnalyticsData } from '../../shared/api/analytics';
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
  const auth = useContext(AuthContext);
  
  // API state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { user } = auth;

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [stats, analytics] = await Promise.all([
        getDashboardStats(),
        getAnalytics(7) // Last 7 days for dashboard
      ]);
      setDashboardStats(stats);
      setAnalyticsData(analytics);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données du tableau de bord :', err);
      setError(err.message || 'Échec du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Format time ago
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    return `il y a ${Math.floor(diffHours / 24)} jour${Math.floor(diffHours / 24) > 1 ? 's' : ''}`;
  };

  // Update charts when analytics data is available
  useEffect(() => {
    if (!analyticsData) return;

    // Sales Trends Chart
    if (salesChartRef.current) {
      const ctx = salesChartRef.current.getContext('2d');
      if (ctx) {
        if (salesChartInstance.current) {
          salesChartInstance.current.destroy();
        }

        // Format dates for labels
        const labels = analyticsData.sales_by_date.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('fr-FR', { weekday: 'short' });
        });
        const sales = analyticsData.sales_by_date.map(item => item.total);

        salesChartInstance.current = new Chart.Chart(ctx, {
          type: 'line',
          data: {
            labels: labels.length > 0 ? labels : ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
              label: 'Ventes',
              data: sales.length > 0 ? sales : [0, 0, 0, 0, 0, 0, 0],
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
                    return value + ' DA';
                  }
                }
              }
            }
          }
        });
      }
    }

    // Top Items Pie Chart
    if (categoriesChartRef.current && analyticsData.top_items.length > 0) {
      const ctx = categoriesChartRef.current.getContext('2d');
      if (ctx) {
        if (categoriesChartInstance.current) {
          categoriesChartInstance.current.destroy();
        }

        const top5Items = analyticsData.top_items.slice(0, 5);
        const labels = top5Items.map(item => item.name);
        const data = top5Items.map(item => item.total_quantity);

        categoriesChartInstance.current = new Chart.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
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
  }, [analyticsData]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Ready': return '#10B981';
      case 'Pending': return '#F59E0B';
      case 'Preparing': return '#3B82F6';
      default: return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Ready': return 'Prêt';
      case 'Pending': return 'En attente';
      case 'Preparing': return 'Préparation';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#333333' }}>
                Bonjour, {user} 👋
              </h2>
              <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Voici l'activité de votre restaurant aujourd'hui</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
          </div>
        )}

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                  <ShoppingBag size={24} style={{ color: '#FF8C00' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>{dashboardStats.orders_today}</h3>
              <p className="text-sm" style={{ color: '#999999' }}>Commandes aujourd'hui</p>
            </div>

            <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                  <DollarSign size={24} style={{ color: '#FF8C00' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>{dashboardStats.revenue_today.toFixed(2)} DA</h3>
              <p className="text-sm" style={{ color: '#999999' }}>Revenu aujourd'hui</p>
            </div>

            <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                  <TrendingUp size={24} style={{ color: '#FF8C00' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>
                {dashboardStats.top_items.length > 0 ? dashboardStats.top_items[0].item__name : 'N/D'}
              </h3>
              <p className="text-sm" style={{ color: '#999999' }}>Meilleure vente</p>
            </div>

            <div className="bg-white p-6 rounded-lg border" style={{ borderColor: '#FFD700' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#FFFAF0' }}>
                  <Users size={24} style={{ color: '#FF8C00' }} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1" style={{ color: '#333333' }}>{dashboardStats.active_staff}</h3>
              <p className="text-sm" style={{ color: '#999999' }}>Personnel actif</p>
            </div>
          </div>
        )}

        {/* Recent Orders & Delivery Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Commandes récentes</h3>
            <div className="space-y-4">
              {dashboardStats?.recent_orders && dashboardStats.recent_orders.length > 0 ? (
                dashboardStats.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: '#FF8C00' }}>
                        {order.customer.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#333333' }}>#{order.id} - {order.customer}</p>
                        <p className="text-sm" style={{ color: '#999999' }}>{timeAgo(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold mb-1" style={{ color: '#333333' }}>{Number(order.total).toFixed(2)} DA</p>
                      <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune commande récente</p>
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Alertes de stock faible</h3>
            <div className="space-y-4">
              {dashboardStats?.low_stock_ingredients && dashboardStats.low_stock_ingredients.length > 0 ? (
                dashboardStats.low_stock_ingredients.slice(0, 5).map((ingredient) => (
                  <div key={ingredient.id} className="p-4 rounded-lg border" style={{ borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white">
                        <AlertCircle size={20} style={{ color: '#EF4444' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold" style={{ color: '#333333' }}>{ingredient.name}</p>
                          <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                            Stock faible
                          </span>
                        </div>
                        <p className="text-sm mb-1" style={{ color: '#999999' }}>
                          Actuel : {ingredient.stock} {ingredient.unit} | Réapprovisionnement : {ingredient.reorder_level} {ingredient.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Tous les ingrédients sont suffisamment approvisionnés</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
          {/* Sales Trends */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Tendances des ventes</h3>
            <div style={{ height: '300px' }}>
              <canvas ref={salesChartRef}></canvas>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Principales catégories</h3>
            <div style={{ height: '300px' }}>
              <canvas ref={categoriesChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Staff & Reviews Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Orders */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Commandes en attente</h3>
            <div className="space-y-4">
              {dashboardStats && dashboardStats.pending_orders > 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#FF8C00' }}>
                    {dashboardStats.pending_orders}
                  </div>
                  <p className="text-sm text-gray-600">Commandes en attente de traitement</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune commande en attente</p>
              )}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#FFD700' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Articles les plus vendus</h3>
            <div className="space-y-3">
              {dashboardStats?.top_items && dashboardStats.top_items.length > 0 ? (
                dashboardStats.top_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFD700)' }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#333333' }}>{item.item__name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm" style={{ color: '#FF8C00' }}>{item.total_quantity} vendus</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Aucune donnée disponible</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}