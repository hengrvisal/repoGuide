import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { parseRepoUrl, fetchRepoInfo, fetchRepoTree, fetchReadme, selectKeyFiles, fetchKeyFileContents } from "@/lib/github";
import { analyzeWithClaude } from "@/lib/analyzer";
import { saveAnalysis } from "@/lib/store";
import { AnalysisResult } from "@/lib/types";

function sseMessage(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  let body: { url: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = parseRepoUrl(body.url);
  if (!parsed) {
    return new Response(
      JSON.stringify({ error: "Invalid GitHub repository URL. Use https://github.com/owner/repo or owner/repo format." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { owner, repo } = parsed;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(sseMessage(data)));
      };

      try {
        // Step 1: Fetch repo structure
        send({ step: 1, message: "Fetching repository structure..." });

        const [repoInfo, readme] = await Promise.all([
          fetchRepoInfo(owner, repo),
          fetchReadme(owner, repo),
        ]);

        const tree = await fetchRepoTree(owner, repo, repoInfo.default_branch);

        if (tree.length > 5000) {
          send({ step: 1, message: "Large repository detected — analyzing key files..." });
        }

        // Step 2: Read key files
        send({ step: 2, message: "Reading key files..." });
        const keyFilePaths = selectKeyFiles(tree);
        const fileContents = await fetchKeyFileContents(owner, repo, keyFilePaths);

        // Step 3: Analyze with Claude
        send({ step: 3, message: "Analyzing architecture..." });
        const analysis = await analyzeWithClaude(repoInfo, tree, readme, fileContents);

        // Step 4: Store result
        send({ step: 4, message: "Generating your guide..." });
        const id = nanoid(10);
        const result: AnalysisResult = {
          id,
          repoUrl: `https://github.com/${owner}/${repo}`,
          owner,
          repo,
          stars: repoInfo.stargazers_count,
          lastUpdated: repoInfo.updated_at,
          generatedAt: new Date().toISOString(),
          ...analysis,
        };

        saveAnalysis(id, result);

        send({ step: 4, message: "Done!", guideId: id });
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unexpected error occurred";
        send({ step: -1, message, error: message });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
