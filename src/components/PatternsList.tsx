"use client";

import { Pattern } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  architecture: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  testing: "bg-green-500/10 text-green-400 border-green-500/20",
  state: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  api: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  styling: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  "error-handling": "bg-red-500/10 text-red-400 border-red-500/20",
  other: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export function PatternsList({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="space-y-3">
      {patterns.map((pattern, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[pattern.category] || CATEGORY_COLORS.other}`}
            >
              {pattern.category}
            </span>
            <h3 className="font-medium text-sm">{pattern.name}</h3>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {pattern.description}
          </p>
        </div>
      ))}
    </div>
  );
}
