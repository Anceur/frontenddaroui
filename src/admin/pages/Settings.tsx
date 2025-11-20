import React, { useState } from 'react';
import { Save, Bell, CreditCard, Shield, Palette, Store, User, Mail, Phone, MapPin, Globe, Moon, Sun, Volume2, Key, Lock, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<string>('General');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    restaurantName: 'Nostalgie Restaurant',
    email: 'contact@nostalgie.com',
    phone: '+1 234 567 8900',
    address: '123 Main Street, Downtown',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    website: 'www.nostalgie.com',
    timezone: 'America/New_York',
    currency: 'USD'
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    fullName: 'Amar Admin',
    username: 'admin@nostalgie',
    email: 'admin@nostalgie.com',
    phone: '+1 234 567 8900',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour'
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    lowStockAlerts: true,
    staffClockIn: true,
    customerReviews: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    soundEnabled: true
  });

  // Order Settings
  const [orderSettings, setOrderSettings] = useState({
    autoAcceptOrders: false,
    orderTimeout: '15',
    minimumOrderAmount: '10.00',
    deliveryFee: '3.99',
    taxRate: '8.5',
    allowTips: true,
    defaultTipPercentage: '15'
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCreditCard: true,
    acceptDebitCard: true,
    acceptMobilePayments: true,
    acceptOnlinePayment: true,
    paymentProvider: 'Stripe',
    autoRefundCanceled: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    requirePasswordChange: false,
    passwordChangeDays: '90',
    loginAlerts: true
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    fontSize: 'medium',
    showAnimations: true
  });

  const tabs = [
    { id: 'General', icon: Store, label: 'General' },
    { id: 'Account', icon: User, label: 'Account' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Orders', icon: CreditCard, label: 'Orders' },
    { id: 'Payments', icon: CreditCard, label: 'Payments' },
    { id: 'Security', icon: Shield, label: 'Security' },
    { id: 'Appearance', icon: Palette, label: 'Appearance' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save action
    setTimeout(() => {
      setIsSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const toggleSwitch = (
    settings: any,
    setSettings: any,
    key: string
  ) => {
    setSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  const handleInputChange = (
    settings: any,
    setSettings: any,
    key: string,
    value: string
  ) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Restaurant Information</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
              Restaurant Name *
            </label>
            <input
              type="text"
              value={generalSettings.restaurantName}
              onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'restaurantName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333', focusRing: '#FF8C00' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                <Mail size={16} className="inline mr-1" style={{ color: '#999999' }} />
                Email *
              </label>
              <input
                type="email"
                value={generalSettings.email}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                <Phone size={16} className="inline mr-1" style={{ color: '#999999' }} />
                Phone *
              </label>
              <input
                type="tel"
                value={generalSettings.phone}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
              <MapPin size={16} className="inline mr-1" style={{ color: '#999999' }} />
              Address *
            </label>
            <input
              type="text"
              value={generalSettings.address}
              onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'address', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>City</label>
              <input
                type="text"
                value={generalSettings.city}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'city', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>State</label>
              <input
                type="text"
                value={generalSettings.state}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'state', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Zip Code</label>
              <input
                type="text"
                value={generalSettings.zipCode}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'zipCode', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                <Globe size={16} className="inline mr-1" style={{ color: '#999999' }} />
                Website
              </label>
              <input
                type="text"
                value={generalSettings.website}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'website', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Timezone</label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'timezone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Profile Information</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Full Name *</label>
              <input
                type="text"
                value={accountSettings.fullName}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'fullName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Username *</label>
              <input
                type="text"
                value={accountSettings.username}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'username', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Email *</label>
              <input
                type="email"
                value={accountSettings.email}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Phone</label>
              <input
                type="tel"
                value={accountSettings.phone}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Language</label>
              <select
                value={accountSettings.language}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'language', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Date Format</label>
              <select
                value={accountSettings.dateFormat}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'dateFormat', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Change Password</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Notification Preferences</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          {Object.entries(notificationSettings).map(([key, value]) => {
            const labels: Record<string, string> = {
              orderNotifications: 'New Order Notifications',
              lowStockAlerts: 'Low Stock Alerts',
              staffClockIn: 'Staff Clock In/Out',
              customerReviews: 'New Customer Reviews',
              emailNotifications: 'Email Notifications',
              pushNotifications: 'Push Notifications',
              smsNotifications: 'SMS Notifications',
              soundEnabled: 'Sound Alerts'
            };
            
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
                <div className="flex items-center gap-3">
                  {key === 'soundEnabled' && <Volume2 size={18} style={{ color: '#999999' }} />}
                  <span className="text-sm font-medium" style={{ color: '#333333' }}>
                    {labels[key]}
                  </span>
                </div>
                <button
                  onClick={() => toggleSwitch(notificationSettings, setNotificationSettings, key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderOrderSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Order Configuration</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Auto-accept Orders</span>
            <button
              onClick={() => toggleSwitch(orderSettings, setOrderSettings, 'autoAcceptOrders')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                orderSettings.autoAcceptOrders ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  orderSettings.autoAcceptOrders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
              Order Timeout (minutes)
            </label>
            <input
              type="number"
              value={orderSettings.orderTimeout}
              onChange={(e) => handleInputChange(orderSettings, setOrderSettings, 'orderTimeout', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Minimum Order Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={orderSettings.minimumOrderAmount}
                onChange={(e) => handleInputChange(orderSettings, setOrderSettings, 'minimumOrderAmount', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={orderSettings.deliveryFee}
                onChange={(e) => handleInputChange(orderSettings, setOrderSettings, 'deliveryFee', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={orderSettings.taxRate}
                onChange={(e) => handleInputChange(orderSettings, setOrderSettings, 'taxRate', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Default Tip Percentage (%)</label>
              <input
                type="number"
                value={orderSettings.defaultTipPercentage}
                onChange={(e) => handleInputChange(orderSettings, setOrderSettings, 'defaultTipPercentage', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
                disabled={!orderSettings.allowTips}
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Allow Tips</span>
            <button
              onClick={() => toggleSwitch(orderSettings, setOrderSettings, 'allowTips')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                orderSettings.allowTips ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  orderSettings.allowTips ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Payment Methods</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          {Object.entries(paymentSettings).map(([key, value]) => {
            if (typeof value === 'string') return null;
            
            const labels: Record<string, string> = {
              acceptCash: 'Accept Cash',
              acceptCreditCard: 'Accept Credit Cards',
              acceptDebitCard: 'Accept Debit Cards',
              acceptMobilePayments: 'Accept Mobile Payments',
              acceptOnlinePayment: 'Accept Online Payments',
              autoRefundCanceled: 'Auto-refund Canceled Orders'
            };
            
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
                <span className="text-sm font-medium" style={{ color: '#333333' }}>
                  {labels[key]}
                </span>
                <button
                  onClick={() => toggleSwitch(paymentSettings, setPaymentSettings, key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    value ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Payment Provider</label>
            <select
              value={paymentSettings.paymentProvider}
              onChange={(e) => handleInputChange(paymentSettings, setPaymentSettings, 'paymentProvider', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            >
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Square">Square</option>
              <option value="Authorize.Net">Authorize.Net</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Security Preferences</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <div>
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Two-Factor Authentication</span>
              <span className="text-xs" style={{ color: '#999999' }}>Add an extra layer of security</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'twoFactorAuth')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  securitySettings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Session Timeout (minutes)</label>
            <input
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleInputChange(securitySettings, setSecuritySettings, 'sessionTimeout', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <div>
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Login Alerts</span>
              <span className="text-xs" style={{ color: '#999999' }}>Get notified of new logins</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'loginAlerts')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                securitySettings.loginAlerts ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  securitySettings.loginAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <div>
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Require Password Change</span>
              <span className="text-xs" style={{ color: '#999999' }}>Force periodic password updates</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'requirePasswordChange')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                securitySettings.requirePasswordChange ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  securitySettings.requirePasswordChange ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {securitySettings.requirePasswordChange && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Password Change Interval (days)</label>
              <input
                type="number"
                value={securitySettings.passwordChangeDays}
                onChange={(e) => handleInputChange(securitySettings, setSecuritySettings, 'passwordChangeDays', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Theme & Display</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Theme</label>
            <div className="flex gap-4">
              <button
                onClick={() => handleInputChange(appearanceSettings, setAppearanceSettings, 'theme', 'light')}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  appearanceSettings.theme === 'light' ? 'border-orange-500' : 'border-gray-200'
                }`}
              >
                <Sun size={20} style={{ color: appearanceSettings.theme === 'light' ? '#FF8C00' : '#999999' }} />
                <span className="font-medium" style={{ color: '#333333' }}>Light</span>
              </button>
              <button
                onClick={() => handleInputChange(appearanceSettings, setAppearanceSettings, 'theme', 'dark')}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  appearanceSettings.theme === 'dark' ? 'border-orange-500' : 'border-gray-200'
                }`}
              >
                <Moon size={20} style={{ color: appearanceSettings.theme === 'dark' ? '#FF8C00' : '#999999' }} />
                <span className="font-medium" style={{ color: '#333333' }}>Dark</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'primaryColor', e.target.value)}
                  className="w-12 h-12 rounded border cursor-pointer"
                  style={{ borderColor: '#FFD700' }}
                />
                <input
                  type="text"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'primaryColor', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: '#FFD700', color: '#333333' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={appearanceSettings.accentColor}
                  onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'accentColor', e.target.value)}
                  className="w-12 h-12 rounded border cursor-pointer"
                  style={{ borderColor: '#FFD700' }}
                />
                <input
                  type="text"
                  value={appearanceSettings.accentColor}
                  onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'accentColor', e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: '#FFD700', color: '#333333' }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Font Size</label>
            <select
              value={appearanceSettings.fontSize}
              onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'fontSize', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Show Animations</span>
            <button
              onClick={() => toggleSwitch(appearanceSettings, setAppearanceSettings, 'showAnimations')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                appearanceSettings.showAnimations ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  appearanceSettings.showAnimations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'General': return renderGeneralSettings();
      case 'Account': return renderAccountSettings();
      case 'Notifications': return renderNotificationSettings();
      case 'Orders': return renderOrderSettings();
      case 'Payments': return renderPaymentSettings();
      case 'Security': return renderSecuritySettings();
      case 'Appearance': return renderAppearanceSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#FF8C00' }}>
          ⚙️ Settings
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Manage your restaurant settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border p-2" style={{ borderColor: '#FFD700' }}>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#FFFAF0' : 'transparent',
                      color: isActive ? '#FF8C00' : '#333333'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#FFFAF0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={18} style={{ color: isActive ? '#FF8C00' : '#999999' }} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            {renderContent()}
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg border p-4 flex justify-end" style={{ borderColor: '#FFD700' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FF8C00', color: '#FFFFFF' }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#FFD700';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#FF8C00';
                }
              }}
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

