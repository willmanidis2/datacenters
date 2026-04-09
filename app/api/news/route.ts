import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/fetchNews";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state") || undefined;

  const items = await fetchNews(state);

  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    }
  );
}
