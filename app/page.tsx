"use client"

import { useState } from "react"
import PromptInput from "@/components/PromptInput"
import Preview from "@/components/Preview"
import styles from "./page.module.css"

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
  const [generatedHtml, setGeneratedHtml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [versions, setVersions] = useState<PromptVersion[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionCounter, setVersionCounter] = useState(0)
  const [isPreviewEditMode, setIsPreviewEditMode] = useState(false)

  const selectedVersion = selectedVersionId ? versions.find((version) => version.id === selectedVersionId) : undefined

  const handleGenerate = async (prompt: string, imageData?: string) => {
    setHasGenerated(true)
    setIsLoading(true)
    setError("")
    setCurrentPrompt(prompt)

    const payload: { prompt: string; baseHtml?: string; imageData?: string } = { prompt }
    // Always use the latest version (first in array) as base, or selected version if available
    // This ensures version 2 builds on version 1, version 3 builds on version 2, etc.
    const latestVersion = versions.length > 0 ? versions[0] : null
    const baseHtmlCandidate = selectedVersion?.html ?? latestVersion?.html ?? generatedHtml
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

  if (!hasGenerated) {
    return (
      <main className={styles.aiGenrate}>
        <section className={styles.aiGenrateHero}>
          <div className={styles.container}>
            <div className={styles.aiGenrateHeroContent}>
              <div>
              <h1 className={styles.gradientText}>MU AI Page Generator</h1>
              <p className={styles.aiGenrateSubtitle}>Transform your ideas into stunning pages with the power of AI</p>
              </div>
              <div className={styles.welcomePromptArea}>
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

              <div className={styles.aiGenrateFeatures}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>✨</div>
                  <p className={styles.featureText}>AI-Powered Generation</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>⚡</div>
                  <p className={styles.featureText}>Fast & Efficient</p>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>🎨</div>
                  <p className={styles.featureText}>Beautiful Designs</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <section className={styles.promptSection}>
          <div className={styles.promptSectionInner}>
            {/* <div className={styles.promptHeader}>
              <div>
                <p className={styles.promptEyebrow}>Prompt</p>
                <h2 className={styles.promptTitle}>Describe the page you want to build</h2>
              </div>
            </div> */}

            <div className={styles.historyHeader}>
              <div>
                <p className={styles.promptEyebrow}>History</p>
                <h3 className={styles.historyTitle}>Prompt versions</h3>
              </div>
              {selectedVersion && <span className={styles.historyActiveLabel}>Viewing {activeVersionLabel}</span>}
            </div>

            <div className={styles.historyList}>
              {versions.length === 0 ? (
                <div className={styles.historyEmpty}>
                  <p>Each prompt you generate will appear here for quick access.</p>
                </div>
              ) : (
                versions.map((version) => (
                  <button
                    type="button"
                    key={version.id}
                    onClick={() => handleVersionSelect(version.id)}
                    className={`${styles.versionItem} ${
                      selectedVersionId === version.id ? styles.versionItemActive : ""
                    }`}
                  >
                    <div className={styles.versionHeader}>
                      <span className={styles.versionTitle}>Version {version.versionNumber}</span>
                      <span className={styles.versionTimestamp}>{formatTimestamp(version.createdAt)}</span>
                    </div>
                    <p className={styles.versionPrompt}>{version.prompt}</p>
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

        <section className={styles.previewSection}>
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
