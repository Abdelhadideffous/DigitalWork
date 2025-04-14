'use client';

import type React from 'react';

import {
    AccessTime,
    Add as AddIcon,
    CheckCircle,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Event,
    MoreVert,
    Search,
    Send as SendIcon,
    Warning,
} from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import AppLayout from './AppLayout';
import { projectApi, taskApi, userApi, type Priority, type Project, type Status, type Task } from './api';

// Define the styled dialog component
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function TaskOverview() {
    // État pour stocker la valeur de recherche
    const [searchQuery, setSearchQuery] = useState('');

    // État pour gérer l'ouverture du dialogue de création de tâche
    const [open, setOpen] = useState(false);

    // État pour les tâches, projets, utilisateurs, statuts et priorités
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [priorities, setPriorities] = useState<Priority[]>([]);

    // État pour le chargement
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // État pour les notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // État pour le menu d'actions des tâches
    const [taskActionMenuAnchorEl, setTaskActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const openTaskActionMenu = Boolean(taskActionMenuAnchorEl);

    // État pour le formulaire de nouvelle tâche
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        project_id: 0,
        status_id: 1, // Par défaut "À faire"
        priority_id: 2, // Par défaut "Moyenne"
        user_id: 0,
        start_date: getCurrentDate(),
        end_date: addDays(getCurrentDate(), 7),
    });
    const [newTaskErrors, setNewTaskErrors] = useState({
        title: false,
        description: false,
        project_id: false,
        status_id: false,
        priority_id: false,
        user_id: false,
        start_date: false,
        end_date: false,
    });

    // État pour le dialogue de modification de tâche
    const [openEditTaskDialog, setOpenEditTaskDialog] = useState(false);
    const [editTaskData, setEditTaskData] = useState({
        id: 0,
        title: '',
        description: '',
        project_id: 0,
        status_id: 1,
        priority_id: 2,
        user_id: 0,
        start_date: getCurrentDate(),
        end_date: getCurrentDate(),
    });
    const [editTaskErrors, setEditTaskErrors] = useState({
        title: false,
        description: false,
        project_id: false,
        status_id: false,
        priority_id: false,
        user_id: false,
        start_date: false,
        end_date: false,
    });

    // État pour le dialogue de suppression de tâche
    const [openDeleteTaskDialog, setOpenDeleteTaskDialog] = useState(false);

    // État pour le filtre de statut
    const [statusFilter, setStatusFilter] = useState('Tous les statuts');

    // Fonction pour obtenir la date actuelle au format YYYY-MM-DD
    function getCurrentDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fonction pour ajouter des jours à une date
    function addDays(dateString: string, days: number) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Fonction pour formater la date pour l'affichage
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Fonction pour charger les tâches depuis l'API
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const tasksData = await taskApi.getAllTasks();
            setTasks(tasksData);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des tâches:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des tâches',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour charger les projets depuis l'API
    const fetchProjects = async () => {
        try {
            const projectsData = await projectApi.getAllProjects();
            setProjects(projectsData);
        } catch (error) {
            console.error('Erreur lors du chargement des projets:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des projets',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les utilisateurs depuis l'API
    const fetchUsers = async () => {
        try {
            const usersData = await userApi.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des utilisateurs',
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

    // Charger les données au chargement du composant
    useEffect(() => {
        const loadData = async () => {
            setInitialLoading(true);
            await Promise.all([fetchTasks(), fetchProjects(), fetchUsers(), fetchStatuses(), fetchPriorities()]);
            setInitialLoading(false);
        };
        loadData();
    }, []);

    // Fonction pour ouvrir le dialogue de création de tâche
    const handleClickOpen = () => {
        setOpen(true);
        setNewTaskData({
            title: '',
            description: '',
            project_id: 0,
            status_id: 1,
            priority_id: 2,
            user_id: 0,
            start_date: getCurrentDate(),
            end_date: addDays(getCurrentDate(), 7),
        });
        setNewTaskErrors({
            title: false,
            description: false,
            project_id: false,
            status_id: false,
            priority_id: false,
            user_id: false,
            start_date: false,
            end_date: false,
        });
    };

    // Fonction pour fermer le dialogue de création de tâche
    const handleClose = () => {
        setOpen(false);
    };

    // Fonction pour gérer le changement des champs du formulaire de nouvelle tâche
    const handleNewTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTaskData({
            ...newTaskData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (newTaskErrors[name as keyof typeof newTaskErrors]) {
            setNewTaskErrors({
                ...newTaskErrors,
                [name]: false,
            });
        }
    };

    // Fonction pour gérer le changement de projet dans le formulaire de nouvelle tâche
    const handleNewTaskProjectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setNewTaskData({
            ...newTaskData,
            project_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un projet est sélectionné
        if (newTaskErrors.project_id) {
            setNewTaskErrors({
                ...newTaskErrors,
                project_id: false,
            });
        }
    };

    // Fonction pour gérer le changement de statut dans le formulaire de nouvelle tâche
    const handleNewTaskStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setNewTaskData({
            ...newTaskData,
            status_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un statut est sélectionné
        if (newTaskErrors.status_id) {
            setNewTaskErrors({
                ...newTaskErrors,
                status_id: false,
            });
        }
    };

    // Fonction pour gérer le changement de priorité dans le formulaire de nouvelle tâche
    const handleNewTaskPriorityChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setNewTaskData({
            ...newTaskData,
            priority_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si une priorité est sélectionnée
        if (newTaskErrors.priority_id) {
            setNewTaskErrors({
                ...newTaskErrors,
                priority_id: false,
            });
        }
    };

    // Fonction pour gérer le changement d'utilisateur dans le formulaire de nouvelle tâche
    const handleNewTaskUserChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setNewTaskData({
            ...newTaskData,
            user_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un utilisateur est sélectionné
        if (newTaskErrors.user_id) {
            setNewTaskErrors({
                ...newTaskErrors,
                user_id: false,
            });
        }
    };

    // Fonction pour créer une nouvelle tâche
    const handleCreateNewTask = async () => {
        // Validation des champs
        const titleEmpty = newTaskData.title.trim() === '';
        const descriptionEmpty = newTaskData.description.trim() === '';
        const projectEmpty = !newTaskData.project_id;
        const statusEmpty = !newTaskData.status_id;
        const priorityEmpty = !newTaskData.priority_id;
        const userEmpty = !newTaskData.user_id;
        const startDateInvalid = !newTaskData.start_date;
        const endDateInvalid = !newTaskData.end_date;

        setNewTaskErrors({
            title: titleEmpty,
            description: descriptionEmpty,
            project_id: projectEmpty,
            status_id: statusEmpty,
            priority_id: priorityEmpty,
            user_id: userEmpty,
            start_date: startDateInvalid,
            end_date: endDateInvalid,
        });

        // Si tous les champs sont remplis, procéder à la création
        if (
            !titleEmpty &&
            !descriptionEmpty &&
            !projectEmpty &&
            !statusEmpty &&
            !priorityEmpty &&
            !userEmpty &&
            !startDateInvalid &&
            !endDateInvalid
        ) {
            try {
                setLoading(true);
                await taskApi.createTask(newTaskData);

                setSnackbar({
                    open: true,
                    message: 'Tâche créée avec succès',
                    severity: 'success',
                });

                handleClose();
                // Recharger la liste des tâches
                fetchTasks();

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la création de la tâche:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la création de la tâche',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonction pour ouvrir le menu d'actions des tâches
    const handleTaskActionMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: number) => {
        event.stopPropagation();
        setTaskActionMenuAnchorEl(event.currentTarget);
        setSelectedTaskId(taskId);
    };

    // Fonction pour fermer le menu d'actions des tâches
    const handleTaskActionMenuClose = () => {
        setTaskActionMenuAnchorEl(null);
    };

    // Fonction pour ouvrir le dialogue de modification de tâche
    const handleEditTaskDialogOpen = (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            setEditTaskData({
                id: task.id,
                title: task.title,
                description: task.description,
                project_id: task.project_id,
                status_id: task.status_id,
                priority_id: task.priority_id,
                user_id: task.user_id,
                start_date: task.start_date,
                end_date: task.end_date,
            });
            setEditTaskErrors({
                title: false,
                description: false,
                project_id: false,
                status_id: false,
                priority_id: false,
                user_id: false,
                start_date: false,
                end_date: false,
            });
            setOpenEditTaskDialog(true);
        }
        handleTaskActionMenuClose();
    };

    // Fonction pour fermer le dialogue de modification de tâche
    const handleEditTaskDialogClose = () => {
        setOpenEditTaskDialog(false);
    };

    // Fonction pour gérer le changement des champs du formulaire de modification de tâche
    const handleEditTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditTaskData({
            ...editTaskData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (editTaskErrors[name as keyof typeof editTaskErrors]) {
            setEditTaskErrors({
                ...editTaskErrors,
                [name]: false,
            });
        }
    };

    // Fonction pour gérer le changement de projet dans le formulaire de modification de tâche
    const handleEditTaskProjectChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setEditTaskData({
            ...editTaskData,
            project_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un projet est sélectionné
        if (editTaskErrors.project_id) {
            setEditTaskErrors({
                ...editTaskErrors,
                project_id: false,
            });
        }
    };

    // Fonction pour gérer le changement de statut dans le formulaire de modification de tâche
    const handleEditTaskStatusChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setEditTaskData({
            ...editTaskData,
            status_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un statut est sélectionné
        if (editTaskErrors.status_id) {
            setEditTaskErrors({
                ...editTaskErrors,
                status_id: false,
            });
        }
    };

    // Fonction pour gérer le changement de priorité dans le formulaire de modification de tâche
    const handleEditTaskPriorityChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setEditTaskData({
            ...editTaskData,
            priority_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si une priorité est sélectionnée
        if (editTaskErrors.priority_id) {
            setEditTaskErrors({
                ...editTaskErrors,
                priority_id: false,
            });
        }
    };

    // Fonction pour gérer le changement d'utilisateur dans le formulaire de modification de tâche
    const handleEditTaskUserChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setEditTaskData({
            ...editTaskData,
            user_id: e.target.value as number,
        });

        // Réinitialiser l'erreur si un utilisateur est sélectionné
        if (editTaskErrors.user_id) {
            setEditTaskErrors({
                ...editTaskErrors,
                user_id: false,
            });
        }
    };

    // Fonction pour mettre à jour une tâche
    const handleUpdateTask = async () => {
        // Validation des champs
        const titleEmpty = editTaskData.title.trim() === '';
        const descriptionEmpty = editTaskData.description.trim() === '';
        const projectEmpty = !editTaskData.project_id;
        const statusEmpty = !editTaskData.status_id;
        const priorityEmpty = !editTaskData.priority_id;
        const userEmpty = !editTaskData.user_id;
        const startDateInvalid = !editTaskData.start_date;
        const endDateInvalid = !editTaskData.end_date;

        setEditTaskErrors({
            title: titleEmpty,
            description: descriptionEmpty,
            project_id: projectEmpty,
            status_id: statusEmpty,
            priority_id: priorityEmpty,
            user_id: userEmpty,
            start_date: startDateInvalid,
            end_date: endDateInvalid,
        });

        // Si tous les champs sont remplis, procéder à la mise à jour
        if (
            !titleEmpty &&
            !descriptionEmpty &&
            !projectEmpty &&
            !statusEmpty &&
            !priorityEmpty &&
            !userEmpty &&
            !startDateInvalid &&
            !endDateInvalid
        ) {
            try {
                setLoading(true);
                await taskApi.updateTask(editTaskData.id, editTaskData);

                setSnackbar({
                    open: true,
                    message: 'Tâche mise à jour avec succès',
                    severity: 'success',
                });

                handleEditTaskDialogClose();
                // Recharger la liste des tâches
                fetchTasks();

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la tâche:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la mise à jour de la tâche',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonction pour ouvrir le dialogue de suppression de tâche
    const handleDeleteTaskDialogOpen = (taskId: number) => {
        setSelectedTaskId(taskId);
        setOpenDeleteTaskDialog(true);
        handleTaskActionMenuClose();
    };

    // Fonction pour fermer le dialogue de suppression de tâche
    const handleDeleteTaskDialogClose = () => {
        setOpenDeleteTaskDialog(false);
        setSelectedTaskId(null);
    };

    // Fonction pour supprimer une tâche
    const handleDeleteTask = async () => {
        const taskIdToDelete = selectedTaskId;

        if (!taskIdToDelete) return;

        try {
            setLoading(true);
            await taskApi.deleteTask(taskIdToDelete);

            setSnackbar({
                open: true,
                message: 'Tâche supprimée avec succès',
                severity: 'success',
            });

            handleDeleteTaskDialogClose();
            // Recharger la liste des tâches
            fetchTasks();

            setLoading(false);
        } catch (error) {
            console.error('Erreur lors de la suppression de la tâche:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression de la tâche',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour fermer la notification
    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    };

    // Fonction pour gérer le changement de la valeur de recherche
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Fonction pour gérer le changement du filtre de statut
    const handleStatusFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setStatusFilter(e.target.value as string);
    };

    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'À faire':
                return { bg: '#FFF9C4', color: 'goldenrod' };
            case 'En cours':
                return { bg: '#E3F2FD', color: 'blue' };
            case 'Terminée':
                return { bg: '#E8F5E9', color: 'green' };
            default:
                return { bg: '#E0E0E0', color: 'gray' };
        }
    };

    // Fonction pour obtenir la couleur de la priorité
    const getPriorityColor = (priorite: string) => {
        switch (priorite) {
            case 'Urgente':
                return { bg: '#FFEBEE', color: 'red' };
            case 'Haute':
                return { bg: '#FFF3E0', color: 'orange' };
            case 'Moyenne':
                return { bg: '#E8F5E9', color: 'green' };
            case 'Basse':
                return { bg: '#E0F7FA', color: 'teal' };
            default:
                return { bg: '#E0E0E0', color: 'gray' };
        }
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

    // Fonction pour obtenir le nom du projet à partir de l'ID
    const getProjectName = (projectId: number) => {
        const project = projects.find((p) => p.id === projectId);
        return project ? project.title : 'Inconnu';
    };

    // Fonction pour obtenir le nom de l'utilisateur à partir de l'ID
    const getUserName = (userId: number) => {
        const user = users.find((u) => u.id === userId);
        return user ? user.name : 'Inconnu';
    };

    // Filtrer les tâches en fonction de la recherche et du statut
    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (statusFilter === 'Tous les statuts' || getStatusName(task.status_id) === statusFilter),
    );

    // Calculer les statistiques des tâches
    const taskStats = [
        {
            icon: <Warning sx={{ color: 'goldenrod' }} />,
            label: 'Tâches à faire',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'À faire').length,
            bgColor: '#FFF9C4',
        },
        {
            icon: <AccessTime sx={{ color: 'blue' }} />,
            label: 'En cours',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'En cours').length,
            bgColor: '#E3F2FD',
        },
        {
            icon: <CheckCircle sx={{ color: 'green' }} />,
            label: 'Terminées',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'Terminée').length,
            bgColor: '#E8F5E9',
        },
        {
            icon: <Event sx={{ color: 'red' }} />,
            label: 'Échéance proche',
            count: tasks.filter((task) => {
                const today = new Date();
                const deadline = new Date(task.end_date);
                const diffTime = deadline.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0 && getStatusName(task.status_id) !== 'Terminée';
            }).length,
            bgColor: '#FFEBEE',
        },
    ];

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

            <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 5 }}>
                {/* Fil d'Ariane */}
                <Box sx={{ mb: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/">
                            Tableau de bord
                        </Link>
                        <Typography color="text.primary">Taches</Typography>
                    </Breadcrumbs>
                </Box>

                {/* En-tête et titre */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Tâches
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleClickOpen}
                        color="success"
                        startIcon={<AddIcon />}
                        sx={{ textTransform: 'none', borderRadius: 1, px: 2 }}
                    >
                        Nouvelle tâche
                    </Button>
                </Box>

                {/* Fenêtre modale de création de tâche */}
                <BootstrapDialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                        Créer une nouvelle tâche
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <DialogContent dividers>
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                label="Nom de la tâche"
                                fullWidth
                                variant="outlined"
                                name="title"
                                value={newTaskData.title}
                                onChange={handleNewTaskInputChange}
                                error={newTaskErrors.title}
                                helperText={newTaskErrors.title ? 'Le nom de la tâche est requis' : ''}
                                required
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                name="description"
                                value={newTaskData.description}
                                onChange={handleNewTaskInputChange}
                                error={newTaskErrors.description}
                                helperText={newTaskErrors.description ? 'La description est requise' : ''}
                                required
                            />
                            <FormControl fullWidth error={newTaskErrors.project_id}>
                                <InputLabel id="project-label">Projet</InputLabel>
                                <Select
                                    labelId="project-label"
                                    id="project_id"
                                    value={newTaskData.project_id || ''}
                                    label="Projet"
                                    onChange={handleNewTaskProjectChange as any}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Sélectionner un projet</em>
                                    </MenuItem>
                                    {projects.map((project) => (
                                        <MenuItem key={project.id} value={project.id}>
                                            {project.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {newTaskErrors.project_id && (
                                    <Typography variant="caption" color="error">
                                        Le projet est requis
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={newTaskErrors.status_id}>
                                <InputLabel id="status-label">Statut</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status_id"
                                    value={newTaskData.status_id || ''}
                                    label="Statut"
                                    onChange={handleNewTaskStatusChange as any}
                                    required
                                >
                                    {statuses.map((status) => (
                                        <MenuItem key={status.id} value={status.id}>
                                            {status.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {newTaskErrors.status_id && (
                                    <Typography variant="caption" color="error">
                                        Le statut est requis
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={newTaskErrors.priority_id}>
                                <InputLabel id="priority-label">Priorité</InputLabel>
                                <Select
                                    labelId="priority-label"
                                    id="priority_id"
                                    value={newTaskData.priority_id || ''}
                                    label="Priorité"
                                    onChange={handleNewTaskPriorityChange as any}
                                    required
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {newTaskErrors.priority_id && (
                                    <Typography variant="caption" color="error">
                                        La priorité est requise
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={newTaskErrors.user_id}>
                                <InputLabel id="user-label">Assigné à</InputLabel>
                                <Select
                                    labelId="user-label"
                                    id="user_id"
                                    value={newTaskData.user_id || ''}
                                    label="Assigné à"
                                    onChange={handleNewTaskUserChange as any}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Sélectionner un utilisateur</em>
                                    </MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {newTaskErrors.user_id && (
                                    <Typography variant="caption" color="error">
                                        L'utilisateur est requis
                                    </Typography>
                                )}
                            </FormControl>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Date de début"
                                        type="date"
                                        name="start_date"
                                        value={newTaskData.start_date}
                                        onChange={handleNewTaskInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={newTaskErrors.start_date}
                                        helperText={newTaskErrors.start_date ? 'La date de début est requise' : ''}
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Date de fin"
                                        type="date"
                                        name="end_date"
                                        value={newTaskData.end_date}
                                        onChange={handleNewTaskInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={newTaskErrors.end_date}
                                        helperText={newTaskErrors.end_date ? 'La date de fin est requise' : ''}
                                        required
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button variant="outlined" color="success" onClick={handleClose} sx={{ textTransform: 'none' }}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleCreateNewTask}
                            endIcon={<SendIcon />}
                            sx={{ textTransform: 'none', borderRadius: 1, px: 3 }}
                            disabled={loading}
                        >
                            Créer la tâche
                        </Button>
                    </DialogActions>
                </BootstrapDialog>

                {/* Fenêtre modale de modification de tâche */}
                <BootstrapDialog
                    onClose={handleEditTaskDialogClose}
                    aria-labelledby="edit-dialog-title"
                    open={openEditTaskDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ m: 0, p: 2 }} id="edit-dialog-title">
                        Modifier la tâche
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleEditTaskDialogClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <DialogContent dividers>
                        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                label="Nom de la tâche"
                                fullWidth
                                variant="outlined"
                                name="title"
                                value={editTaskData.title}
                                onChange={handleEditTaskInputChange}
                                error={editTaskErrors.title}
                                helperText={editTaskErrors.title ? 'Le nom de la tâche est requis' : ''}
                                required
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                name="description"
                                value={editTaskData.description}
                                onChange={handleEditTaskInputChange}
                                error={editTaskErrors.description}
                                helperText={editTaskErrors.description ? 'La description est requise' : ''}
                                required
                            />
                            <FormControl fullWidth error={editTaskErrors.project_id}>
                                <InputLabel id="edit-project-label">Projet</InputLabel>
                                <Select
                                    labelId="edit-project-label"
                                    id="edit_project_id"
                                    value={editTaskData.project_id || ''}
                                    label="Projet"
                                    onChange={handleEditTaskProjectChange as any}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Sélectionner un projet</em>
                                    </MenuItem>
                                    {projects.map((project) => (
                                        <MenuItem key={project.id} value={project.id}>
                                            {project.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editTaskErrors.project_id && (
                                    <Typography variant="caption" color="error">
                                        Le projet est requis
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={editTaskErrors.status_id}>
                                <InputLabel id="edit-status-label">Statut</InputLabel>
                                <Select
                                    labelId="edit-status-label"
                                    id="edit_status_id"
                                    value={editTaskData.status_id || ''}
                                    label="Statut"
                                    onChange={handleEditTaskStatusChange as any}
                                    required
                                >
                                    {statuses.map((status) => (
                                        <MenuItem key={status.id} value={status.id}>
                                            {status.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editTaskErrors.status_id && (
                                    <Typography variant="caption" color="error">
                                        Le statut est requis
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={editTaskErrors.priority_id}>
                                <InputLabel id="edit-priority-label">Priorité</InputLabel>
                                <Select
                                    labelId="edit-priority-label"
                                    id="edit_priority_id"
                                    value={editTaskData.priority_id || ''}
                                    label="Priorité"
                                    onChange={handleEditTaskPriorityChange as any}
                                    required
                                >
                                    {priorities.map((priority) => (
                                        <MenuItem key={priority.id} value={priority.id}>
                                            {priority.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editTaskErrors.priority_id && (
                                    <Typography variant="caption" color="error">
                                        La priorité est requise
                                    </Typography>
                                )}
                            </FormControl>
                            <FormControl fullWidth error={editTaskErrors.user_id}>
                                <InputLabel id="edit-user-label">Assigné à</InputLabel>
                                <Select
                                    labelId="edit-user-label"
                                    id="edit_user_id"
                                    value={editTaskData.user_id || ''}
                                    label="Assigné à"
                                    onChange={handleEditTaskUserChange as any}
                                    required
                                >
                                    <MenuItem value="">
                                        <em>Sélectionner un utilisateur</em>
                                    </MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {editTaskErrors.user_id && (
                                    <Typography variant="caption" color="error">
                                        L'utilisateur est requis
                                    </Typography>
                                )}
                            </FormControl>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Date de début"
                                        type="date"
                                        name="start_date"
                                        value={editTaskData.start_date}
                                        onChange={handleEditTaskInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={editTaskErrors.start_date}
                                        helperText={editTaskErrors.start_date ? 'La date de début est requise' : ''}
                                        required
                                    />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Date de fin"
                                        type="date"
                                        name="end_date"
                                        value={editTaskData.end_date}
                                        onChange={handleEditTaskInputChange}
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        error={editTaskErrors.end_date}
                                        helperText={editTaskErrors.end_date ? 'La date de fin est requise' : ''}
                                        required
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <Button variant="outlined" color="success" onClick={handleEditTaskDialogClose} sx={{ textTransform: 'none' }}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleUpdateTask}
                            sx={{ textTransform: 'none', borderRadius: 1, px: 3 }}
                            disabled={loading}
                        >
                            Mettre à jour
                        </Button>
                    </DialogActions>
                </BootstrapDialog>

                {/* Dialogue de suppression de tâche */}
                <Dialog open={openDeleteTaskDialog} onClose={handleDeleteTaskDialogClose} fullWidth maxWidth="sm">
                    <DialogTitle>Supprimer la tâche</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteTaskDialogClose}>Annuler</Button>
                        <Button onClick={handleDeleteTask} variant="contained" color="error" disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Supprimer'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                    Gestion des taches
                </Typography>

                {/* Cartes des statuts */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 2,
                        p: 3,
                        flexWrap: 'wrap',
                    }}
                >
                    {taskStats.map((task, index) => (
                        <Paper
                            key={index}
                            elevation={3}
                            sx={{
                                width: 200,
                                height: 120,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2,
                                p: 2,
                                textAlign: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                    width: 35,
                                    height: 35,
                                    borderRadius: '50%',
                                    backgroundColor: task.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 1,
                                }}
                            >
                                {task.icon}
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {task.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {task.count}
                            </Typography>
                        </Paper>
                    ))}
                </Box>

                {/* Tableau des tâches */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Liste des tâches
                    </Typography>

                    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="tableau des tâches">
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ pb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <Select
                                                    value={statusFilter}
                                                    onChange={handleStatusFilterChange as any}
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
                                            <TextField
                                                variant="outlined"
                                                size="small"
                                                placeholder="Rechercher une tâche..."
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                sx={{ maxWidth: '300px' }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Search fontSize="small" />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { height: '36px', fontSize: '0.875rem' },
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tâche</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Projet</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Priorité</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Échéance</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Assigné à</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => {
                                        const statusName = task.status?.name || getStatusName(task.status_id);
                                        const priorityName = task.priority?.name || getPriorityName(task.priority_id);
                                        const statusColor = getStatusColor(statusName);
                                        const priorityColor = getPriorityColor(priorityName);
                                        const userName = task.user?.name || getUserName(task.user_id);
                                        const userAvatar = task.user?.avatar || '/placeholder.svg?height=40&width=40';

                                        return (
                                            <TableRow
                                                key={task.id}
                                                sx={{
                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                    '&:hover': { backgroundColor: '#f9f9f9' },
                                                }}
                                            >
                                                <TableCell component="th" scope="row">
                                                    {task.title}
                                                </TableCell>
                                                <TableCell>{task.project?.title || getProjectName(task.project_id)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={priorityName}
                                                        sx={{
                                                            backgroundColor: priorityColor.bg,
                                                            color: priorityColor.color,
                                                            fontWeight: 'medium',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={statusName}
                                                        sx={{
                                                            backgroundColor: statusColor.bg,
                                                            color: statusColor.color,
                                                            fontWeight: 'medium',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{formatDate(task.end_date)}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar src={userAvatar} sx={{ width: 30, height: 30 }} />
                                                        <Typography variant="body2">{userName}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={(e) => handleTaskActionMenuOpen(e, task.id)}>
                                                        <MoreVert />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                Aucune tâche trouvée
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Container>

            {/* Menu d'actions pour les tâches */}
            <Menu
                anchorEl={taskActionMenuAnchorEl}
                open={openTaskActionMenu}
                onClose={handleTaskActionMenuClose}
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
                <MenuItem onClick={() => handleEditTaskDialogOpen(selectedTaskId || 0)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Modifier" />
                </MenuItem>
                <MenuItem onClick={() => handleDeleteTaskDialogOpen(selectedTaskId || 0)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                </MenuItem>
            </Menu>
        </AppLayout>
    );
}
