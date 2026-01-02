"use client"

import { useEffect } from "react"

export default function ThemeScript() {
  useEffect(() => {
    // Apply theme immediately on mount to prevent flash
    const savedTheme = localStorage.getItem("app_theme")
    const theme = savedTheme === "tetr" ? "tetr" : "masters-union"
    document.documentElement.setAttribute("data-theme", theme)
    document.body.setAttribute("data-theme", theme)
  }, [])

  return null
}

