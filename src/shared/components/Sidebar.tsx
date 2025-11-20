import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, ChefHat, BarChart3, Percent, MessageSquare, ChevronLeft, ChevronRight, Sparkles, X, Ruler, Cookie, History, Table, UserCircle, UtensilsCrossed, Bell, Warehouse } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NostalgieSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function NostalgieSidebar({ isMobileOpen = false, onMobileClose }: NostalgieSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initialize with current window width
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track previous pathname to detect actual route changes
  const prevPathnameRef = useRef(location.pathname);
  
  // Close mobile menu when route changes (only if menu is open and path actually changed)
  useEffect(() => {
    // Only run this effect when pathname changes, not when other dependencies change
    const pathnameChanged = location.pathname !== prevPathnameRef.current;
    
    if (pathnameChanged) {
      prevPathnameRef.current = location.pathname;
      // Only close menu if it's mobile, menu is open, and we have a close handler
      if (isMobile && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Only depend on pathname to avoid closing when menu opens

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', path: '/orders', badge: null },
    { id: 'offline-orders', icon: UtensilsCrossed, label: 'Offline Orders', path: '/offline-orders', badge: null },
    { id: 'tables', icon: Table, label: 'Tables', path: '/tables', badge: null },
    { id: 'products', icon: Package, label: 'Menu & Products', path: '/menu', badge: null },
    { id: 'menu-item-sizes', icon: Ruler, label: 'Menu Item Sizes', path: '/menu-item-sizes', badge: null },
    { id: 'ingredients', icon: Cookie, label: 'Ingredients', path: '/ingredients', badge: null },
    { id: 'ingredient-stock', icon: Warehouse, label: 'Ingredient Stock', path: '/ingredient-stock', badge: null },
    { id: 'ingredient-traces', icon: History, label: 'Track Ingredients', path: '/ingredient-traces', badge: null },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics', badge: null },
    { id: 'staff', icon: Users, label: 'Staff', path: '/staff', badge: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', path: '/notifications', badge: null },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on backdrop, not on a child element
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Backdrop clicked');
      if (onMobileClose) {
        onMobileClose();
      }
    }
  };

  const handleCloseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop - Only show on mobile when menu is open */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden transition-opacity"
          onClick={handleBackdropClick}
          style={{ transition: 'opacity 0.3s ease' }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`bg-white h-screen fixed lg:relative transition-all duration-300 ease-in-out overflow-hidden ${
          isMobile ? 'z-[60]' : 'z-50'
        } ${
          !isMobile && isCollapsed ? 'w-20' : 'w-72'
        } ${
          isMobile 
            ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
            : 'translate-x-0'
        }`}
        style={{ 
          borderRight: '1px solid #E5E7EB',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.02)',
          transition: 'width 0.35s ease-in-out, transform 0.35s ease-in-out',
          willChange: 'width, transform'
        }}
      >
      {/* Logo/Header */}
      <div 
        className="h-16 flex items-center px-4 border-b relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)',
          borderColor: '#E5E7EB'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-50"></div>
        
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center flex-1">
            {/* Hamburger Menu Button - Always Visible on Desktop, Close on Mobile */}
            {isMobile ? (
              <button
                onClick={handleCloseClick}
                className="p-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-orange-50 active:scale-95 shrink-0"
                style={{
                  background: 'transparent',
                  color: '#FF8C00'
                }}
                aria-label="Close sidebar"
                type="button"
              >
                <X size={20} />
              </button>
            ) : (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg transition-all duration-300 ease-in-out hover:bg-orange-50 active:scale-95 shrink-0"
                style={{
                  background: 'transparent',
                  color: '#FF8C00'
                }}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                type="button"
              >
                <div className="relative w-5 h-5 flex flex-col justify-center gap-1">
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300"
                    style={{ 
                      background: '#FF8C00',
                      width: '100%'
                    }}
                  />
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300"
                    style={{ 
                      background: '#FF8C00',
                      width: '100%'
                    }}
                  />
                  <span 
                    className="block h-0.5 rounded-full transition-all duration-300"
                    style={{ 
                      background: '#FF8C00',
                      width: '100%'
                    }}
                  />
                </div>
              </button>
            )}


          {/* Admin Text - Only when expanded */}
          {!isCollapsed && (
            <div className="ml-4 flex flex-col">
              <h1 
                className="text-lg font-bold tracking-tight"
                style={{ color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}
              >
                Admin
              </h1>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                Restaurant Dashboard
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="py-3 px-2 overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100vh - 96px)' }}>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.id} className="relative">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                  } rounded-lg transition-all duration-300 ease-in-out group relative`}
                  style={{
                    backgroundColor: isActive ? '#FEF3C7' : 'transparent',
                    position: 'relative',
                  }}
                  title={isCollapsed ? item.label : undefined}
                >
                  {/* Subtle active indicator dot */}
                  {isActive && !isCollapsed && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ 
                        background: '#FF8C00'
                      }}
                    />
                  )}
                  
                  {/* Active dot for collapsed state */}
                  {isActive && isCollapsed && (
                    <div 
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ 
                        background: '#FF8C00'
                      }}
                    />
                  )}
                  
                  <div 
                    className={`rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-orange-100' : 'group-hover:bg-gray-100'
                    }`}
                    style={{
                      width: isCollapsed ? '32px' : '36px',
                      height: isCollapsed ? '32px' : '36px',
                      color: isActive ? '#FF8C00' : '#4B5563'
                    }}
                  >
                    <Icon size={isCollapsed ? 20 : 18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 ml-3 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`text-sm transition-all duration-300 ${
                            isActive ? 'font-semibold' : 'font-medium'
                          }`}
                          style={{ 
                            color: isActive ? '#1F2937' : '#374151',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span 
                            className="px-1.5 py-0.5 rounded-full text-xs font-semibold text-white shrink-0"
                            style={{ 
                              background: '#FF8C00',
                              minWidth: '18px',
                              textAlign: 'center',
                              fontSize: '11px'
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 whitespace-nowrap shadow-lg"
                       style={{ 
                         background: '#1F2937', 
                         color: '#FFFFFF' 
                       }}>
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold bg-orange-500">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Empty bottom padding for visual balance */}
      <div className="h-4" />
    </div>
    </>
  );
}