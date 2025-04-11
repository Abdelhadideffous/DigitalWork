'use client';

import {
    Add,
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    MailOutline,
    MoreVert,
    RemoveCircleOutline as RemoveCircleOutlineIcon,
    Search as SearchIcon,
    Visibility as VisibilityIcon,
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
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    LinearProgress,
    List,
    ListItem,
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
import AppLayout from './AppLayout';

function TestTeam() {
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
        description: '',
    });
    const [newTeamErrors, setNewTeamErrors] = useState({
        name: false,
        leader: false,
        description: false,
    });

    // État pour l'autocomplétion du chef d'équipe
    const [leaderSearchQuery, setLeaderSearchQuery] = useState('');
    const [leaderOptions, setLeaderOptions] = useState<Array<{ id: number; name: string; email: string }>>([]);
    const [selectedLeader, setSelectedLeader] = useState<{ id: number; name: string; email: string } | null>(null);
    const [loadingLeaders, setLoadingLeaders] = useState(false);

    // État pour le formulaire d'ajout de membre
    const [newMemberData, setNewMemberData] = useState({
        name: '',
        project: '',
        email: '',
    });
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // État pour la vue détaillée d'une équipe
    const [showTeamDetails, setShowTeamDetails] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
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
        description: '',
    });
    const [editTeamErrors, setEditTeamErrors] = useState({
        name: false,
        leader: false,
        description: false,
    });
    const [selectedEditLeader, setSelectedEditLeader] = useState<{ id: number; name: string; email: string } | null>(null);

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
    const [selectedUsers, setSelectedUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
    const [openBatchAddDialog, setOpenBatchAddDialog] = useState(false);

    // Données des équipes et utilisateurs (initialisées vides, à remplir depuis l'API)
    const [teams, setTeams] = useState<any[]>([]);
    const [existingUsers, setExistingUsers] = useState<any[]>([]);

    // Fonction pour charger les équipes depuis l'API
    const fetchTeams = async () => {
        try {
            setInitialLoading(true);

            // Simulation d'un appel API pour le développement frontend
            console.log('Chargement des équipes...');

            // Données simulées pour le développement
            const mockTeams = [
                {
                    id: 1,
                    name: 'Équipe Développement',
                    memberCount: 5,
                    leader: 'Thomas Dubois',
                    leaderInitials: 'TD',
                    projectList: ['Refonte du site web', 'Application mobile'],
                    createdAt: '01/01/2025',
                    description: 'Équipe responsable du développement frontend et backend des applications',
                    members: [
                        {
                            id: 1,
                            name: 'Thomas Dubois',
                            email: 'thomas.dubois@example.com',
                            status: 'Actif',
                            projects: ['Refonte du site web', 'Application mobile'],
                        },
                        {
                            id: 2,
                            name: 'Lucas Petit',
                            email: 'lucas.petit@example.com',
                            status: 'Actif',
                            projects: ['Refonte du site web'],
                        },
                        {
                            id: 3,
                            name: 'Sophie Martin',
                            email: 'sophie.martin@example.com',
                            status: 'Actif',
                            projects: ['Application mobile'],
                        },
                        {
                            id: 4,
                            name: 'Emma Bernard',
                            email: 'emma.bernard@example.com',
                            status: 'Actif',
                            projects: ['Refonte du site web', 'Application mobile'],
                        },
                        {
                            id: 5,
                            name: 'Hugo Leroy',
                            email: 'hugo.leroy@example.com',
                            status: 'En congé',
                            projects: ['Application mobile'],
                        },
                    ],
                    projects: [
                        {
                            id: 1,
                            name: 'Refonte du site web',
                            status: 'En cours',
                            deadline: '15/04/2025',
                            progress: 65,
                            description: "Refonte complète du site web de l'entreprise avec un nouveau design et de nouvelles fonctionnalités.",
                            assignedMembers: 4,
                        },
                        {
                            id: 2,
                            name: 'Application mobile',
                            status: 'En cours',
                            deadline: '30/06/2025',
                            progress: 35,
                            description: "Développement d'une application mobile pour les clients de l'entreprise.",
                            assignedMembers: 3,
                        },
                    ],
                },
                {
                    id: 2,
                    name: 'Équipe Marketing',
                    memberCount: 3,
                    leader: 'Julie Moreau',
                    leaderInitials: 'JM',
                    projectList: ['Campagne réseaux sociaux', 'Refonte de la marque'],
                    createdAt: '15/01/2025',
                    description: 'Équipe responsable des stratégies marketing et de la communication',
                    members: [
                        {
                            id: 6,
                            name: 'Julie Moreau',
                            email: 'julie.moreau@example.com',
                            status: 'Actif',
                            projects: ['Campagne réseaux sociaux', 'Refonte de la marque'],
                        },
                        {
                            id: 7,
                            name: 'Antoine Dupont',
                            email: 'antoine.dupont@example.com',
                            status: 'Actif',
                            projects: ['Campagne réseaux sociaux'],
                        },
                        {
                            id: 8,
                            name: 'Camille Rousseau',
                            email: 'camille.rousseau@example.com',
                            status: 'Actif',
                            projects: ['Refonte de la marque'],
                        },
                    ],
                    projects: [
                        {
                            id: 3,
                            name: 'Campagne réseaux sociaux',
                            status: 'En cours',
                            deadline: '01/03/2025',
                            progress: 80,
                            description: "Campagne de promotion sur les réseaux sociaux pour augmenter la visibilité de l'entreprise.",
                            assignedMembers: 2,
                        },
                        {
                            id: 4,
                            name: 'Refonte de la marque',
                            status: 'Planifié',
                            deadline: '01/07/2025',
                            progress: 15,
                            description: "Refonte complète de l'identité visuelle de l'entreprise.",
                            assignedMembers: 2,
                        },
                    ],
                },
            ];

            // Simuler un délai de chargement
            setTimeout(() => {
                setTeams(mockTeams);
                setInitialLoading(false);
            }, 500);

            // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
            // try {
            //   const teamsData = await teamApi.getAllTeams();
            //   setTeams(teamsData);
            //   setInitialLoading(false);
            // } catch (error) {
            //   console.error("Erreur lors du chargement des équipes:", error);
            //   setSnackbar({
            //     open: true,
            //     message: "Erreur lors du chargement des équipes",
            //     severity: "error",
            //   });
            //   setInitialLoading(false);
            // }
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
            // Simulation d'un appel API pour le développement frontend
            console.log('Chargement des utilisateurs...');

            // Données simulées pour le développement
            const mockUsers = [
                {
                    id: 1,
                    name: 'Thomas Dubois',
                    email: 'thomas.dubois@example.com',
                },
                {
                    id: 2,
                    name: 'Lucas Petit',
                    email: 'lucas.petit@example.com',
                },
                {
                    id: 3,
                    name: 'Sophie Martin',
                    email: 'sophie.martin@example.com',
                },
                {
                    id: 4,
                    name: 'Emma Bernard',
                    email: 'emma.bernard@example.com',
                },
                {
                    id: 5,
                    name: 'Hugo Leroy',
                    email: 'hugo.leroy@example.com',
                },
                {
                    id: 6,
                    name: 'Julie Moreau',
                    email: 'julie.moreau@example.com',
                },
                {
                    id: 7,
                    name: 'Antoine Dupont',
                    email: 'antoine.dupont@example.com',
                },
                {
                    id: 8,
                    name: 'Camille Rousseau',
                    email: 'camille.rousseau@example.com',
                },
                {
                    id: 9,
                    name: 'Mathieu Blanc',
                    email: 'mathieu.blanc@example.com',
                },
                {
                    id: 10,
                    name: 'Laura Girard',
                    email: 'laura.girard@example.com',
                },
            ];

            setExistingUsers(mockUsers);

            // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
            // try {
            //   const usersData = await userApi.getAllUsers();
            //   setExistingUsers(usersData);
            // } catch (error) {
            //   console.error("Erreur lors du chargement des utilisateurs:", error);
            //   setSnackbar({
            //     open: true,
            //     message: "Erreur lors du chargement des utilisateurs",
            //     severity: "error",
            //   });
            // }
        } catch (error) {
            console.error('Erreur lors du chargement des utilisateurs:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors du chargement des utilisateurs',
                severity: 'error',
            });
        }
    };

    // Fonction pour rechercher des chefs d'équipe
    const searchLeaders = async (query: string) => {
        setLoadingLeaders(true);

        // Données simulées pour le développement
        if (query.trim() !== '') {
            // Filtrer les utilisateurs existants en fonction de la requête
            const filteredLeaders = existingUsers.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()));
            setLeaderOptions(filteredLeaders);
        } else {
            setLeaderOptions([]);
        }

        setLoadingLeaders(false);

        // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
        // try {
        //   if (query.trim() !== "") {
        //     const leaders = await userApi.searchUsersByName(query);
        //     setLeaderOptions(leaders);
        //   } else {
        //     setLeaderOptions([]);
        //   }
        // } catch (error) {
        //   console.error("Erreur lors de la recherche des chefs d'équipe:", error);
        //   setLeaderOptions([]);
        // } finally {
        //   setLoadingLeaders(false);
        // }
    };

    // Effet pour charger les chefs d'équipe lorsque la requête change
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (leaderSearchQuery) {
                searchLeaders(leaderSearchQuery);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [leaderSearchQuery]);

    // Charger les équipes au chargement du composant
    useEffect(() => {
        fetchTeams();
        fetchUsers();
    }, []);

    // Filtrage des équipes par recherche
    const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchTeamQuery.toLowerCase()));

    // Filtrage des membres par recherche
    const filteredMembers = selectedTeam?.members.filter((member: any) => member.name.toLowerCase().includes(searchMemberQuery.toLowerCase())) || [];

    // Filtrage des utilisateurs existants par recherche
    const filteredUsers = existingUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) || user.email.toLowerCase().includes(memberSearchQuery.toLowerCase()),
    );

    // Liste des projets disponibles pour l'ajout de membre
    const availableProjects = selectedTeam?.projects?.map((project: any) => project.name) || [];

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
            description: '',
        });
        setNewTeamErrors({
            name: false,
            leader: false,
            description: false,
        });
        setSelectedLeader(null);
        setLeaderSearchQuery('');
        setLeaderOptions([]);
    };

    const handleNewTeamDialogClose = () => {
        setOpenNewTeamDialog(false);
        setNewTeamData({
            name: '',
            leader: '',
            description: '',
        });
        setNewTeamErrors({
            name: false,
            leader: false,
            description: false,
        });
        setSelectedLeader(null);
        setLeaderSearchQuery('');
        setLeaderOptions([]);
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

    const handleLeaderChange = (_: React.SyntheticEvent, value: { id: number; name: string; email: string } | null) => {
        setSelectedLeader(value);
        if (value) {
            setNewTeamData({
                ...newTeamData,
                leader: value.name,
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
            });
        }
    };

    const handleEditLeaderChange = (_: React.SyntheticEvent, value: { id: number; name: string; email: string } | null) => {
        setSelectedEditLeader(value);
        if (value) {
            setEditTeamData({
                ...editTeamData,
                leader: value.name,
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
            });
        }
    };

    const handleNewMemberSelectChange = (e: SelectChangeEvent) => {
        const { name, value } = e.target;
        setNewMemberData({
            ...newMemberData,
            [name]: value,
        });
    };

    const handleSelectMultipleUsers = (user: { id: number; name: string; email: string }) => {
        const isAlreadySelected = selectedUsers.some((selected) => selected.id === user.id);

        if (isAlreadySelected) {
            setSelectedUsers(selectedUsers.filter((selected) => selected.id !== user.id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    // Fonction pour sélectionner/désélectionner tous les utilisateurs filtrés
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

    const handleBatchAddDialogOpen = () => {
        setOpenBatchAddDialog(true);
        setSelectedUsers([]);
        setMemberSearchQuery('');
        // Charger les utilisateurs si ce n'est pas déjà fait
        if (existingUsers.length === 0) {
            fetchUsers();
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

            // Préparation des données pour l'API
            const userIds = selectedUsers.map((user) => user.id);

            // Simulation d'un appel API pour le développement frontend
            console.log('Ajout de membres en lot:', userIds, "à l'équipe:", selectedTeam.id);

            setTimeout(() => {
                setLoading(false);
                setSnackbar({
                    open: true,
                    message: `${selectedUsers.length} membre(s) ajouté(s) avec succès`,
                    severity: 'success',
                });
                handleBatchAddDialogClose();
            }, 500);

            // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
            // try {
            //   await teamApi.addMultipleMembers(selectedTeam.id, userIds);
            //   setSnackbar({
            //     open: true,
            //     message: `${selectedUsers.length} membre(s) ajouté(s) avec succès`,
            //     severity: "success",
            //   });
            //   handleBatchAddDialogClose();
            //   // Recharger les détails de l'équipe
            //   await handleViewTeamDetails(selectedTeam.id);
            // } catch (error) {
            //   console.error("Erreur lors de l'ajout des membres:", error);
            //   setSnackbar({
            //     open: true,
            //     message: "Erreur lors de l'ajout des membres",
            //     severity: "error",
            //   });
            // } finally {
            //   setLoading(false);
            // }
        } catch (error) {
            console.error("Erreur lors de l'ajout des membres:", error);
            setSnackbar({
                open: true,
                message: "Erreur lors de l'ajout des membres",
                severity: 'error',
            });
            setLoading(false);
        }
    };

    const handleCreateNewTeam = async () => {
        // Validation des champs
        const nameEmpty = newTeamData.name.trim() === '';
        const leaderEmpty = newTeamData.leader.trim() === '';
        const descriptionEmpty = newTeamData.description.trim() === '';

        setNewTeamErrors({
            name: nameEmpty,
            leader: leaderEmpty,
            description: descriptionEmpty,
        });

        // Si tous les champs sont remplis, procéder à la création
        if (!nameEmpty && !leaderEmpty && !descriptionEmpty) {
            try {
                setLoading(true);

                // Simulation d'un appel API pour le développement frontend
                console.log('Équipe créée avec succès:', newTeamData);

                setTimeout(() => {
                    setLoading(false);
                    setSnackbar({
                        open: true,
                        message: 'Équipe créée avec succès',
                        severity: 'success',
                    });
                    handleNewTeamDialogClose();
                }, 500);

                // try {
                //   await teamApi.createTeam(newTeamData);
                //   setSnackbar({
                //     open: true,
                //     message: "Équipe créée avec succès",
                //     severity: "success",
                //   });
                //   handleNewTeamDialogClose();
                //   // Recharger la liste des équipes
                //   fetchTeams();
                // } catch (error) {
                //   console.error("Erreur lors de la création de l'équipe:", error);
                //   setSnackbar({
                //     open: true,
                //     message: "Erreur lors de la création de l'équipe",
                //     severity: "error",
                //   });
                // } finally {
                //   setLoading(false);
                // }
            } catch (error) {
                console.error("Erreur lors de la création de l'équipe:", error);
                setSnackbar({
                    open: true,
                    message: "Erreur lors de la création de l'équipe",
                    severity: 'error',
                });
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

            // Simulation d'un appel API pour le développement frontend
            console.log("Chargement des détails de l'équipe:", teamId);

            // Trouver l'équipe dans les données simulées
            const team = teams.find((t) => t.id === teamId);

            // Simuler un délai de chargement
            setTimeout(() => {
                if (team) {
                    setSelectedTeam(team);
                    setShowTeamDetails(true);
                    setSearchMemberQuery('');
                } else {
                    // Si l'équipe n'est pas trouvée, utiliser des données par défaut
                    const mockTeamDetails = {
                        id: teamId,
                        name: `Équipe ${teamId}`,
                        leader: "Chef d'équipe",
                        description: "Description de l'équipe",
                        createdAt: '01/01/2025',
                        memberCount: 0,
                        members: [],
                        projects: [],
                    };
                    setSelectedTeam(mockTeamDetails);
                    setShowTeamDetails(true);
                    setSearchMemberQuery('');
                }
                setLoading(false);
            }, 300);

            // Utilisation de l'API réelle
            // try {
            //   const teamDetails = await teamApi.getTeamById(teamId);
            //   setSelectedTeam(teamDetails);
            //   setShowTeamDetails(true);
            //   setSearchMemberQuery("");
            // } catch (error) {
            //   console.error("Erreur lors du chargement des détails de l'équipe:", error);
            //   setSnackbar({
            //     open: true,
            //     message: "Erreur lors du chargement des détails de l'équipe",
            //     severity: "error",
            //   });
            // } finally {
            //   setLoading(false);
            // }
        } catch (error) {
            console.error("Erreur lors du chargement des détails de l'équipe:", error);
            setSnackbar({
                open: true,
                message: "Erreur lors du chargement des détails de l'équipe",
                severity: 'error',
            });
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

        try {
            setLoading(true);

            // Simulation d'un appel API pour le développement frontend
            console.log('Suppression du membre:', memberId, "de l'équipe:", selectedTeam.id);

            setTimeout(() => {
                setLoading(false);
                setSnackbar({
                    open: true,
                    message: 'Membre supprimé avec succès',
                    severity: 'success',
                });
                handleMemberActionMenuClose();
            }, 500);

            // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
            // try {
            //   await teamApi.removeMember(selectedTeam.id, memberId);
            //   setSnackbar({
            //     open: true,
            //     message: "Membre supprimé avec succès",
            //     severity: "success",
            //   });
            //   handleMemberActionMenuClose();
            //   // Recharger les détails de l'équipe
            //   await handleViewTeamDetails(selectedTeam.id);
            // } catch (error) {
            //   console.error("Erreur lors de la suppression du membre:", error);
            //   setSnackbar({
            //     open: true,
            //     message: "Erreur lors de la suppression du membre",
            //     severity: "error",
            //   });
            //   handleMemberActionMenuClose();
            // } finally {
            //   setLoading(false);
            // }
        } catch (error) {
            console.error('Erreur lors de la suppression du membre:', error);
            setSnackbar({
                open: true,
                message: 'Erreur lors de la suppression du membre',
                severity: 'error',
            });
            setLoading(false);
            handleMemberActionMenuClose();
        }
    };

    // Fonctions pour gérer l'édition d'une équipe
    const handleEditTeamDialogOpen = (teamId: number) => {
        const team = teams.find((t) => t.id === teamId);
        if (team) {
            setEditTeamData({
                id: team.id,
                name: team.name,
                leader: team.leader,
                description: team.description,
            });
            setEditTeamErrors({
                name: false,
                leader: false,
                description: false,
            });
            setSelectedEditLeader(null);
            setLeaderSearchQuery('');
            setLeaderOptions([]);
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
        });
        setSelectedEditLeader(null);
        setLeaderSearchQuery('');
        setLeaderOptions([]);
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
        const leaderEmpty = editTeamData.leader.trim() === '';
        const descriptionEmpty = editTeamData.description.trim() === '';

        setEditTeamErrors({
            name: nameEmpty,
            leader: leaderEmpty,
            description: descriptionEmpty,
        });

        // Si tous les champs sont remplis, procéder à la mise à jour
        if (!nameEmpty && !leaderEmpty && !descriptionEmpty) {
            try {
                setLoading(true);

                // Simulation d'un appel API pour le développement frontend
                console.log('Équipe mise à jour avec succès:', editTeamData);

                setTimeout(() => {
                    setLoading(false);
                    setSnackbar({
                        open: true,
                        message: 'Équipe mise à jour avec succès',
                        severity: 'success',
                    });
                    handleEditTeamDialogClose();
                }, 500);

                // Utilisation de l'API réelle (à décommenter pour l'utilisation réelle)
                // try {
                //   await teamApi.updateTeam(editTeamData.id, {
                //     name: editTeamData.name,
                //     leader: editTeamData.leader,
                //     description: editTeamData.description,
                //   });
                //   setSnackbar({
                //     open: true,
                //     message: "Équipe mise à jour avec succès",
                //     severity: "success",
                //   });
                //   handleEditTeamDialogClose();
                //   // Recharger la liste des équipes
                //   fetchTeams();
                //   // Si nous sommes dans la vue détaillée de l'équipe modifiée, recharger les détails
                //   if (showTeamDetails && selectedTeam?.id === editTeamData.id) {
                //     await handleViewTeamDetails(editTeamData.id);
                //   }
                // } catch (error) {
                //   console.error("Erreur lors de la mise à jour de l'équipe:", error);
                //   setSnackbar({
                //     open: true,
                //     message: "Erreur lors de la mise à jour de l'équipe",
                //     severity: "error",
                //   });
                // } finally {
                //   setLoading(false);
                // }
            } catch (error) {
                console.error("Erreur lors de la mise à jour de l'équipe:", error);
                setSnackbar({
                    open: true,
                    message: "Erreur lors de la mise à jour de l'équipe",
                    severity: 'error',
                });
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
        setOpenDeleteTeamDialog(false);
        // Effacer selectedTeamId seulement lorsque le dialogue est fermé
        setSelectedTeamId(null);
    };

    // Fonction corrigée pour la suppression d'équipe
    const handleDeleteTeam = async () => {
        // Stocker l'ID dans une variable locale pour s'assurer qu'il ne change pas
        const teamIdToDelete = selectedTeamId;

        if (!teamIdToDelete) return;

        try {
            setLoading(true);
            console.log("Suppression de l'équipe:", teamIdToDelete);

            await new Promise((resolve) => setTimeout(resolve, 500));

            // Simuler la mise à jour de la liste des équipes
            const updatedTeams = teams.filter((team) => team.id !== teamIdToDelete);
            setTeams(updatedTeams);

            // Fermer le dialogue de confirmation
            handleDeleteTeamDialogClose();

            // Si nous sommes dans la vue détaillée de l'équipe supprimée, revenir à la liste
            if (showTeamDetails && selectedTeam?.id === teamIdToDelete) {
                handleBackToTeamsList();
            }

            setLoading(false);

            // Afficher le Snackbar de succès
            setSnackbar({
                open: true,
                message: 'Équipe supprimée avec succès',
                severity: 'success',
            });
        } catch (error) {
            console.error("Erreur lors de la suppression de l'équipe:", error);
            setLoading(false);
            handleDeleteTeamDialogClose();
            setSnackbar({
                open: true,
                message: "Erreur lors de la suppression de l'équipe",
                severity: 'error',
            });
        }
    };

    // Fonction corrigée pour fermer la notification
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
                        {/* Fil d'Ariane */}
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
                                    Team
                                </Typography>
                                <Typography color="text.primary">{selectedTeam?.id}</Typography>
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
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<Add />}
                                    onClick={handleBatchAddDialogOpen}
                                    sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                                >
                                    Ajouter plusieurs membres
                                </Button>
                            </Box>
                        </Box>

                        {/* Badge et chef d'équipe */}
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2">Chef d'équipe: {selectedTeam?.leader}</Typography>
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
                                        <Typography variant="body1">{selectedTeam?.createdAt}</Typography>
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" gutterBottom>
                                            Nombre de membres
                                        </Typography>
                                        <Typography variant="body1">{selectedTeam?.members?.length || 0} membres</Typography>
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
                                            fontWeight: 'bold',
                                        },
                                    }}
                                >
                                    <Tab label="Membres de l'équipe" />
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
                                                            <TableCell sx={{ fontWeight: 'bold' }}>Projets</TableCell>
                                                            <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                                                Actions
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {filteredMembers && filteredMembers.length > 0 ? (
                                                            filteredMembers.map((member: any) => (
                                                                <TableRow key={member.id} hover>
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
                                                                            >
                                                                                {member.name
                                                                                    .split(' ')
                                                                                    .map((n: string) => n[0])
                                                                                    .join('')}
                                                                            </Avatar>
                                                                            <Box>
                                                                                <Typography fontWeight="bold">{member.name}</Typography>
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    {member.status}
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
                                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                                            {member.projects && member.projects.length > 0 ? (
                                                                                member.projects.map((project: string, index: number) => (
                                                                                    <Chip
                                                                                        key={index}
                                                                                        label={project}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                        sx={{ fontWeight: 'medium' }}
                                                                                    />
                                                                                ))
                                                                            ) : (
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    Aucun projet
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => handleMemberActionMenuOpen(e, member.id)}
                                                                        >
                                                                            <MoreVert />
                                                                        </IconButton>
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
                                                <Button variant="outlined">Voir tous les projets</Button>
                                            </Box>

                                            {selectedTeam?.projects && selectedTeam.projects.length > 0 ? (
                                                selectedTeam.projects.map((project: any) => (
                                                    <Paper
                                                        key={project.id}
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
                                                        <Box
                                                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
                                                        >
                                                            <Box>
                                                                <Typography variant="h6" fontWeight="bold">
                                                                    {project.name}
                                                                </Typography>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                                    <Chip
                                                                        label={project.status}
                                                                        color={project.status === 'En cours' ? 'success' : 'warning'}
                                                                        size="small"
                                                                        sx={{ mr: 2 }}
                                                                    />
                                                                    <Typography variant="body2">Échéance: {project.deadline}</Typography>
                                                                </Box>
                                                            </Box>
                                                            <Button variant="outlined" size="small">
                                                                Voir les détails
                                                            </Button>
                                                        </Box>

                                                        <Typography variant="body2" sx={{ mb: 3 }}>
                                                            {project.description}
                                                        </Typography>

                                                        <Box sx={{ mb: 3 }}>
                                                            <Box
                                                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
                                                            >
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    Progression
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {project.progress}%
                                                                </Typography>
                                                            </Box>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={project.progress}
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

                                                        <Box>
                                                            <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                                                Membres assignés
                                                            </Typography>
                                                            <Box sx={{ display: 'flex' }}>
                                                                {Array(project.assignedMembers)
                                                                    .fill(0)
                                                                    .map((_, index) => (
                                                                        <Avatar
                                                                            key={index}
                                                                            sx={{
                                                                                width: 32,
                                                                                height: 32,
                                                                                bgcolor: '#16A249',
                                                                                fontSize: 14,
                                                                                border: '2px solid white',
                                                                                ml: index > 0 ? -1 : 0,
                                                                            }}
                                                                        >
                                                                            {index + 1}
                                                                        </Avatar>
                                                                    ))}
                                                            </Box>
                                                        </Box>
                                                    </Paper>
                                                ))
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
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<Add />}
                                onClick={handleNewTeamDialogOpen}
                                sx={{ textTransform: 'none', borderRadius: 1, px: 2, bgcolor: '#16A249' }}
                            >
                                Créer une équipe
                            </Button>
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
                                        <TableCell sx={{ fontWeight: 'bold' }}>Projets</TableCell>
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
                                                            {team.leaderInitials ||
                                                                team.leader
                                                                    ?.split(' ')
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
                                                <TableCell>{team.memberCount}</TableCell>
                                                <TableCell>{team.leader}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {team.projectList && team.projectList.length > 0 ? (
                                                            team.projectList.map((project: string, index: number) => (
                                                                <Chip
                                                                    key={index}
                                                                    label={project}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ fontWeight: 'medium' }}
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Aucun projet
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{team.createdAt}</TableCell>
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
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newTeamData.name}
                        onChange={handleNewTeamInputChange}
                        error={newTeamErrors.name}
                        helperText={newTeamErrors.name ? "Le nom de l'équipe est requis" : ''}
                        required
                    />
                    <Autocomplete
                        id="leader"
                        options={leaderOptions}
                        getOptionLabel={(option) => option.name}
                        value={selectedLeader}
                        onChange={handleLeaderChange}
                        onInputChange={(_, newInputValue) => setLeaderSearchQuery(newInputValue)}
                        loading={loadingLeaders}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="leader"
                                label="Chef d'équipe"
                                variant="outlined"
                                error={newTeamErrors.leader}
                                helperText={newTeamErrors.leader ? "Le chef d'équipe est requis" : ''}
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingLeaders ? <CircularProgress color="inherit" size={20} /> : null}
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
                        value={newTeamData.description}
                        onChange={handleNewTeamInputChange}
                        error={newTeamErrors.description}
                        helperText={newTeamErrors.description ? 'La description est requise' : ''}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleNewTeamDialogClose}>Annuler</Button>
                    <Button onClick={handleCreateNewTeam} variant="contained" color="success" sx={{ bgcolor: '#16A249' }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Créer'}
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
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editTeamData.name}
                        onChange={handleEditTeamInputChange}
                        error={editTeamErrors.name}
                        helperText={editTeamErrors.name ? "Le nom de l'équipe est requis" : ''}
                        required
                    />
                    <Autocomplete
                        id="edit-leader"
                        options={leaderOptions}
                        getOptionLabel={(option) => option.name}
                        value={selectedEditLeader}
                        onChange={handleEditLeaderChange}
                        onInputChange={(_, newInputValue) => setLeaderSearchQuery(newInputValue)}
                        loading={loadingLeaders}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                margin="dense"
                                name="leader"
                                label="Chef d'équipe"
                                variant="outlined"
                                error={editTeamErrors.leader}
                                helperText={editTeamErrors.leader ? "Le chef d'équipe est requis" : ''}
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingLeaders ? <CircularProgress color="inherit" size={20} /> : null}
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
                        value={editTeamData.description}
                        onChange={handleEditTeamInputChange}
                        error={editTeamErrors.description}
                        helperText={editTeamErrors.description ? 'La description est requise' : ''}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditTeamDialogClose}>Annuler</Button>
                    <Button onClick={handleUpdateTeam} variant="contained" color="success" sx={{ bgcolor: '#16A249' }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Mettre à jour'}
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
                    <Button onClick={handleDeleteTeamDialogClose}>Annuler</Button>
                    <Button onClick={handleDeleteTeam} variant="contained" color="error" disabled={loading}>
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
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Voir les détails" />
                </MenuItem>
                <MenuItem onClick={() => handleEditTeamDialogOpen(selectedTeamId || 0)}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Modifier" />
                </MenuItem>
                <MenuItem onClick={() => handleDeleteTeamDialogOpen(selectedTeamId || 0)}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                </MenuItem>
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
                <MenuItem onClick={() => handleRemoveMember(selectedMemberId || 0)}>
                    <ListItemIcon>
                        <RemoveCircleOutlineIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                </MenuItem>
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
                        <Typography variant="subtitle1" fontWeight="bold">
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

                    {selectedTeam?.projects && selectedTeam.projects.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Assigner à un projet (optionnel)
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel id="batch-project-select-label">Projet</InputLabel>
                                <Select
                                    labelId="batch-project-select-label"
                                    id="batch-project"
                                    name="project"
                                    value={newMemberData.project}
                                    label="Projet"
                                    onChange={handleNewMemberSelectChange}
                                >
                                    <MenuItem value="">
                                        <em>Aucun</em>
                                    </MenuItem>
                                    {availableProjects.map((project: string) => (
                                        <MenuItem key={project} value={project}>
                                            {project}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleBatchAddDialogClose}>Annuler</Button>
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
}

export default TestTeam;
