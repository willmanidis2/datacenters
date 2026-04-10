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

// Approximate session start dates (most legislatures convene in January)
const SESSION_START_DATES: Record<string, string> = {
  AL: "2026-01-13", AK: "2026-01-20", AZ: "2026-01-13", AR: "2026-01-12",
  CA: "2026-01-05", CO: "2026-01-07", CT: "2026-01-07", DE: "2026-01-13",
  FL: "2026-01-06", GA: "2026-01-12", HI: "2026-01-15", ID: "2026-01-06",
  IL: "2026-01-14", IN: "2026-01-06", IA: "2026-01-12", KS: "2026-01-13",
  KY: "2026-01-06", LA: "2026-03-09", ME: "2026-01-07", MD: "2026-01-14",
  MA: "2026-01-07", MI: "2026-01-14", MN: "2026-01-06", MS: "2026-01-06",
  MO: "2026-01-07", MT: "2026-01-05", NE: "2026-01-07", NV: "2026-02-02",
  NH: "2026-01-07", NJ: "2026-01-13", NM: "2026-01-20", NY: "2026-01-07",
  NC: "2026-01-14", ND: "2026-01-06", OH: "2026-01-06", OK: "2026-02-02",
  OR: "2026-01-12", PA: "2026-01-06", RI: "2026-01-06", SC: "2026-01-13",
  SD: "2026-01-13", TN: "2026-01-13", TX: "2026-01-14", UT: "2026-01-19",
  VT: "2026-01-07", VA: "2026-01-08", WA: "2026-01-12", WV: "2026-01-14",
  WI: "2026-01-06", WY: "2026-01-13",
};

const SESSION_END_DATES: Record<string, string> = {
  AL: "2026-05-18", AK: "2026-05-20", AZ: "2026-06-30", AR: "2026-04-15",
  CA: "2026-09-15", CO: "2026-05-06", CT: "2026-06-03", DE: "2026-06-30",
  FL: "2026-03-14", GA: "2026-04-02", HI: "2026-05-07", ID: "2026-04-01",
  IL: "2026-05-31", IN: "2026-04-29", IA: "2026-04-30", KS: "2026-05-15",
  KY: "2026-04-15", LA: "2026-06-01", ME: "2026-06-16", MD: "2026-04-13",
  MA: "2026-12-31", MI: "2026-12-31", MN: "2026-05-18", MS: "2026-04-05",
  MO: "2026-05-15", MT: "2026-04-25", NE: "2026-06-05", NV: "2026-06-02",
  NH: "2026-06-30", NJ: "2026-12-31", NM: "2026-03-21", NY: "2026-06-19",
  NC: "2026-07-01", ND: "2026-04-30", OH: "2026-12-31", OK: "2026-05-29",
  OR: "2026-06-28", PA: "2026-12-31", RI: "2026-06-30", SC: "2026-06-04",
  SD: "2026-03-13", TN: "2026-05-01", TX: "2026-06-01", UT: "2026-03-06",
  VT: "2026-05-15", VA: "2026-03-08", WA: "2026-04-26", WV: "2026-03-14",
  WI: "2026-12-31", WY: "2026-03-05",
};

