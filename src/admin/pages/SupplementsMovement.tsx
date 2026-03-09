import { useState, useEffect } from 'react';
import {
    PlusCircle, Search, Download, Activity, RefreshCw,
    Loader2, Calendar, X, ChevronUp, ChevronDown, TrendingUp
} from 'lucide-react';
import { getExtrasMovement, type ExtrasMovement } from '../../shared/api/analytics';

type SortField = 'name' | 'price' | 'today' | 'month' | 'year' | 'revenue_year';
type SortDir = 'asc' | 'desc';

export default function SupplementsMovement() {
    const [data, setData] = useState<ExtrasMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [sortField, setSortField] = useState<SortField>('year');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const fetchData = async () => {
        try {
            const result = await getExtrasMovement(startDate || undefined, endDate || undefined);
            setData(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-20" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3 h-3 text-orange-500" />
            : <ChevronDown className="w-3 h-3 text-orange-500" />;
    };

    const filtered = data
        .filter(item => {
            const q = searchTerm.toLowerCase();
            return (
                item.name.toLowerCase().includes(q) ||
                (item.menu_item_name || '').toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            const mul = sortDir === 'asc' ? 1 : -1;
            if (sortField === 'name') return mul * a.name.localeCompare(b.name);
            return mul * ((a[sortField] as number) - (b[sortField] as number));
        });

    // Summary stats
    const totalExtrasYear = filtered.reduce((s, d) => s + d.year, 0);
    const totalRevenueYear = filtered.reduce((s, d) => s + d.revenue_year, 0);
    const totalExtrasToday = filtered.reduce((s, d) => s + d.today, 0);
    const totalRevenueToday = filtered.reduce((s, d) => s + d.revenue_today, 0);

    const hasPeriod = startDate && endDate;

    if (loading && !refreshing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Chargement de la traçabilité des suppléments...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Traçabilité des Suppléments
                    </h1>
                    <p className="text-gray-600 mt-2 flex items-center gap-2 font-medium">
                        <Activity className="w-4 h-4 text-orange-500" />
                        Analysez les ventes de suppléments et extras par période
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 group"
                        title="Rafraîchir"
                    >
                        <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all duration-200 shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 hover:-translate-y-0.5 active:translate-y-0">
                        <Download className="w-4 h-4" />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Suppléments Aujourd'hui", value: totalExtrasToday, sub: `${totalRevenueToday.toFixed(0)} DA`, color: 'orange' },
                    { label: 'Suppléments Ce Mois', value: filtered.reduce((s, d) => s + d.month, 0), sub: `${filtered.reduce((s, d) => s + d.revenue_month, 0).toFixed(0)} DA`, color: 'blue' },
                    { label: 'Suppléments Cette Année', value: totalExtrasYear, sub: `${totalRevenueYear.toFixed(0)} DA`, color: 'green' },
                    { label: 'Types de Suppléments', value: filtered.length, sub: 'références uniques', color: 'purple' },
                ].map((card, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-xl shadow-gray-200/40 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                        <p className={`text-3xl font-black ${
                            card.color === 'orange' ? 'text-orange-600' :
                            card.color === 'blue' ? 'text-blue-600' :
                            card.color === 'green' ? 'text-emerald-600' : 'text-purple-600'
                        }`}>{card.value}</p>
                        <p className="text-xs text-gray-400 font-semibold mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {card.sub}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/40 border border-gray-100 mb-8 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative group flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un supplément ou un article..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all duration-200 text-gray-700 font-medium placeholder:text-gray-400"
                        />
                    </div>

                    {/* Active indicator */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-2xl border border-orange-100/50 shrink-0">
                        <Activity className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-bold text-orange-700 uppercase tracking-tight">
                            {filtered.length} Supplément{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Date range */}
                <div className="flex flex-col md:flex-row items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-gray-500 font-bold text-sm uppercase tracking-wider shrink-0">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        Filtrer par période :
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="flex-1 md:w-44 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none font-medium text-gray-700 transition-all"
                        />
                        <span className="text-gray-400 font-bold">au</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="flex-1 md:w-44 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 outline-none font-medium text-gray-700 transition-all"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Réinitialiser les dates"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    {hasPeriod && (
                        <span className="ml-auto px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-100 shrink-0">
                            Période personnalisée active
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden relative">
                {refreshing && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                {/* Supplement name */}
                                <th
                                    className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors group"
                                    onClick={() => handleSort('name')}
                                >
                                    <span className="flex items-center gap-1">Supplément <SortIcon field="name" /></span>
                                </th>
                                {/* Price */}
                                <th
                                    className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
                                    onClick={() => handleSort('price')}
                                >
                                    <span className="flex items-center justify-center gap-1">Prix <SortIcon field="price" /></span>
                                </th>

                                {/* Period or standard columns */}
                                {hasPeriod ? (
                                    <th className="px-6 py-5 text-center text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-50/50">
                                        Période
                                    </th>
                                ) : (
                                    <>
                                        <th
                                            className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
                                            onClick={() => handleSort('today')}
                                        >
                                            <span className="flex items-center justify-center gap-1">Aujourd'hui <SortIcon field="today" /></span>
                                        </th>
                                        <th
                                            className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
                                            onClick={() => handleSort('month')}
                                        >
                                            <span className="flex items-center justify-center gap-1">Ce Mois <SortIcon field="month" /></span>
                                        </th>
                                    </>
                                )}

                                {/* Annual */}
                                <th
                                    className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
                                    onClick={() => handleSort('year')}
                                >
                                    <span className="flex items-center justify-center gap-1">Annuel <SortIcon field="year" /></span>
                                </th>

                                {/* Revenue */}
                                <th
                                    className="px-6 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-orange-500 transition-colors"
                                    onClick={() => handleSort('revenue_year')}
                                >
                                    <span className="flex items-center justify-center gap-1">Revenu Annuel <SortIcon field="revenue_year" /></span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((item, idx) => (
                                <tr key={`${item.id}_${idx}`} className="hover:bg-orange-50/20 transition-all duration-200 group">
                                    {/* Name + article */}
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                                                <PlusCircle className="w-5 h-5 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-extrabold">{item.name}</p>
                                                <p className="text-gray-400 text-xs font-semibold tracking-tight mt-0.5">
                                                    Article : {item.menu_item_name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-lg font-black text-orange-600">
                                            +{item.price.toFixed(0)}
                                            <span className="text-[10px] ml-0.5 font-semibold opacity-60">DA</span>
                                        </span>
                                    </td>

                                    {/* Period / standard */}
                                    {hasPeriod ? (
                                        <td className="px-6 py-5 text-center bg-orange-50/10">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-2xl font-black text-orange-600">{item.period}</span>
                                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest opacity-60">
                                                    {item.revenue_period.toFixed(0)} DA
                                                </span>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`text-xl font-black ${item.today > 0 ? 'text-orange-500' : 'text-gray-300'}`}>
                                                    {item.today}
                                                </span>
                                                {item.today > 0 && (
                                                    <p className="text-[10px] text-orange-400 font-bold">{item.revenue_today.toFixed(0)} DA</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xl font-black text-gray-700">{item.month}</span>
                                                <p className="text-[10px] text-gray-400 font-bold">{item.revenue_month.toFixed(0)} DA</p>
                                            </td>
                                        </>
                                    )}

                                    {/* Annual quantity */}
                                    <td className="px-6 py-5 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-xl font-black text-gray-900">{item.year}</span>
                                            {item.year > 50 && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                            )}
                                        </div>
                                    </td>

                                    {/* Annual revenue */}
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-lg font-black text-emerald-600">
                                            {item.revenue_year.toFixed(0)}
                                            <span className="text-[10px] ml-0.5 font-semibold opacity-60">DA</span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                            <PlusCircle className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Aucun supplément trouvé</h3>
                        <p className="text-gray-500 mt-2 font-medium">
                            {searchTerm
                                ? 'Ajustez votre recherche pour trouver des suppléments.'
                                : 'Aucun supplément n\'a encore été commandé. Attendez que des commandes incluant des suppléments soient confirmées.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
