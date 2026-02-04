import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, RefreshCw, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle,
    Percent, DollarSign, Package, Calendar, Tag, CheckCircle, Info, Calculator, ArrowRight, Clock
} from 'lucide-react';
import {
    getPromotions, createPromotion, updatePromotion, deletePromotion
} from '../../shared/api/promotions';
import type { Promotion, CreatePromotionData } from '../../shared/api/promotions';
import { getMenuItems } from '../../shared/api/menu-items';
import type { MenuItem } from '../../shared/api/menu-items';

// Utility for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount);
};

export default function Promotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    // Editor State
    const [itemSearchQuery, setItemSearchQuery] = useState('');
    const [formData, setFormData] = useState<CreatePromotionData & { applicable_sizes: number[] }>({
        name: '',
        description: '',
        promotion_type: 'percentage',
        value: '',
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        is_active: true,
        status: 'draft',
        applicable_items: [],
        applicable_sizes: [],
        combo_items: []
    });

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [promos, items] = await Promise.all([getPromotions(), getMenuItems()]);
            setPromotions(promos);
            setMenuItems(items);
        } catch (err: any) {
            setError(err.message || 'Échec du chargement des promotions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filtered Promotions for the table
    const filteredPromotions = promotions.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.promotion_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Derived State: Conflict Intelligence (for UI warnings)
    const activePromotions = useMemo(() =>
        promotions.filter(p => p.status === 'active' || p.display_status === 'Live'),
        [promotions]);

    const getConflictingPromotions = (itemId: number, sizeId?: number | null) => {
        return activePromotions.filter(p =>
            p.id !== editingPromotion?.id && (
                (p.applicable_items || []).includes(itemId) ||
                (sizeId && (p.applicable_sizes || []).includes(sizeId)) ||
                (p.combo_items || []).some(ci => ci.menu_item === itemId && (!sizeId || ci.menu_item_size === sizeId))
            )
        );
    };

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter(item =>
            item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
        );
    }, [menuItems, itemSearchQuery]);

    // Live Math Preview Calculation
    const livePreview = useMemo(() => {
        if (!formData.value || parseFloat(formData.value) <= 0) return null;

        if (formData.promotion_type === 'combo_fixed_price') {
            if (formData.combo_items && formData.combo_items.length > 0) {
                const bundleTotal = formData.combo_items.reduce((acc, ci) => {
                    const item = menuItems.find(i => i.id === ci.menu_item);
                    if (!item) return acc;
                    let price = parseFloat(String(item.price));
                    if (ci.menu_item_size) {
                        const size = item.sizes?.find(s => s.id === ci.menu_item_size);
                        if (size) price = parseFloat(String(size.price));
                    }
                    return acc + (price * ci.quantity);
                }, 0);
                const val = parseFloat(formData.value) || 0;
                return {
                    original: bundleTotal,
                    final: val,
                    saved: bundleTotal - val,
                    type: 'Bundle'
                }
            }
            return null;
        }

        let sampleItem = menuItems.find(i => formData.applicable_items?.includes(i.id));
        let sampleSize = null;

        if (!sampleItem && formData.applicable_sizes?.length! > 0) {
            const szId = formData.applicable_sizes[0];
            sampleItem = menuItems.find(i => i.sizes?.some(s => s.id === szId));
            sampleSize = sampleItem?.sizes?.find(s => s.id === szId);
        }

        if (!sampleItem) sampleItem = menuItems[0];
        if (!sampleItem) return null;

        const originalPrice = sampleSize ? parseFloat(String(sampleSize.price)) : parseFloat(String(sampleItem.price));
        let finalPrice = originalPrice;
        let discountAmount = 0;
        const val = parseFloat(formData.value) || 0;

        if (formData.promotion_type === 'percentage') {
            discountAmount = originalPrice * (val / 100);
            finalPrice = originalPrice - discountAmount;
        } else if (formData.promotion_type === 'fixed_amount') {
            discountAmount = val;
            finalPrice = originalPrice - discountAmount;
        }

        return {
            original: originalPrice,
            final: Math.max(0, finalPrice),
            saved: discountAmount,
            itemName: sampleItem.name + (sampleSize ? ` (${sampleSize.size})` : ''),
            type: 'Unit'
        };
    }, [formData, menuItems]);

    // Handlers
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setSubmitting(true);
            if (editingPromotion) {
                await updatePromotion(editingPromotion.id, formData);
            } else {
                await createPromotion(formData);
            }
            await fetchData();
            setIsModalOpen(false);
        } catch (err: any) {
            setError(err.message || "Échec de l'enregistrement de la promotion");
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (p: Promotion) => {
        setEditingPromotion(p);
        const promoSizes = (p as any).applicable_sizes || [];
        setFormData({
            name: p.name,
            description: p.description || '',
            promotion_type: p.promotion_type,
            value: p.value,
            start_date: p.start_date.slice(0, 16),
            end_date: p.end_date.slice(0, 16),
            is_active: p.is_active,
            status: p.status,
            applicable_items: p.applicable_items,
            applicable_sizes: promoSizes,
            combo_items: p.combo_items.map(ci => ({
                menu_item: ci.menu_item,
                menu_item_size: ci.menu_item_size,
                quantity: ci.quantity
            }))
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
            await deletePromotion(id);
            await fetchData();
        }
    };

    const resetForm = () => {
        setEditingPromotion(null);
        setFormData({
            name: '',
            description: '',
            promotion_type: 'percentage',
            value: '',
            start_date: new Date().toISOString().slice(0, 16),
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            is_active: true,
            status: 'draft',
            applicable_items: [],
            applicable_sizes: [],
            combo_items: []
        });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#FF8C00' }}>
                        <Tag className="w-8 h-8" />
                        Gestion des promotions
                    </h1>
                    <p className="text-sm sm:text-base" style={{ color: '#999999' }}>Gérez les remises, les packs et les campagnes marketing</p>
                </div>
                <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all shadow-md active:scale-95 hover:brightness-110"
                    style={{ backgroundColor: '#FF8C00' }}
                >
                    <Plus size={20} />
                    Nouvelle promotion
                </button>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-lg border p-4 mb-6 flex flex-col sm:flex-row gap-4" style={{ borderColor: '#FFD700' }}>
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher des promotions..."
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchData}
                    className="p-2 border rounded-lg transition-all hover:bg-gray-50 flex items-center justify-center"
                    style={{ borderColor: '#FFD700' }}
                    disabled={loading}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} style={{ color: '#FF8C00' }} />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Erreur</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="bg-white rounded-lg border p-12 flex items-center justify-center shadow-sm" style={{ borderColor: '#FFD700' }}>
                    <Loader2 size={42} className="animate-spin text-orange-500" />
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: '#FFD700' }}>
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">Aucune promotion trouvée</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border overflow-hidden shadow-sm" style={{ borderColor: '#FFD700' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#FFFAF0]" style={{ borderBottom: '1px solid #FFD700' }}>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-800 uppercase tracking-widest">Promotion</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-800 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-800 uppercase tracking-widest">Valeur</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-800 uppercase tracking-widest">Statut</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-orange-800 uppercase tracking-widest">Planification</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-orange-800 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPromotions.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{p.name}</span>
                                                <span className="text-[10px] text-gray-400 font-medium line-clamp-1">{p.description || 'Aucune description'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded bg-orange-50 text-orange-600">
                                                    {p.promotion_type === 'percentage' && <Percent size={14} />}
                                                    {p.promotion_type === 'fixed_amount' && <DollarSign size={14} />}
                                                    {p.promotion_type === 'combo_fixed_price' && <Package size={14} />}
                                                </div>
                                                <span className="text-xs font-semibold capitalize">{p.promotion_type.replace(/_/g, ' ')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-orange-600">
                                                {p.promotion_type === 'percentage' ? `${parseFloat(String(p.value))}%` : formatCurrency(parseFloat(String(p.value)))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${p.display_status === 'Live' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    p.display_status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        'bg-gray-50 text-gray-500 border-gray-200'
                                                }`}>
                                                {p.display_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[10px] font-medium text-gray-500">
                                                <span>Du : {new Date(p.start_date).toLocaleDateString()}</span>
                                                <span>Au : {new Date(p.end_date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal-based Designer */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in border border-orange-100">
                        {/* Header */}
                        <div className="px-8 py-6 border-b flex justify-between items-center bg-[#FFFAF0]" style={{ borderColor: '#FFD700' }}>
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#FF8C00' }}>
                                    {editingPromotion ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {editingPromotion ? 'Modifier la stratégie' : 'Créer une nouvelle stratégie'}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300 mt-1">Concepteur de campagne</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-orange-100 rounded-full transition-colors text-gray-400"><X /></button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Form Elements */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Nom</label>
                                            <input
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-5 py-3 rounded-xl border-2 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-semibold"
                                                style={{ borderColor: '#FFD700' }}
                                                placeholder="ex. Spécial Aïd"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Visibilité</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                                    className="flex-1 px-4 py-3 rounded-xl border-2 font-bold text-sm outline-none"
                                                    style={{ borderColor: '#FFD700' }}
                                                >
                                                    <option value="draft">Brouillon</option>
                                                    <option value="active">Actif</option>
                                                </select>
                                                <button
                                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                                    className={`px-4 rounded-xl border-2 font-bold text-[10px] uppercase transition-all ${formData.is_active ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                                                >{formData.is_active ? 'En ligne' : 'Hors ligne'}</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-5 py-3 rounded-xl border-2 min-h-[80px] text-sm resize-none outline-none font-medium text-gray-600"
                                            style={{ borderColor: '#FFD700' }}
                                            placeholder="Ceci apparaîtra sur la bannière client"
                                        />
                                    </div>
                                </section>

                                <section className="p-6 rounded-2xl bg-orange-50 border border-orange-100 space-y-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1 space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-orange-600">Modèle</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['percentage', 'fixed_amount', 'combo_fixed_price'] as const).map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setFormData({ ...formData, promotion_type: t })}
                                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.promotion_type === t ? 'border-orange-500 bg-white text-orange-600 shadow-sm' : 'border-orange-100 bg-white/50 text-gray-400 hover:border-orange-200'}`}
                                                    >
                                                        {t === 'percentage' && <Percent size={18} />}
                                                        {t === 'fixed_amount' && <DollarSign size={18} />}
                                                        {t === 'combo_fixed_price' && <Package size={18} />}
                                                        <span className="text-[9px] font-black uppercase whitespace-nowrap">{t.split('_')[0]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-orange-600">Valeur</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.value}
                                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-xl border-2 text-2xl font-black outline-none"
                                                    style={{ borderColor: '#FFD700' }}
                                                    placeholder="0.00"
                                                />
                                                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-orange-400">{formData.promotion_type === 'percentage' ? '%' : 'DA'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-200/30">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1"><Calendar size={10} /> Date de début</label>
                                            <input type="datetime-local" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} className="w-full p-2.5 rounded-lg border border-orange-200 bg-white text-xs font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-orange-400 flex items-center gap-1"><Clock size={10} /> Date de fin</label>
                                            <input type="datetime-local" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} className="w-full p-2.5 rounded-lg border border-orange-200 bg-white text-xs font-bold" />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Inventory Selector */}
                            <div className="lg:w-96 bg-gray-50 border-l border-gray-100 flex flex-col p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Catalogue</h4>
                                    <div className="relative">
                                        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input
                                            value={itemSearchQuery}
                                            onChange={e => setItemSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 rounded-lg border bg-white text-[10px] outline-none w-32 focus:w-40 transition-all font-bold"
                                            placeholder="RECHERCHE RAPIDE"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                    {formData.promotion_type === 'combo_fixed_price' ? (
                                        <div className="space-y-6">
                                            {/* Combo Status */}
                                            <div className="p-4 rounded-xl bg-gray-900 text-white space-y-3 shadow-lg">
                                                <div className="flex items-center gap-2 text-orange-500">
                                                    <Package size={14} />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pack en cours</span>
                                                </div>
                                                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                    {formData.combo_items.map((ci, idx) => {
                                                        const itm = menuItems.find(i => i.id === ci.menu_item);
                                                        const sz = itm?.sizes?.find(s => s.id === ci.menu_item_size);
                                                        return (
                                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-bold line-clamp-1">{itm?.name}</span>
                                                                    <span className="text-[8px] opacity-40 uppercase">{sz?.size || 'Standard'} (x{ci.quantity})</span>
                                                                </div>
                                                                <button onClick={() => {
                                                                    const items = [...formData.combo_items];
                                                                    items.splice(idx, 1);
                                                                    setFormData({ ...formData, combo_items: items });
                                                                }} className="text-white/20 hover:text-red-400"><Trash2 size={12} /></button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Selector */}
                                            <div className="space-y-2">
                                                {filteredMenuItems.map(item => (
                                                    <div key={item.id} className="p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-300 transition-all cursor-default">
                                                        <h5 className="text-[11px] font-black">{item.name}</h5>
                                                        {item.sizes && item.sizes.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {item.sizes.map(sz => (
                                                                    <button key={sz.id} onClick={() => setFormData({ ...formData, combo_items: [...formData.combo_items, { menu_item: item.id, menu_item_size: sz.id, quantity: 1 }] })} className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[8px] font-black hover:bg-orange-600 hover:text-white transition-all">+ {sz.size}</button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => setFormData({ ...formData, combo_items: [...formData.combo_items, { menu_item: item.id, quantity: 1 }] })} className="mt-2 w-full py-1.5 rounded-lg bg-orange-50 text-orange-600 text-[8px] font-black hover:bg-orange-600 hover:text-white transition-all">AJOUTER SEUL</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredMenuItems.map(item => {
                                                const isFullSelected = formData.applicable_items?.includes(item.id);
                                                const szTotal = item.sizes?.length || 0;
                                                const szSel = formData.applicable_sizes?.filter(id => item.sizes?.some(s => s.id === id)).length || 0;

                                                return (
                                                    <div key={item.id} className={`p-4 rounded-xl border-2 transition-all ${isFullSelected || szSel > 0 ? 'bg-white border-orange-500 shadow-sm' : 'bg-white border-transparent hover:border-orange-100'}`}>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-bold text-gray-900">{item.name}</span>
                                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{item.category}</span>
                                                            </div>
                                                            {!item.sizes?.length && (
                                                                <button
                                                                    onClick={() => {
                                                                        const cur = formData.applicable_items!;
                                                                        setFormData({ ...formData, applicable_items: isFullSelected ? cur.filter(id => id !== item.id) : [...cur, item.id] })
                                                                    }}
                                                                    className={`p-1.5 rounded-lg border-2 ${isFullSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-100 text-gray-200'}`}
                                                                ><CheckCircle size={14} /></button>
                                                            )}
                                                        </div>
                                                        {item.sizes && item.sizes.length > 0 && (
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {item.sizes.map(sz => {
                                                                    const sel = formData.applicable_sizes?.includes(sz.id);
                                                                    return (
                                                                        <button
                                                                            key={sz.id}
                                                                            onClick={() => {
                                                                                const cur = formData.applicable_sizes!;
                                                                                setFormData({ ...formData, applicable_sizes: sel ? cur.filter(id => id !== sz.id) : [...cur, sz.id] })
                                                                            }}
                                                                            className={`py-1.5 rounded flex items-center justify-between px-2 text-[8px] font-black uppercase tracking-tighter ${sel ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                                        >{sz.size} {sel && <CheckCircle size={8} />}</button>
                                                                    )
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Logic */}
                        <div className="p-8 border-t bg-gray-50 flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="flex-1 w-full md:w-auto">
                                {livePreview && (
                                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-white border border-orange-200 shadow-sm">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-orange-300 uppercase">Aperçu de l’impact</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black text-gray-900">{formatCurrency(livePreview.final)}</span>
                                                <span className="text-xs text-gray-400 line-through">{formatCurrency(livePreview.original)}</span>
                                            </div>
                                        </div>
                                        <div className="h-10 w-px bg-orange-100" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-green-500 uppercase">Efficacité</span>
                                            <span className="text-sm font-bold text-green-600">Économie de {formatCurrency(livePreview.saved)} (-{((livePreview.saved / livePreview.original) * 100).toFixed(0)}%)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Annuler</button>
                                <button onClick={handleSave} className="flex-1 md:flex-none px-12 py-4 rounded-xl text-white font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-orange-200 transition-all active:scale-95 group flex items-center justify-center gap-3" style={{ backgroundColor: '#FF8C00' }}>
                                    {submitting ? <Loader2 className="animate-spin" /> : editingPromotion ? 'Mettre à jour la stratégie' : 'Lancer la campagne'}
                                    {!submitting && <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFD700; }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
}
