import { NextRequest } from "next/server";
import { getAnalysis } from "@/lib/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const analysis = getAnalysis(params.id);

  if (!analysis) {
    return new Response(JSON.stringify({ error: "Guide not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(analysis), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
