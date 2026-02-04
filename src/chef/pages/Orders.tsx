import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { CheckCircle, ChefHat, Clock, Filter, Play, UtensilsCrossed, Search, AlertCircle, TrendingUp, Loader2, RefreshCw, X, SortAsc, SortDesc, Eye } from 'lucide-react'
import { getChefOrders, updateOrderStatus, getChefOrderCounts, type ChefOrder, type ChefOrderStatus } from '../api/chef-api'
import { useNavigate } from 'react-router-dom'

type Status = 'all' | 'new' | 'preparing' | 'ready'

// Map chef panel status to backend status
function mapStatusToBackend(status: 'new' | 'preparing' | 'ready'): 'Pending' | 'Preparing' | 'Ready' {
	const statusMap = {
		'new': 'Pending' as const,
		'preparing': 'Preparing' as const,
		'ready': 'Ready' as const,
	};
	return statusMap[status];
}

// Map backend status to chef panel status
function mapBackendStatusToChef(status: string): 'new' | 'preparing' | 'ready' {
	const statusMap: Record<string, 'new' | 'preparing' | 'ready'> = {
		'Pending': 'new',
		'Preparing': 'preparing',
		'Ready': 'ready',
	};
	return statusMap[status] || 'new';
}

// Time ago helper
function timeAgo(dateString: string): string {
	const now = new Date();
	const date = new Date(dateString);
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);

	if (diffSecs < 60) return `${diffSecs}s ago`;
	if (diffMins < 60) return `${diffMins}m ago`;
	return `${diffHours}h ago`;
}

// ============================================
// MAIN ORDERS COMPONENT
// ============================================

type SortOption = 'time' | 'urgency' | 'id';

