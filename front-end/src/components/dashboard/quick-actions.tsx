import { Box, Button, Card, CardContent, Grid, Typography, type SxProps, type Theme } from '@mui/material';
import { CalendarPlus, ClipboardPlus, FileText, FolderPlus, HelpCircle, MessageSquarePlus, Settings, UserPlus } from 'lucide-react';
import type React from 'react';

interface QuickActionsProps {
    sx?: SxProps<Theme>;
}

const QuickActions: React.FC<QuickActionsProps> = ({ sx }) => {
    const actions = [
        { icon: <FolderPlus size={20} />, label: 'Nouveau projet', color: '#1976d2' },
        { icon: <ClipboardPlus size={20} />, label: 'Nouvelle EDB', color: '#9c27b0' },
        { icon: <CalendarPlus size={20} />, label: 'Planifier', color: '#ff9800' },
        { icon: <UserPlus size={20} />, label: 'Ajouter utilisateur', color: '#16A249' },
        { icon: <MessageSquarePlus size={20} />, label: 'Message', color: '#2196f3' },
        { icon: <FileText size={20} />, label: 'Rapports', color: '#f44336' },
        { icon: <Settings size={20} />, label: 'Paramètres', color: '#607d8b' },
        { icon: <HelpCircle size={20} />, label: 'Aide', color: '#795548' },
    ];

    return (
        <Card
            sx={{
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
                ...sx,
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
                    Actions rapides
                </Typography>
                <Grid container spacing={2}>
                    {actions.map((action, index) => (
                        <Grid item xs={6} sm={3} md={6} lg={3} key={index}>
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    color: 'text.primary',
                                    '&:hover': {
                                        borderColor: action.color,
                                        bgcolor: `${action.color}10`,
                                        '& .icon': {
                                            color: 'white',
                                            bgcolor: action.color,
                                        },
                                    },
                                    textTransform: 'none',
                                    height: '100%',
                                }}
                            >
                                <Box
                                    className="icon"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: `${action.color}20`,
                                        color: action.color,
                                        p: 1,
                                        borderRadius: 1.5,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {action.icon}
                                </Box>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                    {action.label}
                                </Typography>
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default QuickActions;
