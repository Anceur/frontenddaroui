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
    { id: 'General', icon: Store, label: 'Général' },
    { id: 'Account', icon: User, label: 'Compte' },
    { id: 'Notifications', icon: Bell, label: 'Notifications' },
    { id: 'Orders', icon: CreditCard, label: 'Commandes' },
    { id: 'Payments', icon: CreditCard, label: 'Paiements' },
    { id: 'Security', icon: Shield, label: 'Sécurité' },
    { id: 'Appearance', icon: Palette, label: 'Apparence' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save action
    setTimeout(() => {
      setIsSaving(false);
      alert('Paramètres enregistrés avec succès !');
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Informations sur le restaurant</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
              Nom du restaurant *
            </label>
            <input
              type="text"
              value={generalSettings.restaurantName}
              onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'restaurantName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                <Mail size={16} className="inline mr-1" style={{ color: '#999999' }} />
                E-mail *
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
                Téléphone *
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
              Adresse *
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Ville</label>
              <input
                type="text"
                value={generalSettings.city}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'city', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>État/Province</label>
              <input
                type="text"
                value={generalSettings.state}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'state', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Code postal</label>
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
                Site web
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Fuseau horaire</label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => handleInputChange(generalSettings, setGeneralSettings, 'timezone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              >
                <option value="America/New_York">Heure de l'Est (ET)</option>
                <option value="America/Chicago">Heure du Centre (CT)</option>
                <option value="America/Denver">Heure des Montagnes (MT)</option>
                <option value="America/Los_Angeles">Heure du Pacifique (PT)</option>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Informations du profil</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Nom complet *</label>
              <input
                type="text"
                value={accountSettings.fullName}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'fullName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Nom d'utilisateur *</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>E-mail *</label>
              <input
                type="email"
                value={accountSettings.email}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Téléphone</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Langue</label>
              <select
                value={accountSettings.language}
                onChange={(e) => handleInputChange(accountSettings, setAccountSettings, 'language', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: '#FFD700', color: '#333333' }}
              >
                <option value="English">Anglais</option>
                <option value="Spanish">Espagnol</option>
                <option value="French">Français</option>
                <option value="German">Allemand</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Format de date</label>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Changer le mot de passe</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Mot de passe actuel</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Confirmer le nouveau mot de passe</label>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Préférences de notification</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          {Object.entries(notificationSettings).map(([key, value]) => {
            const labels: Record<string, string> = {
              orderNotifications: 'Notifications de nouvelles commandes',
              lowStockAlerts: 'Alertes de stock faible',
              staffClockIn: 'Pointage du personnel (entrée/sortie)',
              customerReviews: 'Nouveaux avis clients',
              emailNotifications: 'Notifications par e-mail',
              pushNotifications: 'Notifications push',
              smsNotifications: 'Notifications SMS',
              soundEnabled: 'Alertes sonores'
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
                  className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0'
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Configuration des commandes</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Accepter automatiquement les commandes</span>
            <button
              onClick={() => toggleSwitch(orderSettings, setOrderSettings, 'autoAcceptOrders')}
              className={`relative w-11 h-6 rounded-full transition-colors ${orderSettings.autoAcceptOrders ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${orderSettings.autoAcceptOrders ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
              Délai d'expiration des commandes (minutes)
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Montant minimum de commande (DZD)</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Frais de livraison (DZD)</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Taux de taxe (%)</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Pourcentage de pourboire par défaut (%)</label>
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
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Autoriser les pourboires</span>
            <button
              onClick={() => toggleSwitch(orderSettings, setOrderSettings, 'allowTips')}
              className={`relative w-11 h-6 rounded-full transition-colors ${orderSettings.allowTips ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${orderSettings.allowTips ? 'translate-x-5' : 'translate-x-0'
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Méthodes de paiement</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          {Object.entries(paymentSettings).map(([key, value]) => {
            if (typeof value === 'string') return null;

            const labels: Record<string, string> = {
              acceptCash: 'Accepter les espèces',
              acceptCreditCard: 'Accepter les cartes de crédit',
              acceptDebitCard: 'Accepter les cartes de débit',
              acceptMobilePayments: 'Accepter les paiements mobiles',
              acceptOnlinePayment: 'Accepter les paiements en ligne',
              autoRefundCanceled: 'Remboursement automatique des commandes annulées'
            };

            return (
              <div key={key} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
                <span className="text-sm font-medium" style={{ color: '#333333' }}>
                  {labels[key]}
                </span>
                <button
                  onClick={() => toggleSwitch(paymentSettings, setPaymentSettings, key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            );
          })}

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Fournisseur de paiement</label>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Préférences de sécurité</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <div>
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Authentification à deux facteurs</span>
              <span className="text-xs" style={{ color: '#999999' }}>Ajoutez une couche de sécurité supplémentaire</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'twoFactorAuth')}
              className={`relative w-11 h-6 rounded-full transition-colors ${securitySettings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${securitySettings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Durée de session (minutes)</label>
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
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Alertes de connexion</span>
              <span className="text-xs" style={{ color: '#999999' }}>Recevez des notifications lors de nouvelles connexions</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'loginAlerts')}
              className={`relative w-11 h-6 rounded-full transition-colors ${securitySettings.loginAlerts ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${securitySettings.loginAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <div>
              <span className="text-sm font-medium block" style={{ color: '#333333' }}>Exiger un changement de mot de passe</span>
              <span className="text-xs" style={{ color: '#999999' }}>Forcer des mises à jour périodiques du mot de passe</span>
            </div>
            <button
              onClick={() => toggleSwitch(securitySettings, setSecuritySettings, 'requirePasswordChange')}
              className={`relative w-11 h-6 rounded-full transition-colors ${securitySettings.requirePasswordChange ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${securitySettings.requirePasswordChange ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>

          {securitySettings.requirePasswordChange && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Intervalle de changement de mot de passe (jours)</label>
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
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#333333' }}>Thème et affichage</h3>
        <div className="bg-white rounded-lg border p-6 space-y-4" style={{ borderColor: '#FFD700' }}>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Thème</label>
            <div className="flex gap-4">
              <button
                onClick={() => handleInputChange(appearanceSettings, setAppearanceSettings, 'theme', 'light')}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${appearanceSettings.theme === 'light' ? 'border-orange-500' : 'border-gray-200'
                  }`}
              >
                <Sun size={20} style={{ color: appearanceSettings.theme === 'light' ? '#FF8C00' : '#999999' }} />
                <span className="font-medium" style={{ color: '#333333' }}>Clair</span>
              </button>
              <button
                onClick={() => handleInputChange(appearanceSettings, setAppearanceSettings, 'theme', 'dark')}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-2 ${appearanceSettings.theme === 'dark' ? 'border-orange-500' : 'border-gray-200'
                  }`}
              >
                <Moon size={20} style={{ color: appearanceSettings.theme === 'dark' ? '#FF8C00' : '#999999' }} />
                <span className="font-medium" style={{ color: '#333333' }}>Sombre</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Couleur principale</label>
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Couleur d'accentuation</label>
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
            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>Taille de police</label>
            <select
              value={appearanceSettings.fontSize}
              onChange={(e) => handleInputChange(appearanceSettings, setAppearanceSettings, 'fontSize', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
              style={{ borderColor: '#FFD700', color: '#333333' }}
            >
              <option value="small">Petit</option>
              <option value="medium">Moyen</option>
              <option value="large">Grand</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#FFFAF0' }}>
            <span className="text-sm font-medium" style={{ color: '#333333' }}>Afficher les animations</span>
            <button
              onClick={() => toggleSwitch(appearanceSettings, setAppearanceSettings, 'showAnimations')}
              className={`relative w-11 h-6 rounded-full transition-colors ${appearanceSettings.showAnimations ? 'bg-green-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${appearanceSettings.showAnimations ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
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
          ⚙️ Paramètres
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Gérez les paramètres et préférences de votre restaurant</p>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'font-semibold' : 'font-medium'
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
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
