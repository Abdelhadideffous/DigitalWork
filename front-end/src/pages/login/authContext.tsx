'use client';

import type React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, setAuthToken } from './api';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logoutUser: () => Promise<void>;
    loading: boolean;
    getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // Vérifier si l'utilisateur est déjà connecté au chargement
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setAuthToken(storedToken); // Configurer le token pour les requêtes Axios
        }

        setLoading(false);
    }, []);

    const login = (newToken: string, newUser: User) => {
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setAuthToken(newToken); // Configurer le token pour les requêtes Axios
    };

    const logoutUser = async () => {
        setLoading(true);

        if (token) {
            await authApi.logout(token);
        }

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setAuthToken(null); // Supprimer le token des requêtes Axios
        setLoading(false);
        navigate('/test/00');
        // window.location.href = "/login"
    };

    const getUserRole = () => {
        return user?.role || null;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                login,
                logoutUser,
                loading,
                getUserRole, // Ajouter cette fonction
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
