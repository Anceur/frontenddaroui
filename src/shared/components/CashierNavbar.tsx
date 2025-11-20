import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Table, ShoppingCart, LogOut, Bell, Plus } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/Authservice';
import { useNotifications } from '../context/NotificationContext';

export default function CashierNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    if (auth?.handleLogout) {
      await auth.handleLogout();
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    if (!notifications.find(n => n.id === notificationId)?.is_read) {
      await markAsRead(notificationId);
    }
    setShowNotifications(false);
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order':
        return '🛒';
      case 'alert':
        return '⚠️';
      case 'ingredient':
        return '📦';
      case 'table':
        return '🪑';
      default:
        return 'ℹ️';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">Cashier Panel</h1>
            <div className="flex space-x-4">
              <Link
                to="/tables"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/tables' || location.pathname === '/'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                <Table size={20} />
                <span>Tables</span>
              </Link>
              <Link
                to="/orders"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/orders'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                <ShoppingCart size={20} />
                <span>Pending Orders</span>
              </Link>
              <Link
                to="/create-order"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/create-order'
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                }`}
              >
                <Plus size={20} />
                <span>Create Order</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="relative p-2 rounded-lg transition-all duration-200 hover:bg-white/10 group"
                title="Notifications"
              >
                <Bell size={20} strokeWidth={2} className="group-hover:text-orange-200" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-sm bg-red-500"
                    style={{ fontSize: '10px' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div 
                  className="absolute right-0 mt-2 w-80 lg:w-96 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-fade-in"
                  style={{ 
                    borderColor: '#E5E7EB',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div 
                    className="px-5 py-4 border-b flex items-center justify-between"
                    style={{ 
                      backgroundColor: '#F9FAFB',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    <h3 className="font-semibold text-sm" style={{ color: '#1F2937' }}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <p style={{ color: '#6B7280' }} className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          className="w-full px-5 py-3.5 border-b hover:bg-gray-50 transition-colors text-left"
                          style={{ borderColor: '#F3F4F6' }}
                        >
                          <div className="flex items-start gap-3">
                            {!notif.is_read && (
                              <div 
                                className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                                style={{ backgroundColor: '#FF8C00' }}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1">
                                <span className="text-base shrink-0">{getNotificationIcon(notif.notification_type)}</span>
                                <p style={{ color: '#1F2937' }} className={`text-sm ${!notif.is_read ? 'font-semibold' : 'font-normal'}`}>
                                  {notif.title}
                                </p>
                              </div>
                              <p style={{ color: '#6B7280' }} className="text-xs mb-1">
                                {notif.message}
                              </p>
                              <p style={{ color: '#6B7280' }} className="text-xs">
                                {notif.time_ago}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t" style={{ borderColor: '#E5E7EB' }}>
                      {unreadCount > 0 && (
                        <button 
                          onClick={async () => {
                            await markAllAsRead()
                          }}
                          className="w-full py-3 text-center text-sm font-medium hover:bg-gray-50 transition-colors"
                          style={{ color: '#FF8C00' }}
                        >
                          Mark All as Read
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          // Cashier doesn't have a separate notifications page, so just close dropdown
                          // Or navigate to a cashier notifications page if you create one later
                          setShowNotifications(false);
                        }}
                        className="w-full py-3 text-center text-sm font-medium hover:bg-gray-50 transition-colors border-t"
                        style={{ 
                          color: '#FF8C00',
                          borderColor: '#E5E7EB'
                        }}
                      >
                        View All Notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
