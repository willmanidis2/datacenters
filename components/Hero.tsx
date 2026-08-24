import { StateData } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface HeroProps {
  states: StateData[];
}

export default function Hero({ states }: HeroProps) {
  const lastUpdated = states.reduce((latest, state) => {
    return state.lastUpdated > latest ? state.lastUpdated : latest;
  }, "");

  // lastUpdated is date-only ("2026-08-24"); parseISO keeps it in local time
  // so the displayed calendar date never shifts across timezones.
  const lastUpdatedDate = lastUpdated
    ? format(parseISO(lastUpdated), "MMMM d, yyyy")
    : "";

  return (
    <section className="text-center py-12 px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        Data Center Moratoriums
      </h1>
      <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
        Tracking state-level data center legislation across the United States
      </p>
      {lastUpdatedDate && (
        <p className="mt-2 text-sm text-slate-400">
          Last updated {lastUpdatedDate}
        </p>
      )}
    </section>
  );
}
