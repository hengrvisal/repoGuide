"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AnalysisResult } from "@/lib/types";
import { GuideView } from "@/components/GuideView";

export default function GuidePage() {
  const params = useParams();
  const id = params.id as string;
  const [guide, setGuide] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuide() {
      try {
        const res = await fetch(`/api/guide/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Guide not found. It may have expired — try generating a new one.");
          } else {
            setError("Failed to load guide.");
          }
          return;
        }
        const data: AnalysisResult = await res.json();
        setGuide(data);
      } catch {
        setError("Failed to load guide. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchGuide();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          Loading guide...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
          >
            Generate a new guide
          </a>
        </div>
      </div>
    );
  }

  if (!guide) return null;

  return <GuideView guide={guide} />;
}
