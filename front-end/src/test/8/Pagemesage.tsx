"use client"
import type React from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Link from "@mui/material/Link"


import AppLayout from "../layout/AppLayout"

const Pagemesage: React.FC = () => {

  return (
    <AppLayout>
       <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link underline="hover" color="inherit" href="/">
                Tableau de bord
              </Link>
              <Typography sx={{ color: "text.primary" }}>Rapports</Typography>
            </Breadcrumbs>
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", mb: 3 }}>
          Messages
          </Typography>

        </Container>
       </AppLayout>
  )
}
export default  Pagemesage;
