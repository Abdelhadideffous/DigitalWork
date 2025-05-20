import type React from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  type SxProps,
  type Theme,
} from "@mui/material"
import { ArrowRight, CheckCircle, Edit, Trash, Plus, Filter, MoreHorizontal } from "lucide-react"

interface Task {
  id: number
  title: string
  status?: { name: string }
  status_id?: number
  priority?: { name: string }
  priority_id?: number
  progress?: number
  end_date?: string
  project?: { title: string }
  assigned_user?: { name: string }
}

interface UpcomingTasksProps {
  tasks: Task[]
  sx?: SxProps<Theme>
}

const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ tasks, sx }) => {
  // Fonction pour obtenir la couleur du statut
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

  // Fonction pour obtenir la couleur de la priorité
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

  // Fonction pour formater les données de la tâche
  const formatTaskData = (task: Task) => {
    const statusName = task.status?.name || "Inconnu"
    const priorityName = task.priority?.name || "Moyenne"
    const dueDate = task.end_date ? new Date(task.end_date).toLocaleDateString("fr-FR") : "Non défini"
    const projectName = task.project?.title || "Projet inconnu"
    const assignedUser = task.assigned_user?.name || "Non assigné"

    return {
      id: task.id,
      title: task.title,
      status: statusName,
      priority: priorityName,
      dueDate,
      projectName,
      assignedUser,
    }
  }

  const formattedTasks = tasks.map(formatTaskData)

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tâches à venir
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Filter size={16} />}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
                borderColor: "rgba(0,0,0,0.1)",
                color: "text.secondary",
                "&:hover": { borderColor: "rgba(0,0,0,0.2)" },
              }}
            >
              Filtrer
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              sx={{
                textTransform: "none",
                borderRadius: 1.5,
                bgcolor: "#16A249",
                "&:hover": { bgcolor: "#138a3c" },
              }}
            >
              Ajouter
            </Button>
            <IconButton size="small">
              <MoreHorizontal size={18} />
            </IconButton>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "rgba(0,0,0,0.02)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Projet</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priorité</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigné à</TableCell>
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
                  const initials = getInitials(task.assignedUser)
                  const avatarColor = getAvatarColor(task.assignedUser)

                  return (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {task.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                          {task.projectName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            fontWeight: 600,
                            borderRadius: "6px",
                            fontSize: "0.75rem",
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
                            fontSize: "0.75rem",
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
                          <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                            {task.assignedUser}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                          {task.dueDate}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Tooltip title="Terminer">
                            <IconButton size="small" sx={{ mr: 0.5, color: "#4caf50" }}>
                              <CheckCircle size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton size="small" sx={{ mr: 0.5 }}>
                              <Edit size={16} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" color="error">
                              <Trash size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aucune tâche trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <Button
            endIcon={<ArrowRight size={16} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "#16A249",
              "&:hover": { bgcolor: "rgba(22, 162, 73, 0.05)" },
            }}
          >
            Voir toutes les tâches
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UpcomingTasks
