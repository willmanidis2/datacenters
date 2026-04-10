import { NextResponse } from "next/server";
import { readCache, isCacheStale, refreshAllBills } from "@/lib/legiscan";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  try {
    let cache = readCache();

    if (!cache || force || isCacheStale(cache)) {
      cache = await refreshAllBills();
    }

    return NextResponse.json(cache, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    // If API key is missing or API fails, return empty cache if available
    const fallback = readCache();
    if (fallback) {
      return NextResponse.json(fallback);
    }
    return NextResponse.json(
      {
        bills: [],
        lastRefreshed: null,
        queryTerms: [],
        totalResults: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const cache = await refreshAllBills();
    return NextResponse.json(cache);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
