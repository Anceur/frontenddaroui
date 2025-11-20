import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, CheckCircle, RefreshCw, Loader2, Eye, AlertCircle } from 'lucide-react';
import { getPendingOrders, confirmOrder, getOrderDetails, type PendingOrdersResponse } from '../../shared/api/cashier';

interface OrderDetailModalProps {
  order: any;
  orderType: 'online' | 'offline';
  isOpen: boolean;
  onClose: () => void;
}

function OrderDetailModal({ order, orderType, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              Order #{order.id} {orderType === 'offline' && `- Table ${order.table?.number || order.table_id}`}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {orderType === 'online' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{order.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{order.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold">{order.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Type</p>
                  <p className="font-semibold capitalize">{order.order_type || order.orderType}</p>
                </div>
                {order.table_number && (
                  <div>
                    <p className="text-sm text-gray-600">Table Number</p>
                    <p className="font-semibold">{order.table_number}</p>
                  </div>
                )}
              </>
            )}

            {orderType === 'offline' && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Table</p>
                  <p className="font-semibold">Table {order.table?.number || order.table_id}</p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-semibold">{order.notes}</p>
                  </div>
                )}
              </>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Items</p>
              <div className="space-y-2">
                {orderType === 'online' && order.items && Array.isArray(order.items) ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{item.name || item}</p>
                      {item.quantity && <p className="text-sm text-gray-600">Qty: {item.quantity}</p>}
                      {item.price && <p className="text-sm text-gray-600">Price: {Number(item.price).toFixed(2)} DA</p>}
                    </div>
                  ))
                ) : orderType === 'offline' && order.items && Array.isArray(order.items) ? (
                  order.items.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="font-semibold">{item.item?.name || item.name}</p>
                      {item.size && <p className="text-sm text-gray-600">Size: {item.size.size || item.size}</p>}
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: {Number(item.price).toFixed(2)} DA</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items found</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-orange-600">
                {Number(order.total).toFixed(2)} DA
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold capitalize">{order.status}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-semibold">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PendingOrders() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{ order: any; type: 'online' | 'offline' } | null>(null);
  const [confirming, setConfirming] = useState<{ type: 'online' | 'offline'; id: number } | null>(null);

  const fetchPendingOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await getPendingOrders();
      setPendingOrders(data);
    } catch (err: any) {
      console.error('Error fetching pending orders:', err);
      setError(err.message || 'Failed to load pending orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingOrders();
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchPendingOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const handleConfirm = async (orderType: 'online' | 'offline', orderId: number) => {
    if (!window.confirm(`Are you sure you want to confirm this ${orderType} order?`)) {
      return;
    }

    setConfirming({ type: orderType, id: orderId });
    try {
      await confirmOrder(orderType, orderId);
      // Refresh the list
      await fetchPendingOrders();
      alert('Order confirmed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to confirm order');
    } finally {
      setConfirming(null);
    }
  };

  const handleViewDetails = async (orderType: 'online' | 'offline', orderId: number) => {
    try {
      const order = await getOrderDetails(orderType, orderId);
      setSelectedOrder({ order, type: orderType });
    } catch (err: any) {
      alert(err.message || 'Failed to load order details');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingOrders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const totalPending = pendingOrders?.total_pending || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Pending Orders</h2>
          <p className="text-gray-600 mt-1">
            {totalPending} {totalPending === 1 ? 'order' : 'orders'} waiting for confirmation
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {totalPending === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Pending Orders</h3>
          <p className="text-gray-600">All orders have been confirmed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Online Orders */}
          {pendingOrders?.online_orders && pendingOrders.online_orders.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6" />
                <span>Online Orders ({pendingOrders.online_orders.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.online_orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-800">Order #{order.id}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Customer:</span> {order.customer}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Phone:</span> {order.phone}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Type:</span> {order.order_type || order.orderType || 'N/A'}
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        {Number(order.total).toFixed(2)} DA
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails('online', order.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleConfirm('online', order.id)}
                        disabled={confirming?.type === 'online' && confirming.id === order.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {confirming?.type === 'online' && confirming.id === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Confirm</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Orders */}
          {pendingOrders?.offline_orders && pendingOrders.offline_orders.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6" />
                <span>Offline Orders ({pendingOrders.offline_orders.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.offline_orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-800">
                        Order #{order.id}
                      </h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold">
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Table:</span> {order.table?.number || order.table_id}
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        {Number(order.total).toFixed(2)} DA
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails('offline', order.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleConfirm('offline', order.id)}
                        disabled={confirming?.type === 'offline' && confirming.id === order.id}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {confirming?.type === 'offline' && confirming.id === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Confirm</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder.order}
          orderType={selectedOrder.type}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}


