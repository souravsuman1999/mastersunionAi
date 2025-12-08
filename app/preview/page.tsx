"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import styles from "./page.module.css"

type PreviewStatus = "loading" | "ready" | "error"

export default function FullPreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <FullPreviewContent />
    </Suspense>
  )
}

function PreviewFallback() {
  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div className={styles.mulogo}>
          <img
            loading="lazy"
            src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif"
            alt="MU Logo"
          />
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.copyButton} disabled>
            Preparing...
          </button>
          <Link href="/" className={styles.backLink}>
            Back to builder
          </Link>
        </div>
      </header>

      <div className={styles.frameWrapper}>
        <div className={styles.messageCard}>
          <p>Loading preview...</p>
        </div>
      </div>
    </div>
  )
}

function FullPreviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const previewId = searchParams.get("id")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [status, setStatus] = useState<PreviewStatus>("loading")
  const [message, setMessage] = useState("Loading preview...")
  const [html, setHtml] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check authentication on mount
    if (typeof window !== "undefined") {
      const authStatus = localStorage.getItem("mu_auth") === "true"
      if (!authStatus) {
        router.push("/auth")
      } else {
        setIsAuthenticated(true)
        setIsCheckingAuth(false)
      }
    }
  }, [router])

  useEffect(() => {
    // Only load preview if authenticated
    if (!isAuthenticated || isCheckingAuth) return

    if (!previewId) {
      setStatus("error")
      setMessage("Missing preview identifier.")
      return
    }

    try {
      const storedHtml = window.localStorage.getItem(`preview:${previewId}`)
      if (!storedHtml) {
        setStatus("error")
        setMessage("Preview not found or has expired.")
        return
      }

      setHtml(storedHtml)
      setStatus("ready")
    } catch (error) {
      console.error("[full-preview] Unable to load preview", error)
      setStatus("error")
      setMessage("Unable to load preview. Please try again.")
    }

    return () => {
      if (previewId) {
        window.localStorage.removeItem(`preview:${previewId}`)
      }
    }
  }, [previewId, isAuthenticated, isCheckingAuth])

  const handleCopyHtml = async () => {
    if (!html) return
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("[full-preview] copy failed", error)
    }
  }

  // Show loading state while checking authentication
  if (isCheckingAuth || !isAuthenticated) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "#000000",
        color: "#ffffff"
      }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.toolbar}>
        <div  className={styles.mulogo}>
          {/* <p className={styles.eyebrow}>Masters&apos; Union AI</p> */}
          <img loading="lazy" src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif"  alt="MU Logo"></img>
          {/* <h1 className={styles.title}>Full page preview</h1> */}
        </div>
        <div className={styles.toolbarActions}>
          <button
            type="button"
            className={styles.copyButton}
            onClick={handleCopyHtml}
            disabled={status !== "ready" || !html}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy HTML
              </>
            )}
          </button>
          <Link href="/" className={styles.backLink}>
            Back to builder
          </Link>
        </div>
      </header>

      <div className={styles.frameWrapper}>
        {status === "ready" ? (
          <iframe
            className={styles.fullFrame}
            srcDoc={html}
            sandbox="allow-scripts allow-same-origin"
            title="Full Page Preview"
          />
        ) : (
          <div className={styles.messageCard}>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

