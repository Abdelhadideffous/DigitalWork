"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material"
import { AlertCircle, AlertTriangle, Bell, Check, CheckCircle2, Info, Trash2, XCircle, Clock, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "../0/axios"
import { alpha } from "@mui/material/styles"

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

interface DeleteDialogProps {
  open: boolean
  notificationId: number | null
  onClose: () => void
  onConfirm: (id: number) => void
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, notificationId, onClose, onConfirm }) => {
  const handleConfirm = () => {
    if (notificationId !== null) {
      onConfirm(notificationId)
    }
  }

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
            Supprimer la notification
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Êtes-vous sûr de vouloir supprimer cette notification ? Cette action est irréversible.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
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
          onClick={handleConfirm}
          variant="contained"
          color="error"
          startIcon={<Trash2 size={16} />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            boxShadow: "0 4px 12px rgba(244, 67, 54, 0.2)",
          }}
        >
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error" | "info" | "warning"
  }>({
    open: false,
    message: "",
    severity: "success",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notificationToDelete, setNotificationToDelete] = useState<number | null>(null)

  const open = Boolean(anchorEl)
  const navigate = useNavigate()
  const theme = useTheme()
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/test/login")
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
        navigate("/test/login")
      }
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = sessionStorage.getItem("token")
    if (token) {
      fetchNotifications()

      let interval: NodeJS.Timeout
      const startInterval = () => {
        interval = setInterval(fetchNotifications, 30000)
      }

      startInterval()

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchNotifications()
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      // Gestionnaire de clic pour fermer le menu lorsqu'on clique en dehors
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setAnchorEl(null)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)

      return () => {
        clearInterval(interval)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [anchorEl])

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      navigate("/test/login")
      return
    }

    // Si le menu est déjà ouvert, on le ferme
    if (open) {
      setAnchorEl(null)
      return
    }

    // Sinon, on l'ouvre et on récupère les notifications
    setAnchorEl(event.currentTarget)
    fetchNotifications()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const markAsRead = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/test/login")
        return
      }

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
        severity: "success",
      })
    } catch (error: any) {
      console.error("Erreur lors du marquage de la notification comme lue:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/test/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors du marquage de la notification",
        severity: "error",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/test/login")
        return
      }

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
        severity: "success",
      })
    } catch (error: any) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/test/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors du marquage des notifications",
        severity: "error",
      })
    }
  }

  const openDeleteDialog = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotificationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setNotificationToDelete(null)
  }

  const deleteNotification = async (id: number) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        navigate("/test/login")
        return
      }

      await axios.delete(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setNotifications(notifications.filter((notification) => notification.id !== id))
      setSnackbar({
        open: true,
        message: "Notification supprimée avec succès",
        severity: "success",
      })
      closeDeleteDialog()
    } catch (error: any) {
      console.error("Erreur lors de la suppression de la notification:", error)
      if (error?.response?.status === 401) {
        sessionStorage.removeItem("token")
        navigate("/test/login")
      }
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression de la notification",
        severity: "error",
      })
      closeDeleteDialog()
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

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

  const viewAllNotifications = () => {
    navigate("/test/11")
    handleClose()
  }

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton
          ref={buttonRef}
          color="inherit"
          onClick={handleClick}
          sx={{
            position: "relative",
            transition: "all 0.2s",
            "&:hover": {
              transform: "scale(1.05)",
              backgroundColor: alpha(GREEN_COLOR, 0.08),
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: theme.palette.error.main,
                color: "white",
                fontWeight: "bold",
                boxShadow: "0 0 0 2px " + theme.palette.background.paper,
                minWidth: 18,
                height: 18,
                padding: "0 4px",
              },
            }}
          >
            <Bell size={22} strokeWidth={1.5} color={unreadCount > 0 ? GREEN_COLOR : undefined} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Fade in={open}>
        <Paper
          ref={menuRef}
          sx={{
            position: "absolute",
            top: anchorEl ? anchorEl.getBoundingClientRect().bottom + 8 : 0,
            right: anchorEl ? window.innerWidth - anchorEl.getBoundingClientRect().right : 0,
            width: 380,
            maxHeight: "calc(100vh - 100px)",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            zIndex: 1300,
            display: open ? "block" : "none",
          }}
          elevation={6}
        >
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: GREEN_COLOR,
              color: "white",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, textAlign: "center", width: "100%" }}>
              Notifications
              {unreadCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    px: 1,
                    py: 0.5,
                    borderRadius: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {unreadCount} non {unreadCount === 1 ? "lue" : "lues"}
                </Box>
              )}
            </Typography>
            <Box sx={{ position: "absolute", right: 10 }}>
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            </Box>
          </Box>

          {unreadCount > 0 && (
            <Box sx={{ p: 1, display: "flex", justifyContent: "center", backgroundColor: alpha(GREEN_COLOR, 0.05) }}>
              <Button
                size="small"
                onClick={markAllAsRead}
                startIcon={<Check size={16} />}
                sx={{
                  color: GREEN_COLOR,
                  "&:hover": {
                    backgroundColor: alpha(GREEN_COLOR, 0.1),
                  },
                }}
              >
                Tout marquer comme lu
              </Button>
            </Box>
          )}

          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <List sx={{ p: 0 }}>
              {loading ? (
                <ListItem sx={{ py: 4 }}>
                  <Box sx={{ width: "100%", textAlign: "center", color: "text.secondary" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: alpha(GREEN_COLOR, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <Bell size={20} color={GREEN_COLOR} />
                    </Box>
                    <Typography variant="body2">Chargement des notifications...</Typography>
                  </Box>
                </ListItem>
              ) : notifications.length === 0 ? (
                <ListItem sx={{ py: 4 }}>
                  <Box sx={{ width: "100%", textAlign: "center", color: "text.secondary" }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: alpha(GREEN_COLOR, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <Bell size={20} color={GREEN_COLOR} />
                    </Box>
                    <Typography variant="body2">Aucune notification</Typography>
                  </Box>
                </ListItem>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        p: 0,
                        transition: "background-color 0.2s",
                        "&:hover": { backgroundColor: alpha(GREEN_COLOR, 0.03) },
                      }}
                    >
                      <Box sx={{ width: "100%", p: 2 }}>
                        <Box sx={{ display: "flex", mb: 1 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              backgroundColor: getTypeBackground(notification.type),
                              color: getTypeColor(notification.type),
                            }}
                          >
                            {getTypeIcon(notification.type)}
                          </Avatar>
                          <Box sx={{ ml: 1.5, flex: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: notification.is_read ? "text.primary" : "text.primary",
                                fontWeight: notification.is_read ? 500 : 600,
                              }}
                            >
                              {notification.title}
                              {!notification.is_read && (
                                <Box
                                  component="span"
                                  sx={{
                                    ml: 1,
                                    px: 1,
                                    py: 0.2,
                                    fontSize: "0.7rem",
                                    borderRadius: 10,
                                    backgroundColor: alpha(GREEN_COLOR, 0.1),
                                    color: GREEN_COLOR,
                                  }}
                                >
                                  Nouveau
                                </Box>
                              )}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: notification.is_read ? "text.secondary" : "text.primary",
                                fontWeight: notification.is_read ? 400 : 500,
                                mb: 0.5,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  color: "text.secondary",
                                  fontSize: "0.75rem",
                                }}
                              >
                                <Clock size={12} strokeWidth={2} />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                  {formatDate(notification.created_at)}
                                </Typography>
                              </Box>
                              <Box sx={{ ml: "auto", display: "flex" }}>
                                {!notification.is_read && (
                                  <Tooltip title="Marquer comme lu" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markAsRead(notification.id)
                                      }}
                                      sx={{
                                        color: GREEN_COLOR,
                                        backgroundColor: alpha(GREEN_COLOR, 0.08),
                                        "&:hover": {
                                          backgroundColor: alpha(GREEN_COLOR, 0.15),
                                        },
                                        width: 28,
                                        height: 28,
                                      }}
                                    >
                                      <Check size={14} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Supprimer" arrow>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => openDeleteDialog(notification.id, e)}
                                    sx={{
                                      ml: 0.5,
                                      color: theme.palette.error.main,
                                      backgroundColor: alpha(theme.palette.error.main, 0.08),
                                      "&:hover": {
                                        backgroundColor: alpha(theme.palette.error.main, 0.15),
                                      },
                                      width: 28,
                                      height: 28,
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              )}
            </List>
          </Box>
          <Box
            sx={{
              p: 1.5,
              backgroundColor: alpha(GREEN_COLOR, 0.04),
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              fullWidth
              variant="text"
              onClick={viewAllNotifications}
              sx={{
                fontWeight: 500,
                textTransform: "none",
                color: GREEN_COLOR,
                "&:hover": {
                  backgroundColor: alpha(GREEN_COLOR, 0.08),
                },
              }}
            >
              Voir toutes les notifications
            </Button>
          </Box>
        </Paper>
      </Fade>

      {/* Boîte de dialogue de confirmation pour supprimer une notification */}
      <DeleteDialog
        open={deleteDialogOpen}
        notificationId={notificationToDelete}
        onClose={closeDeleteDialog}
        onConfirm={deleteNotification}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            width: "100%",
            ...(snackbar.severity === "success" && {
              backgroundColor: GREEN_COLOR,
            }),
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default NotificationBell
