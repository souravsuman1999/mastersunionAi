"use client"

import { useState } from "react"
import PromptInput from "@/components/PromptInput"
import Preview from "@/components/Preview"
import styles from "./page.module.css"

export default function Home() {
  const [generatedHtml, setGeneratedHtml] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async (prompt: string) => {
    setHasGenerated(true)
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
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
    } catch (err: any) {
      console.error("[v0] Error in handleGenerate:", err)
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!hasGenerated) {
    return (
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeContent}>
          <h1 className={styles.welcomeTitle}>
            Build something with <span className={styles.brandHighlight}> <br />Masters' Union</span>
          </h1>
          <p className={styles.welcomeSubtitle}>Create webpages by chatting with AI</p>

          <div className={styles.welcomePromptArea}>
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.previewSection}>
          <Preview html={generatedHtml} isLoading={isLoading} />
        </div>

        <div className={styles.promptSection}>
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  )
}
