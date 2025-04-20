import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, IconButton, TextField } from '@mui/material';
import { useState } from 'react';
import { LoginRequest } from '../types/auth';

interface LoginFormProps {
    onSubmit: (data: LoginRequest) => Promise<void>;
    isLoading: boolean;
    error: string;
    success: boolean;
}

const LoginForm = ({ onSubmit, isLoading, error, success }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ email, password });
    };

    return (
        <>
            {/* Messages d'erreur et de succès */}
            {error && (
                <Alert severity="error" sx={{ width: '100%', maxWidth: '500px', mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ width: '100%', maxWidth: '500px', mb: 2 }}>
                    Connexion réussie!
                </Alert>
            )}

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    width: '100%',
                    maxWidth: '500px',
                    px: { xs: 2, sm: 0 },
                }}
            >
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    placeholder="nom@exemple.com"
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    sx={{
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#16A249',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#16A249',
                        },
                    }}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="password"
                    name="password"
                    label="Mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                        endAdornment: (
                            <IconButton aria-label="toggle password visibility" onClick={togglePasswordVisibility} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#16A249',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#16A249',
                        },
                    }}
                />

                <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Button variant="text" size="small" sx={{ color: '#16A249', fontWeight: 'bold' }}>
                        Mot de passe oublié?
                    </Button>
                </Box>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                        mt: 3,
                        mb: 2,
                        py: { xs: 1, sm: 1.5 },
                        borderRadius: 1.5,
                        backgroundColor: '#16A249',
                        '&:hover': {
                            backgroundColor: '#138C3E',
                        },
                    }}
                >
                    {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Se connecter'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 } }}>
                    <Button variant="text" size="small" disabled={isLoading} sx={{ color: '#16A249', fontWeight: 'bold', p: 0, minWidth: 'auto' }}>
                        Vous n'avez pas de compte? S'inscrire
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default LoginForm;
