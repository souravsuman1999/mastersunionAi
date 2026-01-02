"use client"

import { useState, useEffect } from "react"
import styles from "./ThemeSelector.module.css"

type Theme = "masters-union" | "tetr"

export default function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>("masters-union")
  const [mounted, setMounted] = useState(false)

  const applyTheme = (newTheme: Theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme)
      document.body.setAttribute("data-theme", newTheme)
    }
  }

  useEffect(() => {
    // Load theme from localStorage and apply immediately to avoid flash
    const savedTheme = localStorage.getItem("app_theme") as Theme | null
    const initialTheme: Theme = (savedTheme === "masters-union" || savedTheme === "tetr") ? savedTheme : "masters-union"
    
    // Apply theme immediately
    applyTheme(initialTheme)
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("app_theme", newTheme)
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className={styles.themeSelector}>
      <button
        type="button"
        className={`${styles.themeButton} ${theme === "masters-union" ? styles.active : ""}`}
        onClick={() => handleThemeChange("masters-union")}
      >
        Masters Union
      </button>
      <button
        type="button"
        className={`${styles.themeButton} ${theme === "tetr" ? styles.active : ""}`}
        onClick={() => handleThemeChange("tetr")}
      >
        TETR
      </button>
    </div>
  )
}

