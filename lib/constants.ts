import { LegislativeStatus } from "./types";

export const STATUS_CONFIG: Record<
  LegislativeStatus,
  { color: string; label: string }
> = {
  moratorium_enacted: { color: "#DC2626", label: "Moratorium Enacted" },
  ban_enacted: { color: "#7F1D1D", label: "Ban Enacted" },
  bill_in_progress: { color: "#D97706", label: "Bill In Progress" },
  under_review: { color: "#CA8A04", label: "Under Review" },
  no_activity: { color: "#D1D5DB", label: "No Known Activity" },
  favorable: { color: "#16A34A", label: "Favorable / Incentives" },
};

export const GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=%22data+center%22+moratorium+OR+ban+OR+legislation&hl=en-US&gl=US&ceid=US:en";

export const NEWS_CACHE_SECONDS = 900; // 15 minutes
export const AI_SUMMARY_CACHE_MS = 3600000; // 1 hour
