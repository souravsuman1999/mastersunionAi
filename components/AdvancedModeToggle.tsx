"use client"

import styles from "./AdvancedModeToggle.module.css"

interface AdvancedModeToggleProps {
  isAdvancedMode: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
  selectedTheme?: "mastersunion" | "tetr"
}

export default function AdvancedModeToggle({
  isAdvancedMode,
  onToggle,
  disabled = false,
  selectedTheme = "mastersunion"
}: AdvancedModeToggleProps) {
  return (
    <div className={styles.container}>
      <label className={styles.toggleLabel}>
        <div className={styles.labelText}>
          <span className={styles.labelTitle}>Advanced Mode</span>
          <span className={styles.labelSubtitle}>
            {isAdvancedMode ? "Output sections panel active" : "History panel active"}
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAdvancedMode}
          onClick={() => onToggle(!isAdvancedMode)}
          disabled={disabled}
          className={`${styles.toggle} ${isAdvancedMode ? styles.toggleActive : ""}`}
        >
          <span className={styles.toggleSlider} />
        </button>
      </label>
    </div>
  )
}
