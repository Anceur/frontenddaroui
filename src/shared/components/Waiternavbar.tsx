import React, { useState } from 'react';
import { Menu, X, User, Bell, LogOut, Home, Table2, ClipboardList, DollarSign, Settings } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const WaiterNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('tables');
  const [notifications, setNotifications] = useState<number>(3);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tables', label: 'Tables', icon: Table2 },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  return (
    <div className="w-full">
      {/* Desktop Navbar */}
      <nav className="bg-white shadow-md border-b-2" style={{ borderColor: '#FFD700' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold" style={{ color: '#FF8C00' }}>
                <span>Waiter</span>
                <span style={{ color: '#FFD700' }}>Panel</span>
              </div>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? '#FF8C00' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#333333'
                    }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Side Icons */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell size={22} style={{ color: '#333333' }} />
                {notifications > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#FF8C00', color: '#FFFFFF' }}
                  >
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border" style={{ borderColor: '#FFD700' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFAF0' }}>
                  <User size={18} style={{ color: '#FF8C00' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: '#333333' }}>John Doe</p>
                  <p className="text-xs" style={{ color: '#999999' }}>Waiter #42</p>
                </div>
              </div>

              {/* Logout */}
              <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut size={22} style={{ color: '#FF8C00' }} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X size={24} style={{ color: '#FF8C00' }} />
              ) : (
                <Menu size={24} style={{ color: '#FF8C00' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#FFD700' }}>
            <div className="px-4 py-3 space-y-2" style={{ background: 'linear-gradient(135deg, #FFFAF0, #FFFFFF)' }}>
              {/* User Info Mobile */}
              <div className="flex items-center space-x-3 px-3 py-3 rounded-lg border mb-3" style={{ borderColor: '#FFD700', backgroundColor: '#FFFFFF' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFFAF0' }}>
                  <User size={20} style={{ color: '#FF8C00' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#333333' }}>John Doe</p>
                  <p className="text-xs" style={{ color: '#999999' }}>Waiter #42</p>
                </div>
                <button className="ml-auto relative p-2">
                  <Bell size={20} style={{ color: '#333333' }} />
                  {notifications > 0 && (
                    <span 
                      className="absolute top-0 right-0 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                      style={{ backgroundColor: '#FF8C00', color: '#FFFFFF' }}
                    >
                      {notifications}
                    </span>
                  )}
                </button>
              </div>

              {/* Mobile Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleTabClick(item.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? '#FF8C00' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#333333'
                    }}
                  >
                    <Icon size={22} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Logout Mobile */}
              <button 
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mt-2"
                style={{ backgroundColor: '#FFFFFF', color: '#FF8C00' }}
              >
                <LogOut size={22} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Demo Content Area */}
     
    </div>
  );
};

export default WaiterNavbar;