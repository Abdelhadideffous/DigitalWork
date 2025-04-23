"use client"

import React, { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  TaskAlt as TaskAltIcon,
  Clear as ClearIcon,
  Visibility as VisibilityIcon,
  FileDownload as FileDownloadIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { edbApi, type Attachment, type Edb, type Priority, type Status } from "./api"

interface EdbDetailsProps {
  edb: Edb
  onBack: () => void
  onApprove: (edbId: number) => Promise<void>
  onReject: (edbId: number) => Promise<void>
  statuses: Status[]
  priorities: Priority[]
}

function EdbDetails({ edb, onBack, onApprove, onReject, statuses, priorities }: EdbDetailsProps) {
  const [activeTab, setActiveTab] = useState(0) // 0 pour "Détails", 1 pour "Pièces jointes"
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Fonction pour charger les pièces jointes
  const fetchAttachments = async () => {
    if (!edb?.id) return

    try {
      setLoading(true)
      const attachmentsData = await edbApi.getEdbAttachments(edb.id)
      setAttachments(attachmentsData)
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors du chargement des pièces jointes:", error)
      setLoading(false)
    }
  }

  // Charger les pièces jointes au chargement du composant et lorsque l'onglet change
  useEffect(() => {
    if (activeTab === 1) {
      fetchAttachments()
    }
  }, [edb?.id, activeTab])

  // Fonction pour changer d'onglet
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  // Fonction pour approuver l'EDB
  const handleApprove = async () => {
    if (!edb?.id) return
    await onApprove(edb.id)
  }

  // Fonction pour rejeter l'EDB
  const handleReject = async () => {
    if (!edb?.id) return
    await onReject(edb.id)
  }

  // Fonction pour ouvrir le dialogue d'upload
  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true)
    setSelectedFiles([])
  }

  // Fonction pour fermer le dialogue d'upload
  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false)
    setSelectedFiles([])
  }

  // Fonction pour gérer la sélection de fichiers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files))
    }
  }

  // Fonction pour uploader les fichiers
  const handleUploadFiles = async () => {
    if (!edb?.id || selectedFiles.length === 0) return

    try {
      setLoading(true)
      await edbApi.uploadAttachments(edb.id, selectedFiles)
      await fetchAttachments()
      handleUploadDialogClose()
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de l'upload des fichiers:", error)
      setLoading(false)
    }
  }

  // Fonction pour supprimer une pièce jointe
  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!edb?.id) return

    try {
      setLoading(true)
      await edbApi.deleteAttachment(edb.id, attachmentId)
      await fetchAttachments()
      setLoading(false)
    } catch (error) {
      console.error("Erreur lors de la suppression de la pièce jointe:", error)
      setLoading(false)
    }
  }

  // Fonction pour prévisualiser une pièce jointe
  const handlePreviewAttachment = (filePath: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/storage/${filePath}`, "_blank")
  }

  // Fonction pour télécharger une pièce jointe
  const handleDownloadAttachment = (filePath: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/storage/${filePath}`
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "en cours":
        return "success"
      case "en attente":
        return "warning"
      case "validé":
        return "success"
      case "rejeté":
        return "error"
      default:
        return "default"
    }
  }

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priorityName: string) => {
    switch (priorityName.toLowerCase()) {
      case "haute":
        return "error"
      case "moyenne":
        return "warning"
      case "basse":
        return "success"
      default:
        return "default"
    }
  }

  return (
    <>
      {/* Fil d'Ariane et en-tête combinés */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault()
              onBack()
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
              onBack()
            }}
          >
            Expressions de Besoin
          </Link>
          <Typography color="text.primary">{edb?.id}</Typography>
        </Breadcrumbs>

        {/* En-tête avec bouton retour, titre et boutons d'action */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={onBack} sx={{ mr: 1, p: 0 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" sx={{ flex: 1, fontWeight: "bold" }}>
            {edb?.title}
          </Typography>
        </Box>
      </Box>

      {/* Badge de statut */}
      <Box sx={{ mb: 3, display: "flex", alignItems: "center" }}>
        <Chip
          label={edb?.status?.name || getStatusName(edb?.status_id)}
          color={getStatusColor(edb?.status?.name || getStatusName(edb?.status_id)) as any}
          sx={{ mr: 2 }}
        />
        <Chip
          label={edb?.priority?.name || getPriorityName(edb?.priority_id)}
          color={getPriorityColor(edb?.priority?.name || getPriorityName(edb?.priority_id)) as any}
          sx={{ mr: 2 }}
        />
      </Box>

      {/* Boutons d'action */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleApprove}
          startIcon={<TaskAltIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 1,
            px: 2,
            backgroundColor: "#16A249",
            color: "white",
            "&:hover": {
              backgroundColor: "#138a3c",
            },
          }}
        >
          Approuver
        </Button>
        <Button
          variant="contained"
          onClick={handleReject}
          startIcon={<ClearIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 1,
            px: 2,
            backgroundColor: "#f44336",
            color: "white",
            "&:hover": {
              backgroundColor: "#d32f2f",
            },
          }}
        >
          Rejeter
        </Button>
      </Box>

      {/* Onglets */}
      <Box sx={{ width: "100%", mb: 4 }}>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="edb tabs"
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
            <Tab label="Détails" />
            <Tab label="Pièces jointes" />
          </Tabs>

          {/* Contenu de l'onglet "Détails" */}
          <Box role="tabpanel" hidden={activeTab !== 0} sx={{ p: 3 }}>
            {activeTab === 0 && (
              <>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, mb: 4 }}>
                  {/* Informations générales */}
                  <Card sx={{ flex: 1, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Informations générales
                      </Typography>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Box
                          sx={{
                            backgroundColor: "#f5f7fa",
                            p: 2,
                            borderRadius: 1,
                            borderLeft: "4px solid #16A249",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" color="#16A249" gutterBottom>
                            Demandeur
                          </Typography>
                          <Typography variant="body1">{edb?.user?.name || "Non spécifié"}</Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#f5f7fa",
                            p: 2,
                            borderRadius: 1,
                            borderLeft: "4px solid #FF8C00",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" color="#FF8C00" gutterBottom>
                            Date de demande
                          </Typography>
                          <Typography variant="body1">{formatDate(edb?.date_demande)}</Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#f5f7fa",
                            p: 2,
                            borderRadius: 1,
                            borderLeft: "4px solid #3f51b5",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" color="#3f51b5" gutterBottom>
                            Statut
                          </Typography>
                          <Typography variant="body1">{edb?.status?.name || getStatusName(edb?.status_id)}</Typography>
                        </Box>
                        <Box
                          sx={{
                            backgroundColor: "#f5f7fa",
                            p: 2,
                            borderRadius: 1,
                            borderLeft: "4px solid #f44336",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold" color="#f44336" gutterBottom>
                            Priorité
                          </Typography>
                          <Typography variant="body1">
                            {edb?.priority?.name || getPriorityName(edb?.priority_id)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Description */}
                  <Card sx={{ flex: 1, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Description du besoin
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {edb?.description || "Aucune description fournie."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
                  {/* Objectifs */}
                  <Card sx={{ flex: 1, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Objectifs
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {edb?.objectif || "Aucun objectif spécifié."}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Contraintes */}
                  <Card sx={{ flex: 1, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Contraintes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                        {edb?.contrainte || "Aucune contrainte spécifiée."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </>
            )}
          </Box>

          {/* Contenu de l'onglet "Pièces jointes" */}
          <Box role="tabpanel" hidden={activeTab !== 1} sx={{ p: 3 }}>
            {activeTab === 1 && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Pièces jointes
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={handleUploadDialogOpen}
                    sx={{
                      backgroundColor: "#16A249",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "#138a3c",
                      },
                    }}
                  >
                    Ajouter un fichier
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={30} color="success" />
                  </Box>
                ) : attachments.length > 0 ? (
                  attachments.map((attachment) => (
                    <Card key={attachment.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <InsertDriveFileIcon sx={{ color: "#16A249", mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                              {attachment.file_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ajouté le {formatDate(attachment.created_at || "")}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton aria-label="aperçu" onClick={() => handlePreviewAttachment(attachment.file_path)}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            aria-label="télécharger"
                            onClick={() => handleDownloadAttachment(attachment.file_path, attachment.file_name)}
                          >
                            <FileDownloadIcon />
                          </IconButton>
                          <IconButton
                            aria-label="supprimer"
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                    Aucune pièce jointe disponible.
                  </Typography>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Dialogue d'upload de fichiers */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Ajouter des pièces jointes</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mb: 2, textTransform: "none" }}
            >
              Sélectionner des fichiers
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              />
            </Button>

            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Fichiers sélectionnés:
                </Typography>
                {selectedFiles.map((file, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <InsertDriveFileIcon sx={{ mr: 1 }} />
                    <Typography>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleUploadFiles}
            variant="contained"
            color="success"
            disabled={selectedFiles.length === 0 || loading}
            sx={{
              backgroundColor: "#16A249",
              "&:hover": {
                backgroundColor: "#138a3c",
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Uploader"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default EdbDetails
