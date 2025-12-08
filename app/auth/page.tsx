"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

const CORRECT_PASSWORD = "mu12356"

export default function AuthPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== "undefined") {
      const isAuthenticated = localStorage.getItem("mu_auth") === "true"
      if (isAuthenticated) {
        router.push("/")
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (password === CORRECT_PASSWORD) {
      // Store authentication in localStorage
      localStorage.setItem("mu_auth", "true")
      router.push("/")
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <img
            loading="lazy"
            src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif"
            alt="MU Logo"
            className={styles.logo}
          />
        </div>
        <h1 className={styles.title}>WebStudio</h1>
        <p className={styles.subtitle}>Enter password to access</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Enter password"
              className={styles.input}
              autoFocus
              disabled={isLoading}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? "Verifying..." : "Access"}
          </button>
        </form>
      </div>
    </div>
  )
}

