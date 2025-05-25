import type React from "react"
import { Box, Typography, Avatar } from "@mui/material"
import { styled } from "@mui/material/styles"
import {
  CheckCircle as CheckIcon,
  Add as AddIcon,
  Comment as CommentIcon,
  AccessTime as ClockIcon,
  Description as DocIcon,
} from "@mui/icons-material"

const ActivityWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  "&:last-child": {
    borderBottom: "none",
  },
}))

const ActivityIconWrapper = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  backgroundColor: bgcolor || theme.palette.primary.light,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing(1.5),
  flexShrink: 0,
}))

interface ActivityItemProps {
  type: "completed" | "created" | "commented" | "started" | "document"
  user: {
    name: string
    avatar?: string
  }
  content: string
  project?: string
  time: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ type, user, content, project, time }) => {
  const getActivityIcon = () => {
    switch (type) {
      case "completed":
        return { icon: <CheckIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#4caf50" }
      case "created":
        return { icon: <AddIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#2196f3" }
      case "commented":
        return { icon: <CommentIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#9c27b0" }
      case "started":
        return { icon: <ClockIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#ff9800" }
      case "document":
        return { icon: <DocIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#607d8b" }
      default:
        return { icon: <CheckIcon fontSize="small" sx={{ color: "#fff" }} />, color: "#4caf50" }
    }
  }

  const { icon, color } = getActivityIcon()

  return (
    <ActivityWrapper>
      <Avatar sx={{ width: 36, height: 36, mr: 1.5, fontSize: "0.9rem", bgcolor: "primary.main", flexShrink: 0 }}>
        {user.name.charAt(0)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5, mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {getActionText(type)} {content}
          </Typography>
        </Box>
        {project && (
          <Typography variant="caption" color="text.secondary" display="block">
            {project}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {time}
        </Typography>
      </Box>
      <ActivityIconWrapper bgcolor={color}>{icon}</ActivityIconWrapper>
    </ActivityWrapper>
  )
}

const getActionText = (type: string): string => {
  switch (type) {
    case "completed":
      return "a terminé la tâche"
    case "created":
      return "a créé une nouvelle tâche"
    case "commented":
      return "a commenté sur"
    case "started":
      return "a commencé la tâche"
    case "document":
      return "a ajouté un document à"
    default:
      return "a"
  }
}

export default ActivityItem
