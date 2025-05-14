"use client"

import type React from "react"
import { useState } from "react"
import {
  Box,
  Typography,
  TextField,
  Switch,
  Button,
  Paper,
  Breadcrumbs,
  Link,
  FormControlLabel,
  Container,
} from "@mui/material"

import { styled } from "@mui/material/styles"
import AppLayout from "../layout/AppLayout"

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
}))

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#27ae60",
  color: "white",
  "&:hover": {
    backgroundColor: "#16A249",
  },
  padding: theme.spacing(1, 3),
}))

interface UserSettings {
  name: string
  email: string
  password: string
  notifications: boolean
}

const Parametres: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    email: "",
    password: "",
    notifications: true,
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target
    setSettings({
      ...settings,
      [name]: name === "notifications" ? checked : value,
    })
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log("Settings saved:", settings)
    // Here you would typically send the data to your backend
  }


  return (
    <AppLayout>
       <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 3 }}>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link underline="hover" color="inherit" href="/">
              Tableau de bord
            </Link>
            <Typography color="text.primary">Settings</Typography>
          </Breadcrumbs>

          {/* Titre de la page */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" sx={{ flex: 1, fontWeight: "bold" }}>
              Paramètres
            </Typography>
            </Box>

          {/* Settings Form */}
          <StyledPaper elevation={1}>
            <Typography variant="h5" component="h2" gutterBottom>
              Paramètres du compte
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Nom
                </Typography>
                <TextField
                  fullWidth
                  name="name"
                  value={settings.name}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Nouveau mot de passe
                </Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={settings.password}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications}
                      onChange={handleChange}
                      name="notifications"
                      color="primary"
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#27ae60",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#27ae60",
                        },
                      }}
                    />
                  }
                  label="Activer les notifications"
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <SaveButton type="submit" variant="contained">
                  Enregistrer les modifications
                </SaveButton>
              </Box>
            </Box>
          </StyledPaper>
          </Container>
    </AppLayout>
  )
}

export default Parametres;