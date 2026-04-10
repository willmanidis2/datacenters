"use client";

import { useMemo } from "react";
import { LegiScanBill } from "@/lib/types";

interface CadenceChartProps {
  bills: LegiScanBill[];
}

export default function CadenceChart({ bills }: CadenceChartProps) {
  const data = useMemo(() => {
    const dates = bills
      .map((b) => b.last_action_date)
      .filter(Boolean)
      .sort();

    if (dates.length === 0) return [];

    // Generate all months in range
    const start = new Date(dates[0].slice(0, 7) + "-01");
    const end = new Date(dates[dates.length - 1].slice(0, 7) + "-01");
    const months: { month: string; label: string; d: number; r: number; b: number; total: number }[] = [];

    const current = new Date(start);
    while (current <= end) {
      const key = current.toISOString().slice(0, 7);
      months.push({ month: key, label: formatMonth(key), d: 0, r: 0, b: 0, total: 0 });
      current.setMonth(current.getMonth() + 1);
    }

    // Index months for fast lookup
    const monthIndex = new Map(months.map((m, i) => [m.month, i]));

    for (const bill of bills) {
      if (!bill.last_action_date) continue;
      const key = bill.last_action_date.slice(0, 7);
      const idx = monthIndex.get(key);
      if (idx === undefined) continue;
      const party = bill.introducer_party || "B";
      if (party === "D") months[idx].d++;
      else if (party === "R") months[idx].r++;
      else months[idx].b++;
      months[idx].total++;
    }

    return months;
  }, [bills]);

  if (data.length === 0) {
    return <div className="text-sm text-slate-400 text-center py-4">No data.</div>;
  }

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-[3px]" style={{ height: 140, minWidth: data.length * 32 }}>
        {data.map((d) => {
          const pctD = (d.d / maxTotal) * 100;
          const pctR = (d.r / maxTotal) * 100;
          const pctB = (d.b / maxTotal) * 100;

          return (
            <div key={d.month} className="flex-1 min-w-[24px] flex flex-col items-center group relative">
              {/* Bar container */}
              <div className="w-full flex flex-col justify-end" style={{ height: 110 }}>
                {/* Stacked vertical bar */}
                <div className="w-full flex flex-col-reverse rounded-t-sm overflow-hidden">
                  {d.d > 0 && <div className="w-full bg-blue-500" style={{ height: `${pctD * 1.1}px` }} />}
                  {d.r > 0 && <div className="w-full bg-red-500" style={{ height: `${pctR * 1.1}px` }} />}
                  {d.b > 0 && <div className="w-full bg-purple-400" style={{ height: `${pctB * 1.1}px` }} />}
                  {d.total === 0 && <div className="w-full bg-slate-100" style={{ height: 2 }} />}
                </div>
              </div>
              {/* Count label on hover */}
              {d.total > 0 && (
                <div className="opacity-0 group-hover:opacity-100 absolute -top-4 text-[10px] font-semibold text-slate-600 bg-white px-1 rounded shadow-sm z-10">
                  {d.total}
                </div>
              )}
              {/* Month label */}
              <div className="text-[9px] text-slate-400 mt-1 whitespace-nowrap leading-none text-center">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const monthIdx = parseInt(m) - 1;
  // Show year on Jan
  if (monthIdx === 0) return `'${y.slice(2)}`;
  return months[monthIdx];
}
