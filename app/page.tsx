// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import PromptInput from "@/components/PromptInput"
// import Preview from "@/components/Preview"
// import styles from "./page.module.css"

// type PromptVersion = {
//   id: string
//   prompt: string
//   html: string
//   createdAt: string
//   versionNumber: number
// }

// const timestampFormatter = new Intl.DateTimeFormat("en-US", {
//   month: "short",
//   day: "numeric",
//   hour: "numeric",
//   minute: "2-digit",
// })

// const formatTimestamp = (isoDate: string) => timestampFormatter.format(new Date(isoDate))

// const generateVersionId = () => {
//   if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
//     return crypto.randomUUID()
//   }
//   return `version-${Date.now()}`
// }

// export default function Home() {
//   const router = useRouter()
//   const [isAuthenticated, setIsAuthenticated] = useState(false)
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true)
//   const [generatedHtml, setGeneratedHtml] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const [hasGenerated, setHasGenerated] = useState(false)
//   const [currentPrompt, setCurrentPrompt] = useState("")
//   const [versions, setVersions] = useState<PromptVersion[]>([])
//   const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
//   const [versionCounter, setVersionCounter] = useState(0)
//   const [isPreviewEditMode, setIsPreviewEditMode] = useState(false)

//   useEffect(() => {
//     // Check authentication on mount
//     if (typeof window !== "undefined") {
//       const authStatus = localStorage.getItem("mu_auth") === "true"
//       if (!authStatus) {
//         router.push("/auth")
//       } else {
//         setIsAuthenticated(true)
//         setIsCheckingAuth(false)
//       }
//     }
//   }, [router])

//   const selectedVersion = selectedVersionId ? versions.find((version) => version.id === selectedVersionId) : undefined

//   // Show loading state while checking authentication
//   if (isCheckingAuth || !isAuthenticated) {
//     return (
//       <div style={{ 
//         minHeight: "100vh", 
//         display: "flex", 
//         alignItems: "center", 
//         justifyContent: "center",
//         background: "#000000",
//         color: "#ffffff"
//       }}>
//         <p>Loading...</p>
//       </div>
//     )
//   }

//   const handleGenerate = async (prompt: string, imageData?: string) => {
//     setHasGenerated(true)
//     setIsLoading(true)
//     setError("")
//     setCurrentPrompt(prompt)

//     const payload: { prompt: string; baseHtml?: string; imageData?: string } = { prompt }
//     // Always use the latest version (first in array) as base for conversation flow
//     // This ensures version 2 builds on version 1, version 3 builds on version 2, etc.
//     // The selected version only affects display, not the base for new generations
//     // This creates a continuous conversation where each new prompt edits the previous version
//     const latestVersion = versions.length > 0 ? versions[0] : null
//     const baseHtmlCandidate = latestVersion?.html ?? generatedHtml
//     if (baseHtmlCandidate?.trim()) {
//       payload.baseHtml = baseHtmlCandidate
//     }
//     if (imageData) {
//       payload.imageData = imageData
//     }

//     try {
//       const response = await fetch("/api/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       })

//       const contentType = response.headers.get("content-type")
//       if (!contentType || !contentType.includes("application/json")) {
//         const text = await response.text()
//         console.error("[v0] Non-JSON response:", text)
//         throw new Error("Server returned non-JSON response. Check the console for details.")
//       }

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to generate webpage")
//       }

//       setGeneratedHtml(data.html)
//       const nextVersionNumber = versionCounter + 1
//       setVersionCounter(nextVersionNumber)

//       const newVersion: PromptVersion = {
//         id: generateVersionId(),
//         prompt,
//         html: data.html,
//         createdAt: new Date().toISOString(),
//         versionNumber: nextVersionNumber,
//       }

//       setVersions((prev) => [newVersion, ...prev])
//       setSelectedVersionId(newVersion.id)
//     } catch (err: any) {
//       console.error("[v0] Error in handleGenerate:", err)
//       setError(err.message || "An error occurred")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleVersionSelect = (versionId: string) => {
//     const version = versions.find((entry) => entry.id === versionId)
//     if (!version) {
//       return
//     }

