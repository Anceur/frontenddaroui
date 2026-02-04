
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Filter, Printer, Eye, ShoppingCart, Loader2, Search } from 'lucide-react';
import { getOrderHistory, getOrderDetails, type OrderHistoryResponse } from '../../shared/api/cashier';

function ReceiptModal({ order, isOpen, onClose }: { order: any; isOpen: boolean; onClose: () => void }) {
    if (!isOpen || !order) return null;

    const handlePrint = () => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (printWindow) {
            const itemsHtml = (order.items || []).map((item: any) => {
                let name = 'Item';
                let price = '0.00';
                let qty = 1;
                let size = '';

                if (typeof item === 'string') {
                    name = item;
                } else if (item && typeof item === 'object') {
                    name = item.name || item.item?.name || 'Item';
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
                    <td class="item">${name}${size}</td>
                    <td class="price">${price} DA</td>
                </tr>
             `;
            }).join('');

            const customerName = order.loyalCustomer?.name || order.customer || '';
            const customerInfo = customerName ? `<p><strong>Client:</strong> ${customerName}</p>` : '';
            const phoneInfo = order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : '';
            const loyalCustomerInfo = order.loyalCustomer ? `
        <p><strong>⭐ Loyal Customer:</strong> ${order.loyalCustomer.name}</p>
        <p><strong>Loyalty Card:</strong> ${order.loyalCustomer.loyaltyCardNumber || order.loyalCustomer.loyalty_card_number || 'N/A'}</p>
      ` : '';
            const addressInfo = order.address ? `<p><strong>Address:</strong> ${order.address}</p>` : '';
            const tableInfo = order.is_imported ? '<p><strong>Source:</strong> Imported Order</p>' : (order.tableNumber || order.table?.number || order.table) ? `<p><strong>Table:</strong> ${order.tableNumber || order.table?.number || order.table}</p>` : '';
            const typeInfo = order.order_type || order.orderType ? `<p><strong>Type:</strong> ${(order.order_type || order.orderType).charAt(0).toUpperCase() + (order.order_type || order.orderType).slice(1)}</p>` : '';
            const notesHtml = order.notes ? `<div class="notes"><strong>NOTE:</strong> ${order.notes}</div>` : '';

            printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${order.id}</title>
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
            <div class="header"><h1 class="title">RESTAURANT</h1><p class="subtitle">Receipt / Ticket</p></div>
            <div class="info">
                <p><strong>Order:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleString()}</p>
                ${customerInfo}${phoneInfo}${loyalCustomerInfo}${addressInfo}${tableInfo}${typeInfo}
            </div>
            ${notesHtml}
            <table><thead><tr><th class="qty">Qty</th><th class="item">Item</th><th class="price">Price</th></tr></thead><tbody>${itemsHtml}</tbody></table>
            <div class="totals">
                <div class="row"><span>Subtotal</span><span>${Number(order.subtotal || order.total).toFixed(2)} DA</span></div>
                ${order.tax_amount ? `<div class="row"><span>Tax</span><span>${Number(order.tax_amount).toFixed(2)} DA</span></div>` : ''}
                <div class="row grand-total"><span>TOTAL</span><span>${Number(order.total).toFixed(2)} DA</span></div>
            </div>
            <div class="footer"><p>Thank you for your visit!</p><p>See you soon!</p></div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
            printWindow.document.close();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
                <div className="mb-6"><h3 className="text-xl font-bold text-gray-800 text-center">Print Receipt</h3></div>
                <div className="flex flex-col gap-3">
                    <button onClick={handlePrint} className="w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"><Printer size={20} /><span>Print Receipt</span></button>
                    <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200">Close</button>
                </div>
            </div>
        </div>
    );
}

export default function OrdersHistory() {
    const [history, setHistory] = useState<OrderHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [day, setDay] = useState(new Date().getDate().toString());
    const [receiptOrder, setReceiptOrder] = useState<any>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getOrderHistory(year, month, day);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [year, month, day]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handlePrintRequest = async (orderType: 'online' | 'offline', orderId: number) => {
        try {
            // Ideally we fetch full details first to ensure we have items etc
            const order = await getOrderDetails(orderType, orderId);
            setReceiptOrder(order);
        } catch (e) {
            alert('Failed to load order details for printing');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-gray-800">Order History</h2>

                <div className="flex bg-white rounded-lg shadow p-2 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600">Year:</label>
                        <select value={year} onChange={e => setYear(e.target.value)} className="border rounded px-2 py-1">
                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600">Month:</label>
                        <select value={month} onChange={e => setMonth(e.target.value)} className="border rounded px-2 py-1">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'short' })}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-600">Day:</label>
                        <select value={day} onChange={e => setDay(e.target.value)} className="border rounded px-2 py-1">
                            <option value="">All</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <button onClick={fetchHistory} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded flex items-center gap-2">
                        <Search size={16} /> Filter
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>
            ) : (
                <div className="space-y-8">
                    {/* Online Orders */}
                    {history?.online_orders && history.online_orders.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-blue-600 flex items-center gap-2"><ShoppingCart size={20} /> Online Orders ({history.online_orders.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {history.online_orders.map((order: any) => (
                                    <OrderCard key={order.id} order={order} type="online" onPrint={() => handlePrintRequest('online', order.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Offline Orders */}
                    {history?.offline_orders && history.offline_orders.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-amber-600 flex items-center gap-2"><ShoppingCart size={20} /> Offline Orders ({history.offline_orders.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {history.offline_orders.map((order: any) => (
                                    <OrderCard key={order.id} order={order} type="offline" onPrint={() => handlePrintRequest('offline', order.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    {(!history?.online_orders?.length && !history?.offline_orders?.length) && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded shadow">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No orders found for this date.</p>
                        </div>
                    )}
                </div>
            )}

            <ReceiptModal order={receiptOrder} isOpen={!!receiptOrder} onClose={() => setReceiptOrder(null)} />
        </div>
    );
}

function OrderCard({ order, type, onPrint }: { order: any, type: 'online' | 'offline', onPrint: () => void }) {
    return (
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-800">#{order.id}</span>
                <span className={`text-xs px-2 py-1 rounded font-semibold ${order.status === 'Served' || order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{order.status}</span>
            </div>
            <div className="mb-3 text-sm text-gray-600 space-y-1">
                <p>{new Date(order.created_at).toLocaleTimeString()}</p>
                {type === 'online' ? (
                    <p className="font-medium">{order.customer || 'Unknown'}</p>
                ) : (
                    <p className="font-medium">{order.is_imported ? 'Imported' : `Table ${order.table?.number || order.table_id}`}</p>
                )}
                <p className="font-bold text-lg text-orange-600">{Number(order.total).toFixed(2)} DA</p>
            </div>
            <div className="flex gap-2">
                <button onClick={onPrint} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded flex items-center justify-center gap-2 transition-colors">
                    <Printer size={16} /> Print Ticket
                </button>
            </div>
        </div>
    );
}
