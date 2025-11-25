"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import dynamic from "next/dynamic"
import styles from "./Preview.module.css"

const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact), {
  ssr: false,
})

const EDIT_STYLE_ID = "mu-preview-edit-style"
const EDITABLE_ATTRIBUTE = "data-mu-editable"
const EDITABLE_TAGS = [
  "p",
  "div",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "a",
  "button",
  "strong",
  "em",
  "label",
  "small",
  "blockquote",
  "section",
  "article",
  "td",
  "th",
  "figcaption",
]
const EDITABLE_SELECTOR = EDITABLE_TAGS.join(", ")

interface PreviewProps {
  html: string
  isLoading?: boolean
  activeVersionLabel?: string
  onHtmlChange?: (updatedHtml: string) => void
  onEditModeChange?: (isEditMode: boolean) => void
}

const getIframeDocument = (iframe: HTMLIFrameElement | null) => {
  if (!iframe) return null
  return iframe.contentDocument || iframe.contentWindow?.document || null
}

const injectBaseStyles = (doc: Document) => {
  if (doc.getElementById(EDIT_STYLE_ID)) {
    return
  }

  const style = doc.createElement("style")
  style.id = EDIT_STYLE_ID
  style.textContent = `
      * {
        cursor: default !important;
      }
      a, button, input, textarea, select, [role="button"], [onclick] {
        cursor: pointer !important;
      }
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="search"],
      textarea {
        cursor: text !important;
      }
      body[data-mu-edit-mode="true"] {
        caret-color: #050505;
      }
      body[data-mu-edit-mode="true"] ::selection {
        background: rgba(250, 209, 51, 0.35);
      }
      body[data-mu-edit-mode="true"] [${EDITABLE_ATTRIBUTE}] {
        position: relative;
        transition: outline 0.15s ease, box-shadow 0.15s ease;
      }
      body[data-mu-edit-mode="true"] [${EDITABLE_ATTRIBUTE}]:hover {
        outline: 1px dashed rgba(250, 209, 51, 0.85);
        box-shadow: 0 0 0 2px rgba(250, 209, 51, 0.2);
      }
      body[data-mu-edit-mode="true"] [${EDITABLE_ATTRIBUTE}]:hover::after {
        content: "Edit text";
        position: absolute;
        top: -22px;
        right: -4px;
        font-size: 10px;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(250, 209, 51, 0.96);
        color: #050505;
        font-family: "Inter", "Segoe UI", sans-serif;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        pointer-events: none;
      }
      body[data-mu-edit-mode="true"] [${EDITABLE_ATTRIBUTE}]:focus {
        outline: 1px solid rgba(250, 209, 51, 1);
        box-shadow: 0 0 0 3px rgba(250, 209, 51, 0.25);
      }
    `
  doc.head.appendChild(style)
}

const hasDirectText = (element: HTMLElement) => {
  return Array.from(element.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())
  )
}

const markEditableElements = (doc: Document) => {
  const markedElements: HTMLElement[] = []
  const root = doc.body

  if (!root) {
    return () => undefined
  }

  const elements = root.querySelectorAll<HTMLElement>(EDITABLE_SELECTOR)

  elements.forEach((element) => {
    const tag = element.tagName.toLowerCase()
    if (["svg", "img", "video", "canvas"].includes(tag)) {
      return
    }
    if (!hasDirectText(element)) {
      return
    }

    element.setAttribute(EDITABLE_ATTRIBUTE, "true")
    markedElements.push(element)
  })

  return () => {
    markedElements.forEach((element) => {
      if (element.isConnected) {
        element.removeAttribute(EDITABLE_ATTRIBUTE)
      }
    })
  }
}

