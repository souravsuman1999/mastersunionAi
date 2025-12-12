"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Theme = "mastersunion" | "tetr"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("mastersunion")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("app_theme") as Theme | null
      if (savedTheme && (savedTheme === "mastersunion" || savedTheme === "tetr")) {
        setThemeState(savedTheme)
        document.documentElement.setAttribute("data-theme", savedTheme)
      } else {
        document.documentElement.setAttribute("data-theme", "mastersunion")
      }
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("app_theme", newTheme)
      // Apply theme class to html element
      document.documentElement.setAttribute("data-theme", newTheme)
    }
  }

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme)
    }
  }, [theme, mounted])

  // Always provide the context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

