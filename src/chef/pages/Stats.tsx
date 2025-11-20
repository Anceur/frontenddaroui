import React, { useEffect, useState, useCallback } from 'react'
import { getChefStats } from '../api/chef-api'
import { BarChart3, ChefHat, Clock, TrendingUp, Award, Flame, UtensilsCrossed, CheckCircle, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react'

// ============================================
// MAIN STATS COMPONENT
// ============================================

export default function Stats() {
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today')
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        pendingOrders: 0,
        topDishes: [] as Array<{ name: string; count: number }>,
        avgPreparationTime: 0,
        completionRate: 0,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    // Fetch stats
    const fetchStats = useCallback(async () => {
        try {
            setError(null);
            const data = await getChefStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch stats');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !refreshing) {
                fetchStats();
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchStats, loading, refreshing]);

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
    }

    // Mock peak hours (you can calculate from orders later)
    const peakHours = [
        { hour: '12:00 PM', orders: 24 },
        { hour: '1:00 PM', orders: 31 },
        { hour: '7:00 PM', orders: 28 },
        { hour: '8:00 PM', orders: 22 },
    ]

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
            <div className="max-w-7xl mx-auto px-4 py-6">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-1" style={{ color: '#FF8C00' }}>
                            Kitchen Statistics
                        </h1>
                        <p className="text-sm" style={{ color: '#999999' }}>
                            Track performance and insights
                        </p>
                    </div>
                    
                    {/* Time Filter and Refresh */}
                    <div className="flex gap-2">
                        <div className="flex gap-2 bg-white rounded-xl p-1 border-2" style={{ borderColor: '#FFD700' }}>
                            {(['today', 'week', 'month'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeFilter(period)}
                                    className="px-4 py-2 rounded-lg font-semibold text-sm capitalize transition-all"
                                    style={{
                                        background: timeFilter === period ? '#FF8C00' : 'transparent',
                                        color: timeFilter === period ? '#FFFFFF' : '#6B7280'
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="p-2 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-50"
                            style={{ borderColor: '#FFD700' }}
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="text-red-800 font-medium">Error</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
                    </div>
                ) : (
                    <>
                        {/* Main Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <StatCard
                                label="Total Orders"
                                value={stats.totalOrders}
                                icon={<BarChart3 size={24} />}
                                color="#FF8C00"
                            />
                            <StatCard
                                label="In Progress"
                                value={stats.preparingOrders}
                                icon={<ChefHat size={24} />}
                                color="#F59E0B"
                            />
                            <StatCard
                                label="Ready to Serve"
                                value={stats.readyOrders}
                                icon={<UtensilsCrossed size={24} />}
                                color="#3B82F6"
                            />
                            <StatCard
                                label="Pending"
                                value={stats.pendingOrders}
                                icon={<AlertCircle size={24} />}
                                color="#EF4444"
                            />
                        </div>

                        {/* Secondary Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <MiniStatCard
                                label="Avg. Preparation Time"
                                value={`${stats.avgPreparationTime} min`}
                                icon={<Clock size={20} />}
                                color="#6B7280"
                            />
                            <MiniStatCard
                                label="Completion Rate"
                                value={`${stats.completionRate}%`}
                                icon={<TrendingUp size={20} />}
                                color="#10B981"
                            />
                            <MiniStatCard
                                label="Pending Orders"
                                value={stats.pendingOrders}
                                icon={<AlertCircle size={20} />}
                                color="#EF4444"
                            />
                        </div>

                        {/* Charts and Lists Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Top Dishes */}
                            <div className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#FFD700' }}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FFF3E0' }}>
                                        <Award size={22} style={{ color: '#FF8C00' }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold" style={{ color: '#333333' }}>Top Dishes</h3>
                                        <p className="text-xs" style={{ color: '#999999' }}>Most ordered items</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {stats.topDishes.length > 0 ? stats.topDishes.map((dish, idx) => (
                                        <TopDishItem
                                            key={dish.name}
                                            rank={idx + 1}
                                            name={dish.name}
                                            orders={dish.count}
                                            isTop={idx === 0}
                                        />
                                    )) : (
                                        <p className="text-center py-8 text-sm" style={{ color: '#999999' }}>
                                            No dishes data available
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Peak Hours */}
                            <div className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#FFD700' }}>
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                                        <Flame size={22} style={{ color: '#EF4444' }} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold" style={{ color: '#333333' }}>Peak Hours</h3>
                                        <p className="text-xs" style={{ color: '#999999' }}>Busiest times today</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {peakHours.map((hour, idx) => (
                                        <PeakHourBar
                                            key={hour.hour}
                                            hour={hour.hour}
                                            orders={hour.orders}
                                            maxOrders={Math.max(...peakHours.map(h => h.orders))}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="mt-6 bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#FFD700' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#E0F2FE' }}>
                                    <TrendingUp size={22} style={{ color: '#3B82F6' }} />
                                </div>
                                <h3 className="text-lg font-bold" style={{ color: '#333333' }}>Performance Summary</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <PerformanceMetric
                                    label="Orders per Hour"
                                    value={`${stats.totalOrders > 0 ? (stats.totalOrders / 8).toFixed(1) : '0'}`}
                                    status="excellent"
                                />
                                <PerformanceMetric
                                    label="On-Time Delivery"
                                    value={`${stats.completionRate}%`}
                                    status={stats.completionRate >= 90 ? 'excellent' : stats.completionRate >= 75 ? 'good' : 'average'}
                                />
                                <PerformanceMetric
                                    label="Avg. Prep Time"
                                    value={`${stats.avgPreparationTime} min`}
                                    status={stats.avgPreparationTime <= 10 ? 'excellent' : stats.avgPreparationTime <= 15 ? 'good' : 'average'}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
    label: string
    value: number
    icon: React.ReactNode
    color: string
    trend?: string
}

function StatCard({ label, value, icon, color, trend }: StatCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-white rounded-xl shadow-md border-2 p-5 transition-all duration-200 cursor-default"
            style={{
                borderColor: '#FFD700',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHovered ? '0 8px 24px rgba(255, 140, 0, 0.15)' : undefined
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: '#999999' }}>{label}</p>
                    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
                </div>
                <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: color + '15' }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>
            </div>
            {trend && (
                <div className="flex items-center gap-1">
                    <TrendingUp size={14} style={{ color: '#10B981' }} />
                    <span className="text-xs font-semibold" style={{ color: '#10B981' }}>{trend}</span>
                    <span className="text-xs" style={{ color: '#999999' }}>vs last period</span>
                </div>
            )}
        </div>
    )
}

// ============================================
// MINI STAT CARD COMPONENT
// ============================================

interface MiniStatCardProps {
    label: string
    value: string | number
    icon: React.ReactNode
    color: string
}

function MiniStatCard({ label, value, icon, color }: MiniStatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border-2 p-4 flex items-center gap-4" style={{ borderColor: '#FFD700' }}>
            <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: color + '15' }}
            >
                <div style={{ color }}>{icon}</div>
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: '#999999' }}>{label}</p>
                <p className="text-xl font-bold" style={{ color: '#333333' }}>{value}</p>
            </div>
        </div>
    )
}

// ============================================
// TOP DISH ITEM COMPONENT
// ============================================

interface TopDishItemProps {
    rank: number
    name: string
    orders: number
    isTop: boolean
}

function TopDishItem({ rank, name, orders, isTop }: TopDishItemProps) {
    return (
        <div 
            className="flex items-center gap-3 p-3 rounded-lg transition-all"
            style={{ background: isTop ? '#FFF3E0' : '#F9FAFB' }}
        >
            <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{
                    background: isTop ? '#FF8C00' : '#E5E7EB',
                    color: isTop ? '#FFFFFF' : '#6B7280'
                }}
            >
                {rank}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: '#333333' }}>{name}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold" style={{ color: '#FF8C00' }}>{orders}</p>
                <p className="text-xs" style={{ color: '#999999' }}>orders</p>
            </div>
        </div>
    )
}

