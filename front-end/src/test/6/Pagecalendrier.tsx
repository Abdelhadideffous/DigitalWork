"use client"


import { useState } from "react"
import { styled } from "@mui/material/styles"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import dayjs, { type Dayjs } from "dayjs"
import type React from "react"
import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Link,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material"
import {
  Add as AddIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import AppLayout from "../layout/AppLayout"

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}))
const Pagecalendrier: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())


  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

 


  return (
    <AppLayout>
       <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 3 }}>
 
          {/* Fil d'Ariane */}
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="/">
                Tableau de bord
              </Link>
              <Typography color="text.primary">Calendrier</Typography>
            </Breadcrumbs>
          </Box>

          {/* En-tête et bouton */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" sx={{ flex: 1, fontWeight: "bold" }}>
              Calendrier
            </Typography>

            <Button
              variant="contained"
              onClick={handleClickOpen}
              color="success"
              startIcon={<AddIcon />}
              sx={{ textTransform: "none", borderRadius: 1, px: 2 }}
            >
              Nouvel événement
            </Button>

            {/* Fenêtre modale */}
            <BootstrapDialog
              onClose={handleClose}
              aria-labelledby="customized-dialog-title"
              open={open}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Ajouter un événement
              </DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={(theme) => ({
                  position: "absolute",
                  right: 8,
                  top: 8,
                  color: theme.palette.grey[500],
                })}
              >
                <CloseIcon />
              </IconButton>

              <DialogContent dividers>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <TextField label="Nom de la tâche" fullWidth variant="outlined" />
                  <TextField label="Description" fullWidth multiline rows={4} variant="outlined" />
                  <TextField select label="Projet" fullWidth variant="outlined"></TextField>
                  <TextField select label="Priorité" fullWidth variant="outlined"></TextField>
                  <TextField select label="Assigné à" fullWidth variant="outlined"></TextField>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          label="Date de début"
                          value={selectedDate}
                          onChange={setSelectedDate}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: "Date de début",
                            },
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <DatePicker
                          label="Date de fin"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              placeholder: "Date de fin",
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </LocalizationProvider>
                </Box>
              </DialogContent>

              <DialogActions>
                <Button variant="outlined" color="success" onClick={handleClose} sx={{ textTransform: "none" }}>
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleClose}
                  endIcon={<SendIcon />}
                  sx={{ textTransform: "none", borderRadius: 1, px: 3 }}
                >
                  Créer la tâche
                </Button>
              </DialogActions>
            </BootstrapDialog>
          </Box>
        </Container>
        {/* Cartes */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Card sx={{ height: 450, width: 500 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", margin: 2 }}>
              Calendrier des événements
            </Typography>
            <Card sx={{ height: 350, width: 400 }}>
              <CardContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar value={selectedDate} onChange={setSelectedDate} />
                </LocalizationProvider>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Card sx={{ height: 450, width: 500 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", margin: 2 }}>
              Événements à venir
            </Typography>
            <Typography  variant="h6" sx={{ fontWeight: "fit", margin: 2 }}>Réunion d'équipe</Typography>
          </CardContent>
        </Card>
      </Box>
      </AppLayout>
  )
}

export default Pagecalendrier;