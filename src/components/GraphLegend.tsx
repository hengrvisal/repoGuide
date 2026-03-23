"use client";

import { useState } from "react";

const NODE_TYPE_INFO: Record<string, { color: string; label: string }> = {
  core: { color: "bg-blue-500", label: "Core" },
  api: { color: "bg-amber-500", label: "API" },
  data: { color: "bg-teal-500", label: "Data" },
  ui: { color: "bg-rose-500", label: "UI" },
  config: { color: "bg-zinc-500", label: "Config" },
  utility: { color: "bg-zinc-400", label: "Utility" },
  external: { color: "bg-purple-500", label: "External" },
};

export function GraphLegend({ nodeTypes }: { nodeTypes: string[] }) {
  const [collapsed, setCollapsed] = useState(false);

  const presentTypes = nodeTypes.filter((t) => NODE_TYPE_INFO[t]);
  if (presentTypes.length === 0) return null;

  return (
    <div className="absolute top-3 left-3 z-10">
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-700/50 overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors w-full"
        >
          <svg
            className={`w-3 h-3 transition-transform ${collapsed ? "-rotate-90" : ""}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
          Legend
        </button>

        {!collapsed && (
          <div className="px-2.5 pb-2 space-y-1">
            {presentTypes.map((type) => {
              const info = NODE_TYPE_INFO[type];
              return (
                <div key={type} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${info.color}`} />
                  <span className="text-[11px] text-zinc-400">{info.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
