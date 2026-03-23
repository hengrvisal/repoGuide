"use client";

import { useEffect, useCallback } from "react";
import type { GraphNode } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  core: "bg-blue-500/15 text-blue-400",
  api: "bg-amber-500/15 text-amber-400",
  data: "bg-teal-500/15 text-teal-400",
  ui: "bg-rose-500/15 text-rose-400",
  config: "bg-zinc-500/15 text-zinc-400",
  utility: "bg-zinc-400/15 text-zinc-300",
  external: "bg-purple-500/15 text-purple-400",
};

interface Connection {
  nodeId: string;
  nodeLabel: string;
  direction: "outgoing" | "incoming";
  edgeLabel?: string;
}

export function NodeDetailPanel({
  node,
  repoUrl,
  connections,
  onClose,
  mode,
}: {
  node: GraphNode | null;
  repoUrl: string;
  connections: Connection[];
  onClose: () => void;
  mode: "side" | "bottom";
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!node) return null;

  const badgeColor = TYPE_COLORS[node.type] || TYPE_COLORS.utility;

  const content = (
    <div className="p-5">
      {/* Handle bar for mobile bottom sheet */}
      {mode === "bottom" && (
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-zinc-600" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="font-mono text-lg font-semibold text-zinc-100">
            {node.label}
          </h3>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1.5 ${badgeColor}`}>
            {node.type}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 flex-shrink-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-300 leading-relaxed mb-5">
        {node.description}
      </p>

      {/* Key Files */}
      {node.keyFiles && node.keyFiles.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Key files to explore
          </h4>
          <div className="space-y-1.5">
            {node.keyFiles.map((file) => (
              <a
                key={file}
                href={`${repoUrl}/blob/HEAD/${file}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-accent hover:border-zinc-500 hover:text-blue-300 transition-colors group"
              >
                <span className="truncate flex-1">{file}</span>
                <svg className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Patterns */}
      {node.patterns && node.patterns.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Patterns used
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {node.patterns.map((pattern) => (
              <span
                key={pattern}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400"
              >
                {pattern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connected to */}
      {connections.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Connected to
          </h4>
          <div className="space-y-1">
            {connections.map((conn, i) => (
              <div
                key={`${conn.nodeId}-${conn.direction}-${i}`}
                className="flex items-center gap-2 text-xs text-zinc-400"
              >
                <span className={`flex-shrink-0 ${conn.direction === "outgoing" ? "text-accent" : "text-teal-400"}`}>
                  {conn.direction === "outgoing" ? "→" : "←"}
                </span>
                <span className="text-zinc-300">{conn.nodeLabel}</span>
                {conn.edgeLabel && (
                  <span className="text-zinc-600 italic">{conn.edgeLabel}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (mode === "side") {
    return (
      <div className="h-full bg-zinc-900 border-l border-zinc-700 overflow-y-auto">
        {content}
      </div>
    );
  }

  // Bottom sheet mode (mobile)
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[50vh] rounded-t-2xl bg-zinc-900 border-t border-zinc-700 overflow-y-auto"
        style={{ animation: "fade-in-up 0.2s ease-out forwards" }}
      >
        {content}
      </div>
    </>
  );
}
