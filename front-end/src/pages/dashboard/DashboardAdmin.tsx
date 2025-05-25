"use client"

import {
  Assignment as AssignmentIcon,
  Warning as AlertTriangleIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Folder as FolderIcon,
  Add as PlusIcon,
  Refresh as RefreshIcon,
  Task as TaskIcon,
  People as TeamIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material"
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material"
import { styled } from "@mui/system"
import { useEffect, useRef, useState } from "react"
import ProjectProgressChart from "../../components/dashboard/charts/ProjectProgressChart"
import TaskDistributionChart from "../../components/dashboard/charts/TaskDistributionChart"
import StatCard from "../../components/dashboard/StatCard"
import AppLayout from "../../components/layout/AppLayout"
import { getPriorityColor, getProgressColor, getStatusColor } from "../../utils/colorUtils"
import { getCurrentUser } from "../login/api"
import { edbApi, type Edb } from "../edb/apiedb"
import api from "../notification/axios"
import { projectApi, type Project } from "../project/apiprojet"
import { taskApi, type Task } from "../task/apitask"
import { teamApi } from "../team/apiteam"
import { dashboardApi, type User } from "./apidashboard"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface Team {
  id: number
  name: string
  description: string
  project?: {
    id: number
    title: string
  }
  manager?: {
    id: number
    name: string
  }
  members: Array<{
    id: number
    name: string
    email: string
  }>
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  transition: "box-shadow 0.2s",
  "&:hover": {
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
  },
}))

