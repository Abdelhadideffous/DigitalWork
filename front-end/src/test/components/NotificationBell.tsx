import React, { useState, useEffect } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemText,
    Button,
    Tooltip,
    Fade,
    Paper,
    Stack,
} from '@mui/material';
import {
    Bell,
    Check,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Info,
    XCircle,
} from 'lucide-react';
import axios from '../../config/axios';
import { useNavigate } from 'react-router-dom';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [loading, setLoading] = useState(false);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/test/login');
                return;
            }

            setLoading(true);
            const response = await axios.get('/notifications', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Notifications reçues:', response.data);
            setNotifications(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            if (error.response?.status === 401) {
                navigate('/test/login');
            }
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate('/test/login');
            return;
        }
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (id: number) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/test/login');
                return;
            }

            await axios.post(`/notifications/${id}/mark-as-read`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, is_read: true } : notification
            ));
        } catch (error) {
            console.error('Erreur lors du marquage de la notification comme lue:', error);
            if (error.response?.status === 401) {
                navigate('/test/login');
            }
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/test/login');
                return;
            }

            await axios.post('/notifications/mark-all-as-read', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
        } catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
            if (error.response?.status === 401) {
                navigate('/test/login');
            }
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                navigate('/test/login');
                return;
            }

            await axios.delete(`/notifications/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNotifications(notifications.filter(notification => notification.id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression de la notification:', error);
            if (error.response?.status === 401) {
                navigate('/test/login');
            }
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'À l\'instant';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
        } else {
            return date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 size={20} color="#16A249" />;
            case 'warning':
                return <AlertCircle size={20} color="#F59E0B" />;
            case 'error':
                return <XCircle size={20} color="#EF4444" />;
            default:
                return <Info size={20} color="#3B82F6" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return '#16A249';
            case 'warning':
                return '#F59E0B';
            case 'error':
                return '#EF4444';
            default:
                return '#3B82F6';
        }
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton
                    color="inherit"
                    onClick={handleClick}
                    sx={{
                        mr: 1,
                        '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        color="error"
                        sx={{
                            '& .MuiBadge-badge': {
                                backgroundColor: '#EF4444',
                                color: 'white',
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <Bell size={20} strokeWidth={1.5} />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 480,
                        mt: 1.5,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        borderRadius: 2,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={markAllAsRead}
                            startIcon={<Check size={16} />}
                            sx={{
                                color: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(22, 162, 73, 0.08)',
                                },
                            }}
                        >
                            Tout marquer comme lu
                        </Button>
                    )}
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                    {loading ? (
                        <ListItem>
                            <ListItemText
                                primary="Chargement des notifications..."
                                sx={{ textAlign: 'center', color: 'text.secondary' }}
                            />
                        </ListItem>
                    ) : notifications.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="Aucune notification"
                                sx={{ textAlign: 'center', color: 'text.secondary' }}
                            />
                        </ListItem>
                    ) : (
                        notifications.map((notification) => (
                            <React.Fragment key={notification.id}>
                                <ListItem
                                    sx={{
                                        p: 2,
                                        bgcolor: notification.is_read ? 'inherit' : 'rgba(22, 162, 73, 0.04)',
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                                        transition: 'background-color 0.2s',
                                    }}
                                >
                                    <Stack spacing={1} sx={{ width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getTypeIcon(notification.type)}
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    color: getTypeColor(notification.type),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {notification.title}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ pl: 3 }}
                                        >
                                            {notification.message}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 3 }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {formatDate(notification.created_at)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {!notification.is_read && (
                                                    <Tooltip title="Marquer comme lu">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => markAsRead(notification.id)}
                                                            sx={{
                                                                color: 'primary.main',
                                                                '&:hover': {
                                                                    backgroundColor: 'rgba(22, 162, 73, 0.08)',
                                                                },
                                                            }}
                                                        >
                                                            <Check size={16} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Supprimer">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                                            },
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Menu>
        </>
    );
};

export default NotificationBell; 