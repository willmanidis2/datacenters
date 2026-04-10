import fs from "fs";
import path from "path";
import { LegiScanBill, LegiScanBillStatus, AIBillCategory, LegislationCache } from "./types";

const LEGISCAN_BASE = "https://api.legiscan.com/";
const CACHE_PATH = path.join(process.cwd(), "data", "legislation-cache.json");
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const SEARCH_QUERIES = [
  '"data center" AND (moratorium OR ban OR zoning OR legislation OR permit)',
  '"artificial intelligence" AND (data center OR computing OR infrastructure)',
  '"artificial intelligence" AND (regulation OR transparency OR disclosure)',
  '"deepfake" AND (election OR crime OR penalty)',
  '"artificial intelligence" AND (government OR procurement OR task force)',
];

// State legislative session end dates (approximate, 2026)
const SESSION_END_DATES: Record<string, string> = {
  AL: "2026-05-18", AK: "2026-05-20", AZ: "2026-06-30", AR: "2026-04-15",
  CA: "2026-09-15", CO: "2026-05-06", CT: "2026-06-03", DE: "2026-06-30",
  FL: "2026-03-14", GA: "2026-04-02", HI: "2026-05-07", ID: "2026-04-01",
  IL: "2026-05-31", IN: "2026-04-29", IA: "2026-04-30", KS: "2026-05-15",
  KY: "2026-04-15", LA: "2026-06-01", ME: "2026-06-16", MD: "2026-04-13",
  MA: "2026-12-31", MI: "2026-12-31", MN: "2026-05-18", MS: "2026-04-05",
  MO: "2026-05-15", MT: "2026-04-25", NE: "2026-06-05", NV: "2026-06-02",
  NH: "2026-06-30", NJ: "2026-12-31", NM: "2026-03-21", NY: "2026-06-19",
  NC: "2026-07-01", ND: "2026-04-30", OH: "2026-12-31", OK: "2026-05-29",
  OR: "2026-06-28", PA: "2026-12-31", RI: "2026-06-30", SC: "2026-06-04",
  SD: "2026-03-13", TN: "2026-05-01", TX: "2026-06-01", UT: "2026-03-06",
  VT: "2026-05-15", VA: "2026-03-08", WA: "2026-04-26", WV: "2026-03-14",
  WI: "2026-12-31", WY: "2026-03-05",
};

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

function inferCategory(title: string, query: string): AIBillCategory {
  const t = title.toLowerCase();
  if (t.includes("data center") || t.includes("datacenter")) return "data_centers";
  if (t.includes("deepfake") || t.includes("deep fake") || t.includes("synthetic media")) return "deepfakes";
  if (t.includes("health") || t.includes("medical") || t.includes("patient")) return "ai_healthcare";
  if (t.includes("employ") || t.includes("workforce") || t.includes("labor") || t.includes("hiring") || t.includes("worker")) return "ai_employment";
  if (t.includes("education") || t.includes("school") || t.includes("student") || t.includes("classroom")) return "ai_education";
  if (t.includes("privacy") || t.includes("personal data") || t.includes("biometric")) return "ai_privacy";
  if (t.includes("criminal") || t.includes("law enforcement") || t.includes("police") || t.includes("sentencing")) return "ai_criminal_justice";
  if (t.includes("government") || t.includes("state agenc") || t.includes("task force") || t.includes("procurement")) return "ai_government";
  if (query.includes("deepfake")) return "deepfakes";
  if (query.includes("government") || query.includes("procurement")) return "ai_government";
  return "ai_regulation";
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
        category: inferCategory(b.title || "", query),
        session_end_date: SESSION_END_DATES[b.state] || undefined,
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

  let dedupedBills = Array.from(billMap.values()).sort(
    (a, b) => b.last_action_date.localeCompare(a.last_action_date)
  );

  // Preserve existing enrichment data from previous cache
  const existingCache = readCache();
  if (existingCache) {
    const existingMap = new Map(existingCache.bills.map((b) => [`${b.state}:${b.bill_number}`, b]));
    for (const bill of dedupedBills) {
      const existing = existingMap.get(`${bill.state}:${bill.bill_number}`);
      if (existing) {
        if (!bill.ai_summary && existing.ai_summary) bill.ai_summary = existing.ai_summary;
        if (!bill.introducer_party && existing.introducer_party) {
          bill.introducer_party = existing.introducer_party;
          bill.introducer_name = existing.introducer_name;
        }
        if (!bill.category && existing.category) bill.category = existing.category;
        if (!bill.session_end_date && existing.session_end_date) bill.session_end_date = existing.session_end_date;
      }
    }
  }

  // Run AI enrichment (summaries, party info)
  dedupedBills = await enrichBills(dedupedBills);

  const cache: LegislationCache = {
    bills: dedupedBills,
    lastRefreshed: new Date().toISOString(),
    queryTerms: SEARCH_QUERIES,
    totalResults: dedupedBills.length,
  };

  writeCache(cache);
  return cache;
}

