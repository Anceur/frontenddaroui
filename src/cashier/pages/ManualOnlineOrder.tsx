import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X, Loader2, CheckCircle, User, Phone, MapPin, Truck, ShoppingBag, ChefHat } from 'lucide-react';
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
  const tax = 100; // Fixed tax for online orders
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      setError('Customer Name and Phone are required');
      return;
    }
    if (orderType === 'delivery' && !customerAddress) {
      setError('Address is required for delivery');
      return;
    }
    if (cart.length === 0) {
      setError('Cart is empty');
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

      const result = await createManualOnlineOrder(orderData);
      
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Truck className="text-orange-500" size={28} />
          Manual Online Order
        </h2>
        <p className="text-gray-600 mt-1">Create Delivery or Takeaway orders</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle size={20} />
          Order created successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Items</h3>
            
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>
            
             {/* Boxes Section */}
            {boxes.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-blue-800 mb-4 bg-blue-50 p-2 rounded flex items-center gap-2">
                  <ShoppingBag size={18} className="text-blue-600" />
                  Combos & Boxes
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boxes.map((promo) => (
                    <div key={promo.id} className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 relative overflow-hidden">
                       <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">BOX</div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-blue-900">{promo.name}</h4>
                          <p className="text-sm text-blue-700 mt-1 line-clamp-2">{promo.description}</p>
                        </div>
                        <span className="font-bold text-blue-600 text-lg">
                          {Number(promo.value).toFixed(2)} DA
                        </span>
                      </div>
                      <button
                        onClick={() => addPromotionToCart(promo)}
                        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                      >
                        Add Box
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
              {filteredMenuItems.map((item) => {
                const { originalPrice, bestPrice } = getItemPriceInfo(item);
                const hasDiscount = bestPrice < originalPrice;

                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                      </div>
                      <div className="text-right">
                         {hasDiscount && <div className="text-xs text-gray-400 line-through">{originalPrice.toFixed(2)} DA</div>}
                        <span className={`font-bold ${hasDiscount ? 'text-red-500' : 'text-orange-600'}`}>
                          {bestPrice.toFixed(2)} DA
                        </span>
                      </div>
                    </div>

                    {item.sizes && item.sizes.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {item.sizes.map((size) => {
                          const { originalPrice: sOrig, bestPrice: sBest } = getItemPriceInfo(item, size.id);
                          const sDiscount = sBest < sOrig;
                          return (
                            <div key={size.id} className="flex justify-between items-center">
                              <span className="text-sm text-gray-700">{size.size}</span>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  {sDiscount && <div className="text-[10px] text-gray-400 line-through">{sOrig.toFixed(2)} DA</div>}
                                  <span className={`font-semibold ${sDiscount ? 'text-red-500' : 'text-gray-800'}`}>
                                    {sBest.toFixed(2)} DA
                                  </span>
                                </div>
                                <button
                                  onClick={() => addToCart(item, size.id)}
                                  className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Details & Cart */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={20} />
              Customer Details
            </h3>
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      orderType === 'delivery'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Truck size={16} /> Delivery
                  </button>
                  <button
                    onClick={() => setOrderType('takeaway')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                      orderType === 'takeaway'
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-500'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <ShoppingBag size={16} /> Takeaway
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Customer Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                 <div className="relative">
                   <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                   <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                    <textarea
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Delivery Address"
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
                      placeholder="Special instructions..."
                      rows={2}
                    />
               </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShoppingCart size={20} />
              Cart
            </h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <p>Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        {item.sizeName && <div className="text-xs text-gray-500">{item.sizeName}</div>}
                        <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => updateQuantity(index, -1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><Minus size={14}/></button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><Plus size={14}/></button>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-sm font-bold text-gray-800">{(item.price * item.quantity).toFixed(2)} DA</div>
                         <button onClick={() => removeFromCart(index)} className="text-red-500 hover:text-red-700 text-xs mt-1">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (Fixed)</span>
                    <span>{tax.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">{total.toFixed(2)} DA</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Order
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