// Calculate likelihood to pass before session ends
function getPassLikelihood(bill: LegiScanBill): { score: "high" | "medium" | "low" | "done" | "dead"; label: string; color: string } {
  // Already resolved
  if (bill.status === "passed") return { score: "done", label: "Enacted", color: "#16a34a" };
  if (bill.status === "vetoed") return { score: "dead", label: "Vetoed", color: "#ea580c" };
  if (bill.status === "failed") return { score: "dead", label: "Failed", color: "#dc2626" };

  // Check days remaining
  const endDate = bill.session_end_date || SESSION_END_DATES[bill.state];
  if (!endDate) return { score: "medium", label: "Unknown", color: "#94a3b8" };

  const now = new Date("2026-04-10"); // Current date
  const end = new Date(endDate + "T00:00:00");
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / 86400000);

  if (daysLeft <= 0) return { score: "dead", label: "Session ended", color: "#dc2626" };

  // Score based on status + days remaining
  const isAdvanced = ["engrossed", "enrolled"].includes(bill.status);

  if (isAdvanced && daysLeft > 14) return { score: "high", label: `${daysLeft}d left, advancing`, color: "#16a34a" };
  if (isAdvanced && daysLeft > 0) return { score: "medium", label: `${daysLeft}d left, advancing`, color: "#eab308" };
  if (!isAdvanced && daysLeft > 60) return { score: "medium", label: `${daysLeft}d left`, color: "#eab308" };
  if (!isAdvanced && daysLeft > 14) return { score: "low", label: `${daysLeft}d left, early stage`, color: "#f97316" };
  return { score: "low", label: `${daysLeft}d left, unlikely`, color: "#dc2626" };
}

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
    const minBarMs = Math.max(60 * 86400000, chartDuration * 0.04);
    const barStart = actionDate - minBarMs;
    const left = Math.max(0, ((barStart - chartStart) / chartDuration) * 100);
    const right = Math.min(100, ((actionDate - chartStart) / chartDuration) * 100);
    return { left, width: Math.max(right - left, 2.5) };
  }

  function getSessionWindow(state: string): { left: number; width: number } | null {
    const startStr = SESSION_START_DATES[state];
    const endStr = SESSION_END_DATES[state];
    if (!startStr || !endStr) return null;

    const sessionStart = new Date(startStr + "T00:00:00").getTime();
    const sessionEnd = new Date(endStr + "T00:00:00").getTime();

    const left = Math.max(0, ((sessionStart - chartStart) / chartDuration) * 100);
    const right = Math.min(100, ((sessionEnd - chartStart) / chartDuration) * 100);
    if (right <= left) return null;
    return { left, width: right - left };
  }

  // "Today" marker
  const todayPct = ((new Date("2026-04-10").getTime() - chartStart) / chartDuration) * 100;

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
        {stateGroups.map((group, groupIdx) => {
          const sessionWindow = getSessionWindow(group.state);
          const rowCount = group.bills.length;

          return (
            <div
              key={group.state}
              className={`relative ${groupIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
            >
              {/* Session window shading — spans the full height of the state group */}
              {sessionWindow && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `calc(56px + (100% - 56px) * ${sessionWindow.left / 100})`,
                    width: `calc((100% - 56px) * ${sessionWindow.width / 100})`,
                    top: 0,
                    bottom: 0,
                    background: "linear-gradient(180deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.03) 100%)",
                    borderLeft: "1.5px solid rgba(59,130,246,0.25)",
                    borderRight: "1.5px solid rgba(59,130,246,0.15)",
                  }}
                >
                  {/* Session label — only on first row */}
                  <div className="absolute top-0 left-0.5 text-[8px] text-blue-400 font-medium whitespace-nowrap opacity-70">
                    Session
                  </div>
                </div>
              )}

              {/* Today marker */}
              {todayPct > 0 && todayPct < 100 && groupIdx === 0 && (
                <div
                  className="absolute pointer-events-none z-10"
                  style={{
                    left: `calc(56px + (100% - 56px) * ${todayPct / 100})`,
                    top: -8,
                    bottom: 0,
                  }}
                >
                  <div className="w-px h-full bg-rose-400 opacity-60" />
                  <div className="absolute -top-0 -translate-x-1/2 text-[8px] text-rose-500 font-bold whitespace-nowrap bg-white px-1 rounded">
                    Today
                  </div>
                </div>
              )}

              {group.bills.map((bill, billIdx) => {
                const { left, width } = getBarPct(bill);
                const barColor = getColor(bill);
                const isHovered = hoveredBill === bill;
                const likelihood = getPassLikelihood(bill);

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

                      {/* Today line (repeated per row for full height) */}
                      {todayPct > 0 && todayPct < 100 && (
                        <div
                          className="absolute top-0 bottom-0 pointer-events-none"
                          style={{ left: `${todayPct}%`, width: 1, backgroundColor: "rgba(244,63,94,0.3)" }}
                        />
                      )}

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
                        {/* Bill label */}
                        {width > 3 && (
                          <span className="absolute inset-0 flex items-center px-1 text-[9px] font-semibold text-white truncate">
                            {bill.bill_number}
                          </span>
                        )}

                        {/* Likelihood dot — positioned at the right edge of the bar */}
                        <span
                          className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                          style={{ backgroundColor: likelihood.color }}
                          title={likelihood.label}
                        />
                      </div>

                      {/* Tooltip */}
                      {isHovered && (
                        <div
                          className="absolute z-50 bg-slate-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-xl pointer-events-none"
                          style={{
                            left: `${Math.min(left + width + 2, 65)}%`,
                            top: -8,
                            width: 300,
                          }}
                        >
                          <div className="font-bold flex items-center gap-1.5">
                            {bill.state} {bill.bill_number}
                            <span
                              className="inline-block w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: PARTY_COLORS[bill.introducer_party || "unknown"] }}
                            />
                            {bill.introducer_name && (
                              <span className="font-normal text-slate-400">
                                {bill.introducer_name}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300 mt-0.5 leading-snug">{bill.title}</div>
                          <div className="text-slate-400 mt-1 flex items-center gap-1.5">
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: likelihood.color }}
                            />
                            <span>{likelihood.label}</span>
                            <span className="text-slate-500">&middot;</span>
                            <span>{bill.status}</span>
                            <span className="text-slate-500">&middot;</span>
                            <span>{bill.last_action_date}</span>
                          </div>
                          {bill.ai_summary && (
                            <div className="mt-1 text-slate-400 border-t border-slate-700 pt-1 leading-snug">
                              {bill.ai_summary}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Session end marker label at bottom of group */}
              {sessionWindow && rowCount >= 3 && (
                <div
                  className="absolute pointer-events-none text-[8px] text-blue-400 font-medium opacity-70"
                  style={{
                    left: `calc(56px + (100% - 56px) * ${(sessionWindow.left + sessionWindow.width) / 100})`,
                    bottom: 2,
                    transform: "translateX(-100%)",
                    paddingRight: 3,
                  }}
                >
                  End
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
        <div className="flex items-center gap-4">
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
        <div className="border-l border-slate-200 pl-4 flex items-center gap-4">
          <span className="text-slate-400 font-medium">Likelihood:</span>
          <LegendDot color="#16a34a" label="Likely" shape="circle" />
          <LegendDot color="#eab308" label="Possible" shape="circle" />
          <LegendDot color="#f97316" label="Unlikely" shape="circle" />
          <LegendDot color="#dc2626" label="Dead / Expired" shape="circle" />
        </div>
        <div className="border-l border-slate-200 pl-4 flex items-center gap-2">
          <div className="w-4 h-3 rounded-sm" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }} />
          <span>Legislative Session</span>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label, shape = "square" }: { color: string; label: string; shape?: "square" | "circle" }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={`w-3 h-3 inline-block ${shape === "circle" ? "rounded-full" : "rounded-sm"}`}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