//     setSelectedVersionId(versionId)
//     setGeneratedHtml(version.html)
//     setCurrentPrompt(version.prompt)
//   }

//   const handlePreviewHtmlChange = (updatedHtml: string) => {
//     setGeneratedHtml(updatedHtml)

//     if (selectedVersionId) {
//       setVersions((prev) =>
//         prev.map((version) => (version.id === selectedVersionId ? { ...version, html: updatedHtml } : version))
//       )
//     }
//   }

//   const activeVersionLabel = selectedVersion ? `Version ${selectedVersion.versionNumber}` : undefined

//   if (!hasGenerated) {
//     return (
//       <main className={styles.aiGenrate}>
//         <section className={styles.aiGenrateHero}>
//           <div className={styles.container}>
//             <div className={styles.aiGenrateHeroContent}>
//               <div className={styles.mucontentdiv} >
//                 <div className={styles.muLogoAnimation}>
//                   <img loading="lazy" src="https://files.mastersunion.link/resources/animateds/logoanimationblack.gif" alt="MU Logo" />
//                 </div>
//                 <h1 className={styles.gradientText}> <span> WebStudio </span></h1>
//                 <p className={styles.aiGenrateSubtitle}>Transform your ideas into stunning pages with the power of AI</p>
//               </div>
//               <div className={styles.welcomePromptArea}>
//                 <PromptInput
//                   onGenerate={handleGenerate}
//                   isLoading={isLoading}
//                   error={error}
//                   value={currentPrompt}
//                   onPromptChange={setCurrentPrompt}
//                   isReadOnly={isPreviewEditMode}
//                   variant="hero"
//                 />
//               </div>

//               <div className={styles.aiGenrateFeatures}>
//                 <div className={styles.featureItem}>
//                   <div className={styles.featureIcon}>✨</div>
//                   <p className={styles.featureText}>AI-Powered Generation</p>
//                 </div>
//                 <div className={styles.featureItem}>
//                   <div className={styles.featureIcon}>⚡</div>
//                   <p className={styles.featureText}>Fast & Efficient</p>
//                 </div>
//                 <div className={styles.featureItem}>
//                   <div className={styles.featureIcon}>🎨</div>
//                   <p className={styles.featureText}>Beautiful Designs</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     )
//   }

//   return (
//     <div className={styles.container}>
//       <main className={styles.main}>
//         <section className={styles.promptSection}>
//           <div className={styles.promptSectionInner}>
//             {/* <div className={styles.promptHeader}>
//               <div>
//                 <p className={styles.promptEyebrow}>Prompt</p>
//                 <h2 className={styles.promptTitle}>Describe the page you want to build</h2>
//               </div>
//             </div> */}

//             <div className={styles.historyHeader}>
//               <div>
//                 <p className={styles.promptEyebrow}>History</p>
//                 {/* <h3 className={styles.historyTitle}>Prompt versions</h3> */}
//               </div>
//               {selectedVersion && <span className={styles.historyActiveLabel}>Viewing {activeVersionLabel}</span>}
//             </div>

//             <div className={styles.historyList}>
//               {versions.length === 0 ? (
//                 <div className={styles.historyEmpty}>
//                   <p>Each prompt you generate will appear here for quick access.</p>
//                 </div>
//               ) : (
//                 versions.map((version) => (
//                   <button
//                     type="button"
//                     key={version.id}
//                     onClick={() => handleVersionSelect(version.id)}
//                     className={`${styles.versionItem} ${selectedVersionId === version.id ? styles.versionItemActive : ""
//                       }`}
//                   >
//                     <div className={styles.versionHeader}>
//                       <span className={styles.versionTitle}>Version {version.versionNumber}</span>
//                       <span className={styles.versionTimestamp}>{formatTimestamp(version.createdAt)}</span>
//                     </div>
//                     <p className={styles.versionPrompt}>{version.prompt}</p>
//                   </button>
//                 ))
//               )}
//             </div>

