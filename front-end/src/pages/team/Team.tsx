'use client';

import {
    Add,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MailOutline,
    MoreVert,
    Person,
    RemoveCircleOutline as RemoveCircleOutlineIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import {
    Alert,
    Autocomplete,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    Link,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
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
    Tooltip,
    Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { getCurrentUser } from '../login/api';
import { projectApi, teamApi, userApi } from './apiteam';

// Définir des interfaces pour les objets utilisés
interface TeamMember {
    id: number;
    name: string;
    email: string;
    number?: string; // Numéro d'employé (téléphone)
    status?: string;
    projects?: string[];
    isManager?: boolean;
}

interface TeamManager {
    id: number;
    name: string;
    email: string;
}

interface TeamProject {
    id: number;
    title: string;
    description?: string;
}

interface Team {
    id: number;
    name: string;
    description: string;
    created_at: string;
    project?: TeamProject;
    manager?: TeamManager;
    members: TeamMember[];
}

interface UserOption {
    id: number;
    name: string;
    email: string;
}

interface ProjectOption {
    id: number;
    title: string;
    description?: string;
}

const Team: React.FC = () => {
    // État pour le menu d'actions des équipes
    const [teamActionMenuAnchorEl, setTeamActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const openTeamActionMenu = Boolean(teamActionMenuAnchorEl);

    // État pour le menu d'actions des membres
    const [memberActionMenuAnchorEl, setMemberActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const openMemberActionMenu = Boolean(memberActionMenuAnchorEl);

    // État pour le formulaire de nouvelle équipe
    const [openNewTeamDialog, setOpenNewTeamDialog] = useState(false);
    const [newTeamData, setNewTeamData] = useState({
        name: '',
        leader: '',
        leaderId: 0,
        description: '',
        projectId: 0,
    });
    const [newTeamErrors, setNewTeamErrors] = useState({
        name: false,
        leader: false,
        description: false,
        projectId: false,
    });

    // État pour la liste des utilisateurs (chefs d'équipe)
    const [allUsers, setAllUsers] = useState<UserOption[]>([]);
    const [selectedLeader, setSelectedLeader] = useState<UserOption | null>(null);

    // État pour les projets
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);

    // // État pour le formulaire d'ajout de membre
    // // const [newMemberData, setNewMemberData] = useState({
    // //     name: '',
    // //     project: '',
    // //     email: '',
    // // });
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // État pour la vue détaillée d'une équipe
    const [showTeamDetails, setShowTeamDetails] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [tabValue, setTabValue] = useState(0);

    // État pour la recherche
    const [searchTeamQuery, setSearchTeamQuery] = useState('');
    const [searchMemberQuery, setSearchMemberQuery] = useState('');

    // État pour les dialogues d'édition et de suppression d'équipe
    const [openEditTeamDialog, setOpenEditTeamDialog] = useState(false);
    const [openDeleteTeamDialog, setOpenDeleteTeamDialog] = useState(false);
    const [editTeamData, setEditTeamData] = useState({
        id: 0,
        name: '',
        leader: '',
        leaderId: 0,
        description: '',
        projectId: 0,
    });
    const [editTeamErrors, setEditTeamErrors] = useState({
        name: false,
        leader: false,
        description: false,
        projectId: false,
    });
    const [selectedEditLeader, setSelectedEditLeader] = useState<UserOption | null>(null);
    const [selectedEditProject, setSelectedEditProject] = useState<ProjectOption | null>(null);

    // État pour les notifications
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });

    // État pour l'indicateur de chargement
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // État pour l'ajout de plusieurs membres
    const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
    const [openBatchAddDialog, setOpenBatchAddDialog] = useState(false);

    // Données des équipes et utilisateurs (initialisées vides, à remplir depuis l'API)
    const [teams, setTeams] = useState<Team[]>([]);
    // Supprimer cette variable non utilisée ou l'utiliser
    // const [existingUsers, setExistingUsers] = useState<UserOption[]>([]);

    // Fonction pour charger les équipes depuis l'API
    const fetchTeams = async () => {
        try {
            setInitialLoading(true);
            console.log('Chargement des équipes...');
            const teamsData = await teamApi.getAllTeams();
            setTeams(teamsData);
            setInitialLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des équipes:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des équipes',
                severity: 'error',
            });
            setInitialLoading(false);
        }
    };

    // Fonction pour charger les utilisateurs depuis l'API
    const fetchUsers = async () => {
        try {
            console.log('Chargement des utilisateurs...');
            const usersData = await userApi.getAllUsers();
            console.log('Utilisateurs chargés:', usersData);
            // setExistingUsers(usersData); // Commenté car non utilisé
            setAllUsers(usersData); // Stocker également dans allUsers pour l'autocomplete
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des utilisateurs',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les projets depuis l'API
    const fetchProjects = async () => {
        try {
            console.log('Chargement des projets...');
            const projectsData = await projectApi.getAllProjects();
            console.log('Projets chargés:', projectsData);
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

    // Fonction pour charger les projets disponibles (non associés à une équipe)
    const fetchAvailableProjects = async () => {
        try {
            console.log('Chargement des projets disponibles...');
            const projectsData = await projectApi.getAvailableProjects();
            console.log('Projets disponibles chargés:', projectsData);
            setProjects(projectsData);
        } catch (error) {
            console.error('Erreur lors du chargement des projets disponibles:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des projets disponibles',
                severity: 'error',
            });
        }
    };

    // Fonction pour charger les projets disponibles pour l'édition (inclut le projet actuel)
    const fetchAvailableProjectsForEdit = async (currentProjectId?: number) => {
        try {
            console.log('Chargement des projets disponibles pour édition...');
            const availableProjects = await projectApi.getAvailableProjects();

            // Si l'équipe a déjà un projet, nous devons également charger ce projet
            if (currentProjectId) {
                try {
                    const currentProject = await projectApi.getProjectById(currentProjectId);
                    // Vérifier si le projet actuel n'est pas déjà dans la liste
                    const projectExists = availableProjects.some((p: { id: number }) => p.id === currentProjectId);

                    if (!projectExists && currentProject) {
                        // Ajouter le projet actuel à la liste des projets disponibles
                        setProjects([currentProject, ...availableProjects]);
                        return;
                    }
                } catch (error) {
                    console.error(`Erreur lors du chargement du projet actuel (ID: ${currentProjectId}):`, error);
                    // Continuer avec les projets disponibles même si nous ne pouvons pas charger le projet actuel
                }
            }

            setProjects(availableProjects);
        } catch (error) {
            console.error('Erreur lors du chargement des projets disponibles:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des projets disponibles',
                severity: 'error',
            });
        }
    };

    const canAddMembers = () => {
        if (!selectedTeam || !currentUser) return false;
        return currentUser.role === 'admin' || selectedTeam.manager?.id === currentUser.id;
    };

    const canDeletMembers = () => {
        if (!selectedTeam || !currentUser) return false;
        return currentUser.role === 'admin' || selectedTeam.manager?.id === currentUser.id;
    };

    // Charger les équipes au chargement du composant
    useEffect(() => {
        fetchTeams();
        fetchUsers();
        fetchProjects();
        // Ajout : navigation directe vers une équipe si selectedTeamId est présent dans sessionStorage
        const storedTeamId = sessionStorage.getItem('selectedTeamId');
        if (storedTeamId) {
            sessionStorage.removeItem('selectedTeamId');
            handleViewTeamDetails(Number(storedTeamId));
        }
    }, []);

    // Filtrage des équipes par recherche
    const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTeamQuery.toLowerCase()));

    // Fonction pour obtenir tous les membres, y compris le chef d'équipe
    const getAllTeamMembers = (teamData: Team | null = selectedTeam) => {
        if (!teamData) return [];

        // S'assurer que members est un tableau (protection contre undefined)
        const members = teamData.members || [];

        // Créer une copie du tableau des membres
        const allMembers = [...members];

        // Vérifier si le manager existe
        if (teamData.manager) {
            // Trouver si le manager est déjà dans la liste des membres
            const managerIndex = allMembers.findIndex((member) => member.id === teamData.manager?.id);

            if (managerIndex >= 0) {
                // Le manager est déjà dans la liste - mettre à jour son statut
                allMembers[managerIndex] = {
                    ...allMembers[managerIndex],
                    isManager: true,
                };
            } else {
                // Le manager n'est pas dans la liste - l'ajouter au début
                allMembers.unshift({
                    ...teamData.manager,
                    isManager: true,
                });
            }
        }

        return allMembers;
    };

    // Filtrage des membres par recherche
    const filteredMembers =
        getAllTeamMembers().filter((member: TeamMember) => member.name.toLowerCase().includes(searchMemberQuery.toLowerCase())) || [];

    // Fonction pour filtrer les utilisateurs qui ne sont pas déjà membres de l'équipe et qui ne sont pas le manager
    const getAvailableUsers = () => {
        if (!selectedTeam) {
            return allUsers;
        }

        // Obtenir les IDs des membres déjà dans l'équipe
        const existingMemberIds = selectedTeam.members?.map((member: TeamMember) => member.id) || [];

        // Obtenir l'ID du manager
        const managerId = selectedTeam.manager?.id;

        // Retourner uniquement les utilisateurs qui ne sont pas déjà membres ET qui ne sont pas le manager
        return allUsers.filter((user) => !existingMemberIds.includes(user.id) && user.id !== managerId);
    };

    // Filtrage des utilisateurs existants par recherche
    const filteredUsers = getAvailableUsers().filter(
        (user) =>
            user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()),
    );

    // Liste des projets disponibles pour l'ajout de membre
    // const availableProjects = selectedTeam?.project ? [selectedTeam.project.title] : [];

    // Fermer le menu d'actions des équipes lorsqu'on navigue vers les détails d'une équipe
    useEffect(() => {
        if (showTeamDetails) {
            handleTeamActionMenuClose();
        }
    }, [showTeamDetails]);

    const handleTeamActionMenuOpen = (event: React.MouseEvent<HTMLElement>, teamId: number) => {
        event.stopPropagation(); // Empêcher la propagation pour éviter de déclencher handleViewTeamDetails
        setTeamActionMenuAnchorEl(event.currentTarget);
        setSelectedTeamId(teamId);
    };

    const handleTeamActionMenuClose = () => {
        setTeamActionMenuAnchorEl(null);
        // Ne pas effacer selectedTeamId ici, car nous en avons besoin pour la suppression
        // setSelectedTeamId(null)
    };

    const handleMemberActionMenuOpen = (event: React.MouseEvent<HTMLElement>, memberId: number) => {
        setMemberActionMenuAnchorEl(event.currentTarget);
        setSelectedMemberId(memberId);
    };

    const handleMemberActionMenuClose = () => {
        setMemberActionMenuAnchorEl(null);
        setSelectedMemberId(null);
    };

    const handleNewTeamDialogOpen = () => {
        setOpenNewTeamDialog(true);
        setNewTeamData({
            name: '',
            leader: '',
            leaderId: 0,
            description: '',
            projectId: 0,
        });
        setNewTeamErrors({
            name: false,
            leader: false,
            description: false,
            projectId: false,
        });
        setSelectedLeader(null);
        setSelectedProject(null);

        // Charger les utilisateurs si ce n'est pas déjà fait
        if (allUsers.length === 0) {
            fetchUsers();
        }

        // Charger les projets disponibles pour la création d'équipe
        fetchAvailableProjects();
    };

    const handleNewTeamDialogClose = () => {
        setOpenNewTeamDialog(false);
        setNewTeamData({
            name: '',
            leader: '',
            leaderId: 0,
            description: '',
            projectId: 0,
        });
        setNewTeamErrors({
            name: false,
            leader: false,
            description: false,
            projectId: false,
        });
        setSelectedLeader(null);
        setSelectedProject(null);
    };

    const handleNewTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewTeamData({
            ...newTeamData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (newTeamErrors[name as keyof typeof newTeamErrors]) {
            setNewTeamErrors({
                ...newTeamErrors,
                [name]: false,
            });
        }
    };

    const handleLeaderChange = (_: React.SyntheticEvent, value: UserOption | null) => {
        setSelectedLeader(value);
        if (value) {
            setNewTeamData({
                ...newTeamData,
                leader: value.name,
                leaderId: value.id,
            });
            // Réinitialiser l'erreur si un chef d'équipe est sélectionné
            if (newTeamErrors.leader) {
                setNewTeamErrors({
                    ...newTeamErrors,
                    leader: false,
                });
            }
        } else {
            setNewTeamData({
                ...newTeamData,
                leader: '',
                leaderId: 0,
            });
        }
    };

    const handleProjectChange = (_: React.SyntheticEvent, value: ProjectOption | null) => {
        setSelectedProject(value);
        if (value) {
            setNewTeamData({
                ...newTeamData,
                projectId: value.id,
            });
            // Réinitialiser l'erreur si un projet est sélectionné
            if (newTeamErrors.projectId) {
                setNewTeamErrors({
                    ...newTeamErrors,
                    projectId: false,
                });
            }
        } else {
            setNewTeamData({
                ...newTeamData,
                projectId: 0,
            });
        }
    };

    const handleEditLeaderChange = (_: React.SyntheticEvent, value: UserOption | null) => {
        setSelectedEditLeader(value);
        if (value) {
            setEditTeamData({
                ...editTeamData,
                leader: value.name,
                leaderId: value.id,
            });
            // Réinitialiser l'erreur si un chef d'équipe est sélectionné
            if (editTeamErrors.leader) {
                setEditTeamErrors({
                    ...editTeamErrors,
                    leader: false,
                });
            }
        } else {
            setEditTeamData({
                ...editTeamData,
                leader: '',
                leaderId: 0,
            });
        }
    };

    const handleEditProjectChange = (_: React.SyntheticEvent, value: ProjectOption | null) => {
        setSelectedEditProject(value);
        if (value) {
            setEditTeamData({
                ...editTeamData,
                projectId: value.id,
            });
            // Réinitialiser l'erreur si un projet est sélectionné
            if (editTeamErrors.projectId) {
                setEditTeamErrors({
                    ...editTeamErrors,
                    projectId: false,
                });
            }
        } else {
            setEditTeamData({
                ...editTeamData,
                projectId: 0,
            });
        }
    };

    // const handleNewMemberSelectChange = (e: SelectChangeEvent) => {
    //     const { name, value } = e.target;
    //     setNewMemberData({
    //         ...newMemberData,
    //         [name]: value,
    //     });
    // };

    const handleSelectMultipleUsers = (user: UserOption) => {
        const isAlreadySelected = selectedUsers.some((selected) => selected.id === user.id);
        const isExistingMember = selectedTeam?.members.some((member: TeamMember) => member.id === user.id);
        const isManager = selectedTeam?.manager?.id === user.id;

        if (isExistingMember || isManager) {
            // L'utilisateur est déjà membre de l'équipe ou est le manager
            setSnackbar({
                open: true,
                message: isManager ? `${user.name} est déjà le chef d'équipe` : `${user.name} est déjà membre de l'équipe`,
                severity: 'warning',
            });
            return;
        }

        if (isAlreadySelected) {
            setSelectedUsers(selectedUsers.filter((selected) => selected.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSelectAllUsers = () => {
        const allSelected = filteredUsers.every((user) => selectedUsers.some((selected) => selected.id === user.id));

        if (allSelected) {
            // Désélectionner tous les utilisateurs filtrés
            setSelectedUsers((prev) => prev.filter((selected) => !filteredUsers.some((user) => user.id === selected.id)));
        } else {
            // Sélectionner tous les utilisateurs filtrés
            const newSelectedUsers = [...selectedUsers];

            filteredUsers.forEach((user) => {
                if (!newSelectedUsers.some((selected) => selected.id === user.id)) {
                    newSelectedUsers.push(user);
                }
            });

            setSelectedUsers(newSelectedUsers);
        }
    };

    const handleBatchAddDialogOpen = async () => {
        setOpenBatchAddDialog(true);
        setSelectedUsers([]);
        setMemberSearchQuery('');

        try {
            setLoading(true);

            // Toujours recharger la liste complète des utilisateurs
            await fetchUsers();

            // Le reste du code peut rester tel quel car nous ne modifions pas existingUsers
        } catch (error) {
            console.error("Erreur lors de la préparation de l'ajout de membres:", error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des utilisateurs disponibles',
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBatchAddDialogClose = () => {
        setOpenBatchAddDialog(false);
        setSelectedUsers([]);
        setMemberSearchQuery('');
    };

    const handleAddBatchMembers = async () => {
        if (!selectedTeam || selectedUsers.length === 0) return;

        try {
            setLoading(true);
            const userIds = selectedUsers.map((user) => user.id);

            // Implémenter notre propre version de addMultipleMembers directement dans le composant
            const results = await Promise.all(
                userIds.map((userId) =>
                    teamApi
                        .addMember(selectedTeam.id, userId)
                        .then(() => ({ status: 'fulfilled', userId }))
                        .catch((error) => ({ status: 'rejected', userId, error })),
                ),
            );

            const successful = results.filter((result) => result.status === 'fulfilled').length;
            const failed = results.length - successful;

            if (failed > 0) {
                setSnackbar({
                    open: true,
                    message: `${successful} membre(s) ajouté(s) avec succès, ${failed} échec(s)`,
                    severity: 'warning',
                });
            } else {
                setSnackbar({
                    open: true,
                    message: `${successful} membre(s) ajouté(s) avec succès`,
                    severity: 'success',
                });
            }

            handleBatchAddDialogClose();
            // Recharger les détails de l'équipe
            await handleViewTeamDetails(selectedTeam.id);
            // Recharger la liste complète des utilisateurs pour mettre à jour les disponibles
            await fetchUsers();
        } catch (error) {
            console.error("Erreur lors de l'ajout des membres:", error);
            setSnackbar({
                open: true,
                message: "Erreur lors de l'ajout des membres",
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNewTeam = async () => {
        // Validation des champs
        const nameEmpty = newTeamData.name.trim() === '';
        const leaderEmpty = newTeamData.leaderId === 0;
        const descriptionEmpty = newTeamData.description.trim() === '';
        const projectEmpty = newTeamData.projectId === 0;

        setNewTeamErrors({
            name: nameEmpty,
            leader: leaderEmpty,
            description: descriptionEmpty,
            projectId: projectEmpty,
        });

        // Si tous les champs sont remplis, procéder à la création
        if (!nameEmpty && !leaderEmpty && !descriptionEmpty && !projectEmpty) {
            try {
                setLoading(true);
                await teamApi.createTeam({
                    name: newTeamData.name,
                    leaderId: newTeamData.leaderId,
                    description: newTeamData.description,
                    projectId: newTeamData.projectId,
                });
                setSnackbar({
                    open: true,
                    message: 'Équipe créée avec succès',
                    severity: 'success',
                });
                handleNewTeamDialogClose();
                // Recharger la liste des équipes
                fetchTeams();
            } catch (error) {
                console.error("Erreur lors de la création de l'équipe:", error);
                setSnackbar({
                    open: true,
                    message: "Erreur lors de la création de l'équipe",
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleViewTeamDetails = async (teamId: number, event?: React.MouseEvent) => {
        // Si l'événement est fourni, empêcher la propagation
        if (event) {
            event.stopPropagation();
        }

        // Fermer le menu d'actions des équipes s'il est ouvert
        if (teamActionMenuAnchorEl) {
            handleTeamActionMenuClose();
        }

        try {
            setLoading(true);
            const teamDetails = await teamApi.getTeamById(teamId);
            setSelectedTeam(teamDetails);
            setShowTeamDetails(true);
            setSearchMemberQuery('');
        } catch (error) {
            console.error("Erreur lors du chargement des détails de l'équipe:", error);
            setSnackbar({
                open: true,
                message: "Erreur lors du chargement des détails de l'équipe",
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBackToTeamsList = () => {
        setShowTeamDetails(false);
        setSelectedTeam(null);
        setTabValue(0);
        setSearchTeamQuery('');
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!selectedTeam) return;

        // Vérifier si le membre est le manager
        if (selectedTeam.manager?.id === memberId) {
            setSnackbar({
                open: true,
                message: "Vous ne pouvez pas supprimer le chef d'équipe",
                severity: 'error',
            });
            handleMemberActionMenuClose();
            return;
        }

        try {
            setLoading(true);
            await teamApi.removeMember(selectedTeam.id, memberId);

            // Notification de succès
            setSnackbar({
                open: true,
                message: 'Membre supprimé avec succès',
                severity: 'success',
            });

            handleMemberActionMenuClose();

            // Recharger les détails de l'équipe
            await handleViewTeamDetails(selectedTeam.id);

            // Recharger la liste complète des utilisateurs pour mettre à jour les disponibles
            await fetchUsers();
        } catch (error) {
            console.error('Erreur lors de la suppression du membre:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression du membre',
                severity: 'error',
            });
            handleMemberActionMenuClose();
        } finally {
            setLoading(false);
        }
    };

    // Fonctions pour gérer l'édition d'une équipe
    const handleEditTeamDialogOpen = (teamId: number) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) {
            // Trouver le projet correspondant dans la liste des projets
            const projectObj = projects.find((p) => p.id === team.project?.id) || null;

            setEditTeamData({
                id: team.id,
                name: team.name,
                leader: team.manager?.name || '',
                leaderId: team.manager?.id || 0,
                description: team.description,
                projectId: team.project?.id || 0,
            });

            setEditTeamErrors({
                name: false,
                leader: false,
                description: false,
                projectId: false,
            });

            // Trouver l'utilisateur correspondant dans la liste complète des utilisateurs
            const leaderObj = allUsers.find((u) => u.id === team.manager?.id) || null;
            setSelectedEditLeader(leaderObj);

            setSelectedEditProject(
                projectObj
                    ? {
                          id: projectObj.id,
                          title: projectObj.title,
                      }
                    : null,
            );

            // Charger les utilisateurs si ce n'est pas déjà fait
            if (allUsers.length === 0) {
                fetchUsers();
            }

            // Charger les projets disponibles pour l'édition
            // Notez que nous incluons aussi le projet actuel de l'équipe
            fetchAvailableProjectsForEdit(team.project?.id);

            setOpenEditTeamDialog(true);
        }
        handleTeamActionMenuClose();
    };

    const handleEditTeamDialogClose = () => {
        setOpenEditTeamDialog(false);
        setEditTeamErrors({
            name: false,
            leader: false,
            description: false,
            projectId: false,
        });
        setSelectedEditLeader(null);
        setSelectedEditProject(null);
    };

    const handleEditTeamInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditTeamData({
            ...editTeamData,
            [name]: value,
        });

        // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
        if (editTeamErrors[name as keyof typeof editTeamErrors]) {
            setEditTeamErrors({
                ...editTeamErrors,
                [name]: false,
            });
        }
    };

    const handleUpdateTeam = async () => {
        // Validation des champs
        const nameEmpty = editTeamData.name.trim() === '';
        const leaderEmpty = editTeamData.leaderId === 0;
        const descriptionEmpty = editTeamData.description.trim() === '';
        const projectEmpty = editTeamData.projectId === 0;

        setEditTeamErrors({
            name: nameEmpty,
            leader: leaderEmpty,
            description: descriptionEmpty,
            projectId: projectEmpty,
        });

        // Si tous les champs sont remplis, procéder à la mise à jour
        if (!nameEmpty && !leaderEmpty && !descriptionEmpty && !projectEmpty) {
            try {
                setLoading(true);

                // Déterminer si le nouveau chef d'équipe était un membre régulier
                const currentMembers = selectedTeam?.members || [];
                const newLeaderWasMember = currentMembers.some((member) => member.id === editTeamData.leaderId);

                await teamApi.updateTeam(editTeamData.id, {
                    name: editTeamData.name,
                    leaderId: editTeamData.leaderId,
                    description: editTeamData.description,
                    projectId: editTeamData.projectId,
                });

                setSnackbar({
                    open: true,
                    message: 'Équipe mise à jour avec succès',
                    severity: 'success',
                });

                handleEditTeamDialogClose();

                // Recharger la liste des équipes
                await fetchTeams();

                // Si nous sommes dans la vue détaillée de l'équipe modifiée, recharger les détails
                if (showTeamDetails && selectedTeam?.id === editTeamData.id) {
                    // Force le rechargement complet pour s'assurer que les statuts de manager sont mis à jour
                    await handleViewTeamDetails(editTeamData.id);
                }

                // Si nous avons changé le chef d'équipe, afficher une notification spécifique
                if (newLeaderWasMember) {
                    setSnackbar({
                        open: true,
                        message: `${selectedEditLeader?.name} est maintenant le chef d'équipe`,
                        severity: 'info',
                    });
                }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'équipe:", error);
                setSnackbar({
                    open: true,
                    message: "Erreur lors de la mise à jour de l'équipe",
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        }
    };

    // Fonctions pour gérer la suppression d'une équipe
    const handleDeleteTeamDialogOpen = (teamId: number) => {
        setSelectedTeamId(teamId);
        setOpenDeleteTeamDialog(true);
        handleTeamActionMenuClose();
    };

    const handleDeleteTeamDialogClose = () => {
        console.log('Annuler la suppression');
        setOpenDeleteTeamDialog(false);
        // Effacer selectedTeamId seulement lorsque le dialogue est fermé
        setSelectedTeamId(null);
    };

    const handleDeleteTeam = async () => {
        // Stocker l'ID dans une variable locale pour s'assurer qu'il ne change pas
        const teamIdToDelete = selectedTeamId;

        if (!teamIdToDelete) return;

        try {
            setLoading(true);
            await teamApi.deleteTeam(teamIdToDelete);

            // Afficher le Snackbar de succès
            setSnackbar({
                open: true,
                message: 'Équipe supprimée avec succès',
                severity: 'success',
            });

            // Fermer le dialogue de confirmation
            handleDeleteTeamDialogClose();

            // Si nous sommes dans la vue détaillée de l'équipe supprimée, revenir à la liste
            if (showTeamDetails && selectedTeam?.id === teamIdToDelete) {
                handleBackToTeamsList();
            }

            // Recharger la liste des équipes
            await fetchTeams();
        } catch (error) {
            console.error("Erreur lors de la suppression de l'équipe:", error);

            // Afficher le Snackbar d'erreur
            setSnackbar({
                open: true,
                message: "Erreur lors de la suppression de l'équipe",
                severity: 'error',
            });

            // Fermer le dialogue de confirmation
            handleDeleteTeamDialogClose();
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour fermer la notification
    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };

    // État pour l'utilisateur connecté
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Référence pour l'intervalle de vérification d'authentification
    const authCheckIntervalRef = useRef<number | null>(null);

    // Fonction pour vérifier l'authentification
    const checkAuthentication = () => {
        const user = getCurrentUser();
        if (user) {
            setCurrentUser(user);
        } else {
            // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
            window.location.href = '/login';
        }
    };

    // Récupérer l'utilisateur connecté au chargement du composant
    useEffect(() => {
        checkAuthentication();

        // Configurer une vérification périodique de l'authentification (toutes les 5 minutes)
        // authCheckIntervalRef.current = setInterval(checkAuthentication, 5 * 60 * 1000);

        // Nettoyer l'intervalle lors du démontage du composant
        return () => {
            if (authCheckIntervalRef.current) {
                window.clearInterval(authCheckIntervalRef.current);
            }
        };
    }, []);

    // Fonction pour naviguer vers la page Projet et afficher le projet correspondant
    const handleViewProjectDetails = (projectId?: number) => {
        if (!projectId) return;
        // Stocker l'ID du projet dans le sessionStorage pour récupération côté Projet.tsx
        sessionStorage.setItem('selectedProjectId', String(projectId));
        // Naviguer vers la page Projet (SPA)
        window.location.href = '/2';
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

            {/* Notification - Corrigé pour s'assurer qu'il s'affiche correctement */}
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

            {/* Contenu de la page Équipe */}
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {showTeamDetails ? (
                    // Vue détaillée d'une équipe
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Breadcrumbs aria-label="breadcrumb">
                                <Typography
                                    color="inherit"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => handleBackToTeamsList()}
                                >
                                    Tableau de bord
                                </Typography>
                                <Typography
                                    color="inherit"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': { textDecoration: 'underline' },
                                    }}
                                    onClick={() => handleBackToTeamsList()}
                                >
                                    Équipe
                                </Typography>
                                <Typography color="inherit">Detals d'Équipe</Typography>
                            </Breadcrumbs>
                        </Box>

                        {/* En-tête avec bouton retour */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <IconButton onClick={handleBackToTeamsList} sx={{ mr: 1, p: 0 }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Typography variant="h4" sx={{ flex: 1, fontWeight: 'bold' }}>
                                {selectedTeam?.name}
                            </Typography>
                            <Box>
                                {canAddMembers() && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<Add />}
                                        onClick={handleBatchAddDialogOpen}
                                        sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                    >
                                        Ajouter membres
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* Badge et chef d'équipe */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Chip
                                icon={<Person />}
                                label={`Chef d'équipe: ${selectedTeam?.manager?.name}`}
                                variant="outlined"
                                sx={{ fontWeight: 'medium', bgcolor: 'rgba(255, 140, 0, 0.1)' }}
                            />
                        </Box>

                        {/* Informations de l'équipe - Nouveau design */}
                        <Card sx={{ mb: 4, borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body1">{selectedTeam?.description}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Date de création
                                        </Typography>
                                        <Typography variant="body1">{selectedTeam?.created_at}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Nombre de membres
                                        </Typography>
                                        <Typography variant="body1">{getAllTeamMembers().length} membres</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Onglets - Nouveau design */}
                        <Box sx={{ width: '100%', mb: 4 }}>
                            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="team tabs"
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
                                            color: '#16A249 !important',
                                            fontWeight: 'bold',
                                        },
                                        '& .MuiTabs-indicator': {
                                            backgroundColor: '#16A249', // green underline
                                        },
                                    }}
                                >
                                    <Tab label="Membres de l'équipe"/>
                                    <Tab label="Projets de l'équipe" />
                                </Tabs>

                                {/* Contenu de l'onglet Membres */}
                                <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
                                    {tabValue === 0 && (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Box>
                                                    <Typography variant="h6" component="h2" fontWeight="bold">
                                                        Membres de l'équipe
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Liste des membres de l'équipe {selectedTeam?.name}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <TextField
                                                        placeholder="Rechercher un membre..."
                                                        size="small"
                                                        value={searchMemberQuery}
                                                        color="success"
                                                        onChange={(e) => setSearchMemberQuery(e.target.value)}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <SearchIcon fontSize="small" />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        sx={{ width: 250 }}
                                                    />
                                                </Box>
                                            </Box>

                                            <TableContainer sx={{ borderRadius: 2, boxShadow: 1, mb: 4 }}>
                                                <Table>
                                                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                                        <TableRow>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Numéro</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                                                Actions
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {filteredMembers && filteredMembers.length > 0 ? (
                                                            filteredMembers.map((member: TeamMember) => (
                                                                <TableRow
                                                                    key={member.id}
                                                                    hover
                                                                    sx={
                                                                        member.isManager
                                                                            ? {
                                                                                  backgroundColor: 'rgba(255, 140, 0, 0.05)',
                                                                                  borderLeft: '4px solid #FF8C00',
                                                                              }
                                                                            : {}
                                                                    }
                                                                >
                                                                    <TableCell>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            <Avatar
                                                                                sx={{
                                                                                    width: 40,
                                                                                    height: 40,
                                                                                    mr: 2,
                                                                                    bgcolor: member.isManager ? '#FF8C00' : '#16A249',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            >
                                                                                {member.name
                                                                                    .split(' ')
                                                                                    .map((n: string) => n[0])
                                                                                    .join('')}
                                                                            </Avatar>
                                                                            <Box>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <Typography fontWeight="bold">{member.name}</Typography>
                                                                                    {member.isManager && (
                                                                                        <Chip
                                                                                            label="Chef d'équipe"
                                                                                            size="small"
                                                                                            color="warning"
                                                                                            variant="outlined"
                                                                                            sx={{ ml: 1, fontWeight: 'medium', fontSize: '0.7rem' }}
                                                                                        />
                                                                                    )}
                                                                                </Box>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {member.isManager ? "Responsable de l'équipe" : member.status}
                                                                                </Typography>
                                                                            </Box>
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Typography
                                                                            variant="body2"
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <MailOutline sx={{ fontSize: 16, mr: 1 }} />
                                                                            {member.email}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {member.number || ""}
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        {!member.isManager ? (
                                                                            canDeletMembers() ? (
                                                                                // Menu d'actions pour les membres réguliers (seulement pour admin/manager)
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={(e) => handleMemberActionMenuOpen(e, member.id)}
                                                                                >
                                                                                    <MoreVert />
                                                                                </IconButton>
                                                                            ) : null
                                                                        ) : (
                                                                            // Tooltip expliquant pourquoi on ne peut pas supprimer le chef d'équipe
                                                                            <Tooltip title="Le chef d'équipe ne peut pas être supprimé" arrow>
                                                                                <span>
                                                                                    <IconButton size="small" disabled>
                                                                                        <MoreVert />
                                                                                    </IconButton>
                                                                                </span>
                                                                            </Tooltip>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={4} align="center">
                                                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                                        Aucun membre trouvé
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </>
                                    )}
                                </Box>

                                {/* Contenu de l'onglet Projets */}
                                <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
                                    {tabValue === 1 && (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Box>
                                                    <Typography variant="h6" component="h2" fontWeight="bold">
                                                        Projets de l'équipe
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Liste des projets sur lesquels travaille l'équipe {selectedTeam?.name}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {selectedTeam?.project ? (
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        p: 3,
                                                        mb: 3,
                                                        borderRadius: 2,
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            boxShadow: 3,
                                                        },
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                        <Box>
                                                            <Typography variant="h6" fontWeight="bold">
                                                                {selectedTeam.project.title}
                                                            </Typography>
                                                        </Box>
                                                        <Button variant="outlined" size="small" sx={{ color: '#16A249', borderColor: '#16A249', '&:hover': { bgcolor: '#e8f5e9', borderColor: '#138a3c', color: '#138a3c' } }}
                                                        onClick={() => handleViewProjectDetails(selectedTeam?.project?.id)}>
                                                            Voir les détails
                                                        </Button>
                                                    </Box>
                                                </Paper>
                                            ) : (
                                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                                    <Typography variant="body1" color="text.secondary">
                                                        Aucun projet associé à cette équipe
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                    </>
                ) : (
                    // Vue liste des équipes
                    <>
                        <Box sx={{ mb: 2 }}>
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link underline="hover" color="inherit" href="/1">
                                    Tableau de bord
                                </Link>
                                <Typography color="text.primary">Équipe </Typography>
                            </Breadcrumbs>
                        </Box>
                        {/* En-tête de la page */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h4" component="h1" fontWeight="bold">
                                    Équipes
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Gérez vos équipes et leurs membres
                                </Typography>
                            </Box>
                            {currentUser && currentUser.role === 'admin' && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<Add />}
                                    onClick={handleNewTeamDialogOpen}
                                    sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                >
                                    Créer une équipe
                                </Button>
                            )}
                        </Box>

                        {/* Barre de recherche */}
                        <TextField
                            placeholder="Rechercher une équipe..."
                            size="small"
                            value={searchTeamQuery}
                            onChange={(e) => setSearchTeamQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3, width: 300 }}
                        />

                        {/* Liste des équipes */}
                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Membres</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Chef d'équipe</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Projet</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date de création</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTeams.length > 0 ? (
                                        filteredTeams.map((team) => (
                                            <TableRow key={team.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                mr: 2,
                                                                bgcolor: '#16A249',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={(e) => handleViewTeamDetails(team.id, e)}
                                                        >
                                                            {team.name
                                                                .split(' ')
                                                                .map((n: string) => n[0])
                                                                .join('')}
                                                        </Avatar>
                                                        <Typography
                                                            fontWeight="bold"
                                                            sx={{
                                                                cursor: 'pointer',
                                                                '&:hover': { textDecoration: 'underline' },
                                                            }}
                                                            onClick={(e) => handleViewTeamDetails(team.id, e)}
                                                        >
                                                            {team.name}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{getAllTeamMembers(team).length}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            sx={{
                                                                width: 24,
                                                                height: 24,
                                                                mr: 1,
                                                                bgcolor: '#FF8C00',
                                                                fontSize: '0.75rem',
                                                            }}
                                                        >
                                                            {team.manager && team.manager.name
                                                                ? team.manager.name
                                                                      .split(' ')
                                                                      .map((n: string) => n[0])
                                                                      .join('')
                                                                : ''}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2">{team.manager ? team.manager.name : ''}</Typography>
                                                            {team.members?.some((member) => member.id === team.manager?.id) && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    (également membre)
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    {team.project ? (
                                                        <Chip
                                                            label={team.project.title}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontWeight: 'medium' }}
                                                        />
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Aucun projet
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>{team.created_at}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small" onClick={(e) => handleTeamActionMenuOpen(e, team.id)}>
                                                        <MoreVert />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                                    Aucune équipe trouvée
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
            {/* Dialogue de création d'une nouvelle équipe */}
            <Dialog open={openNewTeamDialog} onClose={handleNewTeamDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Créer une nouvelle équipe</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Nom de l'équipe"
                        color="success"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTeamData.name}
                        onChange={handleNewTeamInputChange}
                        error={newTeamErrors.name}
                        helperText={newTeamErrors.name ? "Le nom de l'équipe est requis" : ''}
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
                        required
                    />
                    <Autocomplete
                        id="leader"
                        options={allUsers}
                        getOptionLabel={(option) => option.name}
                        value={selectedLeader}
                        onChange={handleLeaderChange}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="leader"
                                label="Chef d'équipe"
                                color="success"
                                variant="outlined"
                                error={newTeamErrors.leader}
                                helperText={newTeamErrors.leader ? "Le chef d'équipe est requis" : ''}
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
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            mr: 2,
                                            bgcolor: '#16A249',
                                        }}
                                    >
                                        {option.name
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body1">{option.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </li>
                        )}
                    />
                    <Autocomplete
                        id="project"
                        options={projects}
                        getOptionLabel={(option) => option.title}
                        value={selectedProject}
                        onChange={handleProjectChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="project"
                                label="Projet"
                                color="success"
                                variant="outlined"
                                error={newTeamErrors.projectId}
                                helperText={newTeamErrors.projectId ? 'Le projet est requis' : ''}
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
                                required
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body1">{option.title}</Typography>
                                    {option.description && (
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {option.description || 'Description non disponible'}
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        )}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        color="success"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={newTeamData.description}
                        onChange={handleNewTeamInputChange}
                        error={newTeamErrors.description}
                        helperText={newTeamErrors.description ? 'La description est requise' : ''}
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
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewTeamDialogClose}
                        variant="outlined"
                        sx={{
                            textTransform: 'none',
                            color: '#6B7280',            // Tailwind Gray-500
                            borderColor: '#6B7280',
                            '&:hover': {
                              backgroundColor: '#6B7280',
                              color: 'white',
                              borderColor: '#6B7280',
                            },
                          }}
                    >
                        Annuler
                    </Button>
                    <Button 
                    onClick={handleCreateNewTeam} disabled={loading}
                    variant="contained"
                    color="success"  
                    endIcon={<SendIcon />}
                    sx={{
                        bgcolor: '#16A249',
                        border: '1px solid #16A249',
                        textTransform: 'none',
                        borderRadius: 1,
                        px: 2,
                        '&:hover': {
                            bgcolor: '#138a3c', // a slightly darker green for hover
                            borderColor: '#138a3c',
                        },
                        }}
                    >
                        Créer l'équipe
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialogue de modification d'une équipe */}
            <Dialog open={openEditTeamDialog} onClose={handleEditTeamDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Modifier l'équipe</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Nom de l'équipe"
                        color="success"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editTeamData.name}
                        onChange={handleEditTeamInputChange}
                        error={editTeamErrors.name}
                        helperText={editTeamErrors.name ? "Le nom de l'équipe est requis" : ''}
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
                        required
                    />
                    <Autocomplete
                        id="edit-leader"
                        options={allUsers}
                        getOptionLabel={(option) => option.name}
                        value={selectedEditLeader}
                        onChange={handleEditLeaderChange}
                        loading={loading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="leader"
                                label="Chef d'équipe"
                                color="success"
                                variant="outlined"
                                error={editTeamErrors.leader}
                                helperText={editTeamErrors.leader ? "Le chef d'équipe est requis" : ''}
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
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        renderOption={(props, option) => {
                            // Vérifier si cet utilisateur est déjà un membre de l'équipe
                            const isExistingMember = selectedTeam?.members?.some((member) => member.id === option.id);

                            return (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                mr: 2,
                                                bgcolor: isExistingMember ? '#FF8C00' : '#16A249',
                                            }}
                                        >
                                            {option.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography variant="body1">{option.name}</Typography>
                                                {isExistingMember && (
                                                    <Chip
                                                        label="Membre actuel"
                                                        size="small"
                                                        variant="outlined"
                                                        color="warning"
                                                        sx={{ ml: 1, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {option.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            );
                        }}
                    />
                    <Autocomplete
                        id="edit-project"
                        options={projects}
                        getOptionLabel={(option) => option.title}
                        value={selectedEditProject}
                        onChange={handleEditProjectChange}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="project"
                                label="Projet"
                                color="success"
                                variant="outlined"
                                error={editTeamErrors.projectId}
                                helperText={editTeamErrors.projectId ? 'Le projet est requis' : ''}
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
                                required
                            />
                        )}
                        renderOption={(props, option) => (
                            <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                    <Typography variant="body1">{option.title}</Typography>
                                    {option.description && (
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {option.description || 'Description non disponible'}
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        )}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        color="success"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={editTeamData.description}
                        onChange={handleEditTeamInputChange}
                        error={editTeamErrors.description}
                        helperText={editTeamErrors.description ? 'La description est requise' : ''}
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
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditTeamDialogClose}
                     variant="outlined"
                      sx={{
                            textTransform: 'none',
                             color: '#6B7280',            // Tailwind Gray-500
                              borderColor: '#6B7280',
                            '&:hover': {
                                     backgroundColor: '#6B7280',
                                     color: 'white',
                                     borderColor: '#6B7280',
                                      },
                        }}
                    >Annuler</Button>
                    <Button onClick={handleUpdateTeam} variant="contained" color="success" sx={{ bgcolor: '#16A249' }} disabled={loading}>
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Dialogue de suppression d'une équipe */}
            <Dialog open={openDeleteTeamDialog} onClose={handleDeleteTeamDialogClose} fullWidth maxWidth="sm">
                <DialogTitle>Supprimer l'équipe</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteTeamDialogClose}
                    color="success"
                    variant="outlined"
                    sx={{
                        border: '1px solid #16A249',
                        textTransform: 'none',
                        borderRadius: 1,
                        px: 2,
                        '&:hover': {
                            color: 'white',
                            bgcolor: '#138a3c', // a slightly darker green for hover
                            borderColor: '#138a3c',
                        },
                    }}
                    >
                        Annuler
                    </Button>
                    <Button onClick={handleDeleteTeam} 
                    variant="contained" color="error" disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Menu d'actions pour les équipes */}
            <Menu
                anchorEl={teamActionMenuAnchorEl}
                open={openTeamActionMenu}
                onClose={handleTeamActionMenuClose}
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
                <MenuItem onClick={(e) => handleViewTeamDetails(selectedTeamId || 0, e)}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" sx={{ color: '#16A249' }} />
                    </ListItemIcon>
                    <ListItemText primary="Détails" />
                </MenuItem>
                {currentUser && currentUser.role === 'admin' && (
                    <MenuItem onClick={() => handleEditTeamDialogOpen(selectedTeamId || 0)}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" sx={{ color: '#16A249' }} />
                        </ListItemIcon>
                        <ListItemText primary="Modifier" />
                    </MenuItem>
                )}
                {currentUser && currentUser.role === 'admin' && (
                    <MenuItem onClick={() => handleDeleteTeamDialogOpen(selectedTeamId || 0)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                    </MenuItem>
                )}
            </Menu>
            {/* Menu d'actions pour les membres */}
            <Menu
                anchorEl={memberActionMenuAnchorEl}
                open={openMemberActionMenu}
                onClose={handleMemberActionMenuClose}
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
                {canDeletMembers() && (
                    <MenuItem onClick={() => handleRemoveMember(selectedMemberId || 0)}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                    </MenuItem>
                )}
            </Menu>
            {/* Dialogue d'ajout de plusieurs membres à une équipe */}
            <Dialog open={openBatchAddDialog} onClose={handleBatchAddDialogClose} fullWidth maxWidth="md">
                <DialogTitle>Ajouter plusieurs membres à l'équipe</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="batch-search"
                            name="batch-search"
                            label="Rechercher des utilisateurs"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Utilisateurs disponibles
                        </Typography>
                        <Button size="small" onClick={handleSelectAllUsers} disabled={filteredUsers.length === 0}>
                            {filteredUsers.every((user) => selectedUsers.some((selected) => selected.id === user.id))
                                ? 'Désélectionner tout'
                                : 'Sélectionner tout'}
                        </Button>
                    </Box>

                    <Paper sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
                        <List dense>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const isSelected = selectedUsers.some((selected) => selected.id === user.id);
                                    return (
                                        <ListItem
                                            key={user.id}
                                            onClick={() => handleSelectMultipleUsers(user)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'rgba(22, 162, 73, 0.1)' },
                                                ...(isSelected && { bgcolor: 'rgba(22, 162, 73, 0.1)' }),
                                            }}
                                            secondaryAction={
                                                <Checkbox
                                                    edge="end"
                                                    checked={isSelected}
                                                    tabIndex={-1}
                                                    disableRipple
                                                    color="success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectMultipleUsers(user);
                                                    }}
                                                />
                                            }
                                        >
                                            <ListItemIcon>
                                                <Avatar sx={{ bgcolor: '#16A249', width: 32, height: 32 }}>
                                                    {user.name
                                                        .split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('')}
                                                </Avatar>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={user.email}
                                                primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                                            />
                                        </ListItem>
                                    );
                                })
                            ) : (
                                <ListItem>
                                    <ListItemText primary="Aucun utilisateur trouvé" />
                                </ListItem>
                            )}
                        </List>
                    </Paper>

                    {selectedUsers.length > 0 && (
                        <>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Utilisateurs sélectionnés ({selectedUsers.length})
                            </Typography>
                            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(22, 162, 73, 0.05)', borderRadius: 2 }}>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {selectedUsers.map((user) => (
                                        <Chip
                                            key={user.id}
                                            avatar={
                                                <Avatar sx={{ bgcolor: '#16A249' }}>
                                                    {user.name
                                                        .split(' ')
                                                        .map((n: string) => n[0])
                                                        .join('')}
                                                </Avatar>
                                            }
                                            label={user.name}
                                            onDelete={() => handleSelectMultipleUsers(user)}
                                            deleteIcon={<RemoveCircleOutlineIcon />}
                                            sx={{
                                                p: 0.5,
                                                '& .MuiChip-label': { fontWeight: 'medium' },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Paper>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBatchAddDialogClose}
                                            variant="outlined"
                                            sx={{
                                                textTransform: 'none',
                                                color: '#6B7280',            // Tailwind Gray-500
                                                borderColor: '#6B7280',
                                                '&:hover': {
                                                  backgroundColor: '#6B7280',
                                                  color: 'white',
                                                  borderColor: '#6B7280',
                                                },
                                              }}
                    >
                        Annuler</Button>
                    <Button
                        onClick={handleAddBatchMembers}
                        variant="contained"
                        color="success"
                        disabled={selectedUsers.length === 0 || loading}
                        sx={{ bgcolor: '#16A249' }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            `Ajouter ${selectedUsers.length} membre${selectedUsers.length > 1 ? 's' : ''}`
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </AppLayout>
    );
};

export default Team;
