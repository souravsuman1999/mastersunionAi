import { type NextRequest, NextResponse } from "next/server"
import { getDesignSystemPrompt } from "@/config/design-system"

async function generateWebpageOnServer(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }

  const designSystemPrompt = getDesignSystemPrompt()

  const systemPrompt = `You are an expert web developer. Generate complete, valid HTML pages based on user requests.

${designSystemPrompt}

IMPORTANT OUTPUT RULES:
- Return ONLY the complete HTML code (including <!DOCTYPE html>, <html>, <head>, and <body> tags)
- Include inline CSS in a <style> tag in the <head>
- The CSS MUST follow the design system rules above
- Make the page responsive and professional
- DO NOT include any explanations, markdown code blocks, or extra text
- The output should be ready to render directly in an iframe

Create beautiful, functional webpages with good typography, spacing, and visual hierarchy while strictly following the design system.`

  console.log("[v0] Calling Claude API with model: claude-sonnet-4-5")

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
          content: prompt,
        },
      ],
      system: systemPrompt,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[v0] Anthropic API error:", errorText)
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  console.log("[v0] Claude API response received successfully")

  const content = data.content[0]

  if (content?.type === "text") {
    let html = content.text.trim()

    if (html.startsWith("```html")) {
      html = html.replace(/^```html\n/, "").replace(/\n```$/, "")
    } else if (html.startsWith("```")) {
      html = html.replace(/^```\n/, "").replace(/\n```$/, "")
    }

    return html
  }

  throw new Error("Unexpected response format from Claude")
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API route called")
    const body = await request.json()
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "ANTHROPIC_API_KEY not configured. Please add it in the Vars section of the sidebar.",
        },
        { status: 500 },
      )
    }

    console.log("[v0] Generating webpage with prompt:", prompt.substring(0, 50) + "...")
    const html = await generateWebpageOnServer(prompt)

    console.log("[v0] Webpage generated successfully")
    return NextResponse.json({ html })
  } catch (error: any) {
    console.error("[v0] Error generating webpage:", error)

    return NextResponse.json({ error: error.message || "Failed to generate webpage" }, { status: 500 })
  }
}