//             <PromptInput
//               onGenerate={handleGenerate}
//               isLoading={isLoading}
//               error={error}
//               value={currentPrompt}
//               onPromptChange={setCurrentPrompt}
//               isReadOnly={isPreviewEditMode}
//               variant="sidebar"
//             />
//           </div>
//         </section>

//         <section className={styles.previewSection}>
//           <Preview
//             html={generatedHtml}
//             isLoading={isLoading}
//             activeVersionLabel={activeVersionLabel}
//             onHtmlChange={handlePreviewHtmlChange}
//             onEditModeChange={setIsPreviewEditMode}
//           />
//         </section>
//       </main>
//     </div>
//   )
// }



"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import PromptInput from "@/components/PromptInput"
import Preview from "@/components/Preview"
import OutputSectionsPanel from "@/components/OutputSectionsPanel"
import PricingModal from "@/components/PricingModal"
import { versionApiUrl } from "@/lib/versionApi"
import styles from "./page.module.css"

type PromptVersion = {
  _id?: string
  id?: string
  prompt: string
  html: string
  createdAt: string
  versionNumber: number
  theme?: "mastersunion" | "tetr" | "free"
  htmlHistory?: string[]
  currentIndex?: number
}

function getVersionId(v: PromptVersion): string {
  return v._id ?? v.id ?? ""
}

// Undo only when currentIndex > 0; redo only when currentIndex < htmlHistory.length - 1
function canUndoFromHistory(_length: number, index: number): boolean {
  return index > 0
}
function canRedoFromHistory(length: number, index: number): boolean {
  return index < length - 1
}

function normalizeVersionFromApi(raw: unknown): PromptVersion {
  const r = raw as Record<string, unknown>
  const idObj = r._id as string | { $oid?: string; oid?: string } | undefined
  const idStr =
    typeof idObj === "string"
      ? idObj
      : idObj && typeof idObj === "object"
        ? (idObj.$oid ?? idObj.oid ?? "")
        : (r.id as string) ?? ""
  const dateObj = r.createdAt as string | { $date?: string } | undefined
  const createdAtStr =
    typeof dateObj === "string" ? dateObj : dateObj?.$date ?? new Date().toISOString()
  const hist = Array.isArray(r.htmlHistory) ? (r.htmlHistory as string[]) : []
  const idx = Math.min(Math.max(0, Number(r.currentIndex) ?? 0), Math.max(0, hist.length - 1))
  const htmlFromHistory = hist[idx] ?? hist[0] ?? ""
  const html = (r.html as string)?.trim() ? (r.html as string) : htmlFromHistory
  const hasNewSchema = hist.length > 0
  return {
    _id: idStr,
    prompt: (r.prompt as string) ?? "",
    html,
    createdAt: createdAtStr,
    versionNumber: Number(r.versionNumber) ?? 0,
    theme: r.theme as PromptVersion["theme"],
    htmlHistory: hasNewSchema ? hist : [html],
    currentIndex: hasNewSchema ? idx : 0,
  }
}

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

const formatTimestamp = (isoDate: string) => timestampFormatter.format(new Date(isoDate))

