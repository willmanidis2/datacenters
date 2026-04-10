export type LegislativeStatus =
  | "active_restrictions"
  | "legislation_advancing"
  | "under_discussion"
  | "no_action"
  | "favorable";

export interface Bill {
  id: string;
  title: string;
  status: string;
  url?: string;
}

export interface LocalMoratorium {
  locality: string;
  countyFips: string;
  type: "moratorium" | "construction_pause" | "zoning_restriction" | "ban" | "permit_freeze";
  status: "active" | "expired" | "proposed" | "enacted";
  date: string;
  description: string;
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
  localMoratoriums?: LocalMoratorium[];
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

export interface ConstructionProject {
  name: string;
  owner: string;
  users: string[];
  powerMW: number;
  capitalCostB: number;
  lat: number;
  lng: number;
  state: string;
  stateId: string;
  status: "active" | "delayed" | "deferred" | "cancelled" | "planned";
  address: string;
  project: string | null;
  h100Equivalents: number;
  notes: string;
  sources: string[];
  timelineEvents: TimelineEvent[];
}

export interface TimelineEvent {
  date: string;
  description: string;
}

export type MapView = "moratoriums" | "construction";
