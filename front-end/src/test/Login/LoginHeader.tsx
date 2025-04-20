import { Work as WorkIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

const LoginHeader = () => {
    return (
        <Box
            sx={{
                mb: { xs: 2, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Box
                sx={{
                    bgcolor: '#16A249',
                    color: 'white',
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: '50%',
                    mb: { xs: 1, sm: 2 },
                }}
            >
                <WorkIcon fontSize="large" />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
                DigiWork
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center', px: 2 }}>
                Connectez-vous pour accéder à votre espace de travail
            </Typography>
        </Box>
    );
};

export default LoginHeader;
