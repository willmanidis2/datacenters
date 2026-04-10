"use client";

import { useMemo, useState } from "react";
import { LegiScanBill, AIBillCategory } from "@/lib/types";

interface GanttChartProps {
  bills: LegiScanBill[];
  colorBy: "party" | "status" | "category";
}

const PARTY_COLORS: Record<string, string> = {
  D: "#3b82f6", R: "#ef4444", B: "#a855f7", unknown: "#94a3b8",
};
const STATUS_COLORS: Record<string, string> = {
  introduced: "#3b82f6", engrossed: "#9333ea", enrolled: "#4f46e5",
  passed: "#16a34a", vetoed: "#ea580c", failed: "#dc2626", pending: "#64748b",
};
const CATEGORY_COLORS: Record<string, string> = {
  data_centers: "#d97706", ai_regulation: "#2563eb", deepfakes: "#db2777",
  ai_government: "#4f46e5", ai_employment: "#ea580c", ai_education: "#0891b2",
  ai_healthcare: "#059669", ai_privacy: "#7c3aed", ai_criminal_justice: "#dc2626",
  ai_other: "#64748b",
};

export default function GanttChart({ bills, colorBy }: GanttChartProps) {
  const [hoveredBill, setHoveredBill] = useState<LegiScanBill | null>(null);

  const { stateGroups, chartStart, chartDuration, monthMarkers } = useMemo(() => {
    if (bills.length === 0) {
      return { stateGroups: [], chartStart: 0, chartDuration: 1, monthMarkers: [] };
    }

    const allDates = bills.map((b) => b.last_action_date).filter(Boolean).sort();
    const earliest = new Date(allDates[0].slice(0, 7) + "-01");
    const latestDate = new Date(allDates[allDates.length - 1] + "T00:00:00");
    const latest = new Date(latestDate.getFullYear(), latestDate.getMonth() + 2, 1);

    const start = earliest.getTime();
    const duration = latest.getTime() - start;

    // Month markers
    const markers: { label: string; pct: number }[] = [];
    const cur = new Date(earliest);
    while (cur <= latest) {
      const pct = ((cur.getTime() - start) / duration) * 100;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const label = cur.getMonth() === 0 || markers.length === 0
        ? `${monthNames[cur.getMonth()]} '${String(cur.getFullYear()).slice(2)}`
        : monthNames[cur.getMonth()];
      markers.push({ label, pct });
      cur.setMonth(cur.getMonth() + 1);
    }

    // Group by state
    const grouped = new Map<string, LegiScanBill[]>();
    for (const bill of bills) {
      const arr = grouped.get(bill.state) || [];
      arr.push(bill);
      grouped.set(bill.state, arr);
    }

    const groups = Array.from(grouped.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([state, stateBills]) => ({
        state,
        bills: stateBills.sort((a, b) => a.last_action_date.localeCompare(b.last_action_date)),
      }));

    return { stateGroups: groups, chartStart: start, chartDuration: duration, monthMarkers: markers };
  }, [bills]);

  if (bills.length === 0) {
    return <div className="px-4 py-12 text-center text-slate-400 text-sm">No bills match your filters.</div>;
  }

  function getColor(bill: LegiScanBill): string {
    if (colorBy === "party") return PARTY_COLORS[bill.introducer_party || "unknown"] || PARTY_COLORS.unknown;
    if (colorBy === "status") return STATUS_COLORS[bill.status] || STATUS_COLORS.pending;
    return CATEGORY_COLORS[bill.category as AIBillCategory] || CATEGORY_COLORS.ai_other;
  }

  function getBarPct(bill: LegiScanBill): { left: number; width: number } {
    const actionDate = new Date(bill.last_action_date + "T00:00:00").getTime();
    // Each bar represents ~60 days of activity, minimum 4% of chart width
    const minBarMs = Math.max(60 * 86400000, chartDuration * 0.04);
    const barStart = actionDate - minBarMs;
    const left = Math.max(0, ((barStart - chartStart) / chartDuration) * 100);
    const right = Math.min(100, ((actionDate - chartStart) / chartDuration) * 100);
    return { left, width: Math.max(right - left, 2.5) };
  }

  return (
    <div>
      {/* Month header */}
      <div className="flex border-b border-slate-200 bg-slate-50/80">
        <div className="w-14 shrink-0" />
        <div className="flex-1 relative h-8">
          {monthMarkers.map((m, i) => (
            <div
              key={i}
              className="absolute bottom-1 text-[10px] text-slate-400 font-mono"
              style={{ left: `${m.pct}%`, transform: "translateX(-50%)" }}
            >
              {m.label}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="max-h-[70vh] overflow-y-auto">
        {stateGroups.map((group, groupIdx) => (
          <div key={group.state} className={groupIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
            {group.bills.map((bill, billIdx) => {
              const { left, width } = getBarPct(bill);
              const barColor = getColor(bill);
              const isHovered = hoveredBill === bill;

              return (
                <div
                  key={bill.bill_id || `${bill.state}-${bill.bill_number}-${billIdx}`}
                  className="flex items-center h-7 border-b border-slate-100/50"
                >
                  {/* State label — only on first row of group */}
                  <div className="w-14 shrink-0 text-center">
                    {billIdx === 0 && (
                      <span className="text-[11px] font-bold font-mono text-slate-600">
                        {group.state}
                      </span>
                    )}
                  </div>

                  {/* Bar area */}
                  <div className="flex-1 relative h-full">
                    {/* Vertical grid lines */}
                    {billIdx === 0 && monthMarkers.map((m, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-slate-100"
                        style={{ left: `${m.pct}%` }}
                      />
                    ))}

                    {/* The bar */}
                    <div
                      className="absolute top-1 rounded-sm cursor-pointer transition-opacity"
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        height: 18,
                        backgroundColor: barColor,
                        opacity: hoveredBill && !isHovered ? 0.3 : 0.85,
                      }}
                      onMouseEnter={() => setHoveredBill(bill)}
                      onMouseLeave={() => setHoveredBill(null)}
                    >
                      {width > 3 && (
                        <span className="absolute inset-0 flex items-center px-1 text-[9px] font-semibold text-white truncate">
                          {bill.bill_number}
                        </span>
                      )}
                    </div>

                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute z-50 bg-slate-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-xl pointer-events-none"
                        style={{
                          left: `${Math.min(left + width, 70)}%`,
                          top: -60,
                          width: 280,
                        }}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {bill.state} {bill.bill_number}
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: PARTY_COLORS[bill.introducer_party || "unknown"] }}
                          />
                        </div>
                        <div className="text-slate-300 mt-0.5 leading-snug">{bill.title}</div>
                        <div className="text-slate-400 mt-0.5">
                          {bill.status} &middot; {bill.last_action_date}
                          {bill.introducer_name && ` &middot; ${bill.introducer_name}`}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
        {colorBy === "party" && (
          <>
            <LegendDot color="#3b82f6" label="Democrat" />
            <LegendDot color="#ef4444" label="Republican" />
            <LegendDot color="#a855f7" label="Bipartisan" />
          </>
        )}
        {colorBy === "status" && (
          <>
            <LegendDot color="#3b82f6" label="Introduced" />
            <LegendDot color="#9333ea" label="Engrossed" />
            <LegendDot color="#4f46e5" label="Enrolled" />
            <LegendDot color="#16a34a" label="Passed" />
            <LegendDot color="#ea580c" label="Vetoed" />
            <LegendDot color="#dc2626" label="Failed" />
          </>
        )}
        {colorBy === "category" && (
          <>
            <LegendDot color="#d97706" label="Data Centers" />
            <LegendDot color="#2563eb" label="AI Regulation" />
            <LegendDot color="#db2777" label="Deepfakes" />
            <LegendDot color="#4f46e5" label="Gov't AI" />
            <LegendDot color="#ea580c" label="Employment" />
            <LegendDot color="#059669" label="Healthcare" />
            <LegendDot color="#0891b2" label="Education" />
            <LegendDot color="#7c3aed" label="Privacy" />
          </>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
