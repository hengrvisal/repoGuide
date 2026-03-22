"use client";

import { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { ArchitectureOverview } from "./ArchitectureOverview";
import { FolderMap } from "./FolderMap";
import { ReadingPath } from "./ReadingPath";
import { PatternsList } from "./PatternsList";
import { DependencyOverview } from "./DependencyOverview";

export function GuideView({ guide }: { guide: AnalysisResult }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    window.location.href = `/?url=${encodeURIComponent(guide.repoUrl)}`;
  };

  return (
    <div className="min-h-screen">
      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              RepoGuide
            </a>
            <span className="text-border">/</span>
            <a
              href={guide.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium hover:text-accent transition-colors"
            >
              {guide.owner}/{guide.repo}
            </a>
          </div>
          <a
            href={guide.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="View on GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      {/* Guide content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Quick Summary Card */}
        <section className="guide-section mb-10">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="font-mono text-xl font-bold">
                {guide.owner}/{guide.repo}
              </h1>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z" />
                </svg>
                {guide.stars.toLocaleString()}
              </div>
            </div>
            <p className="text-foreground/90 mb-4">{guide.summary.description}</p>
            <div className="flex flex-wrap gap-2">
              {guide.summary.primaryLanguage && (
                <span className="path-pill">{guide.summary.primaryLanguage}</span>
              )}
              {guide.summary.framework && (
                <span className="path-pill">{guide.summary.framework}</span>
              )}
              {guide.summary.buildTool && (
                <span className="path-pill">{guide.summary.buildTool}</span>
              )}
              <span className="path-pill text-muted-foreground">
                Updated {new Date(guide.lastUpdated).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>

        {/* Architecture Overview */}
        <section className="guide-section mb-10">
          <h2 className="font-mono text-lg font-bold mb-4 text-accent">
            Architecture Overview
          </h2>
          <ArchitectureOverview content={guide.architecture} />
        </section>

        {/* Annotated Folder Map */}
        <section className="guide-section mb-10">
          <h2 className="font-mono text-lg font-bold mb-4 text-accent">
            Annotated Folder Map
          </h2>
          <FolderMap
            items={guide.folderMap}
            repoUrl={guide.repoUrl}
          />
        </section>

        {/* Suggested Reading Order */}
        <section className="guide-section mb-10">
          <h2 className="font-mono text-lg font-bold mb-4 text-accent">
            Suggested Reading Order
          </h2>
          <ReadingPath
            items={guide.readingPath}
            repoUrl={guide.repoUrl}
          />
        </section>

        {/* Patterns & Conventions */}
        <section className="guide-section mb-10">
          <h2 className="font-mono text-lg font-bold mb-4 text-accent">
            Patterns &amp; Conventions
          </h2>
          <PatternsList patterns={guide.patterns} />
        </section>

        {/* Key Dependencies */}
        <section className="guide-section mb-10">
          <h2 className="font-mono text-lg font-bold mb-4 text-accent">
            Key Dependencies
          </h2>
          <DependencyOverview dependencies={guide.dependencies} />
        </section>

        {/* Footer actions */}
        <section className="guide-section border-t border-border pt-8 mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-lg border border-border bg-card text-sm hover:border-accent/50 transition-colors"
              >
                {copied ? "Copied!" : "Share this guide"}
              </button>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-lg border border-border bg-card text-sm hover:border-accent/50 transition-colors"
              >
                Regenerate
              </button>
            </div>
            <p className="text-muted-foreground text-xs">
              Generated {new Date(guide.generatedAt).toLocaleString()}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
