import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface TableSession {
    id: number;
    table: {
        id: number;
        number: string;
        capacity: number;
    };
    token: string;
    is_active: boolean;
    expires_at: string;
    order_placed: boolean;
}

interface TableSessionContextType {
    session: TableSession | null;
    loading: boolean;
    error: string | null;
    createSession: (tableNumber: string) => Promise<void>;
    clearSession: () => void;
}

const TableSessionContext = createContext<TableSessionContextType | undefined>(undefined);

export function TableSessionProvider({ children, tableNumber }: { children: ReactNode; tableNumber?: string }) {
    const [session, setSession] = useState<TableSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tableNumber) {
            initializeSession(tableNumber);
        } else {
            setLoading(false);
        }
    }, [tableNumber]);

    const initializeSession = async (tableNum: string) => {
        setLoading(true);
        setError(null);

        // 1. Check for existing session in localStorage
        const savedSessionStr = localStorage.getItem('table_session');

        if (savedSessionStr) {
            try {
                const savedSession = JSON.parse(savedSessionStr);

                // Check if saved session matches the requested table
                // Note: We might allow different table if user moved, but for now strict check
                if (savedSession.table?.number === tableNum) {
                    // Validate the token
                    const isValid = await validateSession(savedSession.token);
                    if (isValid) {
                        // Session is valid, use it
                        setLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.error("Error parsing saved session", e);
                localStorage.removeItem('table_session');
            }
        }

        // 2. If no valid local session, create a new one
        await createSession(tableNum);
    };

    const validateSession = async (token: string): Promise<boolean> => {
        try {
            const response = await axios.post(`${API_URL}/public/table-sessions/validate/`, {
                token: token
            }, {
                withCredentials: false
            });

            if (response.data.valid) {
                setSession(response.data.session);
                localStorage.setItem('table_session', JSON.stringify(response.data.session));
                return true;
            }
        } catch (err) {
            console.error("Session validation failed", err);
        }
        return false;
    };

    const createSession = async (tableNum: string) => {
        try {
            const response = await axios.post(`${API_URL}/public/table-sessions/create/`, {
                table_number: tableNum
            }, {
                withCredentials: false
            });

            if (response.data.success) {
                setSession(response.data.session);
                localStorage.setItem('table_session', JSON.stringify(response.data.session));
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to create table session';
            setError(errorMsg);
            console.error('Error creating session:', err);
        } finally {
            setLoading(false);
        }
    };

    const clearSession = () => {
        setSession(null);
        localStorage.removeItem('table_session');
    };

    return (
        <TableSessionContext.Provider value={{ session, loading, error, createSession, clearSession }}>
            {children}
        </TableSessionContext.Provider>
    );
}

export function useTableSession() {
    const context = useContext(TableSessionContext);
    if (context === undefined) {
        throw new Error('useTableSession must be used within a TableSessionProvider');
    }
    return context;
}
