"use client"

import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Folder as FolderIcon,
  Group as GroupIcon,
  KeyboardArrowRight as ArrowRightIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Task as TaskIcon,
  Warning as AlertTriangleIcon,
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
  IconButton,
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
import { useEffect, useState } from "react"
import StatCard from "../../components/dashboard/StatCard"
import AppLayout from "../../components/layout/AppLayout"
import { getPriorityColor, getProgressColor, getStatusColor } from "../../utils/colorUtils"
import { getCurrentUser } from "../login/api"
import { edbApi, type Edb } from "../edb/apiedb"
import api from "../notification/axios"
import { projectApi, type Project } from "../project/apiprojet"
import { taskApi, type Task } from "../task/apitask"
import { teamApi } from "../team/apiteam"

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

interface User {
  id: number
  name: string
  email: string
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

// Employee dashboard component
export default function DashboardEmployee() {
  const theme = useTheme()
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [edbs, setEdbs] = useState<Edb[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      window.location.href = "/login"
    } else {
      setCurrentUser(user)
    }
  }, [])

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Début du chargement des données pour l'utilisateur:", currentUser?.id)

        // Fetch all data in parallel
        const [tasksData, allProjects, allEdbs, allTeams] = await Promise.all([
          taskApi.getAllTasks().catch((err: any) => {
            console.error("Erreur lors du chargement des tâches:", err)
            return []
          }),
          projectApi.getAllProjects().catch((err: any) => {
            console.error("Erreur lors du chargement des projets:", err)
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
        ])

        console.log("Données récupérées:")
        console.log("- Tâches:", tasksData.length)
        console.log("- Projets:", allProjects.length)
        console.log("- EDBs:", allEdbs.length)
        console.log("- Équipes:", allTeams.length)

        // Filter tasks assigned to the current user
        const employeeTasks = tasksData.filter((task: Task) => {
          return task.assigned_to === currentUser?.id
        })
        console.log("Tâches filtrées pour l'employé:", employeeTasks.length)

        // Filter projects where the current user is involved
        const userProjects = allProjects.filter((project: Project) => {
          // Vérifier si l'utilisateur a des tâches dans ce projet
          const hasTasksInProject = tasksData.some(
            (task: Task) => task.assigned_to === currentUser?.id && task.project_id === project.id,
          )

          // Vérifier si l'utilisateur est dans l'équipe du projet (si team_members existe)
          const isTeamMember = project.team_members?.some((member: any) => member.id === currentUser?.id)

          // Vérifier si l'utilisateur est dans une équipe qui travaille sur ce projet
          const isInProjectTeam = allTeams.some(
            (team: Team) =>
              team.project?.id === project.id &&
              (team.members?.some((member: any) => member.id === currentUser?.id) ||
                team.manager?.id === currentUser?.id),
          )

          return hasTasksInProject || isTeamMember || isInProjectTeam
        })
        console.log("Projets filtrés pour l'employé:", userProjects.length)

        // Filter EDBs created by the current user
        const userEdbs = allEdbs.filter((edb: Edb) => edb.user_id === currentUser?.id)
        console.log("EDBs filtrées pour l'employé:", userEdbs.length)

        // Filter teams where the current user is a member or manager
        const userTeams = allTeams.filter((team: Team) => {
          const isMember = team.members?.some((member: any) => member.id === currentUser?.id)
          const isManager = team.manager?.id === currentUser?.id
          return isMember || isManager
        })
        console.log("Équipes filtrées pour l'employé:", userTeams.length)

        setProjects(userProjects)
        setTasks(employeeTasks)
        setEdbs(userEdbs)
        setTeams(userTeams)
        await fetchNotifications()
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données")
        setLoading(false)
      }
    }

    if (currentUser) {
      fetchData()
    }
  }, [currentUser])

  const fetchNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (token) {
        const response = await api.get("/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setNotifications(response.data.slice(0, 4))
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: "Nouvelle tâche assignée",
          message: "Une nouvelle tâche vous a été assignée",
          type: "info",
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: "EDB approuvée",
          message: "Votre expression de besoin a été approuvée",
          type: "success",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 3,
          title: "Échéance approche",
          message: "La tâche arrive à échéance demain",
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

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    // Trigger data refetch
    if (currentUser) {
      const fetchData = async () => {
        try {
          const [tasksData, allProjects, allEdbs, allTeams] = await Promise.all([
            taskApi.getAllTasks(),
            projectApi.getAllProjects(),
            edbApi.getAllEdbs(),
            teamApi.getAllTeams(),
          ])

          const employeeTasks = tasksData.filter((task: Task) => task.assigned_to === currentUser?.id)
          const userProjects = allProjects.filter((project: Project) => {
            const hasTasksInProject = tasksData.some(
              (task: Task) => task.assigned_to === currentUser?.id && task.project_id === project.id,
            )
            const isTeamMember = project.team_members?.some((member: any) => member.id === currentUser?.id)
            const isInProjectTeam = allTeams.some(
              (team: Team) =>
                team.project?.id === project.id &&
                (team.members?.some((member: any) => member.id === currentUser?.id) ||
                  team.manager?.id === currentUser?.id),
            )
            return hasTasksInProject || isTeamMember || isInProjectTeam
          })
          const userEdbs = allEdbs.filter((edb: Edb) => edb.user_id === currentUser?.id)
          const userTeams = allTeams.filter((team: Team) => {
            const isMember = team.members?.some((member: any) => member.id === currentUser?.id)
            const isManager = team.manager?.id === currentUser?.id
            return isMember || isManager
          })

          setProjects(userProjects)
          setTasks(employeeTasks)
          setEdbs(userEdbs)
          setTeams(userTeams)
          setLoading(false)
        } catch (err) {
          console.error("Error fetching dashboard data:", err)
          setError("Erreur lors du chargement des données")
          setLoading(false)
        }
      }
      fetchData()
    }
  }

  // Prepare stats cards data
  const statsCards = [
    {
      icon: <FolderIcon />,
      label: "Projets assignés",
      count: projects.length,
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
      icon: <CheckCircleIcon />,
      label: "Tâches terminées",
      count: tasks.filter((t: Task) => t.status?.name === "Terminé").length,
      bgColor: "#e8f5e9",
      textColor: "#4caf50",
    },
    {
      icon: <AssignmentIcon />,
      label: "EDBs soumises",
      count: edbs.length,
      bgColor: "#f3e5f5",
      textColor: "#9c27b0",
    },
    {
      icon: <GroupIcon />,
      label: "Équipes",
      count: teams.length,
      bgColor: "#e0f2f1",
      textColor: "#00695c",
    },
    {
      icon: <AlertTriangleIcon />,
      label: "Tâches en retard",
      count: tasks.filter((t: Task) => {
        const today = new Date()
        const endDate = new Date(t.end_date)
        return endDate < today && t.status?.name !== "Terminé"
      }).length,
      bgColor: "#ffebee",
      textColor: "#f44336",
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
            Mon tableau de bord
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
              Bonjour, {currentUser?.name || "Employé"} 👋
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
              Voici un aperçu de votre activité aujourd'hui. Vous avez {projects.length} projets assignés,{" "}
              {tasks.filter((t: Task) => t.status?.name === "En cours").length} tâches en cours et {edbs.length} EDBs
              soumises.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<TaskIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={() => (window.location.href = "/4")}
              >
                Voir mes tâches
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={() => (window.location.href = "/edb")}
              >
                Mes EDBs
              </Button>
              <Button
                variant="outlined"
                startIcon={<GroupIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
                onClick={() => (window.location.href = "/3")}
              >
                Mes équipes
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
            {/* Projects Table */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Mes projets
                  </Typography>
                }
                subheader="Projets sur lesquels vous travaillez"
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
                      <TableCell sx={{ fontWeight: 600 }} align="right">
                        Actions
                      </TableCell>
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
                            <TableCell align="right">
                              <IconButton size="small">
                                <MoreIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucun projet assigné
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

            {/* Teams Section - Moved above EDBs */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Mes équipes
                  </Typography>
                }
                subheader="Équipes dont vous faites partie"
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {teams.length > 0 ? (
                  <List>
                    {teams.slice(0, 4).map((team: Team) => (
                      <ListItem
                        key={team.id}
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
                            <GroupIcon />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {team.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {team.members?.length || 0} membres • Chef: {team.manager?.name || "Non défini"}
                            </Typography>
                            {team.project && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                Projet: {team.project.title}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Vous ne faites partie d'aucune équipe
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
                  href="/3"
                  sx={{
                    color: "#16A249",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir toutes mes équipes
                </Button>
              </Box>
            </StyledCard>

            {/* EDBs Section - Moved below Teams */}
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Mes expressions de besoin
                  </Typography>
                }
                subheader="EDBs que vous avez soumises"
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
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
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                            Aucune EDB soumise
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
                  Voir toutes mes EDBs
                </Button>
              </Box>
            </StyledCard>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: "1 1 30%", minWidth: { xs: "100%", md: "30%" } }}>
            {/* Notifications */}
            <StyledCard sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Notifications
                  </Typography>
                }
                subheader="Dernières notifications"
                action={
                  <IconButton size="small" onClick={fetchNotifications}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
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

            {/* My Tasks */}
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Mes tâches récentes
                  </Typography>
                }
                subheader="Tâches qui vous sont assignées"
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                {tasks.length > 0 ? (
                  <List>
                    {tasks.slice(0, 5).map((task: Task) => {
                      const statusColor = getStatusColor(task.status?.name || "")
                      const priorityColor = getPriorityColor(task.priority?.name || "")

                      return (
                        <ListItem
                          key={task.id}
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
                                bgcolor: statusColor.bg,
                                color: statusColor.text,
                                fontSize: "1rem",
                                fontWeight: 600,
                                mr: 2,
                              }}
                            >
                              <TaskIcon />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                {task.title}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={task.status?.name}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: statusColor.bg,
                                    color: statusColor.text,
                                    fontWeight: 600,
                                  }}
                                />
                                <Chip
                                  label={task.priority?.name}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    backgroundColor: priorityColor.bg,
                                    color: priorityColor.text,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography variant="caption" color="text.secondary">
                                {task.progress || 0}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={task.progress || 0}
                                sx={{
                                  width: 60,
                                  height: 4,
                                  borderRadius: 2,
                                  mt: 0.5,
                                  bgcolor: theme.palette.grey[200],
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: getProgressColor(task.progress || 0),
                                    borderRadius: 2,
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </ListItem>
                      )
                    })}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune tâche assignée
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
                  href="/4"
                  sx={{
                    color: "#16A249",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir toutes mes tâches
                </Button>
              </Box>
            </StyledCard>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  )
}
