import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Loader2, CheckCircle, User, Phone, MapPin, Truck, ShoppingBag } from 'lucide-react';
import { createManualOnlineOrder, type ManualOnlineOrderData } from '../../shared/api/cashier';
import { getMenuItems, getPublicPromotions, type MenuItem, type Promotion } from '../../shared/api/menu-items';

interface CartItem {
  item_id: number;
  size_id?: number | null;
  sizeCode?: string;
  name: string;
  sizeName?: string;
  quantity: number;
  price: number;
  total: number;
}

export default function ManualOnlineOrder() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [notes, setNotes] = useState('');

  // Fetch menu items and promotions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuData, promotionsData] = await Promise.all([
          getMenuItems(),
          getPublicPromotions()
        ]);
        setMenuItems(menuData);
        setPromotions(promotionsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const boxes = promotions.filter(promo =>
    promo.promotion_type === 'combo_fixed_price' &&
    promo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const discountPromos = promotions.filter(promo =>
    promo.promotion_type !== 'combo_fixed_price'
  );

  const getItemPriceInfo = (item: MenuItem, sizeId?: number): { originalPrice: number, bestPrice: number, applicablePromo: Promotion | null } => {
    const originalPrice = sizeId
      ? Number(item.sizes?.find(s => s.id === sizeId)?.price || item.price)
      : Number(item.price);

    let bestPrice = originalPrice;
    let applicablePromo: Promotion | null = null;

    discountPromos.forEach(promo => {
      const isApplicable = sizeId
        ? promo.applicable_sizes.includes(sizeId)
        : promo.applicable_items.includes(item.id);

      if (isApplicable) {
        let promoPrice = originalPrice;
        if (promo.promotion_type === 'percentage') {
          promoPrice = originalPrice * (1 - Number(promo.value) / 100);
        } else if (promo.promotion_type === 'fixed_amount') {
          promoPrice = Math.max(0, originalPrice - Number(promo.value));
        }

        if (promoPrice < bestPrice) {
          bestPrice = promoPrice;
          applicablePromo = promo;
        }
      }
    });

    return { originalPrice, bestPrice, applicablePromo };
  };

  const addToCart = (item: MenuItem, sizeId?: number, overridePrice?: number, promoName?: string) => {
    const { originalPrice, bestPrice, applicablePromo } = getItemPriceInfo(item, sizeId);
    const price = overridePrice !== undefined ? overridePrice : bestPrice;

    const size = sizeId ? item.sizes?.find(s => s.id === sizeId) : null;
    const sizeName = size ? size.size : undefined;

    const effectivePromoName = promoName || (bestPrice < originalPrice ? applicablePromo?.name : undefined);
    const displayName = effectivePromoName ? `[${effectivePromoName}] ${item.name}` : item.name;

    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.item_id === item.id &&
        cartItem.size_id === (sizeId || null) &&
        cartItem.price === price &&
        cartItem.name === displayName
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        item_id: item.id,
        size_id: sizeId || null,
        sizeCode: sizeName,
        quantity: 1,
        name: displayName,
        sizeName,
        price,
        total: price
      };
      setCart([...cart, newItem]);
    }
  };

  const addPromotionToCart = (promo: Promotion) => {
    if (promo.promotion_type !== 'combo_fixed_price' || !promo.combo_items.length) return;

    const comboValue = Number(promo.value);
    const comboItems = promo.combo_items;

    let originalTotal = 0;
    const processedItems = comboItems.map(ci => {
      const menuItem = menuItems.find(m => m.id === ci.menu_item);
      if (!menuItem) return null;

      const size = ci.menu_item_size ? menuItem.sizes?.find(s => s.id === ci.menu_item_size) : null;
      const originalPrice = size ? Number(size.price) : Number(menuItem.price);

      originalTotal += originalPrice * ci.quantity;

      return {
        menuItem,
        sizeId: ci.menu_item_size,
        quantity: ci.quantity,
        originalPrice
      };
    }).filter(Boolean);

    if (!processedItems.length) return;

    let distributedSum = 0;
    processedItems.forEach((pi, idx) => {
      if (!pi) return;

      let itemPrice;
      if (idx === processedItems.length - 1) {
        itemPrice = (comboValue - distributedSum) / pi.quantity;
      } else {
        const ratio = (pi.originalPrice * pi.quantity) / originalTotal;
        const allocatedValue = comboValue * ratio;
        itemPrice = allocatedValue / pi.quantity;
        distributedSum += itemPrice * pi.quantity;
      }

      for (let i = 0; i < pi.quantity; i++) {
        addToCart(pi.menuItem, pi.sizeId || undefined, itemPrice, promo.name);
      }
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + delta);
    updatedCart[index].total = updatedCart[index].price * updatedCart[index].quantity;
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = orderType === 'delivery' ? 100 : 0;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      setError('Le nom et le téléphone du client sont obligatoires');
      return;
    }
    if (orderType === 'delivery' && !customerAddress) {
      setError('L\'adresse est obligatoire pour la livraison');
      return;
    }
    if (cart.length === 0) {
      setError('Le panier est vide');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const orderData: ManualOnlineOrderData = {
        customer: customerName,
        phone: customerPhone,
        address: orderType === 'delivery' ? customerAddress : undefined,
        order_type: orderType,
        items: cart.map(item => ({
          menu_item_id: item.item_id,
          size: item.sizeCode,
          size_id: item.size_id,
          quantity: item.quantity
        })),
        notes
      };

      await createManualOnlineOrder(orderData);
      
      setSuccess(true);
      // Reset form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setNotes('');
      setOrderType('delivery');
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Commande en ligne manuelle</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche - Articles du menu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher des articles..."
              className="w-full p-3 border rounded-lg pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Boxes */}
          {boxes.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Boxes & Menus</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boxes.map((promo) => (
                  <div key={promo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{promo.name}</h3>
                        <p className="text-sm text-gray-600">{promo.description}</p>
                        <div className="mt-2">
                          <span className="font-medium">{Number(promo.value).toFixed(2)} DA</span>
                          <button
                            onClick={() => addPromotionToCart(promo)}
                            className="ml-2 p-1 text-primary hover:bg-primary/10 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {promo.image_url && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={promo.image_url}
                            alt={promo.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles du menu */}
          {filteredMenuItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Articles du menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.sizes && item.sizes.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {item.sizes.map((size) => {
                              const { originalPrice, bestPrice, applicablePromo } = getItemPriceInfo(item, size.id);
                              const hasDiscount = bestPrice < originalPrice;
                              return (
                                <div key={size.id} className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm">{size.size}</span>
                                    {hasDiscount && (
                                      <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                        {applicablePromo?.name}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center">
                                    {hasDiscount && (
                                      <span className="text-sm text-gray-400 line-through mr-2">
                                        {originalPrice.toFixed(2)} DA
                                      </span>
                                    )}
                                    <span className="font-medium">{bestPrice.toFixed(2)} DA</span>
                                    <button
                                      onClick={() => addToCart(item, size.id)}
                                      className="ml-2 p-1 text-primary hover:bg-primary/10 rounded-full"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-2 flex justify-between items-center">
                            <span className="font-medium">{item.price.toFixed(2)} DA</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="p-1 text-primary hover:bg-primary/10 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {item.image_url && (
                        <div className="ml-4 flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne de droite - Détails de la commande */}
        <div className="lg:col-span-1 space-y-6">
          {/* Détails du client */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Détails du client</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de commande</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      orderType === 'delivery'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Truck size={16} /> Livraison
                  </button>
                  <button
                    onClick={() => setOrderType('takeaway')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      orderType === 'takeaway'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <ShoppingBag size={16} /> À emporter
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nom du client"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Téléphone du client"
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Adresse de livraison"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Remarques..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Résumé de la commande */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Résumé de la commande</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Votre panier est vide</p>
            ) : (
              <>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.sizeName && (
                            <div className="text-sm text-gray-500">Taille: {item.sizeName}</div>
                          )}
                          <div className="flex items-center mt-1">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="mx-2 w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.total.toFixed(2)} DA</div>
                          <div className="text-sm text-gray-500">{item.price.toFixed(2)} DA l'unité</div>
                          <button
                            onClick={() => removeFromCart(index)}
                            className="text-red-500 text-xs hover:underline mt-1"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)} DA</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Frais de livraison</span>
                      <span>{tax.toFixed(2)} DA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">{total.toFixed(2)} DA</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cart.length === 0}
                  className={`w-full py-3 px-4 mt-6 rounded-lg font-medium flex items-center justify-center ${
                    submitting || cart.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Valider la commande • ${total.toFixed(2)} DA`
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
