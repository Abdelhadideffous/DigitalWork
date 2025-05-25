"use client"

import type React from "react"
import { useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Box, Typography, useTheme } from "@mui/material"

interface ActivityData {
  date: string
  tasksCompleted: number
  tasksCreated: number
}

interface ActivityTimelineChartProps {
  data?: ActivityData[]
}

const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ data }) => {
  const theme = useTheme()
  const chartRef = useRef<HTMLDivElement>(null)

  // Données par défaut si aucune donnée n'est fournie
  const defaultData = [
    { date: "2023-05-17", tasksCompleted: 4, tasksCreated: 6 },
    { date: "2023-05-18", tasksCompleted: 3, tasksCreated: 4 },
    { date: "2023-05-19", tasksCompleted: 5, tasksCreated: 3 },
    { date: "2023-05-20", tasksCompleted: 7, tasksCreated: 5 },
    { date: "2023-05-21", tasksCompleted: 6, tasksCreated: 8 },
    { date: "2023-05-22", tasksCompleted: 8, tasksCreated: 7 },
    { date: "2023-05-23", tasksCompleted: 9, tasksCreated: 6 },
  ]

  const chartData = data || defaultData

  // Formater la date pour l'affichage
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
  }

  // Personnaliser le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label)
      const formattedDate = date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })

      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            p: 2,
            boxShadow: 3,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            {formattedDate}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={`item-${index}`} variant="body2" sx={{ color: entry.color, mb: 0.5 }}>
              {entry.name}: <strong>{entry.value}</strong>
            </Typography>
          ))}
        </Box>
      )
    }
    return null
  }

  return (
    <Box sx={{ width: "100%", height: 300 }} ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
            axisLine={{ stroke: theme.palette.divider }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => <span style={{ color: theme.palette.text.primary }}>{value}</span>} />
          <Line
            type="monotone"
            dataKey="tasksCompleted"
            name="Tâches terminées"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="tasksCreated"
            name="Tâches créées"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  )
}

export default ActivityTimelineChart
