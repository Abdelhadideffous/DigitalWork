'use client';

import {
    AccessTime,
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Event,
    MoreVert,
    Search as SearchIcon,
    Send as SendIcon,
    Visibility as VisibilityIcon,
    Warning,
} from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useEffect, useState } from 'react';
import AppLayout from '../layout/AppLayout';
import { getCurrentUser } from '../login/api';
import { projectApi, subtaskApi, taskApi, userApi, type Priority, type Project, type Status, type Subtask, type Task } from './api';

// Define the styled dialog component
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const Task: React.FC = () => {
    // État pour l'utilisateur connecté
    const [currentUser, setCurrentUser] = useState<any>(null);

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

    // État pour les membres du projet sélectionné
    const [projectMembers, setProjectMembers] = useState<any[]>([]);

    // État pour les sous-tâches
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [openTaskActionMenu, setOpenTaskActionMenu] = useState(false);

    // État pour le chargement
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);

    // État pour les notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // État pour le menu d'actions des tâches
    const [taskActionMenuAnchorEl, setTaskActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

    // État pour le formulaire de nouvelle tâche
    const [newTaskData, setNewTaskData] = useState({
        title: '',
        description: '',
        project_id: 0,
        status_id: 1, // Par défaut "À faire"
        priority_id: 2, // Par défaut "Moyenne"
        assigned_to: 0, // Modifié de user_id à assigned_to
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
        assigned_to: 0, // Modifié de user_id à assigned_to
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

    // État pour le formulaire de nouvelle sous-tâche
    const [newSubtaskData, setNewSubtaskData] = useState({
        title: '',
        progress: 0,
    });
    const [newSubtaskErrors, setNewSubtaskErrors] = useState({
        title: false,
    });

    // État pour le dialogue de modification de sous-tâche
    const [openEditSubtaskDialog, setOpenEditSubtaskDialog] = useState(false);
    const [editSubtaskData, setEditSubtaskData] = useState({
        id: 0,
        task_id: 0,
        title: '',
        progress: 0,
    });
    const [editSubtaskErrors, setEditSubtaskErrors] = useState({
        title: false,
    });

    // État pour le dialogue de suppression de sous-tâche
    const [openDeleteSubtaskDialog, setOpenDeleteSubtaskDialog] = useState(false);
    const [selectedSubtaskId, setSelectedSubtaskId] = useState<number | null>(null);

    // État pour le filtre de statut
    const [statusFilter, setStatusFilter] = useState('Tous les statuts');

    // État pour afficher les filtres
    const [showFilters, setShowFilters] = useState(false);

    // Ajouter un nouvel état pour afficher les détails de la tâche
    const [showTaskDetails, setShowTaskDetails] = useState(false);

    // 3. Ajouter un état pour la fenêtre modale d'ajout de sous-tâche
    const [openAddSubtaskDialog, setOpenAddSubtaskDialog] = useState(false);

    // Ajouter ces états pour les nouveaux filtres
    const [priorityFilter, setPriorityFilter] = useState('Toutes les priorités');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

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
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/test/login';
                return;
            }
            const tasksData = await taskApi.getAllTasks();
            console.log('Données des tâches reçues:', tasksData);
            setTasks(tasksData);
            setLoading(false);
        } catch (error: any) {
            console.error('Erreur lors du chargement des tâches:', error);
            if (error.response?.status === 401) {
                window.location.href = '/test/login';
            }
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
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/test/login';
                return;
            }
            const projectsData = await projectApi.getManagedProjects();
            setProjects(projectsData);
        } catch (error: any) {
            console.error('Erreur lors du chargement des projets:', error);
            if (error.response?.status === 401) {
                window.location.href = '/test/login';
            }
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
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/test/login';
                return;
            }
            const usersData = await userApi.getAllUsers();
            console.log('Utilisateurs chargés:', usersData);
            setUsers(usersData);
        } catch (error: any) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            if (error.response?.status === 401) {
                window.location.href = '/test/login';
            }
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
        } catch (error: any) {
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
        } catch (error: any) {
            console.error('Erreur lors du chargement des priorités:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des priorités',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les membres d'un projet
    const fetchProjectMembers = async (projectId: number) => {
        try {
            // 🔄 1) utilise l'helper Axios qui ajoute déjà le bon token (sessionStorage)
            const members = await userApi.getProjectMembers(projectId); // api.ts
            setProjectMembers(members); // ⇒ tableau Users
        } catch (err: any) {
            console.error(`Erreur chargement membres du projet ${projectId}:`, err);
            setProjectMembers([]);
            setSnackbar({
                open: true,
                message: "Impossible de charger les membres de l'équipe",
                severity: 'error',
            });
        }
    };

    // 2. Modifier la fonction fetchSubtasks pour s'assurer qu'elle ne récupère que les sous-tâches de la tâche sélectionnée
    const fetchSubtasks = async (taskId: number) => {
        try {
            setLoadingSubtasks(true);
            const subtasksData = await subtaskApi.getTaskSubtasks(taskId);
            // Assurez-vous que seules les sous-tâches de la tâche sélectionnée sont affichées
            const filteredSubtasks = subtasksData.filter((subtask: { task_id: number }) => subtask.task_id === taskId);
            setSubtasks(filteredSubtasks);
            setLoadingSubtasks(false);
        } catch (error: any) {
            console.error(`Erreur lors du chargement des sous-tâches pour la tâche ${taskId}:`, error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des sous-tâches',
                severity: 'error',
            });
            setLoadingSubtasks(false);
        }
    };

    // Récupérer l'utilisateur connecté au chargement du composant
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);
                const token = sessionStorage.getItem('token');
                if (!token) {
                    window.location.href = '/test/login';
                    return;
                }

                const user = await getCurrentUser();
                setCurrentUser(user);
                await Promise.all([fetchTasks(), fetchProjects(), fetchUsers(), fetchStatuses(), fetchPriorities()]);
            } catch (error: any) {
                console.error('Erreur lors du chargement initial:', error);
                if (error.response?.status === 401) {
                    window.location.href = '/test/login';
                }
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, []);

    // Surveiller les changements d'utilisateur dans le localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const user = getCurrentUser();
            if (user) {
                setCurrentUser(user);
            } else {
                // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
                window.location.href = '/test/login';
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Charger les membres du projet lors de l'ouverture du dialogue de modification
    useEffect(() => {
        if (openEditTaskDialog && editTaskData.project_id) {
            fetchProjectMembers(editTaskData.project_id);
        }
    }, [openEditTaskDialog, editTaskData.project_id]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await projectApi.getManagedProjects();
                setProjects(res); // => liste des projets où il est manager
            } catch (err) {
                console.error('Erreur de chargement des projets', err);
            }
        };

        fetchProjects();
    }, []);

    // Fonction pour ouvrir le dialogue de création de tâche
    const handleClickOpen = () => {
        // Utiliser l'ID de l'utilisateur connecté comme valeur par défaut pour assigned_to
        setNewTaskData({
            title: '',
            description: '',
            project_id: 0,
            status_id: 1,
            priority_id: 2,
            assigned_to: currentUser ? currentUser.id : 0, // Utiliser l'ID de l'utilisateur connecté
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
        setOpen(true);
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
        const projectId = e.target.value as number;
        setNewTaskData({
            ...newTaskData,
            project_id: projectId,
            assigned_to: 0, // Réinitialiser l'utilisateur assigné
        });

        // Réinitialiser l'erreur si un projet est sélectionné
        if (newTaskErrors.project_id) {
            setNewTaskErrors({
                ...newTaskErrors,
                project_id: false,
            });
        }

        // Charger les membres du projet sélectionné
        if (projectId) {
            fetchProjectMembers(projectId);
        } else {
            setProjectMembers([]);
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
            assigned_to: e.target.value as number, // Modifié de user_id à assigned_to
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
        // Vérifier si tous les champs requis sont remplis
        const titleEmpty = !newTaskData.title.trim();
        const descriptionEmpty = !newTaskData.description.trim();
        const projectEmpty = newTaskData.project_id === 0;
        const statusEmpty = newTaskData.status_id === 0;
        const priorityEmpty = newTaskData.priority_id === 0;
        const userEmpty = newTaskData.assigned_to === 0;
        const startDateInvalid = !newTaskData.start_date;
        const endDateInvalid = !newTaskData.end_date;

        // Mettre à jour les erreurs
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
                const token = sessionStorage.getItem('token');
                if (!token) {
                    window.location.href = '/test/login';
                    return;
                }
                // Ajouter l'ID de l'utilisateur créateur (l'utilisateur connecté)
                const taskDataWithCreator = {
                    ...newTaskData,
                };
                console.log('Données de tâche à créer:', taskDataWithCreator);
                await taskApi.createTask(taskDataWithCreator);

                setSnackbar({
                    open: true,
                    message: 'Tâche créée avec succès',
                    severity: 'success',
                });

                handleClose();
                // Recharger la liste des tâches
                fetchTasks();

                setLoading(false);
            } catch (error: any) {
                console.error('Erreur lors de la création de la tâche:', error);
                if (error.response?.status === 401) {
                    window.location.href = '/test/login';
                }
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
        setOpenTaskActionMenu(true);
    };

    // Fonction pour fermer le menu d'actions des tâches
    const handleTaskActionMenuClose = () => {
        setTaskActionMenuAnchorEl(null);
        setOpenTaskActionMenu(false);
    };

    // Modifier la fonction handleTaskDetailsOpen pour qu'elle fonctionne comme dans projet.tsx
    const handleTaskDetailsOpen = (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            setSelectedTask(task);
            fetchSubtasks(taskId);
            setShowTaskDetails(true);
        }
        handleTaskActionMenuClose();
    };

    // Fonction pour fermer le dialogue de détails de tâche
    const handleTaskDetailsClose = () => {
        setShowTaskDetails(false);
        setSelectedTask(null);
        setSubtasks([]);
    };

    // 3. Ajouter un état pour la fenêtre modale d'ajout de sous-tâche
    // Fonctions pour gérer l'ouverture et la fermeture de la fenêtre modale
    const handleAddSubtaskDialogOpen = () => {
        setNewSubtaskData({
            title: '',
            progress: 0,
        });
        setNewSubtaskErrors({
            title: false,
        });
        setOpenAddSubtaskDialog(true);
    };

    const handleAddSubtaskDialogClose = () => {
        setOpenAddSubtaskDialog(false);
    };

    // Fonction pour gérer le changement des champs du formulaire de nouvelle sous-tâche
    const handleNewSubtaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewSubtaskData({
            ...newSubtaskData,
            [name]: name === 'progress' ? Number(value) : value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (newSubtaskErrors[name as keyof typeof newSubtaskErrors]) {
            setNewSubtaskErrors({
                ...newSubtaskErrors,
                [name]: false,
            });
        }
    };

    // Fonction pour gérer le changement de la progression d'une sous-tâche via le slider
    const handleProgressChange = (_event: Event, newValue: number | number[]) => {
        setNewSubtaskData({
            ...newSubtaskData,
            progress: newValue as number,
        });
    };

    // Fonction pour créer une nouvelle sous-tâche
    const handleCreateSubtask = async () => {
        if (!selectedTask) return;

        // Validation des champs
        const titleEmpty = newSubtaskData.title.trim() === '';

        setNewSubtaskErrors({
            title: titleEmpty,
        });

        if (!titleEmpty) {
            try {
                setLoading(true);
                // Ajouter l'ID de l'utilisateur créateur (l'utilisateur connecté)
                const subtaskDataWithCreator = {
                    ...newSubtaskData,
                };
                await subtaskApi.createSubtask(selectedTask.id, subtaskDataWithCreator);

                setSnackbar({
                    open: true,
                    message: 'Sous-tâche créée avec succès',
                    severity: 'success',
                });

                // Réinitialiser le formulaire
                setNewSubtaskData({
                    title: '',
                    progress: 0,
                });

                // Recharger les sous-tâches
                fetchSubtasks(selectedTask.id);
                // Recharger la tâche pour mettre à jour la progression
                const updatedTask = await taskApi.getTaskById(selectedTask.id);
                setSelectedTask(updatedTask);
                // Recharger toutes les tâches pour mettre à jour la liste
                fetchTasks();

                setLoading(false);
            } catch (error: any) {
                console.error('Erreur lors de la création de la sous-tâche:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la création de la sous-tâche',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonction pour ouvrir le dialogue de modification de sous-tâche
    const handleEditSubtaskDialogOpen = (subtask: Subtask) => {
        setEditSubtaskData({
            id: subtask.id,
            task_id: subtask.task_id,
            title: subtask.title,
            progress: subtask.progress,
        });
        setEditSubtaskErrors({
            title: false,
        });
        setOpenEditSubtaskDialog(true);
    };

    // Fonction pour fermer le dialogue de modification de sous-tâche
    const handleEditSubtaskDialogClose = () => {
        setOpenEditSubtaskDialog(false);
    };

    // Fonction pour gérer le changement des champs du formulaire de modification de sous-tâche
    const handleEditSubtaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditSubtaskData({
            ...editSubtaskData,
            [name]: name === 'progress' ? Number(value) : value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (editSubtaskErrors[name as keyof typeof editSubtaskErrors]) {
            setEditSubtaskErrors({
                ...editSubtaskErrors,
                [name]: false,
            });
        }
    };

    // Fonction pour gérer le changement de la progression d'une sous-tâche via le slider dans le formulaire de modification
    const handleEditProgressChange = (_event: Event, newValue: number | number[]) => {
        setEditSubtaskData({
            ...editSubtaskData,
            progress: newValue as number,
        });
    };

    // Fonction pour mettre à jour une sous-tâche
    const handleUpdateSubtask = async () => {
        // Validation des champs
        const titleEmpty = editSubtaskData.title.trim() === '';

        setEditSubtaskErrors({
            title: titleEmpty,
        });

        if (!titleEmpty) {
            try {
                setLoading(true);
                // Ajouter l'ID de l'utilisateur qui modifie (l'utilisateur connecté)
                const subtaskDataWithUpdater = {
                    title: editSubtaskData.title,
                    progress: editSubtaskData.progress,
                };
                await subtaskApi.updateSubtask(editSubtaskData.id, subtaskDataWithUpdater);

                setSnackbar({
                    open: true,
                    message: 'Sous-tâche mise à jour avec succès',
                    severity: 'success',
                });

                handleEditSubtaskDialogClose();

                // Recharger les sous-tâches
                if (selectedTask) {
                    fetchSubtasks(selectedTask.id);
                    // Recharger la tâche pour mettre à jour la progression
                    const updatedTask = await taskApi.getTaskById(selectedTask.id);
                    setSelectedTask(updatedTask);
                    // Recharger toutes les tâches pour mettre à jour la liste
                    fetchTasks();
                }

                setLoading(false);
            } catch (error: any) {
                console.error('Erreur lors de la mise à jour de la sous-tâche:', error);
                setSnackbar({
                    open: true,
                    message: 'Erreur lors de la mise à jour de la sous-tâche',
                    severity: 'error',
                });
                setLoading(false);
            }
        }
    };

    // Fonction pour ouvrir le dialogue de suppression de sous-tâche
    const handleDeleteSubtaskDialogOpen = (subtaskId: number) => {
        setSelectedSubtaskId(subtaskId);
        setOpenDeleteSubtaskDialog(true);
    };

    // Fonction pour fermer le dialogue de suppression de sous-tâche
    const handleDeleteSubtaskDialogClose = () => {
        setOpenDeleteSubtaskDialog(false);
        setSelectedSubtaskId(null);
    };

    // Fonction pour supprimer une sous-tâche
    const handleDeleteSubtask = async () => {
        if (!selectedSubtaskId || !selectedTask) return;

        try {
            setLoading(true);
            await subtaskApi.deleteSubtask(selectedSubtaskId);

            setSnackbar({
                open: true,
                message: 'Sous-tâche supprimée avec succès',
                severity: 'success',
            });

            handleDeleteSubtaskDialogClose();

            // Recharger les sous-tâches
            fetchSubtasks(selectedTask.id);
            // Recharger la tâche pour mettre à jour la progression
            const updatedTask = await taskApi.getTaskById(selectedTask.id);
            setSelectedTask(updatedTask);
            // Recharger toutes les tâches pour mettre à jour la liste
            fetchTasks();

            setLoading(false);
        } catch (error: any) {
            console.error('Erreur lors de la suppression de la sous-tâche:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression de la sous-tâche',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour marquer une sous-tâche comme terminée
    const handleCompleteSubtask = async (subtaskId: number) => {
        if (!selectedTask) return;

        try {
            setLoading(true);
            // Ajouter l'ID de l'utilisateur qui complète (l'utilisateur connecté)
            await subtaskApi.completeSubtask(subtaskId);

            setSnackbar({
                open: true,
                message: 'Sous-tâche marquée comme terminée',
                severity: 'success',
            });

            // Recharger les sous-tâches
            fetchSubtasks(selectedTask.id);
            // Recharger la tâche pour mettre à jour la progression
            const updatedTask = await taskApi.getTaskById(selectedTask.id);
            setSelectedTask(updatedTask);
            // Recharger toutes les tâches pour mettre à jour la liste
            fetchTasks();

            setLoading(false);
        } catch (error: any) {
            console.error('Erreur lors du marquage de la sous-tâche comme terminée:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du marquage de la sous-tâche comme terminée',
                severity: 'error',
            });
            setLoading(false);
        }
    };

    // Fonction pour ouvrir le dialogue de modification de tâche
    const handleEditTaskDialogOpen = (taskId: number) => {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
            console.log('Tâche à modifier:', task); // Debug
            setEditTaskData({
                id: task.id,
                title: task.title,
                description: task.description,
                project_id: task.project_id,
                status_id: task.status_id,
                priority_id: task.priority_id,
                assigned_to: task.assigned_to, // Modifié de user_id à assigned_to
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
        const projectId = e.target.value as number;
        setEditTaskData({
            ...editTaskData,
            project_id: projectId,
        });

        // Réinitialiser l'erreur si un projet est sélectionné
        if (editTaskErrors.project_id) {
            setEditTaskErrors({
                ...editTaskErrors,
                project_id: false,
            });
        }

        // Charger les membres du projet sélectionné
        if (projectId) {
            fetchProjectMembers(projectId);
        } else {
            setProjectMembers([]);
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
            assigned_to: e.target.value as number, // Modifié de user_id à assigned_to
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
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/test/login';
                return;
            }
            await taskApi.updateTask(editTaskData.id, editTaskData);
            setSnackbar({
                open: true,
                message: 'Tâche modifiée avec succès',
                severity: 'success',
            });
            setOpenEditTaskDialog(false);
            fetchTasks();
            setLoading(false);
        } catch (error: any) {
            console.error('Erreur lors de la modification de la tâche:', error);
            if (error.response?.status === 401) {
                window.location.href = '/test/login';
            }
            setSnackbar({
                open: true,
                message: 'Erreur lors de la modification de la tâche',
                severity: 'error',
            });
            setLoading(false);
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
        try {
            setLoading(true);
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/test/login';
                return;
            }
            await taskApi.deleteTask(selectedTaskId || 0);
            setSnackbar({
                open: true,
                message: 'Tâche supprimée avec succès',
                severity: 'success',
            });
            setOpenDeleteTaskDialog(false);
            fetchTasks();
            setLoading(false);
        } catch (error: any) {
            console.error('Erreur lors de la suppression de la tâche:', error);
            if (error.response?.status === 401) {
                window.location.href = '/test/login';
            }
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

    // 1. Modifier la section des filtres pour ajouter les filtres manquants et corriger la fonctionnalité
    // Ajouter ces fonctions pour gérer les changements des nouveaux filtres
    const handlePriorityFilterChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        setPriorityFilter(e.target.value as string);
    };

    const handleStartDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDateFilter(e.target.value);
    };

    const handleEndDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndDateFilter(e.target.value);
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
            case 'En attente':
                return { bg: '#FFF59D', color: '#F57C00' };
            case 'En cours':
                return { bg: '#BBDEFB', color: '#1976D2' };
            case 'Terminée':
                return { bg: '#C8E6C9', color: '#388E3C' };
            case 'Annulé':
                return { bg: '#FFCDD2', color: '#D32F2F' };
            case 'En pause':
                return { bg: '#FFEB3B', color: '#F57C00' };
            default:
                return { bg: '#B0BEC5', color: '#37474F' };
        }
    };

    // Fonction pour obtenir la couleur de la priorité

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

    // 1. Modifier la section des filtres pour ajouter les filtres manquants et corriger la fonctionnalité
    // Remplacer la fonction de filtrage des tâches pour inclure tous les filtres
    const filteredTasks = tasks.filter((task) => {
        // Filtre de recherche par titre
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Filtre par statut
        const matchesStatus = statusFilter === 'Tous les statuts' || getStatusName(task.status_id) === statusFilter;

        // Filtre par priorité
        const matchesPriority = priorityFilter === 'Toutes les priorités' || getPriorityName(task.priority_id) === priorityFilter;

        // Filtre par date de début
        const matchesStartDate = !startDateFilter || task.start_date >= startDateFilter;

        // Filtre par date de fin
        const matchesEndDate = !endDateFilter || task.end_date <= endDateFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesStartDate && matchesEndDate;
    });

    // Calculer les statistiques des tâches
    const taskStats = [
        {
            icon: <Warning sx={{ color: '#16A249' }} />,
            label: 'Tâches à faire',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'À faire').length,
            bgColor: '#FFF9C4',
        },
        {
            icon: <AccessTime sx={{ color: '#16A249' }} />,
            label: 'En cours',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'En cours').length,
            bgColor: '#E3F2FD',
        },
        {
            icon: <CheckCircle sx={{ color: '#16A249' }} />,
            label: 'Terminées',
            count: tasks.filter((task) => getStatusName(task.status_id) === 'Terminée').length,
            bgColor: '#E8F5E9',
        },
        {
            icon: <Event sx={{ color: '#16A249' }} />,
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

    const handleBackToTasksList = () => {
        setShowTaskDetails(false);
        setSelectedTask(null);
        setSubtasks([]);
    };

    // Remplacer le contenu du return pour gérer l'affichage conditionnel
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

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {showTaskDetails ? (
                    // Vue détaillée d'une tâche
                    <>
                        {/* Fil d'Ariane et en-tête combinés */}
                        <Box sx={{ mb: 3 }}>
                            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                                <Link
                                    underline="hover"
                                    color="inherit"
                                    href="/"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleBackToTasksList();
                                    }}
                                >
                                    Tableau de bord
                                </Link>
                                <Link
                                    underline="hover"
                                    color="inherit"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleBackToTasksList();
                                    }}
                                >
                                    Tâches
                                </Link>
                                <Typography color="text.primary">{selectedTask?.id}</Typography>
                            </Breadcrumbs>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={handleBackToTasksList} sx={{ mr: 1, p: 0 }}>
                                    <ArrowBackIcon />
                                </IconButton>
                                <Typography variant="h4" sx={{ flex: 1, fontWeight: 'bold' }}>
                                    {selectedTask?.title}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Contenu de la tâche */}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                            {/* Informations de la tâche */}
                            <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(to right bottom, #ffffff, #f9fdfb)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" color="#16A249">
                                            Informations de la tâche
                                        </Typography>
                                        <Chip
                                            label={selectedTask?.status?.name || getStatusName(selectedTask?.status_id || 0)}
                                            color={
                                                selectedTask?.status?.name === 'En cours' ||
                                                getStatusName(selectedTask?.status_id || 0) === 'En cours'
                                                    ? 'success'
                                                    : selectedTask?.status?.name === 'À faire' ||
                                                        getStatusName(selectedTask?.status_id || 0) === 'À faire'
                                                      ? 'warning'
                                                      : 'default'
                                            }
                                            sx={{ fontWeight: 'medium' }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body1" sx={{ backgroundColor: 'rgba(0,0,0,0.02)', p: 2, borderRadius: 1 }}>
                                            {selectedTask?.description}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Priorité
                                            </Typography>
                                            <Chip
                                                label={selectedTask?.priority?.name || getPriorityName(selectedTask?.priority_id || 0)}
                                                color={
                                                    selectedTask?.priority?.name === 'Haute' ||
                                                    getPriorityName(selectedTask?.priority_id || 0) === 'Haute'
                                                        ? 'error'
                                                        : 'success'
                                                }
                                                size="small"
                                                sx={{ fontWeight: 'medium' }}
                                            />
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Projet
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {selectedTask?.project?.title || getProjectName(selectedTask?.project_id || 0)}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Date de début
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {formatDate(selectedTask?.start_date || '')}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Date d'échéance
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                                color={
                                                    new Date(selectedTask?.end_date || getCurrentDate()) < new Date() ? 'error.main' : 'text.primary'
                                                }
                                            >
                                                {formatDate(selectedTask?.end_date || '')}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Assigné à
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {/* Pour l'avatar dans la section des détails de la tâche */}
                                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#16A249' }}>
                                                    {selectedTask?.assigned_user?.name
                                                        ? selectedTask.assigned_user.name.charAt(0).toUpperCase()
                                                        : getUserName(selectedTask?.assigned_to || 0)
                                                              .charAt(0)
                                                              .toUpperCase()}
                                                </Avatar>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {selectedTask?.assigned_user?.name || getUserName(selectedTask?.assigned_to || 0)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Créé le
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {selectedTask?.created_at
                                                        ? new Date(selectedTask.created_at).toLocaleDateString()
                                                        : 'Date inconnue'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>

                                {/* Progression */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(to right bottom, #ffffff, #f9fdfb)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold" color="#16A249">
                                            Progression de la tâche
                                        </Typography>
                                        <Typography variant="h5" fontWeight="bold" color="#16A249">
                                            {selectedTask?.progress || 0}%
                                        </Typography>
                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedTask?.progress || 0}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            mb: 2,
                                            backgroundColor: 'rgba(22, 162, 73, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                backgroundColor: '#16A249',
                                            },
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Temps écoulé
                                            </Typography>
                                            <Typography variant="body1" fontWeight="medium">
                                                {(() => {
                                                    const start = new Date(selectedTask?.start_date || getCurrentDate());
                                                    const today = new Date();
                                                    const diffTime = Math.abs(today.getTime() - start.getTime());
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return `${diffDays} jours`;
                                                })()}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Temps restant
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                                color={
                                                    new Date(selectedTask?.end_date || getCurrentDate()) < new Date() ? 'error.main' : 'text.primary'
                                                }
                                            >
                                                {(() => {
                                                    const end = new Date(selectedTask?.end_date || getCurrentDate());
                                                    const today = new Date();
                                                    const diffTime = end.getTime() - today.getTime();
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return diffDays < 0 ? `Dépassé de ${Math.abs(diffDays)} jours` : `${diffDays} jours`;
                                                })()}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>

                            {/* Sous-tâches */}
                            <Box sx={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        background: 'linear-gradient(to right bottom, #ffffff, #f9fdfb)',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#16A249' }}>
                                        Sous-tâches
                                    </Typography>

                                    {/* Formulaire de création de sous-tâche */}
                                    {/* Bouton d'ajout de sous-tâche */}
                                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddSubtaskDialogOpen}
                                            sx={{
                                                bgcolor: '#16A249',
                                                border: '1px solid #16A249',
                                                textTransform: 'none',
                                                borderRadius: 1,
                                                '&:hover': {
                                                    bgcolor: '#138a3c',
                                                    borderColor: '#138a3c',
                                                },
                                            }}
                                        >
                                            Ajouter une sous-tâche
                                        </Button>
                                    </Box>

                                    {/* Dialogue d'ajout de sous-tâche */}
                                    <Dialog open={openAddSubtaskDialog} onClose={handleAddSubtaskDialogClose} fullWidth maxWidth="sm">
                                        <DialogTitle>Ajouter une sous-tâche</DialogTitle>
                                        <DialogContent>
                                            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                <TextField
                                                    label="Titre de la sous-tâche"
                                                    fullWidth
                                                    variant="outlined"
                                                    name="title"
                                                    value={newSubtaskData.title}
                                                    onChange={handleNewSubtaskInputChange}
                                                    error={newSubtaskErrors.title}
                                                    helperText={newSubtaskErrors.title ? 'Le titre est requis' : ''}
                                                    margin="normal"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&:hover fieldset': {
                                                                borderColor: 'darkgreen',
                                                            },
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#16A249',
                                                            },
                                                        },
                                                    }}
                                                />
                                                <Box>
                                                    <Typography variant="body2" gutterBottom>
                                                        Progression: {newSubtaskData.progress}%
                                                    </Typography>
                                                    <Slider
                                                        value={newSubtaskData.progress}
                                                        onChange={handleProgressChange}
                                                        aria-labelledby="progress-slider"
                                                        valueLabelDisplay="auto"
                                                        step={5}
                                                        marks
                                                        min={0}
                                                        max={100}
                                                        sx={{
                                                            color: '#16A249',
                                                            '& .MuiSlider-thumb': {
                                                                '&:hover, &.Mui-focusVisible': {
                                                                    boxShadow: '0px 0px 0px 8px rgba(22, 162, 73, 0.16)',
                                                                },
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button
                                                onClick={handleAddSubtaskDialogClose}
                                                color="error"
                                                variant="outlined"
                                                sx={{
                                                    textTransform: 'none',
                                                    borderColor: 'error.main',
                                                    '&:hover': {
                                                        backgroundColor: 'error.main',
                                                        color: 'white',
                                                        borderColor: 'error.main',
                                                    },
                                                }}
                                            >
                                                Annuler
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleCreateSubtask();
                                                    if (!newSubtaskErrors.title && newSubtaskData.title.trim() !== '') {
                                                        handleAddSubtaskDialogClose();
                                                    }
                                                }}
                                                variant="contained"
                                                color="success"
                                                sx={{
                                                    bgcolor: '#16A249',
                                                    border: '1px solid #16A249',
                                                    textTransform: 'none',
                                                    borderRadius: 1,
                                                    px: 2,
                                                    '&:hover': {
                                                        bgcolor: '#138a3c',
                                                        borderColor: '#138a3c',
                                                    },
                                                }}
                                                disabled={loading}
                                            >
                                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Ajouter'}
                                            </Button>
                                        </DialogActions>
                                    </Dialog>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Liste des sous-tâches */}
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Liste des sous-tâches
                                    </Typography>

                                    {loadingSubtasks ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                            <CircularProgress size={24} color="success" />
                                        </Box>
                                    ) : subtasks.length > 0 ? (
                                        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                                            <List>
                                                {subtasks.map((subtask) => (
                                                    <Paper
                                                        key={subtask.id}
                                                        elevation={1}
                                                        sx={{ mb: 2, p: 2, borderRadius: 1, borderLeft: '3px solid #16A249' }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="subtitle1" fontWeight="medium">
                                                                {subtask.title}
                                                            </Typography>
                                                            <Box>
                                                                <IconButton size="small" onClick={() => handleEditSubtaskDialogOpen(subtask)}>
                                                                    <EditIcon fontSize="small" sx={{ color: '#16A249' }} />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteSubtaskDialogOpen(subtask.id)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => handleCompleteSubtask(subtask.id)}
                                                                    disabled={subtask.status_id === 3}
                                                                >
                                                                    <CheckCircle fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Chip
                                                                label={subtask.status?.name || getStatusName(subtask.status_id)}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getStatusColor(
                                                                        subtask.status?.name || getStatusName(subtask.status_id),
                                                                    ).bg,
                                                                    color: getStatusColor(subtask.status?.name || getStatusName(subtask.status_id))
                                                                        .color,
                                                                }}
                                                            />
                                                        </Box>
                                                        <Box sx={{ mt: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={subtask.progress}
                                                                sx={{
                                                                    height: 8,
                                                                    borderRadius: 5,
                                                                    backgroundColor: 'rgba(22, 162, 73, 0.1)',
                                                                    '& .MuiLinearProgress-bar': {
                                                                        backgroundColor: '#16A249',
                                                                    },
                                                                }}
                                                            />
                                                            <Typography variant="caption" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                {subtask.progress}%
                                                            </Typography>
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </List>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Aucune sous-tâche trouvée
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Box>
                        </Box>


                    </>
                ) : (
                    // Vue liste des tâches
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link underline="hover" color="inherit" href="/">
                                    Tableau de bord
                                </Link>
                                <Typography color="text.primary">Tâches</Typography>
                            </Breadcrumbs>
                        </Box>

                        {/* En-tête de la page */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h4" component="h1" fontWeight="bold">
                                    Tâches
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Gérez toutes vos tâches
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    placeholder="Rechercher..."
                                    size="small"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        width: 250,
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'darkgreen',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#16A249',
                                            },
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => setShowFilters(!showFilters)}
                                    sx={{
                                        textTransform: 'uppercase',
                                        minWidth: '120px',
                                        height: '40px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        px: 2,
                                        bgcolor: showFilters ? '#16A249' : '#f5f5f5',
                                        color: showFilters ? 'white' : 'black',
                                        '&:hover': {
                                            bgcolor: showFilters ? '#138a3c' : '#e0e0e0',
                                        },
                                    }}
                                    endIcon={
                                        <ArrowBackIcon
                                            sx={{ transform: showFilters ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }}
                                        />
                                    }
                                >
                                    Filtres
                                </Button>
                                {currentUser && 
                                  (currentUser.role === 'admin' || currentUser.role === 'manager') && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AddIcon />}
                                    onClick={handleClickOpen}
                                    sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                >
                                    Nouvelle tâche
                                </Button>
                                  )}
                            </Box>
                        </Box>

                        {/* Panneau de filtres */}
                        <Collapse in={showFilters}>
                            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        Filtres
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        <FormControl sx={{ minWidth: 200, flex: 1 }} color="success">
                                            <InputLabel id="statuts-label">Statuts</InputLabel>
                                            <Select
                                                labelId="statuts-label"
                                                value={statusFilter}
                                                onChange={handleStatusFilterChange as any}
                                                label="Statuts"
                                                fullWidth
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#138a3c',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#16A249',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Tous les statuts">Tous les statuts</MenuItem>
                                                {statuses.map((status) => (
                                                    <MenuItem key={status.id} value={status.name}>
                                                        {status.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl sx={{ minWidth: 200, flex: 1 }} color="success">
                                            <InputLabel id="priority-filter-label">Priorités</InputLabel>
                                            <Select
                                                labelId="priority-filter-label"
                                                value={priorityFilter}
                                                onChange={handlePriorityFilterChange as any}
                                                label="Priorités"
                                                fullWidth
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#138a3c',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#16A249',
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Toutes les priorités">Toutes les priorités</MenuItem>
                                                {priorities.map((priority) => (
                                                    <MenuItem key={priority.id} value={priority.name}>
                                                        {priority.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                        <TextField
                                            label="Date de début (à partir de)"
                                            type="date"
                                            value={startDateFilter}
                                            onChange={handleStartDateFilterChange}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ flex: 1, minWidth: 200 }}
                                            color="success"
                                        />

                                        <TextField
                                            label="Date de fin (jusqu'à)"
                                            type="date"
                                            value={endDateFilter}
                                            onChange={handleEndDateFilterChange}
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ flex: 1, minWidth: 200 }}
                                            color="success"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                                        <Button
                                            variant="outlined"
                                            color="inherit"
                                            onClick={() => {
                                                setStatusFilter('Tous les statuts');
                                                setPriorityFilter('Toutes les priorités');
                                                setStartDateFilter('');
                                                setEndDateFilter('');
                                                setSearchQuery('');
                                            }}
                                            sx={{ textTransform: 'none' }}
                                        >
                                            Réinitialiser les filtres
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => setShowFilters(false)}
                                            sx={{ textTransform: 'none', bgcolor: '#16A249' }}
                                        >
                                            Appliquer
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Collapse>

                        {/* Statistiques des tâches */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                            {taskStats.map((stat, index) => (
                                <Paper
                                    key={index}
                                    elevation={1}
                                    sx={{
                                        p: 3,
                                        borderRadius: 2,
                                        flex: 1,
                                        minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(25% - 16px)' },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        background: 'linear-gradient(to right bottom, #ffffff, #f9fdfb)',
                                        border: '1px solid rgba(0,0,0,0.08)',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                            color: '#16A249',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: stat.bgColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 1,
                                            }}
                                        >
                                            {stat.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                                        {stat.count}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        sur {tasks.length} tâches au total
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>

                        {/* Tableau des tâches */}
                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Tâche</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Projet</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Priorité</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Progression</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Échéance</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Assigné à</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTasks.length > 0 ? (
                                        filteredTasks.map((task) => (
                                            <TableRow key={task.id} hover>
                                                <TableCell>
                                                    <Typography
                                                        fontWeight="bold"
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': { textDecoration: 'underline' },
                                                        }}
                                                        onClick={() => handleTaskDetailsOpen(task.id)}
                                                    >
                                                        {task.title}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{task.project?.title || getProjectName(task.project_id)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.priority?.name || getPriorityName(task.priority_id)}
                                                        color={
                                                            task.priority?.name === 'Haute' || getPriorityName(task.priority_id) === 'Haute'
                                                                ? 'error'
                                                                : 'success'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={task.status?.name || getStatusName(task.status_id)}
                                                        color={
                                                            task.status?.name === 'En cours' || getStatusName(task.status_id) === 'En cours'
                                                                ? 'success'
                                                                : task.status?.name === 'À faire' || getStatusName(task.status_id) === 'À faire'
                                                                  ? 'warning'
                                                                  : 'default'
                                                        }
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={task.progress || 0}
                                                            sx={{
                                                                width: '100%',
                                                                height: 8,
                                                                borderRadius: 5,
                                                                backgroundColor: '#e0f2f1',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: '#16A249',
                                                                },
                                                                mr: 1,
                                                            }}
                                                        />
                                                        <Typography variant="body2">{task.progress || 0}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{formatDate(task.end_date)}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {/* Pour l'avatar dans le tableau des tâches */}
                                                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: '#16A249' }}>
                                                            {task.assigned_user?.name
                                                                ? task.assigned_user.name.charAt(0).toUpperCase()
                                                                : getUserName(task.assigned_to).charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Typography variant="body2">
                                                            {task.assigned_user?.name || getUserName(task.assigned_to)}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={(e) => handleTaskActionMenuOpen(e, task.id)}>
                                                        <MoreVert />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} align="center">
                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                    Aucune tâche trouvée
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Container>

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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'darkgreen',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#16A249',
                                    },
                                },
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'darkgreen',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#16A249',
                                    },
                                },
                            }}
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
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionner un projet</em>
                                </MenuItem>
                                {projects &&
                                    projects.length > 0 &&
                                    projects.map((project) => (
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

                        {/* <FormControl fullWidth error={newTaskErrors.status_id}>
                            <InputLabel id="status-label">Statut</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status_id"
                                value={newTaskData.status_id || ''}
                                label="Statut"
                                onChange={handleNewTaskStatusChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                {statuses &&
                                    statuses.length > 0 &&
                                    statuses.map((status) => (
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
                        </FormControl> */}
                        <FormControl fullWidth error={newTaskErrors.priority_id}>
                            <InputLabel id="priority-label">Priorité</InputLabel>
                            <Select
                                labelId="priority-label"
                                id="priority_id"
                                value={newTaskData.priority_id || ''}
                                label="Priorité"
                                onChange={handleNewTaskPriorityChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                {priorities &&
                                    priorities.length > 0 &&
                                    priorities.map((priority) => (
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
                                id="assigned_to"
                                value={newTaskData.assigned_to || ''}
                                label="Assigné à"
                                onChange={handleNewTaskUserChange as any}
                                required
                                disabled={!newTaskData.project_id} // <--- Ajoute ceci
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionner un utilisateur</em>
                                </MenuItem>
                                {newTaskData.project_id && projectMembers && projectMembers.length > 0
                                    ? projectMembers.map((user) => (
                                          <MenuItem key={user.id} value={user.id}>
                                              {user.name}
                                          </MenuItem>
                                      ))
                                    : null}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'darkgreen',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#16A249',
                                            },
                                        },
                                    }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'darkgreen',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#16A249',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleClose}
                        sx={{
                            textTransform: 'none',
                            borderColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                borderColor: 'error.main',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleCreateNewTask}
                        endIcon={<SendIcon />}
                        sx={{
                            bgcolor: '#16A249',
                            border: '1px solid #16A249',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 3,
                            '&:hover': {
                                bgcolor: '#138a3c',
                                borderColor: '#138a3c',
                            },
                        }}
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
                    {/* Contenu du formulaire d'édition */}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'darkgreen',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#16A249',
                                    },
                                },
                            }}
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
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'darkgreen',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#16A249',
                                    },
                                },
                            }}
                        />
                        <FormControl fullWidth error={editTaskErrors.project_id}>
                            <InputLabel id="project-label">Projet</InputLabel>
                            <Select
                                labelId="project-label"
                                id="project_id"
                                value={editTaskData.project_id || ''}
                                label="Projet"
                                onChange={handleEditTaskProjectChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionner un projet</em>
                                </MenuItem>
                                {projects &&
                                    projects.length > 0 &&
                                    projects.map((project) => (
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
                        {/* <FormControl fullWidth error={editTaskErrors.status_id}>
                            <InputLabel id="status-label">Statut</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status_id"
                                value={editTaskData.status_id || ''}
                                label="Statut"
                                onChange={handleEditTaskStatusChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                {statuses &&
                                    statuses.length > 0 &&
                                    statuses.map((status) => (
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
                        </FormControl> */}
                        <FormControl fullWidth error={editTaskErrors.priority_id}>
                            <InputLabel id="priority-label">Priorité</InputLabel>
                            <Select
                                labelId="priority-label"
                                id="priority_id"
                                value={editTaskData.priority_id || ''}
                                label="Priorité"
                                onChange={handleEditTaskPriorityChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                {priorities &&
                                    priorities.length > 0 &&
                                    priorities.map((priority) => (
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
                            <InputLabel id="user-label">Assigné à</InputLabel>
                            <Select
                                labelId="user-label"
                                id="assigned_to"
                                value={editTaskData.assigned_to || ''}
                                label="Assigné à"
                                onChange={handleEditTaskUserChange as any}
                                required
                                sx={{
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#138a3c',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#16A249',
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionner un utilisateur</em>
                                </MenuItem>
                                {editTaskData.project_id && projectMembers && projectMembers.length > 0 &&
                                // ?
                                     projectMembers.map((user) => (
                                          <MenuItem key={user.id} value={user.id}>
                                              {user.name}
                                          </MenuItem>
                                      ))
                                    // : users &&
                                    //   users.length > 0 &&
                                    //   users.map((user) => (
                                    //       <MenuItem key={user.id} value={user.id}>
                                    //           {user.name}
                                    //       </MenuItem>
                                    //   ))
                                }
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'darkgreen',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#16A249',
                                            },
                                        },
                                    }}
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
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: 'darkgreen',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#16A249',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={handleEditTaskDialogClose}
                        color="error"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                borderColor: 'error.main',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleUpdateTask}
                        variant="contained"
                        color="success"
                        sx={{
                            bgcolor: '#16A249',
                            border: '1px solid #16A249',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 3,
                            '&:hover': {
                                bgcolor: '#138a3c',
                                borderColor: '#138a3c',
                            },
                        }}
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
                    <Button
                        onClick={handleDeleteTaskDialogClose}
                        color="success"
                        variant="outlined"
                        sx={{
                            border: '1px solid #16A249',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 2,
                            '&:hover': {
                                color: 'white',
                                bgcolor: '#138a3c',
                                borderColor: '#138a3c',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteTask}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                            borderColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                borderColor: 'error.main',
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de modification de sous-tâche */}
            <Dialog open={openEditSubtaskDialog} onClose={handleEditSubtaskDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Modifier la sous-tâche</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Titre de la sous-tâche"
                            fullWidth
                            variant="outlined"
                            name="title"
                            value={editSubtaskData.title}
                            onChange={handleEditSubtaskInputChange}
                            error={editSubtaskErrors.title}
                            helperText={editSubtaskErrors.title ? 'Le titre est requis' : ''}
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&:hover fieldset': {
                                        borderColor: 'darkgreen',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#16A249',
                                    },
                                },
                            }}
                        />
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Progression: {editSubtaskData.progress}%
                            </Typography>
                            <Slider
                                value={editSubtaskData.progress}
                                onChange={handleEditProgressChange}
                                aria-labelledby="edit-progress-slider"
                                valueLabelDisplay="auto"
                                step={5}
                                marks
                                min={0}
                                max={100}
                                sx={{
                                    color: '#16A249',
                                    '& .MuiSlider-thumb': {
                                        '&:hover, &.Mui-focusVisible': {
                                            boxShadow: '0px 0px 0px 8px rgba(22, 162, 73, 0.16)',
                                        },
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleEditSubtaskDialogClose}
                        color="error"
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            borderColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                borderColor: 'error.main',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleUpdateSubtask}
                        variant="contained"
                        color="success"
                        sx={{
                            bgcolor: '#16A249',
                            border: '1px solid #16A249',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 2,
                            '&:hover': {
                                bgcolor: '#138a3c',
                                borderColor: '#138a3c',
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Mettre à jour'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialogue de suppression de sous-tâche */}
            <Dialog open={openDeleteSubtaskDialog} onClose={handleDeleteSubtaskDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Supprimer la sous-tâche</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Êtes-vous sûr de vouloir supprimer cette sous-tâche ? Cette action est irréversible.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleDeleteSubtaskDialogClose}
                        color="success"
                        variant="outlined"
                        sx={{
                            border: '1px solid #16A249',
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 2,
                            '&:hover': {
                                color: 'white',
                                bgcolor: '#138a3c',
                                borderColor: '#138a3c',
                            },
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteSubtask}
                        variant="contained"
                        color="error"
                        sx={{
                            textTransform: 'none',
                            borderColor: 'error.main',
                            '&:hover': {
                                backgroundColor: 'error.main',
                                color: 'white',
                                borderColor: 'error.main',
                            },
                        }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                <MenuItem onClick={() => handleTaskDetailsOpen(selectedTaskId || 0)}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" sx={{ color: '#16A249' }} />
                    </ListItemIcon>
                    <ListItemText primary="Détails" />
                </MenuItem>
                {currentUser && 
                   (currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <MenuItem onClick={() => handleEditTaskDialogOpen(selectedTaskId || 0)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" sx={{ color: '#16A249' }} />
                    </ListItemIcon>
                    <ListItemText primary="Modifier" />
                </MenuItem>
                   )}
                {currentUser && 
                   (currentUser.role === 'admin' || currentUser.role === 'manager') && (
                <MenuItem onClick={() => handleDeleteTaskDialogOpen(selectedTaskId || 0)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                </MenuItem>
                  )}
            </Menu>
        </AppLayout>
    );
};

export default Task;