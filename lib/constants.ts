import { LegislativeStatus } from "./types";

export const STATUS_CONFIG: Record<
  LegislativeStatus,
  { color: string; label: string }
> = {
  active_restrictions: { color: "#FF3B30", label: "Active Bans / Moratoriums" },
  legislation_advancing: { color: "#FF9500", label: "Legislation Advancing" },
  under_discussion: { color: "#5856D6", label: "Under Discussion" },
  no_action: { color: "#C7C7CC", label: "No Action" },
  favorable: { color: "#34C759", label: "Favorable / Incentives" },
};

export const GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export const COUNTIES_GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

// Number of counties per state (for percentage calculations)
export const STATE_COUNTY_COUNTS: Record<string, number> = {
  AL: 67, AK: 30, AZ: 15, AR: 75, CA: 58, CO: 64, CT: 8, DE: 3,
  FL: 67, GA: 159, HI: 5, ID: 44, IL: 102, IN: 92, IA: 99, KS: 105,
  KY: 120, LA: 64, ME: 16, MD: 24, MA: 14, MI: 83, MN: 87, MS: 82,
  MO: 115, MT: 56, NE: 93, NV: 17, NH: 10, NJ: 21, NM: 33, NY: 62,
  NC: 100, ND: 53, OH: 88, OK: 77, OR: 36, PA: 67, RI: 5, SC: 46,
  SD: 66, TN: 95, TX: 254, UT: 29, VT: 14, VA: 133, WA: 39, WV: 55,
  WI: 72, WY: 23,
};

export const NEWS_RSS_URL =
  "https://news.google.com/rss/search?q=%22data+center%22+moratorium+OR+ban+OR+legislation&hl=en-US&gl=US&ceid=US:en";

export const NEWS_CACHE_SECONDS = 900; // 15 minutes
export const AI_SUMMARY_CACHE_MS = 3600000; // 1 hour