export default function Orders() {
	const [filter, setFilter] = useState<Status>('all')
	const [query, setQuery] = useState('')
	const [orders, setOrders] = useState<ChefOrder[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [refreshing, setRefreshing] = useState(false)
	const [counts, setCounts] = useState({
		all: 0,
		new: 0,
		preparing: 0,
		ready: 0,
	})
	const [sortBy, setSortBy] = useState<SortOption>('urgency')
	const navigate = useNavigate()

	// Store fetch function in ref to avoid dependency issues
	const loadingRef = useRef(false);

	// Fetch orders
	const fetchOrders = useCallback(async () => {
		if (loadingRef.current) return;
		loadingRef.current = true;

		try {
			setError(null);
			setRefreshing(true);

			const [ordersData, countsData] = await Promise.all([
				getChefOrders(),
				getChefOrderCounts(),
			]);

			setOrders(ordersData);
			setCounts({
				all: countsData.all,
				new: countsData.new,
				preparing: countsData.preparing,
				ready: countsData.ready,
			});
		} catch (err: any) {
			const errorMsg = err.message || 'Failed to fetch orders';
			setError(errorMsg);
		} finally {
			setLoading(false);
			setRefreshing(false);
			loadingRef.current = false;
		}
	}, []);

	// Initial fetch
	useEffect(() => {
		setLoading(true);
		fetchOrders();
	}, [fetchOrders]);

	// Auto-refresh every 10 seconds (silent refresh, no notifications)
	useEffect(() => {
		const interval = setInterval(() => {
			if (!loading && !refreshing) {
				fetchOrders();
			}
		}, 10000);
		return () => clearInterval(interval);
	}, [loading, refreshing, fetchOrders]);

	// Filter and sort orders
	const filtered = useMemo(() => {
		let result = orders.filter(t => {
			const matchesFilter = filter === 'all' ? true : mapBackendStatusToChef(t.status) === filter
			const q = query.toLowerCase()
			const matchesQuery = !q ||
				`#${t.id}`.toLowerCase().includes(q) ||
				(t.table_number || '').toLowerCase().includes(q) ||
				t.items.some(i => i.name.toLowerCase().includes(q))
			return matchesFilter && matchesQuery
		});

		// Sort orders
		result = [...result].sort((a, b) => {
			switch (sortBy) {
				case 'urgency': {
					const statusPriority = { 'Pending': 3, 'Preparing': 2, 'Ready': 1, 'Delivered': 0, 'Served': 0 };
					const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
					const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
					if (aPriority !== bPriority) return bPriority - aPriority;
					return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
				}
				case 'time':
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
				case 'id':
					return b.id - a.id;
				default:
					return 0;
			}
		});

		return result;
	}, [orders, filter, query, sortBy])

	// Handle status updates
	const handleStart = async (id: number, isOffline: boolean = false) => {
		try {
			setError(null);
			const order = orders.find(o => o.id === id);
			const isOfflineOrder = order?.is_offline || isOffline;
			await updateOrderStatus(id, 'Preparing', isOfflineOrder);
			setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Preparing' as const } : o));
			setCounts(prev => ({
				...prev,
				new: Math.max(0, prev.new - 1),
				preparing: prev.preparing + 1
			}));
		} catch (err: any) {
			const errorMsg = err.message || 'Failed to update order status';
			setError(errorMsg);
		}
	}

	const handleReady = async (id: number, isOffline: boolean = false) => {
		try {
			setError(null);
			const order = orders.find(o => o.id === id);
			const isOfflineOrder = order?.is_offline || isOffline;
			await updateOrderStatus(id, 'Ready', isOfflineOrder);
			setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Ready' as const } : o));
			setCounts(prev => ({
				...prev,
				preparing: Math.max(0, prev.preparing - 1),
				ready: prev.ready + 1
			}));
		} catch (err: any) {
			const errorMsg = err.message || 'Failed to update order status';
			setError(errorMsg);
		}
	}

	const handleComplete = async (id: number, isOffline: boolean = false) => {
		try {
			setError(null);
			const order = orders.find(o => o.id === id);
			const isOfflineOrder = order?.is_offline || isOffline;
			const newStatus = isOfflineOrder ? 'Served' : 'Delivered';
			await updateOrderStatus(id, newStatus as ChefOrderStatus, isOfflineOrder);
			setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as ChefOrderStatus } : o));
			setCounts(prev => ({
				...prev,
				ready: Math.max(0, prev.ready - 1)
			}));
		} catch (err: any) {
			const errorMsg = err.message || 'Failed to update order status';
			setError(errorMsg);
		}
	}

	return (
		<div className="min-h-screen" style={{ background: '#F9FAFB' }}>
			<div className="max-w-7xl mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>Kitchen Orders</h1>
							<p className="text-gray-600 mt-1">Manage and track all incoming orders</p>
						</div>
						<div className="flex items-center gap-3">
							<button
								onClick={() => fetchOrders()}
								disabled={loading || refreshing}
								className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
								style={{ background: '#FF8C00', color: '#FFFFFF' }}
							>
								<RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
								Refresh
							</button>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<StatCard icon={<Clock size={24} />} label="New Orders" value={counts.new} color="#3B82F6" />
						<StatCard icon={<ChefHat size={24} />} label="Preparing" value={counts.preparing} color="#F59E0B" />
						<StatCard icon={<CheckCircle size={24} />} label="Ready" value={counts.ready} color="#10B981" />
						<StatCard icon={<TrendingUp size={24} />} label="Total" value={counts.all} color="#6366F1" />
					</div>

					{/* Filters and Search */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="flex-1 flex gap-2">
							{([
								['all', 'All', counts.all],
								['new', 'New', counts.new],
								['preparing', 'Preparing', counts.preparing],
								['ready', 'Ready', counts.ready]
							] as [Status, string, number][]).map(([key, label, count]) => (
								<FilterButton
									key={key}
									active={filter === key}
									onClick={() => setFilter(key)}
									label={label}
									count={count}
								/>
							))}
						</div>

						<div className="flex items-center gap-2">
							<span className="text-sm font-medium" style={{ color: '#6B7280' }}>Sort:</span>
							<button
								onClick={() => setSortBy('urgency')}
								className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sortBy === 'urgency' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
							>
								Priority
							</button>
							<button
								onClick={() => setSortBy('time')}
								className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sortBy === 'time' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
							>
								Time
							</button>
							<button
								onClick={() => setSortBy('id')}
								className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sortBy === 'id' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
									}`}
							>
								ID
							</button>
						</div>
					</div>

					{/* Search */}
					<div className="mb-6">
						<div className="relative">
							<Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Search by order ID, table, or item..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
							/>
							{query && (
								<button
									onClick={() => setQuery('')}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<X size={18} />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Orders Grid */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
					</div>
				) : filtered.length === 0 ? (
					<EmptyState filter={filter} />
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
						{filtered.map(t => (
							<OrderCard
								key={t.id}
								ticket={t}
								onStart={handleStart}
								onReady={handleReady}
								onComplete={handleComplete}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
	icon: React.ReactNode
	label: string
	value: number
	color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 border-2" style={{ borderColor: '#E5E7EB' }}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
					<p className="text-3xl font-bold" style={{ color }}>{value}</p>
				</div>
				<div style={{ color }}>{icon}</div>
			</div>
		</div>
	)
}

// ============================================
// FILTER BUTTON COMPONENT
// ============================================

interface FilterButtonProps {
	active: boolean
	onClick: () => void
	label: string
	count: number
}

function FilterButton({ active, onClick, label, count }: FilterButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-2 rounded-lg font-semibold transition-all ${active
				? 'bg-orange-500 text-white shadow-md'
				: 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
				}`}
		>
			{label} ({count})
		</button>
	)
}

