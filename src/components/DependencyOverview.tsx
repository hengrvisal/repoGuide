"use client";

import { DependencyInfo } from "@/lib/types";

export function DependencyOverview({
  dependencies,
}: {
  dependencies: DependencyInfo[];
}) {
  return (
    <div className="grid gap-3">
      {dependencies.map((dep, i) => (
        <div
          key={i}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h3 className="font-mono text-sm font-bold text-accent mb-1.5">
            {dep.name}
          </h3>
          <p className="text-foreground/85 text-sm mb-1">{dep.role}</p>
          <p className="text-muted-foreground text-xs">{dep.whyChosen}</p>
        </div>
      ))}
    </div>
  );
}
