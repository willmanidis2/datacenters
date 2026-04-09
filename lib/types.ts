export type LegislativeStatus =
  | "moratorium_enacted"
  | "ban_enacted"
  | "bill_in_progress"
  | "under_review"
  | "no_activity"
  | "favorable";

export interface Bill {
  id: string;
  title: string;
  status: string;
  url?: string;
}

export interface StateData {
  id: string; // Two-letter abbreviation (e.g., "NY")
  fips: string; // Zero-padded FIPS code (e.g., "36")
  name: string;
  slug: string; // URL slug (e.g., "new-york")
  status: LegislativeStatus;
  summary: string;
  bills: Bill[];
  lastUpdated: string; // ISO date string
  tags: string[];
}

export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
}

export interface StateStatusesData {
  states: StateData[];
}
