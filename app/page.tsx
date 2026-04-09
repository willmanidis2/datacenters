import stateStatusesData from "@/data/state-statuses.json";
import { StateData } from "@/lib/types";
import Hero from "@/components/Hero";
import USChoroplethMap from "@/components/Map/USChoroplethMap";
import MapLegend from "@/components/Map/MapLegend";
import StatusThermometer from "@/components/Map/StatusThermometer";
import AISummaryPanel from "@/components/AISummary/AISummaryPanel";
import NewsFeed from "@/components/NewsFeed/NewsFeed";

export default function Home() {
  const states = stateStatusesData.states as StateData[];

  return (
    <main>
      <section className="max-w-6xl mx-auto px-4">
        <Hero states={states} />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <USChoroplethMap states={states} />
        <MapLegend states={states} />
        <StatusThermometer states={states} />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <AISummaryPanel />
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <NewsFeed />
      </section>

      <footer className="border-t border-slate-200 mt-12 py-8 text-center text-sm text-slate-400">
        Built by{" "}
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
