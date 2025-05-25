import type React from "react"
import { Box, Typography, Paper, Chip } from "@mui/material"
import { styled } from "@mui/material/styles"
import { KeyboardArrowUp as ArrowUpIcon, KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material"

// Modifier le StyledCard pour qu'il s'adapte mieux au contenu
const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2.5),
  display: "flex",
  alignItems: "center",
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}))

const IconWrapper = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  width: 48,
  height: 48,
  borderRadius: "12px",
  backgroundColor: bgcolor || theme.palette.primary.light,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(2),
}))

interface StatCardProps {
  icon: React.ReactNode
  label: string
  count: number
  trend?: string
  trendUp?: boolean
  bgColor?: string
  textColor?: string
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  count,
  trend,
  trendUp,
  bgColor = "#e3f2fd",
  textColor = "#1976d2",
}) => {
  return (
    <StyledCard elevation={1}>
      <IconWrapper bgcolor={bgColor}>
        <Box sx={{ color: textColor }}>{icon}</Box>
      </IconWrapper>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {count}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {trend && (
            <Chip
              size="small"
              icon={trendUp ? <ArrowUpIcon fontSize="small" /> : <ArrowDownIcon fontSize="small" />}
              label={trend}
              sx={{
                backgroundColor: trendUp ? "#e8f5e9" : "#ffebee",
                color: trendUp ? "#4caf50" : "#f44336",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          )}
        </Box>
      </Box>
    </StyledCard>
  )
}

export default StatCard
