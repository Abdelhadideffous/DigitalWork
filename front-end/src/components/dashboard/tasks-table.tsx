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
  Avatar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { ArrowRightIcon, FilterIcon, PlusIcon, EditIcon, TrashIcon, CheckCircleIcon } from "lucide-react"
import type { Task } from "../../pages/task/apitask"

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

interface TasksTableProps {
  tasks: Task[]
}

const TasksTable: React.FC<TasksTableProps> = ({ tasks }) => {
  const theme = useTheme()

  // Fonction pour formater les données de la tâche
  const formatTaskData = (task: Task) => {
    const statusName = task.status?.name || "Inconnu"
    const priorityName = task.priority?.name || "Moyenne"
    const progress = task.progress || 0
    const assignedUser = task.assigned_user?.name || "Non assigné"

    return {
      id: task.id,
      title: task.title,
      status: statusName,
      progress: progress,
      assignedTo: assignedUser,
      priority: priorityName,
      projectName: task.project?.title || "Projet inconnu",
      dueDate: task.end_date ? new Date(task.end_date).toLocaleDateString() : "Non défini",
    }
  }

  const formattedTasks = tasks.map(formatTaskData)

  // Fonction pour obtenir les initiales d'un nom
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Fonction pour obtenir une couleur aléatoire pour l'avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      "#1976d2",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
    ]

    // Utiliser le nom pour générer un index de couleur
    const charSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return colors[charSum % colors.length]
  }

  return (
    <StyledCard>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Tâches récentes
          </Typography>
        }
        subheader="Vue d'ensemble des tâches en cours"
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
              <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigné à</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date limite</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formattedTasks.length > 0 ? (
              formattedTasks.map((task) => {
                const statusColor = getStatusColor(task.status)
                const priorityColor = getPriorityColor(task.priority)
                const progressColor = getProgressColor(task.progress)
                const initials = getInitials(task.assignedTo)
                const avatarColor = getAvatarColor(task.assignedTo)

                return (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{task.projectName}</TableCell>
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
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: avatarColor,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Typography variant="body2">{task.assignedTo}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{
                            width: 80,
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
                          {task.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Terminer">
                          <IconButton size="small" sx={{ mr: 0.5, color: "#4caf50" }}>
                            <CheckCircleIcon size={18} />
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
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aucune tâche trouvée
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
          Voir toutes les tâches
        </Button>
      </Box>
    </StyledCard>
  )
}

export default TasksTable
