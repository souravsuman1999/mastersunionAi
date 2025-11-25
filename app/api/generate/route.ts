import { type NextRequest, NextResponse } from "next/server"
import { getDesignSystemPrompt } from "@/config/design-system"

async function generateWebpageOnServer(prompt: string, baseHtml?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  
  // Log API key status (without exposing the actual key)
  console.log("[v0] API key status:", {
    exists: !!apiKey,
    length: apiKey.length,
    startsWithSkAnt: apiKey.startsWith("sk-ant-"),
    firstChars: apiKey.substring(0, 7),
  })
  
  if (!apiKey.startsWith("sk-ant-")) {
    console.warn("[v0] Warning: API key format may be incorrect. Anthropic API keys typically start with 'sk-ant-'")
  }

  const designSystemPrompt = getDesignSystemPrompt()
  const hasBaseHtml = typeof baseHtml === "string" && baseHtml.trim().length > 0

  const systemPrompt = `You are an expert web developer. Generate complete, valid HTML pages based on user requests.

${designSystemPrompt}

IMPORTANT OUTPUT RULES:
- Return ONLY the complete HTML code (including <!DOCTYPE html>, <html>, <head>, and <body> tags)
- Include inline CSS in a <style> tag in the <head>
- The CSS MUST follow the design system rules above
- Make the page responsive and professional
- DO NOT include any explanations, markdown code blocks, or extra text
- The output should be ready to render directly in an iframe
- If existing HTML is provided, treat it as the starting point and apply the requested changes without discarding useful sections that are still relevant

Create beautiful, functional webpages with good typography, spacing, and visual hierarchy while strictly following the design system.`

  console.log("[v0] Calling Claude API with model: claude-sonnet-4-5")
  console.log("[v0] Generation mode:", hasBaseHtml ? "edit-existing" : "create-new")
  if (hasBaseHtml) {
    console.log("[v0] Base HTML length:", baseHtml?.length ?? 0)
  }

  const editAwarePrompt = hasBaseHtml
    ? `You are updating an existing webpage. Apply the user's new request to the current HTML while keeping its overall structure, design tokens, and any content that is still applicable.

REQUEST (what to change or add):
${prompt}

CURRENT_HTML (update this):
${baseHtml}

Return the complete updated HTML document (including <!DOCTYPE>, <html>, <head>, <body>) with inline CSS that follows the design system.`
    : prompt

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: editAwarePrompt,
        },
      ],
      system: systemPrompt,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { error: { message: errorText } }
    }
    
    console.error("[v0] Anthropic API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    })
    
    if (response.status === 401) {
      const errorMessage = errorData?.error?.message || "Invalid API key"
      throw new Error(
        `401 Unauthorized: ${errorMessage}. ` +
        "Please verify your ANTHROPIC_API_KEY is correct and set in Vercel environment variables. " +
        "Make sure to redeploy after adding the variable."
      )
    }
    
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Claude API response received successfully")

  const textSegments: string[] = Array.isArray(data?.content)
    ? data.content
        .filter((segment: any) => segment?.type === "text" && typeof segment.text === "string")
        .map((segment: any) => segment.text)
    : []

  if (textSegments.length === 0) {
    throw new Error("Unexpected response format from Claude")
  }

  let html = textSegments.join("").trim()

  if (html.startsWith("```html")) {
    html = html.replace(/^```html\n/, "").replace(/\n```$/, "")
  } else if (html.startsWith("```")) {
    html = html.replace(/^```\n/, "").replace(/\n```$/, "")
  }

  return html
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called")
    const body = await request.json()
    const { prompt, baseHtml } = body

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      console.error("[v0] ANTHROPIC_API_KEY is missing from environment variables")
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured. Please add it in Vercel's Environment Variables settings and redeploy.",
        },
        { status: 500 },
      )
    }
    
    // Log that API key exists (for debugging, without exposing the key)
    console.log("[v0] API key found in environment, length:", apiKey.length)

    console.log("[v0] Generating webpage with prompt:", prompt.substring(0, 50) + "...")
    const html = await generateWebpageOnServer(prompt, baseHtml)

    console.log("[v0] Webpage generated successfully")
    return NextResponse.json({ html })
  } catch (error: any) {
    console.error("[v0] Error generating webpage:", error)

    return NextResponse.json({ error: error.message || "Failed to generate webpage" }, { status: 500 })
  }
}