// ============================================
// ORDER CARD COMPONENT
// ============================================

interface OrderCardProps {
	ticket: ChefOrder
	onStart: (id: number, isOffline?: boolean) => void
	onReady: (id: number, isOffline?: boolean) => void
	onComplete: (id: number, isOffline?: boolean) => void
}

function OrderCard({ ticket: t, onStart, onReady, onComplete }: OrderCardProps) {
	const { useMemo } = React;
	const navigate = useNavigate();
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Pending': return { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' }
			case 'Preparing': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' }
			case 'Ready': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' }
			case 'Served': return { bg: '#E0E7FF', text: '#3730A3', border: '#6366F1' }
			case 'Delivered': return { bg: '#E0E7FF', text: '#3730A3', border: '#6366F1' }
			default: return { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' }
		}
	}

	const statusColor = getStatusColor(t.status)
	// For offline orders, show table number; for online orders, show customer info
	const tableDisplay = t.is_offline
		? (t.is_imported ? 'Imported Order' : `Table ${t.table_number || t.table?.number || 'N/A'}`)
		: (t.table_number || (t.order_type === 'dine_in' ? 'Dine In' : t.customer || t.address) || 'N/A')

	const estimatedPrepTime = useMemo(() => {
		const baseTime = Math.max(5, t.items.length * 5);
		return baseTime;
	}, [t.items.length])

	return (
		<div
			className="bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
			style={{ borderColor: '#FFD700' }}
		>
			<div
				className="p-4 border-b-2 flex items-center justify-between"
				style={{
					borderColor: '#F3F4F6',
					background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)'
				}}
			>
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="text-xl font-bold" style={{ color: '#FF8C00' }}>
							#{t.id}
						</h3>
					</div>
					<div className="flex items-center gap-2 text-sm flex-wrap" style={{ color: '#6B7280' }}>
						<span className="font-semibold">{tableDisplay}</span>
						<span>•</span>
						<span className="flex items-center gap-1">
							<Clock size={14} />
							{timeAgo(t.created_at)}
						</span>
						{t.status === 'Pending' && (
							<>
								<span>•</span>
								<span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#E0F2FE', color: '#0369A1' }}>
									~{estimatedPrepTime} min
								</span>
							</>
						)}
					</div>
				</div>
				<div className="flex flex-col items-end gap-1">
					<span
						className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border-2"
						style={{
							background: statusColor.bg,
							color: statusColor.text,
							borderColor: statusColor.border
						}}
					>
						{t.status}
					</span>
					{t.is_imported && (
						<span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
							Imported
						</span>
					)}
				</div>
			</div>

			<div className="p-4">
				<div className="space-y-2 mb-4">
					{t.items && t.items.length > 0 ? (
						t.items.map((i: any, idx: number) => (
							i.name && i.name.trim() !== '' && i.name !== 'x' ? (
								<div
									key={idx}
									className="flex justify-between items-start p-2 rounded-lg"
									style={{ background: '#F9FAFB' }}
								>
									<div className="flex-1">
										<span className="font-semibold" style={{ color: '#333333' }}>
											{i.quantity} × {i.name}
										</span>
										{i.size && (
											<span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: '#FFF3E0', color: '#FF8C00' }}>
												Size: {i.size}
											</span>
										)}
										{i.notes && (
											<p className="text-xs mt-1 italic" style={{ color: '#6B7280' }}>
												Note: {i.notes}
											</p>
										)}
									</div>
								</div>
							) : null
						))
					) : (
						<p className="text-sm text-gray-500 italic">No items in this order</p>
					)}
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							const cleanOrderId = t.id;
							const path = `/orders/${cleanOrderId}${t.is_offline ? '?isOffline=true' : ''}`;
							navigate(path);
						}}
						className="px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
						style={{
							background: '#FF8C00',
							color: '#FFFFFF',
							cursor: 'pointer',
							border: 'none',
							position: 'relative',
							zIndex: 10
						}}
					>
						<Eye size={16} />
						<span>Details</span>
					</button>
					{t.status === 'Pending' && (
						<ActionButton
							onClick={() => onStart(t.id, t.is_offline)}
							icon={<Play size={16} />}
							label="Start Cooking"
							color="#3B82F6"
							fullWidth
						/>
					)}
					{t.status === 'Preparing' && (
						<ActionButton
							onClick={() => onReady(t.id, t.is_offline)}
							icon={<UtensilsCrossed size={16} />}
							label="Mark Ready"
							color="#10B981"
							fullWidth
						/>
					)}
					{t.status === 'Ready' && (
						<ActionButton
							onClick={() => onComplete(t.id, t.is_offline)}
							icon={<CheckCircle size={16} />}
							label="Complete Order"
							color="#6B7280"
							fullWidth
						/>
					)}
				</div>
			</div>
		</div>
	)
}

