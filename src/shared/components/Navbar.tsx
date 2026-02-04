import React, { useState,useContext } from 'react';
import { Search, Bell, User, ChevronDown, Menu, Settings, HelpCircle, LogOut, X } from 'lucide-react';
import { AuthContext } from '../context/Authservice';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

interface NostalgieNavbarProps {
  onMenuClick?: () => void;
}

export default function NostalgieNavbar({ onMenuClick }: NostalgieNavbarProps) {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false);
  const auth=useContext(AuthContext)
  const {handleLogout}=auth
  const navigate=useNavigate()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  
  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Bouton de menu cliqué');
    if (onMenuClick) {
      onMenuClick();
    }
  };
  
  const handleNotificationClick = async (notificationId: number) => {
    if (!notifications.find(n => n.id === notificationId)?.is_read) {
      await markAsRead(notificationId)
    }
    setShowNotifications(false)
  }

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
    <nav 
      className="h-16 lg:h-20 bg-white border-b flex items-center justify-between px-4 lg:px-6"
      style={{ borderColor: '#E5E7EB' }}
    >
      {/* Left Section - Menu & Search */}
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-2xl">
        {/* Mobile Menu Button */}
        <button
          onClick={handleMenuClick}
          className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 relative z-50"
          style={{ color: '#FF8C00' }}
          aria-label="Ouvrir le menu"
          type="button"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Search */}
        <div className="relative flex-1 hidden lg:block">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Search size={18} style={{ color: '#9CA3AF' }} />
          </div>
          <input
            type="text"
            placeholder="Rechercher des commandes, produits, personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
            style={{ 
              borderColor: '#E5E7EB',
              color: '#374151',
              background: '#FAFBFC'
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = '#FF8C00';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.08)';
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.background = '#FAFBFC';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="lg:hidden p-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
          style={{ color: '#6B7280' }}
          aria-label="Rechercher"
        >
          <Search size={20} />
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b p-4 z-50" style={{ borderColor: '#E5E7EB' }}>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Search size={18} style={{ color: '#9CA3AF' }} />
            </div>
            <input
              type="text"
              placeholder="Rechercher des commandes, produits, personnel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
              style={{ 
                borderColor: '#E5E7EB',
                color: '#374151',
                background: '#FAFBFC'
              }}
              autoFocus
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
              style={{ color: '#9CA3AF' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 group"
            title="Afficher les notifications"
            aria-label={`Afficher les notifications (${unreadCount} non lues)`}
          >
            <Bell size={20} strokeWidth={2} style={{ color: '#6B7280' }} className="group-hover:text-orange-600" />
            {unreadCount > 0 && (
              <span 
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-sm"
                style={{ 
                  backgroundColor: '#FF8C00',
                  fontSize: '10px'
                }}
              >
                {unreadCount}
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
                    {unreadCount} nouveaux
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p style={{ color: '#6B7280' }} className="text-sm">Aucune notification</p>
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
                      Tout marquer comme lu
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      navigate('/notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full py-3 text-center text-sm font-medium hover:bg-gray-50 transition-colors border-t"
                    style={{ 
                      color: '#FF8C00',
                      borderColor: '#E5E7EB'
                    }}
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            aria-label="Ouvrir le menu profil"
          >
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #FF8C00 0%, #FF9F40 100%)',
                fontSize: '13px'
              }}
            >
              AM
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                Administrateur
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Gestionnaire
              </p>
            </div>
            <ChevronDown size={16} style={{ color: '#6B7280' }} className="group-hover:text-orange-600" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div 
              className="absolute right-0 mt-2 w-56 lg:w-64 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-fade-in"
              style={{ 
                borderColor: '#E5E7EB',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="px-5 py-4 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ 
                      background: 'linear-gradient(135deg, #FF8C00 0%, #FF9F40 100%)',
                      fontSize: '14px'
                    }}
                  >
                    AM
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#1F2937' }}>Administrateur</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>admin@nostalgie.com</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }}>
                  <User size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>Mon profil</span>
                </button>
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }} onClick={()=>{ navigate("/change-password") }} >
                  <Settings size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>Changer le mot de passe</span>
                </button>
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }}>
                  <HelpCircle size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>Aide et support</span>
                </button>
              </div>
              <div className="border-t" style={{ borderColor: '#E5E7EB' }}>
                <button 
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left font-medium hover:bg-red-50 transition-colors text-sm flex items-center gap-3 group"
                  style={{ color: '#DC2626' }}
                  aria-label="Se déconnecter"
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </nav>
  );
}