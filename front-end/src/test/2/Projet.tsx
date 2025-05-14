"use client"

import {
  Add,
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert,
  Search as SearchIcon,
  ChatBubbleOutline,
  ThumbUpAltOutlined,
  ThumbUp,
  Send as SendIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"

import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  type SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material"
import type React from "react"
import { useEffect, useState } from "react"
import { projectApi, type Comment, type Priority, type Project, type Status, type Task } from "./apiprojet"
import AppLayout from "../layout/AppLayout"
import { getCurrentUser } from "../login/api"

const Projet: React.FC = () => {
  // État pour le menu d'actions des projets
  const [projectActionMenuAnchorEl, setProjectActionMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const openProjectActionMenu = Boolean(projectActionMenuAnchorEl)

  // État pour suivre les commentaires aimés
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set())

  // Récupérer l'utilisateur connecté depuis le localStorage
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Fonction pour obtenir la date actuelle au format YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // Fonction pour ajouter des mois à une date
  const addMonths = (dateString: string, months: number) => {
    const date = new Date(dateString)
    date.setMonth(date.getMonth() + months)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // État pour le formulaire de nouveau projet
  const [openNewProjectDialog, setOpenNewProjectDialog] = useState(false)
  const [newProjectData, setNewProjectData] = useState({
    title: "",
    description: "",
    start_date: getCurrentDate(),
    end_date: addMonths(getCurrentDate(), 1),
    status_id: 1, // Par défaut "En attente"
    priority_id: 2, // Par défaut "Moyenne"
  })
  const [newProjectErrors, setNewProjectErrors] = useState({
    title: false,
    description: false,
    start_date: false,
    end_date: false,
    priority_id: false,
  })

  // État pour la vue détaillée d'un projet
  const [showProjectDetails, setShowProjectDetails] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [tabValue, setTabValue] = useState(0)

  // État pour la recherche
  const [searchProjectQuery, setSearchProjectQuery] = useState("")

  // État pour le filtre de statut
  const [statusFilter, setStatusFilter] = useState("Tous les statuts")

  // État pour l'affichage du panneau de filtres
  const [showFilters, setShowFilters] = useState(false)

  // État pour les dialogues d'édition et de suppression de projet
  const [openEditProjectDialog, setOpenEditProjectDialog] = useState(false)
  const [openDeleteProjectDialog, setOpenDeleteProjectDialog] = useState(false)
  const [editProjectData, setEditProjectData] = useState({
    id: 0,
    title: "",
    description: "",
    start_date: getCurrentDate(),
    end_date: getCurrentDate(),
    status_id: 1,
    priority_id: 2,
  })
  const [editProjectErrors, setEditProjectErrors] = useState({
    title: false,
    description: false,
    start_date: false,
    end_date: false,
    status_id: false,
    priority_id: false,
  })

  // État pour les commentaires
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editCommentContent, setEditCommentContent] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentActionMenuAnchorEl, setCommentActionMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
  const openCommentActionMenu = Boolean(commentActionMenuAnchorEl)

  // État pour les réponses aux commentaires
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // État pour les équipes du projet
  const [projectTeams, setProjectTeams] = useState<any[]>([])
  const [loadingTeams, setLoadingTeams] = useState(false)

  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  })

  // État pour l'indicateur de chargement
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Données des projets, équipes, statuts et priorités
  const [projects, setProjects] = useState<Project[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [priorities, setPriorities] = useState<Priority[]>([])

  // Ajouter ces états après les autres déclarations d'état
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(false)

  // Récupérer l'utilisateur connecté au chargement du composant
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      window.location.href = "/test/login"
    }
  }, [])

  // Surveiller les changements d'utilisateur dans le localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const user = getCurrentUser()
      if (user) {
        setCurrentUser(user)
      } else {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = "/test/login"
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Fonction pour charger les projets depuis l'API
  const fetchProjects = async () => {
    try {
      setInitialLoading(true)
      const projectsData = await projectApi.getAllProjects()
      setProjects(projectsData)
      setInitialLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des projets:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des projets",
        severity: "error",
      })
      setInitialLoading(false)
    }
  }

  // Fonction pour charger les statuts depuis l'API
  const fetchStatuses = async () => {
    try {
      const statusesData = await projectApi.getAllStatuses()
      setStatuses(statusesData)
    } catch (error) {
      console.error("Erreur lors du chargement des statuts:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des statuts",
        severity: "error",
      })
    }
  }

  // Fonction pour charger les priorités depuis l'API
  const fetchPriorities = async () => {
    try {
      const prioritiesData = await projectApi.getAllPriorities()
      setPriorities(prioritiesData)
    } catch (error) {
      console.error("Erreur lors du chargement des priorités:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des priorités",
        severity: "error",
      })
    }
  }

  // Fonction pour analyser la structure des commentaires
  const analyzeComments = (commentsData: Comment[]) => {
    console.log("Analyse des commentaires:")
    console.log("Total des commentaires:", commentsData.length)

    const parentComments = commentsData.filter((c) => !c.parent_id)
    console.log("Commentaires parents:", parentComments.length, parentComments)

    const replies = commentsData.filter((c) => c.parent_id)
    console.log("Réponses:", replies.length, replies)

    // Vérifier les valeurs possibles de parent_id
    const parentIdValues = new Set(commentsData.map((c) => c.parent_id))
    console.log("Valeurs de parent_id:", [...parentIdValues])
  }

  // Fonction pour charger les commentaires d'un projet
  const fetchComments = async (projectId: number) => {
    try {
      setLoadingComments(true)
      const commentsData = await projectApi.getProjectComments(projectId)
      console.log("Commentaires chargés:", commentsData)

      // Analyser la structure des commentaires
      analyzeComments(commentsData)

      setComments(commentsData)
      setLoadingComments(false)
    } catch (error) {
      console.error(`Erreur lors du chargement des commentaires du projet ${projectId}:`, error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des commentaires",
        severity: "error",
      })
      setLoadingComments(false)
    }
  }

  // Ajouter cette fonction après les autres fonctions de chargement
  const fetchTasks = async (projectId: number) => {
    try {
      setLoadingTasks(true)
      const tasksData = await projectApi.getProjectTasks(projectId)
      setTasks(tasksData)
      setLoadingTasks(false)
    } catch (error) {
      console.error(`Erreur lors du chargement des tâches du projet ${projectId}:`, error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des tâches",
        severity: "error",
      })
      setLoadingTasks(false)
    }
  }

  // Fonction pour charger les équipes d'un projet
  const fetchProjectTeams = async (projectId: number) => {
    try {
      setLoadingTeams(true)
      const teamsData = await projectApi.getProjectTeams(projectId)
      setProjectTeams(teamsData)
      setLoadingTeams(false)
    } catch (error) {
      console.error(`Erreur lors du chargement des équipes du projet ${projectId}:`, error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des équipes du projet",
        severity: "error",
      })
      setLoadingTeams(false)
    }
  }

  // Charger les projets, équipes, statuts et priorités au chargement du composant
  useEffect(() => {
    if (currentUser) {
      fetchProjects()
      fetchStatuses()
      fetchPriorities()
    }
  }, [currentUser])

  // Charger les commentaires lorsqu'un projet est sélectionné et que l'onglet commentaires est actif
  useEffect(() => {
    if (showProjectDetails && selectedProject?.id && tabValue === 3) {
      fetchComments(selectedProject.id)
    }
  }, [showProjectDetails, selectedProject?.id, tabValue])

  // Ajouter cet useEffect pour charger les tâches quand l'onglet tâches est actif
  useEffect(() => {
    if (showProjectDetails && selectedProject?.id && tabValue === 1) {
      fetchTasks(selectedProject.id)
    }
  }, [showProjectDetails, selectedProject?.id, tabValue])

  // Charger les équipes lorsqu'un projet est sélectionné et que l'onglet équipe est actif
  useEffect(() => {
    if (showProjectDetails && selectedProject?.id && tabValue === 2) {
      fetchProjectTeams(selectedProject.id)
    }
  }, [showProjectDetails, selectedProject?.id, tabValue])

  // Ajouter des états pour les filtres de priorité, date de début et date de fin
  const [priorityFilter, setPriorityFilter] = useState("Toutes les priorités")
  const [startDateFilter, setStartDateFilter] = useState("")
  const [endDateFilter, setEndDateFilter] = useState("")

  // Filtrage des projets par recherche et statut
  const filteredProjects = projects.filter((project) => {
    // Filtre par recherche
    const matchesSearch = project.title.toLowerCase().includes(searchProjectQuery.toLowerCase())

    // Filtre par statut
    const matchesStatus = statusFilter === "Tous les statuts" || project.status?.name === statusFilter

    // Filtre par priorité
    const matchesPriority = priorityFilter === "Toutes les priorités" || project.priority?.name === priorityFilter

    // Filtre par date de début
    const matchesStartDate = !startDateFilter || new Date(project.start_date) >= new Date(startDateFilter)

    // Filtre par date de fin
    const matchesEndDate = !endDateFilter || new Date(project.end_date) <= new Date(endDateFilter)

    return matchesSearch && matchesStatus && matchesPriority && matchesStartDate && matchesEndDate
  })

  // Fermer le menu d'actions des projets lorsqu'on navigue vers les détails d'un projet
  useEffect(() => {
    if (showProjectDetails) {
      handleProjectActionMenuClose()
    }
  }, [showProjectDetails])

  const handleProjectActionMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: number) => {
    event.stopPropagation() // Empêcher la propagation pour éviter de déclencher handleViewProjectDetails
    setProjectActionMenuAnchorEl(event.currentTarget)
    setSelectedProjectId(projectId)
  }

  const handleProjectActionMenuClose = () => {
    setProjectActionMenuAnchorEl(null)
    // Ne pas effacer selectedProjectId ici, car nous en avons besoin pour la suppression
  }

  const handleCommentActionMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: number) => {
    event.stopPropagation()
    setCommentActionMenuAnchorEl(event.currentTarget)
    setSelectedCommentId(commentId)
  }

  const handleCommentActionMenuClose = () => {
    setCommentActionMenuAnchorEl(null)
  }

  const handleNewProjectDialogOpen = () => {
    setOpenNewProjectDialog(true)
    setNewProjectData({
      title: "",
      description: "",
      start_date: getCurrentDate(),
      end_date: addMonths(getCurrentDate(), 1),
      status_id: 1, // Par défaut "En attente"
      priority_id: 2, // Par défaut "Moyenne"
    })
    setNewProjectErrors({
      title: false,
      description: false,
      start_date: false,
      end_date: false,
      priority_id: false,
    })
  }

  const handleNewProjectDialogClose = () => {
    setOpenNewProjectDialog(false)
    setNewProjectData({
      title: "",
      description: "",
      start_date: getCurrentDate(),
      end_date: addMonths(getCurrentDate(), 1),
      status_id: 1,
      priority_id: 2,
    })
    setNewProjectErrors({
      title: false,
      description: false,
      start_date: false,
      end_date: false,
      priority_id: false,
    })
  }

  const handleNewProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProjectData({
      ...newProjectData,
      [name]: value,
    })

    // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
    if (newProjectErrors[name as keyof typeof newProjectErrors]) {
      setNewProjectErrors({
        ...newProjectErrors,
        [name]: false,
      })
    }
  }

  const handleNewProjectPriorityChange = (e: SelectChangeEvent<string>) => {
    setNewProjectData({
      ...newProjectData,
      priority_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si une priorité est sélectionnée
    if (newProjectErrors.priority_id) {
      setNewProjectErrors({
        ...newProjectErrors,
        priority_id: false,
      })
    }
  }

  // Ajouter les gestionnaires d'événements pour les filtres
  const handlePriorityFilterChange = (e: SelectChangeEvent<string>) => {
    setPriorityFilter(e.target.value)
  }

  const handleStartDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateFilter(e.target.value)
  }

  const handleEndDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDateFilter(e.target.value)
  }

  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setStatusFilter(e.target.value)
  }

  const handleViewProjectDetails = async (projectId: number, event?: React.MouseEvent) => {
    // Si l'événement est fourni, empêcher la propagation
    if (event) {
      event.stopPropagation()
    }

    // Fermer le menu d'actions des projets s'il est ouvert
    if (projectActionMenuAnchorEl) {
      handleProjectActionMenuClose()
    }

    try {
      setLoading(true)
      const projectDetails = await projectApi.getProjectById(projectId)
      setSelectedProject(projectDetails)
      setShowProjectDetails(true)

      // Charger les données immédiatement pour tous les onglets
      fetchTasks(projectId)
      fetchProjectTeams(projectId)
      fetchComments(projectId)

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des détails du projet:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des détails du projet",
        severity: "error",
      })
      setLoading(false)
    }
  }

  const handleBackToProjectsList = () => {
    setShowProjectDetails(false)
    setSelectedProject(null)
    setTabValue(0)
    setSearchProjectQuery("")
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Fonctions pour gérer l'édition d'un projet
  const handleEditProjectDialogOpen = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setEditProjectData({
        id: project.id,
        title: project.title,
        description: project.description,
        start_date: project.start_date,
        end_date: project.end_date,
        status_id: project.status_id,
        priority_id: project.priority_id,
      })
      setEditProjectErrors({
        title: false,
        description: false,
        start_date: false,
        end_date: false,
        status_id: false,
        priority_id: false,
      })

      setOpenEditProjectDialog(true)
    }
    handleProjectActionMenuClose()
  }

  const handleEditProjectDialogClose = () => {
    setOpenEditProjectDialog(false)
    setEditProjectErrors({
      title: false,
      description: false,
      start_date: false,
      end_date: false,
      status_id: false,
      priority_id: false,
    })
  }

  const handleEditProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditProjectData({
      ...editProjectData,
      [name]: value,
    })

    // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
    if (editProjectErrors[name as keyof typeof editProjectErrors]) {
      setEditProjectErrors({
        ...editProjectErrors,
        [name]: false,
      })
    }
  }

  const handleEditProjectStatusChange = (e: SelectChangeEvent<string>) => {
    setEditProjectData({
      ...editProjectData,
      status_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si un statut est sélectionné
    if (editProjectErrors.status_id) {
      setEditProjectErrors({
        ...editProjectErrors,
        status_id: false,
      })
    }
  }

  const handleEditProjectPriorityChange = (e: SelectChangeEvent<string>) => {
    setEditProjectData({
      ...editProjectData,
      priority_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si une priorité est sélectionnée
    if (editProjectErrors.priority_id) {
      setEditProjectErrors({
        ...editProjectErrors,
        priority_id: false,
      })
    }
  }

  const handleUpdateProject = async () => {
    // Validation des champs
    const titleEmpty = editProjectData.title.trim() === ""
    const descriptionEmpty = editProjectData.description.trim() === ""
    const startDateInvalid = !editProjectData.start_date
    const endDateInvalid = !editProjectData.end_date
    const statusEmpty = !editProjectData.status_id
    const priorityEmpty = !editProjectData.priority_id

    setEditProjectErrors({
      ...editProjectErrors,
      title: titleEmpty,
      description: descriptionEmpty,
      start_date: startDateInvalid,
      end_date: endDateInvalid,
      status_id: statusEmpty,
      priority_id: priorityEmpty,
    })

    // Si tous les champs sont remplis, procéder à la mise à jour
    if (!titleEmpty && !descriptionEmpty && !startDateInvalid && !endDateInvalid && !statusEmpty && !priorityEmpty) {
      try {
        setLoading(true)
        await projectApi.updateProject(editProjectData.id, editProjectData)

        setSnackbar({
          open: true,
          message: "Projet mis à jour avec succès",
          severity: "success",
        })

        handleEditProjectDialogClose()
        // Recharger la liste des projets
        fetchProjects()

        // Si nous sommes dans la vue détaillée du projet modifié, recharger les détails
        if (showProjectDetails && selectedProject?.id === editProjectData.id) {
          await handleViewProjectDetails(editProjectData.id)
        }

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors de la mise à jour du projet:", error)
        setSnackbar({
          open: true,
          message: "Erreur lors de la mise à jour du projet",
          severity: "error",
        })
        setLoading(false)
      }
    }
  }

  // Fonctions pour gérer la suppression d'un projet
  const handleDeleteProjectDialogOpen = (projectId: number) => {
    setSelectedProjectId(projectId)
    setOpenDeleteProjectDialog(true)
    handleProjectActionMenuClose()
  }

  const handleDeleteProjectDialogClose = () => {
    setOpenDeleteProjectDialog(false)
    // Effacer selectedProjectId seulement lorsque le dialogue est fermé
    setSelectedProjectId(null)
  }

  const handleDeleteProject = async () => {
    // Stocker l'ID dans une variable locale pour s'assurer qu'il ne change pas
    const projectIdToDelete = selectedProjectId

    if (!projectIdToDelete) return

    try {
      setLoading(true)
      await projectApi.deleteProject(projectIdToDelete)

      // Fermer le dialogue de confirmation
      handleDeleteProjectDialogClose()

      // Si nous sommes dans la vue détaillée du projet supprimé, revenir à la liste
      if (showProjectDetails && selectedProject?.id === projectIdToDelete) {
        handleBackToProjectsList()
      }

      // Recharger la liste des projets
      fetchProjects()

      setLoading(false)

      // Afficher le Snackbar de succès
      setSnackbar({
        open: true,
        message: "Projet supprimé avec succès",
        severity: "success",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error)
      setLoading(false)
      handleDeleteProjectDialogClose()
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression du projet",
        severity: "error",
      })
    }
  }

  const handleCreateNewProject = async () => {
    // Validation des champs
    const titleEmpty = newProjectData.title.trim() === ""
    const descriptionEmpty = newProjectData.description.trim() === ""
    const startDateInvalid = !newProjectData.start_date
    const endDateInvalid = !newProjectData.end_date
    const priorityEmpty = !newProjectData.priority_id

    setNewProjectErrors({
      ...newProjectErrors,
      title: titleEmpty,
      description: descriptionEmpty,
      start_date: startDateInvalid,
      end_date: endDateInvalid,
      priority_id: priorityEmpty,
    })

    // Si tous les champs sont remplis, procéder à la création
    if (!titleEmpty && !descriptionEmpty && !startDateInvalid && !endDateInvalid && !priorityEmpty) {
      try {
        setLoading(true)
        await projectApi.createProject(newProjectData)

        setSnackbar({
          open: true,
          message: "Projet créé avec succès",
          severity: "success",
        })

        handleNewProjectDialogClose()
        // Recharger la liste des projets
        fetchProjects()

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors de la création du projet:", error)
        setSnackbar({
          open: true,
          message: "Erreur lors de la création du projet",
          severity: "error",
        })
        setLoading(false)
      }
    }
  }

  // Fonctions pour gérer les commentaires
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedProject?.id || !currentUser) return

    try {
      setLoading(true)
      await projectApi.addComment({
        content: newComment,
        user_id: currentUser.id,
        project_id: selectedProject.id,
      })

      // Réinitialiser le champ de commentaire
      setNewComment("")

      // Recharger les commentaires
      await fetchComments(selectedProject.id)

      setSnackbar({
        open: true,
        message: "Commentaire ajouté avec succès",
        severity: "success",
      })
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de l'ajout du commentaire",
        severity: "error",
      })
      setLoading(false)
    }
  }

  const handleEditComment = (commentId: number) => {
    const comment = comments.find((c) => c.id === commentId)
    if (comment) {
      setEditingCommentId(commentId)
      setEditCommentContent(comment.content)
    }
    handleCommentActionMenuClose()
  }

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editCommentContent.trim()) return

    try {
      setLoading(true)
      await projectApi.updateComment(editingCommentId, editCommentContent)

      // Réinitialiser l'état d'édition
      setEditingCommentId(null)
      setEditCommentContent("")

      // Recharger les commentaires
      if (selectedProject?.id) {
        await fetchComments(selectedProject.id)
      }

      setSnackbar({
        open: true,
        message: "Commentaire mis à jour avec succès",
        severity: "success",
      })
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du commentaire:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de la mise à jour du commentaire",
        severity: "error",
      })
      setLoading(false)
    }
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentContent("")
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      setLoading(true)
      await projectApi.deleteComment(commentId)

      // Recharger les commentaires
      if (selectedProject?.id) {
        await fetchComments(selectedProject.id)
      }

      setSnackbar({
        open: true,
        message: "Commentaire supprimé avec succès",
        severity: "success",
      })
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression du commentaire",
        severity: "error",
      })
      setLoading(false)
    }
    handleCommentActionMenuClose()
  }

  // Fonctions pour gérer les réponses aux commentaires
  const handleReplyToComment = (commentId: number) => {
    setReplyingToCommentId(commentId)
    setReplyContent("")
  }

  const handleCancelReply = () => {
    setReplyingToCommentId(null)
    setReplyContent("")
  }

  const handleSubmitReply = async () => {
    if (!replyingToCommentId || !replyContent.trim() || !selectedProject?.id || !currentUser) return

    try {
      setLoading(true)
      await projectApi.addComment({
        content: replyContent,
        user_id: currentUser.id,
        project_id: selectedProject.id,
        parent_id: replyingToCommentId, // Ajouter l'ID du commentaire parent
      })

      // Réinitialiser l'état de réponse
      setReplyingToCommentId(null)
      setReplyContent("")

      // Recharger les commentaires
      await fetchComments(selectedProject.id)

      setSnackbar({
        open: true,
        message: "Réponse ajoutée avec succès",
        severity: "success",
      })
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de l'ajout de la réponse:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de l'ajout de la réponse",
        severity: "error",
      })
      setLoading(false)
    }
  }

  // Fonction pour fermer la notification
  const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
    // Ne pas fermer le Snackbar si l'utilisateur clique en dehors
    if (reason === "clickaway") {
      return
    }

    // Fermer le Snackbar
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }))
  }

  // Fonction pour obtenir le nom du statut à partir de l'ID
  const getStatusName = (statusId: number) => {
    const status = statuses.find((s) => s.id === statusId)
    return status ? status.name : "Inconnu"
  }

  // Fonction pour obtenir le nom de la priorité à partir de l'ID
  const getPriorityName = (priorityId: number) => {
    const priority = priorities.find((p) => p.id === priorityId)
    return priority ? priority.name : "Inconnue"
  }

  // Fonction pour formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [year, month, day] = dateString.split("-")
    return `${day}/${month}/${year}`
  }

  // Fonction pour formater la date et l'heure pour l'affichage des commentaires
  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return ""
    const date = new Date(dateTimeString)
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Fonction pour générer les initiales d'un nom
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Fonction pour gérer les "j'aime" sur les commentaires
  const handleToggleLike = async (commentId: number) => {
    try {
      setLoading(true)

      // Vérifier si le commentaire est déjà aimé
      const isLiked = likedComments.has(commentId)

      if (isLiked) {
        // Si déjà aimé, retirer le like
        await projectApi.unlikeComment(commentId)

        // Mettre à jour l'état local
        const newLikedComments = new Set(likedComments)
        newLikedComments.delete(commentId)
        setLikedComments(newLikedComments)
      } else {
        // Sinon, ajouter un like
        await projectApi.likeComment(commentId)

        // Mettre à jour l'état local
        const newLikedComments = new Set(likedComments)
        newLikedComments.add(commentId)
        setLikedComments(newLikedComments)
      }

      // Recharger les commentaires pour mettre à jour le compteur de likes
      if (selectedProject?.id) {
        await fetchComments(selectedProject.id)
      }

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la gestion du like du commentaire:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de la gestion du like",
        severity: "error",
      })
      setLoading(false)
    }
  }

  // Afficher un indicateur de chargement pendant le chargement initial
  if (initialLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress color="success" />
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Indicateur de chargement */}
      {loading && (
        <LinearProgress color="success" sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}

      {/* Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Contenu de la page Projet */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {showProjectDetails ? (
          // Vue détaillée d'un projet
          <>
            {/* Fil d'Ariane et en-tête combinés */}
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link
                  underline="hover"
                  color="inherit"
                  href="/test/1"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBackToProjectsList()
                  }}
                >
                  Tableau de bord
                </Link>
                <Link
                  underline="hover"
                  color="inherit"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBackToProjectsList()
                  }}
                >
                  Projets
                </Link>
                <Typography color="text.primary">{selectedProject?.id}</Typography>
              </Breadcrumbs>

              {/* Remplacer cette section dans la vue détaillée d'un projet */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={handleBackToProjectsList} sx={{ mr: 1, p: 0 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ flex: 1, fontWeight: "bold" }}>
                  {selectedProject?.title}
                </Typography>
              </Box>
            </Box>

            {/* Espace après le titre */}
            <Box sx={{ mb: 3 }}></Box>

            {/* Onglets */}
            <Box sx={{ width: "100%", mb: 4 }}>
              <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="project tabs"
                  variant="fullWidth"
                  sx={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: "medium",
                      fontSize: "1rem",
                      py: 2,
                    },
                    "& .Mui-selected": {
                      color: "#16A249 !important",
                      fontWeight: "bold",
                    },
                    "& .MuiTabs-indicator": {
                      backgroundColor: "#16A249", // green underline
                    },
                  }}
                >
                  <Tab label="Vue d'ensemble" />
                  <Tab label="Tâches" />
                  <Tab label="Équipe" />
                  <Tab label="Commentaires" />
                </Tabs>

                {/* Contenu de l'onglet Vue d'ensemble */}
                <Box role="tabpanel" hidden={tabValue !== 0} sx={{ p: 3 }}>
                  {tabValue === 0 && (
                    <>
                      {/* Nouvelle mise en page pour la vue d'ensemble */}
                      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                        {/* Colonne de gauche - Informations du projet et statistiques */}
                        <Box sx={{ flex: "1", display: "flex", flexDirection: "column", gap: 3 }}>
                          {/* Carte d'informations du projet */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "linear-gradient(to right bottom, #ffffff, #f9fdfb)",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" color="#16A249">
                                Informations du projet
                              </Typography>
                              <Chip
                                label={selectedProject?.status?.name || getStatusName(selectedProject?.status_id)}
                                color={
                                  selectedProject?.status?.name === "En cours" ||
                                  getStatusName(selectedProject?.status_id) === "En cours"
                                    ? "success"
                                    : selectedProject?.status?.name === "En attente" ||
                                        getStatusName(selectedProject?.status_id) === "En attente"
                                      ? "warning"
                                      : "default"
                                }
                                sx={{ fontWeight: "medium" }}
                              />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Description
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ backgroundColor: "rgba(0,0,0,0.02)", p: 2, borderRadius: 1 }}
                              >
                                {selectedProject?.description}
                              </Typography>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Priorité
                                </Typography>
                                <Chip
                                  label={
                                    selectedProject?.priority?.name || getPriorityName(selectedProject?.priority_id)
                                  }
                                  color={
                                    selectedProject?.priority?.name === "Haute" ||
                                    getPriorityName(selectedProject?.priority_id) === "Haute"
                                      ? "error"
                                      : "success"
                                  }
                                  size="small"
                                  sx={{ fontWeight: "medium" }}
                                />
                              </Box>

                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Date de début
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {formatDate(selectedProject?.start_date)}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Date d'échéance
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="medium"
                                  color={
                                    new Date(selectedProject?.end_date) < new Date() ? "error.main" : "text.primary"
                                  }
                                >
                                  {formatDate(selectedProject?.end_date)}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Durée
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {(() => {
                                    const start = new Date(selectedProject?.start_date)
                                    const end = new Date(selectedProject?.end_date)
                                    const diffTime = Math.abs(end.getTime() - start.getTime())
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    return `${diffDays} jours`
                                  })()}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>

                          {/* Statistiques du projet */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "linear-gradient(to right bottom, #ffffff, #f9fdfb)",
                            }}
                          >
                            <Typography variant="h6" fontWeight="bold" color="#16A249" gutterBottom>
                              Statistiques
                            </Typography>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                              {/* Statistiques des tâches */}
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  backgroundColor: "rgba(22, 162, 73, 0.08)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="subtitle2" color="text.secondary">
                                  Tâches
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                  <Typography variant="h4" fontWeight="bold" color="#16A249">
                                    {tasks.length}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {
                                      tasks.filter(
                                        (t) => t.status?.name === "Terminé" || getStatusName(t.status_id) === "Terminé",
                                      ).length
                                    }{" "}
                                    terminées
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={
                                    tasks.length > 0
                                      ? (tasks.filter(
                                          (t) =>
                                            t.status?.name === "Terminé" || getStatusName(t.status_id) === "Terminé",
                                        ).length /
                                          tasks.length) *
                                        100
                                      : 0
                                  }
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: "#16A249",
                                    },
                                  }}
                                />
                              </Box>

                              {/* Statistiques des équipes */}
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="subtitle2" color="text.secondary">
                                  Équipes
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {projectTeams.length}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {projectTeams.reduce((acc, team) => acc + (team.members?.length || 0), 0)} membres
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={100}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: "primary.main",
                                    },
                                  }}
                                />
                              </Box>
                            </Box>

                            {/* Tâches par statut */}
                            <Box sx={{ mt: 3 }}>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Tâches par statut
                              </Typography>

                              {statuses.map((status) => {
                                const tasksWithStatus = tasks.filter(
                                  (t) => t.status?.name === status.name || getStatusName(t.status_id) === status.name,
                                )
                                const percentage = tasks.length > 0 ? (tasksWithStatus.length / tasks.length) * 100 : 0

                                return (
                                  <Box key={status.id} sx={{ mb: 2 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                      <Typography variant="body2">{status.name}</Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {tasksWithStatus.length} ({percentage.toFixed(0)}%)
                                      </Typography>
                                    </Box>
                                    <LinearProgress
                                      variant="determinate"
                                      value={percentage}
                                      sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: "rgba(0,0,0,0.04)",
                                        "& .MuiLinearProgress-bar": {
                                          backgroundColor:
                                            status.name === "En cours"
                                              ? "#16A249"
                                              : status.name === "En attente"
                                                ? "#ed6c02"
                                                : status.name === "Terminé"
                                                  ? "#1976d2"
                                                  : "grey.500",
                                        },
                                      }}
                                    />
                                  </Box>
                                )
                              })}
                            </Box>
                          </Paper>
                        </Box>

                        {/* Colonne de droite - Progression et activité récente */}
                        <Box sx={{ flex: "1", display: "flex", flexDirection: "column", gap: 3 }}>
                          {/* Carte de progression */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "linear-gradient(to right bottom, #ffffff, #f9fdfb)",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" color="#16A249">
                                Progression du projet
                              </Typography>
                              <Typography variant="h5" fontWeight="bold" color="#16A249">
                                {selectedProject?.progress || 0}%
                              </Typography>
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Temps écoulé
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                  {(() => {
                                    const start = new Date(selectedProject?.start_date)
                                    const today = new Date()
                                    const diffTime = Math.abs(today.getTime() - start.getTime())
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    return `${diffDays} jours`
                                  })()}
                                </Typography>
                              </Box>

                              <Box sx={{ textAlign: "right" }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Temps restant
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight="medium"
                                  color={
                                    new Date(selectedProject?.end_date) < new Date() ? "error.main" : "text.primary"
                                  }
                                >
                                  {(() => {
                                    const end = new Date(selectedProject?.end_date)
                                    const today = new Date()
                                    const diffTime = end.getTime() - today.getTime()
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                    return diffDays < 0 ? `Dépassé de ${Math.abs(diffDays)} jours` : `${diffDays} jours`
                                  })()}
                                </Typography>
                              </Box>
                            </Box>

                            {/* Boutons d'action */}
                            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                              <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                onClick={() => setTabValue(1)}
                                sx={{
                                  textTransform: "none",
                                  bgcolor: "#16A249",
                                  "&:hover": { bgcolor: "#138a3c" },
                                }}
                              >
                                Voir les tâches
                              </Button>
                            </Box>
                          </Paper>

                          {/* Activité récente */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 2,
                              border: "1px solid rgba(0,0,0,0.08)",
                              background: "linear-gradient(to right bottom, #ffffff, #f9fdfb)",
                            }}
                          >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="h6" fontWeight="bold" color="#16A249">
                                Activité récente
                              </Typography>
                              <Button
                                variant="text"
                                color="success"
                                size="small"
                                onClick={() => setTabValue(3)}
                                sx={{
                                  textTransform: "none",
                                  color: "#16A249",
                                }}
                              >
                                Voir tout
                              </Button>
                            </Box>

                            {comments.length > 0 ? (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {comments
                                  .filter((c) => !c.parent_id)
                                  .slice(0, 3)
                                  .map((comment) => (
                                    <Box
                                      key={comment.id}
                                      sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        backgroundColor: "rgba(0,0,0,0.02)",
                                        borderLeft: "3px solid #16A249",
                                      }}
                                    >
                                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <Box
                                          sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            bgcolor: "#16A249",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: "bold",
                                            mr: 1,
                                          }}
                                        >
                                          {getInitials(comment.user?.name || "Utilisateur")}
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                          <Typography variant="body2" fontWeight="medium">
                                            {comment.user?.name || "Utilisateur"}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDateTime(comment.created_at)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          display: "-webkit-box",
                                          WebkitLineClamp: 2,
                                          WebkitBoxOrient: "vertical",
                                        }}
                                      >
                                        {comment.content}
                                      </Typography>
                                    </Box>
                                  ))}
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: "center", py: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Aucune activité récente
                                </Typography>
                              </Box>
                            )}
                          </Paper>
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>

                {/* Remplacer le contenu de l'onglet Tâches (tabValue === 1) par ce code */}
                <Box role="tabpanel" hidden={tabValue !== 1} sx={{ p: 3 }}>
                  {tabValue === 1 && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Tâches du projet
                        </Typography>
                      </Box>

                      <TableContainer sx={{ borderRadius: 2, boxShadow: 1, mb: 4 }}>
                        <Table>
                          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "bold" }}>Nom</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>Priorité</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>Assigné à</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>Échéance</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }} align="right">Progression</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {loadingTasks ? (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  <CircularProgress size={30} />
                                </TableCell>
                              </TableRow>
                            ) : tasks && tasks.length > 0 ? (
                              tasks.map((task) => (
                                <TableRow key={task.id} hover>
                                  <TableCell>
                                    <Typography fontWeight="medium">{task.title}</Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={task.status?.name || getStatusName(task.status_id)}
                                      color={
                                        task.status?.name === "En cours" || getStatusName(task.status_id) === "En cours"
                                          ? "success"
                                          : task.status?.name === "En attente" ||
                                              getStatusName(task.status_id) === "En attente"
                                            ? "warning"
                                            : "default"
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={task.priority?.name || getPriorityName(task.priority_id)}
                                      color={
                                        task.priority?.name === "Haute" || getPriorityName(task.priority_id) === "Haute"
                                          ? "error"
                                          : "success"
                                      }
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      {task.assigned_user ? (
                                        <>
                                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: "#16A249" }}>
                                            {getInitials(task.assigned_user.name)}
                                          </Avatar>
                                          <Typography variant="body2">{task.assigned_user.name}</Typography>
                                        </>
                                      ) : (
                                        <>
                                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: "#9e9e9e" }}>
                                            {"NA"}
                                          </Avatar>
                                          <Typography variant="body2">Non assigné</Typography>
                                        </>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    {task.end_date ? (
                                      formatDate(task.end_date)
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        Non définie
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={task.progress || 0}
                                        sx={{
                                          width: "100%",
                                          height: 8,
                                          borderRadius: 5,
                                          backgroundColor: "#e0f2f1",
                                          "& .MuiLinearProgress-bar": {
                                            backgroundColor: "#16A249",
                                          },
                                          mr: 1,
                                        }}
                                      />
                                      <Typography variant="body2">{task.progress || 0}%</Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                                    Aucune tâche trouvée
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>

                {/* Contenu de l'onglet Équipe - NOUVELLE VERSION */}
                <Box role="tabpanel" hidden={tabValue !== 2} sx={{ p: 3 }}>
                  {tabValue === 2 && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Box>
                          <Typography variant="h6" component="h2" fontWeight="bold">
                            Équipes du projet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Liste des équipes qui gèrent ce projet
                          </Typography>
                        </Box>
                      </Box>

                      {loadingTeams ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                          <CircularProgress size={30} />
                        </Box>
                      ) : projectTeams && projectTeams.length > 0 ? (
                        projectTeams.map((team) => (
                          <Paper
                            key={team.id}
                            elevation={1}
                            sx={{
                              p: 3,
                              mb: 3,
                              borderRadius: 2,
                              transition: "transform 0.2s, box-shadow 0.2s",
                              "&:hover": {
                                boxShadow: 3,
                              },
                            }}
                          >
                            <Box
                              sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: "#16A249",
                                  }}
                                >
                                  {team.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {team.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {team.description}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                component={Link}
                                href={`/teams/${team.id}`}
                                onClick={(e) => {
                                  e.preventDefault()
                                  // Navigation vers la page de l'équipe
                                  // Cette fonctionnalité pourrait être implémentée ultérieurement
                                }}
                                sx={{
                                  textTransform: "none",
                                  borderColor: "#16A249",
                                  color: "#16A249",
                                  "&:hover": {
                                    borderColor: "#138a3c",
                                    bgcolor: "rgba(22, 162, 73, 0.04)",
                                  },
                                }}
                              >
                                Voir l'équipe
                              </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Chef d'équipe
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 2,
                                    bgcolor: "#FF8C00",
                                  }}
                                >
                                  {team.manager?.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">{team.manager?.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {team.manager?.email}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Membres ({team.members?.length || 0})
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                                {team.members && team.members.length > 0 ? (
                                  team.members.map((member: any) => (
                                    <Chip
                                      key={member.id}
                                      avatar={
                                        <Avatar sx={{ bgcolor: "#16A249" }}>
                                          {member.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                        </Avatar>
                                      }
                                      label={member.name}
                                      variant="outlined"
                                      sx={{
                                        p: 0.5,
                                        "& .MuiChip-label": { fontWeight: "medium" },
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Aucun membre (hormis le chef d'équipe)
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Paper>
                        ))
                      ) : (
                        <Box sx={{ textAlign: "center", py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            Aucune équipe associée à ce projet
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Box>

                {/* Amélioration du design de la fenêtre Commentaires */}
                {/* Contenu de l'onglet Commentaires */}
                <Box role="tabpanel" hidden={tabValue !== 3} sx={{ p: 3 }}>
                  {tabValue === 3 && (
                    <>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                        <Typography variant="h6" component="h2" fontWeight="bold">
                          Commentaires
                        </Typography>
                      </Box>

                      {/* Zone de saisie de commentaire en haut */}
                      <Box sx={{ mb: 4, display: "flex", alignItems: "flex-start", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "#16A249" }}>{getInitials(currentUser.name)}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <TextField
                            fullWidth
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            variant="outlined"
                            sx={{
                              mb: 1,
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderRadius: 2,
                                },
                                "&:hover fieldset": {
                                  borderColor: "darkgreen",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#16A249", // vert personnalisé pendant focus
                                },
                              },
                            }}
                          />
                        </Box>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          sx={{
                            bgcolor: "#16A249",
                            border: "1px  ",
                            textTransform: "none",
                            borderRadius: 1,
                            px: 2,
                            "&:hover": {
                              bgcolor: "#138a3c", // a slightly darker green for hover
                              borderColor: "#138a3c",
                            },
                          }}
                        >
                          Commenter
                        </Button>
                      </Box>

                      {/* Liste des commentaires */}
                      <Box sx={{ mt: 2, mb: 4 }}>
                        {loadingComments ? (
                          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={30} />
                          </Box>
                        ) : comments.length > 0 ? (
                          <Box sx={{ display: "flex", flexDirection: "column" }}>
                            {comments
                              .filter((comment) => !comment.parent_id)
                              .map((comment) => (
                                <Box key={comment.id} sx={{ position: "relative", mb: 3 }}>
                                  {/* Barre verte verticale */}
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      bottom: 0,
                                      width: "4px",
                                      bgcolor: "#16A249",
                                      borderTopLeftRadius: 4,
                                      borderBottomLeftRadius: 4,
                                    }}
                                  />

                                  <Box sx={{ pl: 2 }}>
                                    {/* En-tête du commentaire */}
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                      <Avatar sx={{ width: 40, height: 40, bgcolor: "#16A249", mr: 1 }}>
                                        {getInitials(comment.user?.name || "Utilisateur")}
                                      </Avatar>
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="medium">
                                          {comment.user?.name || "Utilisateur"}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {formatDateTime(comment.created_at)}
                                        </Typography>
                                      </Box>
                                      {comment.user_id === currentUser.id && (
                                        <IconButton
                                          size="small"
                                          sx={{ ml: "auto" }}
                                          onClick={(e) => handleCommentActionMenuOpen(e, comment.id)}
                                        >
                                          <MoreVert fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>

                                    {/* Contenu du commentaire */}
                                    {editingCommentId === comment.id ? (
                                      <Box sx={{ mt: 1, ml: 6 }}>
                                        <TextField
                                          fullWidth
                                          multiline
                                          rows={2}
                                          value={editCommentContent}
                                          onChange={(e) => setEditCommentContent(e.target.value)}
                                          sx={{
                                            mb: 1,
                                            "& .MuiOutlinedInput-root": {
                                              "& fieldset": {
                                                borderRadius: 2,
                                              },
                                              "&:hover fieldset": {
                                                borderColor: "darkgreen",
                                              },
                                              "&.Mui-focused fieldset": {
                                                borderColor: "#16A249", // vert personnalisé pendant focus
                                              },
                                            },
                                          }}
                                        />
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={handleCancelEditComment}
                                            sx={{
                                              textTransform: "none",
                                              borderColor: "error.main",
                                              "&:hover": {
                                                backgroundColor: "error.main",
                                                color: "white",
                                                borderColor: "error.main",
                                              },
                                            }}
                                          >
                                            Annuler
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            onClick={handleUpdateComment}
                                            disabled={!editCommentContent.trim()}
                                            sx={{
                                              bgcolor: "#16A249",
                                              border: "1px solid #16A249",
                                              textTransform: "none",
                                              borderRadius: 1,
                                              px: 2,
                                              "&:hover": {
                                                bgcolor: "#138a3c", // a slightly darker green for hover
                                                borderColor: "#138a3c",
                                              },
                                            }}
                                          >
                                            Enregistrer
                                          </Button>
                                        </Box>
                                      </Box>
                                    ) : (
                                      <Typography variant="body1" sx={{ ml: 6, mb: 2 }}>
                                        {comment.content}
                                      </Typography>
                                    )}

                                    {/* Actions du commentaire (J'aime, Répondre) */}
                                    <Box sx={{ display: "flex", alignItems: "center", ml: 6, mb: 2 }}>
                                      <Button
                                        startIcon={likedComments.has(comment.id) ? <ThumbUp /> : <ThumbUpAltOutlined />}
                                        sx={{
                                          color: likedComments.has(comment.id) ? "#16A249" : "text.secondary",
                                          textTransform: "none",
                                          mr: 2,
                                        }}
                                        onClick={() => handleToggleLike(comment.id)}
                                      >
                                        {comment.likes_count || 0}
                                      </Button>
                                      <Button
                                        startIcon={<ChatBubbleOutline />}
                                        sx={{
                                          color: "text.secondary",
                                          textTransform: "none",
                                        }}
                                        onClick={() => handleReplyToComment(comment.id)}
                                      >
                                        Répondre
                                      </Button>
                                    </Box>

                                    {/* Zone de réponse */}
                                    {replyingToCommentId === comment.id && (
                                      <Box sx={{ ml: 6, mb: 2 }}>
                                        <TextField
                                          fullWidth
                                          placeholder="Écrivez votre réponse..."
                                          value={replyContent}
                                          onChange={(e) => setReplyContent(e.target.value)}
                                          sx={{
                                            mb: 1,
                                            "& .MuiOutlinedInput-root": {
                                              "& fieldset": {
                                                borderRadius: 2,
                                              },
                                              "&:hover fieldset": {
                                                borderColor: "darkgreen",
                                              },
                                              "&.Mui-focused fieldset": {
                                                borderColor: "#16A249", // vert personnalisé pendant focus
                                              },
                                            },
                                          }}
                                        />
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                          <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={handleCancelReply}
                                            sx={{
                                              textTransform: "none",
                                              borderColor: "error.main",
                                              "&:hover": {
                                                backgroundColor: "error.main",
                                                color: "white",
                                                borderColor: "error.main",
                                              },
                                            }}
                                          >
                                            Annuler
                                          </Button>
                                          <Button
                                            variant="contained"
                                            size="small"
                                            color="success"
                                            onClick={handleSubmitReply}
                                            disabled={!replyContent.trim()}
                                            sx={{
                                              bgcolor: "#16A249",
                                              border: "1px solid #16A249",
                                              textTransform: "none",
                                              borderRadius: 1,
                                              px: 2,
                                              "&:hover": {
                                                bgcolor: "#138a3c", // a slightly darker green for hover
                                                borderColor: "#138a3c",
                                              },
                                            }}
                                          >
                                            Répondre
                                          </Button>
                                        </Box>
                                      </Box>
                                    )}

                                    {/* Afficher les réponses */}
                                    {comments.filter((reply) => reply.parent_id === comment.id).length > 0 && (
                                      <Box sx={{ ml: 6, borderLeft: "2px solid #e0e0e0", pl: 2 }}>
                                        {comments
                                          .filter((reply) => reply.parent_id === comment.id)
                                          .map((reply) => (
                                            <Box key={reply.id} sx={{ mb: 2 }}>
                                              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: "#16A249", mr: 1 }}>
                                                  {getInitials(reply.user?.name || "Utilisateur")}
                                                </Avatar>
                                                <Box>
                                                  <Typography variant="subtitle2" fontWeight="medium">
                                                    {reply.user?.name || "Utilisateur"}
                                                  </Typography>
                                                  <Typography variant="caption" color="text.secondary">
                                                    {formatDateTime(reply.created_at)}
                                                  </Typography>
                                                </Box>
                                                {reply.user_id === currentUser.id && (
                                                  <IconButton
                                                    size="small"
                                                    sx={{ ml: "auto" }}
                                                    onClick={(e) => handleCommentActionMenuOpen(e, reply.id)}
                                                  >
                                                    <MoreVert fontSize="small" />
                                                  </IconButton>
                                                )}
                                              </Box>
                                              {editingCommentId === reply.id ? (
                                                <Box sx={{ mt: 1, ml: 5 }}>
                                                  <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                    value={editCommentContent}
                                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                                    sx={{
                                                      mb: 1,
                                                      "& .MuiOutlinedInput-root": {
                                                        "& fieldset": {
                                                          borderRadius: 2,
                                                        },
                                                        "&:hover fieldset": {
                                                          borderColor: "darkgreen",
                                                        },
                                                        "&.Mui-focused fieldset": {
                                                          borderColor: "#16A249",
                                                        },
                                                      },
                                                    }}
                                                  />
                                                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      color="error"
                                                      onClick={handleCancelEditComment}
                                                      sx={{
                                                        textTransform: "none",
                                                        borderColor: "error.main",
                                                        "&:hover": {
                                                          backgroundColor: "error.main",
                                                          color: "white",
                                                          borderColor: "error.main",
                                                        },
                                                      }}
                                                    >
                                                      Annuler
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      variant="contained"
                                                      onClick={handleUpdateComment}
                                                      disabled={!editCommentContent.trim()}
                                                      sx={{
                                                        bgcolor: "#16A249",
                                                        border: "1px solid #16A249",
                                                        textTransform: "none",
                                                        borderRadius: 1,
                                                        px: 2,
                                                        "&:hover": {
                                                          bgcolor: "#138a3c",
                                                          borderColor: "#138a3c",
                                                        },
                                                      }}
                                                    >
                                                      Enregistrer
                                                    </Button>
                                                  </Box>
                                                </Box>
                                              ) : (
                                                <Typography variant="body1" sx={{ ml: 5 }}>
                                                  {reply.content}
                                                </Typography>
                                              )}
                                              {/* Bouton J'aime pour les réponses */}
                                              <Box sx={{ display: "flex", alignItems: "center", ml: 5, mt: 1 }}>
                                                <Button
                                                  startIcon={
                                                    likedComments.has(reply.id) ? <ThumbUp /> : <ThumbUpAltOutlined />
                                                  }
                                                  size="small"
                                                  sx={{
                                                    color: likedComments.has(reply.id) ? "#16A249" : "text.secondary",
                                                    textTransform: "none",
                                                  }}
                                                  onClick={() => handleToggleLike(reply.id)}
                                                >
                                                  {reply.likes_count || 0}
                                                </Button>
                                              </Box>
                                            </Box>
                                          ))}
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                            Aucun commentaire pour ce projet
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          </>
        ) : (
          // Vue liste des projets
          <>
            {/* Fil d'Ariane */}
            <Box sx={{ mb: 2 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">
                  Tableau de bord
                </Link>
                <Typography color="text.primary">Projets</Typography>
              </Breadcrumbs>
            </Box>
            {/* En-tête de la page */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Projets
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez tous vos projets
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  placeholder="Rechercher..."
                  size="small"
                  value={searchProjectQuery}
                  onChange={(e) => setSearchProjectQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 250,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "darkgreen",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#16A249", // vert personnalisé pendant focus
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    textTransform: "uppercase",
                    minWidth: "120px",
                    height: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    bgcolor: showFilters ? "#16A249" : "#f5f5f5",
                    color: showFilters ? "white" : "black",
                    "&:hover": {
                      bgcolor: showFilters ? "#138a3c" : "#e0e0e0",
                    },
                  }}
                  endIcon={
                    <ArrowBackIcon
                      sx={{ transform: showFilters ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.3s" }}
                    />
                  }
                >
                  Filtres
                </Button>
                
                {currentUser && currentUser.role === "admin" && ( //admin le seul peut créer une projet 
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={handleNewProjectDialogOpen}
                  sx={{ textTransform: "none", borderRadius: 1, px: 2, bgcolor: "#16A249" }}
                >
                  Nouveau projet
                </Button>
                )}
              </Box>
            </Box>

            {/* Panneau de filtres */}
            <Collapse in={showFilters}>
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, height: "100%" }}>
                  <FormControl sx={{ minWidth: 200, flex: 1 }} color="success">
                    <InputLabel id="statuts-label">Statuts</InputLabel>
                    <Select
                      labelId="statuts-label"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      label="Statuts"
                      fullWidth
                      sx={{
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#138a3c", // on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#16A249", // on focus
                        },
                      }}
                    >
                      <MenuItem value="Tous les statuts">Tous les statuts</MenuItem>
                      {statuses.map((status) => (
                        <MenuItem key={status.id} value={status.name}>
                          {status.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 200, flex: 1 }} color="success">
                    <InputLabel id="priorites-label">Priorités</InputLabel>
                    <Select
                      labelId="priorites-label"
                      value={priorityFilter}
                      onChange={handlePriorityFilterChange}
                      label="Priorités"
                      fullWidth
                      sx={{
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#138a3c", // on hover
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#16A249", // on focus
                        },
                      }}
                    >
                      <MenuItem value="Toutes les priorités">Toutes les priorités</MenuItem>
                      {priorities.map((priority) => (
                        <MenuItem key={priority.id} value={priority.name}>
                          {priority.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Date de début"
                    color="success"
                    type="date"
                    value={startDateFilter}
                    onChange={handleStartDateFilterChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 200,
                      flex: 1,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#138a3c", // on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249", // on focus
                      },
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Date de fin"
                    color="success"
                    type="date"
                    value={endDateFilter}
                    onChange={handleEndDateFilterChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      minWidth: 200,
                      flex: 1,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#138a3c", // on hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249", // on focus
                      },
                    }}
                    fullWidth
                  />
                </Box>
              </Paper>
            </Collapse>

            {/* Liste des projets */}
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Priorité</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Progression</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date d'échéance</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={(e) => handleViewProjectDetails(project.id, e)}
                          >
                            {project.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.status?.name || getStatusName(project.status_id)}
                            color={
                              project.status?.name === "En cours" || getStatusName(project.status_id) === "En cours"
                                ? "success"
                                : project.status?.name === "En attente" ||
                                    getStatusName(project.status_id) === "En attente"
                                  ? "warning"
                                  : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={project.priority?.name || getPriorityName(project.priority_id)}
                            color={
                              project.priority?.name === "Haute" || getPriorityName(project.priority_id) === "Haute"
                                ? "error"
                                : "success"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LinearProgress
                              variant="determinate"
                              value={project.progress || 0}
                              sx={{
                                width: "100%",
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: "#e0f2f1",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#16A249",
                                },
                                mr: 1,
                              }}
                            />
                            <Typography variant="body2">{project.progress || 0}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{formatDate(project.end_date)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleProjectActionMenuOpen(e, project.id)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Aucun projet trouvé
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Statistiques des projets */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  flex: 1,
                  minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "success.main",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "success.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  >
                    <AssignmentIcon sx={{ color: "success.main" }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Projets terminés
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {
                    projects.filter((p) => p.status?.name === "Terminé" || getStatusName(p.status_id) === "Terminé")
                      .length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  sur {projects.length} projets au total
                </Typography>
              </Paper>

              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  flex: 1,
                  minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "info.main",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "info.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  >
                    <CalendarIcon sx={{ color: "info.main" }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Projets en cours
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {
                    projects.filter((p) => p.status?.name === "En cours" || getStatusName(p.status_id) === "En cours")
                      .length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  sur {projects.length} projets au total
                </Typography>
              </Paper>

              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  flex: 1,
                  minWidth: { xs: "100%", sm: "calc(33.33% - 16px)" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    color: "warning.main",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "warning.light",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  >
                    <CalendarIcon sx={{ color: "warning.main" }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    Projets en attente
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {
                    projects.filter(
                      (p) => p.status?.name === "En attente" || getStatusName(p.status_id) === "En attente",
                    ).length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  sur {projects.length} projets au total
                </Typography>
              </Paper>
            </Box>
          </>
        )}
      </Container>

      {/* Dialogue de création d'un nouveau projet */}
      <Dialog open={openNewProjectDialog} onClose={handleNewProjectDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Créer un nouveau projet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Nom du projet"
            color="success"
            type="text"
            fullWidth
            variant="outlined"
            value={newProjectData.title}
            onChange={handleNewProjectInputChange}
            error={newProjectErrors.title}
            helperText={newProjectErrors.title ? "Le nom du projet est requis" : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "darkgreen",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#16A249",
                },
              },
            }}
            required
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description"
            color="success"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newProjectData.description}
            onChange={handleNewProjectInputChange}
            error={newProjectErrors.description}
            helperText={newProjectErrors.description ? "La description est requise" : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "darkgreen",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#16A249",
                },
              },
            }}
            required
          />
          <FormControl fullWidth margin="dense" error={newProjectErrors.priority_id} color="success">
            <InputLabel id="priority-label">Priorité</InputLabel>
            <Select
              labelId="priority-label"
              id="priority_id"
              value={newProjectData.priority_id.toString()}
              label="Priorité"
              onChange={handleNewProjectPriorityChange}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id.toString()}>
                  {priority.name}
                </MenuItem>
              ))}
            </Select>
            {newProjectErrors.priority_id && (
              <Typography variant="caption" color="error">
                La priorité est requise
              </Typography>
            )}
          </FormControl>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Date de début"
              color="success"
              type="date"
              name="start_date"
              value={newProjectData.start_date}
              onChange={handleNewProjectInputChange}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              error={newProjectErrors.start_date}
              helperText={newProjectErrors.start_date ? "La date de début est requise" : ""}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "darkgreen",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#16A249",
                  },
                },
              }}
            />
            <TextField
              label="Date d'échéance"
              color="success"
              type="date"
              name="end_date"
              value={newProjectData.end_date}
              onChange={handleNewProjectInputChange}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              error={newProjectErrors.end_date}
              helperText={newProjectErrors.end_date ? "La date d'échéance est requise" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleNewProjectDialogClose}
            color="error"
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
                borderColor: "error.main",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateNewProject}
            variant="contained"
            color="success"
            endIcon={<SendIcon />}
            sx={{
              bgcolor: "#16A249",
              border: "1px solid #16A249",
              textTransform: "none",
              borderRadius: 1,
              px: 2,
              "&:hover": {
                bgcolor: "#138a3c", // a slightly darker green for hover
                borderColor: "#138a3c",
              },
            }}
            disabled={loading}
          >
            Créer Le Projet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de modification d'un projet */}
      <Dialog open={openEditProjectDialog} onClose={handleEditProjectDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Modifier le projet</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Nom du projet"
            color="success"
            type="text"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "darkgreen",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#16A249",
                },
              },
            }}
            fullWidth
            variant="outlined"
            value={editProjectData.title}
            onChange={handleEditProjectInputChange}
            error={editProjectErrors.title}
            helperText={editProjectErrors.title ? "Le nom du projet est requis" : ""}
            required
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label="Description"
            color="success"
            type="text"
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "darkgreen",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#16A249",
                },
              },
            }}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={editProjectData.description}
            onChange={handleEditProjectInputChange}
            error={editProjectErrors.description}
            helperText={editProjectErrors.description ? "La description est requise" : ""}
            required
          />
          <FormControl fullWidth margin="dense" error={editProjectErrors.status_id} color="success">
            <InputLabel id="edit-status-label">Statut</InputLabel>
            <Select
              labelId="edit-status-label"
              id="edit-status"
              value={editProjectData.status_id.toString()}
              label="Statut"
              onChange={handleEditProjectStatusChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id.toString()}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
            {editProjectErrors.status_id && (
              <Typography variant="caption" color="error">
                Le statut est requis
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth margin="dense" error={editProjectErrors.priority_id} color="success">
            <InputLabel id="edit-priority-label">Priorité</InputLabel>
            <Select
              labelId="edit-priority-label"
              id="edit-priority"
              value={editProjectData.priority_id.toString()}
              label="Priorité"
              onChange={handleEditProjectPriorityChange}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id.toString()}>
                  {priority.name}
                </MenuItem>
              ))}
            </Select>
            {editProjectErrors.priority_id && (
              <Typography variant="caption" color="error">
                La priorité est requise
              </Typography>
            )}
          </FormControl>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Date de début"
              type="date"
              name="start_date"
              color="success"
              value={editProjectData.start_date}
              onChange={handleEditProjectInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "darkgreen",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#16A249",
                  },
                },
              }}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              error={editProjectErrors.start_date}
              helperText={editProjectErrors.start_date ? "La date de début est requise" : ""}
            />
            <TextField
              label="Date d'échéance"
              type="date"
              name="end_date"
              color="success"
              value={editProjectData.end_date}
              onChange={handleEditProjectInputChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "darkgreen",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#16A249",
                  },
                },
              }}
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              error={editProjectErrors.end_date}
              helperText={editProjectErrors.end_date ? "La date d'échéance est requise" : ""}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditProjectDialogClose}
            color="error"
            variant="outlined"
            sx={{
              textTransform: "none",
              borderColor: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
                borderColor: "error.main",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateProject}
            variant="contained"
            color="success"
            sx={{
              bgcolor: "#16A249",
              border: "1px solid #16A249",
              textTransform: "none",
              borderRadius: 1,
              px: 2,
              "&:hover": {
                bgcolor: "#138a3c", // a slightly darker green for hover
                borderColor: "#138a3c",
                backgroundColor: "#138a3c", // a slightly darker green for hover
              },
            }}
            disabled={loading}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression d'un projet */}
      <Dialog open={openDeleteProjectDialog} onClose={handleDeleteProjectDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Supprimer le projet</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteProjectDialogClose}
            color="success"
            variant="outlined"
            sx={{
              border: "1px solid #16A249",
              textTransform: "none",
              borderRadius: 1,
              px: 2,
              "&:hover": {
                color: "white",
                bgcolor: "#138a3c", // a slightly darker green for hover
                borderColor: "#138a3c",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteProject}
            variant="contained"
            color="error"
            sx={{
              textTransform: "none",
              borderColor: "error.main",
              "&:hover": {
                backgroundColor: "error.main",
                color: "white",
                borderColor: "error.main",
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu d'actions pour les projets */}
      <Menu
        anchorEl={projectActionMenuAnchorEl}
        open={openProjectActionMenu}
        onClose={handleProjectActionMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={(e) => handleViewProjectDetails(selectedProjectId || 0, e)}>
          <ListItemIcon>
           
             <VisibilityIcon fontSize="small" sx={{ color: "#16A249" }}  />
          </ListItemIcon>
          <ListItemText primary="Détails" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleProjectActionMenuClose()
            handleViewProjectDetails(selectedProjectId || 0)
            // Attendre que les détails du projet soient chargés avant de changer d'onglet
            setTimeout(() => setTabValue(3), 300)
          }}
        >
          <ListItemIcon>
            <CommentIcon fontSize="small" sx={{ color: "#16A249" }} />
          </ListItemIcon>
          <ListItemText primary="Commentaires" />
        </MenuItem>
        {currentUser && currentUser.role === "admin" && ( // admin peut modifier le projet
        <MenuItem onClick={() => handleEditProjectDialogOpen(selectedProjectId || 0)}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#16A249" }} />
          </ListItemIcon>
          <ListItemText primary="Modifier" />
        </MenuItem>
        )}
        {currentUser && currentUser.role === "admin" && ( // admin peut supprimer le projet
        <MenuItem onClick={() => handleDeleteProjectDialogOpen(selectedProjectId || 0)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Supprimer" sx={{ color: "error.main" }} />
        </MenuItem>
        )}
      </Menu>

      {/* Menu d'actions pour les commentaires */}
      <Menu
        anchorEl={commentActionMenuAnchorEl}
        open={openCommentActionMenu}
        onClose={handleCommentActionMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleEditComment(selectedCommentId || 0)}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#16A249" }} />
          </ListItemIcon>
          <ListItemText primary="Modifier" />
        </MenuItem>
        <MenuItem onClick={() => handleDeleteComment(selectedCommentId || 0)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Supprimer" sx={{ color: "error.main" }} />
        </MenuItem>
      </Menu>
    </AppLayout>
  )
}

export default Projet