// Enrich bills with AI summaries and party info (runs during daily cache refresh)
async function enrichBills(bills: LegiScanBill[]): Promise<LegiScanBill[]> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey || anthropicKey === "your_key_here") {
    console.log("No Anthropic API key configured, skipping AI enrichment");
    return bills;
  }

  // Only enrich bills that don't already have a summary
  const needsEnrichment = bills.filter((b) => !b.ai_summary);
  if (needsEnrichment.length === 0) return bills;

  // Batch bills in groups of 20 for efficiency
  const batchSize = 20;
  const batches: LegiScanBill[][] = [];
  for (let i = 0; i < needsEnrichment.length; i += batchSize) {
    batches.push(needsEnrichment.slice(i, i + batchSize));
  }

  console.log(`Enriching ${needsEnrichment.length} bills in ${batches.length} batches...`);

  for (const batch of batches) {
    try {
      const prompt = batch
        .map((b, i) => `${i + 1}. [${b.state} ${b.bill_number}] "${b.title}" - Last action: ${b.last_action}`)
        .join("\n");

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: `For each bill below, provide a 1-2 sentence plain-language summary of what it does and its implications. Return ONLY a JSON array of objects with "index" (1-based) and "summary" fields. No markdown.\n\n${prompt}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text || "";
        try {
          const summaries = JSON.parse(text) as { index: number; summary: string }[];
          for (const s of summaries) {
            const bill = batch[s.index - 1];
            if (bill) {
              bill.ai_summary = s.summary;
            }
          }
        } catch {
          console.warn("Failed to parse AI summary response");
        }
      }
    } catch (err) {
      console.warn("AI enrichment batch failed:", err);
    }
  }

  // Try to get introducer party from the first sponsor via LegiScan getBill
  // Only for bills without party info, and limit to avoid quota issues
  const needsParty = bills.filter((b) => !b.introducer_party && b.bill_id > 0).slice(0, 50);
  for (const bill of needsParty) {
    try {
      const detail = await getBillDetail(bill.bill_id);
      if (detail.sponsors.length > 0) {
        const primary = detail.sponsors[0];
        bill.introducer_party = primary.party === "D" ? "D" : primary.party === "R" ? "R" : primary.party === "I" ? "I" : "unknown";
        bill.introducer_name = primary.name;
      }
    } catch {
      // Skip on error
    }
  }

  return bills;
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

  // Extract votes
  const votes = (bill.votes || []).map(
    (v: { date: string; chamber: string; yea: number; nay: number; absent: number; passed: number }) => ({
      date: v.date,
      chamber: v.chamber || "",
      yea: v.yea || 0,
      nay: v.nay || 0,
      absent: v.absent || 0,
      passed: v.passed === 1,
    })
  );

  // Get bill text URL
  const textEntry = bill.texts?.[0];
  const textUrl = textEntry?.state_link || textEntry?.url || "";

  // Try to get session end date from the session object
  const sessionEndDate = bill.session?.sine_die || bill.session?.end_date || "";

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
    votes,
    subjects: (bill.subjects || []).map(
      (s: { subject_name: string }) => s.subject_name
    ),
    url: bill.url || "",
    text_url: textUrl,
    state_link: bill.state_link || "",
    session_end_date: sessionEndDate,
  };
}
