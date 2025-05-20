'use client';

import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    MoreVert,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Visibility,
    VisibilityOff,
    Work as WorkIcon,
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Breadcrumbs,
    Button,
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
    Link,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    type SelectChangeEvent,
} from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { userService } from './api-service';

// Types bien définis
interface UserData {
    id?: number;
    name: string;
    email: string;
    role: string;
    number: string | null;
    password?: string;
}

// Type pour les notifications
interface NotificationState {
    open: boolean;
    message: string;
    severity: 'success' | 'error';
}

const CreateUser: React.FC = () => {
    // États pour la liste des utilisateurs
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'success',
    });

    // États pour le dialogue de création/modification
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [formData, setFormData] = useState<UserData>({
        name: '',
        email: '',
        role: 'employee',
        number: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    // États pour le menu d'actions
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);

    // Vérifier l'authentification au chargement du composant
    useEffect(() => {
        checkAuthentication();
    }, []);

    // Fonction pour vérifier l'authentification
    const checkAuthentication = (): void => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchUsers(); // Charger les utilisateurs après authentification
        } else {
            // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
            window.location.href = '/login';
        }
    };

    // Fonction pour récupérer la liste des utilisateurs
    const fetchUsers = async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers();
            if (response.success && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            showNotification('Erreur lors de la récupération des utilisateurs', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour afficher une notification
    const showNotification = (message: string, severity: 'success' | 'error'): void => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    // Fonction pour fermer la notification
    const handleCloseNotification = (): void => {
        setNotification({
            ...notification,
            open: false,
        });
    };

    // Fonction pour gérer les changements dans les champs de texte
    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Fonction pour gérer les changements dans le select
    const handleSelectChange = (e: SelectChangeEvent<string>): void => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name as string]: value,
        });
    };

    // Fonction pour ouvrir le dialogue de création
    const handleOpenCreateDialog = (): void => {
        setIsEditMode(false);
        setFormData({
            name: '',
            email: '',
            role: 'employee',
            number: '',
            password: '',
        });
        setConfirmPassword('');
        setSelectedUserId(null);
        setOpenDialog(true);
    };

    // Fonction pour créer un nouvel utilisateur
    const handleCreateUser = async (): Promise<void> => {
        // Validation des champs
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await userService.createUser(formData);

            if (response.success) {
                showNotification('Utilisateur créé avec succès', 'success');
                setOpenDialog(false);
                fetchUsers(); // Rafraîchir la liste des utilisateurs
                // Réinitialiser le formulaire
                setFormData({
                    name: '',
                    email: '',
                    role: 'employee',
                    number: '',
                    password: '',
                });
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error('Erreur lors de la création du compte:', error);
            showNotification(error.message || 'Une erreur est survenue lors de la création du compte', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour valider le formulaire
    const validateForm = (): boolean => {
        // Validation du nom
        if (!formData.name.trim()) {
            showNotification('Le nom est requis', 'error');
            return false;
        }

        // Validation de l'email
        if (!formData.email.trim()) {
            showNotification("L'email est requis", 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return false;
        }

        // Validation du mot de passe (uniquement pour la création)
        if (!isEditMode) {
            if (!formData.password) {
                showNotification('Le mot de passe est requis', 'error');
                return false;
            }

            if (formData.password.length < 8) {
                showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
                return false;
            }

            if (formData.password !== confirmPassword) {
                showNotification('Les mots de passe ne correspondent pas', 'error');
                return false;
            }
        } else if (formData.password && formData.password.trim() !== '') {
            // En mode édition, vérifier la correspondance uniquement si un mot de passe est fourni
            if (formData.password.length < 8) {
                showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
                return false;
            }

            if (formData.password !== confirmPassword) {
                showNotification('Les mots de passe ne correspondent pas', 'error');
                return false;
            }
        }

        return true;
    };

    const handleOpenConfirmDialog = (): void => {
        // Stocker l'ID de l'utilisateur à supprimer dans un état séparé
        setUserToDelete(selectedUserId);
        handleCloseMenu();
        setOpenConfirmDialog(true);
    };

    const handleCloseConfirmDialog = (): void => {
        setOpenConfirmDialog(false);
        // Ne pas réinitialiser userToDelete ici
    };

    // Fonction pour supprimer un utilisateur
    const handleDeleteUser = async (): Promise<void> => {
        // Utiliser userToDelete au lieu de selectedUserId
        if (!userToDelete) {
            showNotification('ID utilisateur non trouvé', 'error');
            return;
        }

        try {
            setLoading(true);
            console.log("Suppression de l'utilisateur avec ID:", userToDelete);
            const response = await userService.deleteUser(userToDelete);

            if (response.success) {
                showNotification('Utilisateur supprimé avec succès', 'success');
                fetchUsers(); // Rafraîchir la liste des utilisateurs
                handleCloseConfirmDialog(); // Fermer le dialogue après succès
                setUserToDelete(null); // Réinitialiser l'ID de l'utilisateur à supprimer
            } else {
                showNotification(response.message || 'Erreur lors de la suppression', 'error');
            }
        } catch (error: any) {
            console.error("Erreur lors de la suppression de l'utilisateur:", error);
            showNotification(error.message || "Erreur lors de la suppression de l'utilisateur", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour ouvrir le dialogue de modification
    const handleOpenEditDialog = (user: UserData): void => {
        console.log("Ouverture du dialogue de modification pour l'utilisateur:", user);
        setIsEditMode(true);
        setFormData({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            number: user.number || '',
            password: '', // Pas besoin de mot de passe pour la modification
        });
        setSelectedUserId(user.id!);
        setConfirmPassword('');
        setOpenDialog(true);
        console.log('isEditMode après modification:', true);
    };

    // Fonction pour mettre à jour un utilisateur
    const handleUpdateUser = async (): Promise<void> => {
        console.log('handleUpdateUser called');

        // Validation du formulaire
        if (!validateForm()) {
            return;
        }

        // Vérifier que l'ID utilisateur est disponible
        if (!formData.id) {
            showNotification('Erreur: ID utilisateur non disponible', 'error');
            return;
        }

        try {
            setLoading(true);

            // Créer un objet pour la mise à jour
            const dataToUpdate: Partial<UserData> = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                number: formData.number,
            };

            // Ajouter le mot de passe uniquement s'il est fourni et non vide
            if (formData.password && formData.password.trim() !== '') {
                dataToUpdate.password = formData.password;
            }

            console.log('Données à mettre à jour:', dataToUpdate);
            console.log('ID utilisateur:', formData.id);

            const response = await userService.updateUser(formData.id, dataToUpdate);
            console.log("Réponse de l'API:", response);

            showNotification('Utilisateur modifié avec succès', 'success');
            setOpenDialog(false);
            fetchUsers();
            setFormData({
                name: '',
                email: '',
                role: 'employee',
                number: '',
                password: '',
            });
            setConfirmPassword('');
            setSelectedUserId(null);
            setIsEditMode(false);
        } catch (error: any) {
            console.error("Erreur lors de la modification de l'utilisateur:", error);
            showNotification(error.message || "Une erreur est survenue lors de la modification de l'utilisateur", 'error');
        } finally {
            setLoading(false);
        }
    };

    // Gestionnaires d'événements pour le menu d'actions
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, userId: number): void => {
        setAnchorEl(event.currentTarget);
        setSelectedUserId(userId);
    };

    const handleCloseMenu = (): void => {
        setAnchorEl(null);
        // Ne pas réinitialiser selectedUserId ici
    };

    // Fonction pour fermer le dialogue et réinitialiser les états
    const handleCloseDialog = (): void => {
        setOpenDialog(false);
        setFormData({
            name: '',
            email: '',
            role: 'employee',
            number: '',
            password: '',
        });
        setConfirmPassword('');
        setSelectedUserId(null);
        setIsEditMode(false);
    };

    // Trouver le nom de l'utilisateur à supprimer
    const userToDeleteName = userToDelete ? users.find((user) => user.id === userToDelete)?.name : '';

    return (
        <AppLayout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Fil d'Ariane */}
                <Box sx={{ mb: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" href="/1">
                            Tableau de bord
                        </Link>
                        <Typography color="text.primary">Utilisateurs</Typography>
                    </Breadcrumbs>
                </Box>

                {/* En-tête de la page */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold">
                            Utilisateurs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Gérez les utilisateurs de votre espace de travail
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateDialog}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 1,
                            px: 2,
                            bgcolor: '#16A249',
                            '&:hover': {
                                bgcolor: '#138a3c',
                            },
                        }}
                    >
                        Créer un utilisateur
                    </Button>
                </Box>

                {/* Tableau des utilisateurs */}
                <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rôle</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Numéro</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="medium">{user.name}</Typography>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'success'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{user.number}</TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={(e) => handleOpenMenu(e, user.id!)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                            Aucun utilisateur trouvé
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Menu d'actions */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
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
                    <MenuItem
                        onClick={() => {
                            const user = users.find((u) => u.id === selectedUserId);
                            if (user) {
                                handleOpenEditDialog(user);
                                handleCloseMenu();
                            }
                        }}
                    >
                        <ListItemIcon>
                            <EditIcon fontSize="small" sx={{ color: '#16A249' }} />
                        </ListItemIcon>
                        <ListItemText primary="Modifier" />
                    </MenuItem>
                    <MenuItem onClick={handleOpenConfirmDialog}>
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primary="Supprimer" sx={{ color: 'error.main' }} />
                    </MenuItem>
                </Menu>

                {/* Dialogue de création/modification d'utilisateur */}
                <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                    <DialogTitle>{isEditMode ? "Modifier l'utilisateur" : 'Créer un utilisateur'}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <TextField
                                required
                                fullWidth
                                id="name"
                                label="Nom complet"
                                name="name"
                                value={formData.name}
                                onChange={handleTextFieldChange}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: '#16A249' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#16A249',
                                    },
                                }}
                            />

                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleTextFieldChange}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: '#16A249' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#16A249',
                                    },
                                }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel id="role-select-label">Rôle</InputLabel>
                                <Select
                                    labelId="role-select-label"
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    label="Rôle"
                                    onChange={handleSelectChange}
                                    disabled={loading}
                                    sx={{
                                        borderRadius: 2,
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                    }}
                                >
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="manager">Manager</MenuItem>
                                    <MenuItem value="employee">Employé</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                id="number"
                                label="Numéro de téléphone"
                                name="number"
                                value={formData.number || ''}
                                onChange={handleTextFieldChange}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon sx={{ color: '#16A249' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#16A249',
                                        },
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: '#16A249',
                                    },
                                }}
                            />

                            {!isEditMode ? (
                                // Champs de mot de passe pour la création
                                <>
                                    <TextField
                                        required
                                        fullWidth
                                        id="password"
                                        label="Mot de passe"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password || ''}
                                        onChange={handleTextFieldChange}
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <WorkIcon sx={{ color: '#16A249' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: '#16A249' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#16A249',
                                            },
                                            // Masquer le bouton natif du navigateur
                                            '& input::-ms-reveal, & input::-ms-clear': {
                                                display: 'none',
                                            },
                                            '& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button':
                                                {
                                                    visibility: 'hidden',
                                                    display: 'none !important',
                                                    pointerEvents: 'none',
                                                    height: '0',
                                                    width: '0',
                                                    margin: '0',
                                                },
                                        }}
                                    />

                                    <TextField
                                        required
                                        fullWidth
                                        id="confirmPassword"
                                        label="Confirmer le mot de passe"
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <WorkIcon sx={{ color: '#16A249' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#16A249',
                                            },
                                            // Masquer le bouton natif du navigateur
                                            '& input::-ms-reveal, & input::-ms-clear': {
                                                display: 'none',
                                            },
                                            '& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button':
                                                {
                                                    visibility: 'hidden',
                                                    display: 'none !important',
                                                    pointerEvents: 'none',
                                                    height: '0',
                                                    width: '0',
                                                    margin: '0',
                                                },
                                        }}
                                    />
                                </>
                            ) : (
                                // Champ de mot de passe optionnel pour la modification
                                <>
                                    <TextField
                                        fullWidth
                                        id="password"
                                        label="Nouveau mot de passe (optionnel)"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password || ''}
                                        onChange={handleTextFieldChange}
                                        disabled={loading}
                                        helperText="Laissez vide pour conserver le mot de passe actuel"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <WorkIcon sx={{ color: '#16A249' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                        sx={{ color: '#16A249' }}
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#16A249',
                                                },
                                            },
                                            '& .MuiInputLabel-root.Mui-focused': {
                                                color: '#16A249',
                                            },
                                            // Masquer le bouton natif du navigateur
                                            '& input::-ms-reveal, & input::-ms-clear': {
                                                display: 'none',
                                            },
                                            '& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button':
                                                {
                                                    visibility: 'hidden',
                                                    display: 'none !important',
                                                    pointerEvents: 'none',
                                                    height: '0',
                                                    width: '0',
                                                    margin: '0',
                                                },
                                        }}
                                    />

                                    {formData.password && formData.password.trim() !== '' && (
                                        <TextField
                                            required
                                            fullWidth
                                            id="confirmPassword"
                                            label="Confirmer le nouveau mot de passe"
                                            name="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={loading}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <WorkIcon sx={{ color: '#16A249' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 3,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#16A249',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#16A249',
                                                    },
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: '#16A249',
                                                },
                                                // Masquer le bouton natif du navigateur
                                                '& input::-ms-reveal, & input::-ms-clear': {
                                                    display: 'none',
                                                },
                                                '& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button':
                                                    {
                                                        visibility: 'hidden',
                                                        display: 'none !important',
                                                        pointerEvents: 'none',
                                                        height: '0',
                                                        width: '0',
                                                        margin: '0',
                                                    },
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleCloseDialog}
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                color: '#6B7280',
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
                            onClick={isEditMode ? handleUpdateUser : handleCreateUser}
                            variant="contained"
                            color="success"
                            disabled={loading}
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
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : isEditMode ? 'Mettre à jour' : 'Créer le compte'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialogue de confirmation de suppression */}
                <Dialog
                    open={openConfirmDialog}
                    onClose={handleCloseConfirmDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{'Confirmer la suppression'}</DialogTitle>
                    <DialogContent>
                        <Typography variant="body1">
                            {userToDeleteName
                                ? `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDeleteName}" ? Cette action est irréversible.`
                                : 'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={handleCloseConfirmDialog}
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                color: '#6B7280',
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
                            onClick={handleDeleteUser}
                            variant="contained"
                            color="error"
                            disabled={loading}
                            autoFocus
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1,
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Confirmer la suppression'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar pour les notifications */}
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.severity}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                        }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Container>
        </AppLayout>
    );
};

export default CreateUser;
