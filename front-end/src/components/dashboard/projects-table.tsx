"use client"

import type React from "react"
import {
  Box,
  Typography,
  IconButton,
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
  CardHeader,
  Divider,
  useTheme,
  Tooltip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { ArrowRightIcon, FilterIcon, PlusIcon, EyeIcon, EditIcon, TrashIcon } from "lucide-react"
import type { Project } from "../../pages/project/apiprojet"

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

interface ProjectsTableProps {
  projects: Project[]
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects }) => {
  const theme = useTheme()

  // Fonction pour formater les données du projet
  const formatProjectData = (project: Project) => {
    const statusName = project.status?.name || "Inconnu"
    const priorityName = project.priority?.name || "Moyenne"
    const progress = project.progress || 0

    return {
      id: project.id,
      nom: project.title,
      statut: statusName,
      progression: progress,
      responsable: "Responsable", // À remplacer par les données réelles
      priorite: priorityName,
    }
  }

  const formattedProjects = projects.map(formatProjectData)

  return (
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
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
              Filtrer
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<PlusIcon />}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
              }}
            >
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
            {formattedProjects.length > 0 ? (
              formattedProjects.map((project) => {
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
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Voir les détails">
                          <IconButton size="small" sx={{ mr: 0.5 }}>
                            <EyeIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton size="small" sx={{ mr: 0.5 }}>
                            <EditIcon size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error">
                            <TrashIcon size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucun projet trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${theme.palette.divider}` }}>
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
  )
}

export default ProjectsTable