// ============================================
// PEAK HOUR BAR COMPONENT
// ============================================

interface PeakHourBarProps {
    hour: string
    orders: number
    maxOrders: number
}

function PeakHourBar({ hour, orders, maxOrders }: PeakHourBarProps) {
    const percentage = (orders / maxOrders) * 100

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: '#333333' }}>{hour}</span>
                <span className="text-sm font-bold" style={{ color: '#FF8C00' }}>{orders} orders</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                        background: 'linear-gradient(90deg, #FF8C00, #FFD700)'
                    }}
                />
            </div>
        </div>
    )
}

// ============================================
// PERFORMANCE METRIC COMPONENT
// ============================================

interface PerformanceMetricProps {
    label: string
    value: string
    status: 'excellent' | 'good' | 'average'
}

function PerformanceMetric({ label, value, status }: PerformanceMetricProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'excellent': return '#10B981'
            case 'good': return '#3B82F6'
            case 'average': return '#F59E0B'
        }
    }

    const color = getStatusColor()

    return (
        <div className="p-4 rounded-lg border-2" style={{ borderColor: color + '30', background: color + '08' }}>
            <p className="text-sm font-medium mb-2" style={{ color: '#6B7280' }}>{label}</p>
            <div className="flex items-end gap-2">
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <span 
                    className="text-xs font-semibold px-2 py-1 rounded uppercase mb-1"
                    style={{ background: color, color: '#FFFFFF' }}
                >
                    {status}
                </span>
            </div>
        </div>
    )
}
