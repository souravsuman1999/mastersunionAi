import { type NextRequest, NextResponse } from "next/server"
import { getDesignSystemPrompt, getTetrDesignSystemPrompt } from "@/config/design-system"

async function generateWebpageOnServer(prompt: string, baseHtml?: string, imageData?: string, theme: "mastersunion" | "tetr" = "mastersunion"): Promise<string> {
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

  const designSystemPrompt = theme === "tetr" ? getTetrDesignSystemPrompt() : getDesignSystemPrompt()
  const hasBaseHtml = typeof baseHtml === "string" && baseHtml.trim().length > 0

  const systemPrompt = `You are an expert web developer. Generate complete, valid HTML pages based on user requests.

${designSystemPrompt}

IMPORTANT OUTPUT RULES:
- Return ONLY the complete HTML code (including <!DOCTYPE html>, <html>, <head>, and <body> tags)
- Include inline CSS in a <style> tag in the <head>
- Include all interactive behavior inside a <script> tag that appears before </body>. Use clean, modern, vanilla JavaScript (no frameworks besides Swiper) and respect the provided class names/data attributes.
- The CSS MUST follow the design system rules above
- Make the page responsive and professional
- DO NOT include any explanations, markdown code blocks, or extra text
- The output should be ready to render directly in an iframe
- If existing HTML is provided, this is a CONTINUOUS conversation - preserve ALL existing structure, styles, and content unless explicitly asked to change them
- When updating existing HTML, treat it as an iterative improvement, not a replacement
- Maintain design consistency across versions
- If an image is provided, use it as a reference for design, layout, colors, styling, or content. Analyze the image carefully and incorporate relevant visual elements, color schemes, layout patterns, or design inspiration into the generated webpage.

CRITICAL INTERACTIVITY RULES:
- ALL interactive components (tabs, accordions, carousels, dropdowns, modals, etc.) MUST be fully functional with proper JavaScript
- For Swiper.js carousels: ALWAYS include the Swiper CDN script AND initialize with new Swiper() in the <script> tag
- For tabs: ALWAYS include the tab switching JavaScript that adds/removes 'active' classes on click
- For accordions: ALWAYS include click handlers that toggle content visibility
- For modals/popups: ALWAYS include open/close functionality with proper event listeners
- Test all interactivity mentally before outputting - if a button or tab doesn't have a click handler, add it
- DO NOT generate non-functional UI elements - every interactive element must have working JavaScript

SWIPER.JS REQUIREMENTS (when using carousels):
1. In <head>: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
2. Before </body>: <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
3. After Swiper script: <script> with new Swiper('.swiper', { /* config */ }) initialization
4. Use proper Swiper HTML structure: .swiper > .swiper-wrapper > .swiper-slide

TABS REQUIREMENTS (when using tabs):
1. Tab buttons must have data attributes (e.g., data-category="business") and click event listeners
2. Tab panels must have matching data attributes and 'active' class toggling
3. JavaScript must remove 'active' from all tabs/panels, then add to clicked tab/panel
4. Example structure from design system must be followed exactly

Create beautiful, functional webpages with good typography, spacing, and visual hierarchy while strictly following the design system.`

  const startTime = Date.now()
  console.log("[v0] Calling Claude API with model: claude-sonnet-4-5")
  console.log("[v0] Generation mode:", hasBaseHtml ? "edit-existing" : "create-new")
  console.log("[v0] Design system prompt length:", designSystemPrompt.length)
  if (hasBaseHtml) {
    console.log("[v0] Base HTML length:", baseHtml?.length ?? 0)
  }

  const editAwarePrompt = hasBaseHtml
    ? `You are updating an existing webpage. This is a CONTINUOUS conversation - you must preserve ALL existing HTML structure, CSS styles, and content unless the user explicitly asks to change or remove them.

CRITICAL RULES:
- Keep ALL existing HTML elements, classes, IDs, and structure
- Preserve ALL existing CSS styles and design tokens
- Preserve and extend any existing <script> logic unless the user explicitly asks to change or remove it
- Only modify or add what the user specifically requests
- If the user asks to "add" something, add it to the existing page without removing anything
- If the user asks to "change" something, only change that specific part
- Maintain the same overall design, layout, and styling unless explicitly asked to change it
- DO NOT regenerate the entire page from scratch
- DO NOT remove existing sections, styles, or content unless explicitly requested

REQUEST (what to change or add):
${prompt}

CURRENT_HTML (preserve this and apply changes):
${baseHtml}

Return the complete updated HTML document (including <!DOCTYPE>, <html>, <head>, <body>) with inline CSS that follows the design system.`
    : prompt

  // Build content array for Claude API
  const content: any[] = []
  
  // Add image if provided
  if (imageData) {
    // Parse base64 data URL (format: data:image/jpeg;base64,/9j/4AAQ...)
    const base64Match = imageData.match(/^data:image\/(\w+);base64,(.+)$/)
    if (base64Match) {
      const mediaType = base64Match[1] // jpeg, png, etc.
      const base64String = base64Match[2] // actual base64 data
      
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: `image/${mediaType}`,
          data: base64String,
        },
      })
    }
  }
  
  // Add text prompt
  content.push({
    type: "text",
    text: editAwarePrompt,
  })

  // Create AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 300000) // 5 minute timeout

  // Retry logic for transient errors
  const maxRetries = 3
  let lastError: any = null
  let data: any = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000)
        console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 18000, // Reduced from 18000 for faster generation
          messages: [
            {
              role: "user",
              content: content,
            },
          ],
          system: systemPrompt,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: { message: errorText } }
        }
        
        console.error(`[v0] Anthropic API error (attempt ${attempt + 1}):`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        
        // Handle specific error types
        if (response.status === 401) {
          clearTimeout(timeoutId)
          const errorMessage = errorData?.error?.message || "Invalid API key"
          throw new Error(
            `401 Unauthorized: ${errorMessage}. ` +
            "Please verify your ANTHROPIC_API_KEY is correct and set in Vercel environment variables. " +
            "Make sure to redeploy after adding the variable."
          )
        }
        
        // Retry on transient errors (429 rate limit, 529 overloaded, 503 service unavailable)
        const isRetryableError = response.status === 429 || response.status === 529 || response.status === 503
        if (isRetryableError && attempt < maxRetries - 1) {
          lastError = { status: response.status, errorData }
          console.log(`[v0] Retryable error ${response.status}, will retry...`)
          continue // Retry the request
        }
        
        // Non-retryable error or last attempt
        clearTimeout(timeoutId)
        if (response.status === 529) {
          throw new Error(
            "Claude API is temporarily overloaded. Please try again in a few moments. " +
            "If this persists, the API may be experiencing high traffic."
          )
        }
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment and try again. " +
            "You may be making too many requests too quickly."
          )
        }
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
      }

      // Success - parse response and break out of retry loop
      data = await response.json()
      clearTimeout(timeoutId)
      break
    } catch (error: any) {
      // If it's an abort error (timeout) or non-retryable error, throw immediately
      if (error.name === 'AbortError') {
        clearTimeout(timeoutId)
        throw new Error("Request timeout: Generation took too long. Please try again with a simpler prompt.")
      }
      
      // If it's a non-retryable error (like 401), throw it
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        throw error
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        clearTimeout(timeoutId)
        if (lastError) {
          if (lastError.status === 529) {
            throw new Error(
              "Claude API is temporarily overloaded after multiple retries. Please try again in a few moments."
            )
          }
          throw new Error(`Claude API error after ${maxRetries} attempts: ${lastError.status}`)
        }
        throw error
      }
      
      // Otherwise, continue to retry
      lastError = error
      console.log(`[v0] Request failed (attempt ${attempt + 1}), will retry...`, error.message)
    }
  }

  // Process the successful response
  if (!data) {
    throw new Error("Failed to get response from Claude API after retries")
  }

  const duration = Date.now() - startTime
  console.log("[v0] Claude API response received successfully")
  console.log("[v0] Generation took:", duration, "ms (", (duration / 1000).toFixed(2), "seconds)")

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
    const { prompt, baseHtml, imageData, theme } = body

    if (!prompt && !imageData) {
      return NextResponse.json({ error: "Missing prompt or image" }, { status: 400 })
    }

    const selectedTheme = theme === "tetr" ? "tetr" : "mastersunion"

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

    console.log("[v0] Generating webpage with prompt:", prompt?.substring(0, 50) + "..." || "[Image only]")
    console.log("[v0] Using theme:", selectedTheme)
    if (imageData) {
      console.log("[v0] Image data provided, length:", imageData.length)
    }
    const html = await generateWebpageOnServer(prompt || "", baseHtml, imageData, selectedTheme)

    console.log("[v0] Webpage generated successfully")
    return NextResponse.json({ html })
  } catch (error: any) {
    console.error("[v0] Error generating webpage:", error)

    return NextResponse.json({ error: error.message || "Failed to generate webpage" }, { status: 500 })
  }
}
