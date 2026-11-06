"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material"
import {
  AlertCircle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Filter,
  Info,
  RefreshCw,
  Trash2,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import axios from "./axios"
import { alpha } from "@mui/material/styles"
import AppLayout from "../../components/layout/AppLayout"

// Couleur verte personnalisée
const GREEN_COLOR = "#16A249"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

interface DeleteDialogProps {
  open: boolean
  title: string
  content: string
  onClose: () => void
  onConfirm: () => void
  isSingle?: boolean
  loading?: boolean
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  title,
  content,
  onClose,
  onConfirm,
  isSingle = true,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          maxWidth: 400,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              bgcolor: alpha("#f44336", 0.1),
              color: "#f44336",
              width: 40,
              height: 40,
            }}
          >
            <AlertTriangle size={22} />
          </Avatar>
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
          }}
        >
          {loading ? "Suppression..." : isSingle ? "Supprimer" : "Tout supprimer"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `notification-tab-${index}`,
    "aria-controls": `notification-tabpanel-${index}`,
  }
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  // États de chargement individuels pour chaque action
  const [markAsReadLoading, setMarkAsReadLoading] = useState<number | null>(null)
  const [markAllAsReadLoading, setMarkAllAsReadLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteAllLoading, setDeleteAllLoading] = useState(false)

  const [tabValue, setTabValue] = useState(0)
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null)
  const [timeFilter, setTimeFilter] = useState("all")
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
  }>({
    open: false,
    message: "",
  })

  // États pour la boîte de dialogue de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)

  const navigate = useNavigate()
  const theme = useTheme()

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      setLoading(true)
      const response = await axios.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log("Notifications reçues:", response.data)
      setNotifications(response.data)
    } catch (error: any) {
      console.error("Erreur lors de la récupération des notifications:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/login")
      }
      setNotifications([])
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des notifications",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget)
  }

  const handleFilterClose = () => {
    setFilterAnchorEl(null)
  }

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter)
    handleFilterClose()
  }

  const markAsRead = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      setMarkAsReadLoading(id)
      await axios.post(
        `/notifications/${id}/mark-as-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setNotifications(
        notifications.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification,
        ),
      )
      setSnackbar({
        open: true,
        message: "Notification marquée comme lue",
      })
    } catch (error: any) {
      console.error("Erreur lors du marquage de la notification comme lue:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors du marquage de la notification",
      })
    } finally {
      setMarkAsReadLoading(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      setMarkAllAsReadLoading(true)
      await axios.post(
        "/notifications/mark-all-as-read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setNotifications(notifications.map((notification) => ({ ...notification, is_read: true })))
      setSnackbar({
        open: true,
        message: "Toutes les notifications ont été marquées comme lues",
      })
    } catch (error: any) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors du marquage des notifications",
      })
    } finally {
      setMarkAllAsReadLoading(false)
    }
  }

  // Ouvrir la boîte de dialogue de suppression pour une notification
  const openDeleteDialog = (id: number) => {
    setNotificationToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Ouvrir la boîte de dialogue de suppression pour toutes les notifications
  const openDeleteAllDialog = () => {
    setDeleteAllDialogOpen(true)
  }

  // Fermer les boîtes de dialogue
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setNotificationToDelete(null)
  }

  const closeDeleteAllDialog = () => {
    setDeleteAllDialogOpen(false)
  }

  const deleteNotification = async () => {
    if (notificationToDelete === null) return

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      setDeleteLoading(true)
      await axios.delete(`/notifications/${notificationToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications(notifications.filter((notification) => notification.id !== notificationToDelete))
      setSnackbar({
        open: true,
        message: "Notification supprimée avec succès",
      })
      closeDeleteDialog()
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la notification:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression de la notification",
      })
      closeDeleteDialog()
    } finally {
      setDeleteLoading(false)
    }
  }

  const deleteAllNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/login")
        return
      }

      setDeleteAllLoading(true)
      await axios.delete("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications([])
      setSnackbar({
        open: true,
        message: "Toutes les notifications ont été supprimées",
      })
      closeDeleteAllDialog()
    } catch (error: any) {
      console.error("Erreur lors de la suppression de toutes les notifications:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression des notifications",
      })
      closeDeleteAllDialog()
    } finally {
      setDeleteAllLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "À l'instant"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`
    } else {
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={20} />
      case "warning":
        return <AlertCircle size={20} />
      case "error":
        return <XCircle size={20} />
      default:
        return <Info size={20} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return GREEN_COLOR
      case "warning":
        return theme.palette.warning.main
      case "error":
        return theme.palette.error.main
      default:
        return theme.palette.info.main
    }
  }

  const getTypeBackground = (type: string) => {
    switch (type) {
      case "success":
        return alpha(GREEN_COLOR, 0.12)
      case "warning":
        return alpha(theme.palette.warning.main, 0.12)
      case "error":
        return alpha(theme.palette.error.main, 0.12)
      default:
        return alpha(theme.palette.info.main, 0.12)
    }
  }

  // Filtrer les notifications en fonction de l'onglet actif et du filtre de temps
  const filteredNotifications = notifications.filter((notification) => {
    // Filtre par type
    if (tabValue === 0) {
      // Toutes
    } else if (tabValue === 1 && notification.is_read) {
      // Non lues
      return false
    } else if (tabValue === 2 && notification.type !== "info") {
      // Informations
      return false
    } else if (tabValue === 3 && notification.type !== "success") {
      // Succès
      return false
    } else if (tabValue === 4 && notification.type !== "warning") {
      // Avertissements
      return false
    } else if (tabValue === 5 && notification.type !== "error") {
      // Erreurs
      return false
    }

    // Filtre par temps
    if (timeFilter === "all") {
      return true
    }

    const notifDate = new Date(notification.created_at)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay())
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    if (timeFilter === "today" && notifDate < today) {
      return false
    } else if (timeFilter === "yesterday" && (notifDate < yesterday || notifDate >= today)) {
      return false
    } else if (timeFilter === "thisWeek" && notifDate < thisWeekStart) {
      return false
    } else if (timeFilter === "thisMonth" && notifDate < thisMonthStart) {
      return false
    }

    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length
  const infoCount = notifications.filter((n) => n.type === "info").length
  const successCount = notifications.filter((n) => n.type === "success").length
  const warningCount = notifications.filter((n) => n.type === "warning").length
  const errorCount = notifications.filter((n) => n.type === "error").length

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "today":
        return "Aujourd'hui"
      case "yesterday":
        return "Hier"
      case "thisWeek":
        return "Cette semaine"
      case "thisMonth":
        return "Ce mois-ci"
      default:
        return "Tout le temps"
    }
  }

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 2,
              backgroundImage: `linear-gradient(135deg, ${alpha(GREEN_COLOR, 0.05)} 0%, ${alpha(GREEN_COLOR, 0.1)} 100%)`,
              border: `1px solid ${alpha(GREEN_COLOR, 0.1)}`,
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: alpha(GREEN_COLOR, 0.1),
                    color: GREEN_COLOR,
                    mr: 2,
                  }}
                >
                  <Bell size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h1" fontWeight="bold" color={GREEN_COLOR}>
                    Centre de Notifications
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Gérez vos notifications et restez informé
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshCw size={16} />}
                  onClick={fetchNotifications}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    borderColor: alpha(GREEN_COLOR, 0.5),
                    color: GREEN_COLOR,
                    "&:hover": {
                      borderColor: GREEN_COLOR,
                      backgroundColor: alpha(GREEN_COLOR, 0.05),
                    },
                  }}
                >
                  Actualiser
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Filter size={16} />}
                  endIcon={<ChevronDown size={14} />}
                  onClick={handleFilterClick}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    borderColor: alpha(GREEN_COLOR, 0.5),
                    color: GREEN_COLOR,
                    "&:hover": {
                      borderColor: GREEN_COLOR,
                      backgroundColor: alpha(GREEN_COLOR, 0.05),
                    },
                  }}
                >
                  {getTimeFilterLabel()}
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      borderRadius: 2,
                      minWidth: 180,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleTimeFilterChange("all")}
                    selected={timeFilter === "all"}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Calendar size={16} />
                      <Typography sx={{ ml: 1.5 }}>Tout le temps</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleTimeFilterChange("today")}
                    selected={timeFilter === "today"}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Calendar size={16} />
                      <Typography sx={{ ml: 1.5 }}>Aujourd'hui</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleTimeFilterChange("yesterday")}
                    selected={timeFilter === "yesterday"}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Calendar size={16} />
                      <Typography sx={{ ml: 1.5 }}>Hier</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleTimeFilterChange("thisWeek")}
                    selected={timeFilter === "thisWeek"}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Calendar size={16} />
                      <Typography sx={{ ml: 1.5 }}>Cette semaine</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleTimeFilterChange("thisMonth")}
                    selected={timeFilter === "thisMonth"}
                    sx={{ py: 1.5 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Calendar size={16} />
                      <Typography sx={{ ml: 1.5 }}>Ce mois-ci</Typography>
                    </Box>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
                {unreadCount > 0 && ` (${unreadCount} non lue${unreadCount !== 1 ? "s" : ""})`}
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {unreadCount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={
                      markAllAsReadLoading ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />
                    }
                    onClick={markAllAsRead}
                    disabled={markAllAsReadLoading}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      backgroundColor: GREEN_COLOR,
                      "&:hover": {
                        backgroundColor: alpha(GREEN_COLOR, 0.9),
                      },
                    }}
                  >
                    {markAllAsReadLoading ? "Marquage..." : "Tout marquer comme lu"}
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    onClick={openDeleteAllDialog}
                    size="small"
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 500,
                    }}
                  >
                    Tout supprimer
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: alpha(GREEN_COLOR, 0.03) }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="notification tabs"
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{
                  style: { backgroundColor: GREEN_COLOR },
                }}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    minHeight: 56,
                  },
                  "& .Mui-selected": {
                    fontWeight: 600,
                    color: `${GREEN_COLOR} !important`,
                  },
                }}
              >
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Bell size={18} />
                      <Typography sx={{ ml: 1 }}>Toutes</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(GREEN_COLOR, 0.1),
                          color: GREEN_COLOR,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {notifications.length}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(0)}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Bell size={18} />
                      <Typography sx={{ ml: 1 }}>Non lues</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(GREEN_COLOR, 0.1),
                          color: GREEN_COLOR,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {unreadCount}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(1)}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Info size={18} />
                      <Typography sx={{ ml: 1 }}>Informations</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {infoCount}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(2)}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CheckCircle2 size={18} />
                      <Typography sx={{ ml: 1 }}>Succès</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(GREEN_COLOR, 0.1),
                          color: GREEN_COLOR,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {successCount}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(3)}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AlertCircle size={18} />
                      <Typography sx={{ ml: 1 }}>Avertissements</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {warningCount}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(4)}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <XCircle size={18} />
                      <Typography sx={{ ml: 1 }}>Erreurs</Typography>
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                          borderRadius: 10,
                          px: 1,
                          py: 0.2,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {errorCount}
                      </Box>
                    </Box>
                  }
                  {...a11yProps(5)}
                />
              </Tabs>
            </Box>

            {loading && (
              <LinearProgress
                sx={{
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: GREEN_COLOR,
                  },
                }}
              />
            )}

            <TabPanel value={tabValue} index={tabValue}>
              <Box sx={{ p: 0 }}>
                {filteredNotifications.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: alpha(GREEN_COLOR, 0.1),
                        color: GREEN_COLOR,
                        mb: 2,
                      }}
                    >
                      <Bell size={40} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom>
                      Aucune notification {tabValue !== 0 ? "dans cette catégorie" : ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                      {tabValue === 1
                        ? "Vous avez lu toutes vos notifications. Revenez plus tard pour voir les nouvelles notifications."
                        : "Vous n'avez pas encore reçu de notifications. Revenez plus tard pour voir les mises à jour."}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshCw size={16} />}
                      onClick={fetchNotifications}
                      sx={{
                        mt: 3,
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: alpha(GREEN_COLOR, 0.5),
                        color: GREEN_COLOR,
                        "&:hover": {
                          borderColor: GREEN_COLOR,
                          backgroundColor: alpha(GREEN_COLOR, 0.05),
                        },
                      }}
                    >
                      Actualiser
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    {filteredNotifications.map((notification) => (
                      <Box
                        key={notification.id}
                        sx={{
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: alpha(GREEN_COLOR, 0.02),
                          },
                        }}
                      >
                        <Box
                          sx={{
                            p: 3,
                            display: "flex",
                            position: "relative",
                            backgroundColor: notification.is_read ? "transparent" : alpha(GREEN_COLOR, 0.03),
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              backgroundColor: getTypeBackground(notification.type),
                              color: getTypeColor(notification.type),
                            }}
                          >
                            {getTypeIcon(notification.type)}
                          </Avatar>

                          <Box sx={{ ml: 2, flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: notification.is_read ? 500 : 600,
                                  color: "text.primary",
                                }}
                              >
                                {notification.title}
                              </Typography>
                              {!notification.is_read && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1.5,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 10,
                                    backgroundColor: alpha(GREEN_COLOR, 0.1),
                                    color: GREEN_COLOR,
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  Non lu
                                </Box>
                              )}
                            </Box>

                            <Typography
                              variant="body1"
                              sx={{
                                color: notification.is_read ? "text.secondary" : "text.primary",
                                mb: 1,
                              }}
                            >
                              {notification.message}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  color: "text.secondary",
                                  fontSize: "0.875rem",
                                }}
                              >
                                <Clock size={14} strokeWidth={2} />
                                <Typography variant="body2" sx={{ ml: 0.5 }}>
                                  {formatDate(notification.created_at)}
                                </Typography>
                              </Box>

                              <Box sx={{ ml: "auto", display: "flex" }}>
                                {!notification.is_read && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={
                                      markAsReadLoading === notification.id ? (
                                        <CircularProgress size={14} color="inherit" />
                                      ) : (
                                        <Check size={14} />
                                      )
                                    }
                                    onClick={() => markAsRead(notification.id)}
                                    disabled={markAsReadLoading === notification.id}
                                    sx={{
                                      mr: 1,
                                      borderRadius: 2,
                                      textTransform: "none",
                                      borderColor: alpha(GREEN_COLOR, 0.5),
                                      color: GREEN_COLOR,
                                      "&:hover": {
                                        borderColor: GREEN_COLOR,
                                        backgroundColor: alpha(GREEN_COLOR, 0.08),
                                      },
                                    }}
                                  >
                                    {markAsReadLoading === notification.id ? "Marquage..." : "Marquer comme lu"}
                                  </Button>
                                )}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  color="error"
                                  startIcon={<Trash2 size={14} />}
                                  onClick={() => openDeleteDialog(notification.id)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    borderColor: theme.palette.error.main,
                                    color: theme.palette.error.main,
                                    "&:hover": {
                                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                                    },
                                  }}
                                >
                                  Supprimer
                                </Button>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </TabPanel>
          </Paper>
        </Box>

        {/* Boîte de dialogue de confirmation pour supprimer une notification */}
        <DeleteDialog
          open={deleteDialogOpen}
          title="Supprimer la notification"
          content="Êtes-vous sûr de vouloir supprimer cette notification ? Cette action est irréversible."
          onClose={closeDeleteDialog}
          onConfirm={deleteNotification}
          isSingle={true}
          loading={deleteLoading}
        />

        {/* Boîte de dialogue de confirmation pour supprimer toutes les notifications */}
        <DeleteDialog
          open={deleteAllDialogOpen}
          title="Supprimer toutes les notifications"
          content="Êtes-vous sûr de vouloir supprimer toutes vos notifications ? Cette action est irréversible."
          onClose={closeDeleteAllDialog}
          onConfirm={deleteAllNotifications}
          isSingle={false}
          loading={deleteAllLoading}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{
              width: "100%",
              borderRadius: 2,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  )
}

export default NotificationsPage
