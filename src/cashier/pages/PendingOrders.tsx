import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, CheckCircle, RefreshCw, Loader2, Eye, Printer, X, Star, Package } from 'lucide-react';
import { getPendingOrders, confirmOrder, declineOrder, getOrderDetails, type PendingOrdersResponse } from '../../shared/api/cashier';

interface OrderDetailModalProps {
  order: any;
  orderType: 'online' | 'offline';
  isOpen: boolean;
  onClose: () => void;
}

function OrderDetailModal({ order, orderType, isOpen, onClose }: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 via-white to-orange-50 p-6 border-b-2 border-gray-100 flex justify-between items-start z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package size={20} className="text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Commande #{order.id}
              </h3>
            </div>
            {orderType === 'offline' && (
              <p className="text-sm text-gray-500 font-medium">
                 {order.is_imported ? 'Commande importée' : `Table ${order.table?.number || order.table_id}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Customer Info (Online Orders) */}
          {orderType === 'online' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Client</p>
                  <p className="font-semibold text-gray-800">{order.customer}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-800">{order.phone}</p>
              </div>
              {order.address && (
                <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Adresse</p>
                    <p className="font-semibold text-gray-800">{order.address}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Type de commande</p>
                  <p className="font-semibold text-gray-800 capitalize">{order.order_type || order.orderType}</p>
              </div>
              {order.table_number && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Numéro de table</p>
                    <p className="font-semibold text-gray-800">{order.table_number}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-xs text-blue-700 uppercase font-bold mb-2">Special Notes</p>
                <p className="font-semibold text-gray-800">{order.notes}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold mb-3">Order Items</p>
            <div className="space-y-2">
              {orderType === 'online' && order.items && Array.isArray(order.items) ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{item.name || item}</p>
                        {item.quantity && <p className="text-sm text-gray-600">Qté: {item.quantity}</p>}
                    </div>
                    {item.price && <p className="text-lg font-bold text-orange-600">{Number(item.price).toFixed(2)} DA</p>}
                  </div>
                ))
              ) : orderType === 'offline' && order.items && Array.isArray(order.items) ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{item.item?.name || item.name}</p>
                      <div className="flex gap-3 mt-1">
                          {item.size && <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">Taille: {item.size.size || item.size}</p>}
                          <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded">Qté: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-orange-600">{Number(item.price).toFixed(2)} DA</p>
                  </div>
                ))
              ) : (
                  <p className="text-gray-500 text-center py-4">Aucun article trouvé</p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 space-y-3 border-2 border-orange-200">
            {orderType === 'online' ? (
              <>
                <div className="flex justify-between items-center text-gray-700">
                    <span className="font-semibold">Sous-total (HT)</span>
                  <span className="text-xl font-bold">{Number(order.subtotal || (Number(order.total) - Number(order.tax_amount || 0))).toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">Taxe</span>
                  <span className="font-bold">{Number(order.tax_amount || 0).toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-orange-300 text-orange-700">
                    <span className="text-lg font-bold">Total (TTC)</span>
                  <span className="text-2xl font-bold">{Number(order.total).toFixed(2)} DA</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-orange-700">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">{Number(order.total).toFixed(2)} DA</span>
              </div>
            )}
          </div>

          {/* Status & Timestamp */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                <p className="font-semibold capitalize text-gray-800">{order.status}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1">Created At</p>
                <p className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ order, isOpen, onClose }: { order: any; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      const itemsHtml = (order.items || []).map((item: any) => {
        let name = 'Article';
        let price = '0.00';
        let qty = 1;
        let size = '';

        if (typeof item === 'string') {
          name = item;
        } else if (item && typeof item === 'object') {
          name = item.name || item.item?.name || 'Article';
          qty = Number(item.quantity || 1);
          let unitPrice = 0;
          if (item.price !== undefined && item.price !== null) {
            unitPrice = Number(item.price);
          } else if (item.item?.price !== undefined) {
            unitPrice = Number(item.item.price);
          }
          const totalPrice = unitPrice * qty;
          price = totalPrice.toFixed(2);
          if (item.size) {
            size = typeof item.size === 'string'
              ? `<br/><small>(${item.size})</small>`
              : item.size.size
                ? `<br/><small>(${item.size.size})</small>`
                : '';
          }
        }

        return `
                <tr>
                    <td class="qty">${qty}</td>
                    <td class="item">
                        ${name}
                        ${size}
                    </td>
                    <td class="price">${price} DA</td>
                </tr>
             `;
      }).join('');

      const customerName = order.loyalCustomer?.name || order.customer || '';
      const customerInfo = customerName ? `<p><strong>Client :</strong> ${customerName}</p>` : '';
      const phoneInfo = order.phone ? `<p><strong>Téléphone :</strong> ${order.phone}</p>` : '';
      const loyalCustomerInfo = order.loyalCustomer ? `
        <p><strong>⭐ Client fidèle :</strong> ${order.loyalCustomer.name}</p>
        <p><strong>Carte de fidélité :</strong> ${order.loyalCustomer.loyaltyCardNumber || order.loyalCustomer.loyalty_card_number || 'N/A'}</p>
      ` : '';
      const addressInfo = order.address ? `<p><strong>Adresse :</strong> ${order.address}</p>` : '';
      const tableInfo = order.is_imported ? '<p><strong>Source :</strong> commande importée</p>' : (order.tableNumber || order.table?.number || order.table) ? `<p><strong>Table :</strong> ${order.tableNumber || order.table?.number || order.table}</p>` : '';
      const typeInfo = order.order_type || order.orderType ? `<p><strong>Type :</strong> ${(order.order_type || order.orderType).charAt(0).toUpperCase() + (order.order_type || order.orderType).slice(1)}</p>` : '';
      const notesHtml = order.notes ? `
            <div class="notes">
                <strong>REMARQUE :</strong> ${order.notes}
            </div>` : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket #${order.id}</title>
            <style>
              @page { margin: 0; }
              body { font-family: 'Courier New', monospace; padding: 20px; width: 300px; margin: 0 auto; color: #000; }
              .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 15px; }
              .title { font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; }
              .subtitle { font-size: 14px; margin: 5px 0; }
              .info { font-size: 12px; margin-bottom: 15px; }
              .info p { margin: 2px 0; }
              .notes { background: #eee; padding: 8px; margin-bottom: 15px; font-size: 14px; font-weight: bold; border: 2px solid #000; text-align: center; }
              table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px; }
              th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
              td { padding: 5px 0; vertical-align: top; }
              .qty { width: 30px; font-weight: bold; text-align: center; }
              .price { text-align: right; white-space: nowrap; }
              .totals { border-top: 2px dashed #000; padding-top: 10px; margin-bottom: 20px; }
              .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 14px; }
              .grand-total { font-weight: bold; font-size: 18px; margin-top: 5px; }
              .footer { text-align: center; font-size: 12px; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
                <h1 class="title">RESTAURANT</h1>
                <p class="subtitle">Ticket / Reçu</p>
            </div>
            <div class="info">
                <p><strong>Commande :</strong> ${order.id}</p>
                <p><strong>Date :</strong> ${new Date(order.created_at || Date.now()).toLocaleString()}</p>
                ${customerInfo}
                ${phoneInfo}
                ${loyalCustomerInfo}
                ${addressInfo}
                ${tableInfo}
                ${typeInfo}
            </div>
            ${notesHtml}
            <table>
                <thead>
                    <tr>
                    <th class="qty">Qté</th>
                    <th class="item">Article</th>
                    <th class="price">Prix</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
            </table>
            <div class="totals">
                ${order.tax_amount ? `
                <div class="row">
                  <span>Sous-total</span>
                  <span>${Number(order.subtotal || order.total).toFixed(2)} DA</span>
                </div>
                <div class="row">
                  <span>Taxe</span>
                  <span>${Number(order.tax_amount).toFixed(2)} DA</span>
                </div>
                ` : ''}
                <div class="row grand-total">
                  <span>TOTAL</span>
                  <span>${Number(order.total).toFixed(2)} DA</span>
                </div>
            </div>
            <div class="footer">
                <p>Merci pour votre visite !</p>
                <p>À bientôt !</p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-green-100 animate-in zoom-in duration-300">
        {/* Success Header with Gradient */}
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8 text-center relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -translate-y-16 translate-x-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full translate-y-16 -translate-x-16 blur-3xl"></div>

          {/* Animated Success Icon */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-green-500/40 animate-in zoom-in duration-500 delay-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={3} />
              </div>
            </div>
            {/* Animated ring */}
            <div className="absolute inset-0 w-24 h-24 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-green-300 animate-ping opacity-20"></div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-gray-800 mb-2">Commande confirmée !</h3>
          <p className="text-green-700 font-semibold">La commande a été confirmée avec succès et envoyée en cuisine.</p>
        </div>

        {/* Buttons Section */}
        <div className="p-8 space-y-3">
          {/* Print Receipt Button */}
          <button
            onClick={handlePrint}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 hover:from-blue-700 hover:to-blue-800 transition-all font-bold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 group"
          >
            <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all">
              <Printer size={20} strokeWidth={2.5} />
            </div>
            <span className="text-lg">Imprimer le reçu</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl hover:bg-gray-200 transition-all font-semibold text-lg border-2 border-gray-200 hover:border-gray-300"
          >
            Fermer
          </button>

          {/* Info Text */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Le reçu peut être imprimé ou consulté ultérieurement dans l'historique des commandes
          </p>
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
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const fetchPendingOrders = useCallback(async () => {
    try {
      setError(null);
      const data = await getPendingOrders();
      setPendingOrders(data);
      } catch (err: any) {
        console.error('Error fetching pending orders:', err);
        setError(err.message || 'Échec du chargement des commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchPendingOrders]);

  const handleConfirm = async (orderType: 'online' | 'offline', orderId: number) => {
    if (!window.confirm(`Confirmer cette commande ${orderType} ?`)) {
      return;
    }

    setConfirming({ type: orderType, id: orderId });
    try {
      const response = await confirmOrder(orderType, orderId);
      await fetchPendingOrders();
      setReceiptOrder(response.order);
    } catch (err: any) {
      alert(err.message || 'Échec de la confirmation de la commande');
    }
  };

  const handleDecline = async (orderType: 'online' | 'offline', orderId: number) => {
    const reason = window.prompt(`Voulez-vous REFUSER cette commande ${orderType} ?\nVeuillez saisir un motif :`, 'Refusée par le caissier');

    if (reason === null) return;

    setConfirming({ type: orderType, id: orderId });
    try {
      await declineOrder(orderType, orderId, reason);
      await fetchPendingOrders();
    } catch (err: any) {
      alert(err.message || 'Échec du refus de la commande');
    } finally {
      setConfirming(null);
    }
  };

  const handleViewDetails = async (orderType: 'online' | 'offline', orderId: number) => {
    try {
      const order = await getOrderDetails(orderType, orderId);
      setSelectedOrder({ order, type: orderType });
    } catch (err: any) {
      alert(err.message || 'Échec du chargement des détails de la commande');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPendingOrders();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  const totalPending = pendingOrders?.total_pending || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/20 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">Commandes en attente</h2>
            <p className="text-gray-500 font-medium mt-1">
              {totalPending} {totalPending === 1 ? 'commande' : 'commandes'} en attente de confirmation
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-orange-100 rounded-xl font-bold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all shadow-sm disabled:opacity-50 group"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
          <X className="w-5 h-5 shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {totalPending === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-16 text-center border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2.5} />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Aucune commande en attente</h3>
          <p className="text-gray-600 font-medium text-lg">Toutes les commandes ont été confirmées.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Online Orders */}
          {pendingOrders?.online_orders && pendingOrders.online_orders.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Commandes en ligne ({pendingOrders.online_orders.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.online_orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-blue-200">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        {order.loyalCustomer ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Star size={20} className="text-yellow-500 fill-yellow-500" />
                              <h4 className="text-lg font-bold text-orange-600">{order.loyalCustomer.name}</h4>
                            </div>
                            <p className="text-xs text-gray-500 font-semibold">Carte : {order.loyalCustomer.loyaltyCardNumber}</p>
                            <p className="text-xs text-gray-400">Commande #{order.id}</p>
                          </div>
                        ) : (
                          <h4 className="text-lg font-bold text-gray-800">Commande #{order.id}</h4>
                        )}
                      </div>
                      <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">
                        {order.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {!order.loyalCustomer && (
                        <>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Client :</span> {order.customer}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Téléphone :</span> {order.phone}</p>
                        </>
                      )}
                      <p className="text-sm text-gray-600"><span className="font-semibold">Type :</span> {order.order_type || order.orderType || 'N/A'}</p>
                      {order.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mt-2">
                          <p className="text-xs font-semibold text-blue-900">{order.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="bg-orange-50 rounded-xl p-3 mb-4">
                      <p className="text-2xl font-bold text-orange-600">
                        {Number(order.subtotal || order.total).toFixed(2)} DA
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails('online', order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </button>
                      <button
                        onClick={() => handleDecline('online', order.id)}
                        disabled={confirming?.type === 'online' && confirming.id === order.id}
                        className="w-12 flex items-center justify-center bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-semibold disabled:opacity-50"
                        title="Refuser"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleConfirm('online', order.id)}
                        disabled={confirming?.type === 'online' && confirming.id === order.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold disabled:opacity-50"
                      >
                        {confirming?.type === 'online' && confirming.id === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Confirmer</span>
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
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Commandes hors ligne ({pendingOrders.offline_orders.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingOrders.offline_orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-purple-200">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-bold text-gray-800">Commande #{order.id}</h4>
                      <div className="flex flex-col gap-1 items-end">
                        {order.is_imported && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            Importée
                          </span>
                        )}
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Source :</span> {order.is_imported ? 'Commande importée' : `Table ${order.table?.number || order.table_id}`}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="bg-orange-50 rounded-xl p-3 mb-4">
                      <p className="text-2xl font-bold text-orange-600">
                        {Number(order.subtotal || order.total).toFixed(2)} DA
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails('offline', order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Voir</span>
                      </button>
                      <button
                        onClick={() => handleDecline('offline', order.id)}
                        disabled={confirming?.type === 'offline' && confirming.id === order.id}
                        className="w-12 flex items-center justify-center bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all font-semibold disabled:opacity-50"
                        title="Refuser"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleConfirm('offline', order.id)}
                        disabled={confirming?.type === 'offline' && confirming.id === order.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all font-semibold disabled:opacity-50"
                      >
                        {confirming?.type === 'offline' && confirming.id === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Confirmer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder.order}
          orderType={selectedOrder.type}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {receiptOrder && (
        <ReceiptModal
          order={receiptOrder}
          isOpen={true}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </div>
  );
}
