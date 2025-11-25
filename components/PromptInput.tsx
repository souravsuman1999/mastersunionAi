"use client"

import type React from "react"
import { useState } from "react"
import styles from "./PromptInput.module.css"

interface PromptInputProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
  error?: string
}

export default function PromptInput({ onGenerate, isLoading, error }: PromptInputProps) {
  const [prompt, setPrompt] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt)
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputBox}>
          <textarea
            className={styles.textarea}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Masters' Union AI to create a webpage..."
            rows={1}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <div className={styles.inputActions}>
            {/* <button type="button" className={styles.iconButton} title="Add attachment" disabled={isLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              Attach
            </button> */}

            <button type="submit" className={styles.submitButton} disabled={isLoading || !prompt.trim()}>
              {isLoading ? (
                <div className={styles.spinner} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && (
          <div className={styles.error}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>{error}</strong>
              {error.includes("ANTHROPIC_API_KEY") && (
                <p className={styles.errorHint}>
                  Add your API key in the <strong>Vars</strong> section of the sidebar
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
