"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"
import WorkIcon from "@mui/icons-material/Work"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
  Breadcrumbs,
  Link,
  Avatar,
} from "@mui/material"
import AppLayout from "../../components/layout/AppLayout"
import { profileApi } from "./apiProfile"
import { getCurrentUser } from "../login/api"

interface UserData {
  id?: number
  name: string
  email: string
  role: string
  number: string | null
  password: string
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    role: "",
    number: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({
    open: false,
    message: "",
    severity: "success",
  })

  // État pour l'utilisateur connecté - variable non utilisée directement mais setter nécessaire
  const [_currentUser, setCurrentUser] = useState<any>(null)

  // Référence pour l'intervalle de vérification d'authentification
  const authCheckIntervalRef = useRef<number | null>(null)

  useEffect(() => {
    checkAuthentication()

    // Configurer une vérification périodique de l'authentification (toutes les 5 minutes)
    // authCheckIntervalRef.current = setInterval(checkAuthentication, 5 * 60 * 1000);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (authCheckIntervalRef.current) {
        window.clearInterval(authCheckIntervalRef.current)
      }
    }
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      // Récupérer l'utilisateur connecté depuis le sessionStorage
      const currentUser = getCurrentUser()

      if (currentUser) {
        // Utiliser les données de l'utilisateur connecté
        setUserData({
          ...userData,
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          number: currentUser.number || "",
          role: currentUser.role || "",
        })
      } else {
        // Si l'utilisateur n'est pas dans le sessionStorage, faire l'appel API
        const response = await profileApi.getProfile()
        if (response.success) {
          setUserData(response.data)
        }
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err)
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des données",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    // Validation des champs
    if (!userData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Le nom est requis",
        severity: "error",
      })
      return
    }

    if (!userData.email.trim()) {
      setSnackbar({
        open: true,
        message: "L'email est requis",
        severity: "error",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      setSnackbar({
        open: true,
        message: "Veuillez entrer une adresse email valide",
        severity: "error",
      })
      return
    }

    // Validation du mot de passe uniquement s'il est rempli
    if (userData.password && userData.password.trim() !== "") {
      if (userData.password.length < 8) {
        setSnackbar({
          open: true,
          message: "Le mot de passe doit contenir au moins 8 caractères",
          severity: "error",
        })
        return
      }

      if (userData.password !== confirmPassword) {
        setSnackbar({
          open: true,
          message: "Les mots de passe ne correspondent pas",
          severity: "error",
        })
        return
      }
    }

    try {
      setLoading(true)
      await profileApi.updateProfile(userData)

      // Mise à jour du sessionStorage après succès de l'API
      const storedUser = sessionStorage.getItem("user")
      if (storedUser) {
        const userObject = JSON.parse(storedUser)
        // Mettre à jour les propriétés modifiées
        const updatedUser = {
          ...userObject,
          name: userData.name,
          email: userData.email,
          number: userData.number,
          // Ne pas inclure le mot de passe dans l'objet sessionStorage
        }
        // Enregistrer l'utilisateur mis à jour dans le sessionStorage
        sessionStorage.setItem("user", JSON.stringify(updatedUser))
        console.log("SessionStorage mis à jour avec succès:", updatedUser)
      }

      setSnackbar({
        open: true,
        message: "Profil mis à jour avec succès",
        severity: "success",
      })
      setUserData({ ...userData, password: "" })
      setConfirmPassword("")
    } catch (err: any) {
      console.error("Erreur lors de la mise à jour du profil:", err)
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil",
        severity: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour vérifier l'authentification
  const checkAuthentication = () => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user) // Keep this line
      fetchUserData() // Appeler fetchUserData après avoir vérifié l'authentification
    } else {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      window.location.href = "/login"
    }
  }

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Fil d'Ariane */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/1">
              Tableau de bord
            </Link>
            <Typography color="text.primary">Profil</Typography>
          </Breadcrumbs>
        </Box>

        {/* En-tête de la page */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Mon Profil
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gérez vos informations personnelles
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Carte de profil */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 30%" } }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, boxShadow: 3, height: "100%" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: "#16A249",
                    fontSize: "2rem",
                    mb: 2,
                  }}
                >
                  {userData.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {userData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userData.email}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {userData.number ? userData.number : "Aucun numéro de téléphone"}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Formulaire de profil */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 70%" } }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, boxShadow: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Informations personnelles
              </Typography>
              <Box>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Nom complet"
                  name="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: "#16A249" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                  }}
                />

                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "#16A249" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  id="number"
                  label="Numéro de téléphone"
                  name="number"
                  value={userData.number}
                  onChange={(e) => setUserData({ ...userData, number: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: "#16A249" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                  }}
                />

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, mt: 4 }}>
                  Changer le mot de passe
                </Typography>

                <TextField
                  fullWidth
                  id="password"
                  label="Nouveau mot de passe (optionnel)"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon sx={{ color: "#16A249" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: "#16A249" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                    // Masquer le bouton natif du navigateur
                    "& input::-ms-reveal, & input::-ms-clear": {
                      display: "none",
                    },
                    "& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button":
                      {
                        visibility: "hidden",
                        display: "none !important",
                        pointerEvents: "none",
                        height: "0",
                        width: "0",
                        margin: "0",
                      },
                  }}
                />

                <TextField
                  fullWidth
                  id="confirmPassword"
                  label="Confirmer le nouveau mot de passe"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <WorkIcon sx={{ color: "#16A249" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                    // Masquer le bouton natif du navigateur
                    "& input::-ms-reveal, & input::-ms-clear": {
                      display: "none",
                    },
                    "& input::-webkit-contacts-auto-fill-button, & input::-webkit-credentials-auto-fill-button, & input::-webkit-credit-card-auto-fill-button":
                      {
                        visibility: "hidden",
                        display: "none !important",
                        pointerEvents: "none",
                        height: "0",
                        width: "0",
                        margin: "0",
                      },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    onClick={handleUpdateProfile}
                    variant="contained"
                    color="success"
                    disabled={loading}
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
                    {loading ? <CircularProgress size={24} color="success" /> : "Mettre à jour"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              width: "100%",
              borderRadius: 2,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AppLayout>
  )
}

export default Profile
