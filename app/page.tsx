"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PromptInput from "@/components/PromptInput"
import Preview from "@/components/Preview"
import ThemeSelector from "@/components/ThemeSelector"
import { useTheme } from "@/contexts/ThemeContext"
import styles from "./page.module.css"
import tetrStyles from "./page.tetr.module.css"

type PromptVersion = {
  id: string
  prompt: string
  html: string
  createdAt: string
  versionNumber: number
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const formatTimestamp = (isoDate: string) => timestampFormatter.format(new Date(isoDate))

const generateVersionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `version-${Date.now()}`
}

export default function Home() {
  const router = useRouter()
  const { theme } = useTheme()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [generatedHtml, setGeneratedHtml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionCounter, setVersionCounter] = useState(0)
  const [isPreviewEditMode, setIsPreviewEditMode] = useState(false)

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

  const selectedVersion = selectedVersionId ? versions.find((version) => version.id === selectedVersionId) : undefined

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

  const handleGenerate = async (prompt: string, imageData?: string) => {
    setHasGenerated(true)
    setIsLoading(true)
    setError("")
    setCurrentPrompt(prompt)

    const payload: { prompt: string; baseHtml?: string; imageData?: string; theme?: string } = { prompt, theme }
    // Always use the latest version (first in array) as base for conversation flow
    // This ensures version 2 builds on version 1, version 3 builds on version 2, etc.
    // The selected version only affects display, not the base for new generations
    // This creates a continuous conversation where each new prompt edits the previous version
    const latestVersion = versions.length > 0 ? versions[0] : null
    const baseHtmlCandidate = latestVersion?.html ?? generatedHtml
    if (baseHtmlCandidate?.trim()) {
      payload.baseHtml = baseHtmlCandidate
    }
    if (imageData) {
      payload.imageData = imageData
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text)
        throw new Error("Server returned non-JSON response. Check the console for details.")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate webpage")
      }

      setGeneratedHtml(data.html)
      const nextVersionNumber = versionCounter + 1
      setVersionCounter(nextVersionNumber)

      const newVersion: PromptVersion = {
        id: generateVersionId(),
        prompt,
        html: data.html,
        createdAt: new Date().toISOString(),
        versionNumber: nextVersionNumber,
      }

      setVersions((prev) => [newVersion, ...prev])
      setSelectedVersionId(newVersion.id)
    } catch (err: any) {
      console.error("[v0] Error in handleGenerate:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionSelect = (versionId: string) => {
    const version = versions.find((entry) => entry.id === versionId)
    if (!version) {
      return
    }

    setSelectedVersionId(versionId)
    setGeneratedHtml(version.html)
    setCurrentPrompt(version.prompt)
  }

  const handlePreviewHtmlChange = (updatedHtml: string) => {
    setGeneratedHtml(updatedHtml)

    if (selectedVersionId) {
      setVersions((prev) =>
        prev.map((version) => (version.id === selectedVersionId ? { ...version, html: updatedHtml } : version))
      )
    }
  }

  const activeVersionLabel = selectedVersion ? `Version ${selectedVersion.versionNumber}` : undefined

  // Use theme-specific styles
  const currentStyles = theme === "tetr" ? tetrStyles : styles

  if (!hasGenerated) {
    return (
      <main className={currentStyles.aiGenrate}>
        <section className={currentStyles.aiGenrateHero}>
          <div className={currentStyles.container}>
            <div className={currentStyles.aiGenrateHeroContent}>
              <ThemeSelector />
              <div className={currentStyles.mucontentdiv} >
                <div className={currentStyles.muLogoAnimation}>
                  {theme === "tetr" ? (
                    <img loading="lazy" src="https://cdn.tetr.com/assets/ih-images/V2/newTetrLogoBrand.svg" alt="Tetr Logo" />
                  ) : (
                    <img loading="lazy" src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif" alt="MU Logo" />
                  )}
                </div>
                <h1 className={currentStyles.gradientText}> <span> WebStudio </span></h1>
                <p className={currentStyles.aiGenrateSubtitle}>Transform your ideas into stunning pages with the power of AI</p>
              </div>
              <div className={currentStyles.welcomePromptArea}>
                <PromptInput
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  error={error}
                  value={currentPrompt}
                  onPromptChange={setCurrentPrompt}
                  isReadOnly={isPreviewEditMode}
                  variant="hero"
                />
              </div>

              <div className={currentStyles.aiGenrateFeatures}>
                <div className={currentStyles.featureItem}>
                  <div className={currentStyles.featureIcon}>✨</div>
                  <p className={currentStyles.featureText}>AI-Powered Generation</p>
                </div>
                <div className={currentStyles.featureItem}>
                  <div className={currentStyles.featureIcon}>⚡</div>
                  <p className={currentStyles.featureText}>Fast & Efficient</p>
                </div>
                <div className={currentStyles.featureItem}>
                  <div className={currentStyles.featureIcon}>🎨</div>
                  <p className={currentStyles.featureText}>Beautiful Designs</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className={currentStyles.container}>
      <main className={currentStyles.main}>
        <section className={currentStyles.promptSection}>
          <div className={currentStyles.promptSectionInner}>
            {/* <div className={currentStyles.promptHeader}>
              <div>
                <p className={currentStyles.promptEyebrow}>Prompt</p>
                <h2 className={currentStyles.promptTitle}>Describe the page you want to build</h2>
              </div>
            </div> */}

            <div className={currentStyles.historyHeader}>
              <div>
                <p className={currentStyles.promptEyebrow}>History</p>
                {/* <h3 className={currentStyles.historyTitle}>Prompt versions</h3> */}
              </div>
              {selectedVersion && <span className={currentStyles.historyActiveLabel}>Viewing {activeVersionLabel}</span>}
            </div>

            <div className={currentStyles.historyList}>
              {versions.length === 0 ? (
                <div className={currentStyles.historyEmpty}>
                  <p>Each prompt you generate will appear here for quick access.</p>
                </div>
              ) : (
                versions.map((version) => (
                  <button
                    type="button"
                    key={version.id}
                    onClick={() => handleVersionSelect(version.id)}
                    className={`${currentStyles.versionItem} ${selectedVersionId === version.id ? currentStyles.versionItemActive : ""
                      }`}
                  >
                    <div className={currentStyles.versionHeader}>
                      <span className={currentStyles.versionTitle}>Version {version.versionNumber}</span>
                      <span className={currentStyles.versionTimestamp}>{formatTimestamp(version.createdAt)}</span>
                    </div>
                    <p className={currentStyles.versionPrompt}>{version.prompt}</p>
                  </button>
                ))
              )}
            </div>

            <PromptInput
              onGenerate={handleGenerate}
              isLoading={isLoading}
              error={error}
              value={currentPrompt}
              onPromptChange={setCurrentPrompt}
              isReadOnly={isPreviewEditMode}
              variant="sidebar"
            />
          </div>
        </section>

        <section className={currentStyles.previewSection}>
          <Preview
            html={generatedHtml}
            isLoading={isLoading}
            activeVersionLabel={activeVersionLabel}
            onHtmlChange={handlePreviewHtmlChange}
            onEditModeChange={setIsPreviewEditMode}
          />
        </section>
      </main>
    </div>
  )
}
