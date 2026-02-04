import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, User, Phone, MapPin, DollarSign, ShoppingBag, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { getCustomers, type Customer } from '../../shared/api/customers';

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Récupérer les clients
  const fetchCustomers = useCallback(async () => {
    try {
      setError(null);
      const response = await getCustomers();
      setCustomers(response.customers || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des clients :', err);
      const errorMessage = err.message || 'Impossible de charger les clients. Veuillez réessayer.';
      setError(errorMessage);
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Rafraîchir la liste
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchCustomers();
  };

  // Filtrer les clients
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1F2937' }}>
                Clients
              </h1>
              <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
                Voir et gérer les informations des clients
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 border-2"
                style={{ borderColor: '#E5E7EB', color: '#374151' }}
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Rafraîchir
              </button>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou adresse..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
            />
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Liste des clients */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin" style={{ color: '#FF8C00' }} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2" style={{ borderColor: '#E5E7EB' }}>
            <User size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500">
              {searchQuery ? 'Essayez d\'ajuster votre recherche' : 'Aucun client n\'a encore passé de commandes'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={`${customer.name}-${customer.phone}`}
                className="bg-white rounded-xl shadow-sm border-2 p-6 transition-all hover:shadow-lg"
                style={{ borderColor: '#E5E7EB' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                    style={{ background: 'linear-gradient(135deg, #FF8C00, #FFD700)' }}>
                    {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3" style={{ color: '#1F2937' }}>
                  {customer.name}
                </h3>

                <div className="space-y-2 mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{customer.address}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingBag size={16} />
                      <span>Total des commandes</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#1F2937' }}>
                      {customer.total_orders}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign size={16} />
                      <span>Total dépensé</span>
                    </div>
                    <span className="font-semibold" style={{ color: '#FF8C00' }}>
                      {Number(customer.total_spent).toFixed(2)} DA
                    </span>
                  </div>
                  {customer.last_order_date && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>Dernière commande</span>
                      </div>
                      <span className="text-gray-600 text-xs">
                        {formatDate(customer.last_order_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
