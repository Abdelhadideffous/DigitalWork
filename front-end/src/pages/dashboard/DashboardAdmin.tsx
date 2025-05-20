"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Stack,
  Skeleton,
  Alert,
  Tabs,
  Tab,
} from "@mui/material"
import { BarChart3, PieChart, Users, FolderKanban, ClipboardList, CheckSquare, Plus, ArrowRight, Bell, Calendar, Clock, TrendingUp, TrendingDown, MoreHorizontal, Search, Filter, RefreshCw } from 'lucide-react'
import AppLayout from "../../components/layout/AppLayout"
import { projectApi } from "../project/apiprojet"
import { taskApi } from "../task/apitask"
import { userService } from "../users/api-service"
import { edbApi } from "../edb/apiedb"
import { teamApi } from "../team/apiteam"
import StatsCard from "../../components/dashboard/stats-card"
import ProjectsChart from "../../components/dashboard/projects-chart"
import TasksChart from "../../components/dashboard/tasks-chart"
import WelcomeCard from "../../components/dashboard/welcome-card"
import ActivityFeed from "../../components/dashboard/activity-feed"
import QuickActions from "../../components/dashboard/quick-actions"
import RecentProjects from "../../components/dashboard/recent-projects"
import UpcomingTasks from "../../components/dashboard/upcoming-tasks"

// Créer un alias userApi pour maintenir la cohérence avec les autres imports
const userApi = {
  getAllUsers: async () => {
    return await userService.user.getAllUsers()
  },
}

