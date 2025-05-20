"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Folder as FolderIcon,
  Task as TaskIcon,
  People as TeamIcon,
  Warning as AlertTriangleIcon,
  MoreVert as MoreHorizontalIcon,
  KeyboardArrowUp as ChevronUpIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowRight as ArrowRightIcon,
  FilterList as FilterIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as CircleDashedIcon,
  Error as CircleAlertIcon,
} from "@mui/icons-material"
import AppLayout from "../../components/layout/AppLayout"

// Stats data
const statsCards = [
  {
    icon: <FolderIcon />,
    label: "Projets actifs",
    count: 8,
    trend: "+12%",
    trendUp: true,
    bgColor: "#e3f2fd",
    textColor: "#1976d2",
  },
  {
    icon: <TaskIcon />,
    label: "Tâches en cours",
    count: 24,
    trend: "+5%",
    trendUp: true,
    bgColor: "#fff8e1",
    textColor: "#ff9800",
  },
  {
    icon: <TeamIcon />,
    label: "Utilisateurs",
    count: 15,
    trend: "+8%",
    trendUp: true,
    bgColor: "#e8f5e9",
    textColor: "#4caf50",
  },
  {
    icon: <AlertTriangleIcon />,
    label: "Projets en retard",
    count: 2,
    trend: "-25%",
    trendUp: false,
    bgColor: "#ffebee",
    textColor: "#f44336",
  },
]

// Projects data
const recentProjects = [
  {
    id: 1,
    nom: "Refonte du site web",
    statut: "En cours",
    progression: 65,
    responsable: "Marie Dupont",
    priorite: "Haute",
  },
  {
    id: 2,
    nom: "Application mobile",
    statut: "En cours",
    progression: 40,
    responsable: "Jean Martin",
    priorite: "Moyenne",
  },
  {
    id: 3,
    nom: "Campagne marketing Q2",
    statut: "À démarrer",
    progression: 0,
    responsable: "Sophie Leclerc",
    priorite: "Basse",
  },
]

// Tasks data for employee dashboard
const employeeTasks = [
  {
    id: 1,
    title: "Créer les maquettes UI",
    project: "Refonte du site web",
    dueDate: "20/05/2025",
    status: "En cours",
    priority: "Haute",
  },
  {
    id: 2,
    title: "Rédiger le contenu SEO",
    project: "Refonte du site web",
    dueDate: "25/05/2025",
    status: "À démarrer",
    priority: "Moyenne",
  },
  {
    id: 3,
    title: "Tester l'application sur iOS",
    project: "Application mobile",
    dueDate: "15/05/2025",
    status: "En retard",
    priority: "Haute",
  },
  {
    id: 4,
    title: "Préparer la présentation client",
    project: "Campagne marketing Q2",
    dueDate: "10/05/2025",
    status: "Terminé",
    priority: "Haute",
  },
]

// Helper functions
const getStatusColor = (statut: string) => {
  switch (statut) {
    case "À démarrer":
      return { bg: "#fff8e1", text: "#ff9800" }
    case "En cours":
      return { bg: "#e3f2fd", text: "#1976d2" }
    case "Terminé":
      return { bg: "#e8f5e9", text: "#4caf50" }
    case "En retard":
      return { bg: "#ffebee", text: "#f44336" }
    default:
      return { bg: "#f5f5f5", text: "#757575" }
  }
}

const getPriorityColor = (priorite: string) => {
  switch (priorite) {
    case "Haute":
      return { bg: "#ffebee", text: "#f44336" }
    case "Moyenne":
      return { bg: "#fff8e1", text: "#ff9800" }
    case "Basse":
      return { bg: "#e8f5e9", text: "#4caf50" }
    default:
      return { bg: "#f5f5f5", text: "#757575" }
  }
}

const getProgressColor = (progress: number) => {
  if (progress === 100) return "#4caf50"
  if (progress < 30) return "#f44336"
  return "#2196f3"
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s, box-shadow 0.2s",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}))

const StatCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  height: "100%",
  display: "flex",
  alignItems: "center",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}))

const IconWrapper = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  width: 56,
  height: 56,
  borderRadius: "14px",
  backgroundColor: bgcolor || theme.palette.primary.light,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(2),
}))

