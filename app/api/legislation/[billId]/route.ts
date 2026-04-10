import { NextResponse } from "next/server";
import { getBillDetail } from "@/lib/legiscan";

export async function GET(
  _request: Request,
  { params }: { params: { billId: string } }
) {
  const billId = parseInt(params.billId, 10);
  if (isNaN(billId)) {
    return NextResponse.json({ error: "Invalid bill ID" }, { status: 400 });
  }

  try {
    const detail = await getBillDetail(billId);
    return NextResponse.json(detail, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
