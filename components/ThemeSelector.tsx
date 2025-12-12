"use client"

import { useTheme } from "@/contexts/ThemeContext"
import styles from "./ThemeSelector.module.css"
import tetrStyles from "./ThemeSelector.tetr.module.css"

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const currentStyles = theme === "tetr" ? tetrStyles : styles

  return (
    <div className={currentStyles.themeSelector}>
      <label className={currentStyles.label}>Theme:</label>
      <div className={currentStyles.options}>
        <button
          type="button"
          className={`${currentStyles.option} ${theme === "mastersunion" ? currentStyles.active : ""}`}
          onClick={() => setTheme("mastersunion")}
        >
          Masters Union
        </button>
        <button
          type="button"
          className={`${currentStyles.option} ${theme === "tetr" ? currentStyles.active : ""}`}
          onClick={() => setTheme("tetr")}
        >
          Tetr
        </button>
      </div>
    </div>
  )
}

