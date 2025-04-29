"use client"

import type React from "react"
import { useState } from "react"
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  IconButton, 
} from "@mui/material"
import { Visibility, VisibilityOff, Work as WorkIcon } from "@mui/icons-material"


const Register: React.FC = () => {
  const [Nom, setNom] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmer_password, setConfirmer_password] = useState("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
      <Container maxWidth="md" 
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        borderTop: "0px ",
        pt: { xs: 1, sm: 2 },
        py: { xs: 2, sm: 4 } 

        }}>
          <Box
            sx={{
              mb: { xs: 2, sm: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                bgcolor: "#16A249",
                color: "white",
                p: { xs: 1, sm: 1.5 },
                borderRadius: "50%",
                mb: { xs: 1, sm: 2 },
              }}
            >
              <WorkIcon fontSize="large" />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              DigiWork
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: "center", px: 2 }}>
            Remplissez le formulaire pour créer votre compte DigiWork
            </Typography>
          </Box>

          <Box
            component="form"
            sx={{
              width: "100%",
              maxWidth: "500px",
              px: { xs: 2, sm: 0 },
            }}
          >
            <TextField
             margin="normal"
             required
             fullWidth
             id="nom"
             label="Nom Complet"
             name="nom"
             autoFocus
             value={Nom}
             placeholder="Androw Tate"
             onChange={(e) => setNom(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16A249",
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
             id="email"
             label="Email"
             name="email"
             autoComplete="email"
             autoFocus
             value={email}
             placeholder="nom@exemple.com"
             onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16A249",
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
              InputProps={{
                endAdornment: (
                  <IconButton aria-label="toggle password visibility" onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16A249",
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
              id="confirmer_password"
              name="confirmer_password"
              label="Confirmer le mot de passe"
              type={showPassword ? "text" : "password"}
              value={confirmer_password}
              onChange={(e) => setConfirmer_password(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton aria-label="toggle password visibility" onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#16A249",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#16A500",
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              //
              size= "large"
              sx={{
                mt: 3,
                mb: 2,
                py: { xs: 1, sm: 1.5 },
                borderRadius: 1.5,
                backgroundColor:"#16A249",
              }}
            >
              Créer un compte
            </Button>

            <Box sx={{ textAlign: "center", mt: { xs: 2, sm: 3 } }}>
              <Typography variant="body2">
              Vous avez déjà un compte?{" "}
                <Button
                  variant="text"
                  size="small"
                  sx={{ color: "#16A249", fontWeight: "bold", p: 0, minWidth: "auto" }}
                >
                  Se connecter
                </Button>
              </Typography>
            </Box>
          </Box>
      </Container>
  )
}

export default Register;