const wrapSelectionWithBoldSpan = (doc: Document) => {
  const selection = doc.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed || !doc.body) {
    return false
  }

  const range = selection.getRangeAt(0)
  if (!doc.body.contains(range.commonAncestorContainer)) {
    return false
  }

  const fragment = range.cloneContents()
  const hasText = fragment.textContent?.trim()
  if (!hasText) {
    return false
  }

  range.deleteContents()
  const span = doc.createElement("span")
  span.style.fontWeight = "700"
  span.appendChild(fragment)
  range.insertNode(span)

  selection.removeAllRanges()
  const afterRange = doc.createRange()
  afterRange.setStartAfter(span)
  afterRange.collapse(true)
  selection.addRange(afterRange)

  return true
}

const applyBoldFormatting = (doc: Document) => {
  try {
    if (typeof doc.execCommand === "function") {
      doc.execCommand("styleWithCSS", false, "true")
      const result = doc.execCommand("bold", false, undefined)
      doc.execCommand("styleWithCSS", false, "false")
      if (result) {
        return
      }
    }
  } catch (error) {
    console.warn("Bold command via execCommand failed, falling back to manual span.", error)
  }

  wrapSelectionWithBoldSpan(doc)
}

export default function Preview({ html, isLoading, activeVersionLabel, onHtmlChange, onEditModeChange }: PreviewProps) {
  const [displayHtml, setDisplayHtml] = useState(html)
  const [isEditMode, setIsEditMode] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const skipNextHtmlSync = useRef(false)
  const persistEditedHtmlRef = useRef<() => string | null>(() => null)

const readIframeHtml = useCallback(() => {
    const doc = getIframeDocument(iframeRef.current)
    if (!doc || !doc.documentElement) {
      return null
    }

    const htmlClone = doc.documentElement.cloneNode(true) as HTMLElement
    const headClone = htmlClone.querySelector("head")
    const bodyClone = htmlClone.querySelector("body")

    headClone?.querySelectorAll(`#${EDIT_STYLE_ID}`).forEach((node) => node.remove())
    htmlClone.querySelectorAll(`[${EDITABLE_ATTRIBUTE}]`).forEach((node) => node.removeAttribute(EDITABLE_ATTRIBUTE))
    bodyClone?.removeAttribute("contenteditable")
    bodyClone?.removeAttribute("data-mu-edit-mode")
    bodyClone?.removeAttribute("tabindex")

    return htmlClone.outerHTML ?? doc.documentElement.outerHTML ?? null
  }, [])

  const persistEditedHtml = useCallback(() => {
    const updated = readIframeHtml()
    if (!updated) {
      return null
    }

    if (updated !== displayHtml) {
      setDisplayHtml(updated)
    }

    if (onHtmlChange) {
      if (updated !== html) {
        skipNextHtmlSync.current = true
      } else {
        skipNextHtmlSync.current = false
      }
      onHtmlChange(updated)
    }

    return updated
  }, [displayHtml, html, onHtmlChange, readIframeHtml])

  useEffect(() => {
    persistEditedHtmlRef.current = persistEditedHtml
  }, [persistEditedHtml])

  useEffect(() => {
    if (skipNextHtmlSync.current) {
      skipNextHtmlSync.current = false
      return
    }

    setDisplayHtml((current) => (current === html ? current : html))
    setIsEditMode(false)
  }, [html])

  useEffect(() => {
    setIframeReady(false)
  }, [displayHtml])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !displayHtml) {
      return
    }

    const handleLoad = () => {
      setIframeReady(true)
      try {
        const iframeDoc = getIframeDocument(iframe)
        if (iframeDoc) {
          injectBaseStyles(iframeDoc)
        }
    } catch (error) {
        console.error("Could not inject preview styles:", error)
      }
    }

    iframe.addEventListener("load", handleLoad)
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad()
    }

    return () => {
      iframe.removeEventListener("load", handleLoad)
    }
  }, [displayHtml])

  useEffect(() => {
    if (!isEditMode) {
      return
    }

    const doc = getIframeDocument(iframeRef.current)
    if (!doc || !doc.body) {
      return
    }

    const previousTabIndex = doc.body.getAttribute("tabindex")
    doc.body.setAttribute("tabindex", "-1")
    doc.body.setAttribute("contenteditable", "true")
    doc.body.setAttribute("data-mu-edit-mode", "true")
    doc.body.focus()

    const cleanupMarkers = markEditableElements(doc)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setIsEditMode(false)
        return
      }

      const isBoldShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b"
      if (isBoldShortcut) {
        event.preventDefault()
        applyBoldFormatting(doc)
      }
    }

    doc.addEventListener("keydown", handleKeyDown)

    return () => {
      cleanupMarkers()

      doc.removeEventListener("keydown", handleKeyDown)

      doc.body.removeAttribute("contenteditable")
      doc.body.removeAttribute("data-mu-edit-mode")

      if (previousTabIndex === null) {
        doc.body.removeAttribute("tabindex")
      } else {
        doc.body.setAttribute("tabindex", previousTabIndex)
      }
    }
  }, [isEditMode])

  useEffect(() => {
    onEditModeChange?.(isEditMode)
  }, [isEditMode, onEditModeChange])

  useEffect(() => {
    if (isLoading && isEditMode) {
      persistEditedHtml()
      setIsEditMode(false)
    }
  }, [isLoading, isEditMode, persistEditedHtml])

  useEffect(() => {
    return () => {
      if (isEditMode) {
        persistEditedHtmlRef.current?.()
      }
    }
  }, [isEditMode])

  const handleToggleEditMode = () => {
    if (!displayHtml || isLoading || !iframeReady) {
      return
    }

    if (isEditMode) {
      persistEditedHtml()
      setIsEditMode(false)
      return
    }

    setIsEditMode(true)
  }

  const handleViewFullPage = () => {
    if (!displayHtml || typeof window === "undefined") {
      return
    }

    let htmlForPreview = displayHtml
    if (isEditMode) {
      const updated = persistEditedHtml()
      if (updated) {
        htmlForPreview = updated
      }
      setIsEditMode(false)
    }

    try {
      const previewId =
        typeof window.crypto !== "undefined" && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `preview-${Date.now()}`

      window.localStorage.setItem(`preview:${previewId}`, htmlForPreview)
      window.open(`/preview?id=${previewId}`, "_blank", "noopener,noreferrer")
    } catch (error) {
      console.error("Failed to open full preview:", error)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          {activeVersionLabel && <span className={styles.versionLabel}>{activeVersionLabel}</span>}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={handleViewFullPage}
            disabled={!displayHtml || isLoading}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h6v6" />
              <path d="M9 21H3v-6" />
              <path d="M21 3l-7 7" />
              <path d="M3 21l7-7" />
            </svg>
            View full page
          </button>
          <div className={styles.editModeGroup}>
            <button
              className={`${styles.editButton} ${isEditMode ? styles.editButtonActive : ""}`}
              onClick={handleToggleEditMode}
              disabled={!displayHtml || isLoading || !iframeReady}
              type="button"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              Edit mode
              <span className={`${styles.editChip} ${isEditMode ? styles.editChipActive : ""}`}>
                {isEditMode ? "ON" : "OFF"}
              </span>
          </button>
            {/* <span className={`${styles.editStatus} ${isEditMode ? styles.editStatusActive : ""}`}>
              {isEditMode ? "Editing in preview" : "Preview locked"}
            </span> */}
          </div>
        </div>
      </div>
      <div className={styles.previewWrapper}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.lottieContainer}>
              <DotLottieReact
                src="https://lottie.host/ab1b22d0-c21f-4d40-8c4c-dbe60b73e693/s6xFHKHmVn.lottie"
                loop
                autoplay
              />
            </div>
            <p className={styles.loadingText}>Generating your webpage...</p>
            <p className={styles.loadingSubtext}>Mu AI is crafting something amazing</p>
          </div>
        ) : displayHtml ? (
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            srcDoc={displayHtml}
            sandbox="allow-scripts allow-same-origin"
            title="Generated Webpage Preview"
          />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className={styles.placeholderTitle}>Ready to Create</h2>
            <p className={styles.placeholderText}>Describe your vision below and watch it come to life</p>
          </div>
        )}
      </div>
    </div>
  )
}
