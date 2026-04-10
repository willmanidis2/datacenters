import TabNav from "@/components/TabNav";
import TimelineView from "@/components/Legislation/TimelineView";
import type { Metadata } from "next";
import { LegislationCache } from "@/lib/types";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "AI Legislation Timeline — Data Center Moratoriums",
  description:
    "Gantt chart timeline of AI and data center legislation across all 50 states.",
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

export default function TimelinePage() {
  const cache = readCacheFile();
  const bills = cache?.bills ?? [];

  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-6">
        <TabNav />
        <div className="text-center mt-8 mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Legislative Timeline
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Gantt chart view of AI bills by state — filter by party, category, and status
          </p>
          <p className="mt-2 text-sm text-slate-400">
            <a
              href="/legislation"
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              &larr; Back to bill list
            </a>
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <TimelineView bills={bills} />
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
