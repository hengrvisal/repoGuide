import { RepoInfo, TreeItem } from "./types";

const GITHUB_API = "https://api.github.com";

function headers(): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoGuide",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token && !token.includes("xxxxx")) {
    h.Authorization = `Bearer ${token}`;
  }
  return h;
}

export function parseRepoUrl(input: string): {
  owner: string;
  repo: string;
} | null {
  input = input.trim();

  // Try owner/repo shorthand
  const shorthand = input.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shorthand) {
    return { owner: shorthand[1], repo: shorthand[2] };
  }

  // Try full URL
  try {
    const url = new URL(input);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

async function githubFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, { headers: headers() });

  if (res.status === 403) {
    const rateLimitRemaining = res.headers.get("x-ratelimit-remaining");
    if (rateLimitRemaining === "0") {
      const resetTime = res.headers.get("x-ratelimit-reset");
      const resetDate = resetTime
        ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString()
        : "soon";
      throw new Error(`GitHub API rate limit exceeded. Resets at ${resetDate}`);
    }
    throw new Error(
      "Access denied. This repository may be private. RepoGuide only works with public repositories."
    );
  }

  if (res.status === 404) {
    throw new Error("Repository not found. Please check the URL and try again.");
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function fetchRepoInfo(
  owner: string,
  repo: string
): Promise<RepoInfo> {
  return githubFetch<RepoInfo>(`/repos/${owner}/${repo}`);
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch: string
): Promise<TreeItem[]> {
  const data = await githubFetch<{
    tree: TreeItem[];
    truncated: boolean;
  }>(`/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);

  return data.tree;
}

export async function fetchReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const data = await githubFetch<{ content: string; encoding: string }>(
      `/repos/${owner}/${repo}/readme`
    );
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return data.content;
  } catch {
    return null;
  }
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  try {
    const data = await githubFetch<{
      content: string;
      encoding: string;
      size: number;
    }>(`/repos/${owner}/${repo}/contents/${path}`);

    if (data.size > 50000) return null;

    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return data.content;
  } catch {
    return null;
  }
}

const ENTRY_POINTS = [
  "index.ts",
  "index.js",
  "index.tsx",
  "index.jsx",
  "main.ts",
  "main.js",
  "main.py",
  "app.py",
  "app.ts",
  "app.js",
  "app.tsx",
  "src/index.ts",
  "src/index.js",
  "src/index.tsx",
  "src/main.ts",
  "src/main.js",
  "src/main.tsx",
  "src/app.ts",
  "src/app.tsx",
  "src/App.tsx",
  "src/App.jsx",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "lib/main.ts",
  "cmd/main.go",
  "main.go",
  "src/lib.rs",
  "src/main.rs",
];

const CONFIG_FILES = [
  "package.json",
  "tsconfig.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.ts",
  "vite.config.js",
  "webpack.config.js",
  ".eslintrc.js",
  ".eslintrc.json",
  "eslint.config.js",
  "Dockerfile",
  "docker-compose.yml",
  "docker-compose.yaml",
  "requirements.txt",
  "pyproject.toml",
  "Cargo.toml",
  "go.mod",
  "Makefile",
  "Gemfile",
  "build.gradle",
  "pom.xml",
  "deno.json",
  "bun.lockb",
];

export function selectKeyFiles(tree: TreeItem[]): string[] {
  const files = tree.filter((t) => t.type === "blob");
  const selected = new Set<string>();

  // Add entry points that exist
  for (const entry of ENTRY_POINTS) {
    if (files.some((f) => f.path === entry)) {
      selected.add(entry);
    }
  }

  // Add config files that exist
  for (const config of CONFIG_FILES) {
    if (files.some((f) => f.path === config)) {
      selected.add(config);
    }
  }

  // Add route/API files (first few)
  const routeFiles = files.filter(
    (f) =>
      (f.path.includes("/api/") ||
        f.path.includes("/routes/") ||
        f.path.includes("/route.")) &&
      !f.path.includes("node_modules") &&
      (f.size === undefined || f.size < 50000)
  );
  for (const rf of routeFiles.slice(0, 5)) {
    selected.add(rf.path);
  }

  // Add top-level source files
  const topLevelSrc = files.filter(
    (f) =>
      !f.path.includes("/") &&
      /\.(ts|js|tsx|jsx|py|go|rs|rb)$/.test(f.path) &&
      (f.size === undefined || f.size < 50000)
  );
  for (const tls of topLevelSrc.slice(0, 5)) {
    selected.add(tls.path);
  }

  // Limit to 20 files
  return Array.from(selected).slice(0, 20);
}

export async function fetchKeyFileContents(
  owner: string,
  repo: string,
  paths: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const batchSize = 10;

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const contents = await Promise.all(
      batch.map((p) => fetchFileContent(owner, repo, p))
    );
    batch.forEach((p, idx) => {
      if (contents[idx]) {
        results.set(p, contents[idx]!);
      }
    });
  }

  return results;
}
