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
  Menu,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Folder as FolderIcon,
  Task as TaskIcon,
  People as TeamIcon,
  Warning as AlertTriangleIcon,
  Add as PlusIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreHorizontalIcon,
  KeyboardArrowUp as ChevronUpIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowRight as ArrowRightIcon,
  FilterList as FilterIcon,
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
  {
    id: 4,
    nom: "Mise à jour CRM",
    statut: "Terminé",
    progression: 100,
    responsable: "Thomas Bernard",
    priorite: "Haute",
  },
]

// Team performance data
const teamPerformance = [
  {
    id: 1,
    team: "Équipe Design",
    tasksCompleted: 24,
    tasksTotal: 30,
    progress: 80,
    onTime: "90%",
    lead: "Sophie Leclerc",
  },
  {
    id: 2,
    team: "Équipe Développement",
    tasksCompleted: 45,
    tasksTotal: 52,
    progress: 87,
    onTime: "95%",
    lead: "Jean Martin",
  },
  {
    id: 3,
    team: "Équipe Marketing",
    tasksCompleted: 18,
    tasksTotal: 25,
    progress: 72,
    onTime: "85%",
    lead: "Marie Dupont",
  },
  {
    id: 4,
    team: "Équipe Support",
    tasksCompleted: 32,
    tasksTotal: 40,
    progress: 80,
    onTime: "88%",
    lead: "Thomas Bernard",
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

const ChartContainer = styled(Box)(({ theme }) => ({
  height: 280,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
}))

// Manager dashboard component
export default function DashboardManager() {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Tableau de bord manager
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gérez vos équipes et suivez la progression des projets
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
          >
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
              <Tab label="Vue d'ensemble" />
              <Tab label="Projets" />
              <Tab label="Équipes" />
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

        {/* Charts Section */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4 }}>
          <Box sx={{ flex: "1 1 60%", minWidth: { xs: "100%", md: "60%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Progression des projets
                  </Typography>
                }
                subheader="Vue d'ensemble de la progression des projets"
                action={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small">
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={handleMenuOpen}>
                      <MoreHorizontalIcon fontSize="small" />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                      <MenuItem onClick={handleMenuClose}>Exporter en PDF</MenuItem>
                      <MenuItem onClick={handleMenuClose}>Exporter en Excel</MenuItem>
                      <MenuItem onClick={handleMenuClose}>Paramètres</MenuItem>
                    </Menu>
                  </Box>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <ChartContainer>
                  <BarChartIcon sx={{ fontSize: 120, color: theme.palette.grey[300] }} />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Box>
          <Box sx={{ flex: "1 1 35%", minWidth: { xs: "100%", md: "35%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Répartition des tâches
                  </Typography>
                }
                subheader="Par statut"
                action={
                  <IconButton size="small">
                    <MoreHorizontalIcon fontSize="small" />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <ChartContainer>
                  <PieChartIcon sx={{ fontSize: 120, color: theme.palette.grey[300] }} />
                </ChartContainer>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>

        {/* Additional Cards */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
          <Box sx={{ flex: "1 1 48%", minWidth: { xs: "100%", md: "48%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Projets à surveiller
                  </Typography>
                }
                subheader="Projets nécessitant votre attention"
              />
              <Divider />
              <CardContent>
                {/* Projects to watch content */}
                <Typography variant="body2" color="text.secondary">
                  Aucun projet critique pour le moment.
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
          <Box sx={{ flex: "1 1 48%", minWidth: { xs: "100%", md: "48%" } }}>
            <StyledCard>
              <CardHeader
                title={
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Activité récente
                  </Typography>
                }
                subheader="Dernières actions de votre équipe"
              />
              <Divider />
              <CardContent>
                {/* Recent activity content */}
                <Typography variant="body2" color="text.secondary">
                  Aucune activité récente.
                </Typography>
              </CardContent>
            </StyledCard>
          </Box>
        </Box>

        {/* Team Performance */}
        <StyledCard sx={{ mb: 4 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Performance des équipes
              </Typography>
            }
            subheader="Progression et efficacité des équipes"
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
                  <TableCell sx={{ fontWeight: 600 }}>Équipe</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Tâches</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Dans les délais</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamPerformance.map((team) => {
                  const progressColor = getProgressColor(team.progress)

                  return (
                    <TableRow key={team.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {team.team}
                        </Typography>
                      </TableCell>
                      <TableCell>{team.lead}</TableCell>
                      <TableCell>
                        {team.tasksCompleted}/{team.tasksTotal}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={team.progress}
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
                            {team.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{team.onTime}</TableCell>
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

        {/* Projects Table */}
        <StyledCard>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Projets récents
              </Typography>
            }
            subheader="Vue d'ensemble des projets en cours"
            action={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" size="small" startIcon={<FilterIcon />} sx={{ textTransform: "none" }}>
                  Filtrer
                </Button>
                <Button variant="contained" size="small" startIcon={<PlusIcon />} sx={{ textTransform: "none" }}>
                  Ajouter
                </Button>
              </Box>
            }
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
                  <TableCell sx={{ fontWeight: 600 }}>Responsable</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentProjects.map((project) => {
                  const statusColor = getStatusColor(project.statut)
                  const priorityColor = getPriorityColor(project.priorite)
                  const progressColor = getProgressColor(project.progression)

                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {project.nom}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.statut}
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
                          label={project.priorite}
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
                            value={project.progression}
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
                            {project.progression}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{project.responsable}</TableCell>
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
          <Box
            sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${theme.palette.divider}` }}
          >
            <Button
              endIcon={<ArrowRightIcon />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: theme.palette.primary.main,
              }}
            >
              Voir tous les projets
            </Button>
          </Box>
        </StyledCard>
      </Box>
    </AppLayout>
  )
}
