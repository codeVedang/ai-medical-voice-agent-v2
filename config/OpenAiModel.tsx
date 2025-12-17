import OpenAI from "openai"

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  
})

// Separate OpenAI client for moderation (using official OpenAI API if available)
export const openaiModeration = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Function to moderate content
export async function moderateContent(content: string): Promise<boolean> {
  if (!openaiModeration) {
    // Fallback: Simple keyword-based moderation
    const unsafeKeywords = [
      'suicide', 'kill', 'harm', 'illegal', 'drug abuse', 'overdose', 'self-harm',
      'violent', 'terrorist', 'hate speech', 'racist', 'sexist', 'explicit'
    ];
    const lowerContent = content.toLowerCase();
    for (const keyword of unsafeKeywords) {
      if (lowerContent.includes(keyword)) {
        return false; // Flagged as unsafe
      }
    }
    return true; // Safe
  }
  
  try {
    const response = await openaiModeration.moderations.create({
      model: "text-moderation-latest",
      input: content,
    });
    const result = response.results[0];
    // Return true if safe (not flagged)
    return !result.flagged;
  } catch (error) {
    console.error("Moderation error:", error);
    // If moderation fails, err on the side of caution
    return false;
  }
}