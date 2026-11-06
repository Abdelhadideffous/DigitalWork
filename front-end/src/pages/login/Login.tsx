"use client"

import {
  ContentCopy as ContentCopyIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Work as WorkIcon,
} from "@mui/icons-material"
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Zoom,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "./api"

// Ajoutez ce style global pour masquer le bouton natif du navigateur
const globalStyles = `
  input::-ms-reveal,
  input::-ms-clear {
    display: none;
  }
  
  input::-webkit-contacts-auto-fill-button,
  input::-webkit-credentials-auto-fill-button,
  input::-webkit-credit-card-auto-fill-button {
    visibility: hidden;
    display: none !important;
    pointer-events: none;
    height: 0;
    width: 0;
    margin: 0;
  }
`

const Login: React.FC = () => {
  // Ajoutez ce code pour injecter le style global
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.innerHTML = globalStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)
  const [openAdminDialog, setOpenAdminDialog] = useState<boolean>(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  const handleOpenAdminDialog = () => setOpenAdminDialog(true)
  const handleCloseAdminDialog = () => setOpenAdminDialog(false)

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess(`${type} copié !`)
        setTimeout(() => setCopySuccess(null), 2000)
      },
      () => {
        setCopySuccess("Échec de la copie")
        setTimeout(() => setCopySuccess(null), 2000)
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation basique
    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      setOpenSnackbar(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await authApi.login({ email, password })

      if (response.success && response.token) {
        // Stocker le token et les informations utilisateur dans sessionStorage
        sessionStorage.setItem("token", response.token)

        // S'assurer que le rôle est inclus dans les données utilisateur
        const userData = {
          ...response.user,
          role: response.user?.role || "user", // Utiliser 'user' comme rôle par défaut si non spécifié
        }

        sessionStorage.setItem("user", JSON.stringify(userData))

        // Configurer le token pour les requêtes futures
        // setAuthToken(response.token)

        // Rediriger vers la page d'accueil ou le tableau de bord
        navigate("/dashboard")
      } else {
        setError(response.message || "Erreur lors de la connexion")
        setOpenSnackbar(true)
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion")
      setOpenSnackbar(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  // Données des administrateurs
  const admins = [
    {
      id: 1,
      name: "Ahmed Reda",
      initials: "JD",
      email: "Ahmed.Reda@mobilis.com",
      phone: "0672 34 56 78",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Administrateur Système",
    },
    {
      id: 2,
      name: "Marie Mahraz",
      initials: "MM",
      email: "marie.Mahraz@mobilis.com",
      phone: "0678 65 43 21",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Administrateur Support",
    },
  ]

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 1000,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          borderRadius: 4,
        }}
      >
        {/* Section gauche - Branding et illustration */}
        {!isMobile && (
          <Box
            sx={{
              flex: "0 0 45%",
              background: "linear-gradient(135deg, #16A249 0%, #0D7A36 100%)",
              color: "white",
              p: 4,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "10%",
                left: "-5%",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                zIndex: 0,
              }}
            />

            <Box sx={{ zIndex: 1, mb: 4, display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1,
                  mr: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WorkIcon fontSize="medium" />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                DigiWork
              </Typography>
            </Box>

            <Box sx={{ zIndex: 1, mt: 4, mb: 2 }}>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
                Bienvenue
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                Connectez-vous pour accéder à votre espace de travail et gérer vos projets en toute simplicité.
              </Typography>
            </Box>

            {/* Illustration */}
            <Box
              sx={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  maxHeight: 350,
                }}
              >
                {/* Forme organique */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "120%",
                    height: "85%",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50% 50% 0 0",
                    zIndex: 0,
                  }}
                />

                {/* Illustration SVG professionnelle */}
                <svg
                  viewBox="0 0 500 400"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {/* Bureau moderne */}
                  <rect x="80" y="280" width="340" height="15" rx="2" fill="#E0E0E0" />
                  <rect x="100" y="295" width="15" height="80" fill="#BDBDBD" />
                  <rect x="385" y="295" width="15" height="80" fill="#BDBDBD" />

                  {/* Écran d'ordinateur */}
                  <g transform="translate(250, 200)">
                    <rect x="-70" y="0" width="140" height="90" rx="4" fill="#424242" />
                    <rect x="-65" y="5" width="130" height="80" rx="2" fill="#ECEFF1" />
                    <rect x="-15" y="90" width="30" height="10" fill="#424242" />
                    <rect x="-40" y="100" width="80" height="5" rx="2" fill="#424242" />
                  </g>

                  {/* Clavier */}
                  <g transform="translate(250, 240)">
                    <rect x="-50" y="65" width="100" height="10" rx="2" fill="#E0E0E0" />
                  </g>

                  {/* Tasse de café professionnelle */}
                  <g transform="translate(350, 230)">
                    <path d="M0,0 L0,30 C0,35 10,35 10,30 L10,0 Z" fill="#FFFFFF" />
                    <path d="M10,10 C15,10 15,20 10,20" fill="none" stroke="#FFFFFF" strokeWidth="2" />
                    <ellipse cx="5" cy="0" rx="7" ry="2" fill="#FFFFFF" />
                    <ellipse cx="5" cy="30" rx="7" ry="2" fill="#FFFFFF" />
                  </g>

                  {/* Plante moderne */}
                  <g transform="translate(150, 230)">
                    <rect x="-15" y="20" width="30" height="30" rx="2" fill="#E0E0E0" />
                    <path d="M0,-10 L0,20" fill="none" stroke="#8FD9A8" strokeWidth="2" />
                    <path d="M0,0 C10,-10 15,-5 20,-15" fill="none" stroke="#8FD9A8" strokeWidth="2" />
                    <path d="M0,-5 C-10,-15 -15,-10 -20,-20" fill="none" stroke="#8FD9A8" strokeWidth="2" />
                    <path d="M0,5 C8,-5 12,0 15,-10" fill="none" stroke="#8FD9A8" strokeWidth="2" />
                    <path d="M0,5 C-8,-5 -12,0 -15,-10" fill="none" stroke="#8FD9A8" strokeWidth="2" />
                  </g>

                  {/* Éléments graphiques abstraits */}
                  <g transform="translate(100, 150)">
                    <circle cx="0" cy="0" r="15" fill="rgba(255, 255, 255, 0.1)" />
                    <circle cx="40" cy="-20" r="10" fill="rgba(255, 255, 255, 0.1)" />
                    <circle cx="-30" cy="20" r="8" fill="rgba(255, 255, 255, 0.1)" />
                  </g>

                  {/* Graphiques d'analyse */}
                  <g transform="translate(250, 200)">
                    <rect x="-55" y="15" width="110" height="60" fill="rgba(255, 255, 255, 0.1)" opacity="0.3" />
                    <path
                      d="M-50,50 L-30,40 L-10,60 L10,30 L30,45 L50,20"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                    <circle cx="-30" cy="40" r="3" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="-10" cy="60" r="3" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="10" cy="30" r="3" fill="#FFFFFF" opacity="0.6" />
                    <circle cx="30" cy="45" r="3" fill="#FFFFFF" opacity="0.6" />
                  </g>

                  {/* Silhouette professionnelle */}
                  <g transform="translate(400, 240)">
                    {/* Tête */}
                    <circle cx="0" cy="0" r="15" fill="#546E7A" />
                    {/* Corps */}
                    <path d="M0,15 L0,60" stroke="#546E7A" strokeWidth="10" />
                    {/* Bras */}
                    <path d="M0,25 L-20,40" stroke="#546E7A" strokeWidth="6" />
                    <path d="M0,25 L20,40" stroke="#546E7A" strokeWidth="6" />
                    {/* Jambes */}
                    <path d="M0,60 L-10,90" stroke="#546E7A" strokeWidth="8" />
                    <path d="M0,60 L10,90" stroke="#546E7A" strokeWidth="8" />
                  </g>
                </svg>
              </Box>
            </Box>
          </Box>
        )}

        {/* Section droite - Formulaire de connexion */}
        <Box
          sx={{
            flex: "1 1 auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ px: { xs: 0, sm: 4, md: 6 } }}>
            {/* Afficher le logo DigiWork sur mobile uniquement */}
            {isMobile && (
              <Box sx={{ mb: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Box
                  sx={{
                    bgcolor: "#16A249",
                    borderRadius: "50%",
                    p: 1,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <WorkIcon fontSize="large" />
                </Box>
                <Typography variant="h5" fontWeight="bold" color="text.primary" textAlign="center">
                  DigiWork
                </Typography>
              </Box>
            )}

            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
              Connexion
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Entrez vos identifiants pour vous connecter
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                placeholder="nom@exemple.com"
                onChange={(e) => setEmail(e.target.value)}
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
                margin="normal"
                required
                fullWidth
                id="password"
                name="password"
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: "#16A249" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        sx={{ color: "#16A249" }}
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  mb: 3,
                  mt: 1,
                }}
              >
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    color: "#16A249",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    handleOpenAdminDialog()
                  }}
                >
                  Mot de passe oublié?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  mb: 3,
                  py: 1.5,
                  borderRadius: 6,
                  backgroundColor: "#16A249",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 10px rgba(22, 162, 73, 0.3)",
                  "&:hover": {
                    backgroundColor: "#138a3d",
                    boxShadow: "0 6px 15px rgba(22, 162, 73, 0.4)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="success" /> : "Se connecter"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{
            width: "100%",
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Notification de copie réussie */}
      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          severity="success"
          sx={{
            borderRadius: 2,
            bgcolor: "#16A249",
            color: "white",
            "& .MuiAlert-icon": {
              color: "white",
            },
          }}
        >
          {copySuccess}
        </Alert>
      </Snackbar>

      <Dialog
        open={openAdminDialog}
        onClose={handleCloseAdminDialog}
        aria-labelledby="admin-contact-dialog-title"
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <DialogTitle
          id="admin-contact-dialog-title"
          sx={{
            background: "linear-gradient(135deg, #16A249 0%, #0D7A36 100%)",
            color: "white",
            fontWeight: "bold",
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EmailIcon />
          </Box>
          <Typography variant="h5" component="div">
            Contact Administrateurs
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="500" sx={{ mb: 1 }}>
              Besoin d'aide avec votre mot de passe ?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Nos administrateurs sont là pour vous aider. Contactez l'un d'entre eux pour réinitialiser votre mot de
              passe ou résoudre tout problème d'accès.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3, mb: 2 }}>
            {admins.map((admin) => (
              <Paper
                key={admin.id}
                elevation={3}
                sx={{
                  flex: 1,
                  p: 0,
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {/* En-tête avec avatar */}
                <Box
                  sx={{
                    p: 3,
                    background: "linear-gradient(to right, rgba(22, 162, 73, 0.05), rgba(22, 162, 73, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: "#16A249",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        border: "3px solid white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {admin.initials}
                    </Avatar>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {admin.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {admin.role}
                    </Typography>
                  </Box>
                </Box>

                {/* Informations de contact */}
                <Box sx={{ p: 3 }}>
                  {/* Email */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                      "&:hover": {
                        bgcolor: "rgba(22, 162, 73, 0.05)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: "rgba(22, 162, 73, 0.1)",
                          color: "#16A249",
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                          Email
                        </Typography>
                        <Link
                          href={`mailto:${admin.email}`}
                          underline="hover"
                          sx={{
                            color: "text.primary",
                            fontWeight: 500,
                            "&:hover": {
                              color: "#16A249",
                            },
                          }}
                        >
                          {admin.email}
                        </Link>
                      </Box>
                    </Box>
                    <Tooltip title="Copier l'email" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(admin.email, "Email")}
                        sx={{
                          color: "#16A249",
                          "&:hover": {
                            bgcolor: "rgba(22, 162, 73, 0.1)",
                          },
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Téléphone */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "rgba(0, 0, 0, 0.02)",
                      "&:hover": {
                        bgcolor: "rgba(22, 162, 73, 0.05)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: "rgba(22, 162, 73, 0.1)",
                          color: "#16A249",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                          Téléphone
                        </Typography>
                        <Link
                          href={`tel:${admin.phone.replace(/\s/g, "")}`}
                          underline="hover"
                          sx={{
                            color: "text.primary",
                            fontWeight: 500,
                            "&:hover": {
                              color: "#16A249",
                            },
                          }}
                        >
                          {admin.phone}
                        </Link>
                      </Box>
                    </Box>
                    <Tooltip title="Copier le numéro" placement="top">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyToClipboard(admin.phone, "Numéro")}
                        sx={{
                          color: "#16A249",
                          "&:hover": {
                            bgcolor: "rgba(22, 162, 73, 0.1)",
                          },
                        }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Pied de carte */}
                <Box
                  sx={{
                    p: 2,
                    borderTop: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    href={`mailto:${admin.email}`}
                    startIcon={<EmailIcon />}
                    sx={{
                      borderRadius: 6,
                      borderColor: "#16A249",
                      color: "#16A249",
                      "&:hover": {
                        borderColor: "#138a3d",
                        bgcolor: "rgba(22, 162, 73, 0.05)",
                      },
                    }}
                  >
                    Envoyer un email
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            bgcolor: "rgba(0, 0, 0, 0.02)",
            borderTop: "1px solid rgba(0, 0, 0, 0.05)",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleCloseAdminDialog}
            variant="contained"
            startIcon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            }
            sx={{
              backgroundColor: "#16A249",
              borderRadius: 6,
              px: 4,
              py: 1,
              "&:hover": {
                backgroundColor: "#138a3d",
              },
            }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Login