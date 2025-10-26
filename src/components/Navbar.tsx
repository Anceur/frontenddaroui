import React, { useState } from 'react';
import { Search, Bell, User, ChevronDown, Menu, Settings, HelpCircle, LogOut } from 'lucide-react';

interface Notification {
  id: number;
  text: string;
  time: string;
  unread: boolean;
  type: 'order' | 'alert' | 'info';
}

export default function NostalgieNavbar() {
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const notifications: Notification[] = [
    { id: 1, text: 'New order #1234 received', time: '2 min ago', unread: true, type: 'order' },
    { id: 2, text: 'Low stock alert: French Fries', time: '15 min ago', unread: true, type: 'alert' },
    { id: 3, text: 'Staff member John clocked in', time: '1 hour ago', unread: false, type: 'info' },
  ];

  const unreadCount: number = notifications.filter(n => n.unread).length;

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order':
        return '🛒';
      case 'alert':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <nav 
      className="h-20 bg-white border-b flex items-center justify-between px-6"
      style={{ borderColor: '#E5E7EB' }}
    >
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Search size={18} style={{ color: '#9CA3AF' }} />
          </div>
          <input
            type="text"
            placeholder="Search orders, products, staff..."
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
      </div>

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
            title="Notifications"
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
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-fade-in"
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
                {notifications.map((notif: Notification) => (
                  <button
                    key={notif.id}
                    className="w-full px-5 py-3.5 border-b hover:bg-gray-50 transition-colors text-left"
                    style={{ borderColor: '#F3F4F6' }}
                  >
                    <div className="flex items-start gap-3">
                      {notif.unread && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                          style={{ backgroundColor: '#FF8C00' }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-base shrink-0">{getNotificationIcon(notif.type)}</span>
                          <p style={{ color: '#1F2937' }} className={`text-sm ${notif.unread ? 'font-semibold' : 'font-normal'}`}>
                            {notif.text}
                          </p>
                        </div>
                        <p style={{ color: '#6B7280' }} className="text-xs">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button 
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

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
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
                Admin User
              </p>
              <p className="text-xs" style={{ color: '#6B7280' }}>
                Manager
              </p>
            </div>
            <ChevronDown size={16} style={{ color: '#6B7280' }} className="group-hover:text-orange-600" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border overflow-hidden z-50 animate-fade-in"
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
                    <p className="font-semibold text-sm" style={{ color: '#1F2937' }}>Admin User</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>admin@nostalgie.com</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }}>
                  <User size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>My Profile</span>
                </button>
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }}>
                  <Settings size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>Account Settings</span>
                </button>
                <button className="w-full px-5 py-2.5 text-left hover:bg-gray-50 transition-colors text-sm flex items-center gap-3 group" style={{ color: '#374151' }}>
                  <HelpCircle size={16} style={{ color: '#9CA3AF' }} className="group-hover:text-orange-600" />
                  <span>Help & Support</span>
                </button>
              </div>
              <div className="border-t" style={{ borderColor: '#E5E7EB' }}>
                <button 
                  className="w-full px-5 py-3 text-left font-medium hover:bg-red-50 transition-colors text-sm flex items-center gap-3 group"
                  style={{ color: '#DC2626' }}
                >
                  <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Sign Out</span>
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