import { ClaudeAnalysis } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { RepoInfo, TreeItem } from "./types";

export async function analyzeWithClaude(
  repoInfo: RepoInfo,
  tree: TreeItem[],
  readme: string | null,
  fileContents: Map<string, string>
): Promise<ClaudeAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const userPrompt = buildUserPrompt(repoInfo, tree, readme, fileContents);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error("No response content from Claude API");
  }

  // Parse JSON — handle potential markdown fences
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const analysis: ClaudeAnalysis = JSON.parse(jsonStr);
    return analysis;
  } catch (e) {
    throw new Error(
      `Failed to parse Claude response as JSON: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}
