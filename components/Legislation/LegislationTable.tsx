"use client";

import { LegiScanBill, LegiScanBillStatus, AIBillCategory } from "@/lib/types";

interface LegislationTableProps {
  bills: LegiScanBill[];
  selectedBillId: number | null;
  onSelectBill: (id: number | null) => void;
}

// Pipeline stages in order
const PIPELINE_STAGES = ["Filed", "Committee", "Floor", "Crossover", "Final"] as const;

function getPipelineInfo(status: LegiScanBillStatus): {
  filledTo: number; // 0-5, how many stages filled
  label: string;
  barColor: string;
  bgColor: string;
  borderColor: string;
  terminal?: "passed" | "failed" | "vetoed";
} {
  switch (status) {
    case "introduced":
      return { filledTo: 1, label: "Filed", barColor: "#3b82f6", bgColor: "bg-blue-500", borderColor: "border-l-blue-500" };
    case "pending":
      return { filledTo: 2, label: "In Committee", barColor: "#6366f1", bgColor: "bg-indigo-500", borderColor: "border-l-indigo-500" };
    case "engrossed":
      return { filledTo: 3, label: "Passed Chamber", barColor: "#8b5cf6", bgColor: "bg-violet-500", borderColor: "border-l-violet-500" };
    case "enrolled":
      return { filledTo: 4, label: "Enrolled", barColor: "#6366f1", bgColor: "bg-indigo-500", borderColor: "border-l-indigo-500" };
    case "passed":
      return { filledTo: 5, label: "Signed", barColor: "#16a34a", bgColor: "bg-green-600", borderColor: "border-l-green-600", terminal: "passed" };
    case "vetoed":
      return { filledTo: 5, label: "Vetoed", barColor: "#ea580c", bgColor: "bg-orange-500", borderColor: "border-l-orange-500", terminal: "vetoed" };
    case "failed":
      return { filledTo: 2, label: "Dead", barColor: "#dc2626", bgColor: "bg-red-500", borderColor: "border-l-red-500", terminal: "failed" };
    default:
      return { filledTo: 1, label: "Pending", barColor: "#94a3b8", bgColor: "bg-slate-400", borderColor: "border-l-slate-400" };
  }
}

const CATEGORY_LABELS: Record<AIBillCategory, string> = {
  data_centers: "Data Centers & Energy",
  ai_regulation: "AI Regulation",
  deepfakes: "Deepfakes & Synthetic Media",
  ai_government: "Government Use & Oversight",
  ai_employment: "Employment & Labor",
  ai_education: "Education",
  ai_healthcare: "Healthcare",
  ai_privacy: "Privacy & Data Protection",
  ai_criminal_justice: "Law Enforcement & Criminal Justice",
  ai_other: "Other",
};

const CATEGORY_COLORS: Record<AIBillCategory, string> = {
  data_centers: "bg-amber-50 text-amber-700 border-amber-200",
  ai_regulation: "bg-blue-50 text-blue-700 border-blue-200",
  deepfakes: "bg-pink-50 text-pink-700 border-pink-200",
  ai_government: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ai_employment: "bg-orange-50 text-orange-700 border-orange-200",
  ai_education: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ai_healthcare: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ai_privacy: "bg-violet-50 text-violet-700 border-violet-200",
  ai_criminal_justice: "bg-red-50 text-red-700 border-red-200",
  ai_other: "bg-slate-50 text-slate-600 border-slate-200",
};

const PARTY_STYLES: Record<string, { bg: string; label: string }> = {
  D: { bg: "bg-blue-500", label: "D" },
  R: { bg: "bg-red-500", label: "R" },
  B: { bg: "bg-purple-500", label: "B" },
  I: { bg: "bg-gray-400", label: "I" },
};

