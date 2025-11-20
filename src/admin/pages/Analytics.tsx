import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Filter, Download, TrendingUp, Users, ShoppingBag, DollarSign, Clock, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { getAnalytics, type AnalyticsData } from '../../shared/api/analytics';

// Helper functions to format data
const formatSalesData = (analyticsData: AnalyticsData | null) => {
  if (!analyticsData || !analyticsData.sales_by_date) return [];
  return analyticsData.sales_by_date.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
    time: new Date(item.hour).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    customers: item.count,
  }));
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Map date range to days
  const getDaysFromRange = (range: string): number => {
    switch(range) {
      case 'Today': return 1;
      case 'Yesterday': return 1;
      case 'Last 7 Days': return 7;
      case 'This Month': return 30;
      case 'Last Month': return 30;
      case 'This Year': return 365;
      default: return 30;
    }
  };

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const days = getDaysFromRange(dateRange);
      const data = await getAnalytics(days);
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
  };

  const summaryCards = analyticsData ? [
    { title: 'Total Revenue', value: `${analyticsData.total_revenue.toFixed(2)} DA`, change: '', icon: <DollarSign className="text-green-500" />, trend: 'up' },
    { title: 'Total Orders', value: analyticsData.total_orders.toString(), change: '', icon: <ShoppingBag className="text-blue-500" />, trend: 'up' },
    { title: 'Avg. Order Value', value: `${analyticsData.average_order_value.toFixed(2)} DA`, change: '', icon: <TrendingUp className="text-orange-500" />, trend: 'up' },
    { title: 'Top Item', value: analyticsData.top_items.length > 0 ? analyticsData.top_items[0].name : 'N/A', change: '', icon: <ShoppingBag className="text-purple-500" />, trend: 'up' },
  ] : [
    { title: 'Total Revenue', value: '0 DA', change: '', icon: <DollarSign className="text-green-500" />, trend: 'up' },
    { title: 'Total Orders', value: '0', change: '', icon: <ShoppingBag className="text-blue-500" />, trend: 'up' },
    { title: 'Avg. Order Value', value: '0 DA', change: '', icon: <TrendingUp className="text-orange-500" />, trend: 'up' },
    { title: 'Top Item', value: 'N/A', change: '', icon: <ShoppingBag className="text-purple-500" />, trend: 'up' },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-title)', color: '#FF8C00' }}>
          Analytics
        </h1>
        <div className="flex space-x-4">
          <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <select 
              className="bg-transparent border-none text-sm focus:outline-none"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center bg-white rounded-lg px-4 py-2 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-gray-500 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold mb-2">{card.value}</h3>
                <p className={`text-sm ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {card.change} from last period
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'sales'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'customers'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'products'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
          </nav>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          {analyticsData && formatSalesData(analyticsData).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatSalesData(analyticsData)} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
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
              No sales data available
            </div>
          )}
        </div>

        {/* Top Items Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
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
              No item data available
            </div>
          )}
        </div>
      </div>

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Hour */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Orders by Hour</h3>
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
              No hourly data available
            </div>
          )}
        </div>

        {/* Sales Trend Line */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
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
              No sales data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;