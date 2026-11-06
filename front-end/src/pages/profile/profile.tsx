"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Visibility,
  VisibilityOff,
  Edit as EditIcon,
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
  Divider,
  Chip,
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

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "#f44336"
      case "manager":
        return "#ff9800"
      case "employee":
        return "#2196f3"
      default:
        return "#9e9e9e"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "Administrateur"
      case "manager":
        return "Manager"
      case "employee":
        return "Employé"
      default:
        return role
    }
  }

  return (
    <AppLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Fil d'Ariane */}
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" href="/dashboard">
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
              Gérez vos informations personnelles et paramètres de sécurité
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {/* Carte de profil améliorée */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 35%" } }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(22, 162, 73, 0.1)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                <Box sx={{ position: "relative", mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "#16A249",
                      fontSize: "2rem",
                      fontWeight: "bold",
                      boxShadow: "0 4px 20px rgba(22, 162, 73, 0.3)",
                      border: "3px solid white",
                    }}
                  >
                    {userData.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      bgcolor: "#16A249",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(22, 162, 73, 0.3)",
                    }}
                  >
                    <EditIcon sx={{ color: "white", fontSize: 14 }} />
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, textAlign: "center" }}>
                  {userData.name}
                </Typography>

                <Chip
                  label={getRoleLabel(userData.role)}
                  sx={{
                    backgroundColor: getRoleColor(userData.role),
                    color: "white",
                    fontWeight: 600,
                    mb: 2,
                    borderRadius: 2,
                  }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ space: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(22, 162, 73, 0.05)",
                  }}
                >
                  <EmailIcon sx={{ color: "#16A249", mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Email
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {userData.email}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(22, 162, 73, 0.05)",
                  }}
                >
                  <PhoneIcon sx={{ color: "#16A249", mr: 2 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Téléphone
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {userData.number || "Non renseigné"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Formulaire de profil amélioré */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 65%" } }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                border: "1px solid rgba(22, 162, 73, 0.1)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon sx={{ color: "#16A249" }} />
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
                      transition: "all 0.3s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
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
                      transition: "all 0.3s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
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
                    mb: 4,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      transition: "all 0.3s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
                    },
                  }}
                />

                <Divider sx={{ my: 3 }} />

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                >
                  <WorkIcon sx={{ color: "#16A249" }} />
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
                          sx={{
                            color: "#16A249",
                            "&:hover": {
                              backgroundColor: "rgba(22, 162, 73, 0.1)",
                            },
                          }}
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
                      transition: "all 0.3s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
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
                      transition: "all 0.3s ease",
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#16A249",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#16A249",
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
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "#138a3c",
                        borderColor: "#138a3c",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(22, 162, 73, 0.3)",
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Mettre à jour"}
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
