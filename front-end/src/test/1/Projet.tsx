'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    LinearProgress,
    Snackbar,
    Alert,
    Pagination,
    Chip,
    Grid,
    Card,
    CardContent,
    CardActions,
    Tooltip,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Collapse,
    CircularProgress,
    Menu,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { 
    Add, 
    Search, 
    Edit, 
    Delete, 
    FilterList, 
    ExpandMore, 
    ExpandLess,
    Group,
    CalendarToday,
    Assessment,
    Visibility,
    MoreVert
} from '@mui/icons-material';
import { projectApi, teamApi } from './api';
import { useNavigate } from 'react-router-dom';

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

interface Status {
    id: number;
    name: string;
}

interface Priority {
    id: number;
    name: string;
}

interface NewProjectData {
    title: string;
    description: string;
    status_id: number;
    priority_id: number;
    start_date: string;
    end_date: string;
}

interface FilterOptions {
    status: number[];
    priority: number[];
    dateRange: {
        start: string;
        end: string;
    };
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

const Projet: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });
    const [newProject, setNewProject] = useState<NewProjectData>({
        title: '',
        description: '',
        status_id: 1,
        priority_id: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [totalProjects, setTotalProjects] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        status: [],
        priority: [],
        dateRange: {
            start: '',
            end: ''
        }
    });
    const [viewMode, setViewMode] = useState<'table'>('table');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [projectsData, statusesData, prioritiesData] = await Promise.all([
                    projectApi.getAllProjects(),
                    projectApi.getAllStatuses(),
                    projectApi.getAllPriorities()
                ]);
                
                console.log('Projects:', projectsData);
                console.log('Statuses:', statusesData);
                console.log('Priorities:', prioritiesData);

                if (statusesData && statusesData.length > 0) {
                    setStatuses(statusesData);
                } else {
                    console.warn('Aucun statut reçu du backend');
                }

                if (prioritiesData && prioritiesData.length > 0) {
                    setPriorities(prioritiesData);
                } else {
                    console.warn('Aucune priorité reçue du backend');
                }

                setProjects(projectsData);
                setTotalProjects(projectsData.length);
            } catch (error) {
                console.error('Error loading data:', error);
                setNotification({
                    open: true,
                    message: 'Erreur lors du chargement des données',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleCreateProject = async () => {
        try {
            if (!newProject.title || !newProject.description) {
                setNotification({
                    open: true,
                    message: 'Veuillez remplir tous les champs obligatoires',
                    severity: 'warning'
                });
                return;
            }

            await projectApi.createProject(newProject);
            const updatedProjects = await projectApi.getAllProjects();
            setProjects(updatedProjects);
            setOpenDialog(false);
            setNewProject({
                title: '',
                description: '',
                status_id: 1,
                priority_id: 1,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
            setNotification({
                open: true,
                message: 'Projet créé avec succès',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error creating project:', error);
            setNotification({
                open: true,
                message: 'Erreur lors de la création du projet',
                severity: 'error'
            });
        }
    };

    const handleUpdateProject = async () => {
        if (!editingProject?.id) return;
        try {
            await projectApi.updateProject(editingProject.id, editingProject);
            const updatedProjects = await projectApi.getAllProjects();
            setProjects(updatedProjects);
            setEditingProject(null);
            setNotification({
                open: true,
                message: 'Projet mis à jour avec succès',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error updating project:', error);
            setNotification({
                open: true,
                message: 'Erreur lors de la mise à jour du projet',
                severity: 'error'
            });
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
        try {
            await projectApi.deleteProject(projectId);
            const updatedProjects = await projectApi.getAllProjects();
            setProjects(updatedProjects);
            setNotification({
                open: true,
                message: 'Projet supprimé avec succès',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting project:', error);
            setNotification({
                open: true,
                message: 'Erreur lors de la suppression du projet',
                severity: 'error'
            });
        }
    };

    const handleFilterChange = (type: keyof FilterOptions, value: any) => {
        setFilterOptions(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const applyFilters = (projects: Project[]) => {
        return projects.filter(project => {
            // Filtre par statut
            if (filterOptions.status.length > 0 && !filterOptions.status.includes(project.status_id)) {
                return false;
            }
            // Filtre par priorité
            if (filterOptions.priority.length > 0 && !filterOptions.priority.includes(project.priority_id)) {
                return false;
            }
            // Filtre par date
            if (filterOptions.dateRange.start && new Date(project.start_date) < new Date(filterOptions.dateRange.start)) {
                return false;
            }
            if (filterOptions.dateRange.end && new Date(project.end_date) > new Date(filterOptions.dateRange.end)) {
                return false;
            }
            // Filtre par recherche
            if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        });
    };

    const filteredProjects = applyFilters(projects);
    const paginatedProjects = filteredProjects.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    };

    const getStatusName = (statusId: number) => {
        return statuses.find(s => s.id === statusId)?.name || 'Inconnu';
    };

    const getPriorityName = (priorityId: number) => {
        return priorities.find(p => p.id === priorityId)?.name || 'Inconnue';
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, project: Project) => {
        setAnchorEl(event.currentTarget);
        setSelectedProject(project);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedProject(null);
    };

    const handleViewDetails = () => {
        if (selectedProject) {
            navigate(`/test/1/projet/${selectedProject.id}`);
        }
        handleMenuClose();
    };

    if (loading) {
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
                    Chargement des projets...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Projets
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filtres
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenDialog(true)}
                        sx={{
                            bgcolor: '#2e7d32',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            '&:hover': { bgcolor: '#1b5e20' }
                        }}
                    >
                        Nouveau projet
                    </Button>
                </Box>
            </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ flex: '1 1 300px' }}>
                            <FormControl fullWidth>
                                <InputLabel>Statuts</InputLabel>
                                <Select
                                    multiple
                                    value={filterOptions.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={getStatusName(value)} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {statuses.map((status) => (
                                        <MenuItem key={status.id} value={status.id}>
                                            {status.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 300px' }}>
                            <FormControl fullWidth>
                                <InputLabel>Priorités</InputLabel>
                                <Select
                                    multiple
                                    value={filterOptions.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={getPriorityName(value)} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ flex: '1 1 300px' }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date de début"
                                value={filterOptions.dateRange.start}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...filterOptions.dateRange,
                                    start: e.target.value
                                })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Box sx={{ flex: '1 1 300px' }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date de fin"
                                value={filterOptions.dateRange.end}
                                onChange={(e) => handleFilterChange('dateRange', {
                                    ...filterOptions.dateRange,
                                    end: e.target.value
                                })}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </Paper>
            </Collapse>

            <Paper sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Liste des projets
                        </Typography>
                        <TextField
                            placeholder="Rechercher un projet..."
                            size="small"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Titre</TableCell>
                                <TableCell>Statut</TableCell>
                                <TableCell>Priorité</TableCell>
                                <TableCell>Date d'échéance</TableCell>
                                <TableCell>Progression</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedProjects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>{project.title}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusName(project.status_id)}
                                            sx={{
                                                bgcolor: getStatusColor(project.status_id),
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getPriorityName(project.priority_id)}
                                            sx={{
                                                bgcolor: getPriorityColor(project.priority_id),
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(project.end_date)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={project.progress || 0}
                                                sx={{
                                                    flexGrow: 1,
                                                    height: 8,
                                                    borderRadius: 1,
                                                    bgcolor: '#e8f5e9',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: '#2e7d32'
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {project.progress || 0}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={(e) => handleMenuClick(e, project)}
                                            size="small"
                                        >
                                            <MoreVert />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                        count={Math.ceil(filteredProjects.length / rowsPerPage)}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
            >
                <MenuItem onClick={handleViewDetails}>
                    <ListItemIcon>
                        <Visibility fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Voir détails</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    if (selectedProject) {
                        setEditingProject(selectedProject);
                        setOpenDialog(true);
                    }
                }}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Modifier</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    if (selectedProject) {
                        handleDeleteProject(selectedProject.id);
                    }
                }}>
                    <ListItemIcon>
                        <Delete fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Supprimer</ListItemText>
                </MenuItem>
            </Menu>

            <Dialog 
                open={openDialog || editingProject !== null} 
                onClose={() => {
                    setOpenDialog(false);
                    setEditingProject(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Titre"
                            fullWidth
                            required
                            value={editingProject?.title || newProject.title}
                            onChange={(e) => editingProject 
                                ? setEditingProject({...editingProject, title: e.target.value})
                                : setNewProject({...newProject, title: e.target.value})
                            }
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            required
                            multiline
                            rows={4}
                            value={editingProject?.description || newProject.description}
                            onChange={(e) => editingProject
                                ? setEditingProject({...editingProject, description: e.target.value})
                                : setNewProject({...newProject, description: e.target.value})
                            }
                        />
                        <FormControl fullWidth>
                            <InputLabel>Priorité</InputLabel>
                            <Select
                                value={editingProject?.priority_id || newProject.priority_id}
                                label="Priorité"
                                onChange={(e) => editingProject
                                    ? setEditingProject({...editingProject, priority_id: e.target.value as number})
                                    : setNewProject({...newProject, priority_id: e.target.value as number})
                                }
                            >
                                {priorities.map(priority => (
                                    <MenuItem key={priority.id} value={priority.id}>
                                        {priority.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Date de début"
                            type="date"
                            fullWidth
                            value={editingProject?.start_date || newProject.start_date}
                            onChange={(e) => editingProject
                                ? setEditingProject({...editingProject, start_date: e.target.value})
                                : setNewProject({...newProject, start_date: e.target.value})
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Date d'échéance"
                            type="date"
                            fullWidth
                            value={editingProject?.end_date || newProject.end_date}
                            onChange={(e) => editingProject
                                ? setEditingProject({...editingProject, end_date: e.target.value})
                                : setNewProject({...newProject, end_date: e.target.value})
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setOpenDialog(false);
                            setEditingProject(null);
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={editingProject ? handleUpdateProject : handleCreateProject}
                        sx={{
                            bgcolor: '#2e7d32',
                            '&:hover': { bgcolor: '#1b5e20' }
                        }}
                    >
                        {editingProject ? 'Modifier' : 'Créer'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Projet;