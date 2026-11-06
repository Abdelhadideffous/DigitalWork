export const getStatusColor = (statut: string) => {
    switch (statut?.toLowerCase()) {
      case "en attente":
        return { bg: "#fff8e1", text: "#ff9800" }
      case "en cours":
        return { bg: "#e3f2fd", text: "#1976d2" }
      case "terminé":
        return { bg: "#e8f5e9", text: "#4caf50" }
      case "annulé":
        return { bg: "#ffebee", text: "#f44336" }
      default:
        return { bg: "#f5f5f5", text: "#757575" }
    }
  }
  
  export const getPriorityColor = (priorite: string) => {
    switch (priorite?.toLowerCase()) {
      case "basse":
        return { bg: "#e8f5e9", text: "#4caf50" }
      case "moyenne":
        return { bg: "#fff8e1", text: "#ff9800" }
      case "haute":
        return { bg: "#ffebee", text: "#f44336" }
      case "critique":
        return { bg: "#fbe9e7", text: "#d84315" }
      default:
        return { bg: "#f5f5f5", text: "#757575" }
    }
  }
  
  export const getProgressColor = (progress: number) => {
    if (progress >= 100) return "#4caf50"
    if (progress >= 70) return "#2e7d32"
    if (progress >= 40) return "#1976d2"
    if (progress >= 20) return "#ff9800"
    return "#f44336"
  }
  