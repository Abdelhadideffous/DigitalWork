'use client';

import {
    Avatar,
    Box,
    Button,
    Card,
    CardHeader,
    Chip,
    Divider,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowRightIcon, EditIcon, EyeIcon, FilterIcon, PlusIcon, TrashIcon } from 'lucide-react';
import type React from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    number?: string;
    avatar?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
        case 'admin':
            return { color: 'error', label: 'Admin' };
        case 'manager':
            return { color: 'warning', label: 'Manager' };
        case 'employee':
            return { color: 'success', label: 'Employé' };
        default:
            return { color: 'default', label: role || 'Utilisateur' };
    }
};

interface UsersTableProps {
    users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
    const theme = useTheme();

    // Fonction pour obtenir les initiales d'un nom
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Fonction pour obtenir une couleur aléatoire pour l'avatar
    const getAvatarColor = (name: string) => {
        const colors = [
            '#1976d2',
            '#2196f3',
            '#03a9f4',
            '#00bcd4',
            '#009688',
            '#4caf50',
            '#8bc34a',
            '#cddc39',
            '#ffeb3b',
            '#ffc107',
            '#ff9800',
            '#ff5722',
            '#f44336',
            '#e91e63',
            '#9c27b0',
            '#673ab7',
        ];

        // Utiliser le nom pour générer un index de couleur
        const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        return colors[charSum % colors.length];
    };

    return (
        <StyledCard>
            <CardHeader
                title={
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Utilisateurs récents
                    </Typography>
                }
                subheader="Liste des utilisateurs récemment ajoutés"
                action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<FilterIcon />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                            }}
                        >
                            Filtrer
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlusIcon />}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                            }}
                        >
                            Ajouter
                        </Button>
                    </Box>
                }
            />
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Rôle</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Numéro</TableCell>
                            <TableCell sx={{ fontWeight: 600 }} align="right">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.length > 0 ? (
                            users.map((user) => {
                                const initials = getInitials(user.name);
                                const avatarColor = getAvatarColor(user.name);
                                const roleInfo = getRoleColor(user.role || 'employee');

                                return (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 36,
                                                        height: 36,
                                                        bgcolor: avatarColor,
                                                        fontSize: '0.9rem',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {initials}
                                                </Avatar>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {user.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip label={roleInfo.label} color={roleInfo.color as any} size="small" sx={{ fontWeight: 500 }} />
                                        </TableCell>
                                        <TableCell>{user.number || '-'}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Tooltip title="Voir les détails">
                                                    <IconButton size="small" sx={{ mr: 0.5 }}>
                                                        <EyeIcon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Modifier">
                                                    <IconButton size="small" sx={{ mr: 0.5 }}>
                                                        <EditIcon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Supprimer">
                                                    <IconButton size="small" color="error">
                                                        <TrashIcon size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Aucun utilisateur trouvé
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                    endIcon={<ArrowRightIcon />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                    }}
                >
                    Voir tous les utilisateurs
                </Button>
            </Box>
        </StyledCard>
    );
};

export default UsersTable;
