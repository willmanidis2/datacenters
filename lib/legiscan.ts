import fs from "fs";
import path from "path";
import { LegiScanBill, LegiScanBillStatus, LegislationCache } from "./types";

const LEGISCAN_BASE = "https://api.legiscan.com/";
const CACHE_PATH = path.join(process.cwd(), "data", "legislation-cache.json");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const SEARCH_QUERIES = [
  '"data center" AND (moratorium OR ban OR zoning OR legislation OR permit)',
  '"artificial intelligence" AND (data center OR computing OR infrastructure)',
];

function getApiKey(): string {
  const key = process.env.LEGISCAN_API_KEY;
  if (!key) throw new Error("LEGISCAN_API_KEY not set");
  return key;
}

// Map LegiScan numeric status to our enum
function normalizeStatus(statusCode: number): LegiScanBillStatus {
  switch (statusCode) {
    case 1:
      return "introduced";
    case 2:
      return "engrossed";
    case 3:
      return "enrolled";
    case 4:
      return "passed";
    case 5:
      return "vetoed";
    case 6:
      return "failed";
    default:
      return "pending";
  }
}

// Infer status from last_action text when numeric code isn't available
function inferStatus(lastAction: string): LegiScanBillStatus {
  const a = lastAction.toLowerCase();
  if (a.includes("signed by governor") || a.includes("enacted") || a.includes("public law")) return "passed";
  if (a.includes("vetoed")) return "vetoed";
  if (a.includes("failed") || a.includes("indefinitely postponed") || a.includes("died")) return "failed";
  if (a.includes("engrossed")) return "engrossed";
  if (a.includes("enrolled")) return "enrolled";
  if (a.includes("introduced") || a.includes("referred to") || a.includes("first reading") || a.includes("from printer")) return "introduced";
  return "pending";
}

export async function searchBills(query: string): Promise<LegiScanBill[]> {
  const key = getApiKey();
  const bills: LegiScanBill[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= 5) {
    // Max 5 pages = 10,000 results
    const url = `${LEGISCAN_BASE}?key=${key}&op=getSearchRaw&state=ALL&query=${encodeURIComponent(query)}&year=2&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`LegiScan API error: ${res.status}`);

    const data = await res.json();
    if (data.status !== "OK") {
      throw new Error(`LegiScan error: ${data.alert?.message || "Unknown"}`);
    }

    const result = data.searchresult;
    if (!result) break;

    // Parse summary for pagination
    if (result.summary) {
      totalPages = result.summary.page_total || 1;
    }

    // Extract bills (keys are numeric strings, skip "summary")
    for (const key of Object.keys(result)) {
      if (key === "summary") continue;
      const b = result[key];
      if (!b || !b.bill_id) continue;

      bills.push({
        bill_id: b.bill_id,
        bill_number: b.bill_number || "",
        state: b.state || "",
        title: b.title || "",
        status: b.status ? normalizeStatus(Number(b.status)) : inferStatus(b.last_action || ""),
        last_action_date: b.last_action_date || "",
        last_action: b.last_action || "",
        relevance: b.relevance || 0,
        url: b.url || "",
        text_url: b.text_url || "",
        research_url: b.research_url || "",
        change_hash: b.change_hash || "",
        search_query: query,
      });
    }

    page++;
  }

  return bills;
}

export async function refreshAllBills(): Promise<LegislationCache> {
  const allBills: LegiScanBill[] = [];

  for (const query of SEARCH_QUERIES) {
    const results = await searchBills(query);
    allBills.push(...results);
  }

  // Deduplicate by bill_id, keep highest relevance
  const billMap = new Map<number, LegiScanBill>();
  for (const bill of allBills) {
    const existing = billMap.get(bill.bill_id);
    if (!existing || bill.relevance > existing.relevance) {
      billMap.set(bill.bill_id, bill);
    }
  }

  const dedupedBills = Array.from(billMap.values()).sort(
    (a, b) => b.last_action_date.localeCompare(a.last_action_date)
  );

  const cache: LegislationCache = {
    bills: dedupedBills,
    lastRefreshed: new Date().toISOString(),
    queryTerms: SEARCH_QUERIES,
    totalResults: dedupedBills.length,
  };

  writeCache(cache);
  return cache;
}

export function readCache(): LegislationCache | null {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf-8");
    return JSON.parse(raw) as LegislationCache;
  } catch {
    return null;
  }
}

export function writeCache(data: LegislationCache): void {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2) + "\n");
}

export function isCacheStale(cache: LegislationCache): boolean {
  const age = Date.now() - new Date(cache.lastRefreshed).getTime();
  return age > CACHE_MAX_AGE_MS;
}

export async function getBillDetail(billId: number) {
  const key = getApiKey();
  const url = `${LEGISCAN_BASE}?key=${key}&op=getBill&id=${billId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`LegiScan API error: ${res.status}`);

  const data = await res.json();
  if (data.status !== "OK") {
    throw new Error(`LegiScan error: ${data.alert?.message || "Unknown"}`);
  }

  const bill = data.bill;
  if (!bill) throw new Error("No bill data returned");

  return {
    bill_id: bill.bill_id,
    bill_number: bill.bill_number,
    state: bill.state,
    title: bill.title,
    description: bill.description || "",
    status: bill.status_desc || normalizeStatus(bill.status),
    status_date: bill.status_date || "",
    sponsors: (bill.sponsors || []).map(
      (s: { name: string; party: string; sponsor_type_desc: string }) => ({
        name: s.name,
        party: s.party || "",
        role: s.sponsor_type_desc || "Sponsor",
      })
    ),
    history: (bill.history || []).map(
      (h: { date: string; action: string; chamber: string }) => ({
        date: h.date,
        action: h.action,
        chamber: h.chamber || "",
      })
    ),
    subjects: (bill.subjects || []).map(
      (s: { subject_name: string }) => s.subject_name
    ),
    url: bill.url || "",
    text_url: bill.texts?.[0]?.state_link || bill.texts?.[0]?.url || "",
    state_link: bill.state_link || "",
  };
}
