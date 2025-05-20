import { Box, Button, Card, CardContent, Grid, Paper, Typography, type SxProps, type Theme } from '@mui/material';
import { ArrowRight, Calendar, CheckSquare, FolderKanban, Plus } from 'lucide-react';
import type React from 'react';

interface WelcomeCardProps {
    userName: string;
    stats: {
        projects: number;
        tasks: number;
        completedTasks: number;
    };
    sx?: SxProps<Theme>;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, stats, sx }) => {
    // Obtenir l'heure actuelle pour personnaliser le message
    const currentHour = new Date().getHours();
    let greeting = 'Bonjour';

    if (currentHour < 12) {
        greeting = 'Bonjour';
    } else if (currentHour < 18) {
        greeting = 'Bon après-midi';
    } else {
        greeting = 'Bonsoir';
    }

    // Obtenir la date du jour
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('fr-FR', options);

    // Première lettre en majuscule
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #16A249 0%, #138a3c 100%)',
                color: 'white',
                overflow: 'hidden',
                position: 'relative',
                ...sx,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={7}>
                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {greeting}, {userName} 👋
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                                {capitalizedDate}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                                Voici un aperçu de votre activité aujourd'hui. Vous avez {stats.tasks} tâches en cours et {stats.projects} projets
                                actifs.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<Plus size={18} />}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#16A249',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    Nouveau projet
                                </Button>
                                <Button
                                    variant="outlined"
                                    endIcon={<ArrowRight size={18} />}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                                        textTransform: 'none',
                                        borderRadius: 2,
                                    }}
                                >
                                    Voir mon planning
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 2,
                                    }}
                                >
                                    <FolderKanban size={24} style={{ marginBottom: 8 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        {stats.projects}
                                    </Typography>
                                    <Typography variant="body2">Projets</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 2,
                                    }}
                                >
                                    <CheckSquare size={24} style={{ marginBottom: 8 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        {stats.tasks}
                                    </Typography>
                                    <Typography variant="body2">Tâches</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={4}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        textAlign: 'center',
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Calendar size={24} style={{ marginBottom: 8 }} />
                                    <Typography variant="h6" fontWeight="bold">
                                        {stats.completedTasks}
                                    </Typography>
                                    <Typography variant="body2">Terminées</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>

            {/* Éléments décoratifs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    zIndex: 0,
                }}
            />
        </Card>
    );
};

export default WelcomeCard;
