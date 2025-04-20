import { Container } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Components
import LoginForm from './LoginForm';
import LoginHeader from './LoginHeader';

import api, { API_URLS } from './api';
import { LoginRequest } from './auth';

// Service d'authentification intégré directement dans Login.tsx
const authService = {
    // Login function
    login: async (email: string, password: string) => {
        try {
            const response = await api.post(API_URLS.AUTH.LOGIN, { email, password });

            // Store token and user data in localStorage
            if (response.data.success) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error: any) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return {
                    success: false,
                    error: error.response.data.message || 'Une erreur est survenue',
                };
            } else if (error.request) {
                // The request was made but no response was received
                return {
                    success: false,
                    error: 'Erreur de connexion au serveur',
                };
            } else {
                // Something happened in setting up the request that triggered an Error
                return {
                    success: false,
                    error: 'Erreur lors de la requête',
                };
            }
        }
    },

    // Logout function
    logout: async () => {
        try {
            await api.post(API_URLS.AUTH.LOGOUT);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Erreur lors de la déconnexion' };
        }
    },

    // Get current user
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('auth_token') !== null;
    },
};

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (data: LoginRequest) => {
        // Validation basique
        if (!data.email || !data.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            const result = await authService.login(data.email, data.password);

            if (result.success) {
                // Afficher le message de succès
                setSuccess(true);

                // Redirection après un délai
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError(result.error || 'Une erreur est survenue');
            }
        } catch (err) {
            setError('Erreur de connexion au serveur');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container
            maxWidth="md"
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: { xs: 1, sm: 2 },
                py: { xs: 2, sm: 4 },
            }}
        >
            <LoginHeader />
            <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} success={success} />
        </Container>
    );
};

// Export authService pour pouvoir l'utiliser dans d'autres composants si nécessaire
export { authService };
export default Login;
