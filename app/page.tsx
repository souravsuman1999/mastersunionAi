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

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PromptInput from "@/components/PromptInput"
import Preview from "@/components/Preview"
import AdvancedModeToggle from "@/components/AdvancedModeToggle"
import OutputSectionsPanel from "@/components/OutputSectionsPanel"
import styles from "./page.module.css"


type PromptVersion = {
  _id: string
  prompt: string
  html: string
  createdAt: string
  versionNumber: number
  theme?: "mastersunion" | "tetr"
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
  const [selectedTheme, setSelectedTheme] = useState<"mastersunion" | "tetr">("mastersunion")
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

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
      const res = await fetch(`https://api.mastersunion.org/api/getVersions/${email}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVersions(data.data);

        const storedVersionId = localStorage.getItem("ws_selectedVersionId");
        if (!selectedVersionId && data.data.length > 0) {
          setVersionCounter(data.data[0].versionNumber);
        }
        
        // Restore HTML from selected version if available (more reliable than localStorage for large HTML)
        if (storedVersionId && data.data.length > 0) {
          const versionToRestore = data.data.find((v: PromptVersion) => v._id === storedVersionId);
          if (versionToRestore) {
            setGeneratedHtml(versionToRestore.html);
            setHasGenerated(true);
            if (versionToRestore.theme) {
              setSelectedTheme(versionToRestore.theme);
            }
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

      // 📌 Save version in DB
      await fetch("https://api.mastersunion.org/api/saveVersion", {
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

      // 📌 Reload history after save
      const historyRes = await fetch(`https://api.mastersunion.org/api/getVersions/${email}`)
      const historyData = await historyRes.json()
      if (historyData.success) {
        setVersions(historyData.data)
        setSelectedVersionId(historyData.data[0]._id)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionSelect = (versionId: string) => {
  const version = versions.find(v => v._id === versionId)
  if (!version) return

  setSelectedVersionId(versionId)
  setGeneratedHtml(version.html)
  setHasGenerated(true)
  
  // Set theme from version if available, otherwise keep current theme
  if (version.theme) {
    setSelectedTheme(version.theme)
  }

  // Reset sidebar input when selecting history
  setCurrentPrompt("")
};



  const handlePreviewHtmlChange = (updatedHtml: string) => {
    setGeneratedHtml(updatedHtml)

    if (selectedVersionId) {
      setVersions(prev =>
        prev.map(v => v._id === selectedVersionId ? { ...v, html: updatedHtml } : v)
      )
    }
  }

  const selectedVersion = versions.find(v => v._id === selectedVersionId)
  const activeVersionLabel = selectedVersion ? `Version ${selectedVersion.versionNumber}` : undefined

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
      // Switching to Advanced Mode ON - delay to show hide animation
      setIsTransitioning(true)
      setTimeout(() => {
        setIsAdvancedMode(enabled)
        setIsTransitioning(false)
      }, 350) // Match animation duration
    } else {
      setIsAdvancedMode(enabled)
    }
  }

  
  return (
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
                  versions.map(version => (
                    <button
                      key={version._id}
                      type="button"
                      onClick={() => handleVersionSelect(version._id)}
                      className={`${styles.versionItem} ${
                        selectedVersionId === version._id ? styles.versionItemActive : ""
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

            {/* Advanced Mode Toggle - shown only after version clicked or generated */}
            {(selectedVersionId || hasGenerated) && (
              <AdvancedModeToggle
                isAdvancedMode={isAdvancedMode}
                onToggle={handleAdvancedModeToggle}
                disabled={isLoading || isPreviewEditMode || isTransitioning}
                selectedTheme={selectedTheme}
              />
            )}

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
      onEditModeChange={setIsPreviewEditMode}
      selectedTheme={selectedTheme}
      onNewChat={handleNewChat}
    />
  )}
 


</section>


      </section>

    </main>
  </div>
)

}
