"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import type { ArchitectureGraph, GraphNode as GraphNodeType, GraphEdge } from "@/lib/types";
import GraphNodeComponent from "./GraphNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { GraphLegend } from "./GraphLegend";

const EDGE_TYPE_STYLES: Record<string, { stroke: string; strokeDasharray?: string }> = {
  import: { stroke: "#71717a" },
  "api-call": { stroke: "#f59e0b" },
  "data-flow": { stroke: "#14b8a6" },
  event: { stroke: "#a855f7", strokeDasharray: "5 3" },
  config: { stroke: "#71717a", strokeDasharray: "3 3" },
};

const nodeTypes = { custom: GraphNodeComponent };

function layoutGraph(graph: ArchitectureGraph): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", nodesep: 100, ranksep: 120 });

  graph.nodes.forEach((node) => g.setNode(node.id, { width: 240, height: 90 }));

  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const validEdges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  validEdges.forEach((edge) => g.setEdge(edge.source, edge.target));

  Dagre.layout(g);

  const nodes: Node[] = graph.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      type: "custom",
      position: { x: pos.x - 120, y: pos.y - 45 },
      data: { ...node },
    };
  });

  const edges: Edge[] = validEdges.map((edge, i) => {
    const style = EDGE_TYPE_STYLES[edge.type] || EDGE_TYPE_STYLES.import;
    return {
      id: `e-${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: false,
      label: edge.label || undefined,
      labelStyle: { fontSize: 11, fill: "#a1a1aa" },
      labelBgStyle: { fill: "rgba(24, 24, 27, 0.85)", fillOpacity: 0.85 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      style: {
        stroke: style.stroke,
        strokeWidth: 1.5,
        strokeDasharray: style.strokeDasharray,
      },
    };
  });

  return { nodes, edges };
}

interface Connection {
  nodeId: string;
  nodeLabel: string;
  direction: "outgoing" | "incoming";
  edgeLabel?: string;
}

function getConnections(
  nodeId: string,
  graphEdges: GraphEdge[],
  graphNodes: GraphNodeType[]
): Connection[] {
  const nodeMap = new Map(graphNodes.map((n) => [n.id, n]));
  const connections: Connection[] = [];

  for (const edge of graphEdges) {
    if (edge.source === nodeId && nodeMap.has(edge.target)) {
      connections.push({
        nodeId: edge.target,
        nodeLabel: nodeMap.get(edge.target)!.label,
        direction: "outgoing",
        edgeLabel: edge.label,
      });
    }
    if (edge.target === nodeId && nodeMap.has(edge.source)) {
      connections.push({
        nodeId: edge.source,
        nodeLabel: nodeMap.get(edge.source)!.label,
        direction: "incoming",
        edgeLabel: edge.label,
      });
    }
  }

  return connections;
}

function ArchitectureMapInner({
  graph,
  repoUrl,
}: {
  graph: ArchitectureGraph;
  repoUrl: string;
}) {
  const [selectedNode, setSelectedNode] = useState<GraphNodeType | null>(null);
  const panelOpen = selectedNode !== null;
  const reactFlowInstance = useReactFlow();
  const fitTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleNodeClick = useCallback((nodeData: GraphNodeType) => {
    setSelectedNode(nodeData);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Re-fit view when panel opens/closes
  useEffect(() => {
    if (fitTimeoutRef.current) clearTimeout(fitTimeoutRef.current);
    fitTimeoutRef.current = setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.15, duration: 200 });
    }, 220);
    return () => {
      if (fitTimeoutRef.current) clearTimeout(fitTimeoutRef.current);
    };
  }, [panelOpen, reactFlowInstance]);

  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    const graphWithHandler = {
      ...graph,
      nodes: graph.nodes.map((n) => ({ ...n, onNodeClick: handleNodeClick })),
    };
    return layoutGraph(graphWithHandler as ArchitectureGraph);
  }, [graph, handleNodeClick]);

  const [nodes, , onNodesChange] = useNodesState(layoutNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutEdges);

  const nodeTypeList = useMemo(
    () => Array.from(new Set(graph.nodes.map((n) => n.type))),
    [graph.nodes]
  );

  const connections = useMemo(
    () =>
      selectedNode
        ? getConnections(selectedNode.id, graph.edges, graph.nodes)
        : [],
    [selectedNode, graph.edges, graph.nodes]
  );

  const showMiniMap = graph.nodes.length >= 6;

  return (
    <div className="px-4 sm:px-8">
      <div className="flex h-[350px] md:h-[450px] lg:h-[600px] rounded-xl overflow-hidden border border-zinc-800 graph-edge-fade">
        {/* Graph area */}
        <div
          className="relative flex-1 transition-all duration-200 ease-out"
          style={{ minWidth: 0 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            minZoom={0.3}
            maxZoom={2}
            onPaneClick={handleClose}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="rgba(255,255,255,0.03)"
              gap={20}
              size={1}
            />
            <Controls
              showInteractive={false}
              position="bottom-left"
              className="!bg-zinc-800/80 !border-zinc-700 !rounded-lg !shadow-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-700 [&>button]:!w-7 [&>button]:!h-7 [&>button>svg]:!fill-zinc-400"
            />
            {showMiniMap && (
              <MiniMap
                className="!bg-zinc-900/80 !border-zinc-700 !rounded-lg hidden md:block !w-[120px] !h-[80px]"
                nodeColor="#3f3f46"
                maskColor="rgba(0, 0, 0, 0.6)"
              />
            )}
          </ReactFlow>

          <GraphLegend nodeTypes={nodeTypeList} />
        </div>

        {/* Desktop/Tablet side panel */}
        <div
          className={`hidden md:block transition-all duration-200 ease-out overflow-hidden ${
            panelOpen ? "w-[260px] lg:w-[320px]" : "w-0"
          }`}
        >
          <div className="w-[260px] lg:w-[320px] h-full">
            <NodeDetailPanel
              node={selectedNode}
              repoUrl={repoUrl}
              connections={connections}
              onClose={handleClose}
              mode="side"
            />
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <NodeDetailPanel
          node={selectedNode}
          repoUrl={repoUrl}
          connections={connections}
          onClose={handleClose}
          mode="bottom"
        />
      </div>
    </div>
  );
}

export function ArchitectureMap({
  graph,
  repoUrl,
}: {
  graph: ArchitectureGraph;
  repoUrl: string;
}) {
  return (
    <ReactFlowProvider>
      <ArchitectureMapInner graph={graph} repoUrl={repoUrl} />
    </ReactFlowProvider>
  );
}
