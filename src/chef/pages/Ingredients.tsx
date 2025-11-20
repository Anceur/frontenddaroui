import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { Package, AlertTriangle, CheckCircle2, Loader2, RefreshCw, X, Search, TrendingDown } from 'lucide-react'
import { getChefIngredients, type ChefIngredient } from '../api/chef-api'

export default function Ingredients() {
	const [ingredients, setIngredients] = useState<ChefIngredient[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [refreshing, setRefreshing] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [sortBy, setSortBy] = useState<'name' | 'stock' | 'status'>('name')

	// Fetch ingredients
	const fetchIngredients = useCallback(async () => {
		try {
			setError(null);
			const data = await getChefIngredients();
			setIngredients(data);
		} catch (err: any) {
			setError(err.message || 'Failed to fetch ingredients');
			console.error('Error fetching ingredients:', err);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, []);

	useEffect(() => {
		fetchIngredients();
	}, [fetchIngredients]);

	// Handle refresh
	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchIngredients();
	}

	// Filter and sort ingredients
	const filteredIngredients = useMemo(() => {
		let result = ingredients.filter(i => {
			if (!searchQuery.trim()) return true;
			const query = searchQuery.toLowerCase();
			return i.name.toLowerCase().includes(query) || i.unit.toLowerCase().includes(query);
		});

		// Sort
		result = [...result].sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.name.localeCompare(b.name);
				case 'stock':
					return Number(b.stock) - Number(a.stock);
				case 'status':
					if (a.is_low_stock !== b.is_low_stock) {
						return a.is_low_stock ? -1 : 1; // Low stock first
					}
					return a.name.localeCompare(b.name);
				default:
					return 0;
			}
		});

		return result;
	}, [ingredients, searchQuery, sortBy]);

	// Calculate stats
	const lowStockCount = filteredIngredients.filter(i => i.is_low_stock).length
	const totalIngredients = filteredIngredients.length

	return (
		<div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
			<div className="max-w-6xl mx-auto px-4 py-6">
				
				{/* Header Section */}
				<div className="flex items-center justify-between mb-5">
					<div>
						<h1 className="text-2xl font-semibold mb-1" style={{ color: '#FF8C00' }}>Ingredients</h1>
						<p className="text-sm" style={{ color: '#999999' }}>Stock overview and inventory management</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={handleRefresh}
							disabled={refreshing || loading}
							className="p-2 rounded-lg border transition-all hover:bg-gray-50 disabled:opacity-50"
							style={{ borderColor: '#FFD700' }}
						>
							<RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
						</button>
						<div className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border" style={{ borderColor: '#FFD700', background: '#FFFFFF' }}>
							<Package size={18} style={{ color: '#FF8C00' }} />
							<span style={{ color: '#6B7280' }}>{totalIngredients} ingredients</span>
							{lowStockCount > 0 && (
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: '#FEE2E2', color: '#DC2626' }}>
									{lowStockCount} low stock
								</span>
							)}
						</div>
					</div>
				</div>

					{/* Error Message */}
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
							<AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
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

					{/* Search and Sort */}
					<div className="mb-4 flex flex-col sm:flex-row gap-3">
						<div className="relative flex-1">
							<Search 
								size={18} 
								className="absolute left-3 top-1/2 transform -translate-y-1/2" 
								style={{ color: '#999999' }}
							/>
							<input
								type="text"
								placeholder="Search ingredients..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-2 rounded-lg border-2 focus:outline-none transition-all"
								style={{ 
									borderColor: searchQuery ? '#FF8C00' : '#FFD700',
									background: '#FFFFFF'
								}}
							/>
						</div>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as 'name' | 'stock' | 'status')}
							className="px-4 py-2 rounded-lg border-2 focus:outline-none"
							style={{ borderColor: '#FFD700', background: '#FFFFFF' }}
						>
							<option value="name">Sort by Name</option>
							<option value="stock">Sort by Stock</option>
							<option value="status">Sort by Status</option>
						</select>
					</div>

				{/* Ingredients Table */}
				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
					</div>
				) : (
					<div className="bg-white rounded-xl shadow-sm border-2" style={{ borderColor: '#FFD700' }}>
						<div className="grid grid-cols-12 px-4 py-3 border-b-2 font-semibold" style={{ borderColor: '#F3F4F6', background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)' }}>
							<div className="col-span-6" style={{ color: '#6B7280' }}>Ingredient</div>
							<div className="col-span-2 text-right" style={{ color: '#6B7280' }}>Stock</div>
							<div className="col-span-2 text-right" style={{ color: '#6B7280' }}>Reorder</div>
							<div className="col-span-2 text-right" style={{ color: '#6B7280' }}>Status</div>
						</div>
						<div>
							{filteredIngredients.length === 0 ? (
								<div className="px-4 py-8 text-center text-gray-500">
									<Package size={48} className="mx-auto mb-2 opacity-50" />
									<p>{searchQuery ? 'No ingredients found matching your search' : 'No ingredients found'}</p>
								</div>
							) : (
								filteredIngredients.map((it) => {
									const low = it.is_low_stock
									return (
										<div key={it.id} className="grid grid-cols-12 px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#F3F4F6' }}>
											<div className="col-span-6">
												<p className="font-medium" style={{ color: '#111827' }}>{it.name}</p>
												<p className="text-xs" style={{ color: '#6B7280' }}>Unit: {it.unit}</p>
											</div>
											<div className="col-span-2 text-right">
												<div className="font-semibold mb-1" style={{ color: '#111827' }}>{Number(it.stock).toFixed(2)} {it.unit}</div>
												{/* Progress bar */}
												<div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
													<div
														className="h-full rounded-full transition-all"
														style={{
															width: `${Math.min(100, (Number(it.stock) / Number(it.reorder_level)) * 100)}%`,
															background: it.is_low_stock ? 'linear-gradient(90deg, #EF4444, #DC2626)' : 'linear-gradient(90deg, #10B981, #059669)'
														}}
													/>
												</div>
											</div>
											<div className="col-span-2 text-right" style={{ color: '#6B7280' }}>
												<div>{Number(it.reorder_level).toFixed(2)} {it.unit}</div>
												<div className="text-xs mt-1" style={{ color: '#999999' }}>
													{it.is_low_stock && (
														<span className="flex items-center justify-end gap-1 text-red-600">
															<TrendingDown size={12} />
															Low
														</span>
													)}
												</div>
											</div>
											<div className="col-span-2 text-right">
												{low ? (
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
														<AlertTriangle size={12} /> Low
													</span>
												) : (
													<span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold" style={{ background: '#E5F9EF', color: '#065F46' }}>
														<CheckCircle2 size={12} /> OK
													</span>
												)}
											</div>
										</div>
									)
								})
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
