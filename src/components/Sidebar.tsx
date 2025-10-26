import React, { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, Settings, ChefHat, BarChart3, Percent, MessageSquare, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NostalgieSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/', badge: null },
    { id: 'orders', icon: ShoppingCart, label: 'Orders', path: '/orders', badge: 8 },
    { id: 'kitchen', icon: ChefHat, label: 'Kitchen Display', path: '/kitchen', badge: null },
    { id: 'products', icon: Package, label: 'Menu & Products', path: '/menu', badge: null },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics', badge: null },
    { id: 'promotions', icon: Percent, label: 'Promotions', path: '/promotions', badge: null },
    { id: 'reviews', icon: MessageSquare, label: 'Reviews', path: '/reviews', badge: 12 },
    { id: 'staff', icon: Users, label: 'Staff', path: '/staff', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/settings', badge: null },
  ];

  return (
    <div 
      className={`bg-white h-screen relative ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
      style={{ 
        borderRight: '1px solid #E5E7EB',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.02)',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Logo/Header */}
      <div 
        className="h-24 flex items-center justify-between px-6 border-b relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #FFFAF0 0%, #FFFFFF 100%)',
          borderColor: '#E5E7EB'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-50"></div>
        
        <div className="relative z-10 flex items-center gap-3 w-full">
          {/* Expanded Logo */}
          <div 
            className={`absolute left-6 transition-opacity duration-500 ease-in-out ${
              isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
            }`}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
                  boxShadow: '0 4px 12px rgba(255, 140, 0, 0.2)'
                }}
              >
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h1 
                  className="text-xl font-bold tracking-tight overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: '#1F2937', fontFamily: 'Poppins, sans-serif' }}
          >
            Nostalgie
          </h1>
                <p className="text-xs overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                  Restaurant Admin
                </p>
              </div>
            </div>
          </div>
          
          {/* Collapsed Logo */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 transition-opacity duration-500 ease-in-out ${
              isCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{ 
                background: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
                boxShadow: '0 4px 12px rgba(255, 140, 0, 0.2)'
              }}
            >
              <Sparkles size={22} className="text-white" />
            </div>
          </div>
          
          {/* Toggle Button in Header */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 group ${
              isCollapsed ? 'right-2' : 'right-2'
            }`}
            style={{
              background: 'transparent',
              color: '#9CA3AF'
            }}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-180"
              style={{ 
                background: isCollapsed 
                  ? '#F9FAFB' 
                  : '#F9FAFB',
                border: '1px solid #E5E7EB',
                color: '#6B7280'
              }}
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </div>
            {/* Tooltip */}
            {!isCollapsed && (
              <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 whitespace-nowrap px-2 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg"
                   style={{ 
                     background: '#1F2937', 
                     color: '#FFFFFF' 
                   }}>
                Collapse
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="py-3 px-2 overflow-y-auto custom-scrollbar" style={{ height: 'calc(100vh - 96px)' }}>
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
                  } rounded-lg transition-all duration-200 group relative`}
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
  );
}