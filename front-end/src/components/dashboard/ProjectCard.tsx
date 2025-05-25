"use client"

import type React from "react"
import { Box, Typography, Paper, Chip, LinearProgress, IconButton } from "@mui/material"
import { styled } from "@mui/material/styles"
import { MoreVert as MoreIcon } from "@mui/icons-material"
import { getStatusColor, getProgressColor } from "../../utils/colorUtils"
import type { RecentProject } from "../../pages/dashboard/apidashboard"

// Modifier le StyledCard pour qu'il s'adapte au contenu
const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s, box-shadow 0.2s",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows[3],
  },
}))

interface ProjectCardProps {
  project: RecentProject
  onActionClick?: (event: React.MouseEvent<HTMLElement>, project: RecentProject) => void
}

// Modifier le composant ProjectCard pour gérer correctement les propriétés undefined
const ProjectCard: React.FC<ProjectCardProps> = ({ project, onActionClick }) => {
  const statusColor = getStatusColor(project.status?.name || "")
  const progressValue = project.progress !== undefined ? project.progress : 0
  const progressColor = getProgressColor(progressValue)

  return (
    <StyledCard elevation={1}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {project.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={project.status?.name || "Non défini"}
            size="small"
            sx={{
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              fontWeight: 600,
              borderRadius: "6px",
              height: 24,
            }}
          />
          <IconButton size="small" onClick={(e) => onActionClick && onActionClick(e, project)} sx={{ ml: 0.5 }}>
            <MoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Progression
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {progressValue}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressValue}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              bgcolor: progressColor,
              borderRadius: 3,
            },
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Responsable: {project.manager?.name || "Non assigné"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Échéance: {new Date(project.end_date).toLocaleDateString()}
        </Typography>
      </Box>
    </StyledCard>
  )
}

export default ProjectCard
