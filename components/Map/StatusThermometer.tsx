"use client";

import { useState } from "react";
import { StateData, LegislativeStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";

interface StatusThermometerProps {
  states: StateData[];
}

const SEGMENT_ORDER: LegislativeStatus[] = [
  "active_restrictions",
  "legislation_advancing",
  "under_discussion",
  "no_action",
  "favorable",
];

const RESTRICTION_STATUSES: LegislativeStatus[] = [
  "active_restrictions",
  "legislation_advancing",
  "under_discussion",
];

export default function StatusThermometer({ states }: StatusThermometerProps) {
  const [hoveredStatus, setHoveredStatus] = useState<LegislativeStatus | null>(
    null
  );

  const counts = SEGMENT_ORDER.reduce(
    (acc, status) => {
      acc[status] = states.filter((s) => s.status === status).length;
      return acc;
    },
    {} as Record<LegislativeStatus, number>
  );

  const restrictionCount = RESTRICTION_STATUSES.reduce(
    (sum, s) => sum + counts[s],
    0
  );

  const total = states.length;

  const hoveredStates = hoveredStatus
    ? states.filter((s) => s.status === hoveredStatus)
    : null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-6">
      {/* Summary line */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-700">
          <span className="text-lg font-bold text-slate-900">
            {restrictionCount}
          </span>{" "}
          of 50 states restricting or considering restrictions
        </p>
        <p className="text-xs text-slate-400">
          {counts.favorable} states with incentives
        </p>
      </div>

      {/* Thermometer bar */}
      <div className="relative w-full h-8 rounded-full overflow-hidden flex bg-slate-100">
        {SEGMENT_ORDER.map((status) => {
          const count = counts[status];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          const config = STATUS_CONFIG[status];
          const isHovered = hoveredStatus === status;

          return (
            <div
              key={status}
              className="relative h-full flex items-center justify-center transition-opacity duration-150 cursor-pointer"
              style={{
                width: `${pct}%`,
                backgroundColor: config.color,
                opacity: hoveredStatus && !isHovered ? 0.4 : 1,
              }}
              onMouseEnter={() => setHoveredStatus(status)}
              onMouseLeave={() => setHoveredStatus(null)}
            >
              {pct > 6 && (
                <span
                  className="text-xs font-bold select-none"
                  style={{
                    color:
                      status === "no_action" ? "#64748b" : "rgba(255,255,255,0.9)",
                  }}
                >
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hover detail */}
      <div className="h-16 mt-2">
        {hoveredStates && hoveredStatus ? (
          <div className="text-sm">
            <p className="font-medium" style={{ color: STATUS_CONFIG[hoveredStatus].color }}>
              {STATUS_CONFIG[hoveredStatus].label} — {hoveredStates.length} state
              {hoveredStates.length !== 1 ? "s" : ""}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              {hoveredStates.map((s) => s.name).join(", ")}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 pt-1">
            Hover over a segment to see which states fall into each category
          </p>
        )}
      </div>
    </div>
  );
}
