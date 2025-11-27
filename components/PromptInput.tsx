"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import styles from "./PromptInput.module.css"

interface PromptInputProps {
  onGenerate: (prompt: string, imageData?: string) => void
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImagePreview(result)
      setImageData(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() || imageData) {
      onGenerate(value, imageData || undefined)
    }
  }

  const isHero = variant === "hero"
  const isSidebar = variant === "sidebar"

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={`${styles.inputWrapper} ${isHero ? styles.inputWrapperHero : ''}`}>
          {imagePreview && (
            <div className={styles.imagePreviewContainer}>
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeImageButton}
                  disabled={isLoading || isReadOnly}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className={`${styles.textarea} ${isSidebar ? styles.textareaSidebar : ''} ${isHero ? styles.textareaHero : ''} ${imagePreview ? styles.textareaWithImage : ''}`}
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.fileInput}
            id="image-upload"
            disabled={isLoading || isReadOnly}
          />
          <label htmlFor="image-upload" className={styles.imageUploadButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3333 6.66667L10 3.33333M10 3.33333L6.66667 6.66667M10 3.33333V13.3333M3.33333 13.3333V15C3.33333 15.442 3.50952 15.866 3.82198 16.1785C4.13445 16.491 4.55841 16.6667 5 16.6667H15C15.4416 16.6667 15.8655 16.491 16.178 16.1785C16.4905 15.866 16.6667 15.442 16.6667 15V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
          {isSidebar && (
            <div className={styles.arrowContainer}>
              <button
                type="submit"
                className={styles.arrowButton}
                disabled={isLoading || (!value.trim() && !imageData) || !!isReadOnly}
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
            <div className={`${styles.buttonWrapper} ${(isLoading || (!value.trim() && !imageData) || !!isReadOnly) ? styles.buttonWrapperDisabled : ''}`}>
              <button
                type="submit"
                className={styles.generateButton}
                disabled={isLoading || (!value.trim() && !imageData) || !!isReadOnly}
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
