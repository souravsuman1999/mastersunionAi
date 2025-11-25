import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDesignSystemPrompt } from "@/config/design-system";

export const runtime = "nodejs"; // VERY IMPORTANT → Edge runtime breaks env vars!

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Load API key
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key missing in environment variables" },
        { status: 500 }
      );
    }

    // Initialize client
    const client = new Anthropic({
      apiKey,
    });

    const designSystemPrompt = getDesignSystemPrompt();

    const systemPrompt = `
You are an expert web developer. Generate complete, valid HTML pages based on user requests.

${designSystemPrompt}

IMPORTANT OUTPUT RULES:
- Return ONLY complete HTML (<html>, <head>, <body>)
- Use inline CSS inside <style> tag
- Follow the design system strictly
- No explanations, no markdown, no backticks
- Final output must render perfectly inside an iframe
`;

    // Call Anthropic (latest API format)
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content[0]?.text || "";

    // Clean backticks if any appear
    const html = text
      .replace(/^```html/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    return NextResponse.json({ html }, { status: 200 });
  } catch (error: any) {
    console.error("Claude API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
