"use client"

import type React from "react"

import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  CheckSquare,
  Users,
  Calendar,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"
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
  Menu as MuiMenu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material"
import { useState } from "react"
import { authApi } from "../login/api"
import NotificationBell from "../components/NotificationBell"

interface AppLayoutProps {
  children: React.ReactNode
}

const iconProps = {
  size: 20,
  strokeWidth: 1.5,
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const drawerWidth = 240
  const [mobileOpen, setMobileOpen] = useState(false)

  // État pour le menu de profil
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openProfileMenu = Boolean(anchorEl)

  // Structure du menu avec icônes appropriées
  const menuItems = [
    { text: "Tableau de bord", icon: <LayoutDashboard {...iconProps} />, path: "/test/1" },
    { text: "Projets", icon: <FolderKanban {...iconProps} />, path: "/test/2" },
    { text: "Expressions de Besoin", icon: <ClipboardList {...iconProps} />, path: "/test/3" },
    { text: "Tâches", icon: <CheckSquare {...iconProps} />, path: "/test/4" },
    { text: "Équipe", icon: <Users {...iconProps} />, path: "/test/5" },
    { text: "Calendrier", icon: <Calendar {...iconProps} />, path: "/test/6" },
    { text: "Rapports", icon: <BarChart3 {...iconProps} />, path: "/test/7" },
  ]

  // Détection de l'élément actif à partir de l'URL
  const getActiveIndex = () => {
    return menuItems.findIndex((item) => window.location.pathname === item.path)
  }

  const activeIndex = getActiveIndex()

  const handleNavigation = (path: string) => {
    window.location.href = path
  }

  // Fonction de déconnexion
  const handleLogout = async () => {
    setAnchorEl(null)

    // Récupérer le token depuis sessionStorage
    const token = sessionStorage.getItem("token")

    if (token) {
      try {
        // Appeler l'API de déconnexion
        await authApi.logout(token)
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error)
      }
    }

    // Supprimer les données de l'utilisateur du sessionStorage
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("user")

    // Rediriger vers la page de connexion
    window.location.href = "/test/login"
  }

  // Contenu de la sidebar
  const drawerContent = (
    <>
      <Divider />

      {/* Liste des éléments du menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(22, 162, 73, 0.1)" },
                ...(activeIndex === index && {
                  bgcolor: "rgba(22, 162, 73, 0.1)",
                  color: "#16A249",
                  "& .MuiListItemIcon-root": { color: "#16A249" },
                }),
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: "auto" }} />
    </>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* AppBar - Barre de navigation supérieure */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          {/* Bouton menu pour mobile */}
          <IconButton
            color="inherit"
            aria-label="ouvrir le menu"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <Menu {...iconProps} />
          </IconButton>

          {/* Logo et titre */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <img
              src="/mobilis.png"
              alt="Mobilis logo"
              style={{ width: 32, height: 32, marginRight: 8, borderRadius: 1 }}
            />
            <Typography variant="h6" noWrap component="div" sx={{ fontSize: 18, fontWeight: 600 }}>
              DigitalWork
            </Typography>
          </Box>

          {/* Espace flexible pour pousser les éléments suivants à droite */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Composant de notification */}
          {sessionStorage.getItem('token') && <NotificationBell />}

          {/* Icônes de la barre d'outils
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <Bell {...iconProps} />
            </Badge>
          </IconButton> */}

          {/* Bouton de profil avec menu */}
          <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
            <IconButton
              onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
              size="small"
              sx={{ ml: 2 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#16A249" }}>M</Avatar>
            </IconButton>
          </Box>
          <MuiMenu
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            disablePortal
            disableScrollLock
            disableAutoFocusItem
          >
            <MenuItem
              onClick={() => {
                setAnchorEl(null) // Close the menu
                window.location.href = "/profile" // mazal madirth page profile
              }}
            >
              <ListItemIcon>
                <User size={18} strokeWidth={1.5} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>

            <MenuItem
              onClick={() => {
                setAnchorEl(null)
                window.location.href = "/test/9"
              }}
            >
              <ListItemIcon>
                <Settings size={18} strokeWidth={1.5} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogOut size={18} strokeWidth={1.5} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </MuiMenu>
        </Toolbar>
      </AppBar>

      {/* Drawer pour mobile - s'ouvre temporairement */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
          disableEnforceFocus: true,
          disableAutoFocus: true,
          disablePortal: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Drawer permanent pour desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          },
        }}
        open
      >
        <Toolbar /> {/* Espace pour compenser la hauteur de l'AppBar */}
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          p: 0,
          overflow: "auto",
        }}
      >
        <Toolbar /> {/* Espace pour compenser la hauteur de l'AppBar */}
        {children}
      </Box>
    </Box>
  )
}

export default AppLayout