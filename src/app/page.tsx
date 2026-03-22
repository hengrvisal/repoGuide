"use client";

import { RepoInput } from "@/components/RepoInput";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Understand any codebase
            <br />
            <span className="text-accent">in 60 seconds</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Paste a GitHub repo URL. Get a structured guide with architecture
            overview, annotated folder map, and reading order.
          </p>
        </div>

        <RepoInput />

        <footer className="mt-24 text-muted-foreground text-sm">
          Built with{" "}
          <span className="text-foreground/70">Claude API</span>
          {" + "}
          <span className="text-foreground/70">GitHub API</span>
        </footer>
      </div>
    </main>
  );
}
