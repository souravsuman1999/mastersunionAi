"use client"

import { useState, useEffect, useRef } from "react"
import styles from "./OutputSectionsPanel.module.css"
import ComponentsPanel from "./ComponentsPanel"

interface Section {
  id: string
  title: string
  order: number
  htmlContent: string
}

interface OutputSectionsPanelProps {
  html: string
  onHtmlChange: (newHtml: string) => void
  selectedTheme?: "mastersunion" | "tetr"
}

export default function OutputSectionsPanel({ 
  html, 
  onHtmlChange,
  selectedTheme = "mastersunion" 
}: OutputSectionsPanelProps) {
  const [sections, setSections] = useState<Section[]>([])
  const [draggedItem, setDraggedItem] = useState<Section | null>(null)
  const [dragOverItem, setDragOverItem] = useState<Section | null>(null)
  const [activeMode, setActiveMode] = useState<"components" | "rearrange">("components") // Components open by default
  const [deletedSection, setDeletedSection] = useState<{ section: Section; originalIndex: number } | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const isManualUpdateRef = useRef(false)
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({})

  // Parse HTML and extract unique sections with full styling
  useEffect(() => {
    // Skip parsing if we're doing a manual update (undo/delete/reorder)
    if (isManualUpdateRef.current) {
      isManualUpdateRef.current = false
      return
    }

    if (!html || html.trim() === "") {
      setSections([])
      return
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    
    // Extract the head content (all styles, links, scripts)
    const headContent = doc.head ? doc.head.innerHTML : ""
    
    // Find all major sections - use a more specific selector to avoid duplicates
    const sectionElements = Array.from(
      doc.querySelectorAll("body > section, body > main > section, body > div[class*='section']")
    )
    
    // Use a Set to track unique sections by their content
    const seenContent = new Set<string>()
    const extractedSections: Section[] = []
    
    sectionElements.forEach((element, index) => {
      // Skip very small sections or navigation/footer
      const text = element.textContent || ""
      const contentHash = text.slice(0, 100) // Use first 100 chars as identifier
      
      if (text.length < 50 || 
          seenContent.has(contentHash) ||
          element.tagName === "NAV" || 
          element.classList.contains("nav") ||
          element.classList.contains("footer") ||
          element.classList.contains("header")) {
        return
      }

      seenContent.add(contentHash)
      const sectionHtml = element.outerHTML
      const sectionTitle = element.querySelector("h1, h2, h3")?.textContent?.slice(0, 30) || 
                          `Section ${extractedSections.length + 1}`
      
      // Create full HTML with head content for proper rendering
      const fullSectionHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${headContent}
            <style>
              body {
                margin: 0;
                padding: 0;
                overflow: hidden;
              }
            </style>
          </head>
          <body>
            ${sectionHtml}
          </body>
        </html>
      `
      
      extractedSections.push({
        id: `section-${extractedSections.length}`,
        title: sectionTitle,
        order: extractedSections.length + 1,
        htmlContent: fullSectionHtml
      })
    })

    // If no sections found using strict selectors, try broader approach
    if (extractedSections.length === 0) {
      const bodyContent = doc.body ? doc.body.innerHTML : html
      
      const fullHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${headContent}
          </head>
          <body>
            ${bodyContent}
          </body>
        </html>
      `
      
      extractedSections.push({
        id: "section-0",
        title: "Main Section",
        order: 1,
        htmlContent: fullHtml
      })
    }

    setSections(extractedSections)
  }, [html])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, section: Section) => {
    e.dataTransfer.effectAllowed = "move"
    setDraggedItem(section)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, section: Section) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    
    if (draggedItem && draggedItem.id !== section.id) {
      setDragOverItem(section)
    }
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, section: Section) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!draggedItem || draggedItem.id === section.id) {
      return
    }

    // Perform the reorder
    const newSections = [...sections]
    const draggedIndex = newSections.findIndex(s => s.id === draggedItem.id)
    const targetIndex = newSections.findIndex(s => s.id === section.id)

    // Remove dragged item
    const [removed] = newSections.splice(draggedIndex, 1)
    
    // Insert at new position
    newSections.splice(targetIndex, 0, removed)

    // Update order numbers
    const reorderedSections = newSections.map((s, index) => ({
      ...s,
      order: index + 1
    }))

    // Mark as manual update to prevent useEffect from re-parsing
    isManualUpdateRef.current = true
    setSections(reorderedSections)
  }

  // Handle drag end - clean up and update HTML
  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault()
    
    // Mark as manual update to prevent useEffect from re-parsing
    isManualUpdateRef.current = true
    
    // Update HTML with new section order
    if (sections.length > 0) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      
      // Get the head content
      const headContent = doc.head ? doc.head.innerHTML : ""
      
      // Extract just the body content from each section's full HTML
      const reorderedBodyContent = sections.map(section => {
        const sectionDoc = parser.parseFromString(section.htmlContent, "text/html")
        return sectionDoc.body ? sectionDoc.body.innerHTML : ""
      }).join("\n")
      
      // Reconstruct the full HTML
      const newHtml = `<!DOCTYPE html>
<html>
<head>
${headContent}
</head>
<body>
${reorderedBodyContent}
</body>
</html>`
      
      onHtmlChange(newHtml)
    }
    
    setDraggedItem(null)
    setDragOverItem(null)
  }

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverItem(null)
  }

  // Handle section delete
  const handleDeleteSection = (sectionId: string) => {
    // Find the section to delete and its index
    const sectionIndex = sections.findIndex(s => s.id === sectionId)
    const sectionToDelete = sections[sectionIndex]
    
    if (!sectionToDelete) return

    // Store the deleted section for undo
    setDeletedSection({ section: sectionToDelete, originalIndex: sectionIndex })
    setShowUndo(true)

    // Remove the section from the list
    const newSections = sections.filter(s => s.id !== sectionId)
    
    // Update order numbers
    const reorderedSections = newSections.map((s, index) => ({
      ...s,
      order: index + 1
    }))

    // Mark as manual update to prevent useEffect from re-parsing
    isManualUpdateRef.current = true
    setSections(reorderedSections)

    // Update HTML by removing the deleted section
    if (newSections.length > 0) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const headContent = doc.head ? doc.head.innerHTML : ""
      
      // Extract just the body content from each remaining section's full HTML
      const reorderedBodyContent = reorderedSections.map(section => {
        const sectionDoc = parser.parseFromString(section.htmlContent, "text/html")
        return sectionDoc.body ? sectionDoc.body.innerHTML : ""
      }).join("\n")
      
      // Reconstruct the full HTML
      const newHtml = `<!DOCTYPE html>
<html>
<head>
${headContent}
</head>
<body>
${reorderedBodyContent}
</body>
</html>`
      
      onHtmlChange(newHtml)
    } else {
      // If no sections left, set empty HTML
      onHtmlChange("")
    }
  }

  // Handle undo delete
  const handleUndoDelete = () => {
    if (!deletedSection) return

    // Restore the section at its original position
    const newSections = [...sections]
    newSections.splice(deletedSection.originalIndex, 0, deletedSection.section)

    // Update order numbers
    const reorderedSections = newSections.map((s, index) => ({
      ...s,
      order: index + 1
    }))

    // Mark as manual update to prevent useEffect from re-parsing
    isManualUpdateRef.current = true
    setSections(reorderedSections)
    setShowUndo(false)
    setDeletedSection(null)

    // Update HTML with restored section
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    const headContent = doc.head ? doc.head.innerHTML : ""
    
    // Extract just the body content from each section's full HTML
    const reorderedBodyContent = reorderedSections.map(section => {
      const sectionDoc = parser.parseFromString(section.htmlContent, "text/html")
      return sectionDoc.body ? sectionDoc.body.innerHTML : ""
    }).join("\n")
    
    // Reconstruct the full HTML
    const newHtml = `<!DOCTYPE html>
<html>
<head>
${headContent}
</head>
<body>
${reorderedBodyContent}
</body>
</html>`
    
    onHtmlChange(newHtml)
  }


  return (
    <div className={styles.container}>
      {/* Toggle between Components and Rearrange */}
      <div className={styles.modeToggle}>
        <button
          type="button"
          onClick={() => setActiveMode("components")}
          className={`${styles.modeButton} ${
            activeMode === "components" ? styles.modeButtonActive : ""
          }`}
        >
          Components
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("rearrange")}
          className={`${styles.modeButton} ${
            activeMode === "rearrange" ? styles.modeButtonActive : ""
          }`}
        >
          Rearrange
        </button>
      </div>

      {activeMode === "components" ? (
        <ComponentsPanel
          html={html}
          onHtmlChange={onHtmlChange}
          selectedTheme={selectedTheme}
        />
      ) : (
        <>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div>
                <p className={styles.eyebrow}>Output Sections ({sections.length})</p>
                <p className={styles.subtitle}>Drag to reorder</p>
              </div>
              {/* Undo button inline with header */}
              {showUndo && deletedSection && (
                <button
                  type="button"
                  onClick={handleUndoDelete}
                  className={styles.undoButton}
                  aria-label="Undo delete"
                  title="Undo delete"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 8L7 4M3 8L7 12M3 8H13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Undo
                </button>
              )}
            </div>
          </div>

          <div className={styles.sectionsList}>
        {sections.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="6" cy="7.5" r="0.5" fill="currentColor"/>
              <circle cx="8" cy="7.5" r="0.5" fill="currentColor"/>
              <circle cx="10" cy="7.5" r="0.5" fill="currentColor"/>
            </svg>
            <p>No sections detected yet</p>
            <span>Generate content to see sections</span>
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, section)}
              onDragOver={(e) => handleDragOver(e, section)}
              onDrop={(e) => handleDrop(e, section)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`${styles.sectionItem} ${
                draggedItem?.id === section.id ? styles.dragging : ""
              } ${dragOverItem?.id === section.id ? styles.dragOver : ""}`}
            >
              <div className={styles.dragHandle}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="6" cy="4" r="1" fill="currentColor"/>
                  <circle cx="10" cy="4" r="1" fill="currentColor"/>
                  <circle cx="6" cy="8" r="1" fill="currentColor"/>
                  <circle cx="10" cy="8" r="1" fill="currentColor"/>
                  <circle cx="6" cy="12" r="1" fill="currentColor"/>
                  <circle cx="10" cy="12" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div className={styles.sectionContent}>
                {/* PowerPoint-style numbered circle */}
                <div className={styles.numberedCircle}>
                  <span className={styles.circleNumber}>{section.order}</span>
                </div>
                <div className={styles.sectionPreview}>
                  {/* Section preview with iframe */}
                  <div className={styles.previewFrame}>
                    <iframe
                      ref={(el) => {
                        if (el) iframeRefs.current[section.id] = el
                      }}
                      srcDoc={section.htmlContent}
                      className={styles.sectionIframe}
                      sandbox="allow-same-origin"
                      title={`Preview ${section.order}`}
                    />
                    <div className={styles.previewOverlay}>
                      <span className={styles.sectionLabel}>{section.title}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSection(section.id)
                }}
                className={styles.deleteButton}
                title="Delete section"
                aria-label="Delete section"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

          <div className={styles.hint}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 11.5V8M8 5.5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Drag sections to reorder the output</span>
          </div>
        </>
      )}
    </div>
  )
}
