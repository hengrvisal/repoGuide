export interface ArchitectureGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  description: string;
  type: "core" | "api" | "data" | "ui" | "config" | "utility" | "external";
  keyFiles: string[];
  patterns: string[];
  linesOfCode?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type: "import" | "api-call" | "data-flow" | "event" | "config";
}

export interface AnalysisResult {
  id: string;
  repoUrl: string;
  owner: string;
  repo: string;
  stars: number;
  lastUpdated: string;
  generatedAt: string;
  summary: {
    description: string;
    primaryLanguage: string;
    framework: string | null;
    buildTool: string | null;
  };
  architecture: string;
  architectureGraph?: ArchitectureGraph;
  folderMap: FolderAnnotation[];
  readingPath: ReadingPathItem[];
  patterns: Pattern[];
  dependencies: DependencyInfo[];
}

export interface FolderAnnotation {
  path: string;
  type: "directory" | "file";
  annotation: string;
  importance: "high" | "medium" | "low";
  children?: FolderAnnotation[];
}

export interface ReadingPathItem {
  order: number;
  path: string;
  reason: string;
  lookFor: string;
  estimatedMinutes: number;
}

export interface Pattern {
  name: string;
  category:
    | "architecture"
    | "testing"
    | "state"
    | "api"
    | "styling"
    | "error-handling"
    | "other";
  description: string;
}

export interface DependencyInfo {
  name: string;
  role: string;
  whyChosen: string;
}

export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  default_branch: string;
  html_url: string;
  size: number;
}

export interface TreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface SSEEvent {
  step: number;
  message: string;
  guideId?: string;
  error?: string;
}

export interface ClaudeAnalysis {
  summary: {
    description: string;
    primaryLanguage: string;
    framework: string | null;
    buildTool: string | null;
  };
  architecture: string;
  architectureGraph?: ArchitectureGraph;
  folderMap: FolderAnnotation[];
  readingPath: ReadingPathItem[];
  patterns: Pattern[];
  dependencies: DependencyInfo[];
}
