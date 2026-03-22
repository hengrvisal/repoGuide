"use client";

import { ReadingPathItem } from "@/lib/types";

export function ReadingPath({
  items,
  repoUrl,
}: {
  items: ReadingPathItem[];
  repoUrl: string;
}) {
  const sorted = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sorted.map((item) => (
        <div
          key={item.order}
          className="rounded-xl border border-border bg-card p-5 hover:border-accent/30 transition-colors"
        >
          <div className="flex items-start gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-mono text-sm font-bold flex items-center justify-center">
              {item.order}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <a
                  href={`${repoUrl}/blob/HEAD/${item.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="path-pill hover:border-accent/50 transition-colors truncate"
                >
                  {item.path}
                </a>
                <span className="text-muted-foreground text-xs flex-shrink-0">
                  ~{item.estimatedMinutes} min
                </span>
              </div>
              <p className="text-foreground/85 text-sm mb-2">
                <span className="text-accent font-medium">Why: </span>
                {item.reason}
              </p>
              <p className="text-muted-foreground text-sm">
                <span className="text-foreground/60 font-medium">Look for: </span>
                {item.lookFor}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
