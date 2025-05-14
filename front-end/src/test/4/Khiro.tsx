"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Chip,
  Container,
  Breadcrumbs,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  Folder as FolderIcon,
  Task as TaskIcon,
  People as TeamIcon,
  Warning,
  Add as AddIcon,
  MoreVert,
  FilterList,
  PieChart,
  BarChart,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import AppLayout from "../layout/AppLayout"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": { padding: theme.spacing(2) },
  "& .MuiDialogActions-root": { padding: theme.spacing(1) },
}))

const Khiro: React.FC = () => {
  // État pour le modal de création de projet (ajouté depuis projet.tsx)
  const [projectModalOpen, setProjectModalOpen] = useState(false)

  // Fonctions pour gérer le modal de projet
  const handleProjectModalOpen = () => setProjectModalOpen(true)
  const handleProjectModalClose = () => setProjectModalOpen(false)


  // Données pour les cartes de statistiques
  const statsCards = [
    { icon: <FolderIcon sx={{ color: "blue" }} />, label: "Projets actifs", count: 8, bgColor: "#E3F2FD" },
    { icon: <TaskIcon sx={{ color: "orange" }} />, label: "Tâches en cours", count: 24, bgColor: "#FFF3E0" },
    { icon: <TeamIcon sx={{ color: "green" }} />, label: "Utilisateurs", count: 15, bgColor: "#E8F5E9" },
    { icon: <Warning sx={{ color: "red" }} />, label: "Projets en retard", count: 2, bgColor: "#FFEBEE" },
  ]

  // Données pour les projets récents
  const recentProjects = [
    {
      id: 1,
      nom: "Refonte du site web",
      statut: "En cours",
      progression: 65,
      responsable: "Marie Dupont",
    },
    {
      id: 2,
      nom: "Application mobile",
      statut: "En cours",
      progression: 40,
      responsable: "Jean Martin",
    },
    {
      id: 3,
      nom: "Campagne marketing Q2",
      statut: "À démarrer",
      progression: 0,
      responsable: "Sophie Leclerc",
    },
    {
      id: 4,
      nom: "Mise à jour CRM",
      statut: "Terminé",
      progression: 100,
      responsable: "Thomas Bernard",
    },
  ]

  // Données pour les utilisateurs récents
  const recentUsers = [
    { id: 1, nom: "Marie Dupont", role: "Chef de projet", departement: "Marketing", dateCreation: "01/03/2025" },
    { id: 2, nom: "Jean Martin", role: "Chef de projet", departement: "Développement", dateCreation: "15/02/2025" },
    { id: 3, nom: "Sophie Leclerc", role: "Membre d'équipe", departement: "Marketing", dateCreation: "10/02/2025" },
    { id: 4, nom: "Thomas Bernard", role: "Membre d'équipe", departement: "Design", dateCreation: "05/02/2025" },
  ]

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "À démarrer":
        return { bg: "#FFF9C4", color: "goldenrod" }
      case "En cours":
        return { bg: "#E3F2FD", color: "blue" }
      case "Terminé":
        return { bg: "#E8F5E9", color: "green" }
      case "En retard":
        return { bg: "#FFEBEE", color: "red" }
      default:
        return { bg: "#E0E0E0", color: "gray" }
    }
  }

  return (
    <AppLayout>
            <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 3 }}>
          {/* Fil d'Ariane */}
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Typography color="text.primary">Tableau de bord</Typography>
            </Breadcrumbs>
          </Box>

          {/* En-tête et titre */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Tableau de bord administrateur
            </Typography>

            {/* Bouton "Nouveau projet" modifié pour ouvrir le modal */}
            <Button
              variant="contained"
              onClick={handleProjectModalOpen}
              color="success"
              startIcon={<AddIcon />}
              sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
            >
              Nouveau projet
            </Button>

            {/* Modal de création de projet (intégré depuis projet.tsx) */}
            <BootstrapDialog
              onClose={handleProjectModalClose}
              aria-labelledby="customized-dialog-title"
              open={projectModalOpen}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Créer un nouveau projet
              </DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleProjectModalClose}
                sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
              >
                <CloseIcon />
              </IconButton>

              <DialogContent dividers>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <TextField label="Nom du projet" fullWidth variant="outlined" />
                  <TextField label="Description" fullWidth multiline rows={4} variant="outlined" />
                  <TextField select label="Priorité" fullWidth variant="outlined"></TextField>
                  <TextField select label="Statut" fullWidth variant="outlined"></TextField>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          label="Date de début"
                          slotProps={{ textField: { fullWidth: true, placeholder: "Date de début" } }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          label="Date de fin"
                          slotProps={{ textField: { fullWidth: true, placeholder: "Date de fin" } }}
                        />
                      </Box>
                    </Box>
                  </LocalizationProvider>
                </Box>
              </DialogContent>

              <DialogActions>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={handleProjectModalClose}
                  sx={{ textTransform: "none" }}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleProjectModalClose}
                  endIcon={<SendIcon />}
                  sx={{ textTransform: "none", borderRadius: 1, px: 3 }}
                >
                  Créer le Projet
                </Button>
              </DialogActions>
            </BootstrapDialog>
          </Box>

          {/* Cartes des statistiques */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mb: 4,
              flexWrap: "wrap",
            }}
          >
            {statsCards.map((card, index) => (
              <Paper
                key={index}
                elevation={2}
                sx={{
                  width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                  height: 120,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  p: 2,
                  textAlign: "center",
                  mb: { xs: 2, sm: 0 },
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {card.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                  {card.count}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Graphiques et tableaux */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 4 }}>
            {/* Graphique de progression des projets */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                width: { xs: "100%", md: "50%" },
                mb: { xs: 3, md: 0 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Progression des projets
                </Typography>
                <IconButton size="small">
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f9f9f9",
                  borderRadius: 1,
                }}
              >
                <BarChart sx={{ fontSize: 100, color: "#ccc" }} />
              </Box>
            </Paper>

            {/* Répartition des tâches */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                width: { xs: "100%", md: "50%" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Répartition des tâches
                </Typography>
                <IconButton size="small">
                  <MoreVert fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#f9f9f9",
                  borderRadius: 1,
                }}
              >
                <PieChart sx={{ fontSize: 100, color: "#ccc" }} />
              </Box>
            </Paper>
          </Box>

          {/* Projets récents */}
          <Paper sx={{ p: 3, borderRadius: 2,boxShadow: 3, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Projets récents
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<FilterList />}
                sx={{ textTransform: "none", borderRadius: 1 }}
              >
                Filtrer
              </Button>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Nom du projet</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Progression</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Responsable</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentProjects.map((project) => {
                    const statusColor = getStatusColor(project.statut)
                    return (
                      <TableRow key={project.id} hover>
                        <TableCell>{project.nom}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.statut}
                            size="small"
                            sx={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.color,
                              fontWeight: "medium",
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
                                height: 6,
                                borderRadius: 3,
                                bgcolor: "#e0e0e0",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor:
                                    project.progression === 100
                                      ? "#4caf50"
                                      : project.progression < 30
                                        ? "#f44336"
                                        : "#2196f3",
                                },
                              }}
                            />
                            <Typography variant="body2">{project.progression}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{project.responsable}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="text" color="primary" sx={{ textTransform: "none" }}>
                Voir tous les projets
              </Button>
            </Box>
          </Paper>

          {/* Utilisateurs récents */}
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Utilisateurs récents
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<FilterList />}
                sx={{ textTransform: "none", borderRadius: 1 }}
              >
                Filtrer
              </Button>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Nom</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Rôle</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Département</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date de création</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.nom}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.departement}</TableCell>
                      <TableCell>{user.dateCreation}</TableCell>
                      <TableCell>
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="text" color="primary" sx={{ textTransform: "none" }}>
                Voir tous les utilisateurs
              </Button>
            </Box>
          </Paper>
        </Container>
    </AppLayout>
  )
}

export default Khiro