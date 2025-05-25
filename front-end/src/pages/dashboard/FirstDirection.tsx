import React, { useEffect } from "react"
import { getCurrentUser } from "../login/api"

const FirstDirection: React.FC = () => {
  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      window.location.href = "/login"
      return
    }
    switch (user.role) {
      case "admin":
        window.location.href = "/dashboard/admin"
        break
      case "manager":
        window.location.href = "/dashboard/manager"
        break
      case "employee":
        window.location.href = "/dashboard/employee"
        break
      default:
        window.location.href = "/login"
        break
    }
  }, [])

  return null
}

export default FirstDirection 