export default function Home() {
  const router = useRouter()
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
  const [hasRestoredState, setHasRestoredState] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<"mastersunion" | "tetr" | "free">("free")
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const editSessionHtmlRef = useRef<string | null>(null)
  const hasSavedThisEditSessionRef = useRef(false)
  const [localVersionHistory, setLocalVersionHistory] = useState<Record<string, { history: string[]; index: number }>>({})

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("mu_auth") === "true";
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);


  useEffect(() => {
  if (!isAuthenticated || hasRestoredState) return;

  const storedVersionId = localStorage.getItem("ws_selectedVersionId");
  const storedHtml = localStorage.getItem("ws_generatedHtml");
  const storedPrompt = localStorage.getItem("ws_currentPrompt");
  const storedCounter = localStorage.getItem("ws_versionCounter");
  const storedHasGenerated = localStorage.getItem("ws_hasGenerated");

  if (storedVersionId) setSelectedVersionId(storedVersionId);
  // Only restore HTML from localStorage as a fallback (small HTML only)
  // Large HTML will be restored from database versions in the fetchHistory effect
  if (storedHtml) {
    try {
      setGeneratedHtml(storedHtml);
      setHasGenerated(storedHasGenerated === "true");
    } catch (error) {
      console.warn("Error restoring HTML from localStorage:", error);
    }
  }
  if (storedPrompt) setCurrentPrompt(storedPrompt);
  if (storedCounter) setVersionCounter(parseInt(storedCounter, 10));

  setHasRestoredState(true);
}, [isAuthenticated, hasRestoredState]);







  // 📌 Fetch saved version history from DB
  useEffect(() => {
  if (!isAuthenticated || !hasRestoredState) return;

  const email = localStorage.getItem("mu_email");
  if (!email) return;

  const fetchHistory = async () => {
    try {
      const res = await fetch(versionApiUrl(`/api/getVersions/${encodeURIComponent(email)}`));
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const list = (data.data as unknown[]).map(normalizeVersionFromApi);
        setVersions(list);
        const storedVersionId = localStorage.getItem("ws_selectedVersionId");
        if (list.length > 0) {
          setVersionCounter(list[0].versionNumber ?? 0);
          setSelectedVersionId(getVersionId(list[0]) || null);
        }
        if (storedVersionId && list.length > 0) {
          const versionToRestore = list.find((v) => getVersionId(v) === storedVersionId);
          if (versionToRestore) {
            setGeneratedHtml(versionToRestore.html);
            setHasGenerated(true);
            if (versionToRestore.theme) setSelectedTheme(versionToRestore.theme);
            const hist = versionToRestore.htmlHistory ?? [];
            const idx = versionToRestore.currentIndex ?? 0;
            setCanUndo(canUndoFromHistory(hist.length, idx));
            setCanRedo(canRedoFromHistory(hist.length, idx));
            setSelectedVersionId(getVersionId(versionToRestore) || null);
          }
        }
      }
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  fetchHistory();
}, [isAuthenticated, hasRestoredState]);


useEffect(() => {
  if (!isAuthenticated) return;

  try {
    localStorage.setItem("ws_selectedVersionId", selectedVersionId || "");
    localStorage.setItem("ws_currentPrompt", currentPrompt);
    localStorage.setItem("ws_versionCounter", versionCounter.toString());
    localStorage.setItem("ws_hasGenerated", hasGenerated.toString());
    
    // Only store HTML in localStorage if it's small enough (< 2MB to be safe)
    // Large HTML with base64 images should be retrieved from database instead
    const htmlSize = new Blob([generatedHtml]).size;
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (htmlSize < maxSize) {
      localStorage.setItem("ws_generatedHtml", generatedHtml);
    } else {
      // Remove HTML from localStorage if it exists and is too large
      localStorage.removeItem("ws_generatedHtml");
    }
  } catch (error: any) {
    // Handle quota exceeded errors gracefully
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn("localStorage quota exceeded, skipping HTML storage. Data will be restored from database.");
      // Remove HTML from localStorage to free up space
      try {
        localStorage.removeItem("ws_generatedHtml");
      } catch (e) {
        // Ignore errors when trying to remove
      }
    } else {
      console.error("Error saving to localStorage:", error);
    }
  }
}, [
  isAuthenticated,
  selectedVersionId,
  generatedHtml,
  currentPrompt,
  versionCounter,
  hasGenerated
]);

  const persistEditedHtml = useCallback(async (versionId: string, html: string) => {
    try {
      const res = await fetch(versionApiUrl("/api/saveEditedHtml"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, html }),
      })
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return
      }
      const data = await res.json()
      if (data.success && data.data) {
        const d = data.data
        const hist = Array.isArray(d.htmlHistory) ? d.htmlHistory : []
        const idx = Math.min(Number(d.currentIndex) ?? 0, Math.max(0, hist.length - 1))
        const currentHtml = d.html ?? hist[idx] ?? hist[0] ?? ""
        setCanUndo(canUndoFromHistory(hist.length, idx))
        setCanRedo(canRedoFromHistory(hist.length, idx))
        setVersions((prev) =>
          prev.map((v) =>
            getVersionId(v) === versionId ? { ...v, html: currentHtml, htmlHistory: hist, currentIndex: idx } : v
          )
        )
      }
    } catch {
      // Network error, CORS, or server down - keep local state; no need to surface to user
    }
  }, [])

  const handleUndo = useCallback(async () => {
    const versionId = selectedVersionId ?? (versions.length > 0 ? getVersionId(versions[0]) : null)
    if (!versionId) return
    const isTemp = versionId.startsWith("temp-")
    if (isTemp) {
      const cur = localVersionHistory[versionId]
      if (!cur || cur.index <= 0) return
      const newIndex = cur.index - 1
      const html = cur.history[newIndex]
      setLocalVersionHistory((prev) => ({ ...prev, [versionId]: { ...cur, index: newIndex } }))
      setGeneratedHtml(html)
      setCanUndo(canUndoFromHistory(cur.history.length, newIndex))
      setCanRedo(canRedoFromHistory(cur.history.length, newIndex))
      setVersions((prev) => prev.map((v) => (getVersionId(v) === versionId ? { ...v, html } : v)))
      return
    }
    const v = versions.find((x) => getVersionId(x) === versionId)
    const hist = v?.htmlHistory ?? []
    const idx = v?.currentIndex ?? 0
    if (idx <= 0) return
    try {
      const res = await fetch(versionApiUrl("/api/undoHtml"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      })
      if (!res.headers.get("content-type")?.includes("application/json")) return
      const data = await res.json()
      if (data.success && data.html !== undefined) {
        const newIdx = typeof data.currentIndex === "number" ? data.currentIndex : Math.max(0, idx - 1)
        setGeneratedHtml(data.html)
        setCanUndo(typeof data.canUndo === "boolean" ? data.canUndo : canUndoFromHistory(hist.length, newIdx))
        setCanRedo(typeof data.canRedo === "boolean" ? data.canRedo : canRedoFromHistory(hist.length, newIdx))
        setVersions((prev) => prev.map((v) => (getVersionId(v) === versionId ? { ...v, html: data.html, currentIndex: newIdx } : v)))
      }
    } catch {
      // Network/CORS or server down
    }
  }, [selectedVersionId, versions, localVersionHistory])

  const handleRedo = useCallback(async () => {
    const versionId = selectedVersionId ?? (versions.length > 0 ? getVersionId(versions[0]) : null)
    if (!versionId) return
    const isTemp = versionId.startsWith("temp-")
    if (isTemp) {
      const cur = localVersionHistory[versionId]
      if (!cur || cur.index >= cur.history.length - 1) return
      const newIndex = cur.index + 1
      const html = cur.history[newIndex]
      setLocalVersionHistory((prev) => ({ ...prev, [versionId]: { ...cur, index: newIndex } }))
      setGeneratedHtml(html)
      setCanUndo(canUndoFromHistory(cur.history.length, newIndex))
      setCanRedo(canRedoFromHistory(cur.history.length, newIndex))
      setVersions((prev) => prev.map((v) => (getVersionId(v) === versionId ? { ...v, html } : v)))
      return
    }
    const v = versions.find((x) => getVersionId(x) === versionId)
    const hist = v?.htmlHistory ?? []
    const idx = v?.currentIndex ?? 0
    if (hist.length === 0 || idx >= hist.length - 1) return
    try {
      const res = await fetch(versionApiUrl("/api/redoHtml"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId }),
      })
      if (!res.headers.get("content-type")?.includes("application/json")) return
      const data = await res.json()
      if (data.success && data.html !== undefined) {
        const newIdx = typeof data.currentIndex === "number" ? data.currentIndex : Math.min(hist.length - 1, idx + 1)
        setGeneratedHtml(data.html)
        setCanUndo(typeof data.canUndo === "boolean" ? data.canUndo : canUndoFromHistory(hist.length, newIdx))
        setCanRedo(typeof data.canRedo === "boolean" ? data.canRedo : canRedoFromHistory(hist.length, newIdx))
        setVersions((prev) => prev.map((x) => (getVersionId(x) === versionId ? { ...x, html: data.html, currentIndex: newIdx } : x)))
      }
    } catch {
      // Network/CORS or server down
    }
  }, [selectedVersionId, versions, localVersionHistory])

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

    const payload: { prompt: string; baseHtml?: string; imageData?: string; theme?: "mastersunion" | "tetr" } = { prompt, theme: selectedTheme }
    const latestVersion = versions.length > 0 ? versions[0] : null
    // Only use baseHtml if the latest version has the same theme
    let baseHtmlCandidate: string | null = null
    if (latestVersion?.theme === selectedTheme && latestVersion?.html) {
      baseHtmlCandidate = latestVersion.html
    } else if (generatedHtml) {
      baseHtmlCandidate = generatedHtml
    }
    if (baseHtmlCandidate && typeof baseHtmlCandidate === 'string' && baseHtmlCandidate.trim()) {
      payload.baseHtml = baseHtmlCandidate
    }
    if (imageData) payload.imageData = imageData

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to generate webpage")

      const nextVersionNumber = versionCounter + 1
      setVersionCounter(nextVersionNumber)
      setGeneratedHtml(data.html)
      const email = localStorage.getItem("mu_email")
      const tempId = `temp-${Date.now()}`
      const optimisticVersion: PromptVersion = {
        _id: tempId,
        prompt,
        html: data.html,
        createdAt: new Date().toISOString(),
        versionNumber: nextVersionNumber,
        theme: selectedTheme,
        htmlHistory: [data.html],
        currentIndex: 0,
      }
      setVersions((prev) => [optimisticVersion, ...prev])
      setSelectedVersionId(tempId)
      setLocalVersionHistory((prev) => ({ ...prev, [tempId]: { history: [data.html], index: 0 } }))
      setCanUndo(false)
      setCanRedo(false)

      try {
        const saveRes = await fetch(versionApiUrl("/api/saveVersion"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            prompt,
            html: data.html,
            versionNumber: nextVersionNumber,
            theme: selectedTheme,
          }),
        })
        if (saveRes.ok) {
          const historyRes = await fetch(versionApiUrl(`/api/getVersions/${encodeURIComponent(email ?? "")}`))
          const historyData = await historyRes.json()
          if (historyData.success && Array.isArray(historyData.data) && historyData.data.length > 0) {
            const list = (historyData.data as unknown[]).map(normalizeVersionFromApi)
            setVersions(list)
            setSelectedVersionId(getVersionId(list[0]) || null)
            setLocalVersionHistory((prev) => {
              const next = { ...prev }
              delete next[tempId]
              return next
            })
          }
        }
      } catch (_) {
        // Keep optimistic version if API fails
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionSelect = (versionId: string) => {
    const version = versions.find((v) => getVersionId(v) === versionId)
    if (!version) return
    setSelectedVersionId(versionId)
    setGeneratedHtml(version.html)
    setHasGenerated(true)
    if (version.theme) setSelectedTheme(version.theme)
    const local = localVersionHistory[versionId]
    if (local) {
      setCanUndo(canUndoFromHistory(local.history.length, local.index))
      setCanRedo(canRedoFromHistory(local.history.length, local.index))
    } else {
      const hist = version.htmlHistory ?? []
      const idx = version.currentIndex ?? 0
      setCanUndo(canUndoFromHistory(hist.length, idx))
      setCanRedo(canRedoFromHistory(hist.length, idx))
    }
    setCurrentPrompt("")
  }

  const handlePreviewHtmlChange = (updatedHtml: string) => {
    setGeneratedHtml(updatedHtml)
    if (!selectedVersionId) return
    setVersions((prev) =>
      prev.map((v) => (getVersionId(v) === selectedVersionId ? { ...v, html: updatedHtml } : v))
    )
    const isTemp = selectedVersionId.startsWith("temp-")
    if (isTemp) {
      setLocalVersionHistory((prev) => {
        const cur = prev[selectedVersionId]
        if (!cur) return prev
        const newHistory = cur.history.slice(0, cur.index + 1)
        newHistory.push(updatedHtml)
        return { ...prev, [selectedVersionId]: { history: newHistory, index: newHistory.length - 1 } }
      })
      setCanUndo(true)
      setCanRedo(false)
      return
    }
    // Server version: do NOT save here. Save only once when user turns edit mode OFF.
  }

  const selectedVersion = versions.find((v) => getVersionId(v) === selectedVersionId)
  const activeVersionLabel = selectedVersion ? `Version ${selectedVersion.versionNumber}` : undefined
  const effectiveVersionId = selectedVersionId ?? (versions.length > 0 ? getVersionId(versions[0]) : null)

  const handleNewChat = () => {
    setSelectedVersionId(null)
    setGeneratedHtml("")
    setCurrentPrompt("")
    setHasGenerated(false)
    setError("")
    // Clear localStorage for current chat state
    localStorage.removeItem("ws_selectedVersionId")
    localStorage.removeItem("ws_generatedHtml")
    localStorage.removeItem("ws_currentPrompt")
    localStorage.removeItem("ws_hasGenerated")
    // Keep versionCounter and versions (history) intact
  }

  const handleAdvancedModeToggle = (enabled: boolean) => {
    if (!enabled && isAdvancedMode) {
      // Switching from Advanced Mode OFF - no delay needed for showing
      setIsAdvancedMode(enabled)
    } else if (enabled && !isAdvancedMode) {
      // Show pricing modal first when enabling advanced mode
      setShowPricingModal(true)
    } else {
      setIsAdvancedMode(enabled)
    }
  }

  const handlePricingModalClose = () => {
    setShowPricingModal(false)
    // After closing pricing modal, proceed with enabling advanced mode
    setIsTransitioning(true)
    setTimeout(() => {
      setIsAdvancedMode(true)
      setIsTransitioning(false)
    }, 350) // Match animation duration
  }

  
  return (
  <>
  <div className={`${styles.container} ${selectedTheme === "tetr" ? styles.tetrTheme : ""}`} data-theme={selectedTheme}>
    <main className={styles.main}>

      {/* Left Sidebar: History/Output Sections + Prompt Input */}
      <section className={styles.promptSection}>
        <div className={styles.promptSectionInner}>
          
          {/* Conditionally render History or Output Sections Panel based on Advanced Mode */}
          {!isAdvancedMode ? (
            <>
              <div className={styles.historyHeader}>
                <p className={styles.promptEyebrow}>History</p>
              </div>

              <div className={styles.historyList}>
                {versions.length === 0 ? (
                  <p>No versions yet</p>
                ) : (
                  versions.map((version) => (
                    <button
                      key={getVersionId(version)}
                      type="button"
                      onClick={() => handleVersionSelect(getVersionId(version))}
                      className={`${styles.versionItem} ${
                        selectedVersionId === getVersionId(version) ? styles.versionItemActive : ""
                      }`}
                    >
                      <div className={styles.versionHeader}>
                        <span className={styles.versionTitle}>
                          Version {version.versionNumber}
                        </span>
                        <span className={styles.versionTimestamp}>
                          {formatTimestamp(version.createdAt)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {version.theme && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: version.theme === 'mastersunion' ? 'rgba(57, 181, 215, 0.2)' : 'rgba(240, 195, 0, 0.2)',
                            color: version.theme === 'mastersunion' ? '#39B5D7' : '#F0C300',
                            textTransform: 'capitalize',
                            fontWeight: 500
                          }}>
                            {version.theme === 'mastersunion' ? 'Masters Union' : 'Tetr'}
                          </span>
                        )}
                      </div>
                      <p className={styles.versionPrompt}>{version.prompt}</p>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <OutputSectionsPanel 
              html={generatedHtml} 
              onHtmlChange={handlePreviewHtmlChange}
              selectedTheme={selectedTheme} 
            />
          )}

            {/* Advanced Mode Toggle - hidden */}

            {/* Sidebar Prompt Input - only shown when Advanced Mode is OFF */}
            {(selectedVersionId || hasGenerated) && (!isAdvancedMode || isTransitioning) && (
              <div className={`${styles.promptInputWrapper} ${isTransitioning ? styles.hiding : ''}`}>
                <PromptInput
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  error={error}
                  value={currentPrompt}
                  onPromptChange={setCurrentPrompt}
                  isReadOnly={isPreviewEditMode}
                  variant="sidebar"
                  selectedTheme={selectedTheme}
                  onThemeChange={setSelectedTheme}
                />
              </div>
            )}

         
        </div>
      </section>

      {/* Right Preview Display */}
      <section className={styles.previewSection}>

       <section className={styles.previewSection}>

  {/* Default Full Hero UI when nothing selected/generated */}
  {!selectedVersionId && !hasGenerated && !generatedHtml.trim() &&(
    <main className={styles.aiGenrate}>
      <section className={styles.aiGenrateHero}>
        <div className={styles.container}>
          <div className={styles.aiGenrateHeroContent}>
            <div className={styles.mucontentdiv}>
              <div className={styles.muLogoAnimation}>
                <img loading="lazy"
                  src={selectedTheme === "tetr" 
                    ? "https://cdn.tetr.com/assets/ih-images/V2/newTetrLogoBrand.svg"
                    : "https://files.mastersunion.link/resources/animateds/logoanimationblack.gif"}
                  alt={selectedTheme === "tetr" ? "Tetr Logo" : "MU Logo"}
                />
              </div>
              <h1 className={styles.gradientText}>
                <span> WebStudio </span>
              </h1>
              <p className={styles.aiGenrateSubtitle}>
                Transform your ideas into stunning pages with the power of AI
              </p>
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
                selectedTheme={selectedTheme}
                onThemeChange={setSelectedTheme}
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
  )}

  {/* Show Preview Only when version is selected or generated */}
  {(selectedVersionId || hasGenerated) && (
    <Preview
      html={generatedHtml}
      isLoading={isLoading}
      activeVersionLabel={activeVersionLabel}
      onHtmlChange={handlePreviewHtmlChange}
      onEditModeChange={(isEdit, latestHtml) => {
        setIsPreviewEditMode(isEdit)
        const versionId = selectedVersionId
        if (isEdit) {
          editSessionHtmlRef.current = generatedHtml
          hasSavedThisEditSessionRef.current = false
        } else {
          const htmlToSave = latestHtml !== undefined ? latestHtml : generatedHtml
          if (versionId && htmlToSave && !versionId.startsWith("temp-")) {
            const snapshot = editSessionHtmlRef.current
            const changed = snapshot !== htmlToSave
            const notSavedYet = !hasSavedThisEditSessionRef.current
            if (changed && notSavedYet) {
              hasSavedThisEditSessionRef.current = true
              persistEditedHtml(versionId, htmlToSave).catch(() => {
                hasSavedThisEditSessionRef.current = false
              })
            }
            editSessionHtmlRef.current = null
          }
        }
      }}
      selectedTheme={selectedTheme}
      onNewChat={handleNewChat}
      selectedVersionId={effectiveVersionId}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={handleUndo}
      onRedo={handleRedo}
    />
  )}
 


</section>


      </section>

    </main>
  </div>

  {/* Pricing Modal */}
  <PricingModal 
    isOpen={showPricingModal}
    onClose={handlePricingModalClose}
    selectedTheme={selectedTheme}
  />
  </>
)

}
