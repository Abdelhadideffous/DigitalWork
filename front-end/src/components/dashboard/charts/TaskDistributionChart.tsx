"use client"

import React, { useRef } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useTheme } from "@mui/material/styles"
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material"
import { FileText, MoreVertical } from "lucide-react"
import { exportChartToPDF, exportToExcel, type ExportOptions } from "../../../utils/exportUtils"
import ExportModal from "../ExportModal"

interface TaskDistributionChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ data }) => {
  const theme = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [exportModalOpen, setExportModalOpen] = React.useState(false)
  const [exportLoading, setExportLoading] = React.useState(false)

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload }: any) => {
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
          <Typography variant="subtitle2" sx={{ mb: 0.5, color: payload[0].payload.color }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nombre: <strong>{payload[0].value}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pourcentage:{" "}
            <strong>{((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%</strong>
          </Typography>
        </Box>
      )
    }
    return null
  }

  // Personnaliser le rendu des labels
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
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
        const headers = ["Statut", "Nombre", "Pourcentage"]
        const total = data.reduce((sum, item) => sum + item.value, 0)
        const rows = data.map((item) => [item.name, item.value, `${((item.value / total) * 100).toFixed(1)}%`])
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: 12, color: theme.palette.text.secondary }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ExportModal
        open={exportModalOpen}
        onClose={handleExportModalClose}
        onExport={handleExport}
        title="Répartition des projets"
        loading={exportLoading}
      />
    </Box>
  )
}

export default TaskDistributionChart