// Admin dashboard component
export default function DashboardAdmin() {
  const theme = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [edbs, setEdbs] = useState<Edb[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Refs pour l'exportation
  const projectProgressChartRef = useRef<HTMLDivElement>(null)
  const taskDistributionChartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      window.location.href = "/login"
    } else {
      setCurrentUser(user)
    }
  }, [])

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Chargement des données du dashboard admin...")

        // Fetch all data in parallel
        const [projectsData, tasksData, edbsData, teamsData, usersData] = await Promise.all([
          projectApi.getAllProjects().catch((err: any) => {
            console.error("Erreur lors du chargement des projets:", err)
            return []
          }),
          taskApi.getAllTasks().catch((err: any) => {
            console.error("Erreur lors du chargement des tâches:", err)
            return []
          }),
          edbApi.getAllEdbs().catch((err: any) => {
            console.error("Erreur lors du chargement des EDBs:", err)
            return []
          }),
          teamApi.getAllTeams().catch((err: any) => {
            console.error("Erreur lors du chargement des équipes:", err)
            return []
          }),
          dashboardApi.getAllUsers().catch((err: any) => {
            console.error("Erreur lors du chargement des utilisateurs:", err)
            return []
          }),
        ])

        console.log("Données récupérées:")
        console.log("- Projets:", projectsData.length)
        console.log("- Tâches:", tasksData.length)
        console.log("- EDBs:", edbsData.length)
        console.log("- Équipes:", teamsData.length)
        console.log("- Utilisateurs:", usersData.length)

        setProjects(projectsData)
        setTasks(tasksData)
        setEdbs(edbsData)
        setTeams(teamsData)
        setUsers(usersData)
        await fetchNotifications()
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Refetch data
    const fetchData = async () => {
      try {
        const [projectsData, tasksData, edbsData, teamsData, usersData] = await Promise.all([
          projectApi.getAllProjects(),
          taskApi.getAllTasks(),
          edbApi.getAllEdbs(),
          teamApi.getAllTeams(),
          dashboardApi.getAllUsers(),
        ])
        setProjects(projectsData)
        setTasks(tasksData)
        setEdbs(edbsData)
        setTeams(teamsData)
        setUsers(usersData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données")
        setLoading(false)
      }
    }
    fetchData()
  }

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (token) {
        const response = await api.get("/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        // Prendre seulement les 4 dernières notifications
        setNotifications(response.data.slice(0, 4))
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Nouveau utilisateur inscrit",
          message: "Un nouvel utilisateur s'est inscrit",
          type: "info",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "EDB approuvée",
          message: "Une expression de besoin a été approuvée",
          type: "success",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          title: "Projet en retard",
          message: "Un projet dépasse sa date limite",
          type: "warning",
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ]
      setNotifications(mockNotifications)
    }
  }

  const formatNotificationDate = (dateString: string) => {
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
      return `Il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? "s" : ""}`
    }
  }

  // Prepare stats cards data from API response
  const statsCards = [
    {
      icon: <FolderIcon />,
      label: "Projets actifs",
      count: projects.filter((p: Project) => p.status?.name === "En cours").length,
      bgColor: "#e3f2fd",
      textColor: "#1976d2",
    },
    {
      icon: <TaskIcon />,
      label: "Tâches en cours",
      count: tasks.filter((t: Task) => t.status?.name === "En cours").length,
      bgColor: "#fff8e1",
      textColor: "#ff9800",
    },
    {
      icon: <AssignmentIcon />,
      label: "EDBs en attente",
      count: edbs.filter((e: Edb) => e.status?.name === "En attente" || e.status?.name === "Soumise").length,
      bgColor: "#f3e5f5",
      textColor: "#9c27b0",
    },
    {
      icon: <TeamIcon />,
      label: "Utilisateurs",
      count: users.length,
      bgColor: "#e8f5e9",
      textColor: "#4caf50",
    },
    {
      icon: <AlertTriangleIcon />,
      label: "Projets en retard",
      count: projects.filter((p: Project) => p.status?.name === "En retard").length,
      bgColor: "#ffebee",
      textColor: "#f44336",
    },
    {
      icon: <CheckCircleIcon />,
      label: "EDBs approuvées",
      count: edbs.filter((e: Edb) => e.status?.name === "Validé").length,
      bgColor: "#e0f2f1",
      textColor: "#00695c",
    },
  ]

  // Prepare project status data
  const projectStatusData = {
    inProgress: projects.filter((p: Project) => p.status?.name === "En cours").length,
    pending: projects.filter((p: Project) => p.status?.name === "À démarrer" || p.status?.name === "En attente").length,
    completed: projects.filter((p: Project) => p.status?.name === "Terminé").length,
    total: projects.length,
  }

  // Préparer les données pour le graphique de répartition des tâches
  const taskDistributionData = [
    {
      name: "En cours",
      value: projectStatusData.inProgress,
      color: "#2196f3",
    },
    {
      name: "En attente",
      value: projectStatusData.pending,
      color: "#9e9e9e",
    },
    {
      name: "Terminés",
      value: projectStatusData.completed,
      color: "#4caf50",
    },
  ]

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress color="success" />
        </Box>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Erreur</AlertTitle>
            {error}
          </Alert>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Tableau de bord administrateur
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleRetry} startIcon={<RefreshIcon />}>
            Réessayer
          </Button>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              p: 3,
              mb: 3,
              borderRadius: 2,
              bgcolor: "success.main",
              color: "white",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Bonjour, {currentUser?.name || "Administrateur"} 👋
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Voici un aperçu de votre activité aujourd'hui. Vous avez{" "}
              {projects.filter((p: Project) => p.status?.name === "En cours").length} projets actifs,{" "}
              {tasks.filter((t: Task) => t.status?.name === "En cours").length} tâches en cours et{" "}
              {edbs.filter((e: Edb) => e.status?.name === "En attente" || e.status?.name === "Soumise").length} EDBs en
              attente.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={() => {
                  sessionStorage.setItem("openNewProjectDialog", "true")
                  window.location.href = "/2"
                }}
              >
                Nouveau projet
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={() => {
                  sessionStorage.setItem("openNewTaskDialog", "true")
                  window.location.href = "/4"
                }}
              >
                Nouvelle tâche
              </Button>
              <Button
                variant="outlined"
                href="/3"
                startIcon={<AssignmentIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                
              >
                Gérer EDBs
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          {statsCards.map((card, index) => (
            <Box key={index} sx={{ flex: "1 1 220px", minWidth: { xs: "100%", sm: "220px" } }}>
              <StatCard
                icon={card.icon}
                label={card.label}
                count={card.count}
                bgColor={card.bgColor}
                textColor={card.textColor}
              />
            </Box>
          ))}
        </Box>

        {/* Main Content */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
          {/* Left Column */}
          <Box sx={{ flex: "1 1 65%", minWidth: { xs: "100%", md: "65%" } }}>
            {/* Project Progress Chart */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Progression des projets
                    </Typography>
                  </Box>
                }
                subheader="Vue d'ensemble de la progression des projets"
              />
              <Divider />
              <CardContent>
                <Box ref={projectProgressChartRef}>
                  <ProjectProgressChart projects={projects} />
                </Box>
              </CardContent>
            </StyledCard>

            {/* EDBs Table - Remplace Activity Timeline Chart */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Expressions de besoin
                  </Typography>
                }
                subheader="Toutes les EDBs soumises par les utilisateurs"
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Demandeur</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date demande</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {edbs.length > 0 ? (
                      edbs.slice(0, 5).map((edb: Edb) => {
                        const statusColor = getStatusColor(edb.status?.name || "")
                        const priorityColor = getPriorityColor(edb.priority?.name || "")

                        return (
                          <TableRow key={edb.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {edb.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{edb.user?.name || "Non défini"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={edb.status?.name || "Non défini"}
                                size="small"
                                sx={{
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.text,
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={edb.priority?.name || "Non défini"}
                                size="small"
                                sx={{
                                  backgroundColor: priorityColor.bg,
                                  color: priorityColor.text,
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(edb.date_demande).toLocaleDateString("fr-FR")}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucune EDB disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  endIcon={<ArrowRightIcon />}
                  href="/edb"
                  sx={{
                    color: "#16A249",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir toutes les EDBs
                </Button>
              </Box>
            </StyledCard>

            {/* Projects Table */}
            <StyledCard>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Projets récents
                    </Typography>
                  </Box>
                }
                subheader="Vue d'ensemble des projets en cours"
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Nom du projet</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projects.length > 0 ? (
                      projects.slice(0, 5).map((project: Project) => {
                        const statusColor = getStatusColor(project.status?.name || "")
                        const priorityColor = getPriorityColor(project.priority?.name || "")
                        const progressColor = getProgressColor(project.progress || 0)

                        return (
                          <TableRow key={project.id} hover>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {project.title}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={project.status?.name || "Non défini"}
                                size="small"
                                sx={{
                                  backgroundColor: statusColor.bg,
                                  color: statusColor.text,
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={project.priority?.name || "Non défini"}
                                size="small"
                                sx={{
                                  backgroundColor: priorityColor.bg,
                                  color: priorityColor.text,
                                  fontWeight: 600,
                                  borderRadius: "6px",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={project.progress || 0}
                                  sx={{
                                    width: 100,
                                    height: 8,
                                    borderRadius: 4,
                                    bgcolor: theme.palette.grey[200],
                                    "& .MuiLinearProgress-bar": {
                                      bgcolor: progressColor,
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {project.progress || 0}%
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucun projet disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  endIcon={<ArrowRightIcon />}
                  href="/2"
                  sx={{
                    color: "#16A249",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir tous les projets
                </Button>
              </Box>
            </StyledCard>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: "1 1 30%", minWidth: { xs: "100%", md: "30%" } }}>
            {/* Task Distribution Chart */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Répartition des projets
                  </Typography>
                }
                subheader="Par statut"
              />
              <Divider />
              <CardContent>
                <Box ref={taskDistributionChartRef}>
                  <TaskDistributionChart data={taskDistributionData} />
                </Box>
              </CardContent>
            </StyledCard>

            {/* Activity Feed */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Activité récente
                  </Typography>
                }
                subheader="Dernières actions sur la plateforme"
                action={
                  <Button
                    size="small"
                    onClick={fetchNotifications}
                    sx={{
                      minWidth: "auto",
                      p: 0.5,
                      color: "text.secondary",
                    }}
                  >
                    <RefreshIcon fontSize="small" />
                  </Button>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {notifications.length > 0 ? (
                  <Box>
                    {notifications.map((notification: Notification, index: number) => {
                      const getNotificationConfig = (type: string) => {
                        switch (type) {
                          case "success":
                            return {
                              bgColor: "rgba(76, 175, 80, 0.1)",
                              iconColor: "#4caf50",
                              icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
                              chipLabel: "Succès",
                              chipBg: "rgba(76, 175, 80, 0.1)",
                              chipColor: "#4caf50",
                            }
                          case "warning":
                            return {
                              bgColor: "rgba(255, 152, 0, 0.1)",
                              iconColor: "#ff9800",
                              icon: <AlertTriangleIcon sx={{ fontSize: 16 }} />,
                              chipLabel: "Attention",
                              chipBg: "rgba(255, 152, 0, 0.1)",
                              chipColor: "#ff9800",
                            }
                          case "error":
                            return {
                              bgColor: "rgba(244, 67, 54, 0.1)",
                              iconColor: "#f44336",
                              icon: <AlertTriangleIcon sx={{ fontSize: 16 }} />,
                              chipLabel: "Erreur",
                              chipBg: "rgba(244, 67, 54, 0.1)",
                              chipColor: "#f44336",
                            }
                          default:
                            return {
                              bgColor: "rgba(33, 150, 243, 0.1)",
                              iconColor: "#2196f3",
                              icon: <TaskIcon sx={{ fontSize: 16 }} />,
                              chipLabel: "Info",
                              chipBg: "rgba(33, 150, 243, 0.1)",
                              chipColor: "#2196f3",
                            }
                        }
                      }

                      const config = getNotificationConfig(notification.type)

                      return (
                        <Box
                          key={notification.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderBottom:
                              index < notifications.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                            backgroundColor: notification.is_read ? "transparent" : "rgba(22, 162, 73, 0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: "rgba(22, 162, 73, 0.04)",
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          {/* Avatar avec icône */}
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: config.bgColor,
                              color: config.iconColor,
                              position: "relative",
                            }}
                          >
                            {config.icon}
                            {!notification.is_read && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: -2,
                                  right: -2,
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  backgroundColor: "#16A249",
                                  border: `2px solid ${theme.palette.background.paper}`,
                                }}
                              />
                            )}
                          </Avatar>

                          {/* Contenu */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: notification.is_read ? 500 : 600,
                                  color: notification.is_read ? "text.secondary" : "text.primary",
                                  fontSize: "0.875rem",
                                  lineHeight: 1.2,
                                }}
                                noWrap
                              >
                                {notification.title}
                              </Typography>
                              <Chip
                                label={config.chipLabel}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  backgroundColor: config.chipBg,
                                  color: config.chipColor,
                                  borderRadius: "9px",
                                  ml: 1,
                                }}
                              />
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.75rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    backgroundColor: "text.secondary",
                                    opacity: 0.6,
                                  }}
                                />
                                {formatNotificationDate(notification.created_at)}
                              </Typography>

                              {!notification.is_read && (
                                <Chip
                                  label="Nouveau"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    backgroundColor: "rgba(22, 162, 73, 0.1)",
                                    color: "#16A249",
                                    borderRadius: "8px",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      py: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "rgba(158, 158, 158, 0.1)",
                        color: "#9e9e9e",
                        mb: 2,
                      }}
                    >
                      <AlertTriangleIcon sx={{ fontSize: 24 }} />
                    </Avatar>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                      Aucune notification récente
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Les nouvelles activités apparaîtront ici
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Box
                sx={{
                  p: 1.5,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 500,
                    color: "#16A249",
                    fontSize: "0.875rem",
                  }}
                  onClick={() => (window.location.href = "/8")}
                >
                  Voir tout
                </Button>
              </Box>
            </StyledCard>

            {/* Users */}
            <StyledCard>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Utilisateurs récents
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlusIcon />}
                      sx={{
                        textTransform: "none",
                        borderRadius: "8px",
                        px: 2,
                        borderColor: "#16A249",
                        color: "#16A249",
                        "&:hover": { borderColor: "#138A3C", bgcolor: "rgba(22, 162, 73, 0.04)" },
                      }}
                      onClick={() => {
                        sessionStorage.setItem("openNewUserDialog", "true")
                        window.location.href = "/6"
                      }}
                    >
                      Ajouter
                    </Button>
                  </Box>
                }
                subheader="Derniers utilisateurs inscrits"
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {users.length > 0 ? (
                  <List>
                    {users.slice(0, 5).map((user: User) => (
                      <ListItem
                        key={user.id}
                        sx={{
                          py: 1.5,
                          px: 2,
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          "&:last-child": { borderBottom: "none" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: "#16A249",
                              fontSize: "1rem",
                              fontWeight: 600,
                              mr: 2,
                            }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {user.email}
                            </Typography>
                          </Box>
                          <Chip
                            label={user.role}
                            size="small"
                            sx={{
                              bgcolor: "rgba(25, 118, 210, 0.1)",
                              color: "primary.main",
                              fontWeight: 600,
                              borderRadius: "6px",
                            }}
                          />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucun utilisateur disponible
                    </Typography>
                  </Box>
                )}
              </CardContent>
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "center",
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Button
                  endIcon={<ArrowRightIcon />}
                  href="/6"
                  sx={{
                    color: "#16A249",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir tous les utilisateurs
                </Button>
              </Box>
            </StyledCard>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}
