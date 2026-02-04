import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, CreditCard, User, Phone, Star } from 'lucide-react';
import { getClientsFidele, createClientFidele, updateClientFidele, deleteClientFidele } from '../../shared/api/clients-fidele';
import type { ClientFidele, CreateClientFideleData } from '../../shared/api/clients-fidele';

export default function LoyalCustomersManagement() {
    const [clients, setClients] = useState<ClientFidele[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingClient, setEditingClient] = useState<ClientFidele | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<CreateClientFideleData>({
        name: '',
        phone: '',
    });

    // Fetch clients
    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getClientsFidele();
            setClients(data);
        } catch (err: any) {
            setError(err.message || 'Échec du chargement des clients fidèles');
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Filter clients
    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery) ||
        client.loyalty_card_number.includes(searchQuery)
    );

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);

            if (editingClient) {
                await updateClientFidele(editingClient.id, formData);
            } else {
                await createClientFidele(formData);
            }

            // Reset form and close modal
            setFormData({ name: '', phone: '' });
            setEditingClient(null);
            setIsModalOpen(false);

            await fetchClients();
        } catch (err: any) {
            setError(err.message || "Échec de l'enregistrement du client fidèle");
            console.error('Error saving client:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit
    const handleEdit = (client: ClientFidele) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
        });
        setIsModalOpen(true);
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        try {
            setError(null);
            await deleteClientFidele(id);
            setDeleteConfirm(null);
            await fetchClients();
        } catch (err: any) {
            setError(err.message || 'Échec de la suppression du client fidèle');
            console.error('Error deleting client:', err);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Star className="text-orange-500" fill="currentColor" />
                        Clients fidèles
                    </h1>
                    <p className="text-gray-500 mt-1">Gérez vos clients réguliers et votre programme de fidélité</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClient(null);
                        setFormData({ name: '', phone: '' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-orange-200 active:scale-95"
                >
                    <Plus size={20} />
                    Ajouter un client fidèle
                </button>
            </div>

            {/* Stats Cards (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Total des clients fidèles</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Cartes de fidélité actives</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">
                        {clients.filter(c => c.loyalty_card_number).length}
                    </p>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search and Refresh Bar */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, téléphone ou numéro de carte..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-gray-50/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchClients}
                        disabled={loading}
                        className="p-3 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all disabled:opacity-50"
                        title="Actualiser la liste"
                    >
                        <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 border-b border-red-100 flex items-start gap-3">
                        <AlertCircle className="text-red-500 mt-0.5" size={20} />
                        <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Table/List Section */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Carte de fidélité</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total dépensé</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && clients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="animate-spin mx-auto mb-3 text-orange-500" size={32} />
                                        Chargement des clients...
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <User className="text-gray-300" size={32} />
                                        </div>
                                        {searchQuery ? 'Aucun client trouvé correspondant à votre recherche.' : 'Aucun client fidèle pour le moment.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-lg">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{client.name}</p>
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                                                        <Phone size={14} />
                                                        {client.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit border border-blue-100">
                                                <CreditCard size={14} />
                                                <span className="font-mono font-bold tracking-wider">{client.loyalty_card_number}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">DZD {Number(client.total_spent).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Modifier"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(client.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingClient ? 'Modifier le client' : 'Ajouter un client fidèle'}
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {editingClient ? 'Mettre à jour les informations du client' : 'Créer un nouveau profil de fidélité'}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600 shadow-sm border border-transparent hover:border-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nom complet</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                            placeholder="ex. John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Numéro de téléphone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-mono"
                                            placeholder="ex. 05XXXXXXXX"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {!editingClient && (
                                    <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3 mt-4">
                                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                            <CreditCard size={18} />
                                        </div>
                                        <p className="text-xs text-orange-800 leading-relaxed font-medium">
                                            Un numéro de carte de fidélité unique à 8 chiffres sera <span className="underline decoration-orange-300">généré automatiquement</span> pour ce client lors de l'enregistrement.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {editingClient ? 'Mettre à jour le profil' : 'Créer le profil'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 border-4 border-white shadow-sm">
                            <Trash2 size={36} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Êtes-vous sûr ?</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Cela supprimera définitivement le profil de fidélité de ce client. Cette action est irréversible.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
                            >
                                Non, annuler
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                            >
                                Oui, supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
