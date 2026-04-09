import { StateData } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface HeroProps {
  states: StateData[];
}

export default function Hero({ states }: HeroProps) {
  const lastUpdated = states.reduce((latest, state) => {
    return state.lastUpdated > latest ? state.lastUpdated : latest;
  }, "");

  const relativeTime = lastUpdated
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : "";

  return (
    <section className="text-center py-12 px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
        Data Center Moratoriums
      </h1>
      <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
        Tracking state-level data center legislation across the United States
      </p>
      {relativeTime && (
        <p className="mt-2 text-sm text-slate-400">
          Last updated {relativeTime}
        </p>
      )}
    </section>
  );
}
