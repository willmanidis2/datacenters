import TabNav from "@/components/TabNav";
import LegislationSummary from "@/components/Legislation/LegislationSummary";
import LegislationView from "@/components/Legislation/LegislationView";
import type { Metadata } from "next";
import { LegislationCache } from "@/lib/types";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "AI Legislation — Data Center Moratoriums",
  description:
    "Track AI and data center legislation across all 50 states. Bills tracked via LegiScan.",
};

function readCacheFile(): LegislationCache | null {
  try {
    const cachePath = path.join(process.cwd(), "data", "legislation-cache.json");
    const raw = fs.readFileSync(cachePath, "utf-8");
    return JSON.parse(raw) as LegislationCache;
  } catch {
    return null;
  }
}

export default function LegislationPage() {
  const cache = readCacheFile();
  const bills = cache?.bills ?? [];
  const lastRefreshed = cache?.lastRefreshed ?? null;

  return (
    <main>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <TabNav />
        <div className="text-center mt-8 mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            AI Legislation Tracker
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Data center and AI-related bills across all 50 states
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {bills.length} bills tracked &middot;{" "}
            {new Set(bills.map((b) => b.state)).size} states &middot; Data from{" "}
            <a
              href="https://legiscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              LegiScan
            </a>
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-4">
        <LegislationSummary bills={bills} lastRefreshed={lastRefreshed} />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <LegislationView bills={bills} lastRefreshed={lastRefreshed} />
      </section>

      <footer className="border-t border-slate-200 mt-12 py-8 text-center text-sm text-slate-400">
        Data from{" "}
        <a
          href="https://legiscan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          LegiScan
        </a>{" "}
        &middot; Built by{" "}
        <a
          href="https://x.com/willmanidis"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          @willmanidis
        </a>
      </footer>
    </main>
  );
}
