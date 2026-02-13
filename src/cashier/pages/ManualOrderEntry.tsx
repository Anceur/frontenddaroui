import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X, Loader2, CheckCircle, Table as TableIcon } from 'lucide-react';
import { getTablesStatus, createOfflineOrder, type TableStatus, type CreateOrderItem } from '../../shared/api/cashier';
import { getMenuItems, getPublicPromotions, type MenuItem, type Promotion } from '../../shared/api/menu-items';

interface CartItem extends CreateOrderItem {
  name: string;
  sizeName?: string;
  price: number;
  total: number;
}

export default function ManualOrderEntry() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImported, setIsImported] = useState(false);

  // Fetch tables and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tablesData, menuData, promotionsData] = await Promise.all([
          getTablesStatus(),
          getMenuItems(),
          getPublicPromotions()
        ]);
        setTables(tablesData.tables);
        setMenuItems(menuData);
        setPromotions(promotionsData);
      } catch (err: any) {
        setError(err.message || 'Échec du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Boxes are combo_fixed_price promotions
  const boxes = promotions.filter(promo =>
    promo.promotion_type === 'combo_fixed_price' &&
    promo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Discount promotions (percentage or fixed_amount)
  const discountPromos = promotions.filter(promo =>
    promo.promotion_type !== 'combo_fixed_price'
  );

  // Helper to get best price for an item/size based on active discount promotions
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

  // Add item to cart
  const addToCart = (item: MenuItem, sizeId?: number, overridePrice?: number, promoName?: string) => {
    const { originalPrice, bestPrice, applicablePromo } = getItemPriceInfo(item, sizeId);

    // Priority: 1. Manual override (combos), 2. Best Promo Price, 3. Original Price
    const price = overridePrice !== undefined ? overridePrice : bestPrice;

    const size = sizeId ? item.sizes?.find(s => s.id === sizeId) : null;
    const sizeName = size ? size.size : undefined;

    // Add promo tag to name if it's a discount or combo
    const effectivePromoName = promoName || (bestPrice < originalPrice ? applicablePromo?.name : undefined);
    const displayName = effectivePromoName ? `[${effectivePromoName}] ${item.name}` : item.name;

    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.item_id === item.id &&
        cartItem.size_id === (sizeId || null) &&
        cartItem.price === price &&
        cartItem.name === displayName
    );

    if (existingItemIndex >= 0) {
      // Increment quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
      setCart(updatedCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        item_id: item.id,
        size_id: sizeId || null,
        quantity: 1,
        name: displayName,
        sizeName,
        price,
        total: price
      };
      setCart([...cart, newItem]);
    }
  };

  // Add promotion (combo) to cart
  const addPromotionToCart = (promo: Promotion) => {
    if (promo.promotion_type !== 'combo_fixed_price' || !promo.combo_items.length) {
      // For now we only support combo unpacking in POS
      return;
    }

    const comboValue = Number(promo.value);
    const comboItems = promo.combo_items;

    // Calculate original total to distribute price
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

    // Distribute the combo price based on original price ratio
    let distributedSum = 0;
    processedItems.forEach((pi, idx) => {
      if (!pi) return;

      let itemPrice;
      if (idx === processedItems.length - 1) {
        // Last item gets the remainder to avoid precision errors
        itemPrice = (comboValue - distributedSum) / pi.quantity;
      } else {
        const ratio = (pi.originalPrice * pi.quantity) / originalTotal;
        const allocatedValue = comboValue * ratio;
        itemPrice = allocatedValue / pi.quantity;
        distributedSum += itemPrice * pi.quantity;
      }

      // Add to cart multiple times if quantity > 1
      for (let i = 0; i < pi.quantity; i++) {
        addToCart(pi.menuItem, pi.sizeId || undefined, itemPrice, promo.name);
      }
    });
  };

  // Update cart item quantity
  const updateQuantity = (index: number, delta: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Math.max(1, updatedCart[index].quantity + delta);
    updatedCart[index].total = updatedCart[index].price * updatedCart[index].quantity;
    setCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Calculate total
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Submit order
  const handleSubmit = async () => {
    if (!isImported && !selectedTable) {
      setError('Veuillez sélectionner une table ou marquer comme Commande Importée');
      return;
    }

    if (cart.length === 0) {
      setError('Veuillez ajouter au moins un article au panier');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const orderItems: CreateOrderItem[] = cart.map(item => ({
        item_id: item.item_id,
        size_id: item.size_id,
        quantity: item.quantity,
        price: item.price // Send our calculated price (especially for promotions)
      }));

      await createOfflineOrder({
        table_id: isImported ? null : selectedTable,
        items: orderItems,
        is_imported: isImported
      });

      setSuccess(true);
      setCart([]);
      setSelectedTable(null);
      setIsImported(false);

      // Refresh tables status to show occupancy update immediately
      try {
        const tablesData = await getTablesStatus();
        setTables(tablesData.tables);
      } catch (refreshErr) {
        console.error('Failed to refresh tables:', refreshErr);
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Échec de la création de la commande');
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
          <ShoppingCart className="text-orange-500" size={28} />
          Saisie Manuelle de Commande
        </h2>
        <p className="text-gray-600 mt-1">Créer des commandes manuellement pour les tables</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle size={20} />
          Commande créée avec succès !
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Table Selection & Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <TableIcon size={20} />
                Sélectionner une Table
              </h3>
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={isImported}
                  onChange={(e) => {
                    setIsImported(e.target.checked);
                    if (e.target.checked) setSelectedTable(null);
                  }}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-blue-700">Commande Importée (Sans Table)</span>
              </label>
            </div>

            {!isImported ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTable(table.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedTable === table.id
                      ? 'border-orange-500 bg-orange-50 shadow-md transform scale-105 z-10'
                      : !table.is_available
                        ? 'border-red-500 bg-red-50 hover:bg-red-100 hover:border-red-600'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-center">
                      <div className="font-bold text-lg">Table {table.number}</div>
                      <div className="text-sm mt-1">
                        {table.is_available
                          ? <span className="text-green-600">Disponible</span>
                          : <span className="text-red-600 font-semibold">Occupée (Ajouter Articles)</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 p-8 rounded-lg text-center">
                <p className="text-blue-700 font-medium">Mode commande importée activé. Aucune sélection de table requise.</p>
                <p className="text-blue-600 text-sm mt-1">La commande sera marquée comme "Importée" dans l'administration.</p>
              </div>
            )}

            {!isImported && selectedTable && (() => {
              const table = tables.find(t => t.id === selectedTable);
              return (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${table?.is_available
                  ? 'bg-orange-50 text-orange-800 border border-orange-100'
                  : 'bg-red-50 text-red-800 border border-red-200 animate-pulse'
                  }`}>
                  <TableIcon size={18} />
                  <span className="font-bold">
                    {table?.is_available
                      ? `Nouvelle Commande : Table ${table?.number}`
                      : `Ajout à la Table ${table?.number} : Les nouveaux articles seront ajoutés à la commande ouverte actuelle`}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Articles du Menu & Promotions</h3>

            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Rechercher des produits ou promotions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              />
            </div>

            {/* Promotions (Boxes) Section */}
            {boxes.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-blue-800 mb-4 bg-blue-50 p-2 rounded flex items-center gap-2">
                  <ShoppingCart size={18} className="text-blue-600" />
                  Combos & Menus
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boxes.map((promo) => (
                    <div key={promo.id} className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl">
                        MENU
                      </div>
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
                        Ajouter le Menu
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h4 className="text-lg font-bold text-gray-800 mb-4 bg-gray-50 p-2 rounded">Tous les Produits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredMenuItems.map((item) => {
                const { originalPrice, bestPrice } = getItemPriceInfo(item);
                const hasDiscount = bestPrice < originalPrice;

                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {hasDiscount && (
                          <div className="text-xs text-gray-400 line-through">
                            {originalPrice.toFixed(2)} DA
                          </div>
                        )}
                        <span className={`font-bold ${hasDiscount ? 'text-red-500' : 'text-orange-600'}`}>
                          {bestPrice.toFixed(2)} DA
                        </span>
                      </div>
                    </div>

                    {/* Sizes */}
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
                                  {sDiscount && (
                                    <div className="text-[10px] text-gray-400 line-through">
                                      {sOrig.toFixed(2)} DA
                                    </div>
                                  )}
                                  <span className={`font-semibold ${sDiscount ? 'text-red-500' : 'text-gray-800'}`}>
                                    {sBest.toFixed(2)} DA
                                  </span>
                                </div>
                                <button
                                  onClick={() => addToCart(item, size.id)}
                                  className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                                >
                                  Ajouter
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
                        Ajouter au Panier
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun article de menu trouvé
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Panier</h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                <p>Le panier est vide</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.name}</div>
                          {item.sizeName && (
                            <div className="text-sm text-gray-600">Taille : {item.sizeName}</div>
                          )}
                          <div className="text-sm text-gray-600">
                            {item.price.toFixed(2)} DA × {item.quantity}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-bold text-orange-600">
                          {item.total.toFixed(2)} DA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total :</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {cartTotal.toFixed(2)} DA
                    </span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={(!isImported && !selectedTable) || cart.length === 0 || submitting}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Création de la Commande...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Créer la Commande
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}