const DashboardPage = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabValue, setTabValue] = useState(0)
  
  // États pour les données
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [edbs, setEdbs] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])

  // Stats calculées
  const [stats, setStats] = useState({
    activeProjects: 0,
    ongoingTasks: 0,
    totalUsers: 0,
    lateProjects: 0,
  })

  // Récupérer l'utilisateur actuel depuis le sessionStorage
  useEffect(() => {
    const userStr = sessionStorage.getItem("user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
      }
    }
  }, [])

  // Chargement des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Chargement parallèle des données
        const [projectsData, tasksData, usersData, edbsData, teamsData] = await Promise.all([
          projectApi.getAllProjects(),
          taskApi.getAllTasks(),
          userApi.getAllUsers(),
          edbApi.getAllEdbs(),
          teamApi.getAllTeams(),
        ])

        // Mise à jour des états
        setProjects(projectsData || [])
        setTasks(tasksData || [])
        setUsers(usersData?.data || [])
        setEdbs(edbsData || [])
        setTeams(teamsData || [])

        // Générer des activités fictives pour la démo
        setActivities(generateMockActivities())

        // Calcul des statistiques
        calculateStats(projectsData || [], tasksData || [], usersData?.data || [])

        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données. Veuillez réessayer plus tard.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calcul des statistiques
  const calculateStats = (projects: any[], tasks: any[], users: any[]) => {
    // Projets actifs (statut "En cours")
    const activeProjects = projects.filter((p) => p.status?.name === "En cours" || p.status_id === 2).length

    // Tâches en cours
    const ongoingTasks = tasks.filter((t) => t.status?.name === "En cours" || t.status_id === 2).length

    // Nombre total d'utilisateurs
    const totalUsers = users.length

    // Projets en retard (date de fin dépassée et non terminés)
    const today = new Date()
    const lateProjects = projects.filter((p) => {
      const endDate = p.end_date ? new Date(p.end_date) : null
      return endDate && endDate < today && p.status?.name !== "Terminé" && p.status_id !== 3
    }).length

    setStats({
      activeProjects,
      ongoingTasks,
      totalUsers,
      lateProjects,
    })
  }

  // Générer des activités fictives pour la démo
  const generateMockActivities = () => {
    const activities = [
      {
        id: 1,
        type: "project_created",
        user: "Ahmed Benali",
        content: "a créé un nouveau projet",
        target: "Refonte du site web",
        time: "Il y a 2 heures",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 2,
        type: "task_completed",
        user: "Samira Hadj",
        content: "a terminé une tâche",
        target: "Maquettes de l'interface utilisateur",
        time: "Il y a 3 heures",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 3,
        type: "comment_added",
        user: "Karim Meziane",
        content: "a commenté sur",
        target: "Intégration API de paiement",
        time: "Il y a 5 heures",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 4,
        type: "user_joined",
        user: "Leila Bouaziz",
        content: "a rejoint l'équipe",
        target: "Développement Mobile",
        time: "Il y a 1 jour",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      {
        id: 5,
        type: "edb_approved",
        user: "Directeur Technique",
        content: "a approuvé l'expression de besoin",
        target: "Système de notification",
        time: "Il y a 1 jour",
        avatar: "/placeholder.svg?height=40&width=40",
      },
    ]
    return activities
  }

  // Préparation des données pour les graphiques
  const getProjectsByStatus = () => {
    const statusCounts: Record<string, number> = {}

    projects.forEach((project) => {
      const statusName = project.status?.name || "Inconnu"
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  }

  const getTasksByPriority = () => {
    const priorityCounts: Record<string, number> = {}

    tasks.forEach((task) => {
      const priorityName = task.priority?.name || "Inconnu"
      priorityCounts[priorityName] = (priorityCounts[priorityName] || 0) + 1
    })

    return Object.entries(priorityCounts).map(([name, value]) => ({ name, value }))
  }

  // Données pour les cartes de statistiques
  const statsCards = [
    {
      icon: <FolderKanban size={24} />,
      label: "Projets actifs",
      count: stats.activeProjects,
      trend: "+12%",
      trendUp: true,
      bgColor: "#e3f2fd",
      textColor: "#1976d2",
    },
    {
      icon: <CheckSquare size={24} />,
      label: "Tâches en cours",
      count: stats.ongoingTasks,
      trend: "+5%",
      trendUp: true,
      bgColor: "#fff8e1",
      textColor: "#ff9800",
    },
    {
      icon: <Users size={24} />,
      label: "Utilisateurs",
      count: stats.totalUsers,
      trend: "+8%",
      trendUp: true,
      bgColor: "#e8f5e9",
      textColor: "#4caf50",
    },
    {
      icon: <ClipboardList size={24} />,
      label: "Expressions de besoin",
      count: edbs.length,
      trend: "+15%",
      trendUp: true,
      bgColor: "#f3e5f5",
      textColor: "#9c27b0",
    },
  ]

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRefresh = async () => {
    try {
      setLoading(true)
      const [projectsData, tasksData, usersData] = await Promise.all([
        projectApi.getAllProjects(),
        taskApi.getAllTasks(),
        userApi.getAllUsers(),
      ])

      setProjects(projectsData || [])
      setTasks(tasksData || [])
      setUsers(usersData?.data || [])
      calculateStats(projectsData || [], tasksData || [], usersData?.data || [])
      setError(null)
    } catch (err) {
      console.error("Erreur lors de l'actualisation des données:", err)
      setError("Impossible d'actualiser les données. Veuillez réessayer plus tard.")
    } finally {
      setLoading(false)
    }
  }

  // Rendu des squelettes pendant le chargement
  const renderSkeletons = () => (
    <>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />
      </Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="rectangular" height={550} sx={{ borderRadius: 2 }} />
        </Grid>
      </Grid>
    </>
  )

  return (
    <AppLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Tableau de bord
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bienvenue sur votre espace de travail DigitalWork
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<Search size={18} />}
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Rechercher
            </Button>
            <Button
              variant="outlined"
              startIcon={<Filter size={18} />}
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Filtrer
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={18} />}
              onClick={handleRefresh}
              disabled={loading}
              size="small"
              sx={{
                borderRadius: 2,
                bgcolor: "#16A249",
                "&:hover": { bgcolor: "#138a3c" },
                textTransform: "none",
              }}
            >
              Actualiser
            </Button>
          </Box>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minWidth: "auto",
              px: 3,
            },
            "& .Mui-selected": {
              color: "#16A249",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#16A249",
            },
          }}
        >
          <Tab label="Vue d'ensemble" />
          <Tab label="Projets" />
          <Tab label="Tâches" />
          <Tab label="Équipe" />
        </Tabs>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          renderSkeletons()
        ) : (
          <>
            {/* Carte de bienvenue */}
            <WelcomeCard
              userName={currentUser?.name || "Utilisateur"}
              stats={{
                projects: stats.activeProjects,
                tasks: stats.ongoingTasks,
                completedTasks: tasks.filter((t) => t.status?.name === "Terminé").length,
              }}
              sx={{ mb: 3 }}
            />

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {statsCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <StatsCard
                    icon={card.icon}
                    label={card.label}
                    count={card.count}
                    trend={card.trend}
                    trendUp={card.trendUp}
                    bgColor={card.bgColor}
                    textColor={card.textColor}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Main Content */}
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={8}>
                {/* Charts Section */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={7}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Projets par statut
                          </Typography>
                          <IconButton size="small">
                            <MoreHorizontal size={18} />
                          </IconButton>
                        </Box>
                        <Box sx={{ height: 280 }}>
                          <ProjectsChart data={getProjectsByStatus()} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 2,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                        transition: "transform 0.2s",
                        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Tâches par priorité
                          </Typography>
                          <IconButton size="small">
                            <MoreHorizontal size={18} />
                          </IconButton>
                        </Box>
                        <Box sx={{ height: 280 }}>
                          <TasksChart data={getTasksByPriority()} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Recent Projects */}
                <RecentProjects projects={projects.slice(0, 5)} sx={{ mb: 3 }} />

                {/* Upcoming Tasks */}
                <UpcomingTasks tasks={tasks.slice(0, 5)} />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={4}>
                {/* Quick Actions */}
                <QuickActions sx={{ mb: 3 }} />

                {/* Activity Feed */}
                <ActivityFeed activities={activities} />
              </Grid>
            </Grid>
          </>
        )}
      </Box>
    </AppLayout>
  )
}

export default DashboardPage
