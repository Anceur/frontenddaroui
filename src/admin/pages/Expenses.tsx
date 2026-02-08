import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    DollarSign,
    Users,
    Trash2,
    Zap,
    Wrench,
    Activity,
    Plus,
    Search,
    Edit2,
    Trash,
    X,
    PieChart as PieChartIcon,
    TrendingDown,
    Info,
    Package,
    Building2,
    Calendar,
    RefreshCw
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar
} from 'recharts';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseAnalytics,
    type Expense,
    type ExpenseAnalytics,
    type ExpenseCategory
} from '../../shared/api/expenses';
import { getIngredients, type Ingredient } from '../../shared/api/ingredients';
import { getAllStaff, type StaffMember } from '../../shared/api/staff';

const CATEGORIES: { value: ExpenseCategory; label: string; icon: any; color: string }[] = [
    { value: 'staff', label: 'Personnel', icon: Users, color: '#4F46E5' },
    { value: 'waste', label: 'Gaspillage/Perte', icon: Trash2, color: '#EF4444' },
    { value: 'utilities', label: 'Charges', icon: Zap, color: '#F59E0B' },
    { value: 'repairs', label: 'Réparations', icon: Wrench, color: '#8B5CF6' },
    { value: 'operational', label: 'Coûts journaliers', icon: Activity, color: '#10B981' },
    { value: 'other', label: 'Autre', icon: Info, color: '#6B7280' },
];

