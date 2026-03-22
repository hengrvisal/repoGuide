# RepoGuide

AI-powered codebase onboarding tool. Paste a GitHub repo URL and get a structured "new developer guide" — architecture overview, annotated folder map, suggested reading order, and detected patterns.

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key from [console.anthropic.com](https://console.anthropic.com/) |
| `GITHUB_TOKEN` | No* | GitHub personal access token for higher rate limits |

*Without a GitHub token, you're limited to 60 API requests/hour. With one, 5,000/hour.

## Architecture

```
src/
├── app/
│   ├── page.tsx                # Landing page with URL input
│   ├── guide/[id]/page.tsx     # Generated guide display
│   └── api/
│       ├── analyze/route.ts    # SSE analysis pipeline
│       └── guide/[id]/route.ts # Guide data endpoint
├── lib/
│   ├── github.ts               # GitHub API integration
│   ├── analyzer.ts             # Claude AI analysis
│   ├── prompts.ts              # AI prompt templates
│   ├── store.ts                # In-memory result storage
│   └── types.ts                # TypeScript types
└── components/
    ├── RepoInput.tsx           # URL input with validation
    ├── GuideView.tsx           # Guide display wrapper
    ├── ArchitectureOverview.tsx # Architecture prose section
    ├── FolderMap.tsx           # Interactive folder tree
    ├── ReadingPath.tsx         # Suggested reading order
    ├── PatternsList.tsx        # Detected patterns
    └── DependencyOverview.tsx  # Key dependencies
```

## How It Works

1. User pastes a GitHub repo URL
2. Backend fetches repo structure, README, and key files via GitHub API
3. Data is sent to Claude (Sonnet) with a structured prompt
4. Claude returns JSON with architecture analysis, folder annotations, reading order, etc.
5. Result is stored in memory and displayed as a formatted guide

## Tech Stack

- **Next.js 14** — App Router, API routes with SSE streaming
- **TypeScript** — Full type safety
- **Tailwind CSS** — Dark theme with accent color
- **Claude API** — Sonnet model for analysis
- **GitHub REST API** — Repository data fetching

## Screenshots

*Coming soon*
