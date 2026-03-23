import { ClaudeAnalysis } from "./types";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import { RepoInfo, TreeItem } from "./types";

/**
 * Extract the first complete JSON object from a string.
 * Handles markdown fences, leading/trailing text, etc.
 */
function extractJSON(raw: string): string {
  let s = raw.trim();

  // Strip markdown fences
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }

  // Find the first '{' and match its closing '}'
  const start = s.indexOf("{");
  if (start === -1) throw new Error("No JSON object found in response");

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const ch = s[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (ch === "\\") {
      if (inString) escape = true;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return s.slice(start, i + 1);
      }
    }
  }

  // If we didn't find matching braces, return from start to end (best effort)
  return s.slice(start);
}

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
  const stopReason = data.stop_reason;

  if (!content) {
    throw new Error("No response content from Claude API");
  }

  // If the response was truncated, the JSON is likely incomplete
  if (stopReason === "max_tokens") {
    throw new Error("Claude response was truncated (max_tokens reached). Try a smaller repository.");
  }

  const jsonStr = extractJSON(content);

  try {
    const analysis: ClaudeAnalysis = JSON.parse(jsonStr);
    return analysis;
  } catch (e) {
    throw new Error(
      `Failed to parse Claude response as JSON: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}
