"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SSEEvent } from "@/lib/types";

const EXAMPLE_REPOS = [
  "vercel/next.js",
  "expressjs/express",
  "pallets/flask",
  "astral-sh/ruff",
];

const GITHUB_URL_REGEX =
  /^(https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\.git)?(\/tree\/[^\s]*)?|[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)$/;

interface ProgressStep {
  step: number;
  message: string;
  done: boolean;
}

export function RepoInput() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const validate = (value: string): boolean => {
    if (!value.trim()) {
      setError("Please enter a GitHub repository URL");
      return false;
    }
    if (!GITHUB_URL_REGEX.test(value.trim())) {
      setError("Enter a valid GitHub URL (https://github.com/owner/repo) or shorthand (owner/repo)");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = useCallback(
    async (repoUrl?: string) => {
      const target = repoUrl || url;
      if (!validate(target)) return;

      setLoading(true);
      setError(null);
      setSteps([]);

      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
          signal: abortRef.current.signal,
        });

        if (!response.ok && response.headers.get("content-type")?.includes("json")) {
          const data = await response.json();
          setError(data.error || "Something went wrong");
          setLoading(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          setError("Failed to connect to analysis stream");
          setLoading(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));

              if (event.error) {
                setError(event.message);
                setLoading(false);
                return;
              }

              if (event.guideId) {
                router.push(`/guide/${event.guideId}`);
                return;
              }

              setSteps((prev) => {
                const existing = prev.find((s) => s.step === event.step);
                if (existing) {
                  return prev.map((s) =>
                    s.step === event.step
                      ? { ...s, message: event.message, done: true }
                      : s
                  );
                }
                // Mark previous steps as done
                const updated = prev.map((s) => ({ ...s, done: true }));
                return [...updated, { step: event.step, message: event.message, done: false }];
              });
            } catch {
              // Skip malformed events
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Failed to connect. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [url, router]
  );

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="relative"
      >
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste a GitHub repo URL..."
          disabled={loading}
          className="w-full h-14 sm:h-16 px-5 pr-28 sm:pr-32 rounded-xl bg-card border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-50 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 sm:h-12 px-5 sm:px-6 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing
            </span>
          ) : (
            "Analyze"
          )}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-red-400 text-sm text-left">{error}</p>
      )}

      {loading && steps.length > 0 && (
        <div className="mt-6 text-left space-y-3">
          {steps.map((step) => (
            <div
              key={step.step}
              className="flex items-center gap-3 text-sm animate-fade-in-up"
            >
              {step.done ? (
                <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs">
                  ✓
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </span>
              )}
              <span className={step.done ? "text-muted-foreground" : "text-foreground"}>
                {step.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {EXAMPLE_REPOS.map((repo) => (
            <button
              key={repo}
              onClick={() => {
                setUrl(repo);
                handleSubmit(repo);
              }}
              className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/50 transition-colors font-mono"
            >
              {repo}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