// ============================================
// ACTION BUTTON COMPONENT
// ============================================

interface ActionButtonProps {
	onClick: () => void
	icon: React.ReactNode
	label: string
	color: string
	fullWidth?: boolean
}

function ActionButton({ onClick, icon, label, color, fullWidth }: ActionButtonProps) {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg ${fullWidth ? 'flex-1' : ''}`}
			style={{
				background: color,
				color: '#FFFFFF',
				cursor: 'pointer',
				border: 'none'
			}}
		>
			{icon}
			<span>{label}</span>
		</button>
	)
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
	filter: Status
}

function EmptyState({ filter }: EmptyStateProps) {
	const messages: Record<Status, { title: string; description: string }> = {
		all: { title: 'No orders found', description: 'There are no orders matching your search criteria.' },
		new: { title: 'No new orders', description: 'All caught up! No pending orders at the moment.' },
		preparing: { title: 'Nothing preparing', description: 'No orders are currently being prepared.' },
		ready: { title: 'Nothing ready', description: 'No orders are ready for pickup yet.' },
	};

	const message = messages[filter];

	return (
		<div className="flex flex-col items-center justify-center py-16 px-4">
			<ChefHat size={64} className="text-gray-300 mb-4" />
			<h3 className="text-xl font-bold text-gray-700 mb-2">{message.title}</h3>
			<p className="text-gray-500 text-center max-w-md">{message.description}</p>
		</div>
	)
}
