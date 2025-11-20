import { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, ShoppingCart, X, Loader2, CheckCircle, Table as TableIcon } from 'lucide-react';
import { getTablesStatus, createOfflineOrder, type TableStatus, type CreateOrderItem } from '../../shared/api/cashier';
import { getMenuItems, type MenuItem } from '../../shared/api/menu-items';

interface CartItem extends CreateOrderItem {
  name: string;
  sizeName?: string;
  price: number;
  total: number;
}

export default function ManualOrderEntry() {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tables and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tablesData, menuData] = await Promise.all([
          getTablesStatus(),
          getMenuItems()
        ]);
        setTables(tablesData.tables);
        setMenuItems(menuData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter menu items by search query
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item to cart
  const addToCart = (item: MenuItem, sizeId?: number) => {
    const size = sizeId ? item.sizes?.find(s => s.id === sizeId) : null;
    const price = size ? Number(size.price) : Number(item.price);
    const sizeName = size ? size.size : undefined;

    const existingItemIndex = cart.findIndex(
      cartItem => cartItem.item_id === item.id && cartItem.size_id === (sizeId || null)
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
        name: item.name,
        sizeName,
        price,
        total: price
      };
      setCart([...cart, newItem]);
    }
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
    if (!selectedTable) {
      setError('Please select a table');
      return;
    }

    if (cart.length === 0) {
      setError('Please add at least one item to the cart');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const orderItems: CreateOrderItem[] = cart.map(item => ({
        item_id: item.item_id,
        size_id: item.size_id,
        quantity: item.quantity
      }));

      await createOfflineOrder({
        table_id: selectedTable,
        items: orderItems
      });

      setSuccess(true);
      setCart([]);
      setSelectedTable(null);
      
      // Reset success message after 3 seconds
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
          <ShoppingCart className="text-orange-500" size={28} />
          Manual Order Entry
        </h2>
        <p className="text-gray-600 mt-1">Create orders manually for tables</p>
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
        {/* Left Column: Table Selection & Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Table Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TableIcon size={20} />
              Select Table
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTable === table.id
                      ? 'border-orange-500 bg-orange-50'
                      : !table.is_available
                      ? 'border-red-300 bg-red-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                  }`}
                  disabled={!table.is_available}
                >
                  <div className="text-center">
                    <div className="font-bold text-lg">Table {table.number}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {table.is_available ? 'Available' : 'Occupied'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedTable && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-800 font-medium">
                  Selected: Table {tables.find(t => t.id === selectedTable)?.number}
                </span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Menu Items</h3>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-orange-600">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>

                  {/* Sizes */}
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {item.sizes.map((size) => (
                        <div key={size.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{size.size}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              ${Number(size.price).toFixed(2)}
                            </span>
                            <button
                              onClick={() => addToCart(item, size.id)}
                              className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
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
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No menu items found
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cart</h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                <p>Cart is empty</p>
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
                            <div className="text-sm text-gray-600">Size: {item.sizeName}</div>
                          )}
                          <div className="text-sm text-gray-600">
                            ${item.price.toFixed(2)} × {item.quantity}
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
                          ${item.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-orange-600">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedTable || cart.length === 0 || submitting}
                    className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Create Order
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

