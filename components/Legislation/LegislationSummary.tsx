import { LegiScanBill } from "@/lib/types";

interface LegislationSummaryProps {
  bills: LegiScanBill[];
  lastRefreshed?: string | null;
}

export default function LegislationSummary({
  bills,
}: LegislationSummaryProps) {
  const uniqueStates = new Set(bills.map((b) => b.state)).size;
  const introduced = bills.filter((b) => b.status === "introduced" || b.status === "pending").length;
  const passed = bills.filter((b) => b.status === "passed" || b.status === "enrolled").length;
  const failed = bills.filter((b) => b.status === "failed" || b.status === "vetoed").length;
  const active = bills.filter((b) => b.status === "engrossed" || b.status === "enrolled").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard label="Total Bills" value={String(bills.length)} />
      <StatCard label="States" value={String(uniqueStates)} />
      <StatCard
        label="Introduced"
        value={String(introduced)}
        accent="text-blue-600"
      />
      <StatCard
        label="Advancing"
        value={String(active)}
        accent="text-purple-600"
      />
      <StatCard
        label="Passed"
        value={String(passed)}
        accent="text-green-600"
      />
      <StatCard
        label="Failed / Vetoed"
        value={String(failed)}
        accent="text-red-600"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      <div
        className={`text-lg font-bold mt-0.5 ${accent || "text-slate-900"}`}
      >
        {value}
      </div>
    </div>
  );
}
