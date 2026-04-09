import { NextResponse } from "next/server";
import stateStatusesData from "@/data/state-statuses.json";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const state = stateStatusesData.states.find((s) => s.slug === params.slug);

  if (!state) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  return NextResponse.json(state);
}