function ProgressTrack({
  filledTo,
  barColor,
  label,
  terminal,
  isSelected,
}: {
  filledTo: number;
  barColor: string;
  label: string;
  terminal?: "passed" | "failed" | "vetoed";
  isSelected: boolean;
}) {
  const pct = (filledTo / PIPELINE_STAGES.length) * 100;

  return (
    <div className="w-full">
      {/* Track */}
      <div className={`relative h-[6px] rounded-full overflow-hidden ${isSelected ? "bg-white/20" : "bg-slate-100"}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: isSelected ? "rgba(255,255,255,0.6)" : barColor,
          }}
        />
        {/* Terminal marker */}
        {terminal && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white"
            style={{
              right: terminal === "failed" ? `${100 - pct}%` : 0,
              left: terminal !== "failed" ? `calc(${pct}% - 4px)` : undefined,
              backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : barColor,
            }}
          />
        )}
      </div>
      {/* Label */}
      <div
        className={`text-[10px] font-semibold mt-0.5 ${
          isSelected ? "text-slate-300" : ""
        }`}
        style={{ color: isSelected ? undefined : barColor }}
      >
        {label}
      </div>
    </div>
  );
}

export default function LegislationTable({
  bills,
  selectedBillId,
  onSelectBill,
}: LegislationTableProps) {
  if (bills.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center text-slate-400">
        No bills found matching your filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-5 py-3 border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="w-24 shrink-0">Progress</div>
        <div className="w-20 shrink-0">Bill</div>
        <div className="flex-1 min-w-0">Title</div>
        <div className="w-10 shrink-0 text-center">Pty</div>
        <div className="w-24 shrink-0 text-right">Updated</div>
      </div>

      {/* Bill rows */}
      <div className="divide-y divide-slate-100">
        {bills.map((bill) => {
          const isSelected = selectedBillId === bill.bill_id;
          const pipeline = getPipelineInfo(bill.status);
          const party = PARTY_STYLES[bill.introducer_party || ""] || null;
          const catColor = CATEGORY_COLORS[bill.category] || CATEGORY_COLORS.ai_other;
          const catLabel = CATEGORY_LABELS[bill.category] || bill.category;

          return (
            <div
              key={bill.bill_id || `${bill.state}-${bill.bill_number}`}
              onClick={() => onSelectBill(isSelected ? null : bill.bill_id)}
              className={`flex items-start px-5 py-3.5 cursor-pointer transition-colors border-l-[3px] ${
                isSelected
                  ? "bg-slate-900 text-white border-l-white"
                  : `hover:bg-slate-50 ${pipeline.borderColor}`
              }`}
            >
              {/* Progress track */}
              <div className="w-24 shrink-0 pt-0.5 pr-3">
                <ProgressTrack
                  filledTo={pipeline.filledTo}
                  barColor={pipeline.barColor}
                  label={pipeline.label}
                  terminal={pipeline.terminal}
                  isSelected={isSelected}
                />
              </div>

              {/* Bill number */}
              <div className="w-20 shrink-0">
                <div className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {bill.state}
                </div>
                <div className={`text-xs font-mono ${isSelected ? "text-blue-300" : "text-blue-600"}`}>
                  {bill.bill_number}
                </div>
              </div>

              {/* Title + tags */}
              <div className="flex-1 min-w-0 pr-4">
                <div className={`text-sm leading-snug ${isSelected ? "text-white" : "text-slate-800"}`}>
                  {bill.title}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${
                      isSelected
                        ? "bg-white/10 text-slate-300 border-white/20"
                        : catColor
                    }`}
                  >
                    {catLabel}
                  </span>
                </div>
              </div>

              {/* Party badge */}
              <div className="w-10 shrink-0 flex justify-center pt-0.5">
                {party && (
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                      isSelected ? "opacity-80" : ""
                    } ${party.bg}`}
                    title={`${party.label === "D" ? "Democrat" : party.label === "R" ? "Republican" : "Bipartisan"}${bill.introducer_name ? ` — ${bill.introducer_name}` : ""}`}
                  >
                    {party.label}
                  </span>
                )}
              </div>

              {/* Date */}
              <div
                className={`w-24 shrink-0 text-right text-xs font-mono pt-0.5 ${
                  isSelected ? "text-slate-400" : "text-slate-400"
                }`}
              >
                {formatDate(bill.last_action_date)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}
