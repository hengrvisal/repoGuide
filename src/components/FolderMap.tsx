"use client";

import { useState } from "react";
import { FolderAnnotation } from "@/lib/types";

function FolderItem({
  item,
  repoUrl,
  depth,
}: {
  item: FolderAnnotation;
  repoUrl: string;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(item.importance === "high");
  const hasChildren = item.children && item.children.length > 0;
  const isDirectory = item.type === "directory";

  const importanceColor =
    item.importance === "high"
      ? "text-accent"
      : item.importance === "medium"
        ? "text-foreground/80"
        : "text-muted-foreground";

  return (
    <div>
      <div
        className="flex items-start gap-2 py-1.5 group"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Expand/collapse or file icon */}
        {isDirectory && hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
          >
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>
        ) : (
          <span className="w-5 h-5 flex items-center justify-center text-muted-foreground flex-shrink-0 mt-0.5">
            {isDirectory ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
              </svg>
            )}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <a
              href={`${repoUrl}/${isDirectory ? "tree" : "blob"}/HEAD/${item.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-mono text-sm font-medium ${importanceColor} hover:underline`}
            >
              {item.path.split("/").pop()}{isDirectory ? "/" : ""}
            </a>
            <span className="text-muted-foreground text-sm">
              {item.annotation}
            </span>
          </div>
        </div>
      </div>

      {expanded && hasChildren && (
        <div>
          {item.children!.map((child) => (
            <FolderItem
              key={child.path}
              item={child}
              repoUrl={repoUrl}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderMap({
  items,
  repoUrl,
}: {
  items: FolderAnnotation[];
  repoUrl: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {items.map((item) => (
        <FolderItem key={item.path} item={item} repoUrl={repoUrl} depth={0} />
      ))}
    </div>
  );
}
