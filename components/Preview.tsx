"use client"

import { useState, useEffect, useRef, useCallback, ChangeEvent } from "react"
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
const LINK_TARGET_ATTRIBUTE = "data-mu-link-target"
const BUTTON_LINK_ATTRIBUTE = "data-mu-button-link"
const VIDEO_TARGET_ATTRIBUTE = "data-mu-video-target"
const VIDEO_YOUTUBE_ATTRIBUTE = "data-video-youtube"
const VIDEO_CDN_ATTRIBUTE = "data-video-cdn"
const IMAGE_TARGET_ATTRIBUTE = "data-mu-image-target"
type LinkableTag = "a" | "button"

const sanitizeLinkUrl = (rawValue: string) => {
  const value = rawValue.trim()

  if (!value || /\s/.test(value)) {
    return null
  }

  if (/^(javascript:|data:)/i.test(value)) {
    return null
  }

  if (/^(https?:\/\/)/i.test(value) || /^(mailto:|tel:)/i.test(value)) {
    return value
  }

  if (value.startsWith("/") || value.startsWith("#")) {
    return value
  }

  const stripped = value.replace(/^https?:\/\//i, "")
  if (/^[\w.-]+(:\d+)?(\/.*)?$/i.test(stripped)) {
    return `https://${stripped}`
  }

  return null
}

const isExternalLink = (url: string) => /^https?:\/\//i.test(url)

const escapeSingleQuotes = (value: string) => value.replace(/'/g, "\\'")

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

const getIframeWindow = (iframe: HTMLIFrameElement | null) => {
  if (!iframe) return null
  return iframe.contentWindow
}

const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const isYouTubeUrl = (url: string): boolean => {
  return /youtube\.com|youtu\.be/i.test(url)
}

const isCdnUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)(\?|#|$)/i.test(url) || /^https?:\/\/[^/]+\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)/i.test(url)
}

const injectVideoPopup = (doc: Document) => {
  if (!doc.body || doc.getElementById("heroPopup")) {
    return
  }

  const popup = doc.createElement("div")
  popup.id = "heroPopup"
  popup.className = "popup"
  popup.innerHTML = `
    <div class="popupBody">
      <div class="floatingClose">
        <img src="https://files.mastersunion.link/resources/svg/close.svg" alt="Close" />
      </div>
      <div class="custom-video-area" id="custom-popout-video">
        <iframe class="iframeHero" id="iframevideo_MU" title="YouTube video player" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen style="display: none;"></iframe>
        <video id="html5video_MU" class="iframeHero" controls style="display: none;">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  `
  doc.body.appendChild(popup)

  const iframeWindow = doc.defaultView || (doc as any).parentWindow
  if (!iframeWindow) return

    // Add openPopup function
    ; (iframeWindow as any).openPopup = function (video: string, type: string = "youtube", time: number = 0) {
      const popupEl = doc.getElementById("heroPopup")
      const iframe = doc.getElementById("iframevideo_MU") as HTMLIFrameElement
      const html5video = doc.getElementById("html5video_MU") as HTMLVideoElement

      if (!popupEl || !iframe || !html5video) return

      if (type === "youtube") {
        iframe.setAttribute("src", `https://www.youtube.com/embed/${video}?rel=0&autoplay=1&t=${time}s`)
        iframe.style.display = "block"
        html5video.style.display = "none"
        html5video.removeAttribute("src")
      } else if (type === "cdn") {
        iframe.style.display = "none"
        iframe.removeAttribute("src")
        html5video.setAttribute("src", `${video}#t=${time}`)
        html5video.style.display = "block"
        html5video.load()
        html5video.play().catch((e) => console.error("Video play error:", e))
      }

      popupEl.classList.add("active")
      doc.body.style.overflow = "hidden"
    }

    // Add closePopup function
    ; (iframeWindow as any).closePopup = function () {
      const popupEl = doc.getElementById("heroPopup")
      const iframe = doc.getElementById("iframevideo_MU") as HTMLIFrameElement
      const html5video = doc.getElementById("html5video_MU") as HTMLVideoElement

      if (!popupEl) return

      if (iframe) {
        iframe.removeAttribute("src")
        iframe.style.display = "none"
      }

      if (html5video) {
        html5video.pause()
        html5video.removeAttribute("src")
        html5video.load()
        html5video.style.display = "none"
      }

      popupEl.classList.remove("active")
      doc.body.style.overflow = ""
    }

  // Attach close button handler
  const closeBtn = popup.querySelector(".floatingClose")
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      ; (iframeWindow as any).closePopup()
    })
  }

  // Close on background click
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      ; (iframeWindow as any).closePopup()
    }
  })

  // Close on Escape key
  doc.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("active")) {
      ; (iframeWindow as any).closePopup()
    }
  })
}

const setupPlayButtonHandlers = (doc: Document) => {
  if (!doc.body) return

  // Check if we're in edit mode
  const isEditMode = doc.body.getAttribute("data-mu-edit-mode") === "true"

  // Find all elements that could be play buttons
  // Look for buttons with video attributes or elements with play icon indicators
  const playButtons = doc.querySelectorAll(
    `button[${VIDEO_YOUTUBE_ATTRIBUTE}], button[${VIDEO_CDN_ATTRIBUTE}], [${VIDEO_YOUTUBE_ATTRIBUTE}], [${VIDEO_CDN_ATTRIBUTE}]`
  )

  playButtons.forEach((button) => {
    const element = button as HTMLElement
    const youtubeLink = element.getAttribute(VIDEO_YOUTUBE_ATTRIBUTE)
    const cdnLink = element.getAttribute(VIDEO_CDN_ATTRIBUTE)

    // Remove existing click handlers by cloning
    const existingHandler = (element as any)._muVideoHandler
    if (existingHandler) {
      element.removeEventListener("click", existingHandler)
    }

    // Only add popup handler if not in edit mode
    // In edit mode, the click handler in the edit mode effect will handle selection
    if (!isEditMode) {
      const handler = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()

        const iframeWindow = doc.defaultView || (doc as any).parentWindow
        if (!iframeWindow || !(iframeWindow as any).openPopup) return

        if (youtubeLink) {
          const videoId = extractYouTubeId(youtubeLink)
          if (videoId) {
            ; (iframeWindow as any).openPopup(videoId, "youtube", 0)
          }
        } else if (cdnLink) {
          ; (iframeWindow as any).openPopup(cdnLink, "cdn", 0)
        }
      }

      element.addEventListener("click", handler)
        ; (element as any)._muVideoHandler = handler
    }
  })
}

