import { ConstructionProject } from "@/lib/types";

interface ConstructionSummaryProps {
  projects: ConstructionProject[];
}

export default function ConstructionSummary({
  projects,
}: ConstructionSummaryProps) {
  const totalMW = projects.reduce((sum, p) => sum + p.powerMW, 0);
  const totalCost = projects.reduce((sum, p) => sum + p.capitalCostB, 0);
  const totalH100 = projects.reduce((sum, p) => sum + p.h100Equivalents, 0);
  const activeCount = projects.filter((p) => p.status === "active").length;
  const plannedCount = projects.filter((p) => p.status === "planned").length;
  const uniqueStates = new Set(projects.map((p) => p.stateId)).size;
  const uniqueOwners = new Set(projects.map((p) => p.owner)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      <StatCard label="Projects" value={String(projects.length)} />
      <StatCard
        label="Operational"
        value={String(activeCount)}
        accent="text-green-600"
      />
      <StatCard
        label="Planned"
        value={String(plannedCount)}
        accent="text-blue-600"
      />
      <StatCard label="Total Power" value={`${totalMW.toLocaleString()} MW`} />
      <StatCard label="Investment" value={`$${totalCost.toFixed(0)}B`} />
      <StatCard
        label="H100 Equiv."
        value={`${(totalH100 / 1000000).toFixed(1)}M`}
      />
      <StatCard label="States" value={String(uniqueStates)} sub={`${uniqueOwners} owners`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent?: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${accent || "text-slate-900"}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
