"use client"

import type React from "react"
import { useState } from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import Link from "@mui/material/Link"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Stack from "@mui/material/Stack"
import { Paper } from "@mui/material"
import { PieChart, Pie, Cell, Tooltip } from "recharts"

import AppLayout from "../layout/AppLayout"
const PageRapport: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
 

  const data = [
    { name: "En cours", value: 12, color: "#2ECC71" },
    { name: "En attente", value: 5, color: "#95A5A6" },
    { name: "Terminé", value: 8, color: "#3498DB" },
  ]


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
            Rapports
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 3, md: 4 },
              mb: 4,
            }}
          >
            <Card sx={{ height: 430, width: { xs: "100%", md: "48%" } }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                  Vue d'ensemble des projets
                </Typography>

                <Tabs
                  value={activeTab}
                  onChange={(_event, newValue) => setActiveTab(newValue)}
                  TabIndicatorProps={{ style: { display: "none" } }}
                  sx={{ bgcolor: "#f5f5f5", borderRadius: "4px", mb: 2, minHeight: 36 }}
                >
                  <Tab
                    label="Graphique"
                    sx={{
                      bgcolor: activeTab === 0 ? "white" : "transparent",
                      color: activeTab === 0 ? "black" : "gray",
                      borderRadius: "3px",
                      width: "50%",
                      fontWeight: activeTab === 0 ? "bold" : "normal",
                      fontSize: "0.85rem",
                    }}
                  />
                  <Tab
                    label="Statistiques"
                    sx={{
                      bgcolor: activeTab === 1 ? "white" : "transparent",
                      color: activeTab === 1 ? "black" : "gray",
                      borderRadius: "3px",
                      width: "50%",
                      fontWeight: activeTab === 1 ? "bold" : "normal",
                      fontSize: "0.85rem",
                    }}
                  />
                </Tabs>

                {activeTab === 0 ? (
                  <Box display="flex" flexDirection="column" alignItems="center" position="relative">
                    <PieChart width={300} height={300}>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
                    >
                      25 projets
                    </Typography>
                    <Stack direction="row" spacing={2} mt={-2}>
                      {data.map((entry) => (
                        <Stack key={entry.name} direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: entry.color }} />
                          <Typography variant="body2">
                            {entry.name} ({entry.value})
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>
                ) : (
                  <Box display="flex" justifyContent="center" flexWrap="wrap" gap={2}>
                    {["Projets en cours", "Projets en attente", "Projets terminés", "Total des projets"].map(
                      (label, index) => (
                        <Paper key={index} sx={{ p: 2, width: 180, height: 99, textAlign: "left" }} elevation={3}>
                          <Typography variant="h6" sx={{ color: "#71717A", fontSize: "14px" }}>
                            {label}
                          </Typography>
                        </Paper>
                      ),
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ height: 430, width: { xs: "100%", md: "48%" } }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", m: 2 }}>
                  Performance de l'équipe
                </Typography>
                <Typography variant="body1" sx={{ m: 2 }}>
                  Informations sur la performance de l'équipe.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>
       </AppLayout>
  )
}
export default  PageRapport;
