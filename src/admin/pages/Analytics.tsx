import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Filter, Download, TrendingUp, Users, ShoppingBag, DollarSign, Clock, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { getAnalytics, type AnalyticsData } from '../../shared/api/analytics';

// Fonctions utilitaires pour formater les données
const formatSalesData = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || !analyticsData.sales_by_date) return [];
  return analyticsData.sales_by_date.map(item => ({
    name: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    sales: item.total,
    count: item.count,
  }));
};

const formatCategoryData = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || !analyticsData.top_items) return [];
  return analyticsData.top_items.slice(0, 5).map(item => ({
    name: item.name,
    value: item.total_quantity,
  }));
};

const formatHourlyData = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || !analyticsData.orders_by_hour) return [];
  return analyticsData.orders_by_hour.map(item => ({
    time: new Date(item.hour).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    customers: item.count,
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('Ce mois-ci');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Correspondance entre plage de dates et nombre de jours
  const getDaysFromRange = (range: string): number => {
    switch (range) {
      case 'Aujourd\'hui': return 0;
      case 'Hier': return 1;
      case '7 derniers jours': return 7;
      case 'Ce mois-ci': return 30;
      case 'Le mois dernier': return 30;
      case 'Cette année': return 365;
      default: return 30;
    }
  };

  // Récupérer les données analytiques
  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const days = getDaysFromRange(dateRange);
      const data = await getAnalytics(days);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des analytics :', err);
      setError(err.message || 'Impossible de charger les données analytiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Rafraîchir les données
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const summaryCards = analyticsData ? [
    { title: 'Revenu total', value: `${analyticsData.total_revenue.toFixed(2)} DA`, change: '', icon: <DollarSign className="text-green-500" />, trend: 'up' },
    { title: 'Commandes totales', value: analyticsData.total_orders.toString(), change: '', icon: <ShoppingBag className="text-blue-500" />, trend: 'up' },
    { title: 'Valeur moyenne des commandes', value: `${analyticsData.average_order_value.toFixed(2)} DA`, change: '', icon: <TrendingUp className="text-orange-500" />, trend: 'up' },
    { title: 'Article le plus vendu', value: analyticsData.top_items.length > 0 ? analyticsData.top_items[0].name : 'N/A', change: '', icon: <ShoppingBag className="text-purple-500" />, trend: 'up' },
  ] : [
    { title: 'Revenu total', value: '0 DA', change: '', icon: <DollarSign className="text-green-500" />, trend: 'up' },
    { title: 'Commandes totales', value: '0', change: '', icon: <ShoppingBag className="text-blue-500" />, trend: 'up' },
    { title: 'Valeur moyenne des commandes', value: '0 DA', change: '', icon: <TrendingUp className="text-orange-500" />, trend: 'up' },
    { title: 'Article le plus vendu', value: 'N/A', change: '', icon: <ShoppingBag className="text-purple-500" />, trend: 'up' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#FF8C00' }}>
          Analytique
        </h1>
        <div className="flex space-x-4">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <select
              className="bg-transparent border-none text-sm focus:outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Aujourd'hui</option>
              <option>Hier</option>
              <option>7 derniers jours</option>
              <option>Ce mois-ci</option>
              <option>Le mois dernier</option>
              <option>Cette année</option>
            </select>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center bg-white rounded-lg px-4 py-2 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-gray-500 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Rafraîchir</span>
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
        </div>
      )}

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold mb-2">{card.value}</h3>
                <p className={`text-sm ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change} depuis la période précédente
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === 'sales'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ventes
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === 'customers'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                activeTab === 'products'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Produits
            </button>
          </nav>
        </div>
      </div>

      {/* Section Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Graphique des ventes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendance des ventes</h3>
          {analyticsData && formatSalesData(analyticsData).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatSalesData(analyticsData)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF8C00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#FF8C00" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée de ventes disponible
            </div>
          )}
        </div>

        {/* Distribution des meilleurs articles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Articles les plus vendus</h3>
          {analyticsData && formatCategoryData(analyticsData).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatCategoryData(analyticsData)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {formatCategoryData(analyticsData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée d'article disponible
            </div>
          )}
        </div>
      </div>

      {/* Deuxième rangée de graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commandes par heure */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Commandes par heure</h3>
          {analyticsData && formatHourlyData(analyticsData).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatHourlyData(analyticsData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="customers" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée horaire disponible
            </div>
          )}
        </div>

        {/* Graphique de tendance des ventes (ligne) */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendance des ventes</h3>
          {analyticsData && formatSalesData(analyticsData).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatSalesData(analyticsData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#FF8C00" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée de ventes disponible
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
