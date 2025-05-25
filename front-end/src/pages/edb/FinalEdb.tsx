"use client"

import {
  Add,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert,
  Search as SearchIcon,
  Send as SendIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material"
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material"
import type React from "react"
import { useEffect, useState } from "react"
import { edbApi, type Edb, type Priority, type Status } from "./apiedb"
import { getCurrentUser } from "../login/api"
import AppLayout from "../../components/layout/AppLayout"
import EdbDetails from "./EdbDetails"
import { getStatusColor, getPriorityColor } from '../../utils/colorUtils'

const FinalEdb: React.FC = () => {
  // État pour l'utilisateur connecté
  const [currentUser, setCurrentUser] = useState<any>(null)

  // État pour le menu d'actions des EDBs
  const [edbActionMenuAnchorEl, setEdbActionMenuAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedEdbId, setSelectedEdbId] = useState<number | null>(null)
  const openEdbActionMenu = Boolean(edbActionMenuAnchorEl)

  // Fonction pour obtenir la date actuelle au format YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  // État pour le formulaire de nouvel EDB
  const [openNewEdbDialog, setOpenNewEdbDialog] = useState(false)
  const [newEdbData, setNewEdbData] = useState({
    title: "",
    description: "",
    objectif: "",
    contrainte: "",
    user_id: 1, // Sera mis à jour avec l'ID de l'utilisateur connecté
    priority_id: 2, // Par défaut "Moyenne"
    date_demande: getCurrentDate(),
  })
  const [newEdbErrors, setNewEdbErrors] = useState({
    title: false,
    description: false,
    objectif: false,
    contrainte: false,
    priority_id: false,
    date_demande: false,
  })

  // État pour la vue détaillée d'un EDB
  const [showEdbDetails, setShowEdbDetails] = useState(false)
  const [selectedEdb, setSelectedEdb] = useState<any>(null)

  // État pour la recherche
  const [searchEdbQuery, setSearchEdbQuery] = useState("")

  // État pour le filtre de statut
  const [statusFilter, setStatusFilter] = useState("Tous les statuts")

  // État pour les dialogues d'édition et de suppression d'EDB
  const [openEditEdbDialog, setOpenEditEdbDialog] = useState(false)
  const [openDeleteEdbDialog, setOpenDeleteEdbDialog] = useState(false)
  const [editEdbData, setEditEdbData] = useState({
    id: 0,
    title: "",
    description: "",
    objectif: "",
    contrainte: "",
    user_id: 1, // Sera mis à jour avec l'ID de l'utilisateur connecté
    status_id: 1,
    priority_id: 2,
  })
  const [editEdbErrors, setEditEdbErrors] = useState({
    title: false,
    description: false,
    objectif: false,
    contrainte: false,
    status_id: false,
    priority_id: false,
  })

  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  })

  // État pour l'indicateur de chargement
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Données des EDBs, statuts et priorités
  const [edbs, setEdbs] = useState<Edb[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [priorities, setPriorities] = useState<Priority[]>([])

  // Ajouter des états pour les filtres de priorité, date de début et date de fin
  const [priorityFilter, setPriorityFilter] = useState("Toutes les priorités")
  // Remplacer le panneau de filtres complexe par un simple dialogue de filtres
  const [openFiltersDialog, setOpenFiltersDialog] = useState(false)

  // Récupérer l'utilisateur connecté au chargement du composant
  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      // Mettre à jour les données du formulaire avec l'ID de l'utilisateur connecté
      setNewEdbData((prev) => ({
        ...prev,
        user_id: user.id,
      }))
      setEditEdbData((prev) => ({
        ...prev,
        user_id: user.id,
      }))
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      window.location.href = "/login"
    }
  }, [])

  // Fonction pour charger les EDBs depuis l'API
  const fetchEdbs = async () => {
    try {
      setInitialLoading(true)
      const edbsData = await edbApi.getAllEdbs()
      setEdbs(edbsData)
      setInitialLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des EDBs:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des EDBs",
        severity: "error",
      })
      setInitialLoading(false)
    }
  }

  // Fonction pour charger les statuts depuis l'API
  const fetchStatuses = async () => {
    try {
      const statusesData = await edbApi.getAllStatuses()
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
      const prioritiesData = await edbApi.getAllPriorities()
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

  // Charger les EDBs, statuts et priorités au chargement du composant
  useEffect(() => {
    fetchEdbs()
    fetchStatuses()
    fetchPriorities()
  }, [])

  // Filtrage des EDBs par recherche, statut, priorité et dates
  // Modifier la fonction de filtrage pour supprimer les filtres de date
  const filteredEdbs = edbs.filter((edb) => {
    // Filtre par recherche
    const matchesSearch =
      edb.title.toLowerCase().includes(searchEdbQuery.toLowerCase()) ||
      (edb.description && edb.description.toLowerCase().includes(searchEdbQuery.toLowerCase())) ||
      (edb.user?.name && edb.user.name.toLowerCase().includes(searchEdbQuery.toLowerCase()))

    // Filtre par statut
    const matchesStatus = statusFilter === "Tous les statuts" || edb.status?.name === statusFilter

    // Filtre par priorité
    const matchesPriority = priorityFilter === "Toutes les priorités" || edb.priority?.name === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Fermer le menu d'actions des EDBs lorsqu'on navigue vers les détails d'un EDB
  useEffect(() => {
    if (showEdbDetails) {
      handleEdbActionMenuClose()
    }
  }, [showEdbDetails])

  const handleEdbActionMenuOpen = (event: React.MouseEvent<HTMLElement>, edbId: number) => {
    event.stopPropagation() // Empêcher la propagation pour éviter de déclencher handleViewEdbDetails
    setEdbActionMenuAnchorEl(event.currentTarget)
    setSelectedEdbId(edbId)
  }

  const handleEdbActionMenuClose = () => {
    setEdbActionMenuAnchorEl(null)
    // Ne pas effacer selectedEdbId ici, car nous en avons besoin pour la suppression
  }

  const handleNewEdbDialogOpen = () => {
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
      setSnackbar({
        open: true,
        message: "Vous devez être connecté pour créer une EDB",
        severity: "error",
      })
      return
    }

    setOpenNewEdbDialog(true)
    setNewEdbData({
      title: "",
      description: "",
      objectif: "",
      contrainte: "",
      user_id: currentUser.id,
      priority_id: 2, // Par défaut "Moyenne"
      date_demande: getCurrentDate(),
    })
    setNewEdbErrors({
      title: false,
      description: false,
      objectif: false,
      contrainte: false,
      priority_id: false,
      date_demande: false,
    })
  }

  const handleNewEdbDialogClose = () => {
    setOpenNewEdbDialog(false)
    setNewEdbData({
      title: "",
      description: "",
      objectif: "",
      contrainte: "",
      user_id: currentUser ? currentUser.id : 1,
      priority_id: 2,
      date_demande: getCurrentDate(),
    })
    setNewEdbErrors({
      title: false,
      description: false,
      objectif: false,
      contrainte: false,
      priority_id: false,
      date_demande: false,
    })
  }

  const handleNewEdbInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewEdbData({
      ...newEdbData,
      [name]: value,
    })

    // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
    if (newEdbErrors[name as keyof typeof newEdbErrors]) {
      setNewEdbErrors({
        ...newEdbErrors,
        [name]: false,
      })
    }
  }

  const handleNewEdbPriorityChange = (e: SelectChangeEvent<string>) => {
    setNewEdbData({
      ...newEdbData,
      priority_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si une priorité est sélectionnée
    if (newEdbErrors.priority_id) {
      setNewEdbErrors({
        ...newEdbErrors,
        priority_id: false,
      })
    }
  }

  // Ajouter les gestionnaires d'événements pour les filtres
  const handlePriorityFilterChange = (e: SelectChangeEvent<string>) => {
    setPriorityFilter(e.target.value)
  }

  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setStatusFilter(e.target.value)
  }

  const handleViewEdbDetails = async (edbId: number, event?: React.MouseEvent) => {
    // Si l'événement est fourni, empêcher la propagation
    if (event) {
      event.stopPropagation()
    }

    // Fermer le menu d'actions des EDBs s'il est ouvert
    if (edbActionMenuAnchorEl) {
      handleEdbActionMenuClose()
    }

    try {
      setLoading(true)
      const edbDetails = await edbApi.getEdbById(edbId)
      setSelectedEdb(edbDetails)
      setShowEdbDetails(true)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des détails de l'EDB:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des détails de l'EDB",
        severity: "error",
      })
      setLoading(false)
    }
  }

  const handleBackToEdbsList = () => {
    setShowEdbDetails(false)
    setSelectedEdb(null)
    setSearchEdbQuery("")
  }

  // Fonctions pour gérer l'édition d'un EDB
  const handleEditEdbDialogOpen = (edbId: number) => {
    const edb = edbs.find((p) => p.id === edbId)
    if (edb) {
      setEditEdbData({
        id: edb.id,
        title: edb.title,
        description: edb.description || "",
        objectif: edb.objectif || "",
        contrainte: edb.contrainte || "",
        user_id: currentUser ? currentUser.id : edb.user_id,
        status_id: edb.status_id,
        priority_id: edb.priority_id,
      })
      setEditEdbErrors({
        title: false,
        description: false,
        objectif: false,
        contrainte: false,
        status_id: false,
        priority_id: false,
      })

      setOpenEditEdbDialog(true)
    }
    handleEdbActionMenuClose()
  }

  const handleEditEdbDialogClose = () => {
    setOpenEditEdbDialog(false)
    setEditEdbErrors({
      title: false,
      description: false,
      objectif: false,
      contrainte: false,
      status_id: false,
      priority_id: false,
    })
  }

  const handleEditEdbInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditEdbData({
      ...editEdbData,
      [name]: value,
    })

    // Réinitialiser l'erreur lorsque l'utilisateur commence à taper
    if (editEdbErrors[name as keyof typeof editEdbErrors]) {
      setEditEdbErrors({
        ...editEdbErrors,
        [name]: false,
      })
    }
  }

  const handleEditEdbStatusChange = (e: SelectChangeEvent<string>) => {
    setEditEdbData({
      ...editEdbData,
      status_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si un statut est sélectionné
    if (editEdbErrors.status_id) {
      setEditEdbErrors({
        ...editEdbErrors,
        status_id: false,
      })
    }
  }

  const handleEditEdbPriorityChange = (e: SelectChangeEvent<string>) => {
    setEditEdbData({
      ...editEdbData,
      priority_id: Number(e.target.value),
    })

    // Réinitialiser l'erreur si une priorité est sélectionnée
    if (editEdbErrors.priority_id) {
      setEditEdbErrors({
        ...editEdbErrors,
        priority_id: false,
      })
    }
  }

  const handleUpdateEdb = async () => {
    // Validation des champs
    const titleEmpty = editEdbData.title.trim() === ""
    const descriptionEmpty = editEdbData.description.trim() === ""
    const objectifEmpty = editEdbData.objectif.trim() === ""
    const contrainteEmpty = editEdbData.contrainte.trim() === ""
    const statusEmpty = !editEdbData.status_id
    const priorityEmpty = !editEdbData.priority_id

    setEditEdbErrors({
      ...editEdbErrors,
      title: titleEmpty,
      description: descriptionEmpty,
      objectif: objectifEmpty,
      contrainte: contrainteEmpty,
      status_id: statusEmpty,
      priority_id: priorityEmpty,
    })

    // Si tous les champs sont remplis, procéder à la mise à jour
    if (!titleEmpty && !descriptionEmpty && !objectifEmpty && !contrainteEmpty && !statusEmpty && !priorityEmpty) {
      try {
        setLoading(true)
        await edbApi.updateEdb(editEdbData.id, editEdbData)

        setSnackbar({
          open: true,
          message: "EDB mis à jour avec succès",
          severity: "success",
        })

        handleEditEdbDialogClose()
        // Recharger la liste des EDBs
        fetchEdbs()

        // Si nous sommes dans la vue détaillée de l'EDB modifié, recharger les détails
        if (showEdbDetails && selectedEdb?.id === editEdbData.id) {
          await handleViewEdbDetails(editEdbData.id)
        }

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'EDB:", error)
        setSnackbar({
          open: true,
          message: "Erreur lors de la mise à jour de l'EDB",
          severity: "error",
        })
        setLoading(false)
      }
    }
  }

  // Fonctions pour gérer la suppression d'un EDB
  const handleDeleteEdbDialogOpen = (edbId: number) => {
    setSelectedEdbId(edbId)
    setOpenDeleteEdbDialog(true)
    handleEdbActionMenuClose()
  }

  const handleDeleteEdbDialogClose = () => {
    setOpenDeleteEdbDialog(false)
    // Effacer selectedEdbId seulement lorsque le dialogue est fermé
    setSelectedEdbId(null)
  }

  const handleDeleteEdb = async () => {
    // Stocker l'ID dans une variable locale pour s'assurer qu'il ne change pas
    const edbIdToDelete = selectedEdbId

    if (!edbIdToDelete) return

    try {
      setLoading(true)
      await edbApi.deleteEdb(edbIdToDelete)

      // Fermer le dialogue de confirmation
      handleDeleteEdbDialogClose()

      // Si nous sommes dans la vue détaillée de l'EDB supprimé, revenir à la liste
      if (showEdbDetails && selectedEdb?.id === edbIdToDelete) {
        handleBackToEdbsList()
      }

      // Recharger la liste des EDBs
      fetchEdbs()

      setLoading(false)

      // Afficher le Snackbar de succès
      setSnackbar({
        open: true,
        message: "EDB supprimé avec succès",
        severity: "success",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'EDB:", error)
      setLoading(false)
      handleDeleteEdbDialogClose()
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression de l'EDB",
        severity: "error",
      })
    }
  }

  const handleCreateNewEdb = async () => {
    // Validation des champs
    const titleEmpty = newEdbData.title.trim() === ""
    const descriptionEmpty = newEdbData.description.trim() === ""
    const objectifEmpty = newEdbData.objectif.trim() === ""
    const contrainteEmpty = newEdbData.contrainte.trim() === ""
    const priorityEmpty = !newEdbData.priority_id
    const dateDemandEmpty = !newEdbData.date_demande

    setNewEdbErrors({
      ...newEdbErrors,
      title: titleEmpty,
      description: descriptionEmpty,
      objectif: objectifEmpty,
      contrainte: contrainteEmpty,
      priority_id: priorityEmpty,
      date_demande: dateDemandEmpty,
    })

    // Si tous les champs sont remplis, procéder à la création
    if (!titleEmpty && !descriptionEmpty && !objectifEmpty && !contrainteEmpty && !priorityEmpty && !dateDemandEmpty) {
      try {
        setLoading(true)
        await edbApi.createEdb(newEdbData)

        setSnackbar({
          open: true,
          message: "EDB créé avec succès",
          severity: "success",
        })

        handleNewEdbDialogClose()
        // Recharger la liste des EDBs
        fetchEdbs()

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors de la création de l'EDB:", error)
        setSnackbar({
          open: true,
          message: "Erreur lors de la création de l'EDB",
          severity: "error",
        })
        setLoading(false)
      }
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

  // Fonction pour approuver un EDB
  const handleApproveEdb = async (edbId: number) => {
    try {
      setLoading(true)
      await edbApi.approveEdb(edbId) 

      setSnackbar({
        open: true,
        message: "EDB approuvé avec succès",
        severity: "success",
      })

      // Recharger la liste des EDBs
      fetchEdbs()

      // Si nous sommes dans la vue détaillée de l'EDB approuvé, recharger les détails
      if (showEdbDetails && selectedEdb?.id === edbId) {
        await handleViewEdbDetails(edbId)
      }

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de l'approbation de l'EDB:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors de l'approbation de l'EDB",
        severity: "error",
      })
      setLoading(false)
    }
  }

  // Fonction pour rejeter un EDB
  const handleRejectEdb = async (edbId: number) => {
    try {
      setLoading(true)
      await edbApi.rejectEdb(edbId)

      setSnackbar({
        open: true,
        message: "EDB rejeté avec succès",
        severity: "success",
      })

      // Recharger la liste des EDBs
      fetchEdbs()

      // Si nous sommes dans la vue détaillée de l'EDB rejeté, recharger les détails
      if (showEdbDetails && selectedEdb?.id === edbId) {
        await handleViewEdbDetails(edbId)
      }

      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du rejet de l'EDB:", error)
      setSnackbar({
        open: true,
        message: "Erreur lors du rejet de l'EDB",
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

      {/* Contenu de la page EDB */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {showEdbDetails ? (
          // Vue détaillée d'un EDB
          <EdbDetails
            edb={selectedEdb}
            onBack={handleBackToEdbsList}
            onApprove={handleApproveEdb}
            onReject={handleRejectEdb}
            statuses={statuses}
            priorities={priorities}
          />
        ) : (
          // Vue liste des EDBs
          <>
            {/* Fil d'Ariane */}
            <Box sx={{ mb: 2 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/1">
                  Tableau de bord
                </Link>
                <Typography color="text.primary">Expressions de Besoin</Typography>
              </Breadcrumbs>
            </Box>
            {/* En-tête de la page */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold">
                  Expressions de Besoin (EDB)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gérez les demandes clients avant leur transformation en projets
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  placeholder="Rechercher..."
                  size="small"
                  value={searchEdbQuery}
                  onChange={(e) => setSearchEdbQuery(e.target.value)}
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
                {/* Remplacer le bouton de filtres et le panneau de filtres */}
                <Button
                  variant="contained"
                  onClick={() => setOpenFiltersDialog(true)}
                  sx={{
                    textTransform: "none",
                    minWidth: "120px",
                    height: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    bgcolor: "#f5f5f5",
                    color: "black",
                    "&:hover": {
                      bgcolor: "#e0e0e0",
                    },
                  }}
                  endIcon={<FilterListIcon />}
                >
                  Filtres
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={handleNewEdbDialogOpen}
                  sx={{ textTransform: "none", borderRadius: 1, px: 2, bgcolor: "#16A249" }}
                >
                  Nouvelle EDB
                </Button>
              </Box>
            </Box>

            {/* Liste des EDBs */}
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, boxShadow: 3, mb: 4 }}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Titre</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Demandeur</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date de demande</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Priorité</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEdbs.length > 0 ? (
                    filteredEdbs.map((edb) => (
                      <TableRow key={edb.id} hover>
                        <TableCell>
                          <Typography
                            fontWeight="bold"
                            sx={{
                              cursor: "pointer",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            onClick={(e) => handleViewEdbDetails(edb.id, e)}
                          >
                            {edb.title}
                          </Typography>
                        </TableCell>
                        <TableCell>{edb.user?.name || "Utilisateur inconnu"}</TableCell>
                        <TableCell>{formatDate(edb.date_demande)}</TableCell>
                        <TableCell>
                          <Chip
                            label={edb.status?.name || getStatusName(edb.status_id)}
                            size="small"
                            sx={{ bgcolor: getStatusColor(edb.status?.name || getStatusName(edb.status_id)).bg, color: getStatusColor(edb.status?.name || getStatusName(edb.status_id)).text, fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={edb.priority?.name || getPriorityName(edb.priority_id)}
                            size="small"
                            sx={{ bgcolor: getPriorityColor(edb.priority?.name || getPriorityName(edb.priority_id)).bg, color: getPriorityColor(edb.priority?.name || getPriorityName(edb.priority_id)).text, fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleEdbActionMenuOpen(e, edb.id)}>
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Aucune EDB trouvée
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Statistiques des EDBs */}
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
                    Total des EDBs
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {edbs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  expressions de besoin enregistrées
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
                    EDBs validées
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {edbs.filter((e) => e.status?.name === "Validé" || getStatusName(e.status_id) === "Validé").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  prêtes à être transformées en projets
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
                    EDBs en attente
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                  {
                    edbs.filter((e) => e.status?.name === "En attente" || getStatusName(e.status_id) === "En attente")
                      .length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  nécessitant une analyse ou une décision
                </Typography>
              </Paper>
            </Box>
          </>
        )}
      </Container>

      {/* Dialogue de création d'un nouvel EDB */}
      <Dialog open={openNewEdbDialog} onClose={handleNewEdbDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Créer une nouvelle Expression de Besoin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Titre"
            color="success"
            type="text"
            fullWidth
            variant="outlined"
            value={newEdbData.title}
            onChange={handleNewEdbInputChange}
            error={newEdbErrors.title}
            helperText={newEdbErrors.title ? "Le titre est requis" : ""}
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
            value={newEdbData.description}
            onChange={handleNewEdbInputChange}
            error={newEdbErrors.description}
            helperText={newEdbErrors.description ? "La description est requise" : ""}
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
            id="objectif"
            name="objectif"
            label="Objectifs"
            color="success"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newEdbData.objectif}
            onChange={handleNewEdbInputChange}
            error={newEdbErrors.objectif}
            helperText={newEdbErrors.objectif ? "Les objectifs sont requis" : ""}
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
            id="contrainte"
            name="contrainte"
            label="Contraintes"
            color="success"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newEdbData.contrainte}
            onChange={handleNewEdbInputChange}
            error={newEdbErrors.contrainte}
            helperText={newEdbErrors.contrainte ? "Les contraintes sont requises" : ""}
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
          {/* <TextField
            label="Date de la demande"
            type="date"
            name="date_demande"
            color="success"
            value={newEdbData.date_demande}
            onChange={handleNewEdbInputChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            error={newEdbErrors.date_demande}
            helperText={newEdbErrors.date_demande ? "La date de la demande est requise" : ""}
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
          /> */}
          {/* Vérifier que les options de priorité sont correctes */}
          <FormControl fullWidth margin="dense" error={newEdbErrors.priority_id} color="success">
            <InputLabel id="priority-label">Priorité</InputLabel>
            <Select
              labelId="priority-label"
              id="priority_id"
              value={newEdbData.priority_id.toString()}
              label="Priorité"
              onChange={handleNewEdbPriorityChange}
            >
              {priorities.length > 0 ? (
                priorities.map((priority) => (
                  <MenuItem key={priority.id} value={priority.id.toString()}>
                    {priority.name}
                  </MenuItem>
                ))
              ) : (
                <>
                  <MenuItem value="1">Haute</MenuItem>
                  <MenuItem value="2">Moyenne</MenuItem>
                  <MenuItem value="3">Basse</MenuItem>
                </>
              )}
            </Select>
            {newEdbErrors.priority_id && (
              <Typography variant="caption" color="error">
                La priorité est requise
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleNewEdbDialogClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              color: '#6B7280',
              borderColor: '#6B7280',
              '&:hover': {
                backgroundColor: '#6B7280',
                color: 'white',
                borderColor: '#6B7280',
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateNewEdb}
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
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de modification d'un EDB */}
      <Dialog open={openEditEdbDialog} onClose={handleEditEdbDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Modifier l'Expression de Besoin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label="Titre"
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
            value={editEdbData.title}
            onChange={handleEditEdbInputChange}
            error={editEdbErrors.title}
            helperText={editEdbErrors.title ? "Le titre est requis" : ""}
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
            value={editEdbData.description}
            onChange={handleEditEdbInputChange}
            error={editEdbErrors.description}
            helperText={editEdbErrors.description ? "La description est requise" : ""}
            required
          />
          <TextField
            margin="dense"
            id="objectif"
            name="objectif"
            label="Objectifs"
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
            rows={2}
            variant="outlined"
            value={editEdbData.objectif}
            onChange={handleEditEdbInputChange}
            error={editEdbErrors.objectif}
            helperText={editEdbErrors.objectif ? "Les objectifs sont requis" : ""}
            required
          />
          <TextField
            margin="dense"
            id="contrainte"
            name="contrainte"
            label="Contraintes"
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
            rows={2}
            variant="outlined"
            value={editEdbData.contrainte}
            onChange={handleEditEdbInputChange}
            error={editEdbErrors.contrainte}
            helperText={editEdbErrors.contrainte ? "Les contraintes sont requises" : ""}
            required
          />
          <FormControl fullWidth margin="dense" error={editEdbErrors.status_id} color="success">
            <InputLabel id="edit-status-label">Statut</InputLabel>
            <Select
              labelId="edit-status-label"
              id="edit-status"
              value={editEdbData.status_id.toString()}
              label="Statut"
              onChange={handleEditEdbStatusChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status.id} value={status.id.toString()}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
            {editEdbErrors.status_id && (
              <Typography variant="caption" color="error">
                Le statut est requis
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth margin="dense" error={editEdbErrors.priority_id} color="success">
            <InputLabel id="edit-priority-label">Priorité</InputLabel>
            <Select
              labelId="edit-priority-label"
              id="edit-priority"
              value={editEdbData.priority_id.toString()}
              label="Priorité"
              onChange={handleEditEdbPriorityChange}
            >
              {priorities.map((priority) => (
                <MenuItem key={priority.id} value={priority.id.toString()}>
                  {priority.name}
                </MenuItem>
              ))}
            </Select>
            {editEdbErrors.priority_id && (
              <Typography variant="caption" color="error">
                La priorité est requise
              </Typography>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditEdbDialogClose}
            variant="outlined"
            sx={{
              textTransform: 'none',
              color: '#6B7280',
              borderColor: '#6B7280',
              '&:hover': {
                backgroundColor: '#6B7280',
                color: 'white',
                borderColor: '#6B7280',
              },
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateEdb}
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

      {/* Dialogue de suppression d'un EDB */}
      <Dialog open={openDeleteEdbDialog} onClose={handleDeleteEdbDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Supprimer l'Expression de Besoin</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir supprimer cette EDB ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteEdbDialogClose}
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
            onClick={handleDeleteEdb}
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
            {loading ? <CircularProgress size={24} color="success" /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu d'actions pour les EDBs */}
      <Menu
        anchorEl={edbActionMenuAnchorEl}
        open={openEdbActionMenu}
        onClose={handleEdbActionMenuClose}
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
        <MenuItem onClick={(e) => handleViewEdbDetails(selectedEdbId || 0, e)}>
          <ListItemIcon>
          <VisibilityIcon fontSize="small" sx={{ color: "#16A249" }}  />
          </ListItemIcon>
          <ListItemText primary="Détails" />
        </MenuItem>
        <MenuItem onClick={() => handleEditEdbDialogOpen(selectedEdbId || 0)}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: "#16A249" }} />
          </ListItemIcon>
          <ListItemText primary="Modifier" />
        </MenuItem>
        <MenuItem onClick={() => handleDeleteEdbDialogOpen(selectedEdbId || 0)}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Supprimer" sx={{ color: "error.main" }} />
        </MenuItem>
      </Menu>
      {/* Ajouter ce dialogue de filtres après les autres dialogues */}
      {/* Dialogue de filtres */}
      <Dialog open={openFiltersDialog} onClose={() => setOpenFiltersDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Filtrer les EDBs</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <FormControl fullWidth color="success">
              <InputLabel id="statuts-filter-label">Statut</InputLabel>
              <Select
                labelId="statuts-filter-label"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Statut"
              >
                <MenuItem value="Tous les statuts">Tous les statuts</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.id} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth color="success">
              <InputLabel id="priorites-filter-label">Priorité</InputLabel>
              <Select
                labelId="priorites-filter-label"
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                label="Priorité"
              >
                <MenuItem value="Toutes les priorités">Toutes les priorités</MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority.id} value={priority.name}>
                    {priority.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFiltersDialog(false)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={() => {
              setStatusFilter("Tous les statuts")
              setPriorityFilter("Toutes les priorités")
            }}
            color="error"
            sx={{ mr: 1 }}
          >
            Réinitialiser
          </Button>
          <Button
            onClick={() => setOpenFiltersDialog(false)}
            variant="contained"
            color="success"
            sx={{
              backgroundColor: "#16A249",
              "&:hover": {
                backgroundColor: "#138a3c",
              },
            }}
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  )
}

export default FinalEdb