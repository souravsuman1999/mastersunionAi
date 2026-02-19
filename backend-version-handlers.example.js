/**
 * Reference backend handlers for version API (paste into your Node/Express backend).
 * - Undo only when currentIndex > 0; redo only when currentIndex < htmlHistory.length - 1.
 * - UI = htmlHistory[currentIndex]. No DB insert on undo/redo.
 * - saveEditedHtml: idempotent (same HTML as last → no push).
 */

const saveEditedHtml = async (req, res) => {
  try {
    const { versionId, html } = req.body
    const version = await GeneratedVersion.findById(versionId)
    if (!version) {
      return res.status(404).json({ success: false, message: "Version not found" })
    }
    const lastSavedHtml = version.htmlHistory[version.htmlHistory.length - 1]
    if (lastSavedHtml === html) {
      return res.json({ success: true, message: "Duplicate html ignored", data: version })
    }
    if (version.currentIndex < version.htmlHistory.length - 1) {
      version.htmlHistory = version.htmlHistory.slice(0, version.currentIndex + 1)
    }
    version.htmlHistory.push(html)
    version.currentIndex = version.htmlHistory.length - 1
    await version.save()
    res.json({ success: true, data: version })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Undo: currentIndex-- only when currentIndex > 0. Returns html + currentIndex + canUndo/canRedo.
const undoHtml = async (req, res) => {
  try {
    const { versionId } = req.body
    const version = await GeneratedVersion.findById(versionId)
    if (!version) {
      return res.status(404).json({ success: false, message: "Not found" })
    }
    if (version.currentIndex <= 0) {
      return res.json({
        success: true,
        currentIndex: version.currentIndex,
        html: version.htmlHistory[version.currentIndex],
        canUndo: false,
        canRedo: version.htmlHistory.length > 1
      })
    }
    version.currentIndex -= 1
    await version.save()
    res.json({
      success: true,
      currentIndex: version.currentIndex,
      html: version.htmlHistory[version.currentIndex],
      canUndo: version.currentIndex > 0,
      canRedo: true
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Redo: currentIndex++ only when currentIndex < htmlHistory.length - 1.
const redoHtml = async (req, res) => {
  try {
    const { versionId } = req.body
    const version = await GeneratedVersion.findById(versionId)
    if (!version) {
      return res.status(404).json({ success: false, message: "Not found" })
    }
    if (version.currentIndex >= version.htmlHistory.length - 1) {
      return res.json({
        success: true,
        currentIndex: version.currentIndex,
        html: version.htmlHistory[version.currentIndex],
        canUndo: version.currentIndex > 0,
        canRedo: false
      })
    }
    version.currentIndex += 1
    await version.save()
    res.json({
      success: true,
      currentIndex: version.currentIndex,
      html: version.htmlHistory[version.currentIndex],
      canUndo: true,
      canRedo: version.currentIndex < version.htmlHistory.length - 1
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Example route wiring:
// router.post("/api/saveEditedHtml", saveEditedHtml)
// router.post("/api/undoHtml", undoHtml)
// router.post("/api/redoHtml", redoHtml)
