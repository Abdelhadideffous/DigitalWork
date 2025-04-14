import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Stack,
    LinearProgress,
    Button,
    Tabs,
    Tab,
    Badge,
    Avatar,
    Chip,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Menu,
    MenuItem
} from '@mui/material';
import { 
    ArrowBack, 
    ChatBubbleOutline, 
    Edit, 
    Delete, 
    MoreVert,
    CalendarToday,
    AccessTime,
    Group,
    Assignment,
    Comment,
    CheckCircle,
    Warning,
    Error,
    Add
} from '@mui/icons-material';
import { projectApi } from './api';

interface Project {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    status_id: number;
    priority_id: number;
    progress?: number;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const getStatusColor = (statusId: number) => {
    switch (statusId) {
        case 1: return '#ff9800'; // En attente - Orange
        case 2: return '#2196f3'; // En cours - Bleu
        case 3: return '#4caf50'; // Terminé - Vert
        case 4: return '#f44336'; // Annulé - Rouge
        default: return '#9e9e9e'; // Gris par défaut
    }
};

const getPriorityColor = (priorityId: number) => {
    switch (priorityId) {
        case 1: return '#f44336'; // Urgent - Rouge
        case 2: return '#ff9800'; // Haute - Orange
        case 3: return '#2196f3'; // Moyenne - Bleu
        case 4: return '#4caf50'; // Basse - Vert
        default: return '#9e9e9e'; // Gris par défaut
    }
};

const ProjetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editedProject, setEditedProject] = useState<Project | null>(null);

    const [statuses] = useState([
        { id: 1, name: 'En attente' },
        { id: 2, name: 'En cours' },
        { id: 3, name: 'Terminé' },
        { id: 4, name: 'Annulé' }
    ]);

    const [priorities] = useState([
        { id: 1, name: 'Urgent' },
        { id: 2, name: 'Haute' },
        { id: 3, name: 'Moyenne' },
        { id: 4, name: 'Basse' }
    ]);

    useEffect(() => {
        const loadProject = async () => {
            try {
                if (id) {
                    const data = await projectApi.getProjectById(parseInt(id));
                    setProject(data);
                    setEditedProject(data);
                }
            } catch (error) {
                console.error('Error loading project:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        setOpenEditDialog(true);
        handleMenuClose();
    };

    const handleDelete = async () => {
        if (project) {
            try {
                await projectApi.deleteProject(project.id);
                navigate('/test/3');
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
        handleMenuClose();
    };

    const handleUpdateProject = async () => {
        if (editedProject) {
            try {
                await projectApi.updateProject(editedProject.id, editedProject);
                setProject(editedProject);
                setOpenEditDialog(false);
            } catch (error) {
                console.error('Error updating project:', error);
            }
        }
    };

    if (loading || !project) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 2
            }}>
                <CircularProgress 
                    sx={{ 
                        color: '#2e7d32',
                        animationDuration: '1.5s'
                    }} 
                    size={60}
                    thickness={4}
                />
                <Typography variant="h6" color="text.secondary">
                    Chargement du projet...
                </Typography>
            </Box>
        );
    }

    const tabs = ['Vue d\'ensemble', 'Tâches', 'Équipe', 'Commentaires'];

    const renderTabContent = () => {
        switch (tabValue) {
            case 0: // Vue d'ensemble
                return (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Project Information */}
                        <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Informations du projet
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom fontSize="0.875rem">
                                        Statut
                                    </Typography>
                                    <Box sx={{ 
                                        display: 'inline-flex',
                                        bgcolor: project.status_id === 2 ? '#e8f5e9' : '#f5f5f5',
                                        color: project.status_id === 2 ? '#2e7d32' : 'text.secondary',
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 3,
                                        fontSize: '0.875rem'
                                    }}>
                                        {statuses.find(s => s.id === project.status_id)?.name}
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom fontSize="0.875rem">
                                        Date de début
                                    </Typography>
                                    <Typography fontSize="0.875rem">{formatDate(project.start_date)}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom fontSize="0.875rem">
                                        Date d'échéance
                                    </Typography>
                                    <Typography fontSize="0.875rem">{formatDate(project.end_date)}</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom fontSize="0.875rem">
                                        Département
                                    </Typography>
                                    <Typography fontSize="0.875rem">Marketing</Typography>
                                </Box>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom fontSize="0.875rem">
                                        Description
                                    </Typography>
                                    <Typography fontSize="0.875rem">
                                        {project.description}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Progress */}
                        <Paper sx={{ flex: 1, p: 2, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
                                Progression
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography fontSize="0.875rem">Progression globale</Typography>
                                    <Typography fontSize="0.875rem">{project.progress || 65}%</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={project.progress || 65} 
                                    sx={{ 
                                        height: 8, 
                                        borderRadius: 1,
                                        bgcolor: '#f5f5f5',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: '#2e7d32'
                                        }
                                    }} 
                                />
                            </Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 500 }}>
                                Progression par phase
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {[
                                    { name: 'Conception', progress: 100 },
                                    { name: 'Développement', progress: 65 },
                                    { name: 'Tests', progress: 30 },
                                    { name: 'Déploiement', progress: 0 }
                                ].map((phase) => (
                                    <Box key={phase.name}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography fontSize="0.875rem">{phase.name}</Typography>
                                            <Typography fontSize="0.875rem">{phase.progress}%</Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={phase.progress} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 1,
                                                bgcolor: '#f5f5f5',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: '#2e7d32'
                                                }
                                            }} 
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                );
            case 1: // Tâches
                return (
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                Tâches du projet
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: '#2e7d32',
                                    '&:hover': { bgcolor: '#1b5e20' }
                                }}
                            >
                                Nouvelle tâche
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {/* Liste des tâches à implémenter */}
                            <Typography color="text.secondary" fontSize="0.875rem">
                                Les tâches seront affichées ici
                            </Typography>
                        </Box>
                    </Paper>
                );
            case 2: // Équipe
                return (
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                Équipe du projet
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: '#2e7d32',
                                    '&:hover': { bgcolor: '#1b5e20' }
                                }}
                            >
                                Ajouter un membre
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {[
                                { name: 'Sophie Martin', role: 'Chef de projet' },
                                { name: 'Thomas Dubois', role: 'Développeur' },
                                { name: 'Marie Lambert', role: 'Designer' }
                            ].map((member, index) => (
                                <Paper
                                    key={index}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: '#2e7d32' }}>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                    <Box>
                                        <Typography fontSize="0.875rem" fontWeight={500}>
                                            {member.name}
                                        </Typography>
                                        <Typography color="text.secondary" fontSize="0.75rem">
                                            {member.role}
                                        </Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Paper>
                );
            case 3: // Commentaires
                return (
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                Commentaires
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<ChatBubbleOutline />}
                                sx={{
                                    bgcolor: '#2e7d32',
                                    '&:hover': { bgcolor: '#1b5e20' }
                                }}
                            >
                                Nouveau commentaire
                            </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Liste des commentaires à implémenter */}
                            <Typography color="text.secondary" fontSize="0.875rem">
                                Les commentaires seront affichés ici
                            </Typography>
                        </Box>
                    </Paper>
                );
            default:
                return null;
        }
    };

    return (
        <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <IconButton 
                        onClick={() => navigate('/test/3')} 
                        sx={{ p: 0.5 }}
                    >
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 500 }}>
                        {project.title}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                        display: 'inline-flex',
                        bgcolor: project.status_id === 2 ? '#e8f5e9' : '#f5f5f5',
                        color: project.status_id === 2 ? '#2e7d32' : 'text.secondary',
                        px: 1,
                        py: 0.25,
                        borderRadius: 3,
                        fontSize: '0.875rem'
                    }}>
                        {statuses.find(s => s.id === project.status_id)?.name}
                    </Box>
                    <Typography color="text.secondary" fontSize="0.875rem">
                        Progression : {project.progress || 65}%
                    </Typography>
                </Box>
            </Box>

            {/* Navigation */}
            <Box sx={{ mt: 0.5 }}>
                <Box sx={{ 
                    display: 'flex', 
                    bgcolor: 'white',
                    borderBottom: '1px solid #e0e0e0',
                    justifyContent: 'center'
                }}>
                    {tabs.map((tab, index) => (
                        <Button
                            key={tab}
                            sx={{
                                color: tabValue === index ? '#2e7d32' : 'text.secondary',
                                bgcolor: tabValue === index ? 'white' : 'transparent',
                                borderBottom: tabValue === index ? '2px solid #2e7d32' : 'none',
                                borderRadius: 0,
                                px: 2,
                                py: 1,
                                minHeight: 40,
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                fontWeight: tabValue === index ? 600 : 400,
                                minWidth: 'auto',
                                '&:hover': {
                                    bgcolor: tabValue === index ? 'white' : '#f8f9fa',
                                    color: '#2e7d32'
                                }
                            }}
                            onClick={() => setTabValue(index)}
                        >
                            {tab}
                        </Button>
                    ))}
                </Box>

                <Box sx={{ px: 2, py: 1.5 }}>
                    {renderTabContent()}
                </Box>
            </Box>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Modifier le projet</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Titre"
                            fullWidth
                            value={editedProject?.title}
                            onChange={(e) => editedProject && setEditedProject({...editedProject, title: e.target.value})}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={editedProject?.description}
                            onChange={(e) => editedProject && setEditedProject({...editedProject, description: e.target.value})}
                        />
                        <TextField
                            label="Date d'échéance"
                            type="date"
                            fullWidth
                            value={editedProject?.end_date}
                            onChange={(e) => editedProject && setEditedProject({...editedProject, end_date: e.target.value})}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Annuler</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateProject}
                        sx={{
                            bgcolor: '#2e7d32',
                            '&:hover': { bgcolor: '#1b5e20' }
                        }}
                    >
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProjetDetail; 