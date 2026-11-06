"use client"

import React, { useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material"
import { Add as AddIcon, Close as CloseIcon, Link as LinkIcon, Delete as DeleteIcon } from "@mui/icons-material"
import { taskApi, projectApi, userApi } from "./apitask"

interface LinkedTasksModalProps {
  open: boolean
  onClose: () => void
  projectId: number
  onSuccess: () => void
}

interface TaskFormData {
  title: string
  description: string
  assigned_to: number
  priority_id: number
  start_date: string
  end_date: string
  depends_on: number[]
}

const LinkedTasksModal: React.FC<LinkedTasksModalProps> = ({ open, onClose, projectId, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projectId || 0)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<TaskFormData[]>([
    {
      title: "",
      description: "",
      assigned_to: 0,
      priority_id: 2,
      start_date: getCurrentDate(),
      end_date: addDays(getCurrentDate(), 7),
      depends_on: [],
    },
  ])
  const [priorities, setPriorities] = useState<any[]>([])
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})
  const [submitError, setSubmitError] = useState<string>("")

  // Fonction pour obtenir la date actuelle au format YYYY-MM-DD
  function getCurrentDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Fonction pour ajouter des jours à une date
  function addDays(dateString: string, days: number) {
    const date = new Date(dateString)
    date.setDate(date.getDate() + days)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  React.useEffect(() => {
    if (open) {
      fetchProjects()
      fetchPriorities()
      if (selectedProjectId) {
        fetchProjectMembers(selectedProjectId)
      }
      // Réinitialiser les erreurs
      setSubmitError("")
      setErrors({})
    }
  }, [open, selectedProjectId])

  const fetchProjects = async () => {
    try {
      const projectsData = await projectApi.getManagedProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error)
      setSubmitError("Erreur lors du chargement des projets")
    }
  }

  const fetchPriorities = async () => {
    try {
      const prioritiesData = await projectApi.getAllPriorities()
      setPriorities(prioritiesData)
    } catch (error) {
      console.error("Erreur lors du chargement des priorités:", error)
      setSubmitError("Erreur lors du chargement des priorités")
    }
  }

  const fetchProjectMembers = async (projectId: number) => {
    try {
      const members = await userApi.getProjectMembers(projectId)
      setProjectMembers(members)
    } catch (error) {
      console.error(`Erreur chargement membres du projet ${projectId}:`, error)
      setProjectMembers([])
      setSubmitError("Erreur lors du chargement des membres du projet")
    }
  }

  const handleAddTask = () => {
    setTasks([
      ...tasks,
      {
        title: "",
        description: "",
        assigned_to: 0,
        priority_id: 2,
        start_date: getCurrentDate(),
        end_date: addDays(getCurrentDate(), 7),
        depends_on: [],
      },
    ])
  }

  const handleRemoveTask = (index: number) => {
    const newTasks = [...tasks]
    newTasks.splice(index, 1)

    // Mettre à jour les dépendances
    const updatedTasks = newTasks.map((task) => {
      const updatedDependsOn = task.depends_on
        .filter((depIndex) => depIndex !== index)
        .map((depIndex) => (depIndex > index ? depIndex - 1 : depIndex))
      return { ...task, depends_on: updatedDependsOn }
    })

    setTasks(updatedTasks)
  }

  const handleTaskChange = (index: number, field: keyof TaskFormData, value: any) => {
    const newTasks = [...tasks]
    newTasks[index] = { ...newTasks[index], [field]: value }
    setTasks(newTasks)

    // Réinitialiser l'erreur pour ce champ
    if (errors[`${index}-${field}`]) {
      setErrors({ ...errors, [`${index}-${field}`]: false })
    }
  }

  const handleToggleDependency = (taskIndex: number, dependsOnIndex: number) => {
    const newTasks = [...tasks]
    const task = newTasks[taskIndex]

    if (task.depends_on.includes(dependsOnIndex)) {
      task.depends_on = task.depends_on.filter((idx) => idx !== dependsOnIndex)
    } else {
      task.depends_on.push(dependsOnIndex)
    }

    setTasks(newTasks)
  }

  const validateTasks = () => {
    const newErrors: { [key: string]: boolean } = {}
    let isValid = true

    if (!selectedProjectId) {
      setSubmitError("Veuillez sélectionner un projet")
      isValid = false
    }

    tasks.forEach((task, index) => {
      if (!task.title.trim()) {
        newErrors[`${index}-title`] = true
        isValid = false
      }
      if (!task.description.trim()) {
        newErrors[`${index}-description`] = true
        isValid = false
      }
      if (task.assigned_to === 0) {
        newErrors[`${index}-assigned_to`] = true
        isValid = false
      }
      if (task.priority_id === 0) {
        newErrors[`${index}-priority_id`] = true
        isValid = false
      }
      if (!task.start_date) {
        newErrors[`${index}-start_date`] = true
        isValid = false
      }
      if (!task.end_date) {
        newErrors[`${index}-end_date`] = true
        isValid = false
      }
      // Validation des dates
      if (task.start_date && task.end_date && new Date(task.start_date) > new Date(task.end_date)) {
        newErrors[`${index}-end_date`] = true
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!selectedProjectId) {
      setSubmitError("Veuillez sélectionner un projet")
      return
    }

    if (!validateTasks()) {
      setSubmitError("Veuillez corriger les erreurs dans le formulaire")
      return
    }

    setLoading(true)
    setSubmitError("")

    try {
      // Préparer les données pour l'API
      const requestData = {
        project_id: selectedProjectId,
        tasks: tasks.map((task, index) => ({
          title: task.title.trim(),
          description: task.description.trim(),
          assigned_to: task.assigned_to,
          priority_id: task.priority_id,
          start_date: task.start_date,
          end_date: task.end_date,
          depends_on: task.depends_on,
          progress: 0, // Valeur par défaut
        })),
      }

      console.log("Données envoyées à l'API:", requestData)

      const response = await taskApi.createLinkedTasks(requestData)

      console.log("Réponse de l'API:", response)

      // Réinitialiser le formulaire
      setTasks([
        {
          title: "",
          description: "",
          assigned_to: 0,
          priority_id: 2,
          start_date: getCurrentDate(),
          end_date: addDays(getCurrentDate(), 7),
          depends_on: [],
        },
      ])
      setSelectedProjectId(0)
      setProjectMembers([])

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Erreur lors de la création des tâches liées:", error)

      // Gestion des erreurs plus détaillée
      if (error.response?.data?.message) {
        setSubmitError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        // Erreurs de validation Laravel
        const validationErrors = error.response.data.errors
        let errorMessage = "Erreurs de validation:\n"
        Object.keys(validationErrors).forEach((key) => {
          errorMessage += `- ${validationErrors[key].join(", ")}\n`
        })
        setSubmitError(errorMessage)
      } else if (error.message) {
        setSubmitError(error.message)
      } else {
        setSubmitError("Erreur lors de la création des tâches liées")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            <LinkIcon sx={{ mr: 1, verticalAlign: "middle", color: "#16A249" }} />
            Créer des tâches liées
          </Typography>
          <IconButton aria-label="close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Créez plusieurs tâches interdépendantes en une seule fois. Les tâches dépendantes ne pourront pas démarrer
            avant que leurs prérequis soient terminés.
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="project-select-label" color="success">
              Sélectionner un projet *
            </InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProjectId || ""}
              label="Sélectionner un projet *"
              onChange={(e) => {
                const projectId = Number(e.target.value)
                setSelectedProjectId(projectId)
                setSubmitError("")
                if (projectId) {
                  fetchProjectMembers(projectId)
                } else {
                  setProjectMembers([])
                }
              }}
              color="success"
              error={!selectedProjectId && submitError.includes("projet")}
              sx={{
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#138a3c" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#16A249" },
              }}
            >
              <MenuItem value="">
                <em>Choisir un projet</em>
              </MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {tasks.map((task, index) => (
          <Paper key={index} elevation={1} sx={{ p: 3, mb: 3, borderLeft: "3px solid #16A249" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Tâche {index + 1}
              </Typography>
              {tasks.length > 1 && (
                <IconButton color="error" onClick={() => handleRemoveTask(index)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Titre de la tâche *"
                fullWidth
                value={task.title}
                onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                error={errors[`${index}-title`]}
                helperText={errors[`${index}-title`] ? "Le titre est requis" : ""}
                color="success"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "darkgreen" },
                    "&.Mui-focused fieldset": { borderColor: "#16A249" },
                  },
                }}
              />

              <TextField
                label="Description *"
                fullWidth
                multiline
                rows={2}
                value={task.description}
                onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                error={errors[`${index}-description`]}
                helperText={errors[`${index}-description`] ? "La description est requise" : ""}
                color="success"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: "darkgreen" },
                    "&.Mui-focused fieldset": { borderColor: "#16A249" },
                  },
                }}
              />

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth error={errors[`${index}-assigned_to`]}>
                  <InputLabel id={`assigned-to-label-${index}`} color="success">
                    Assigné à *
                  </InputLabel>
                  <Select
                    labelId={`assigned-to-label-${index}`}
                    value={task.assigned_to || ""}
                    label="Assigné à *"
                    onChange={(e) => handleTaskChange(index, "assigned_to", e.target.value)}
                    disabled={!selectedProjectId}
                    color="success"
                    sx={{
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#138a3c" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#16A249" },
                    }}
                  >
                    <MenuItem value={0}>
                      <em>Sélectionner un utilisateur</em>
                    </MenuItem>
                    {projectMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`${index}-assigned_to`] && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      L'assignation est requise
                    </Typography>
                  )}
                </FormControl>

                <FormControl fullWidth error={errors[`${index}-priority_id`]}>
                  <InputLabel id={`priority-label-${index}`} color="success">
                    Priorité *
                  </InputLabel>
                  <Select
                    labelId={`priority-label-${index}`}
                    value={task.priority_id || ""}
                    label="Priorité *"
                    onChange={(e) => handleTaskChange(index, "priority_id", e.target.value)}
                    color="success"
                    sx={{
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#138a3c" },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#16A249" },
                    }}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.id} value={priority.id}>
                        {priority.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors[`${index}-priority_id`] && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      La priorité est requise
                    </Typography>
                  )}
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Date de début *"
                  type="date"
                  fullWidth
                  value={task.start_date}
                  onChange={(e) => handleTaskChange(index, "start_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={errors[`${index}-start_date`]}
                  helperText={errors[`${index}-start_date`] ? "La date de début est requise" : ""}
                  color="success"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: "darkgreen" },
                      "&.Mui-focused fieldset": { borderColor: "#16A249" },
                    },
                  }}
                />

                <TextField
                  label="Date de fin *"
                  type="date"
                  fullWidth
                  value={task.end_date}
                  onChange={(e) => handleTaskChange(index, "end_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  error={errors[`${index}-end_date`]}
                  helperText={
                    errors[`${index}-end_date`] ? "La date de fin est requise et doit être après la date de début" : ""
                  }
                  color="success"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: "darkgreen" },
                      "&.Mui-focused fieldset": { borderColor: "#16A249" },
                    },
                  }}
                />
              </Box>

              {index > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Dépend de:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {tasks.slice(0, index).map((depTask, depIndex) => (
                      <Chip
                        key={depIndex}
                        label={`Tâche ${depIndex + 1}${depTask.title ? `: ${depTask.title.substring(0, 15)}${depTask.title.length > 15 ? "..." : ""}` : ""}`}
                        onClick={() => handleToggleDependency(index, depIndex)}
                        color={task.depends_on.includes(depIndex) ? "success" : "default"}
                        variant={task.depends_on.includes(depIndex) ? "filled" : "outlined"}
                        sx={{
                          "&.MuiChip-colorSuccess": {
                            backgroundColor: "#16A249",
                            color: "white",
                          },
                          cursor: "pointer",
                        }}
                      />
                    ))}
                    {index > 0 && tasks.slice(0, index).length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Aucune tâche précédente disponible
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTask}
          variant="outlined"
          color="success"
          fullWidth
          sx={{
            mt: 2,
            borderColor: "#16A249",
            color: "#16A249",
            "&:hover": {
              borderColor: "#138a3c",
              backgroundColor: "rgba(22, 162, 73, 0.04)",
            },
          }}
        >
          Ajouter une autre tâche
        </Button>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{
            textTransform: "none",
            color: "#6B7280",
            borderColor: "#6B7280",
            "&:hover": {
              backgroundColor: "#6B7280",
              color: "white",
              borderColor: "#6B7280",
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          disabled={loading || !selectedProjectId}
          sx={{
            bgcolor: "#16A249",
            border: "1px solid #16A249",
            textTransform: "none",
            borderRadius: 1,
            px: 3,
            "&:hover": {
              bgcolor: "#138a3c",
              borderColor: "#138a3c",
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Créer les tâches liées"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default LinkedTasksModal
