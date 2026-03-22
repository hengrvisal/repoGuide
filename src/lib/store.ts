import { AnalysisResult } from "./types";

// In-memory store for analysis results (week 1 — will be replaced with DB in week 3)
const store = new Map<string, AnalysisResult>();

export function saveAnalysis(id: string, result: AnalysisResult): void {
  store.set(id, result);
}

export function getAnalysis(id: string): AnalysisResult | undefined {
  return store.get(id);
}
