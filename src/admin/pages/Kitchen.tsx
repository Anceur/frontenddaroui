import React, { useState, useEffect } from 'react';
import { Clock, ChefHat, AlertCircle, CheckCircle2, Timer, User, Flame } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  notes: string;
  priority?: 'high' | 'normal';
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  table: string;
  server: string;
  orderTime: Date;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  priority: 'high' | 'normal';
}

export default function KitchenDisplay() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      orderNumber: '#1247',
      customerName: 'Sarah Johnson',
      items: [
        { name: 'Grilled Salmon', quantity: 2, notes: 'No lemon', priority: 'high' },
        { name: 'Caesar Salad', quantity: 2, notes: 'Extra dressing' },
        { name: 'Garlic Bread', quantity: 1, notes: '' }
      ],
      table: '12',
      server: 'Mike',
      orderTime: new Date(Date.now() - 8 * 60000),
      status: 'preparing',
      priority: 'high'
    },
    {
      id: 'ORD-002',
      orderNumber: '#1248',
      customerName: 'David Chen',
      items: [
        { name: 'Beef Burger', quantity: 1, notes: 'Medium rare' },
        { name: 'French Fries', quantity: 2, notes: 'Extra crispy' },
        { name: 'Coke', quantity: 1, notes: '' }
      ],
      table: '5',
      server: 'Emma',
      orderTime: new Date(Date.now() - 5 * 60000),
      status: 'new',
      priority: 'normal'
    },
    {
      id: 'ORD-003',
      orderNumber: '#1249',
      customerName: 'Maria Garcia',
      items: [
        { name: 'Margherita Pizza', quantity: 1, notes: '' },
        { name: 'Tiramisu', quantity: 2, notes: '' }
      ],
      table: '8',
      server: 'Mike',
      orderTime: new Date(Date.now() - 3 * 60000),
      status: 'new',
      priority: 'normal'
    },
    {
      id: 'ORD-004',
      orderNumber: '#1250',
      customerName: 'James Wilson',
      items: [
        { name: 'Ribeye Steak', quantity: 1, notes: 'Well done, no sauce', priority: 'high' },
        { name: 'Mashed Potatoes', quantity: 1, notes: '' },
        { name: 'Grilled Vegetables', quantity: 1, notes: 'Extra garlic' }
      ],
      table: '15',
      server: 'Lisa',
      orderTime: new Date(Date.now() - 12 * 60000),
      status: 'preparing',
      priority: 'high'
    },
    {
      id: 'ORD-005',
      orderNumber: '#1251',
      customerName: 'Anna Martinez',
      items: [
        { name: 'Pasta Carbonara', quantity: 1, notes: '' },
        { name: 'Garlic Bread', quantity: 1, notes: '' }
      ],
      table: '3',
      server: 'Emma',
      orderTime: new Date(Date.now() - 2 * 60000),
      status: 'new',
      priority: 'normal'
    },
    {
      id: 'ORD-006',
      orderNumber: '#1252',
      customerName: 'Robert Taylor',
      items: [
        { name: 'Fish & Chips', quantity: 2, notes: 'Extra tartar sauce' },
        { name: 'Coleslaw', quantity: 2, notes: '' }
      ],
      table: '20',
      server: 'Lisa',
      orderTime: new Date(Date.now() - 15 * 60000),
      status: 'ready',
      priority: 'normal'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeDifference = (orderTime: Date): string => {
    const diff = Math.floor((currentTime.getTime() - orderTime.getTime()) / 60000);
    return `${diff} min`;
  };

  const getTimeColor = (orderTime: Date): string => {
    const diff = Math.floor((currentTime.getTime() - orderTime.getTime()) / 60000);
    if (diff >= 10) return '#FF4444';
    if (diff >= 7) return '#FF8C00';
    return '#999999';
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusBadgeStyle = (status: Order['status']) => {
    switch (status) {
      case 'new':
        return { bg: '#FEF3C7', text: '#FF8C00', label: 'Nouvelle commande' };
      case 'preparing':
        return { bg: '#DBEAFE', text: '#2563EB', label: 'En préparation' };
      case 'ready':
        return { bg: '#D1FAE5', text: '#059669', label: 'Prête' };
      case 'completed':
        return { bg: '#E5E7EB', text: '#6B7280', label: 'Terminée' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', label: status };
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'completed');
  const newOrders = activeOrders.filter(o => o.status === 'new');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');

  return (
    <div className="min-h-screen w-full" style={{ background: '#FFFFFF', position: 'relative' }}>
      {/* Header */}
      <header 
        className="sticky top-0 z-40 border-b"
        style={{ 
          background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)',
          borderColor: '#E5E7EB',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          position: 'sticky'
        }}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ 
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
                  boxShadow: '0 4px 12px rgba(255, 140, 0, 0.2)'
                }}
              >
                <ChefHat className="text-white" size={20} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate" style={{ color: '#333333' }}>
                  Système d'affichage cuisine
                </h1>
                <p className="text-xs sm:text-sm" style={{ color: '#999999' }}>
                  Restaurant Nostalgie
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto justify-between sm:justify-end">
              {/* Stats */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF8C00' }}>
                    {newOrders.length}
                  </div>
                  <div className="text-xs" style={{ color: '#999999' }}>Nouveau</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: '#2563EB' }}>
                    {preparingOrders.length}
                  </div>
                  <div className="text-xs" style={{ color: '#999999' }}>En préparation</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: '#059669' }}>
                    {readyOrders.length}
                  </div>
                  <div className="text-xs" style={{ color: '#999999' }}>Prête</div>
                </div>
              </div>

              {/* Clock */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shrink-0" style={{ background: '#FFFAF0' }}>
                <Clock size={16} className="sm:w-5 sm:h-5" style={{ color: '#FF8C00' }} />
                <div className="text-sm sm:text-base lg:text-lg font-semibold whitespace-nowrap" style={{ color: '#333333' }}>
                  {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {activeOrders.map((order) => {
            const statusStyle = getStatusBadgeStyle(order.status);
            const timeColor = getTimeColor(order.orderTime);
            const timeDiff = getTimeDifference(order.orderTime);

            return (
              <div
                key={order.id}
                className="rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{
                  background: '#FFFFFF',
                  borderColor: order.priority === 'high' ? '#FF8C00' : '#E5E7EB',
                  borderWidth: order.priority === 'high' ? '2px' : '1px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Order Header */}
                <div 
                  className="px-3 sm:px-4 py-2 sm:py-3 border-b"
                  style={{ 
                    background: order.priority === 'high' ? '#FEF3C7' : 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)',
                    borderColor: '#E5E7EB'
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg sm:text-xl font-bold" style={{ color: '#333333' }}>
                        {order.orderNumber}
                      </span>
                      {order.priority === 'high' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ background: '#FEE2E2' }}>
                          <Flame size={12} style={{ color: '#DC2626' }} />
                          <span className="text-xs font-semibold" style={{ color: '#DC2626' }}>Priorité</span>
                        </div>
                      )}
                    </div>
                    <div 
                      className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={{ 
                        background: statusStyle.bg,
                        color: statusStyle.text
                      }}
                    >
                      {statusStyle.label}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: '#999999' }} />
                        <span className="truncate max-w-[120px] sm:max-w-none" style={{ color: '#333333' }}>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: '#999999' }}>Table</span>
                        <span className="font-semibold" style={{ color: '#FF8C00' }}>
                          {order.table}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Timer size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: timeColor }} />
                      <span className="font-semibold" style={{ color: timeColor }}>
                        {timeDiff}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-3 sm:px-4 py-2 sm:py-3 space-y-2">
                  {order.items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg"
                      style={{ background: '#FFFAF0' }}
                    >
                      <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shrink-0"
                        style={{ 
                          background: '#FF8C00',
                          color: '#FFFFFF'
                        }}
                      >
                        {item.quantity}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-sm sm:text-base break-words" style={{ color: '#333333' }}>
                            {item.name}
                          </span>
                          {item.priority === 'high' && (
                            <AlertCircle size={14} className="shrink-0" style={{ color: '#DC2626' }} />
                          )}
                        </div>
                        {item.notes && (
                          <div 
                            className="text-xs px-2 py-1 rounded inline-block mt-1 break-words"
                            style={{ 
                              background: '#FEE2E2',
                              color: '#DC2626'
                            }}
                          >
                            Remarque : {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div 
                  className="px-3 sm:px-4 py-2 sm:py-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="text-xs sm:text-sm" style={{ color: '#999999' }}>
                    Serveur : <span className="font-semibold" style={{ color: '#333333' }}>{order.server}</span>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {order.status === 'new' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:opacity-90 flex-1 sm:flex-initial text-center"
                        style={{ 
                          background: '#FF8C00',
                          color: '#FFFFFF'
                        }}
                      >
                        Démarrer la préparation
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:opacity-90 flex-1 sm:flex-initial text-center"
                        style={{ 
                          background: '#059669',
                          color: '#FFFFFF'
                        }}
                      >
                        Marquer prête
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                        style={{ 
                          background: '#6B7280',
                          color: '#FFFFFF'
                        }}
                      >
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeOrders.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <ChefHat size={48} className="sm:w-16 sm:h-16 mx-auto" style={{ color: '#E5E7EB' }} />
            <h2 className="text-xl sm:text-2xl font-bold mt-4" style={{ color: '#333333' }}>
              Aucune commande en cours
            </h2>
            <p className="text-sm sm:text-base px-4" style={{ color: '#999999' }}>
              Toutes les commandes sont terminées. Beau travail !
            </p>
          </div>
        )}
      </main>
    </div>
  );
}