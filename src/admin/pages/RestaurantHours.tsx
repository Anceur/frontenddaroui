import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../shared/api/API';
import { Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';

// Ensure withCredentials true
axios.defaults.withCredentials = true;

const RestaurantHours: React.FC = () => {
    const [openingTime, setOpeningTime] = useState<string>('');
    const [closingTime, setClosingTime] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        fetchHours();
    }, []);

    const fetchHours = async () => {
        try {
            const response = await axios.get(`${API}/restaurant-settings/`);
            if (response.data) {
                // Ensure time strings are in HH:MM format (stripping seconds if present)
                const open = response.data.opening_time?.substring(0, 5) || '';
                const close = response.data.closing_time?.substring(0, 5) || '';
                setOpeningTime(open);
                setClosingTime(close);
            }
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError('Impossible de charger les horaires. Vérifiez votre connexion.');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await axios.put(`${API}/restaurant-settings/`, {
                opening_time: openingTime,
                closing_time: closingTime
            });
            setSuccess('Horaires mis à jour avec succès !');
        } catch (err: any) {
            console.error(err);
            setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 lg:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: '#FF8C00' }}>
                    <Clock size={32} /> Horaires du Restaurant
                </h1>
                <p className="text-gray-500">
                    Définissez les heures d'ouverture et de fermeture du restaurant. Ces horaires servent de référence unique.
                </p>
            </div>

            <div className="bg-white rounded-lg border p-8 max-w-2xl shadow-sm" style={{ borderColor: '#FFD700' }}>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 border border-red-100">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-100">
                        <CheckCircle size={20} />
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Heure d'ouverture
                        </label>
                        <div className="relative">
                            <input
                                type="time"
                                value={openingTime}
                                onChange={(e) => setOpeningTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all bg-gray-50"
                                style={{ borderColor: '#E5E7EB', outlineColor: '#FF8C00' }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Heure de début de service.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Heure de fermeture
                        </label>
                        <div className="relative">
                            <input
                                type="time"
                                value={closingTime}
                                onChange={(e) => setClosingTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all bg-gray-50"
                                style={{ borderColor: '#E5E7EB', outlineColor: '#FF8C00' }}
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-400">Heure de fin de service.</p>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`
                            px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-lg font-bold
                            hover:from-orange-500 hover:to-orange-700 transition-all transform hover:scale-105
                            flex items-center gap-2 shadow-lg
                            ${saving ? 'opacity-70 cursor-not-allowed transform-none' : ''}
                        `}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Enregistrer les horaires
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantHours;
