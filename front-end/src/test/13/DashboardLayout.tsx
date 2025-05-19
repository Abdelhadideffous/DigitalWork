import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  useMediaQuery,
  Avatar,
  InputBase,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#FFFFFF',
  color: theme.palette.text.primary,
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      backgroundColor: theme.palette.background.default,
      borderRight: `1px solid ${theme.palette.divider}`,
      boxSizing: 'border-box',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const SearchBox = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.text.primary,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true },
    { text: 'Statistiques', icon: <BarChartIcon /> },
    { text: 'Projets', icon: <FolderIcon /> },
    { text: 'Tâches', icon: <AssignmentIcon /> },
    { text: 'Équipe', icon: <PeopleIcon /> },
    { text: 'Paramètres', icon: <SettingsIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <StyledAppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{
              marginRight: 2,
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Tableau de bord
          </Typography>
          <SearchBox>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Rechercher..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBox>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsOpen}
              aria-controls="notifications-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={4} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="notifications-menu"
              anchorEl={notificationsAnchorEl}
              keepMounted
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                elevation: 2,
                sx: { 
                  width: 320,
                  maxHeight: 400,
                  borderRadius: 2,
                  mt: 1.5
                },
              }}
            >
              <Typography sx={{ p: 2, fontWeight: 'bold' }}>Notifications</Typography>
              <Divider />
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="body2">Nouvelle tâche assignée</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="body2">Projet mis à jour</Typography>
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                <Typography variant="body2">Réunion dans 30 minutes</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleNotificationsClose} sx={{ justifyContent: 'center' }}>
                <Typography variant="body2" color="primary">Voir toutes les notifications</Typography>
              </MenuItem>
            </Menu>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>U</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 2,
                sx: { 
                  width: 200,
                  borderRadius: 2,
                  mt: 1.5
                },
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main }}>U</Avatar>
                </ListItemIcon>
                <ListItemText primary="Mon profil" />
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Paramètres" />
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Déconnexion" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Box
              component="div"
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                mr: 1,
              }}
            >
              D
            </Box>
            {open && (
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ fontWeight: 'bold' }}
              >
                Dashboard
              </Typography>
            )}
          </Box>
        </Toolbar>
        <Divider />
        <List component="nav">
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: '0 24px 24px 0',
                  mr: 1,
                  ml: 1,
                  mt: 0.5,
                  ...(item.active && {
                    backgroundColor: theme.palette.primary.light,
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiTypography-root': {
                      fontWeight: 'bold',
                      color: theme.palette.primary.main,
                    },
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: item.active ? theme.palette.primary.main : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: item.active ? 'bold' : 'normal',
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </StyledDrawer>
      <Box
        component="main"
        sx={{
          backgroundColor: theme.palette.background.default,
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          pt: 8,
        }}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