const injectBaseStyles = (doc: Document) => {
  if (!doc.head) {
    console.warn("[Preview] Document head is not available yet")
    return
  }

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
      body[data-mu-edit-mode="true"] [${LINK_TARGET_ATTRIBUTE}="true"] {
        outline: 2px solid rgba(86, 149, 255, 0.95) !important;
        box-shadow: 0 0 0 3px rgba(86, 149, 255, 0.3) !important;
      }
      body[data-mu-edit-mode="true"] [${VIDEO_TARGET_ATTRIBUTE}="true"] {
        outline: 2px solid rgba(250, 209, 51, 0.95) !important;
        box-shadow: 0 0 0 3px rgba(250, 209, 51, 0.3) !important;
      }
      body[data-mu-edit-mode="true"] [${IMAGE_TARGET_ATTRIBUTE}="true"] {
        outline: 2px solid rgba(86, 149, 255, 0.95) !important;
        box-shadow: 0 0 0 3px rgba(86, 149, 255, 0.3) !important;
        cursor: pointer !important;
      }
      body[data-mu-edit-mode="true"] [${IMAGE_TARGET_ATTRIBUTE}="true"]:hover::after {
        content: "Click to change image";
        position: absolute;
        top: -22px;
        right: -4px;
        font-size: 10px;
        letter-spacing: 0.4px;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 999px;
        background: rgba(86, 149, 255, 0.96);
        color: #ffffff;
        font-family: "Inter", "Segoe UI", sans-serif;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        pointer-events: none;
        z-index: 10000;
      }
      body[data-mu-edit-mode="true"] img {
        position: relative;
        transition: all 0.2s ease;
        cursor: pointer !important;
      }
      body[data-mu-edit-mode="true"] img:hover:not([${IMAGE_TARGET_ATTRIBUTE}]) {
        outline: 2px dashed rgba(86, 149, 255, 0.7) !important;
        box-shadow: 0 0 0 3px rgba(86, 149, 255, 0.2) !important;
        opacity: 0.85;
        filter: brightness(1.1);
      }
      body[data-mu-edit-mode="true"] img[${IMAGE_TARGET_ATTRIBUTE}]:hover {
        outline: 2px solid rgba(86, 149, 255, 1) !important;
        box-shadow: 0 0 0 4px rgba(86, 149, 255, 0.4) !important;
        opacity: 0.9;
        filter: brightness(1.15);
      }
      body[data-mu-edit-mode="true"] button[${VIDEO_YOUTUBE_ATTRIBUTE}],
      body[data-mu-edit-mode="true"] button[${VIDEO_CDN_ATTRIBUTE}],
      body[data-mu-edit-mode="true"] [${VIDEO_YOUTUBE_ATTRIBUTE}],
      body[data-mu-edit-mode="true"] [${VIDEO_CDN_ATTRIBUTE}] {
        position: relative;
        transition: all 0.2s ease;
      }
      body[data-mu-edit-mode="true"] button[${VIDEO_YOUTUBE_ATTRIBUTE}]:hover,
      body[data-mu-edit-mode="true"] button[${VIDEO_CDN_ATTRIBUTE}]:hover,
      body[data-mu-edit-mode="true"] [${VIDEO_YOUTUBE_ATTRIBUTE}]:hover,
      body[data-mu-edit-mode="true"] [${VIDEO_CDN_ATTRIBUTE}]:hover {
        outline: 2px dashed rgba(250, 209, 51, 0.7) !important;
        box-shadow: 0 0 0 3px rgba(250, 209, 51, 0.2) !important;
        transform: scale(1.05);
      }
      body[data-mu-edit-mode="true"] button[${VIDEO_YOUTUBE_ATTRIBUTE}]:hover::after,
      body[data-mu-edit-mode="true"] button[${VIDEO_CDN_ATTRIBUTE}]:hover::after,
      body[data-mu-edit-mode="true"] [${VIDEO_YOUTUBE_ATTRIBUTE}]:hover::after,
      body[data-mu-edit-mode="true"] [${VIDEO_CDN_ATTRIBUTE}]:hover::after {
        content: "Click to edit video";
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
        z-index: 10000;
        white-space: nowrap;
      }
      .popup {
        position: fixed;
        z-index: 99999;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: hsla(0, 0%, 0%, 0.8);
        visibility: hidden;
        opacity: 0;
        transition: visibility 0s linear 0.3s, opacity 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .popupBody {
        max-height: calc(100dvh - 50px);
        max-width: calc(100vw - 50px);
        height: 80vh;
        min-height: 80vh;
        width: 100%;
        margin: 0 auto;
        position: relative;
        top: 8px;
      }
      .popup.active {
        opacity: 1;
        visibility: visible;
        transition-delay: 0s;
      }
      .floatingClose {
        position: absolute;
        line-height: 0;
        z-index: 99;
        right: -20px;
        top: -20px;
        cursor: pointer;
      }
      .floatingClose img {
        width: 30px;
        height: 30px;
      }
      .iframeHero {
        width: inherit;
        height: inherit;
        background: var(--black, #000);
      }
      .custom-video-area {
        position: relative;
        max-width: 100%;
        width: 100%;
        height: 80vh;
        margin: 0 auto;
        border-radius: 20px;
        overflow: hidden;
        line-height: 0;
      }
      video.video-element, #html5video_MU {
        position: relative;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        min-width: 100%;
        width: 100%;
        min-height: 100%;
        margin: auto;
        border-radius: 20px;
        overflow: hidden;
      }
      #iframevideo_MU {
        width: 100%;
        height: 100%;
        border-radius: 20px;
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
  const [linkEditorTarget, setLinkEditorTarget] = useState<{ element: HTMLElement; tag: LinkableTag } | null>(null)
  const [linkEditorValue, setLinkEditorValue] = useState("")
  const [linkEditorMessage, setLinkEditorMessage] = useState("")
  const [linkEditorTone, setLinkEditorTone] = useState<"info" | "success" | "error">("info")
  const highlightedLinkRef = useRef<HTMLElement | null>(null)
  const linkMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [videoEditorTarget, setVideoEditorTarget] = useState<HTMLElement | null>(null)
  const [videoEditorYoutube, setVideoEditorYoutube] = useState("")
  const [videoEditorCdn, setVideoEditorCdn] = useState("")
  const [videoEditorLink, setVideoEditorLink] = useState("")
  const [videoEditorMessage, setVideoEditorMessage] = useState("")
  const [videoEditorTone, setVideoEditorTone] = useState<"info" | "success" | "error">("info")
  const highlightedVideoRef = useRef<HTMLElement | null>(null)
  const videoMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [imageEditorTarget, setImageEditorTarget] = useState<HTMLImageElement | null>(null)
  const [imageEditorMessage, setImageEditorMessage] = useState("")
  const [imageEditorTone, setImageEditorTone] = useState<"info" | "success" | "error">("info")
  const highlightedImageRef = useRef<HTMLImageElement | null>(null)
  const imageMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)

  const clearHighlightedLink = useCallback(() => {
    if (highlightedLinkRef.current) {
      highlightedLinkRef.current.removeAttribute(LINK_TARGET_ATTRIBUTE)
      highlightedLinkRef.current = null
    }
  }, [])

  const clearHighlightedVideo = useCallback(() => {
    if (highlightedVideoRef.current) {
      highlightedVideoRef.current.removeAttribute(VIDEO_TARGET_ATTRIBUTE)
      highlightedVideoRef.current = null
    }
  }, [])

  const clearHighlightedImage = useCallback(() => {
    if (highlightedImageRef.current) {
      highlightedImageRef.current.removeAttribute(IMAGE_TARGET_ATTRIBUTE)
      highlightedImageRef.current = null
    }
  }, [])

  const resetLinkMessageTimer = useCallback(() => {
    if (linkMessageTimeoutRef.current) {
      clearTimeout(linkMessageTimeoutRef.current)
      linkMessageTimeoutRef.current = null
    }
  }, [])

  const resetVideoMessageTimer = useCallback(() => {
    if (videoMessageTimeoutRef.current) {
      clearTimeout(videoMessageTimeoutRef.current)
      videoMessageTimeoutRef.current = null
    }
  }, [])

  const resetImageMessageTimer = useCallback(() => {
    if (imageMessageTimeoutRef.current) {
      clearTimeout(imageMessageTimeoutRef.current)
      imageMessageTimeoutRef.current = null
    }
  }, [])

  const showLinkMessage = useCallback(
    (message: string, tone: "info" | "success" | "error" = "info") => {
      resetLinkMessageTimer()
      setLinkEditorTone(tone)
      setLinkEditorMessage(message)
      linkMessageTimeoutRef.current = setTimeout(() => {
        setLinkEditorMessage("")
      }, 2200)
    },
    [resetLinkMessageTimer]
  )

  const showVideoMessage = useCallback(
    (message: string, tone: "info" | "success" | "error" = "info") => {
      resetVideoMessageTimer()
      setVideoEditorTone(tone)
      setVideoEditorMessage(message)
      videoMessageTimeoutRef.current = setTimeout(() => {
        setVideoEditorMessage("")
      }, 2200)
    },
    [resetVideoMessageTimer]
  )

  const showImageMessage = useCallback(
    (message: string, tone: "info" | "success" | "error" = "info") => {
      resetImageMessageTimer()
      setImageEditorTone(tone)
      setImageEditorMessage(message)
      imageMessageTimeoutRef.current = setTimeout(() => {
        setImageEditorMessage("")
      }, 2200)
    },
    [resetImageMessageTimer]
  )

  const updateLinkEditorSelection = useCallback(
    (element: HTMLElement | null) => {
      resetLinkMessageTimer()
      setLinkEditorMessage("")
      setLinkEditorTone("info")

      if (!element) {
        clearHighlightedLink()
        setLinkEditorTarget(null)
        setLinkEditorValue("")
        return
      }

      const doc = getIframeDocument(iframeRef.current)
      if (!doc || !doc.body || !doc.body.contains(element)) {
        clearHighlightedLink()
        setLinkEditorTarget(null)
        setLinkEditorValue("")
        return
      }

      const tagName = element.tagName?.toLowerCase()
      if (tagName !== "a" && tagName !== "button") {
        clearHighlightedLink()
        setLinkEditorTarget(null)
        setLinkEditorValue("")
        return
      }

      clearHighlightedLink()
      element.setAttribute(LINK_TARGET_ATTRIBUTE, "true")
      highlightedLinkRef.current = element

      const currentValue =
        tagName === "a" ? element.getAttribute("href") ?? "" : element.getAttribute(BUTTON_LINK_ATTRIBUTE) ?? ""

      setLinkEditorTarget({ element, tag: tagName as LinkableTag })
      setLinkEditorValue(currentValue)
    },
    [clearHighlightedLink, resetLinkMessageTimer]
  )

  const getResolvedLinkTarget = useCallback(() => {
    if (!linkEditorTarget) {
      return null
    }

    const doc = getIframeDocument(iframeRef.current)
    if (!doc || !doc.body || !doc.body.contains(linkEditorTarget.element)) {
      updateLinkEditorSelection(null)
      return null
    }

    return linkEditorTarget
  }, [linkEditorTarget, updateLinkEditorSelection])

  const updateVideoEditorSelection = useCallback(
    (element: HTMLElement | null) => {
      resetVideoMessageTimer()
      setVideoEditorMessage("")
      setVideoEditorTone("info")

      if (!element) {
        clearHighlightedVideo()
        setVideoEditorTarget(null)
        setVideoEditorYoutube("")
        setVideoEditorCdn("")
        setVideoEditorLink("")
        return
      }

      const doc = getIframeDocument(iframeRef.current)
      if (!doc || !doc.body || !doc.body.contains(element)) {
        clearHighlightedVideo()
        setVideoEditorTarget(null)
        setVideoEditorYoutube("")
        setVideoEditorCdn("")
        setVideoEditorLink("")
        return
      }

      clearHighlightedVideo()
      element.setAttribute(VIDEO_TARGET_ATTRIBUTE, "true")
      highlightedVideoRef.current = element

      const youtubeLink = element.getAttribute(VIDEO_YOUTUBE_ATTRIBUTE) ?? ""
      const cdnLink = element.getAttribute(VIDEO_CDN_ATTRIBUTE) ?? ""
      const tagName = element.tagName?.toLowerCase()
      const currentLink =
        tagName === "a" ? element.getAttribute("href") ?? "" : element.getAttribute(BUTTON_LINK_ATTRIBUTE) ?? ""

      setVideoEditorTarget(element)
      setVideoEditorYoutube(youtubeLink)
      setVideoEditorCdn(cdnLink)
      setVideoEditorLink(currentLink)
    },
    [clearHighlightedVideo, resetVideoMessageTimer]
  )

  const getResolvedVideoTarget = useCallback(() => {
    if (!videoEditorTarget) {
      return null
    }

    const doc = getIframeDocument(iframeRef.current)
    if (!doc || !doc.body || !doc.body.contains(videoEditorTarget)) {
      updateVideoEditorSelection(null)
      return null
    }

    return videoEditorTarget
  }, [videoEditorTarget, updateVideoEditorSelection])

  const updateImageEditorSelection = useCallback(
    (element: HTMLImageElement | null) => {
      resetImageMessageTimer()
      setImageEditorMessage("")
      setImageEditorTone("info")

      if (!element) {
        clearHighlightedImage()
        setImageEditorTarget(null)
        return
      }

      const doc = getIframeDocument(iframeRef.current)
      if (!doc || !doc.body || !doc.body.contains(element)) {
        clearHighlightedImage()
        setImageEditorTarget(null)
        return
      }

      // Clear previous selection
      clearHighlightedImage()
      
      // Set new selection
      element.setAttribute(IMAGE_TARGET_ATTRIBUTE, "true")
      highlightedImageRef.current = element
      setImageEditorTarget(element)
      
      // Ensure the element is still in the DOM after update
      // This helps maintain selection even after image src changes
      const checkElement = () => {
        if (doc.body.contains(element)) {
          element.setAttribute(IMAGE_TARGET_ATTRIBUTE, "true")
        }
      }
      
      // Re-apply attribute after a brief delay to ensure it persists
      setTimeout(checkElement, 10)
    },
    [clearHighlightedImage, resetImageMessageTimer]
  )

  const getResolvedImageTarget = useCallback(() => {
    if (!imageEditorTarget) {
      return null
    }

    const doc = getIframeDocument(iframeRef.current)
    if (!doc || !doc.body || !doc.body.contains(imageEditorTarget)) {
      updateImageEditorSelection(null)
      return null
    }

    return imageEditorTarget
  }, [imageEditorTarget, updateImageEditorSelection])

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
    htmlClone.querySelectorAll(`[${LINK_TARGET_ATTRIBUTE}]`).forEach((node) => node.removeAttribute(LINK_TARGET_ATTRIBUTE))
    htmlClone.querySelectorAll(`[${VIDEO_TARGET_ATTRIBUTE}]`).forEach((node) => node.removeAttribute(VIDEO_TARGET_ATTRIBUTE))
    htmlClone.querySelectorAll(`[${IMAGE_TARGET_ATTRIBUTE}]`).forEach((node) => node.removeAttribute(IMAGE_TARGET_ATTRIBUTE))
    // Remove popup from cloned HTML
    htmlClone.querySelectorAll("#heroPopup").forEach((node) => node.remove())
    bodyClone?.removeAttribute("contenteditable")
    bodyClone?.removeAttribute("data-mu-edit-mode")
    bodyClone?.removeAttribute("tabindex")

    return htmlClone.outerHTML ?? doc.documentElement.outerHTML ?? null
  }, [])

  const persistEditedHtml = useCallback(() => {
    const iframe = iframeRef.current
    const iframeWindow = getIframeWindow(iframe)
    
    // Save scroll position before updating
    let scrollX = 0
    let scrollY = 0
    if (iframeWindow) {
      scrollX = iframeWindow.scrollX || iframeWindow.pageXOffset || 0
      scrollY = iframeWindow.scrollY || iframeWindow.pageYOffset || 0
    }

    const updated = readIframeHtml()
    if (!updated) {
      return null
    }

    // CRITICAL: Don't update displayHtml while in edit mode as it causes iframe reload
    // Only update the parent component's HTML state, not the iframe srcDoc
    // This prevents the iframe from reloading and losing edit mode
    if (!isEditMode) {
      if (updated !== displayHtml) {
        setDisplayHtml(updated)
      }
    }

    if (onHtmlChange) {
      if (updated !== html) {
        skipNextHtmlSync.current = true
      } else {
        skipNextHtmlSync.current = false
      }
      onHtmlChange(updated)
    }

    // Restore scroll position after a brief delay to ensure DOM is updated
    if (iframeWindow) {
      setTimeout(() => {
        iframeWindow.scrollTo(scrollX, scrollY)
      }, 0)
    }

    return updated
  }, [displayHtml, html, onHtmlChange, readIframeHtml, isEditMode])

  useEffect(() => {
    persistEditedHtmlRef.current = persistEditedHtml
  }, [persistEditedHtml])

  useEffect(() => {
    return () => {
      resetLinkMessageTimer()
      clearHighlightedLink()
      resetVideoMessageTimer()
      clearHighlightedVideo()
      resetImageMessageTimer()
      clearHighlightedImage()
    }
  }, [resetLinkMessageTimer, clearHighlightedLink, resetVideoMessageTimer, clearHighlightedVideo, resetImageMessageTimer, clearHighlightedImage])

  useEffect(() => {
    if (skipNextHtmlSync.current) {
      skipNextHtmlSync.current = false
      return
    }

    setDisplayHtml((current) => (current === html ? current : html))
    setIsEditMode(false)
  }, [html])

  useEffect(() => {
    // Only reset iframe ready state if we're not in edit mode
    // This prevents iframe reload while editing
    if (!isEditMode) {
      setIframeReady(false)
    }
  }, [displayHtml, isEditMode])

  useEffect(() => {
    updateLinkEditorSelection(null)
    updateVideoEditorSelection(null)
    updateImageEditorSelection(null)
  }, [displayHtml, updateLinkEditorSelection, updateVideoEditorSelection, updateImageEditorSelection])

  useEffect(() => {
    if (!isEditMode) {
      updateLinkEditorSelection(null)
      updateVideoEditorSelection(null)
      updateImageEditorSelection(null)
    } else {
      // Re-setup play button handlers when entering edit mode
      const doc = getIframeDocument(iframeRef.current)
      if (doc) {
        setTimeout(() => {
          setupPlayButtonHandlers(doc)
        }, 100)
      }
    }
  }, [isEditMode, updateLinkEditorSelection, updateVideoEditorSelection, updateImageEditorSelection])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !displayHtml) {
      return
    }

    const handleLoad = () => {
      try {
        const iframeDoc = getIframeDocument(iframe)
        if (iframeDoc && iframeDoc.head && iframeDoc.body) {
          injectBaseStyles(iframeDoc)
          injectVideoPopup(iframeDoc)
          setTimeout(() => {
            setupPlayButtonHandlers(iframeDoc)
          }, 100)
          setIframeReady(true)
        } else {
          // Document not fully ready, retry after a short delay
          setTimeout(() => {
            const retryDoc = getIframeDocument(iframe)
            if (retryDoc && retryDoc.head && retryDoc.body) {
              injectBaseStyles(retryDoc)
              injectVideoPopup(retryDoc)
              setTimeout(() => {
                setupPlayButtonHandlers(retryDoc)
              }, 100)
              setIframeReady(true)
            }
          }, 50)
        }
      } catch (error) {
        console.error("Could not inject preview styles:", error)
        // Still set ready even if injection fails
        setIframeReady(true)
      }
    }

    iframe.addEventListener("load", handleLoad)
    // Check if document is already loaded and has head/body
    const checkReady = () => {
      const doc = getIframeDocument(iframe)
      if (doc && doc.readyState === "complete" && doc.head && doc.body) {
        handleLoad()
      }
    }
    checkReady()

    // Re-setup handlers when HTML changes
    const intervalId = setInterval(() => {
      const doc = getIframeDocument(iframe)
      if (doc && doc.body) {
        setupPlayButtonHandlers(doc)
      }
    }, 1000)

    return () => {
      iframe.removeEventListener("load", handleLoad)
      clearInterval(intervalId)
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

    // Add hover tooltips for images and videos
    const addHoverTooltips = () => {
      const images = doc.querySelectorAll<HTMLImageElement>("img")
      const videoElements = doc.querySelectorAll<HTMLElement>(
        `button[${VIDEO_YOUTUBE_ATTRIBUTE}], button[${VIDEO_CDN_ATTRIBUTE}], [${VIDEO_YOUTUBE_ATTRIBUTE}], [${VIDEO_CDN_ATTRIBUTE}]`
      )

      images.forEach((img) => {
        if (!img.hasAttribute("data-mu-tooltip-added")) {
          img.setAttribute("data-mu-tooltip-added", "true")
          img.setAttribute("title", "Click to change image")
          
          const showTooltip = (e: MouseEvent) => {
            // Remove existing tooltip if any
            const existing = img.querySelector(".mu-hover-tooltip")
            if (existing) existing.remove()

            const tooltip = doc.createElement("div")
            tooltip.className = "mu-hover-tooltip"
            tooltip.textContent = "Click to change image"
            tooltip.style.cssText = `
              position: absolute;
              top: -32px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              letter-spacing: 0.4px;
              text-transform: uppercase;
              padding: 4px 10px;
              border-radius: 999px;
              background: rgba(86, 149, 255, 0.96);
              color: #ffffff;
              font-family: "Inter", "Segoe UI", sans-serif;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
              pointer-events: none;
              z-index: 10000;
              white-space: nowrap;
            `
            if (img.style.position === "" || img.style.position === "static") {
              img.style.position = "relative"
            }
            img.appendChild(tooltip)
          }

          const hideTooltip = () => {
            const tooltip = img.querySelector(".mu-hover-tooltip")
            if (tooltip) {
              tooltip.remove()
            }
          }

          img.addEventListener("mouseenter", showTooltip)
          img.addEventListener("mouseleave", hideTooltip)
        }
      })

      videoElements.forEach((videoEl) => {
        if (!videoEl.hasAttribute("data-mu-tooltip-added")) {
          videoEl.setAttribute("data-mu-tooltip-added", "true")
          videoEl.setAttribute("title", "Click to edit video")
          
          const showTooltip = (e: MouseEvent) => {
            // Remove existing tooltip if any
            const existing = videoEl.querySelector(".mu-hover-tooltip")
            if (existing) existing.remove()

            const tooltip = doc.createElement("div")
            tooltip.className = "mu-hover-tooltip"
            tooltip.textContent = "Click to edit video"
            tooltip.style.cssText = `
              position: absolute;
              top: -32px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 10px;
              letter-spacing: 0.4px;
              text-transform: uppercase;
              padding: 4px 10px;
              border-radius: 999px;
              background: rgba(250, 209, 51, 0.96);
              color: #050505;
              font-family: "Inter", "Segoe UI", sans-serif;
              box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
              pointer-events: none;
              z-index: 10000;
              white-space: nowrap;
            `
            if (videoEl.style.position === "" || videoEl.style.position === "static") {
              videoEl.style.position = "relative"
            }
            videoEl.appendChild(tooltip)
          }

          const hideTooltip = () => {
            const tooltip = videoEl.querySelector(".mu-hover-tooltip")
            if (tooltip) {
              tooltip.remove()
            }
          }

          videoEl.addEventListener("mouseenter", showTooltip)
          videoEl.addEventListener("mouseleave", hideTooltip)
        }
      })
    }

    // Add tooltips after a short delay to ensure DOM is ready
    setTimeout(() => {
      addHoverTooltips()
    }, 100)

    const resolveLinkableElement = (target: EventTarget | null): HTMLElement | null => {
      if (!target) {
        return null
      }

      const elementCandidate = target as Element | null
      if (elementCandidate && typeof elementCandidate.closest === "function") {
        const match = elementCandidate.closest("a, button") as HTMLElement | null
        if (match && doc.body.contains(match)) {
          return match
        }
      }

      const parent = (target as Node | null)?.parentElement
      if (parent && typeof parent.closest === "function") {
        const match = parent.closest("a, button") as HTMLElement | null
        if (match && doc.body.contains(match)) {
          return match
        }
      }

      return null
    }

    const resolveVideoElement = (target: EventTarget | null): HTMLElement | null => {
      if (!target) {
        return null
      }

      const elementCandidate = target as Element | null
      if (elementCandidate) {
        // Check if element itself has video attributes
        if (
          elementCandidate.hasAttribute(VIDEO_YOUTUBE_ATTRIBUTE) ||
          elementCandidate.hasAttribute(VIDEO_CDN_ATTRIBUTE)
        ) {
          return elementCandidate as HTMLElement
        }

        // Check if element is a .videoPlayButton div or inside one
        if (typeof elementCandidate.closest === "function") {
          const isVideoPlayButton = elementCandidate instanceof HTMLElement && elementCandidate.classList.contains("videoPlayButton")
          const videoPlayButtonDiv = isVideoPlayButton
            ? (elementCandidate as HTMLElement)
            : (elementCandidate.closest(".videoPlayButton") as HTMLElement | null)

          if (videoPlayButtonDiv && doc.body.contains(videoPlayButtonDiv)) {
            // If the div itself has video attributes, return it
            if (
              videoPlayButtonDiv.hasAttribute(VIDEO_YOUTUBE_ATTRIBUTE) ||
              videoPlayButtonDiv.hasAttribute(VIDEO_CDN_ATTRIBUTE)
            ) {
              return videoPlayButtonDiv
            }

            // Otherwise, look for a button inside the div with video attributes
            const buttonInside = videoPlayButtonDiv.querySelector(
              `button[${VIDEO_YOUTUBE_ATTRIBUTE}], button[${VIDEO_CDN_ATTRIBUTE}]`
            ) as HTMLElement | null
            if (buttonInside && doc.body.contains(buttonInside)) {
              return buttonInside
            }
          }

          // Check if element is inside a play button (existing logic)
          const match = elementCandidate.closest(
            `button[${VIDEO_YOUTUBE_ATTRIBUTE}], button[${VIDEO_CDN_ATTRIBUTE}], [${VIDEO_YOUTUBE_ATTRIBUTE}], [${VIDEO_CDN_ATTRIBUTE}]`
          ) as HTMLElement | null
          if (match && doc.body.contains(match)) {
            return match
          }
        }
      }

      return null
    }

    const resolveImageElement = (target: EventTarget | null): HTMLImageElement | null => {
      if (!target) {
        return null
      }

      const elementCandidate = target as Element | null
      if (elementCandidate && elementCandidate.tagName?.toLowerCase() === "img") {
        return elementCandidate as HTMLImageElement
      }

      // Check if clicked element is inside an img
      if (elementCandidate && typeof elementCandidate.closest === "function") {
        const imgParent = elementCandidate.closest("img") as HTMLImageElement | null
        if (imgParent && doc.body.contains(imgParent)) {
          return imgParent
        }
      }

      return null
    }

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

    const handleClick = (event: MouseEvent) => {
      // In edit mode, prioritize selection over action
      // Check for image element first
      const imageElement = resolveImageElement(event.target)
      if (imageElement) {
        event.preventDefault()
        event.stopPropagation()
        // Always allow re-selection, even if clicking the same image
        updateImageEditorSelection(imageElement)
        updateVideoEditorSelection(null)
        updateLinkEditorSelection(null)
        // Prevent any default behavior that might cause scrolling
        return false
      }

      // Check for video element
      const videoElement = resolveVideoElement(event.target)
      if (videoElement) {
        event.preventDefault()
        event.stopPropagation()
        updateVideoEditorSelection(videoElement)
        updateLinkEditorSelection(null)
        updateImageEditorSelection(null)
        return
      }

      // Then check for link element
      const linkElement = resolveLinkableElement(event.target)
      if (linkElement) {
        event.preventDefault()
        updateLinkEditorSelection(linkElement)
        updateVideoEditorSelection(null)
        updateImageEditorSelection(null)
      } else {
        updateLinkEditorSelection(null)
        updateVideoEditorSelection(null)
        updateImageEditorSelection(null)
      }
    }

    const handleFocusIn = (event: FocusEvent) => {
      const imageElement = resolveImageElement(event.target)
      if (imageElement) {
        updateImageEditorSelection(imageElement)
        return
      }

      const videoElement = resolveVideoElement(event.target)
      if (videoElement) {
        updateVideoEditorSelection(videoElement)
        return
      }

      const linkElement = resolveLinkableElement(event.target)
      if (linkElement) {
        updateLinkEditorSelection(linkElement)
      }
    }

    const handleDragOver = (event: DragEvent) => {
      const imageElement = resolveImageElement(event.target)
      if (imageElement && imageElement === imageEditorTarget) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    const handleDrop = (event: DragEvent) => {
      const imageElement = resolveImageElement(event.target)
      // Allow dropping on any image, not just the selected one
      if (imageElement) {
        event.preventDefault()
        event.stopPropagation()

        // Select the image if not already selected
        if (imageElement !== imageEditorTarget) {
          updateImageEditorSelection(imageElement)
        }

        const file = event.dataTransfer?.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
          showImageMessage("Please drop an image file", "error")
          return
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          showImageMessage("Image size should be less than 10MB", "error")
          return
        }

        // Save scroll position
        const iframeWindow = getIframeWindow(iframeRef.current)
        let scrollX = 0
        let scrollY = 0
        if (iframeWindow) {
          scrollX = iframeWindow.scrollX || iframeWindow.pageXOffset || 0
          scrollY = iframeWindow.scrollY || iframeWindow.pageYOffset || 0
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          const wasSelected = imageElement === imageEditorTarget
          
          imageElement.src = result
          
          // Re-apply selection attribute after src change
          if (wasSelected) {
            setTimeout(() => {
              const doc = getIframeDocument(iframeRef.current)
              if (doc && doc.body.contains(imageElement)) {
                imageElement.setAttribute(IMAGE_TARGET_ATTRIBUTE, "true")
                highlightedImageRef.current = imageElement
                // Ensure selection state is maintained
                setImageEditorTarget(imageElement)
              }
            }, 10)
          }
          
          // Only persist HTML without reloading iframe (don't update displayHtml in edit mode)
          const updated = readIframeHtml()
          if (updated && onHtmlChange) {
            skipNextHtmlSync.current = true
            onHtmlChange(updated)
          }
          
          showImageMessage("Image updated", "success")
          
          // Restore scroll position
          if (iframeWindow) {
            setTimeout(() => {
              iframeWindow.scrollTo(scrollX, scrollY)
            }, 0)
          }
          
          // Keep selection active so user can continue editing other images
        }
        reader.onerror = () => {
          showImageMessage("Failed to read image file", "error")
        }
        reader.readAsDataURL(file)
      }
    }

    // Prevent default link behavior in edit mode
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target && (target.tagName === "A" || target.closest("a"))) {
        const imageElement = resolveImageElement(event.target)
        const videoElement = resolveVideoElement(event.target)
        // Only prevent default if it's not an image or video we're editing
        if (!imageElement && !videoElement) {
          event.preventDefault()
          event.stopPropagation()
        }
      }
    }

    doc.addEventListener("keydown", handleKeyDown)
    doc.addEventListener("click", handleClick, true)
    doc.addEventListener("click", handleLinkClick, true)
    doc.addEventListener("focusin", handleFocusIn)
    doc.addEventListener("dragover", handleDragOver, true)
    doc.addEventListener("drop", handleDrop, true)

    return () => {
      cleanupMarkers()

      doc.removeEventListener("keydown", handleKeyDown)
      doc.removeEventListener("click", handleClick, true)
      doc.removeEventListener("click", handleLinkClick, true)
      doc.removeEventListener("focusin", handleFocusIn)
      doc.removeEventListener("dragover", handleDragOver, true)
      doc.removeEventListener("drop", handleDrop, true)

      // Remove all tooltips
      doc.querySelectorAll(".mu-hover-tooltip").forEach((tooltip) => tooltip.remove())
      doc.querySelectorAll("[data-mu-tooltip-added]").forEach((el) => el.removeAttribute("data-mu-tooltip-added"))

      updateImageEditorSelection(null)

      doc.body.removeAttribute("contenteditable")
      doc.body.removeAttribute("data-mu-edit-mode")

      if (previousTabIndex === null) {
        doc.body.removeAttribute("tabindex")
      } else {
        doc.body.setAttribute("tabindex", previousTabIndex)
      }

      // Re-setup play button handlers when exiting edit mode
      setTimeout(() => {
        setupPlayButtonHandlers(doc)
      }, 100)
    }
  }, [isEditMode, updateLinkEditorSelection, updateVideoEditorSelection, updateImageEditorSelection])

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

  const handleLinkInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLinkEditorValue(event.target.value)
  }

  const handleApplyLink = () => {
    const targetEntry = getResolvedLinkTarget()
    if (!targetEntry) {
      showLinkMessage("Select a button or link first", "error")
      return
    }

    const sanitized = sanitizeLinkUrl(linkEditorValue)
    if (!sanitized) {
      showLinkMessage("Enter a valid URL or path", "error")
      return
    }

    if (targetEntry.tag === "a") {
      targetEntry.element.setAttribute("href", sanitized)
      if (isExternalLink(sanitized)) {
        targetEntry.element.setAttribute("target", "_blank")
        targetEntry.element.setAttribute("rel", "noopener noreferrer")
      } else {
        targetEntry.element.removeAttribute("target")
        targetEntry.element.removeAttribute("rel")
      }
    } else {
      targetEntry.element.setAttribute(BUTTON_LINK_ATTRIBUTE, sanitized)
      targetEntry.element.setAttribute("onclick", `window.location.href='${escapeSingleQuotes(sanitized)}'`)
    }

    setLinkEditorValue(sanitized)
    showLinkMessage("Link updated", "success")
  }

  const handleRemoveLink = () => {
    const targetEntry = getResolvedLinkTarget()
    if (!targetEntry) {
      showLinkMessage("Select a button or link first", "error")
      return
    }

    const hadLink =
      targetEntry.tag === "a"
        ? targetEntry.element.hasAttribute("href")
        : Boolean(targetEntry.element.getAttribute(BUTTON_LINK_ATTRIBUTE))

    if (!hadLink) {
      showLinkMessage("Nothing to remove", "info")
      return
    }

    if (targetEntry.tag === "a") {
      targetEntry.element.removeAttribute("href")
      targetEntry.element.removeAttribute("target")
      targetEntry.element.removeAttribute("rel")
    } else {
      const previousLink = targetEntry.element.getAttribute(BUTTON_LINK_ATTRIBUTE)
      targetEntry.element.removeAttribute(BUTTON_LINK_ATTRIBUTE)
      if (previousLink) {
        const onclickValue = targetEntry.element.getAttribute("onclick")
        if (onclickValue && onclickValue.includes("window.location.href")) {
          targetEntry.element.removeAttribute("onclick")
        }
      }
    }

    setLinkEditorValue("")
    showLinkMessage("Link removed", "success")
  }

  const handleVideoYoutubeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVideoEditorYoutube(event.target.value)
  }

  const handleVideoCdnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVideoEditorCdn(event.target.value)
  }

  const handleVideoLinkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVideoEditorLink(event.target.value)
  }

  const handleApplyVideo = () => {
    const target = getResolvedVideoTarget()
    if (!target) {
      showVideoMessage("Select a play button first", "error")
      return
    }

    const youtubeValue = videoEditorYoutube.trim()
    const cdnValue = videoEditorCdn.trim()
    const linkValue = videoEditorLink.trim()

    if (!youtubeValue && !cdnValue && !linkValue) {
      showVideoMessage("Enter at least one video link or navigation link", "error")
      return
    }

    // Validate YouTube URL if provided
    if (youtubeValue) {
      if (!isYouTubeUrl(youtubeValue) && !extractYouTubeId(youtubeValue)) {
        showVideoMessage("Enter a valid YouTube URL or video ID", "error")
        return
      }
    }

    // Validate CDN URL if provided
    if (cdnValue) {
      if (!isCdnUrl(cdnValue) && !cdnValue.startsWith("http")) {
        showVideoMessage("Enter a valid video URL", "error")
        return
      }
    }

    if (youtubeValue) {
      target.setAttribute(VIDEO_YOUTUBE_ATTRIBUTE, youtubeValue)
    } else {
      target.removeAttribute(VIDEO_YOUTUBE_ATTRIBUTE)
    }

    if (cdnValue) {
      target.setAttribute(VIDEO_CDN_ATTRIBUTE, cdnValue)
    } else {
      target.removeAttribute(VIDEO_CDN_ATTRIBUTE)
    }

    // Apply regular link if provided
    const tagName = target.tagName?.toLowerCase()

    if (linkValue) {
      const sanitized = sanitizeLinkUrl(linkValue)
      if (sanitized) {
        if (tagName === "a") {
          target.setAttribute("href", sanitized)
          if (isExternalLink(sanitized)) {
            target.setAttribute("target", "_blank")
            target.setAttribute("rel", "noopener noreferrer")
          } else {
            target.removeAttribute("target")
            target.removeAttribute("rel")
          }
        } else {
          target.setAttribute(BUTTON_LINK_ATTRIBUTE, sanitized)
          target.setAttribute("onclick", `window.location.href='${escapeSingleQuotes(sanitized)}'`)
        }
      }
    } else {
      // Remove link if empty
      if (tagName === "a") {
        target.removeAttribute("href")
        target.removeAttribute("target")
        target.removeAttribute("rel")
      } else {
        const previousLink = target.getAttribute(BUTTON_LINK_ATTRIBUTE)
        target.removeAttribute(BUTTON_LINK_ATTRIBUTE)
        if (previousLink) {
          const onclickValue = target.getAttribute("onclick")
          if (onclickValue && onclickValue.includes("window.location.href")) {
            target.removeAttribute("onclick")
          }
        }
      }
    }

    // Re-setup handlers after attribute change
    const doc = getIframeDocument(iframeRef.current)
    if (doc) {
      setTimeout(() => {
        setupPlayButtonHandlers(doc)
      }, 50)
    }

    showVideoMessage("Links updated", "success")
  }

  const handleRemoveVideo = () => {
    const target = getResolvedVideoTarget()
    if (!target) {
      showVideoMessage("Select a play button first", "error")
      return
    }

    const hadYoutube = target.hasAttribute(VIDEO_YOUTUBE_ATTRIBUTE)
    const hadCdn = target.hasAttribute(VIDEO_CDN_ATTRIBUTE)

    if (!hadYoutube && !hadCdn) {
      showVideoMessage("Nothing to remove", "info")
      return
    }

    target.removeAttribute(VIDEO_YOUTUBE_ATTRIBUTE)
    target.removeAttribute(VIDEO_CDN_ATTRIBUTE)

    setVideoEditorYoutube("")
    setVideoEditorCdn("")
    showVideoMessage("Video links removed", "success")
  }

  const handleRemoveVideoLink = () => {
    const target = getResolvedVideoTarget()
    if (!target) {
      showVideoMessage("Select a play button first", "error")
      return
    }

    const tagName = target.tagName?.toLowerCase()
    const hadLink =
      tagName === "a"
        ? target.hasAttribute("href")
        : Boolean(target.getAttribute(BUTTON_LINK_ATTRIBUTE))

    if (!hadLink) {
      showVideoMessage("No link to remove", "info")
      return
    }

    if (tagName === "a") {
      target.removeAttribute("href")
      target.removeAttribute("target")
      target.removeAttribute("rel")
    } else {
      const previousLink = target.getAttribute(BUTTON_LINK_ATTRIBUTE)
      target.removeAttribute(BUTTON_LINK_ATTRIBUTE)
      if (previousLink) {
        const onclickValue = target.getAttribute("onclick")
        if (onclickValue && onclickValue.includes("window.location.href")) {
          target.removeAttribute("onclick")
        }
      }
    }

    setVideoEditorLink("")
    showVideoMessage("Link removed", "success")
  }

  const handleImageFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showImageMessage("Please select an image file", "error")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showImageMessage("Image size should be less than 10MB", "error")
      return
    }

    // Save scroll position before updating
    const iframeWindow = getIframeWindow(iframeRef.current)
    let scrollX = 0
    let scrollY = 0
    if (iframeWindow) {
      scrollX = iframeWindow.scrollX || iframeWindow.pageXOffset || 0
      scrollY = iframeWindow.scrollY || iframeWindow.pageYOffset || 0
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const target = getResolvedImageTarget()
      if (target) {
        // Save reference to maintain selection
        const wasSelected = target === imageEditorTarget
        
        target.src = result
        
        // Re-apply selection attribute after src change
        if (wasSelected) {
          setTimeout(() => {
            const doc = getIframeDocument(iframeRef.current)
            if (doc && doc.body.contains(target)) {
              target.setAttribute(IMAGE_TARGET_ATTRIBUTE, "true")
              highlightedImageRef.current = target
              // Ensure selection state is maintained
              setImageEditorTarget(target)
            }
          }, 10)
        }
        
        // Only persist HTML without reloading iframe (don't update displayHtml in edit mode)
        const updated = readIframeHtml()
        if (updated && onHtmlChange) {
          skipNextHtmlSync.current = true
          onHtmlChange(updated)
        }
        
        showImageMessage("Image updated", "success")
        
        // Restore scroll position
        if (iframeWindow) {
          setTimeout(() => {
            iframeWindow.scrollTo(scrollX, scrollY)
          }, 0)
        }
        
        // Keep selection active so user can continue editing other images
      }
    }
    reader.onerror = () => {
      showImageMessage("Failed to read image file", "error")
    }
    reader.readAsDataURL(file)

    // Reset input
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = ""
    }
  }

  const handleImageUrlChange = (url: string) => {
    const target = getResolvedImageTarget()
    if (!target) {
      showImageMessage("Select an image first", "error")
      return
    }

    if (!url.trim()) {
      showImageMessage("Enter a valid image URL", "error")
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      // Not a full URL, might be a relative path or data URL
      if (!url.startsWith("/") && !url.startsWith("data:image/")) {
        showImageMessage("Enter a valid image URL or path", "error")
        return
      }
    }

    // Save scroll position before updating
    const iframeWindow = getIframeWindow(iframeRef.current)
    let scrollX = 0
    let scrollY = 0
    if (iframeWindow) {
      scrollX = iframeWindow.scrollX || iframeWindow.pageXOffset || 0
      scrollY = iframeWindow.scrollY || iframeWindow.pageYOffset || 0
    }

    const wasSelected = target === imageEditorTarget
    
    target.src = url
    
    // Re-apply selection attribute after src change
    if (wasSelected) {
      setTimeout(() => {
        const doc = getIframeDocument(iframeRef.current)
        if (doc && doc.body.contains(target)) {
          target.setAttribute(IMAGE_TARGET_ATTRIBUTE, "true")
          highlightedImageRef.current = target
          // Ensure selection state is maintained
          setImageEditorTarget(target)
        }
      }, 10)
    }
    
    // Only persist HTML without reloading iframe (don't update displayHtml in edit mode)
    const updated = readIframeHtml()
    if (updated && onHtmlChange) {
      skipNextHtmlSync.current = true
      onHtmlChange(updated)
    }
    
    showImageMessage("Image updated", "success")
    
    // Restore scroll position
    if (iframeWindow) {
      setTimeout(() => {
        iframeWindow.scrollTo(scrollX, scrollY)
      }, 0)
    }
  }


  const handleToggleEditMode = () => {
    if (!displayHtml || isLoading || !iframeReady) {
      return
    }

    if (isEditMode) {
      updateLinkEditorSelection(null)
      persistEditedHtml()
      setIsEditMode(false)
      return
    }

    updateLinkEditorSelection(null)
    setIsEditMode(true)
  }

  const [copied, setCopied] = useState(false)
  const activeLinkDescriptor = linkEditorTarget ? (linkEditorTarget.tag === "a" ? "anchor" : "button") : null

  const handleCopyCode = async () => {
    if (!displayHtml) return

    let htmlToCopy = displayHtml
    if (isEditMode) {
      const updated = persistEditedHtml()
      if (updated) {
        htmlToCopy = updated
      }
    }

    try {
      await navigator.clipboard.writeText(htmlToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
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
        {/* <div className={styles.titleSection}>
          {activeVersionLabel && <span className={styles.versionLabel}>{activeVersionLabel}</span>}
        </div> */}
        <div className={styles.headerActions}>
          <button
            className={styles.secondaryButton}
            onClick={handleCopyCode}
            disabled={!displayHtml || isLoading}
            type="button"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy code
              </>
            )}
          </button>
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
      {isEditMode && (
        <>
          {linkEditorTarget && (
            <div className={styles.linkToolbar}>
              <div className={styles.linkToolbarControls}>
                <input
                  type="text"
                  className={styles.linkInput}
                  placeholder="https://example.com or /contact"
                  value={linkEditorValue}
                  onChange={handleLinkInputChange}
                  disabled={!linkEditorTarget}
                />
                <button
                  className={styles.applyLinkButton}
                  onClick={handleApplyLink}
                  type="button"
                  disabled={!linkEditorTarget || !linkEditorValue.trim()}
                >
                  Save link
                </button>
                <button
                  className={styles.removeLinkButton}
                  onClick={handleRemoveLink}
                  type="button"
                  disabled={!linkEditorTarget}
                >
                  Remove link
                </button>
              </div>
              {linkEditorMessage && (
                <span className={styles.linkToolbarMessage} data-tone={linkEditorTone} aria-live="polite">
                  {linkEditorMessage}
                </span>
              )}
            </div>
          )}
          {videoEditorTarget && (
            <div className={styles.linkToolbar}>
              <div className={styles.linkToolbarTop}>
                <div>
                  <h3 className={styles.linkToolbarTitle}>Edit Video Links</h3>
                  <p className={styles.linkToolbarHint}>Enter YouTube URL, CDN video URL, or regular navigation link</p>
                </div>
                <button
                  className={styles.linkToolbarClearSelection}
                  onClick={() => updateVideoEditorSelection(null)}
                  type="button"
                >
                  Clear selection
                </button>
              </div>
              <div className={styles.linkToolbarControls}>
                <input
                  type="text"
                  className={styles.linkInput}
                  placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...) or Video ID"
                  value={videoEditorYoutube}
                  onChange={handleVideoYoutubeChange}
                  disabled={!videoEditorTarget}
                />
                <input
                  type="text"
                  className={styles.linkInput}
                  placeholder="CDN Video URL (e.g., https://example.com/video.mp4)"
                  value={videoEditorCdn}
                  onChange={handleVideoCdnChange}
                  disabled={!videoEditorTarget}
                />
                <input
                  type="text"
                  className={styles.linkInput}
                  placeholder="Regular Link (e.g., https://example.com or /contact)"
                  value={videoEditorLink}
                  onChange={handleVideoLinkChange}
                  disabled={!videoEditorTarget}
                />
                <button
                  className={styles.applyLinkButton}
                  onClick={handleApplyVideo}
                  type="button"
                  disabled={!videoEditorTarget || (!videoEditorYoutube.trim() && !videoEditorCdn.trim() && !videoEditorLink.trim())}
                >
                  Save
                </button>
                <button
                  className={styles.removeLinkButton}
                  onClick={handleRemoveVideo}
                  type="button"
                  disabled={!videoEditorTarget}
                >
                  Remove video
                </button>
                <button
                  className={styles.removeLinkButton}
                  onClick={handleRemoveVideoLink}
                  type="button"
                  disabled={!videoEditorTarget || !videoEditorLink.trim()}
                >
                  Remove link
                </button>
              </div>
              {videoEditorMessage && (
                <span className={styles.linkToolbarMessage} data-tone={videoEditorTone} aria-live="polite">
                  {videoEditorMessage}
                </span>
              )}
            </div>
          )}
          {imageEditorTarget && (
            <div className={styles.linkToolbar}>
              <div className={styles.linkToolbarTop}>
                <div>
                  <h3 className={styles.linkToolbarTitle}>Edit Image</h3>
                  <p className={styles.linkToolbarHint}>Drag & drop an image, upload a file, or enter an image URL</p>
                </div>
                <button
                  className={styles.linkToolbarClearSelection}
                  onClick={() => updateImageEditorSelection(null)}
                  type="button"
                >
                  Clear selection
                </button>
              </div>
              <div className={styles.linkToolbarControls}>
                <input
                  type="text"
                  className={styles.linkInput}
                  placeholder="Image URL (e.g., https://example.com/image.jpg)"
                  onBlur={(e) => handleImageUrlChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleImageUrlChange(e.currentTarget.value)
                    }
                  }}
                  disabled={!imageEditorTarget}
                />
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className={styles.fileInputHidden}
                  id="image-upload-edit"
                  disabled={!imageEditorTarget}
                />
                <label
                  htmlFor="image-upload-edit"
                  className={styles.applyLinkButton}
                  style={{ cursor: imageEditorTarget ? "pointer" : "not-allowed", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "6px" }}>
                    <path d="M13.3333 6.66667L10 3.33333M10 3.33333L6.66667 6.66667M10 3.33333V13.3333M3.33333 13.3333V15C3.33333 15.442 3.50952 15.866 3.82198 16.1785C4.13445 16.491 4.55841 16.6667 5 16.6667H15C15.4416 16.6667 15.8655 16.491 16.178 16.1785C16.4905 15.866 16.6667 15.442 16.6667 15V13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Upload Image
                </label>
              </div>
              {imageEditorMessage && (
                <span className={styles.linkToolbarMessage} data-tone={imageEditorTone} aria-live="polite">
                  {imageEditorMessage}
                </span>
              )}
            </div>
          )}
        </>
      )}
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
