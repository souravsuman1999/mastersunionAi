"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import styles from "./Preview.module.css"

const DotLottieReact = dynamic(() => import("@lottiefiles/dotlottie-react").then((mod) => mod.DotLottieReact), {
  ssr: false,
})

interface PreviewProps {
  html: string
  isLoading?: boolean
}

export default function Preview({ html, isLoading }: PreviewProps) {
  const [copied, setCopied] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  // Ensure cursor is visible in iframe
  useEffect(() => {
    if (iframeRef.current && html) {
      const iframe = iframeRef.current
      const handleLoad = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            // Inject CSS to ensure cursor is visible
            const style = iframeDoc.createElement("style")
            style.textContent = `
              * {
                cursor: default !important;
              }
              a, button, input, textarea, select, [role="button"], [onclick] {
                cursor: pointer !important;
              }
              input[type="text"], input[type="email"], input[type="password"], textarea {
                cursor: text !important;
              }
            `
            iframeDoc.head.appendChild(style)
          }
        } catch (error) {
          // Cross-origin restrictions might prevent this, which is fine
          console.log("Could not inject cursor styles into iframe:", error)
        }
      }

      iframe.addEventListener("load", handleLoad)
      // Also try immediately in case iframe is already loaded
      if (iframe.contentDocument?.readyState === "complete") {
        handleLoad()
      }

      return () => {
        iframe.removeEventListener("load", handleLoad)
      }
    }
  }, [html])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.logo}>Masters' Union Ai</h1>
          <p className={styles.subtitle}>AI-Powered Webpage Generator</p>
        </div>
        <button className={styles.copyButton} onClick={handleCopy} disabled={!html || isLoading}>
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied!
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
            <p className={styles.loadingSubtext}>Claude is crafting something amazing</p>
          </div>
        ) : html ? (
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            srcDoc={html}
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
