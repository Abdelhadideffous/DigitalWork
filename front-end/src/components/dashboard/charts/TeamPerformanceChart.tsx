"use client"

import type React from "react"
import { useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Box, Typography, useTheme } from "@mui/material"

interface TeamPerformanceData {
  id: number
  team: string
  tasksCompleted: number
  tasksTotal: number
  progress: number
  onTime: string
  lead: string
}

interface TeamPerformanceChartProps {
  data: TeamPerformanceData[]
}

const TeamPerformanceChart: React.FC<TeamPerformanceChartProps> = ({ data }) => {
  const theme = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)

  // Couleurs pour les barres
  const colors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ]

  // Formater les données pour le graphique
  const chartData = data.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }))

  // Corriger l'avertissement 'label' is declared but its value is never read
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            boxShadow: 3,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            {data.team}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Chef d'équipe: <strong>{data.lead}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Progression: <strong>{data.progress}%</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Tâches:{" "}
            <strong>
              {data.tasksCompleted}/{data.tasksTotal}
            </strong>
          </Typography>
          <Typography variant="body2">
            Dans les délais: <strong>{data.onTime}</strong>
          </Typography>
        </Box>
      )
    }
    return null
  }

  return (
    <Box sx={{ width: "100%", height: 300 }} ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="team"
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
            domain={[0, 100]}
            label={{
              value: "Progression (%)",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: theme.palette.text.secondary, fontSize: 12 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>} />
          <Bar dataKey="progress" name="Progression" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default TeamPerformanceChart
