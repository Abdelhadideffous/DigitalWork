"use client"

import React, { useState } from "react"
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  InputBase,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
} from "@mui/material"
import { styled, alpha } from "@mui/material/styles"
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronDownIcon,
  HomeIcon,
  FolderIcon,
  UsersIcon,
  InfoIcon as AnalyticsIcon,
  CalendarIcon,
  MessageCircleIcon as MessageIcon,
  FileTypeIcon as DocumentIcon,
  HandHelpingIcon as HelpIcon,
  ChevronRightIcon,
  DoorClosedIcon as CloseIcon,
} from "lucide-react"

const drawerWidth = 260

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
})

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
}))

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== "open" })(
    ({ theme, open }: { theme: any; open?: boolean }) => ({
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: "nowrap",
      boxSizing: "border-box",
      ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      }),
    }) as any
  );
  
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }: any) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}))

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}))

const menuItems = [
  { text: "Tableau de bord", icon: <HomeIcon size={20} />, path: "/dashboard" },
  { text: "Projets", icon: <FolderIcon size={20} />, path: "/projects" },
  { text: "Utilisateurs", icon: <UsersIcon size={20} />, path: "/users" },
  { text: "Analytiques", icon: <AnalyticsIcon size={20} />, path: "/analytics" },
  { text: "Calendrier", icon: <CalendarIcon size={20} />, path: "/calendar" },
  { text: "Messages", icon: <MessageIcon size={20} />, path: "/messages" },
  { text: "Documents", icon: <DocumentIcon size={20} />, path: "/documents" },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [open, setOpen] = useState(!isMobile)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setOpen(!open)
    }
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleItemClick = (text: string) => {
    if (expandedItem === text) {
      setExpandedItem(null)
    } else {
      setExpandedItem(text)
    }
  }

  const drawer = (
    <>
      <DrawerHeader>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 32,
              height: 32,
              mr: 1,
            }}
          >
            A
          </Avatar>
          {(open || isMobile) && (
            <Typography variant="subtitle1" fontWeight="bold">
              Admin Panel
            </Typography>
          )}
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          {isMobile ? <CloseIcon size={20} /> : open ? <ChevronRightIcon size={20} /> : <MenuIcon size={20} />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  borderRadius: "8px",
                  mx: 1,
                  my: 0.5,
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  },
                  ...(item.text === "Tableau de bord" && {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }),
                }}
                onClick={() => handleItemClick(item.text)}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: item.text === "Tableau de bord" ? theme.palette.primary.main : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(open || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      "& .MuiTypography-root": {
                        fontWeight: item.text === "Tableau de bord" ? 600 : 400,
                      },
                    }}
                  />
                )}
                {(open || isMobile) && ["Projets", "Utilisateurs"].includes(item.text) && (
                  <ChevronDownIcon
                    size={16}
                    style={{
                      transform: expandedItem === item.text ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
            {["Projets", "Utilisateurs"].includes(item.text) && (open || isMobile) && (
              <Collapse in={expandedItem === item.text} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.text === "Projets"
                    ? ["Tous les projets", "Ajouter un projet", "Catégories"].map((text) => (
                        <ListItemButton key={text} sx={{ pl: 4, py: 0.5 }}>
                          <ListItemText primary={text} />
                        </ListItemButton>
                      ))
                    : ["Tous les utilisateurs", "Ajouter un utilisateur", "Rôles"].map((text) => (
                        <ListItemButton key={text} sx={{ pl: 4, py: 0.5 }}>
                          <ListItemText primary={text} />
                        </ListItemButton>
                      ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      <Divider sx={{ mt: "auto" }} />
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
              }}
            >
              <HelpIcon size={20} />
            </ListItemIcon>
            {(open || isMobile) && <ListItemText primary="Aide & Support" sx={{ opacity: open ? 1 : 0 }} />}
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                justifyContent: "center",
              }}
            >
              <SettingsIcon size={20} />
            </ListItemIcon>
            {(open || isMobile) && <ListItemText primary="Paramètres" sx={{ opacity: open ? 1 : 0 }} />}
          </ListItemButton>
        </ListItem>
      </List>
    </>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <StyledAppBar position="fixed" open={open && !isMobile} elevation={0} color="default">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Search>
            <SearchIconWrapper>
              <SearchIcon size={20} />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Rechercher..." inputProps={{ "aria-label": "search" }} />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tooltip title="Notifications">
              <IconButton size="large" color="inherit">
                <Badge badgeContent={4} color="error">
                  <BellIcon size={20} />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Paramètres">
              <IconButton size="large" color="inherit">
                <SettingsIcon size={20} />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                ml: 2,
                borderRadius: 2,
                p: 1,
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.black, 0.05),
                },
              }}
              onClick={handleProfileMenuOpen}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>JD</Avatar>
              <Box sx={{ ml: 1, display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle2" component="span">
                  John Doe
                </Typography>
                <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                  Admin
                </Typography>
              </Box>
              <ChevronDownIcon size={16} style={{ marginLeft: 8 }} />
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Desktop drawer */}
      {!isMobile && (
        <StyledDrawer variant="permanent" open={open}>
          {drawer}
        </StyledDrawer>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Profile menu */}
      <Menu
        anchorEl={anchorEl}
        id="profile-menu"
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Avatar /> Mon profil
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <SettingsIcon size={20} style={{ marginRight: 8 }} /> Paramètres du compte
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <LogOutIcon size={20} style={{ marginRight: 8 }} /> Se déconnecter
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { md: `calc(100% - ${open ? drawerWidth : 64}px)` },
          ml: { md: `${open ? drawerWidth : 64}px` },
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default DashboardLayout
