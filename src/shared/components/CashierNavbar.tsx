import { Link, useLocation } from 'react-router-dom';
import { Table, ShoppingCart, LogOut, Bell, Plus, History, Truck } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/Authservice';
import { useNotifications } from '../context/NotificationContext';

export default function CashierNavbar() {
  const location = useLocation();
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
    switch (type) {
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

  const navItems = [
    { to: '/tables', icon: Table, label: 'Tables', paths: ['/tables', '/'] },
    { to: '/orders', icon: ShoppingCart, label: 'En attente', paths: ['/orders'] },
    { to: '/create-order', icon: Plus, label: 'Nouvelle commande', paths: ['/create-order'] },
    { to: '/manual-online-order', icon: Truck, label: 'Livraison', paths: ['/manual-online-order'] },
    { to: '/history', icon: History, label: 'Historique', paths: ['/history'] },
  ];

  return (
    <nav className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 shadow-xl relative">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute w-96 h-96 bg-white rounded-full -top-48 -left-48 blur-3xl"></div>
        <div className="absolute w-96 h-96 bg-white rounded-full -bottom-48 -right-48 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 relative z-10">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart size={20} className="text-white sm:w-6 sm:h-6" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Caisse</h1>
              <p className="text-white/70 text-xs font-medium">Point de vente</p>
            </div>
          </div>

          {/* Navigation Items - Centered, hidden on very small screens */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center max-w-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.paths.includes(location.pathname);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl transition-all font-semibold text-xs lg:text-sm whitespace-nowrap ${isActive
                    ? 'bg-white text-orange-600 shadow-lg'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <Icon size={16} className="lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                  <span className="hidden lg:inline">{item.label}</span>
                  <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-white/10 group"
                title="Notifications"
              >
                <Bell size={18} className="sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full text-[9px] sm:text-xs flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setShowNotifications(false)}
                  ></div>

                  <div className="absolute right-0 top-full mt-2 w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                          {unreadCount} nouveaux
                        </span>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-12 text-center">
                          <Bell size={40} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm font-medium">Aucune notification</p>
                        </div>
                      ) : (
                        notifications.slice(0, 10).map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif.id)}
                            className="w-full px-5 py-4 border-b border-gray-50 hover:bg-orange-50/50 transition-colors text-left group"
                          >
                            <div className="flex items-start gap-3">
                              {!notif.is_read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 shrink-0 animate-pulse"></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-2 mb-1">
                                  <span className="text-lg shrink-0">{getNotificationIcon(notif.notification_type)}</span>
                                  <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} group-hover:text-orange-600 transition-colors`}>
                                    {notif.title}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mb-1">{notif.message}</p>
                                <p className="text-xs text-gray-400">{notif.time_ago}</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="border-t border-gray-100">
                        {unreadCount > 0 && (
                          <button
                            onClick={async () => {
                              await markAllAsRead();
                            }}
                            className="w-full py-3 text-center text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 transition-all text-white font-semibold text-xs sm:text-sm backdrop-blur-sm"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation - Only visible on small screens */}
        <div className="md:hidden flex justify-around pb-2 pt-2 border-t border-white/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.paths.includes(location.pathname);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all min-w-0 ${isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white'
                  }`}
              >
                <Icon size={20} strokeWidth={2.5} className="shrink-0" />
                <span className="text-[10px] font-semibold truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
