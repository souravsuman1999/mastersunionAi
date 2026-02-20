"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { versionApiUrl } from "@/lib/versionApi"

function getVersionIdFromRaw(raw: Record<string, unknown>): string {
  const idObj = raw._id as string | { $oid?: string; oid?: string } | undefined
  if (typeof idObj === "string") return idObj
  if (idObj && typeof idObj === "object") return (idObj.$oid ?? idObj.oid ?? "") as string
  return (raw.id as string) ?? ""
}

export default function LivePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const versionId = typeof params?.versionId === "string" ? params.versionId : ""
  const indexParam = searchParams.get("index")
  const index = Math.max(0, parseInt(indexParam ?? "0", 10) || 0)

  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!versionId) {
      setError("Missing version ID")
      setLoading(false)
      return
    }
    const email = typeof window !== "undefined" ? localStorage.getItem("mu_email") : null
    if (!email) {
      setError("Please sign in to view this page")
      setLoading(false)
      return
    }
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch(versionApiUrl(`/api/getVersions/${encodeURIComponent(email)}`))
        const data = await res.json()
        if (cancelled) return
        if (!data.success || !Array.isArray(data.data)) {
          setError("Could not load version")
          setLoading(false)
          return
        }
        const list = data.data as Record<string, unknown>[]
        const version = list.find((v) => getVersionIdFromRaw(v) === versionId)
        if (!version) {
          setError("Version not found")
          setLoading(false)
          return
        }
        const hist = Array.isArray(version.htmlHistory) ? (version.htmlHistory as string[]) : []
        const safeIndex = Math.min(index, Math.max(0, hist.length - 1))
        const content = hist[safeIndex] ?? (version.html as string) ?? hist[0] ?? ""
        setHtml(content)
      } catch {
        if (!cancelled) {
          setError("Failed to load page")
        }
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [versionId, index])

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
        Loading...
      </div>
    )
  }
  if (error || !html) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
        {error ?? "No content"}
      </div>
    )
  }

  return (
    <iframe
      srcDoc={html}
      title="Live preview"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
    />
  )
}
