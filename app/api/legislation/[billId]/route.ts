import { NextResponse } from "next/server";
import { getBillDetail, readCache } from "@/lib/legiscan";

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

    // Merge cached enrichment data (AI summary, party)
    const cache = readCache();
    const cachedBill = cache?.bills.find((b) => b.bill_id === billId);
    if (cachedBill) {
      if (cachedBill.ai_summary) {
        (detail as Record<string, unknown>).ai_summary = cachedBill.ai_summary;
      }
      if (cachedBill.introducer_party) {
        (detail as Record<string, unknown>).introducer_party = cachedBill.introducer_party;
      }
      if (cachedBill.session_end_date) {
        detail.session_end_date = cachedBill.session_end_date;
      }
    }

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