// Employee dashboard component
export default function DashboardEmployee() {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Tableau de bord employé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suivez vos tâches et projets assignés
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
          >
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Vue d'ensemble" />
              <Tab label="Projets" />
              <Tab label="Tâches" />
              <Tab label="Analytiques" />
            </Tabs>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          {statsCards.map((card, index) => (
            <Box key={index} sx={{ flex: "1 1 220px", minWidth: { xs: "100%", sm: "220px" } }}>
              <StatCard elevation={2}>
                <IconWrapper bgcolor={card.bgColor}>
                  <Box sx={{ color: card.textColor }}>{card.icon}</Box>
                </IconWrapper>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {card.count}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Chip
                      size="small"
                      icon={card.trendUp ? <ChevronUpIcon fontSize="small" /> : <ChevronDownIcon fontSize="small" />}
                      label={card.trend}
                      sx={{
                        backgroundColor: card.trendUp ? "#e8f5e9" : "#ffebee",
                        color: card.trendUp ? "#4caf50" : "#f44336",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                      }}
                    />
                  </Box>
                </Box>
              </StatCard>
            </Box>
          ))}
        </Box>

        {/* Projects and Tasks */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          <Box sx={{ flex: "1 1 30%", minWidth: { xs: "100%", md: "30%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Mes projets actifs
                  </Typography>
                }
                subheader="Projets sur lesquels vous travaillez"
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {recentProjects.slice(0, 3).map((project) => {
                    const statusColor = getStatusColor(project.statut)
                    const progressColor = getProgressColor(project.progression)

                    return (
                      <Paper key={project.id} sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="subtitle2">{project.nom}</Typography>
                          <Chip
                            label={project.statut}
                            size="small"
                            sx={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              fontWeight: 600,
                              borderRadius: "6px",
                              height: 24,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progression}
                            sx={{
                              flexGrow: 1,
                              height: 8,
                              borderRadius: 4,
                              bgcolor: theme.palette.grey[200],
                              "& .MuiLinearProgress-bar": {
                                bgcolor: progressColor,
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {project.progression}%
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Responsable: {project.responsable}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <ClockIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                            <Typography variant="caption" color="text.secondary">
                              Échéance: 15/06/2025
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  fullWidth
                  endIcon={<ArrowRightIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Voir tous mes projets
                </Button>
              </Box>
            </StyledCard>
          </Box>
          <Box sx={{ flex: "1 1 65%", minWidth: { xs: "100%", md: "65%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Tâches à venir
                  </Typography>
                }
                subheader="Tâches prévues pour les prochains jours"
              />
              <Divider />
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {employeeTasks.slice(0, 4).map((task) => {
                    const priorityColor = getPriorityColor(task.priority)

                    let statusIcon
                    if (task.status === "Terminé") {
                      statusIcon = <CheckCircleIcon sx={{ color: "#4caf50" }} />
                    } else if (task.status === "En retard") {
                      statusIcon = <CircleAlertIcon sx={{ color: "#f44336" }} />
                    } else {
                      statusIcon = <CircleDashedIcon sx={{ color: "#2196f3" }} />
                    }

                    return (
                      <Paper key={task.id} sx={{ p: 2, borderRadius: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {statusIcon}
                            <Box>
                              <Typography variant="subtitle2">{task.title}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {task.project}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              label={task.priority}
                              size="small"
                              sx={{
                                backgroundColor: priorityColor.bg,
                                color: priorityColor.text,
                                fontWeight: 600,
                                borderRadius: "6px",
                                height: 24,
                              }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <ClockIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                              <Typography variant="caption" color="text.secondary">
                                {task.dueDate}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>
              </CardContent>
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  fullWidth
                  endIcon={<ArrowRightIcon />}
                  sx={{
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

        {/* Employee Tasks */}
        <StyledCard>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Mes tâches
              </Typography>
            }
            subheader="Tâches assignées et leur statut"
            action={
              <Button variant="outlined" size="small" startIcon={<FilterIcon />} sx={{ textTransform: "none" }}>
                Filtrer
              </Button>
            }
          />
          <Divider />
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.background.default }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Tâche</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date limite</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeTasks.map((task) => {
                  const statusColor = getStatusColor(task.status)
                  const priorityColor = getPriorityColor(task.priority)

                  return (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{task.project}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
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
                          label={task.priority}
                          size="small"
                          sx={{
                            backgroundColor: priorityColor.bg,
                            color: priorityColor.text,
                            fontWeight: 600,
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreHorizontalIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </StyledCard>
      </Box>
    </AppLayout>
  )
}
