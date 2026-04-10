import constructionData from "@/data/construction-projects.json";
import stateStatusesData from "@/data/state-statuses.json";
import { ConstructionProject, StateData } from "@/lib/types";
import TabNav from "@/components/TabNav";
import ConstructionSummary from "@/components/Construction/ConstructionSummary";
import ConstructionView from "@/components/Construction/ConstructionView";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Construction Tracker — Data Center Moratoriums",
  description:
    "Track active and planned frontier AI data center construction projects across the United States. Data from Epoch AI.",
};

export default function ConstructionPage() {
  const projects = constructionData.projects as ConstructionProject[];
  const states = stateStatusesData.states as StateData[];

  return (
    <main>
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <TabNav />
        <div className="text-center mt-8 mb-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Construction Tracker
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Frontier AI data center projects across the United States
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {projects.length} projects &middot; {new Set(projects.map((p) => p.stateId)).size} states &middot; Data from{" "}
            <a
              href="https://epoch.ai/data/frontier-data-centers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Epoch AI
            </a>
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-4">
        <ConstructionSummary projects={projects} />
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-8">
        <ConstructionView projects={projects} states={states} />
      </section>

      <footer className="border-t border-slate-200 mt-12 py-8 text-center text-sm text-slate-400">
        Data from{" "}
        <a
          href="https://epoch.ai/data/frontier-data-centers"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          Epoch AI
        </a>{" "}
        (CC-BY) &middot; Built by{" "}
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
