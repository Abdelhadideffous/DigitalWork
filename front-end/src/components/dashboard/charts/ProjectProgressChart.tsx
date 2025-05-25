"use client"

import React, { useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { useTheme } from "@mui/material/styles"
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material"
import { FileText, MoreVertical } from "lucide-react"
import type { RecentProject } from "../../../pages/dashboard/apidashboard"
import { getProgressColor } from "../../../utils/colorUtils"
import { exportChartToPDF, exportToExcel, type ExportOptions } from "../../../utils/exportUtils"
import ExportModal from "../ExportModal"

interface ProjectProgressChartProps {
  projects: RecentProject[]
}

const ProjectProgressChart: React.FC<ProjectProgressChartProps> = ({ projects }) => {
  const theme = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [exportModalOpen, setExportModalOpen] = React.useState(false)
  const [exportLoading, setExportLoading] = React.useState(false)

  // Préparer les données pour le graphique
  const data = projects
    .slice(0, 7) // Limiter à 7 projets pour une meilleure lisibilité
    .map((project) => ({
      name: project.title.length > 15 ? project.title.substring(0, 15) + "..." : project.title,
      progress: project.progress || 0,
      color: getProgressColor(project.progress || 0),
    }))
    .sort((a, b) => b.progress - a.progress) // Trier par progression décroissante

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 1.5,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Progression: <strong>{payload[0].value}%</strong>
          </Typography>
        </Box>
      )
    }
    return null
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleExportModalOpen = () => {
    handleMenuClose()
    setExportModalOpen(true)
  }

  const handleExportModalClose = () => {
    setExportModalOpen(false)
  }

  const handleExport = async (format: "pdf" | "excel", options: ExportOptions) => {
    setExportLoading(true)
    try {
      if (format === "pdf") {
        await exportChartToPDF(chartRef, options)
      } else {
        // Préparer les données pour Excel
        const headers = ["Projet", "Progression (%)"]
        const rows = data.map((item) => [item.name, item.progress])
        exportToExcel({ headers, rows }, options)
      }
    } finally {
      setExportLoading(false)
      handleExportModalClose()
    }
  }

  return (
    <Box ref={chartRef} sx={{ width: "100%" }}>
      <Box sx={{ position: "relative", mb: 2 }}>
        <IconButton size="small" onClick={handleMenuOpen} sx={{ position: "absolute", top: -50, right: 0 }}>
          <MoreVertical size={20} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleExportModalOpen}>
            <ListItemIcon>
              <FileText size={18} />
            </ListItemIcon>
            <ListItemText>Exporter</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="name"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
            stroke={theme.palette.divider}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            stroke={theme.palette.divider}
            domain={[0, 100]}
            label={{
              value: "Progression (%)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: theme.palette.text.secondary, fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }} />
          <Bar dataKey="progress" name="Progression (%)">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <ExportModal
        open={exportModalOpen}
        onClose={handleExportModalClose}
        onExport={handleExport}
        title="Progression des projets"
        loading={exportLoading}
      />
    </Box>
  )
}

export default ProjectProgressChart
