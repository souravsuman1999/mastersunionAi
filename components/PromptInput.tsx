"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import styles from "./PromptInput.module.css"

interface PromptInputProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
  value: string
  onPromptChange: (value: string) => void
  error?: string
  isReadOnly?: boolean
  variant?: "hero" | "sidebar"
}

export default function PromptInput({
  onGenerate,
  isLoading,
  value,
  onPromptChange,
  error,
  isReadOnly,
  variant = "hero",
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onGenerate(value)
    }
  }

  const isHero = variant === "hero"
  const isSidebar = variant === "sidebar"

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={`${styles.inputWrapper} ${isHero ? styles.inputWrapperHero : ''}`}>
          <textarea
            ref={textareaRef}
            className={`${styles.textarea} ${isSidebar ? styles.textareaSidebar : ''} ${isHero ? styles.textareaHero : ''}`}
            value={value}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe the page you want to generate... (e.g., 'Create a landing page for a tech startup with hero section, features, and contact form')"
            rows={6}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            disabled={isLoading || isReadOnly}
          />
          {isSidebar && (
            <div className={styles.arrowContainer}>
              <button
                type="submit"
                className={styles.arrowButton}
                disabled={isLoading || !value.trim() || !!isReadOnly}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
        {isHero && (
          <div className={styles.buttonContainerHero}>
            <div className={`${styles.buttonWrapper} ${(isLoading || !value.trim() || !!isReadOnly) ? styles.buttonWrapperDisabled : ''}`}>
              <button
                type="submit"
                className={styles.generateButton}
                disabled={isLoading || !value.trim() || !!isReadOnly}
              >
                {isLoading ? (
                  <div className={styles.spinner} />
                ) : (
                  <>
                    <span>Generate Page</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.16667 10H15.8333M15.8333 10L10.8333 5M15.8333 10L10.8333 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
