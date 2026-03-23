"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { GraphNode as GraphNodeType } from "@/lib/types";

const TYPE_COLORS: Record<string, { bar: string; bg: string; badge: string }> = {
  core: { bar: "bg-blue-500", bg: "bg-blue-500/5", badge: "bg-blue-500/15 text-blue-400" },
  api: { bar: "bg-amber-500", bg: "bg-amber-500/5", badge: "bg-amber-500/15 text-amber-400" },
  data: { bar: "bg-teal-500", bg: "bg-teal-500/5", badge: "bg-teal-500/15 text-teal-400" },
  ui: { bar: "bg-rose-500", bg: "bg-rose-500/5", badge: "bg-rose-500/15 text-rose-400" },
  config: { bar: "bg-zinc-500", bg: "bg-zinc-500/5", badge: "bg-zinc-500/15 text-zinc-400" },
  utility: { bar: "bg-zinc-400", bg: "bg-zinc-400/5", badge: "bg-zinc-400/15 text-zinc-300" },
  external: { bar: "bg-purple-500", bg: "bg-purple-500/5", badge: "bg-purple-500/15 text-purple-400" },
};

const TYPE_LABELS: Record<string, string> = {
  core: "Core",
  api: "API",
  data: "Data",
  ui: "UI",
  config: "Config",
  utility: "Util",
  external: "Ext",
};

type CustomNodeData = GraphNodeType & { onNodeClick: (node: GraphNodeType) => void };

function GraphNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as CustomNodeData;
  const colors = TYPE_COLORS[nodeData.type] || TYPE_COLORS.utility;
  const typeLabel = TYPE_LABELS[nodeData.type] || nodeData.type;

  const truncatedDesc =
    nodeData.description && nodeData.description.length > 50
      ? nodeData.description.slice(0, 50) + "..."
      : nodeData.description;

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2" />
      <div
        onClick={() => nodeData.onNodeClick(nodeData)}
        className={`min-w-[200px] w-[240px] rounded-lg border border-zinc-700 ${colors.bg} cursor-pointer hover:border-zinc-500 transition-all duration-150 hover:shadow-lg hover:shadow-black/20`}
        style={{ backgroundColor: "rgba(24, 24, 27, 0.9)" }}
      >
        <div className={`h-[3px] rounded-t-lg ${colors.bar}`} />
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-zinc-100 truncate">
              {nodeData.label}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${colors.badge}`}>
              {typeLabel}
            </span>
          </div>
          {truncatedDesc && (
            <p className="text-xs text-zinc-400 leading-tight truncate">
              {truncatedDesc}
            </p>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2" />
    </>
  );
}

export default memo(GraphNodeComponent);
