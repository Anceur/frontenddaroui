import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TableOrder.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string | null;
  sizes: MenuItemSize[];
}

interface MenuItemSize {
  id: number;
  size: string;
  price: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
  item_id: number;
  size_id?: number;
}

interface TableSession {
  id: number;
  table: {
    id: number;
    number: string;
    capacity: number;
  };
  token: string;
  is_active: boolean;
  expires_at: string;
  order_placed: boolean;
}

export default function TableOrder() {
  const { tableId } = useParams<{ tableId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<TableSession | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get token from URL params
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Validate existing session
      validateSession(token);
    } else if (tableId) {
      // Create new session
      createSession(tableId);
    } else {
      setError('Invalid table access. Please scan the QR code again.');
      setLoading(false);
    }
  }, [tableId, token]);

  useEffect(() => {
    if (session) {
      loadMenu();
    }
  }, [session]);

  const createSession = async (tableId: string) => {
    try {
      const response = await axios.post(`${API_URL}/public/table-sessions/create/`, {
        table_id: parseInt(tableId)
      });

      if (response.data.success) {
        setSession(response.data.session);
        // Update URL with token
        navigate(`/table/${tableId}?token=${response.data.session.token}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const validateSession = async (token: string) => {
    try {
      const response = await axios.post(`${API_URL}/public/table-sessions/validate/`, {
        token
      });

      if (response.data.valid) {
        setSession(response.data.session);
        
        // Check if order already placed
        if (response.data.session.order_placed) {
          setOrderSuccess(true);
        }
      }
    } catch (err: any) {
      if (err.response?.data?.expired) {
        setError('Your session has expired. Please scan the QR code again.');
      } else {
        setError(err.response?.data?.error || 'Invalid session');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/menu/`);
      setMenuItems(response.data.menu_items);
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
  };

  const addToCart = (item: MenuItem, size?: MenuItemSize) => {
    const cartItemId = size ? `${item.id}-${size.id}` : `${item.id}`;
    const price = size ? size.price : item.price;
    const name = size ? `${item.name} (${size.size})` : item.name;

    const existingItem = cart.find(ci => ci.id === cartItemId);

    if (existingItem) {
      setCart(cart.map(ci =>
        ci.id === cartItemId
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      ));
    } else {
      setCart([...cart, {
        id: cartItemId,
        name,
        price,
        quantity: 1,
        notes: '',
        item_id: item.id,
        size_id: size?.id
      }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateNotes = (id: string, notes: string) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, notes } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    if (!session) {
      setError('Session expired. Please scan the QR code again.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData = {
        session_token: session.token,
        items: cart.map(item => ({
          item_id: item.item_id,
          size_id: item.size_id,
          quantity: item.quantity,
          notes: item.notes
        })),
        notes: orderNotes
      };

      const response = await axios.post(`${API_URL}/public/table-sessions/order/`, orderData);

      if (response.data.success) {
        setOrderSuccess(true);
        setCart([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenuItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="table-order-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="table-order-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="table-order-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been sent to the kitchen.</p>
          <p className="table-info">Table {session?.table.number}</p>
          <p className="wait-message">Please wait while we prepare your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-order-container">
      <header className="table-order-header">
        <h1>🍽️ Table {session?.table.number}</h1>
        <p className="session-info">Session active • Order now</p>
      </header>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="table-order-content">
        <div className="menu-section">
          <div className="category-filter">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {filteredMenuItems.map(item => (
              <div key={item.id} className="menu-item-card">
                {item.image && (
                  <img src={item.image} alt={item.name} className="menu-item-image" />
                )}
                <div className="menu-item-info">
                  <h3>{item.name}</h3>
                  <p className="menu-item-description">{item.description}</p>
                  
                  {item.sizes && item.sizes.length > 0 ? (
                    <div className="size-options">
                      {item.sizes.map(size => (
                        <button
                          key={size.id}
                          className="size-btn"
                          onClick={() => addToCart(item, size)}
                        >
                          {size.size} - {size.price} DA
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => addToCart(item)}
                    >
                      Add - {item.price} DA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Order</h2>
          
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-header">
                      <span className="cart-item-name">{item.name}</span>
                      <button
                        className="remove-btn"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </div>
                      <span className="cart-item-price">
                        {(item.price * item.quantity).toFixed(2)} DA
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Special instructions..."
                      value={item.notes}
                      onChange={(e) => updateNotes(item.id, e.target.value)}
                      className="cart-item-notes"
                    />
                  </div>
                ))}
              </div>

              <div className="order-notes">
                <textarea
                  placeholder="Additional notes for your order..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="cart-total">
                <span>Total:</span>
                <span className="total-amount">{calculateTotal().toFixed(2)} DA</span>
              </div>

              <button
                className="submit-order-btn"
                onClick={submitOrder}
                disabled={submitting}
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
