import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, ChefHat, Clock, MapPin, Phone, User, Loader2, AlertCircle, X, Ruler } from 'lucide-react';
import { getOrderDetails, type OrderDetails } from '../api/chef-api';

export default function OrderDetails() {
	const { orderId } = useParams<{ orderId: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const isOffline = queryParams.get('isOffline') === 'true';
	const [order, setOrder] = useState<OrderDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Debug: Log when component mounts
	useEffect(() => {
	}, [orderId]);

	const fetchOrderDetails = useCallback(async () => {
		if (!orderId) return;

		try {
			setError(null);
			setLoading(true);
			// Clean order ID - remove any # prefix
			const cleanOrderId = orderId.replace('#', '');
			const data = await getOrderDetails(cleanOrderId, isOffline);
			setOrder(data);
		} catch (err: any) {
			setError(err.message || 'Failed to fetch order details');
			console.error('Error fetching order details:', err);
		} finally {
			setLoading(false);
		}
	}, [orderId]);

	useEffect(() => {
		fetchOrderDetails();
	}, [fetchOrderDetails]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Pending': return { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6' };
			case 'Preparing': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
			case 'Ready': return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
			case 'Delivered': return { bg: '#E5E7EB', text: '#374151', border: '#9CA3AF' };
			default: return { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' };
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
				<div className="text-center">
					<Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: '#FF8C00' }} />
					<p className="text-lg font-semibold" style={{ color: '#333333' }}>Loading order details...</p>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
				<div className="max-w-4xl mx-auto px-4 py-6">
					<button
						onClick={() => navigate('/orders')}
						className="mb-4 flex items-center gap-2 text-sm font-medium hover:underline"
						style={{ color: '#FF8C00' }}
					>
						<ArrowLeft size={18} /> Back to Orders
					</button>
					<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
						<AlertCircle size={48} className="mx-auto mb-4 text-red-600" />
						<h2 className="text-xl font-bold mb-2 text-red-800">Error</h2>
						<p className="text-red-600">{error || 'Order not found'}</p>
					</div>
				</div>
			</div>
		);
	}

	const statusColor = getStatusColor(order.status);
	const isImportedOrder = (order as any).is_imported || order.customer === 'Imported Order';
	const tableDisplay = isImportedOrder ? 'Imported Order' : (order.table_number || (order.order_type === 'dine_in' ? 'Dine In' : order.address) || 'N/A');

	return (
		<div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)' }}>
			<div className="max-w-5xl mx-auto px-4 py-6">
				{/* Header */}
				<div className="mb-6">
					<button
						onClick={() => navigate('/orders')}
						className="mb-4 flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
						style={{ color: '#FF8C00' }}
					>
						<ArrowLeft size={18} /> Back to Orders
					</button>

					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold mb-1" style={{ color: '#FF8C00' }}>
								Order #{order.id}
							</h1>
							<p className="text-sm" style={{ color: '#999999' }}>
								{formatDate(order.created_at)}
							</p>
						</div>
						<div className="flex flex-col items-end gap-2">
							<span
								className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border-2"
								style={{
									background: statusColor.bg,
									color: statusColor.text,
									borderColor: statusColor.border
								}}
							>
								{order.status}
							</span>
							{isImportedOrder && (
								<span className="px-3 py-1 rounded text-xs font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
									Imported
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Order Info */}
				<div className="bg-white rounded-xl shadow-md border-2 p-6 mb-6" style={{ borderColor: '#FFD700' }}>
					<h2 className="text-xl font-bold mb-4" style={{ color: '#FF8C00' }}>Order Information</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-3">
							<User size={20} style={{ color: '#FF8C00' }} />
							<div>
								<p className="text-xs" style={{ color: '#999999' }}>Customer</p>
								<p className="font-semibold" style={{ color: '#333333' }}>{order.customer}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Phone size={20} style={{ color: '#FF8C00' }} />
							<div>
								<p className="text-xs" style={{ color: '#999999' }}>Phone</p>
								<p className="font-semibold" style={{ color: '#333333' }}>{order.phone}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<MapPin size={20} style={{ color: '#FF8C00' }} />
							<div>
								<p className="text-xs" style={{ color: '#999999' }}>Location</p>
								<p className="font-semibold" style={{ color: '#333333' }}>{tableDisplay}</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<Clock size={20} style={{ color: '#FF8C00' }} />
							<div>
								<p className="text-xs" style={{ color: '#999999' }}>Order Type</p>
								<p className="font-semibold capitalize" style={{ color: '#333333' }}>
									{order.order_type ? order.order_type.replace('_', ' ') : 'N/A'}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Order Items */}
				<div className="bg-white rounded-xl shadow-md border-2 p-6" style={{ borderColor: '#FFD700' }}>
					<div className="flex items-center gap-3 mb-6">
						<ChefHat size={24} style={{ color: '#FF8C00' }} />
						<h2 className="text-xl font-bold" style={{ color: '#FF8C00' }}>Menu Items & Ingredients</h2>
					</div>

					{order.items.length === 0 ? (
						<div className="text-center py-8">
							<Package size={48} className="mx-auto mb-3 opacity-50" style={{ color: '#999999' }} />
							<p className="text-gray-500">No items in this order</p>
						</div>
					) : (
						<div className="space-y-4">
							{order.items.map((item) => (
								<div
									key={item.id}
									className="border-2 rounded-lg p-4 transition-all hover:shadow-md"
									style={{ borderColor: '#FFD700' }}
								>
									{/* Item Header */}
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-lg font-bold" style={{ color: '#333333' }}>
													{item.item.name}
												</h3>
												{item.size && (
													<span
														className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1"
														style={{ background: '#FFF3E0', color: '#FF8C00' }}
													>
														<Ruler size={14} />
														Size: {item.size.size}
													</span>
												)}
											</div>
											<p className="text-sm font-semibold" style={{ color: '#FF8C00' }}>
												Quantity: {item.quantity}
											</p>
										</div>
									</div>

									{/* Ingredients */}
									{item.ingredients && item.ingredients.length > 0 ? (
										<div className="mt-4 pt-4 border-t" style={{ borderColor: '#FFD700' }}>
											<h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#666666' }}>
												<Package size={16} />
												Ingredients for {item.quantity} × {item.item.name} {item.size ? `(${item.size.size})` : ''}:
											</h4>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
												{item.ingredients.map((ing, idx) => {
													// Calculate total quantity needed (ingredient quantity × order item quantity)
													const totalQuantity = (ing.quantity * item.quantity).toFixed(2);
													return (
														<div
															key={idx}
															className="p-3 rounded-lg border"
															style={{
																background: '#FFFAF0',
																borderColor: '#FFD700'
															}}
														>
															<p className="font-semibold text-sm mb-1" style={{ color: '#333333' }}>
																{ing.ingredient.name}
															</p>
															<p className="text-xs" style={{ color: '#666666' }}>
																{ing.quantity} {ing.ingredient.unit} per item
															</p>
															<p className="text-sm font-bold mt-1" style={{ color: '#FF8C00' }}>
																Total: {totalQuantity} {ing.ingredient.unit}
															</p>
														</div>
													);
												})}
											</div>
										</div>
									) : (
										<div className="mt-4 pt-4 border-t text-center" style={{ borderColor: '#FFD700' }}>
											<p className="text-sm text-gray-500 italic">
												{item.size
													? `No ingredients configured for ${item.item.name} (${item.size.size})`
													: `No ingredients configured for ${item.item.name}. Please select a size to see ingredients.`
												}
											</p>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

