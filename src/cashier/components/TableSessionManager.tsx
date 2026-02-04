import { useState, useEffect } from 'react';
import axios from 'axios';
import './TableSessionManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Table {
    id: number;
    number: string;
    capacity: number;
    is_available: boolean;
    location: string;
}

interface TableSession {
    id: number;
    table: Table;
    token: string;
    is_active: boolean;
    expires_at: string;
    last_accessed: string;
    created_at: string;
    order_placed: boolean;
    is_valid: boolean;
    is_expired: boolean;
}

export default function TableSessionManager() {
    const [sessions, setSessions] = useState<TableSession[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
        // Refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [sessionsRes, tablesRes] = await Promise.all([
                axios.get(`${API_URL}/table-sessions/`, { headers }),
                axios.get(`${API_URL}/tables/`, { headers })
            ]);

            setSessions(sessionsRes.data.sessions || []);
            setTables(tablesRes.data.tables || []);
            setError('');
        } catch (err: any) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const endSession = async (sessionId: number) => {
        if (!confirm('Are you sure you want to end this session?')) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            await axios.post(
                `${API_URL}/public/table-sessions/end/`,
                { session_id: sessionId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Reload data
            loadData();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to end session');
        }
    };

    const generateQRCode = (tableId: number) => {
        const url = `${window.location.origin}/table/${tableId}`;
        // Open QR code generator (you can integrate a QR library here)
        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`, '_blank');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${minutes}m ${seconds}s`;
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    const activeSessions = sessions.filter(s => s.is_active && s.is_valid);
    const expiredSessions = sessions.filter(s => !s.is_valid || s.is_expired);

    return (
        <div className="table-session-manager">
            <header className="manager-header">
                <h1>Table Session Manager</h1>
                <button onClick={loadData} className="refresh-btn">
                    🔄 Refresh
                </button>
            </header>

            {error && (
                <div className="error-banner">{error}</div>
            )}

            <div className="manager-content">
                {/* Active Sessions */}
                <section className="sessions-section">
                    <h2>Active Sessions ({activeSessions.length})</h2>

                    {activeSessions.length === 0 ? (
                        <p className="empty-message">No active sessions</p>
                    ) : (
                        <div className="sessions-grid">
                            {activeSessions.map(session => (
                                <div key={session.id} className="session-card active">
                                    <div className="session-header">
                                        <h3>Table {session.table.number}</h3>
                                        <span className={`status-badge ${session.order_placed ? 'ordered' : 'browsing'}`}>
                                            {session.order_placed ? '📋 Ordered' : '👀 Browsing'}
                                        </span>
                                    </div>

                                    <div className="session-info">
                                        <div className="info-row">
                                            <span className="label">Location:</span>
                                            <span>{session.table.location || 'N/A'}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Capacity:</span>
                                            <span>{session.table.capacity} guests</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Created:</span>
                                            <span>{formatTime(session.created_at)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Last Active:</span>
                                            <span>{formatTime(session.last_accessed)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Expires In:</span>
                                            <span className="expires-time">{getTimeRemaining(session.expires_at)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Token:</span>
                                            <span className="token">{session.token.substring(0, 16)}...</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => endSession(session.id)}
                                        className="end-session-btn"
                                    >
                                        End Session
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Available Tables */}
                <section className="tables-section">
                    <h2>Available Tables ({tables.filter(t => t.is_available).length})</h2>

                    <div className="tables-grid">
                        {tables.filter(t => t.is_available).map(table => (
                            <div key={table.id} className="table-card available">
                                <h3>Table {table.number}</h3>
                                <div className="table-info">
                                    <p>📍 {table.location || 'Main Hall'}</p>
                                    <p>👥 Capacity: {table.capacity}</p>
                                </div>
                                <button
                                    onClick={() => generateQRCode(table.id)}
                                    className="qr-btn"
                                >
                                    Generate QR Code
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Expired/Inactive Sessions */}
                {expiredSessions.length > 0 && (
                    <section className="sessions-section">
                        <h2>Expired Sessions ({expiredSessions.length})</h2>

                        <div className="sessions-grid">
                            {expiredSessions.map(session => (
                                <div key={session.id} className="session-card expired">
                                    <div className="session-header">
                                        <h3>Table {session.table.number}</h3>
                                        <span className="status-badge expired">⏰ Expired</span>
                                    </div>

                                    <div className="session-info">
                                        <div className="info-row">
                                            <span className="label">Created:</span>
                                            <span>{formatTime(session.created_at)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Expired:</span>
                                            <span>{formatTime(session.expires_at)}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Order Placed:</span>
                                            <span>{session.order_placed ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
