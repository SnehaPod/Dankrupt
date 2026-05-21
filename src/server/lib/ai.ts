import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export type CaptionTone =
  | "genz"
  | "absurd"
  | "corporate"
  | "sarcastic"
  | "cursed"
  | "wholesome"

const TONE_PROMPTS: Record<CaptionTone, string> = {
  genz: "Gen Z internet slang — use 'fr fr', 'no cap', 'lowkey', 'slay', 'based', 'mid', etc. Keep it chaotic.",
  absurd: "Completely unhinged, surreal, non-sequitur. The more nonsensical the better.",
  corporate: "Suspiciously corporate and LinkedIn-brained. Use buzzwords ironically.",
  sarcastic: "Dripping with sarcasm and deadpan irony. Maximum eye-roll energy.",
  cursed: "Deeply unsettling, wrong, or existentially disturbing. Pure cursed energy.",
  wholesome: "Genuinely sweet and heartwarming but still funny. No cringe.",
}

export async function generateCaptions({
  templateName,
  existingText,
  tone,
}: {
  templateName: string
  existingText: string
  tone: CaptionTone
}): Promise<string[]> {
  const toneInstruction = TONE_PROMPTS[tone]

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a meme caption writer. Generate 5 short, punchy captions for the "${templateName}" meme template.

Tone: ${toneInstruction}

${existingText ? `Current caption text for context: "${existingText}"` : ""}

Rules:
- Each caption should be 1-2 lines max
- Return ONLY the captions, one per line, no numbering, no quotes
- Make them actually funny, not try-hard
- Keep each caption under 100 characters`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
}
