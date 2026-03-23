import { RepoInfo, TreeItem } from "./types";

export const SYSTEM_PROMPT = `You are an expert senior software engineer who specializes in onboarding new developers to unfamiliar codebases. You explain code architecture the way a great tech lead would on someone's first day — clearly, practically, and with enough context to be immediately useful.

You must respond with valid JSON matching the provided schema. No markdown fences, no preamble, no explanation outside the JSON.

Guidelines for your analysis:
- Write the architecture overview like you're talking to a smart developer who just joined the team. Be direct, practical, conversational. Use markdown formatting within the architecture string (paragraphs, bold, etc.).
- For the reading path, think about what a new dev ACTUALLY needs to understand first to be productive. Entry points and core abstractions before edge cases and utilities.
- Detect real patterns, not generic ones. "Uses React" is not a pattern. "Components follow container/presenter pattern with hooks for data fetching co-located in the same directory" IS a pattern.
- For dependencies, only include the ones that shape how you write code in this project. Skip generic utilities unless they're architectural (e.g., skip lodash, include Zustand).
- Folder annotations should tell me what I'll FIND there, not just restate the folder name. "components/ → React components" is useless. "components/ → Feature-organized React components; each folder is a self-contained feature with its own hooks, types, and tests" is useful.
- Keep the folderMap focused on important directories and key files. Don't list every single file.
- The readingPath should have 5-8 items, ordered from most foundational to more specific.
- Patterns should be specific and actionable, not generic observations.
- Dependencies should cover only the 5-10 most architecturally significant ones.

For the architectureGraph field:
- Identify 5-12 logical components/modules in the codebase. These are NOT individual files — they are logical groupings (e.g., "Authentication", "API Layer", "Database Models", "UI Components", "State Management").
- Each node should represent a meaningful architectural boundary.
- Edges represent real dependencies or data flow between components. Only include edges where there is an actual import, API call, event, or data flow relationship. Don't connect everything to everything.
- Node types should reflect the component's role:
  - "core" = central business logic
  - "api" = API routes, controllers, endpoints
  - "data" = database, models, ORM, storage
  - "ui" = frontend components, pages, views
  - "config" = configuration, environment, build setup
  - "utility" = shared helpers, utils, libs
  - "external" = third-party integrations, external services
- Keep node labels short (2-4 words). Put detail in the description.
- keyFiles should be the 3-5 most important files a new dev should look at to understand this component.
- patterns should list specific patterns used within that component.`;

export function buildUserPrompt(
  repoInfo: RepoInfo,
  tree: TreeItem[],
  readme: string | null,
  fileContents: Map<string, string>
): string {
  // Limit tree to ~500 entries to keep prompt small
  const treeStr = tree
    .slice(0, 500)
    .map((t) => `${t.type === "tree" ? "📁" : "📄"} ${t.path}`)
    .join("\n");

  // Limit each file to 3000 chars, total files section to ~12000 chars
  let filesSection = "";
  let totalFileChars = 0;
  const maxTotalFileChars = 12000;
  fileContents.forEach((content, path) => {
    if (totalFileChars >= maxTotalFileChars) return;
    const budget = Math.min(3000, maxTotalFileChars - totalFileChars);
    const truncated =
      content.length > budget ? content.slice(0, budget) + "\n... (truncated)" : content;
    filesSection += `\n<file path="${path}">\n${truncated}\n</file>\n`;
    totalFileChars += truncated.length;
  });

  return `Analyze this GitHub repository and return a structured JSON guide for new developers.

<repository>
<meta>
Name: ${repoInfo.full_name}
Description: ${repoInfo.description || "No description"}
Primary Language: ${repoInfo.language || "Unknown"}
Stars: ${repoInfo.stargazers_count}
Last Updated: ${repoInfo.updated_at}
</meta>

<tree>
${treeStr}
</tree>

${readme ? `<readme>\n${readme.slice(0, 3000)}\n</readme>` : ""}

<key_files>
${filesSection}
</key_files>
</repository>

Return a JSON object with this exact schema:
{
  "summary": {
    "description": "string — 1-2 sentence description of what this project does",
    "primaryLanguage": "string — main language",
    "framework": "string | null — main framework if any",
    "buildTool": "string | null — build tool if any"
  },
  "architecture": "string — markdown prose, 3-5 paragraphs explaining the project architecture",
  "folderMap": [
    {
      "path": "string",
      "type": "directory | file",
      "annotation": "string — what you'll find here",
      "importance": "high | medium | low",
      "children": [ ...same structure, optional ]
    }
  ],
  "readingPath": [
    {
      "order": 1,
      "path": "string — file or directory path",
      "reason": "string — why read this",
      "lookFor": "string — what to pay attention to",
      "estimatedMinutes": 5
    }
  ],
  "patterns": [
    {
      "name": "string",
      "category": "architecture | testing | state | api | styling | error-handling | other",
      "description": "string"
    }
  ],
  "dependencies": [
    {
      "name": "string",
      "role": "string — what it does in this project",
      "whyChosen": "string — why this over alternatives"
    }
  ],
  "architectureGraph": {
    "nodes": [
      {
        "id": "string — unique kebab-case id",
        "label": "string — short 2-4 word name",
        "description": "string — 2-3 sentence explanation",
        "type": "core | api | data | ui | config | utility | external",
        "keyFiles": ["string — file paths"],
        "patterns": ["string — patterns used here"],
        "linesOfCode": 0
      }
    ],
    "edges": [
      {
        "source": "string — source node id",
        "target": "string — target node id",
        "label": "string — e.g. imports, calls API, reads from",
        "type": "import | api-call | data-flow | event | config"
      }
    ]
  }
}

Return ONLY the JSON object. No markdown fences, no explanations.`;
}
