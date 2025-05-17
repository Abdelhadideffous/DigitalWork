'use client';

import { Work as WorkIcon } from '@mui/icons-material';
import { Box, Button, Container, Typography } from '@mui/material';
import type React from 'react';

const Home: React.FC = () => {
    return (
        <Container
            maxWidth={false}
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                px: 2,
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

            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Bienvenue dans DigiWork Projet
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
                Votre plateforme de gestion de travail numérique
            </Typography>

            <Button
                variant="contained"
                //  color="secondary"

                size="large"
                sx={{
                    minWidth: 200,
                    py: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: '#16A249',
                    '&:hover': { backgroundColor: '#27672a' },
                }}
                onClick={() => {
                    window.location.href = '/test/login';
                }}
            >
                Connexion
            </Button>
        </Container>
    );
};

export default Home;