export default function ExpensesDashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('Ce mois-ci');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Toutes les catégories');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);

    // Form State
    const [formData, setFormData] = useState<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>({
        category: 'operational',
        title: '',
        amount: 0,
        ingredient: undefined,
        quantity: undefined,
        staff_member: undefined,
        notes: '',
        date: new Date().toISOString().split('T')[0],
    });

    // Map date range to days
    const getDaysFromRange = (range: string): number => {
        switch (range) {
            case "Aujourd'hui": return 1;
            case 'Hier': return 1;
            case '7 derniers jours': return 7;
            case 'Ce mois-ci': return 30;
            case 'Mois dernier': return 30;
            case 'Cette année': return 365;
            default: return 30;
        }
    };

    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            console.log('--- Expenses Dashboard Loading START ---');

            const days = getDaysFromRange(dateRange);
            const results = await Promise.allSettled([
                getExpenses(),
                getExpenseAnalytics(days),
                getIngredients(),
                getAllStaff()
            ]);

            const expensesRes = results[0];
            const analyticsRes = results[1];
            const ingredientsRes = results[2];

            if (expensesRes.status === 'fulfilled') {
                setExpenses(Array.isArray(expensesRes.value) ? expensesRes.value : []);
            } else {
                console.error('Failed to load expenses:', expensesRes.reason);
            }

            if (analyticsRes.status === 'fulfilled') {
                setAnalytics(analyticsRes.value);
            } else {
                console.error('Failed to load analytics:', analyticsRes.reason);
            }

            if (ingredientsRes.status === 'fulfilled') {
                setIngredients(Array.isArray(ingredientsRes.value) ? ingredientsRes.value : []);
            } else {
                console.error('Failed to load ingredients:', ingredientsRes.reason);
            }

            const staffRes = results[3];
            if (staffRes.status === 'fulfilled') {
                setStaff(Array.isArray(staffRes.value) ? staffRes.value : []);
            } else {
                console.error('Failed to load staff:', staffRes.reason);
            }

            console.log('--- Expenses Dashboard Loading END ---');
        } catch (error) {
            console.error('CRITICAL: Unexpected error in fetchData:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (expense?: Expense) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                category: expense.category,
                title: expense.title,
                amount: expense.amount,
                ingredient: expense.ingredient,
                quantity: expense.quantity,
                staff_member: expense.staff_member,
                notes: expense.notes,
                date: expense.date,
            });
        } else {
            setEditingExpense(null);
            setFormData({
                category: 'operational',
                title: '',
                amount: 0,
                ingredient: undefined,
                quantity: undefined,
                staff_member: undefined,
                notes: '',
                date: new Date().toISOString().split('T')[0],
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingExpense) {
                await updateExpense(editingExpense.id, formData);
            } else {
                await createExpense(formData);
            }
            handleCloseModal();
            fetchData();
        } catch (error: any) {
            console.error('Error saving expense:', error);
            alert(error.response?.data?.error || error.message || "Échec de l'enregistrement de la dépense");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Voulez-vous vraiment supprimer cette dépense ?')) {
            try {
                await deleteExpense(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting expense:', error);
            }
        }
    };

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                exp.notes.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'Toutes les catégories' || exp.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [expenses, searchTerm, selectedCategory]);

    if (loading && !analytics && expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Chargement des données de dépenses...</p>
            </div>
        );
    }

    const COLORS = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.value]: cat.color }), {} as any);

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Analyse des dépenses</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Surveillez et gérez les dépenses du restaurant</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex items-center bg-white rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
                        <select
                            className="bg-transparent border-none text-sm font-bold text-gray-700 focus:outline-none w-full"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option>Aujourd'hui</option>
                            <option>Hier</option>
                            <option>7 derniers jours</option>
                            <option>Ce mois-ci</option>
                            <option>Mois dernier</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => fetchData(true)}
                            disabled={loading}
                            className="flex-1 sm:flex-initial flex items-center justify-center bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-5 w-5 text-gray-500 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline text-sm font-bold text-gray-700">Actualiser</span>
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm sm:text-base">Ajouter une dépense</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Dépenses totales"
                    value={analytics?.summary.total || 0}
                    icon={DollarSign}
                    color="bg-red-50 text-red-600"
                    trend="Loss"
                />
                <SummaryCard
                    title="Coûts du personnel"
                    value={analytics?.summary.staff || 0}
                    icon={Users}
                    color="bg-blue-50 text-blue-600"
                />
                <SummaryCard
                    title="Gaspillage d'ingrédients"
                    value={analytics?.summary.waste || 0}
                    icon={Trash2}
                    color="bg-rose-50 text-rose-600"
                />
                <SummaryCard
                    title="Charges"
                    value={analytics?.summary.utilities || 0}
                    icon={Zap}
                    color="bg-amber-50 text-amber-600"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Expenses by Category Pie Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-orange-500" />
                        Dépenses par catégorie
                    </h2>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics?.categories || []}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={60}
                                    paddingAngle={5}
                                >
                                    {analytics?.categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.category] || '#6B7280'} />
                                    ))}
                                </Pie>
                                <ReTooltip
                                    formatter={(value: number) => `${value.toFixed(2)} DA`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Over Time Line Chart */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        Tendances des dépenses
                    </h2>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics?.timeseries || []}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#6B7280' }}
                                />
                                <Tooltip
                                    formatter={(value: number) => `${value.toFixed(2)} DA`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Supplier & Ingredient Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Purchased Ingredients */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            Ingrédients les plus achetés
                        </h2>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">Info</div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={analytics?.top_ingredients || []}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 italic">* Ces données reflètent les achats d'inventaire et ne sont pas incluses dans le total des dépenses.</p>
                </div>

                {/* Top Suppliers */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-500" />
                                Fournisseurs principaux (fréquence)
                            </h2>
                            <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase">Info</div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={analytics?.top_suppliers || []}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="transactions" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Historique des dépenses</h2>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Rechercher une dépense..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none w-64 font-medium"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-gray-700"
                        >
                            <option value="Toutes les catégories">Toutes les catégories</option>
                            {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Dépense</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Catégorie</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Montant</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.map((expense) => {
                                const category = CATEGORIES.find(c => c.value === expense.category);
                                const Icon = category?.icon || Info;
                                return (
                                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-gray-600">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-extrabold text-gray-900">{expense.title}</p>
                                                <div className="flex flex-col gap-0.5">
                                                    {expense.category === 'waste' && expense.ingredient && (
                                                        <p className="text-xs font-bold text-orange-600">
                                                            Gaspillé : {expense.quantity} {ingredients.find(i => i.id === expense.ingredient)?.unit || 'unités'} de {ingredients.find(i => i.id === expense.ingredient)?.name}
                                                        </p>
                                                    )}
                                                    {expense.category === 'staff' && expense.staff_member && (
                                                        <p className="text-xs font-bold text-blue-600">
                                                            Personnel : {staff.find(s => s.id === expense.staff_member)?.name} ({staff.find(s => s.id === expense.staff_member)?.role})
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 line-clamp-1">{expense.notes}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getCategoryStyles(expense.category)}`}>
                                                <Icon size={12} />
                                                {category?.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-black text-red-600">{Number(expense.amount).toFixed(2)} DA</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(expense)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(expense.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredExpenses.length === 0 && (
                        <div className="py-20 text-center text-gray-400">
                            <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">Aucune dépense trouvée pour cette période</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                                    {editingExpense ? 'Modifier la dépense' : 'Ajouter une nouvelle dépense'}
                                </h3>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Titre</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                                    placeholder="ex. Salaires du personnel - Déc"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Montant (DA)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold text-red-600"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Catégorie</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                                >
                                    {CATEGORIES.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                                </select>
                            </div>

                            {formData.category === 'waste' && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-1 duration-200">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Ingrédient</label>
                                        <select
                                            required
                                            value={formData.ingredient || ''}
                                            onChange={e => setFormData({ ...formData, ingredient: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-blue-700"
                                        >
                                            <option value="">Sélectionner un ingrédient</option>
                                            {ingredients.map(ing => (
                                                <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Quantité gaspillée</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.quantity || ''}
                                            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-blue-700"
                                            placeholder="ex. 5.0"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.category === 'staff' && (
                                <div className="animate-in slide-in-from-top-1 duration-200">
                                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Membre du personnel</label>
                                    <select
                                        required
                                        value={formData.staff_member || ''}
                                        onChange={e => setFormData({ ...formData, staff_member: Number(e.target.value) })}
                                        className="w-full px-4 py-3 bg-blue-50/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold text-blue-700"
                                    >
                                        <option value="">Sélectionner un membre du personnel</option>
                                        {staff.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} - {member.role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-medium h-24"
                                    placeholder="Détails optionnels..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-100 mt-4"
                            >
                                {editingExpense ? 'Mettre à jour la dépense' : 'Enregistrer la dépense'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SummaryCardProps {
    title: string;
    value: number;
    icon: any;
    color: string;
    trend?: string;
}

function SummaryCard({ title, value, icon: Icon, color, trend }: SummaryCardProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-lg shadow-gray-200/40 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 group-hover:rotate-12 transition-transform duration-500 ${color.split(' ')[1]}`}>
                <Icon className="w-full h-full" />
            </div>
            <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${color}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</h4>
                    <p className="text-2xl font-black text-gray-900">{value.toLocaleString()} DA</p>
                </div>
            </div>
            {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                    <div className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-black uppercase tracking-tight">
                        DÉBIT
                    </div>
                    <span className="text-[10px] font-bold text-red-400 italic">Total dépensé</span>
                </div>
            )}
        </div>
    );
}

function getCategoryStyles(category: string) {
    switch (category) {
        case 'staff': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'waste': return 'bg-red-50 text-red-600 border-red-100';
        case 'utilities': return 'bg-amber-50 text-amber-600 border-amber-100';
        case 'repairs': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'operational': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
}
