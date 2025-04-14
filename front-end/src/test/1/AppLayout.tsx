'use client';

import type React from 'react';

import {
    CalendarMonth as CalendarIcon,
    Dashboard as DashboardIcon,
    Folder as FolderIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    Message as MessageIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Assessment as ReportsIcon,
    Settings as SettingsIcon,
    Task as TaskIcon,
    People as TeamIcon,
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Badge,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useState } from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
    const drawerWidth = 240;
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // État pour le menu de profil
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openProfileMenu = Boolean(anchorEl);

    // Structure du menu avec icônes appropriées
    const menuItems = [
        { text: 'Tableau de bord', icon: <DashboardIcon />, active: false },
        { text: 'Projets', icon: <FolderIcon />, active: false },
        { text: 'Tâches', icon: <TaskIcon />, active: false },
        { text: 'Équipe', icon: <TeamIcon />, active: true },
        { text: 'Calendrier', icon: <CalendarIcon />, active: false },
        { text: 'Rapports', icon: <ReportsIcon />, active: false },
        { text: 'Messages', icon: <MessageIcon />, active: false },
    ];

    // Contenu de la sidebar
    const drawerContent = (
        <>
            {isMobile && (
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#16A249',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1,
                        }}
                    >
                        <DashboardIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" noWrap component="div" sx={{ fontSize: 18, fontWeight: 600 }}>
                        DigitalWork
                    </Typography>
                </Box>
            )}
            <Divider />

            {/* Liste des éléments du menu */}
            <List sx={{ px: 2, py: 1 }}>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            sx={{
                                borderRadius: 1,
                                '&:hover': { bgcolor: 'rgba(22, 162, 73, 0.1)' },
                                ...(item.active && {
                                    bgcolor: 'rgba(22, 162, 73, 0.1)',
                                    color: '#16A249',
                                    '& .MuiListItemIcon-root': { color: '#16A249' },
                                }),
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ mt: 'auto' }} />
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
            {/* AppBar - Barre de navigation supérieure */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
            >
                <Toolbar>
                    {/* Bouton menu pour mobile */}
                    <IconButton
                        color="inherit"
                        aria-label="ouvrir le menu"
                        edge="start"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Logo et titre */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                bgcolor: '#16A249',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1,
                            }}
                        >
                            <DashboardIcon sx={{ color: 'white', fontSize: 20 }} />
                        </Box>
                        <Typography variant="h6" noWrap component="div" sx={{ fontSize: 18, fontWeight: 600 }}>
                            DigitalWork
                        </Typography>
                    </Box>

                    {/* Espace flexible pour pousser les éléments suivants à droite */}
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Icônes de la barre d'outils */}
                    <IconButton color="inherit" sx={{ mr: 1 }}>
                        <Badge badgeContent={4} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    {/* Bouton de profil avec menu */}
                    <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                        <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#16A249' }}>M</Avatar>
                        </IconButton>
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={openProfileMenu}
                        onClose={() => setAnchorEl(null)}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        // Ajout des propriétés pour résoudre l'erreur aria-hidden
                        disablePortal
                        disableScrollLock
                        disableAutoFocusItem
                    >
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            <ListItemIcon>
                                <PersonIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Settings" />
                        </MenuItem>
                        <MenuItem onClick={() => setAnchorEl(null)}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Drawer pour mobile - s'ouvre temporairement */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                ModalProps={{
                    keepMounted: true, // Meilleure performance sur mobile
                    // Ajout des propriétés pour résoudre l'erreur aria-hidden
                    disableEnforceFocus: true,
                    disableAutoFocus: true,
                    disablePortal: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Drawer permanent pour desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                }}
                open
            >
                <Toolbar /> {/* Espace pour compenser la hauteur de l'AppBar */}
                {drawerContent}
            </Drawer>

            {/* Contenu principal */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                    p: 0,
                    overflow: 'auto',
                }}
            >
                <Toolbar /> {/* Espace pour compenser la hauteur de l'AppBar */}
                {children}
            </Box>
        </Box>
    );
};

export default AppLayout;
