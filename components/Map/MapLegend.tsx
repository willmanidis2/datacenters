import { StateData, LegislativeStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";

interface MapLegendProps {
  states: StateData[];
}

const STATUS_ORDER: LegislativeStatus[] = [
  "moratorium_enacted",
  "ban_enacted",
  "bill_in_progress",
  "under_review",
  "no_activity",
  "favorable",
];

export default function MapLegend({ states }: MapLegendProps) {
  const counts = states.reduce(
    (acc, state) => {
      acc[state.status] = (acc[state.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-4">
      {STATUS_ORDER.map((status) => {
        const config = STATUS_CONFIG[status];
        const count = counts[status] || 0;
        if (count === 0) return null;
        return (
          <div key={status} className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-slate-700">
              {config.label}{" "}
              <span className="text-slate-400">({count})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
