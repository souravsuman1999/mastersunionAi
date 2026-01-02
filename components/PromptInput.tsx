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
  selectedTheme?: "mastersunion" | "tetr"
  onThemeChange?: (theme: "mastersunion" | "tetr") => void
}

export default function PromptInput({
  onGenerate,
  isLoading,
  value,
  onPromptChange,
  error,
  isReadOnly,
  variant = "hero",
  selectedTheme = "mastersunion",
  onThemeChange,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`)
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is larger than 10MB`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      alert(errors.join("\n"))
    }

    if (validFiles.length === 0) return

    const readers = validFiles.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readers).then((results) => {
      setImages((prev) => [...prev, ...results])
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    processFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isHero && !isLoading && !isReadOnly) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (!isHero || isLoading || isReadOnly) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    if (fileInputRef.current && images.length === 1) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveAllImages = () => {
    setImages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() || images.length > 0) {
      // Pass the first image for now (API expects single image)
      onGenerate(value, images.length > 0 ? images[0] : undefined)
    }
  }

  const isHero = variant === "hero"
  const isSidebar = variant === "sidebar"

  return (
    <div className={styles.container}>
      {/* Theme Selector - Only show in hero variant, not in sidebar */}
      {onThemeChange && isHero && (
        <div className={styles.themeSelector}>
          <label className={styles.themeLabel}>Theme:</label>
          <div className={styles.themeButtons}>
            <button
              type="button"
              onClick={() => onThemeChange("mastersunion")}
              className={`${styles.themeButton} ${selectedTheme === "mastersunion" ? styles.themeButtonActive : ''}`}
              disabled={isLoading || isReadOnly}
            >
              Masters Union
            </button>
            <button
              type="button"
              onClick={() => onThemeChange("tetr")}
              className={`${styles.themeButton} ${selectedTheme === "tetr" ? styles.themeButtonActive : ''}`}
              disabled={isLoading || isReadOnly}
            >
              Tetr
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div
          ref={inputWrapperRef}
          className={`${styles.inputWrapper} ${isHero ? styles.inputWrapperHero : ''} ${isHero && isDragging ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {images.length > 0 && (
            <div className={styles.imagePreviewContainer}>
              <div className={styles.imagePreview}>
                <img src={images[0]} alt="Preview" />
                {images.length > 2 && (
                  <div className={styles.imageCountBadge}>
                    +{images.length - 1}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveAllImages}
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
          {isHero && isDragging && (
            <div className={styles.dragOverlay}>
              <div className={styles.dragOverlayContent}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p>Drop images here</p>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className={`${styles.textarea} ${isSidebar ? styles.textareaSidebar : ''} ${isHero ? styles.textareaHero : ''} ${images.length > 0 ? styles.textareaWithImage : ''}`}
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
            multiple={isHero}
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
                disabled={isLoading || (!value.trim() && images.length === 0) || !!isReadOnly}
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
            <div className={`${styles.buttonWrapper} ${(isLoading || (!value.trim() && images.length === 0) || !!isReadOnly) ? styles.buttonWrapperDisabled : ''}`}>
              <button
                type="submit"
                className={styles.generateButton}
                disabled={isLoading || (!value.trim() && images.length === 0) || !!isReadOnly}
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
