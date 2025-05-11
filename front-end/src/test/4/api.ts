// src/services/api.ts
import axios from 'axios';
import { ApiResponse, PerformanceSummary } from '../4/dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Configurer axios avec le token si nécessaire
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

export const getDashboardData = async (): Promise<ApiResponse<PerformanceSummary>> => {
    try {
        const response = await axios.get<ApiResponse<PerformanceSummary>>(`${API_URL}/dashboard/performance-summary`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', error);
        throw error;
    }
};
