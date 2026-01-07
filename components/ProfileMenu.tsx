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
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Update dropdown position when open
  useEffect(() => {
    if (open && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      dropdownRef.current.style.top = `${buttonRect.bottom + 8}px`
      dropdownRef.current.style.right = `${window.innerWidth - buttonRect.right}px`
    }
  }, [open])

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        menuRef.current && 
        !menuRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <>
      <div className={styles.menuWrapper} ref={menuRef}>
        <button
          ref={buttonRef}
          className={styles.profileButton}
          onClick={() => setOpen(!open)}
        >
          <span className={styles.avatar}>
            {fullName.charAt(0).toUpperCase()}
          </span>
        </button>
      </div>

      {open && (
        <div ref={dropdownRef} className={styles.dropdown}>
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
    </>
  )
}
