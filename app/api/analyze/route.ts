import Anthropic from "@anthropic-ai/sdk";
import {
  OTAKARA_SYSTEM_PROMPT,
  OTAKARA_USER_PROMPT,
} from "@/lib/otakara-prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { base64, mediaType } = await req.json();

    if (!base64) {
      return Response.json(
        { success: false, error: "画像データがありません" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: OTAKARA_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: base64.replace(/^data:image\/\w+;base64,/, ""),
              },
            },
            {
              type: "text",
              text: OTAKARA_USER_PROMPT,
            },
          ],
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";
    const clean = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);

    data.rotation = parseFloat((Math.random() * 10 - 5).toFixed(1));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Analyze error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "解析中にエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
