import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, CheckCircle, RefreshCw, Loader2, Eye, Printer, X, Star, Package, Edit3, Save, Plus, Minus, Trash2, Search } from 'lucide-react';
import { getPendingOrders, confirmOrder, declineOrder, getOrderDetails, updateOrder, type PendingOrdersResponse } from '../../shared/api/cashier';
import { getMenuItems } from '../../shared/api/menu-items';

interface OrderDetailModalProps {
  order: any;
  orderType: 'online' | 'offline';
  isOpen: boolean;
  onClose: () => void;
  handleConfirm: (orderType: 'online' | 'offline', orderId: number) => void;
  handleDecline: (orderType: 'online' | 'offline', orderId: number) => void;
}

function OrderDetailModal({ order, orderType, isOpen, onClose, handleConfirm, handleDecline }: OrderDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState<any[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingItemForExtras, setPendingItemForExtras] = useState<{ item: any, sizeId?: number } | null>(null);

  // Normalize items for unified editing structure
  const normalizeItems = useCallback((items: any[]) => {
    return items.map(item => {
      const itemId = item.item?.id || item.item_id || item.id;
      const sizeId = item.size?.id || item.size_id || null;
      const name = item.item?.name || item.name || (typeof item === 'string' ? item : 'Article');
      const sizeName = item.size?.size || item.size;
      
      return {
        item_id: itemId,
        size_id: sizeId,
        name: name,
        sizeName: typeof sizeName === 'string' ? sizeName : (sizeName?.size || ''),
        quantity: item.quantity || 1,
        price: Number(item.price || 0),
        notes: item.notes || '',
        extras: item.extras || []
      };
    });
  }, []);

  useEffect(() => {
    if (order && isOpen) {
      setEditItems(normalizeItems(order.items || []));
      setEditNotes(order.notes || '');
      setIsEditing(false);
    }
  }, [order, isOpen, normalizeItems]);

  const toggleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      if (menuItems.length === 0) {
        setLoadingMenu(true);
        try {
          const items = await getMenuItems();
          setMenuItems(items);
        } catch (err) {
          console.error('Error fetching menu items:', err);
        } finally {
          setLoadingMenu(false);
        }
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    const newItems = [...editItems];
    newItems[idx].quantity = Math.max(1, newItems[idx].quantity + delta);
    setEditItems(newItems);
  };

  const handleRemoveItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const handleAddItem = (menuItem: any, sizeId?: number, selectedExtras?: any[]) => {
    // If item has extras and they haven't been selected yet, show modal
    if (menuItem.extras && menuItem.extras.length > 0 && !selectedExtras) {
      setPendingItemForExtras({ item: menuItem, sizeId });
      return;
    }

    const size = sizeId ? menuItem.sizes?.find((s: any) => s.id === sizeId) : null;
    const extrasTotal = selectedExtras ? selectedExtras.reduce((sum, e) => sum + Number(e.price), 0) : 0;
    
    let displayName = menuItem.name;
    if (selectedExtras && selectedExtras.length > 0) {
      const extraNames = selectedExtras.map(e => e.name).join(', ');
      displayName += ` (+ ${extraNames})`;
    }

    const newItem = {
      item_id: menuItem.id,
      size_id: sizeId || null,
      name: displayName,
      sizeName: size ? size.size : '',
      quantity: 1,
      price: (size ? Number(size.price) : Number(menuItem.price)) + extrasTotal,
      notes: '',
      extras: selectedExtras || []
    };
    setEditItems([...editItems, newItem]);
  };

  const handleSave = async () => {
    if (editItems.length === 0) {
      alert('La commande doit contenir au moins un article');
      return;
    }
    
    setSaving(true);
    try {
      await updateOrder(orderType, order.id, {
        items: editItems,
        notes: editNotes
      });
      setIsEditing(false);
      // Success - alert is simple but maybe we should use a toast later
      alert('Commande mise à jour');
      // No need to close, just show updated data (user can confirm now)
      // Actually we should probably trigger a refresh of the order data from parent
      // but the interval might catch it.
      onClose();
    } catch (err: any) {
      alert(err.message || 'Échec de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !order) return null;

  const filteredMenu = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateSubtotal = () => {
    return editItems.reduce((sum, item) => {
      const extrasTotal = (item.extras || []).reduce((eSum: number, e: any) => eSum + Number(e.price || 0), 0);
      return sum + ((Number(item.price) + extrasTotal) * item.quantity);
    }, 0);
  };

  const currentTotal = orderType === 'online'
    ? calculateSubtotal() + Number(order.tax_amount || 100)
    : calculateSubtotal();

  const ExtrasModal = ({ item, sizeId, onClose, onAdd }: any) => {
    const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
    const toggleExtra = (extra: any) => {
      if (selectedExtras.find(e => e.id === extra.id)) {
        setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
      } else {
        setSelectedExtras([...selectedExtras, extra]);
      }
    };
    const totalExtras = selectedExtras.reduce((sum, e) => sum + Number(e.price), 0);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Suppléments pour {item.name}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400" /></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {item.extras.map((extra: any) => (
              <label key={extra.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedExtras.find(e => e.id === extra.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={!!selectedExtras.find(e => e.id === extra.id)} onChange={() => toggleExtra(extra)} className="w-5 h-5 text-orange-600 rounded" />
                  <span className="font-semibold text-gray-700">{extra.name}</span>
                </div>
                <span className="font-bold text-orange-600">+{Number(extra.price).toFixed(2)} DA</span>
              </label>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500 font-bold">Total: {totalExtras.toFixed(2)} DA</div>
            <button onClick={() => onAdd(selectedExtras)} className="px-6 py-2 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">Ajouter</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-50 via-white to-orange-50 p-6 border-b-2 border-gray-100 flex justify-between items-start z-10 shrink-0">
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
                {order.is_imported ? 'Commande Importée' : `Table ${order.table?.number || order.table_id}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={toggleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-200"
              >
                <Edit3 size={18} />
                Modifier
              </button>
            ) : (
              <button
                onClick={toggleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all border border-gray-200"
              >
                Annuler
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className={`grid ${isEditing ? 'grid-cols-1 lg:grid-cols-2 lg:gap-8' : 'grid-cols-1 gap-6'}`}>
            
            {/* Left Column: Order details & Current Items */}
            <div className="space-y-6">
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
                </div>
              )}

              {/* Notes Section */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-700 uppercase font-bold mb-2">Notes Spéciales</p>
                {isEditing ? (
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-white border border-blue-300 rounded-lg p-3 text-gray-800 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Instructions spéciales..."
                    rows={2}
                  />
                ) : (
                  <p className="font-semibold text-gray-800">{order.notes || 'Aucune note'}</p>
                )}
              </div>

              {/* Items List */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-3">Articles de la Commande</p>
                <div className="space-y-3">
                  {editItems.map((item, idx) => (
                    <div key={idx} className={`bg-gray-50 rounded-2xl p-4 transition-all border-2 ${isEditing ? 'border-blue-100 hover:border-blue-300' : 'border-transparent'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                          {item.sizeName && (
                            <span className="inline-block bg-white text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-200 mt-1 mr-2">
                              Taille: {item.sizeName}
                            </span>
                          )}
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {item.extras.map((extra: any, eIdx: number) => (
                                <div key={eIdx} className="flex items-center justify-between">
                                  <span className="inline-block bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full border border-orange-200">
                                    + {extra.name}
                                  </span>
                                  <span className="text-xs text-orange-600 font-semibold">
                                    +{(Number(extra.price) * item.quantity).toFixed(2)} DA
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xl font-black text-orange-600">{(item.price * item.quantity).toFixed(2)} DA</p>
                      </div>

                      {isEditing && (
                        <div className="flex items-center justify-between mt-4 border-t border-blue-100 pt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleUpdateQuantity(idx, -1)}
                              className="p-2 bg-white border-2 border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="text-xl font-bold min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(idx, 1)}
                              className="p-2 bg-white border-2 border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border-2 border-red-100"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 space-y-3 border-2 border-orange-200">
                <div className="flex justify-between items-center text-gray-700">
                  <span className="font-semibold">Sous-total</span>
                  <span className="text-xl font-bold">{calculateSubtotal().toFixed(2)} DA</span>
                </div>
                {orderType === 'online' && Number(order.tax_amount || 0) > 0 && (
                   <div className="flex justify-between items-center text-gray-600">
                    <span className="font-medium">🚚 Livraison</span>
                    <span className="font-bold">{Number(order.tax_amount).toFixed(2)} DA</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-orange-300 text-orange-700">
                  <span className="text-lg font-bold">Total Final</span>
                  <span className="text-2xl font-black">{currentTotal.toFixed(2)} DA</span>
                </div>
              </div>
            </div>

            {/* Right Column: Menu Item Selector (Editing Mode ONLY) */}
            {isEditing && (
              <div className="space-y-6 mt-8 lg:mt-0 lg:border-l lg:pl-8 border-gray-100">
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="text-blue-600" size={20} />
                    Ajouter des Articles
                  </h4>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Rechercher dans le menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-blue-300 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {loadingMenu ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin text-blue-500" />
                      </div>
                    ) : filteredMenu.map(menuItem => (
                      <div key={menuItem.id} className="bg-white border-2 border-gray-50 rounded-2xl p-3 hover:border-blue-100 transition-all shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-800">{menuItem.name}</span>
                          {!menuItem.sizes || menuItem.sizes.length === 0 ? (
                            <button
                              onClick={() => handleAddItem(menuItem)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                            >
                              <Plus size={18} />
                            </button>
                          ) : null}
                        </div>
                        {menuItem.sizes && menuItem.sizes.length > 0 && (
                          <div className="mt-3 space-y-2">
                             {menuItem.sizes.map((size: any) => (
                               <div key={size.id} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg">
                                 <span className="text-sm font-medium text-gray-600">{size.size} - {Number(size.price).toFixed(2)} DA</span>
                                 <button
                                  onClick={() => handleAddItem(menuItem, size.id)}
                                  className="p-1 px-3 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
                                >
                                  + Ajouter
                                </button>
                               </div>
                             ))}
                          </div>
                        )}
                        {!menuItem.sizes || menuItem.sizes.length === 0 ? (
                           <p className="text-sm text-gray-500 mt-1">{Number(menuItem.price).toFixed(2)} DA</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t-2 border-gray-100 bg-gray-50/50 shrink-0">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 active:scale-95"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              Enregistrer les Modifications
            </button>
          ) : (
             <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleDecline(orderType, order.id)}
                  className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                >
                  Refuser
                </button>
                <button
                  onClick={() => handleConfirm(orderType, order.id)}
                  className="py-4 bg-green-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-green-600 shadow-lg shadow-green-500/20"
                >
                  Confirmer la Commande
                </button>
             </div>
          )}
        </div>

        {pendingItemForExtras && (
          <ExtrasModal
            item={pendingItemForExtras.item}
            sizeId={pendingItemForExtras.sizeId}
            onClose={() => setPendingItemForExtras(null)}
            onAdd={(extras: any[]) => {
              handleAddItem(pendingItemForExtras.item, pendingItemForExtras.sizeId, extras);
              setPendingItemForExtras(null);
            }}
          />
        )}
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
          
          if (item.extras && Array.isArray(item.extras) && item.extras.length > 0) {
            item.extras.forEach((e: any) => {
              const extraUnitPrice = Number(e.price || 0);
              const extraTotalPrice = (extraUnitPrice * qty).toFixed(2);
              size += `<br/><small style="color:#d97706">  + ${e.name}: ${extraTotalPrice} DA</small>`;
            });
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
      const customerInfo = customerName ? `<p><strong>Client:</strong> ${customerName}</p>` : '';
      const phoneInfo = order.phone ? `<p><strong>Téléphone:</strong> ${order.phone}</p>` : '';
      const loyalCustomerInfo = order.loyalCustomer ? `
        <p><strong>⭐ Client Fidèle:</strong> ${order.loyalCustomer.name}</p>
        <p><strong>Carte Fidélité:</strong> ${order.loyalCustomer.loyaltyCardNumber || order.loyalCustomer.loyalty_card_number || 'N/A'}</p>
      ` : '';
      const addressInfo = order.address ? `<p><strong>Adresse:</strong> ${order.address}</p>` : '';
      const tableInfo = order.is_imported ? '<p><strong>Source:</strong> Commande Importée</p>' : (order.tableNumber || order.table?.number || order.table) ? `<p><strong>Table:</strong> ${order.tableNumber || order.table?.number || order.table}</p>` : '';
      const typeInfo = order.order_type || order.orderType ? `<p><strong>Type:</strong> ${(order.order_type || order.orderType).charAt(0).toUpperCase() + (order.order_type || order.orderType).slice(1)}</p>` : '';
      const notesHtml = order.notes ? `
            <div class="notes">
                <strong>NOTE:</strong> ${order.notes}
            </div>` : '';

      printWindow.document.write(`
        <html>
          <head>
            <title>Reçu #${order.id}</title>
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
                <p class="subtitle">Reçu / Ticket</p>
            </div>
            <div class="info">
                <p><strong>Commande:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleString('fr-FR')}</p>
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
                ${(() => {
                  // Calculate subtotal from items (includes extras) if order.subtotal is available
                  // Fall back to computing from items in the order
                  const itemsArray = order.items || [];
                  const computedSubtotal = itemsArray.reduce((s: number, it: any) => {
                    if (typeof it === 'string') return s;
                    const unitPrice = Number(it.price || it.item?.price || 0);
                    const qty = Number(it.quantity || 1);
                    const extrasSum = (it.extras && Array.isArray(it.extras))
                      ? it.extras.reduce((es: number, e: any) => es + Number(e.price || 0), 0)
                      : 0;
                    return s + (unitPrice + extrasSum) * qty;
                  }, 0);
                  const subtotalToShow = Number(order.subtotal || computedSubtotal);
                  const livraison = Number(order.tax_amount || 0);
                  const correctTotal = subtotalToShow + livraison;
                  return `
                    <div class="row"><span>Sous-total</span><span>${subtotalToShow.toFixed(2)} DA</span></div>
                    ${livraison > 0 ? `<div class="row"><span>🚚 Livraison</span><span>${livraison.toFixed(2)} DA</span></div>` : ''}
                    <div class="row grand-total"><span>TOTAL</span><span>${correctTotal.toFixed(2)} DA</span></div>
                  `;
                })()}
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

          <h3 className="text-3xl font-bold text-gray-800 mb-2">Commande Confirmée !</h3>
          <p className="text-green-700 font-semibold">La commande a été confirmée avec succès et envoyée à la cuisine.</p>
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
            <span className="text-lg">Imprimer le Reçu</span>
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
            Le reçu peut être imprimé ou consulté plus tard dans l'historique des commandes
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
      setError(err.message || 'Échec du chargement des commandes en attente');
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
    if (!window.confirm(`Êtes-vous sûr de vouloir confirmer cette commande ${orderType === 'online' ? 'en ligne' : 'sur place'} ?`)) {
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
    const reason = window.prompt(`Êtes-vous sûr de vouloir REFUSER cette commande ${orderType === 'online' ? 'en ligne' : 'sur place'} ?\nVeuillez entrer une raison :`, 'Refusée par le caissier');

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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">Commandes en Attente</h2>
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
          <h3 className="text-3xl font-bold text-gray-800 mb-3">Tout est en ordre !</h3>
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
                  Commandes en Ligne ({pendingOrders.online_orders.length})
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
                            <p className="text-xs text-gray-500 font-semibold">Carte: {order.loyalCustomer.loyaltyCardNumber}</p>
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
                          <p className="text-sm text-gray-600"><span className="font-semibold">Client:</span> {order.customer}</p>
                          <p className="text-sm text-gray-600"><span className="font-semibold">Téléphone:</span> {order.phone}</p>
                        </>
                      )}
                      <p className="text-sm text-gray-600"><span className="font-semibold">Type:</span> {order.order_type || order.orderType || 'N/A'}</p>
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
                  Commandes sur Place ({pendingOrders.offline_orders.length})
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
                        <span className="font-semibold">Source:</span> {order.is_imported ? 'Commande Importée' : `Table ${order.table?.number || order.table_id}`}
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
          handleConfirm={handleConfirm}
          handleDecline={handleDecline}
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