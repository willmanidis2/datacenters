import { LegiScanBill } from "@/lib/types";

interface LegislationSummaryProps {
  bills: LegiScanBill[];
  lastRefreshed?: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  data_centers: "text-amber-600",
  ai_regulation: "text-blue-600",
  deepfakes: "text-pink-600",
  ai_government: "text-indigo-600",
  ai_healthcare: "text-emerald-600",
  ai_employment: "text-orange-600",
  ai_education: "text-cyan-600",
  ai_privacy: "text-violet-600",
  ai_criminal_justice: "text-red-600",
  ai_other: "text-slate-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  data_centers: "Data Centers",
  ai_regulation: "AI Regulation",
  deepfakes: "Deepfakes",
  ai_government: "Gov't AI",
  ai_healthcare: "Healthcare",
  ai_employment: "Employment",
  ai_education: "Education",
  ai_privacy: "Privacy",
  ai_criminal_justice: "Criminal Justice",
  ai_other: "Other",
};

export default function LegislationSummary({
  bills,
}: LegislationSummaryProps) {
  const uniqueStates = new Set(bills.map((b) => b.state)).size;
  const passed = bills.filter((b) => b.status === "passed" || b.status === "enrolled").length;
  const failed = bills.filter((b) => b.status === "failed" || b.status === "vetoed").length;

  // Category counts (top 5)
  const catCounts: Record<string, number> = {};
  for (const b of bills) {
    catCounts[b.category] = (catCounts[b.category] || 0) + 1;
  }
  const topCategories = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      <StatCard label="Total Bills" value={String(bills.length)} />
      <StatCard label="States" value={String(uniqueStates)} />
      <StatCard label="Passed" value={String(passed)} accent="text-green-600" />
      <StatCard label="Failed / Vetoed" value={String(failed)} accent="text-red-600" />
      {topCategories.map(([cat, count]) => (
        <StatCard
          key={cat}
          label={CATEGORY_LABELS[cat] || cat}
          value={String(count)}
          accent={CATEGORY_COLORS[cat]}
        />
      ))}
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
