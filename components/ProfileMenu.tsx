"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./ProfileMenu.module.css"

interface ProfileMenuProps {
  onNewChat?: () => void
}

export default function ProfileMenu({ onNewChat }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState<string>("User")
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const name = localStorage.getItem("mu_fullName")
    if (name) setFullName(name)
  }, [])

  const handleNewChat = () => {
    setOpen(false)
    if (onNewChat) {
      onNewChat()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("mu_auth")
    localStorage.removeItem("mu_email")
    localStorage.removeItem("mu_fullName")

    localStorage.removeItem("ws_selectedVersionId")
    localStorage.removeItem("ws_generatedHtml")
    localStorage.removeItem("ws_currentPrompt")
    localStorage.removeItem("ws_versionCounter")
    localStorage.removeItem("ws_hasGenerated")

    window.location.href = "/auth"
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={styles.menuWrapper} ref={menuRef}>
      <button
        className={styles.profileButton}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.avatar}>
          {fullName.charAt(0).toUpperCase()}
        </span>
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.userSection}>
            <div className={styles.avatarLarge}>
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className={styles.fullName}>{fullName}</p>
            </div>
          </div>

          <div className={styles.divider} />

          <button onClick={handleNewChat} className={styles.menuItem}>
            💬 New Chat
          </button>

          <button onClick={handleLogout} className={styles.menuItem}>
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  )
}
