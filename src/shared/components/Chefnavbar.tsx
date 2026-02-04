// @ts-nocheck
import React, { useState,useContext } from 'react';
import { Menu, X, ChefHat, ClipboardList, UtensilsCrossed, BarChart3, User, LogOut, Bell, Package } from 'lucide-react';
import NavButton from './Navbutton';
import NotificationButton from './NotificationButton';
import ProfileButton from './Profilebutton';
import MobileNavItem from './MobileNavItem';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/Authservice';
import { useNotifications } from '../context/NotificationContext';
// ============================================
// INTERFACES
// ============================================

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}

interface NotificationButtonProps {
  count: number;
}

interface MobileNavItemProps {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  badge?: number | null;
}

// ============================================
// MAIN NAVBAR COMPONENT
// ============================================

export default function ChefNavbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const auth=useContext(AuthContext)
  const {handleLogout}=auth
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const handleLogoutClick=()=>{
    handleLogout()
    navigate('/login')
  }

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
    <nav style={{
      background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)',
      borderBottom: '2px solid #FFD700',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          height: '70px' 
        }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '45px',
              height: '45px',
              background: '#FF8C00',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 'bold',
              fontSize: '20px'
            }}>
              👨‍🍳
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '22px', 
                fontWeight: '600', 
                color: '#FF8C00',
                letterSpacing: '-0.5px'
              }}>
                Espace Chef
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: '#999999' 
              }}>
                Système de gestion de cuisine
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            alignItems: 'center'
          }} className="desktop-nav">
            <div onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
              <NavButton icon={<ClipboardList size={18} />} label="Commandes" primary={location.pathname.startsWith('/chef') && (location.pathname === '/chef' || location.pathname.startsWith('/chef/orders'))} />
            </div>
            <div onClick={() => navigate('/menu')} style={{ cursor: 'pointer' }}>
              <NavButton icon={<UtensilsCrossed size={18} />} label="Menu" primary={location.pathname.startsWith('/chef/menu')} />
            </div>
            <div onClick={() => navigate('/ingredients')} style={{ cursor: 'pointer' }}>
              <NavButton icon={<Package size={18} />} label="Ingrédients" primary={location.pathname.startsWith('/chef/ingredients')} />
            </div>
            <div onClick={() => navigate('/stats')} style={{ cursor: 'pointer' }}>
              <NavButton icon={<BarChart3 size={18} />} label="Statistiques" primary={location.pathname.startsWith('/chef/stats')} />
            </div>
            
            <div style={{ 
              width: '1px', 
              height: '30px', 
              background: '#FFD700', 
              margin: '0 8px' 
            }} />
            
            {/* Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  background: showNotifications ? '#FFFAF0' : 'transparent',
                  border: '1px solid #FFD700',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#FF8C00',
                  transition: 'all 0.3s ease'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#FF8C00',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '380px',
                  maxWidth: '90vw',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #E5E7EB',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #E5E7EB',
                    background: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: '#FFF4E6',
                        color: '#FF8C00'
                      }}>
                        {unreadCount} nouveaux
                      </span>
                    )}
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Aucune notification</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif.id)}
                          style={{
                            width: '100%',
                            padding: '14px 20px',
                            borderBottom: '1px solid #F3F4F6',
                            background: 'transparent',
                            borderLeft: 'none',
                            borderRight: 'none',
                            borderTop: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            {!notif.is_read && (
                              <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#FF8C00',
                                marginTop: '6px',
                                flexShrink: 0
                              }} />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '16px', flexShrink: 0 }}>{getNotificationIcon(notif.notification_type)}</span>
                                <p style={{
                                  margin: 0,
                                  fontSize: '14px',
                                  fontWeight: notif.is_read ? 400 : 600,
                                  color: '#1F2937'
                                }}>
                                  {notif.title}
                                </p>
                              </div>
                              <p style={{
                                margin: '0 0 4px 0',
                                fontSize: '12px',
                                color: '#6B7280'
                              }}>
                                {notif.message}
                              </p>
                              <p style={{
                                margin: 0,
                                fontSize: '11px',
                                color: '#9CA3AF'
                              }}>
                                {notif.time_ago}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div style={{ borderTop: '1px solid #E5E7EB' }}>
                      {unreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllAsRead()
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #E5E7EB',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#FF8C00',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <ProfileButton onLogoutClick={handleLogoutClick} />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: '#FF8C00',
              cursor: 'pointer',
              padding: '8px'
            }}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div style={{
            display: 'none',
            paddingBottom: '20px',
            borderTop: '1px solid #FFD700',
            marginTop: '10px',
            paddingTop: '15px'
          }} className="mobile-menu">
            <div onClick={() => { navigate('/chef/orders'); setIsMenuOpen(false); }}>
              <MobileNavItem icon={<ClipboardList size={18} />} label="Commandes" primary={location.pathname.startsWith('/chef') && (location.pathname === '/chef' || location.pathname.startsWith('/chef/orders'))} />
            </div>
            <div onClick={() => { navigate('/chef/menu'); setIsMenuOpen(false); }}>
              <MobileNavItem icon={<UtensilsCrossed size={18} />} label="Menu" primary={location.pathname.startsWith('/chef/menu')} />
            </div>
            <div onClick={() => { navigate('/chef/ingredients'); setIsMenuOpen(false); }}>
              <MobileNavItem icon={<Package size={18} />} label="Ingrédients" primary={location.pathname.startsWith('/chef/ingredients')} />
            </div>
            <div onClick={() => { navigate('/chef/stats'); setIsMenuOpen(false); }}>
              <MobileNavItem icon={<BarChart3 size={18} />} label="Statistiques" primary={location.pathname.startsWith('/chef/stats')} />
            </div>
            <MobileNavItem icon={<Bell size={18} />} label="Notifications" badge={unreadCount} />
            <MobileNavItem icon={<User size={18} />} label="Profil" />
            <div onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }}>
              <MobileNavItem icon={<LogOut size={18} />} label="Déconnexion" />
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close notification dropdown */}
      {showNotifications && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowNotifications(false)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-menu {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}

// ============================================
// NAV BUTTON COMPONENT
// ============================================


// ============================================
// NOTIFICATION BUTTON COMPONENT
// ============================================


// ============================================
// PROFILE BUTTON COMPONENT
// ============================================



// ============================================
// MOBILE NAV ITEM COMPONENT
// ============================================
