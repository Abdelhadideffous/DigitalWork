'use client';

import {
    Add,
    ArrowBack as ArrowBackIcon,
    Assignment as AssignmentIcon,
    CalendarToday as CalendarIcon,
    Comment as CommentIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MoreVert,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
    Alert,
    Autocomplete,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
    type SelectChangeEvent,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import { projectApi, teamApi, type Priority, type Project, type Status } from './api';
import AppLayout from './AppLayout';

function Projet() {
    // État pour le menu d'actions des projets
    const [projectActionMenuAnchorEl, setProjectActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const openProjectActionMenu = Boolean(projectActionMenuAnchorEl);

    // Fonction pour obtenir la date actuelle au format YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Fonction pour ajouter des mois à une date
    const addMonths = (dateString: string, months: number) => {
        const date = new Date(dateString);
        date.setMonth(date.getMonth() + months);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // État pour le formulaire de nouveau projet
    const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false);
    const [newProjectData, setNewProjectData] = useState({
        title: '',
        description: '',
        start_date: getCurrentDate(),
        end_date: addMonths(getCurrentDate(), 1),
        status_id: 1, // Par défaut "En attente"
        priority_id: 2, // Par défaut "Moyenne"
    });
    const [newProjectErrors, setNewProjectErrors] = useState({
        title: false,
        description: false,
        start_date: false,
        end_date: false,
        status_id: false,
        priority_id: false,
        teamId: false,
    });

    // État pour l'autocomplétion de l'équipe
    const [selectedTeam, setSelectedTeam] = useState<{ id: number; name: string } | null>(null);

    // État pour la vue détaillée d'un projet
    const [showProjectDetails, setShowProjectDetails] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [tabValue, setTabValue] = useState(0);

    // État pour la recherche
    const [searchProjectQuery, setSearchProjectQuery] = useState('');

    // État pour le filtre de statut
    const [statusFilter, setStatusFilter] = useState('Tous les statuts');

    // État pour les dialogues d'édition et de suppression de projet
    const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false);
    const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false);
    const [editProjectData, setEditProjectData] = useState({
        id: 0,
        title: '',
        description: '',
        start_date: getCurrentDate(),
        end_date: getCurrentDate(),
        status_id: 1,
        priority_id: 2,
    });
    const [editProjectErrors, setEditProjectErrors] = useState({
        title: false,
        description: false,
        start_date: false,
        end_date: false,
        status_id: false,
        priority_id: false,
        teamId: false,
    });
    const [selectedEditTeam, setSelectedEditTeam] = useState<{ id: number; name: string } | null>(null);

    // État pour les notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // État pour l'indicateur de chargement
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Données des projets, équipes, statuts et priorités
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);

    // Fonction pour charger les projets depuis l'API
    const fetchProjects = async () => {
        try {
            setInitialLoading(true);
            const projectsData = await projectApi.getAllProjects();
            setProjects(projectsData);
            setInitialLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des projets',
                severity: 'error',
            });
            setInitialLoading(false);
        }
    };

    // Fonction pour charger les équipes depuis l'API
    const fetchTeams = async () => {
        try {
            const teamsData = await teamApi.getAllTeams();
            setTeams(teamsData);
        } catch (error) {
            console.error('Erreur lors du chargement des équipes:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des équipes',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les statuts depuis l'API
    const fetchStatuses = async () => {
        try {
            const statusesData = await projectApi.getAllStatuses();
            setStatuses(statusesData);
        } catch (error) {
            console.error('Erreur lors du chargement des statuts:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des statuts',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les priorités depuis l'API
    const fetchPriorities = async () => {
        try {
            const prioritiesData = await projectApi.getAllPriorities();
            setPriorities(prioritiesData);
        } catch (error) {
            console.error('Erreur lors du chargement des priorités:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des priorités',
                severity: 'error',
            });
        }
    };

    // Charger les projets, équipes, statuts et priorités au chargement du composant
    useEffect(() => {
        fetchProjects();
        fetchTeams();
        fetchStatuses();
        fetchPriorities();
    }, []);

    // Filtrage des projets par recherche et statut
    const filteredProjects = projects.filter(
        (project) =>
            project.title.toLowerCase().includes(searchProjectQuery.toLowerCase()) &&
            (statusFilter === 'Tous les statuts' || project.status?.name === statusFilter),
    );

    // Fermer le menu d'actions des projets lorsqu'on navigue vers les détails d'un projet
    useEffect(() => {
        if (showProjectDetails) {
            handleProjectActionMenuClose();
        }
    }, [showProjectDetails]);

    const handleProjectActionMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: number) => {
        event.stopPropagation(); // Empêcher la propagation pour éviter de déclencher handleViewProjectDetails
        setProjectActionMenuAnchorEl(event.currentTarget);
        setSelectedProjectId(projectId);
    };

    const handleProjectActionMenuClose = () => {
        setProjectActionMenuAnchorEl(null);
        // Ne pas effacer selectedProjectId ici, car nous en avons besoin pour la suppression
    };

    const handleNewProjectDialogOpen = () => {
        setOpenNewProjectDialog(true);
        setNewProjectData({
            title: '',
            description: '',
            start_date: getCurrentDate(),
            end_date: addMonths(getCurrentDate(), 1),
            status_id: 1, // Par défaut "En attente"
            priority_id: 2, // Par défaut "Moyenne"
        });
        setNewProjectErrors({
            title: false,
            description: false,
            start_date: false,
            end_date: false,
            status_id: false,
            priority_id: false,
            teamId: false,
        });
        setSelectedTeam(null);
    };

    const handleNewProjectDialogClose = () => {
        setOpenNewProjectDialog(false);
        setNewProjectData({
            title: '',
            description: '',
            start_date: getCurrentDate(),
            end_date: addMonths(getCurrentDate(), 1),
            status_id: 1,
            priority_id: 2,
        });
        setNewProjectErrors({
            title: false,
            description: false,
            start_date: false,
            end_date: false,
            status_id: false,
            priority_id: false,
            teamId: false,
        });
        setSelectedTeam(null);
    };

    const handleNewProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewProjectData({
            ...newProjectData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (newProjectErrors[name as keyof typeof newProjectErrors]) {
            setNewProjectErrors({
                ...newProjectErrors,
                [name]: false,
            });
        }
    };

    const handleNewProjectStatusChange = (e: SelectChangeEvent) => {
        setNewProjectData({
            ...newProjectData,
            status_id: Number(e.target.value),
        });

        // Réinitialiser l'erreur si un statut est sélectionné
        if (newProjectErrors.status_id) {
            setNewProjectErrors({
                ...newProjectErrors,
                status_id: false,
            });
        }
    };

    const handleNewProjectPriorityChange = (e: SelectChangeEvent) => {
        setNewProjectData({
            ...newProjectData,
            priority_id: Number(e.target.value),
        });

        // Réinitialiser l'erreur si une priorité est sélectionnée
        if (newProjectErrors.priority_id) {
            setNewProjectErrors({
                ...newProjectErrors,
                priority_id: false,
            });
        }
    };

    const handleTeamChange = (_: React.SyntheticEvent, value: { id: number; name: string } | null) => {
        setSelectedTeam(value);
        if (value) {
            // Réinitialiser l'erreur si une équipe est sélectionnée
            if (newProjectErrors.teamId) {
                setNewProjectErrors({
                    ...newProjectErrors,
                    teamId: false,
                });
            }
        }
    };

    const handleEditTeamChange = (_: React.SyntheticEvent, value: { id: number; name: string } | null) => {
        setSelectedEditTeam(value);
        if (value) {
            // Réinitialiser l'erreur si une équipe est sélectionnée
            if (editProjectErrors.teamId) {
                setEditProjectErrors({
                    ...editProjectErrors,
                    teamId: false,
                });
            }
        }
    };

    const handleStatusFilterChange = (e: SelectChangeEvent) => {
        setStatusFilter(e.target.value);
    };

    const handleViewProjectDetails = async (projectId: number, event?: React.MouseEvent) => {
        // Si l'événement est fourni, empêcher la propagation
        if (event) {
            event.stopPropagation();
        }

        // Fermer le menu d'actions des projets s'il est ouvert
        if (projectActionMenuAnchorEl) {
            handleProjectActionMenuClose();
        }

        try {
            setLoading(true);
            const projectDetails = await projectApi.getProjectById(projectId);
            setSelectedProject(projectDetails);
            setShowProjectDetails(true);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des détails du projet:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des détails du projet',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    const handleBackToProjectsList = () => {
        setShowProjectDetails(false);
        setSelectedProject(null);
        setTabValue(0);
        setSearchProjectQuery('');
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Fonctions pour gérer l'édition d'un projet
    const handleEditProjectDialogOpen = (projectId: number) => {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
            setEditProjectData({
                id: project.id,
                title: project.title,
                description: project.description,
                start_date: project.start_date,
                end_date: project.end_date,
                status_id: project.status_id,
                priority_id: project.priority_id,
            });
            setEditProjectErrors({
                title: false,
                description: false,
                start_date: false,
                end_date: false,
                status_id: false,
                priority_id: false,
                teamId: false,
            });

            // Trouver l'équipe associée au projet
            const projectTeam = teams.find((team) => team.project_id === project.id);
            setSelectedEditTeam(projectTeam || null);

            setOpenEditProjectDialog(true);
        }
        handleProjectActionMenuClose();
    };

    const handleEditProjectDialogClose = () => {
        setOpenEditProjectDialog(false);
        setEditProjectErrors({
            title: false,
            description: false,
            start_date: false,
            end_date: false,
            status_id: false,
            priority_id: false,
            teamId: false,
        });
        setSelectedEditTeam(null);
    };

    const handleEditProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditProjectData({
            ...editProjectData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (editProjectErrors[name as keyof typeof editProjectErrors]) {
            setEditProjectErrors({
                ...editProjectErrors,
                [name]: false,
            });
        }
    };

    const handleEditProjectStatusChange = (e: SelectChangeEvent) => {
        setEditProjectData({
            ...editProjectData,
            status_id: Number(e.target.value),
        });

        // Réinitialiser l'erreur si un statut est sélectionné
        if (editProjectErrors.status_id) {
            setEditProjectErrors({
                ...editProjectErrors,
                status_id: false,
            });
        }
    };

    const handleEditProjectPriorityChange = (e: SelectChangeEvent) => {
        setEditProjectData({
            ...editProjectData,
            priority_id: Number(e.target.value),
        });

        // Réinitialiser l'erreur si une priorité est sélectionnée
        if (editProjectErrors.priority_id) {
            setEditProjectErrors({
                ...editProjectErrors,
                priority_id: false,
            });
        }
    };

    const handleUpdateProject = async () => {
        // Validation des champs
        const titleEmpty = editProjectData.title.trim() === '';
        const descriptionEmpty = editProjectData.description.trim() === '';
        const startDateInvalid = !editProjectData.start_date;
        const endDateInvalid = !editProjectData.end_date;
        const statusEmpty = !editProjectData.status_id;
        const priorityEmpty = !editProjectData.priority_id;

        setEditProjectErrors({
            ...editProjectErrors,
            title: titleEmpty,
            description: descriptionEmpty,
            start_date: startDateInvalid,
            end_date: endDateInvalid,
            status_id: statusEmpty,
            priority_id: priorityEmpty,
        });

        // Si tous les champs sont remplis, procéder à la mise à jour
        if (!titleEmpty && !descriptionEmpty && !startDateInvalid && !endDateInvalid && !statusEmpty && !priorityEmpty) {
            try {
                setLoading(true);
                await projectApi.updateProject(editProjectData.id, editProjectData);

                setSnackbar({
                    open: true,
                    message: 'Projet mis à jour avec succès',
                    severity: 'success',
                });

                handleEditProjectDialogClose();
                // Recharger la liste des projets
                fetchProjects();

                // Si nous sommes dans la vue détaillée du projet modifié, recharger les détails
                if (showProjectDetails && selectedProject?.id === editProjectData.id) {
                    await handleViewProjectDetails(editProjectData.id);
                }

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la mise à jour du projet:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la mise à jour du projet',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonctions pour gérer la suppression d'un projet
    const handleDeleteProjectDialogOpen = (projectId: number) => {
        setSelectedProjectId(projectId);
        setOpenDeleteProjectDialog(true);
        handleProjectActionMenuClose();
    };

    const handleDeleteProjectDialogClose = () => {
        setOpenDeleteProjectDialog(false);
        // Effacer selectedProjectId seulement lorsque le dialogue est fermé
        setSelectedProjectId(null);
    };

    const handleDeleteProject = async () => {
        // Stocker l'ID dans une variable locale pour s'assurer qu'il ne change pas
        const projectIdToDelete = selectedProjectId;

        if (!projectIdToDelete) return;

        try {
            setLoading(true);
            await projectApi.deleteProject(projectIdToDelete);

            // Fermer le dialogue de confirmation
            handleDeleteProjectDialogClose();

            // Si nous sommes dans la vue détaillée du projet supprimé, revenir à la liste
            if (showProjectDetails && selectedProject?.id === projectIdToDelete) {
                handleBackToProjectsList();
            }

            // Recharger la liste des projets
            fetchProjects();

            setLoading(false);

            // Afficher le Snackbar de succès
            setSnackbar({
                open: true,
                message: 'Projet supprimé avec succès',
                severity: 'success',
            });
        } catch (error) {
            console.error('Erreur lors de la suppression du projet:', error);
            setLoading(false);
            handleDeleteProjectDialogClose();
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression du projet',
                severity: 'error',
            });
        }
    };

    const handleCreateNewProject = async () => {
        // Validation des champs
        const titleEmpty = newProjectData.title.trim() === '';
        const descriptionEmpty = newProjectData.description.trim() === '';
        const startDateInvalid = !newProjectData.start_date;
        const endDateInvalid = !newProjectData.end_date;
        const statusEmpty = !newProjectData.status_id;
        const priorityEmpty = !newProjectData.priority_id;

        setNewProjectErrors({
            ...newProjectErrors,
            title: titleEmpty,
            description: descriptionEmpty,
            start_date: startDateInvalid,
            end_date: endDateInvalid,
            status_id: statusEmpty,
            priority_id: priorityEmpty,
        });

        // Si tous les champs sont remplis, procéder à la création
        if (!titleEmpty && !descriptionEmpty && !startDateInvalid && !endDateInvalid && !statusEmpty && !priorityEmpty) {
            try {
                setLoading(true);
                await projectApi.createProject(newProjectData);

                setSnackbar({
                    open: true,
                    message: 'Projet créé avec succès',
                    severity: 'success',
                });

                handleNewProjectDialogClose();
                // Recharger la liste des projets
                fetchProjects();

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la création du projet:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la création du projet',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonction pour fermer la notification
    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        // Ne pas fermer le Snackbar si l'utilisateur clique en dehors
        if (reason === 'clickaway') {
            return;
        }

        // Fermer le Snackbar
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    // Fonction pour obtenir le nom du statut à partir de l'ID
    const getStatusName = (statusId: number) => {
        const status = statuses.find((s) => s.id === statusId);
        return status ? status.name : 'Inconnu';
    };

    // Fonction pour obtenir le nom de la priorité à partir de l'ID
    const getPriorityName = (priorityId: number) => {
        const priority = priorities.find((p) => p.id === priorityId);
        return priority ? priority.name : 'Inconnue';
    };

    // Fonction pour formater la date pour l'affichage
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Afficher un indicateur de chargement pendant le chargement initial
    if (initialLoading) {
        return (
            <AppLayout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress color="success" />
                </Box>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            {/* Indicateur de chargement */}
            {loading && <LinearProgress color="success" sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}

            {/* Notification */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Contenu de la page Projet */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {showProjectDetails ? (
                    // Vue détaillée d'un projet
                    <>
                        {/* Fil d'Ariane */}
                        <Box sx={{ mb: 2 }}>
                            <Breadcrumbs aria-label="breadcrumb">
                                <Typography
                                    color="inherit"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => handleBackToProjectsList()}
                                >
                                    Tableau de bord
                                </Typography>
                                <Typography
                                    color="inherit"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => handleBackToProjectsList()}
                                >
                                    Projets
                                </Typography>
                                <Typography color="text.primary">{selectedProject?.id}</Typography>
                            </Breadcrumbs>
                        </Box>

                        {/* En-tête avec bouton retour */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <IconButton onClick={handleBackToProjectsList} sx={{ mr: 1, p: 0 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" sx={{ flex: 1, fontWeight: 'bold' }}>
                                {selectedProject?.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button variant="outlined" startIcon={<CommentIcon />} sx={{ textTransform: 'none', borderRadius: 1 }}>
                                    Commenter
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                >
                                    Voir les commentaires (2)
                                </Button>
                            </Box>
                        </Box>

                        {/* Badge de statut et progression */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Chip
                                label={selectedProject?.status?.name || getStatusName(selectedProject?.status_id)}
                                color={
                                    selectedProject?.status?.name === 'En cours' || getStatusName(selectedProject?.status_id) === 'En cours'
                                        ? 'success'
                                        : selectedProject?.status?.name === 'En attente' || getStatusName(selectedProject?.status_id) === 'En attente'
                                          ? 'warning'
                                          : 'default'
                                }
                                sx={{ mr: 2 }}
                            />
                            <Typography variant="body2">Progression : {selectedProject?.progress || 0}%</Typography>
                        </Box>

                        {/* Onglets */}
                        <Box sx={{ width: '100%', mb: 4 }}>
                            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="project tabs"
                                    variant="fullWidth"
                                    sx={{
                                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                                        '& .MuiTab-root': {
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                            fontSize: '1rem',
                                            py: 2,
                                        },
                                        '& .Mui-selected': {
                                            fontWeight: 'bold',
                                        },
                                    }}
                                >
                                    <Tab label="Vue d'ensemble" />
                                    <Tab label="Tâches" />
                                    <Tab label="Équipe" />
                                </Tabs>

                                {/* Contenu de l'onglet Vue d'ensemble */}
                                <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
                                    {tabValue === 0 && (
                                        <>
                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 4 }}>
                                                {/* Informations du projet */}
                                                <Card sx={{ flex: 1, borderRadius: 2 }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            Informations du projet
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                                                    Statut
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {selectedProject?.status?.name || getStatusName(selectedProject?.status_id)}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                                                    Priorité
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {selectedProject?.priority?.name || getPriorityName(selectedProject?.priority_id)}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                                                    Date de début
                                                                </Typography>
                                                                <Typography variant="body1">{formatDate(selectedProject?.start_date)}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                                                    Date d'échéance
                                                                </Typography>
                                                                <Typography variant="body1">{formatDate(selectedProject?.end_date)}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                                                    Description
                                                                </Typography>
                                                                <Typography variant="body1">{selectedProject?.description}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>

                                                {/* Progression */}
                                                <Card sx={{ flex: 1, borderRadius: 2 }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                            Progression
                                                        </Typography>
                                                        <Box sx={{ mb: 3 }}>
                                                            <Box
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    mb: 1,
                                                                }}
                                                            >
                                                                <Typography variant="subtitle1" fontWeight="medium">
                                                                    Progression globale
                                                                </Typography>
                                                                <Typography variant="subtitle1" fontWeight="medium">
                                                                    {selectedProject?.progress || 0}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={selectedProject?.progress || 0}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 5,
                                                                    backgroundColor: '#e0f2f1',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: '#16A249',
                                                                    },
                                                                }}
                                                            />
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Box>
                                        </>
                                    )}
                                </Box>

                                {/* Contenu de l'onglet Tâches */}
                                <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
                                    {tabValue === 1 && (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h6" component="h2" fontWeight="bold">
                                                    Tâches du projet
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<Add />}
                                                    sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                                >
                                                    Ajouter une tâche
                                                </Button>
                                            </Box>

                                            <TableContainer sx={{ borderRadius: 2, boxShadow: 1, mb: 4 }}>
                                                <Table>
                                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Priorité</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Assigné à</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Échéance</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Progression</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                                                Actions
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell colSpan={7} align="center">
                                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                                    Aucune tâche trouvée
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    )}
                                </Box>

                                {/* Contenu de l'onglet Équipe */}
                                <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
                                    {tabValue === 2 && (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h6" component="h2" fontWeight="bold">
                                                    Équipe du projet
                                                </Typography>
                                                <Box>
                                                    <Button variant="outlined" sx={{ mr: 2, textTransform: 'none', borderRadius: 1 }}>
                                                        Voir la page de l'équipe
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<Add />}
                                                        sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                                    >
                                                        Gérer l'équipe
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                                Aucune équipe associée à ce projet
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                    </>
                ) : (
                    // Vue liste des projets
                    <>
                        {/* En-tête de la page */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h4" component="h1" fontWeight="bold">
                                    Projets
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Gérez tous vos projets
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Add />}
                                onClick={handleNewProjectDialogOpen}
                                sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                            >
                                Nouveau projet
                            </Button>
                        </Box>

                        {/* Sous-titre et filtres */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h5" component="h2" fontWeight="bold">
                                    Projets
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Gérez tous vos projets
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    placeholder="Rechercher..."
                                    size="small"
                                    value={searchProjectQuery}
                                    onChange={(e) => setSearchProjectQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ width: 250 }}
                                />
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={statusFilter}
                                        onChange={handleStatusFilterChange}
                                        displayEmpty
                                        inputProps={{ 'aria-label': 'Filtrer par statut' }}
                                    >
                                        <MenuItem value="Tous les statuts">Tous les statuts</MenuItem>
                                        {statuses.map((status) => (
                                            <MenuItem key={status.id} value={status.name}>
                                                {status.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        {/* Liste des projets */}
                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Priorité</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date de début</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date d'échéance</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredProjects.length > 0 ? (
                                        filteredProjects.map((project) => (
                                            <TableRow key={project.id} hover>
                                                <TableCell>
                                                    <Typography
                                                        fontWeight="bold"
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { textDecoration: 'underline' },
                                                        }}
                                                        onClick={(e) => handleViewProjectDetails(project.id, e)}
                                                    >
                                                        {project.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={project.status?.name || getStatusName(project.status_id)}
                                                        color={
                                                            project.status?.name === 'En cours' || getStatusName(project.status_id) === 'En cours'
                                                                ? 'success'
                                                                : project.status?.name === 'En attente' ||
                                                                    getStatusName(project.status_id) === 'En attente'
                                                                  ? 'warning'
                                                                  : 'default'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={project.priority?.name || getPriorityName(project.priority_id)}
                                                        color={
                                                            project.priority?.name === 'Haute' || getPriorityName(project.priority_id) === 'Haute'
                                                                ? 'error'
                                                                : 'success'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(project.start_date)}</TableCell>
                                                <TableCell>{formatDate(project.end_date)}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={(e) => handleProjectActionMenuOpen(e, project.id)}>
                                                        <MoreVert />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                    Aucun projet trouvé
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Statistiques des projets */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    flex: 1,
                                    minWidth: { xs: '100%', sm: 'calc(33.33% - 16px)' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        color: 'success.main',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'success.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 1,
                                        }}
                                    >
                                        <AssignmentIcon sx={{ color: 'success.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Projets terminés
                                    </Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                                    {projects.filter((p) => p.status?.name === 'Terminé' || getStatusName(p.status_id) === 'Terminé').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    sur {projects.length} projets au total
                                </Typography>
                            </Paper>

                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    flex: 1,
                                    minWidth: { xs: '100%', sm: 'calc(33.33% - 16px)' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        color: 'info.main',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'info.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 1,
                                        }}
                                    >
                                        <CalendarIcon sx={{ color: 'info.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Projets en cours
                                    </Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                                    {projects.filter((p) => p.status?.name === 'En cours' || getStatusName(p.status_id) === 'En cours').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    sur {projects.length} projets au total
                                </Typography>
                            </Paper>

                            <Paper
                                elevation={1}
                                sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    flex: 1,
                                    minWidth: { xs: '100%', sm: 'calc(33.33% - 16px)' },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2,
                                        color: 'warning.main',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'warning.light',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 1,
                                        }}
                                    >
                                        <CalendarIcon sx={{ color: 'warning.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Projets en attente
                                    </Typography>
                                </Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                                    {projects.filter((p) => p.status?.name === 'En attente' || getStatusName(p.status_id) === 'En attente').length}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    sur {projects.length} projets au total
                                </Typography>
                            </Paper>
                        </Box>
                    </>
                )}
            </Container>

            {/* Dialogue de création d'un nouveau projet */}
            <Dialog open={openNewProjectDialog} onClose={handleNewProjectDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Créer un nouveau projet</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        name="title"
                        label="Nom du projet"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newProjectData.title}
                        onChange={handleNewProjectInputChange}
                        error={newProjectErrors.title}
                        helperText={newProjectErrors.title ? 'Le nom du projet est requis' : ''}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={newProjectData.description}
                        onChange={handleNewProjectInputChange}
                        error={newProjectErrors.description}
                        helperText={newProjectErrors.description ? 'La description est requise' : ''}
                        required
                    />
                    <FormControl fullWidth margin="dense" error={newProjectErrors.status_id}>
                        <InputLabel id="status-label">Statut</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status_id"
                            value={newProjectData.status_id.toString()}
                            label="Statut"
                            onChange={handleNewProjectStatusChange}
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id.toString()}>
                                    {status.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {newProjectErrors.status_id && (
                            <Typography variant="caption" color="error">
                                Le statut est requis
                            </Typography>
                        )}
                    </FormControl>
                    <FormControl fullWidth margin="dense" error={newProjectErrors.priority_id}>
                        <InputLabel id="priority-label">Priorité</InputLabel>
                        <Select
                            labelId="priority-label"
                            id="priority_id"
                            value={newProjectData.priority_id.toString()}
                            label="Priorité"
                            onChange={handleNewProjectPriorityChange}
                        >
                            {priorities.map((priority) => (
                                <MenuItem key={priority.id} value={priority.id.toString()}>
                                    {priority.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {newProjectErrors.priority_id && (
                            <Typography variant="caption" color="error">
                                La priorité est requise
                            </Typography>
                        )}
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Date de début"
                            type="date"
                            name="start_date"
                            value={newProjectData.start_date}
                            onChange={handleNewProjectInputChange}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            error={newProjectErrors.start_date}
                            helperText={newProjectErrors.start_date ? 'La date de début est requise' : ''}
                        />
                        <TextField
                            label="Date d'échéance"
                            type="date"
                            name="end_date"
                            value={newProjectData.end_date}
                            onChange={handleNewProjectInputChange}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            error={newProjectErrors.end_date}
                            helperText={newProjectErrors.end_date ? "La date d'échéance est requise" : ''}
                        />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Équipe du projet
                    </Typography>
                    <Autocomplete
                        id="team"
                        options={teams}
                        getOptionLabel={(option) => option.name}
                        value={selectedTeam}
                        onChange={handleTeamChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="team"
                                label="Équipe"
                                variant="outlined"
                                error={newProjectErrors.teamId}
                                helperText={newProjectErrors.teamId ? "L'équipe est requise" : ''}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body1">{option.name}</Typography>
                                </Box>
                            </li>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewProjectDialogClose}>Annuler</Button>
                    <Button onClick={handleCreateNewProject} variant="contained" color="success" sx={{ bgcolor: '#16A249' }} disabled={loading}>
                        Créer le projet
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de modification d'un projet */}
            <Dialog open={openEditProjectDialog} onClose={handleEditProjectDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Modifier le projet</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        name="title"
                        label="Nom du projet"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editProjectData.title}
                        onChange={handleEditProjectInputChange}
                        error={editProjectErrors.title}
                        helperText={editProjectErrors.title ? 'Le nom du projet est requis' : ''}
                        required
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editProjectData.description}
                        onChange={handleEditProjectInputChange}
                        error={editProjectErrors.description}
                        helperText={editProjectErrors.description ? 'La description est requise' : ''}
                        required
                    />
                    <FormControl fullWidth margin="dense" error={editProjectErrors.status_id}>
                        <InputLabel id="edit-status-label">Statut</InputLabel>
                        <Select
                            labelId="edit-status-label"
                            id="edit-status"
                            value={editProjectData.status_id.toString()}
                            label="Statut"
                            onChange={handleEditProjectStatusChange}
                        >
                            {statuses.map((status) => (
                                <MenuItem key={status.id} value={status.id.toString()}>
                                    {status.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {editProjectErrors.status_id && (
                            <Typography variant="caption" color="error">
                                Le statut est requis
                            </Typography>
                        )}
                    </FormControl>
                    <FormControl fullWidth margin="dense" error={editProjectErrors.priority_id}>
                        <InputLabel id="edit-priority-label">Priorité</InputLabel>
                        <Select
                            labelId="edit-priority-label"
                            id="edit-priority"
                            value={editProjectData.priority_id.toString()}
                            label="Priorité"
                            onChange={handleEditProjectPriorityChange}
                        >
                            {priorities.map((priority) => (
                                <MenuItem key={priority.id} value={priority.id.toString()}>
                                    {priority.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {editProjectErrors.priority_id && (
                            <Typography variant="caption" color="error">
                                La priorité est requise
                            </Typography>
                        )}
                    </FormControl>
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <TextField
                            label="Date de début"
                            type="date"
                            name="start_date"
                            value={editProjectData.start_date}
                            onChange={handleEditProjectInputChange}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            error={editProjectErrors.start_date}
                            helperText={editProjectErrors.start_date ? 'La date de début est requise' : ''}
                        />
                        <TextField
                            label="Date d'échéance"
                            type="date"
                            name="end_date"
                            value={editProjectData.end_date}
                            onChange={handleEditProjectInputChange}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            error={editProjectErrors.end_date}
                            helperText={editProjectErrors.end_date ? "La date d'échéance est requise" : ''}
                        />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Équipe du projet
                    </Typography>
                    <Autocomplete
                        id="edit-team"
                        options={teams}
                        getOptionLabel={(option) => option.name}
                        value={selectedEditTeam}
                        onChange={handleEditTeamChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="team"
                                label="Équipe"
                                variant="outlined"
                                error={editProjectErrors.teamId}
                                helperText={editProjectErrors.teamId ? "L'équipe est requise" : ''}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body1">{option.name}</Typography>
                                </Box>
                            </li>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditProjectDialogClose}>Annuler</Button>
                    <Button onClick={handleUpdateProject} variant="contained" color="success" sx={{ bgcolor: '#16A249' }} disabled={loading}>
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de suppression d'un projet */}
            <Dialog open={openDeleteProjectDialog} onClose={handleDeleteProjectDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Supprimer le projet</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteProjectDialogClose}>Annuler</Button>
                    <Button onClick={handleDeleteProject} variant="contained" color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Menu d'actions pour les projets */}
            <Menu
                anchorEl={projectActionMenuAnchorEl}
                open={openProjectActionMenu}
                onClose={handleProjectActionMenuClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={(e) => handleViewProjectDetails(selectedProjectId || 0, e)}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Détails" />
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <CommentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Commentaires" />
                </MenuItem>
                <MenuItem onClick={() => handleEditProjectDialogOpen(selectedProjectId || 0)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Modifier" />
                </MenuItem>
                <MenuItem onClick={() => handleDeleteProjectDialogOpen(selectedProjectId || 0)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                </MenuItem>
            </Menu>
        </AppLayout>
    );
}

export default Projet;