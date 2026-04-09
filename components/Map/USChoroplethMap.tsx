"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { StateData, Bill } from "@/lib/types";
import { STATUS_CONFIG, GEO_URL } from "@/lib/constants";

interface USChoroplethMapProps {
  states: StateData[];
}

export default function USChoroplethMap({ states }: USChoroplethMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const statesByFips = useMemo(() => {
    const map = new Map<string, StateData>();
    for (const state of states) {
      map.set(state.fips, state);
    }
    return map;
  }, [states]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = geo.id as string;
              const stateData = statesByFips.get(fips);
              const fillColor = stateData
                ? STATUS_CONFIG[stateData.status].color
                : "#D1D5DB";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    hoveredState === fips
                      ? adjustBrightness(fillColor, -20)
                      : fillColor
                  }
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                  onMouseEnter={() => setHoveredState(fips)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => {
                    if (stateData) {
                      router.push(`/state/${stateData.slug}`);
                    }
                  }}
                  data-tooltip-id="map-tooltip"
                  data-tooltip-html={
                    stateData
                      ? buildTooltipHtml(stateData)
                      : ""
                  }
                  aria-label={
                    stateData
                      ? `${stateData.name}: ${STATUS_CONFIG[stateData.status].label}`
                      : undefined
                  }
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip
        id="map-tooltip"
        className="!max-w-sm !bg-slate-900 !text-white !rounded-xl !px-4 !py-3 !text-sm !shadow-xl"
        opacity={1}
        clickable
      />
    </div>
  );
}

function buildTooltipHtml(state: StateData): string {
  const config = STATUS_CONFIG[state.status];
  let html = `<div style="max-width:280px">`;
  html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">`;
  html += `<strong style="font-size:14px">${state.name}</strong>`;
  html += `<span style="background:${config.color}30;color:${config.color};padding:1px 8px;border-radius:99px;font-size:11px;font-weight:600">${config.label}</span>`;
  html += `</div>`;

  if (state.bills.length > 0) {
    for (const bill of state.bills) {
      html += `<div style="margin-top:6px;padding:6px 8px;background:rgba(255,255,255,0.08);border-radius:6px">`;
      html += `<div style="font-size:12px;font-weight:600">${bill.id}: ${bill.title}</div>`;
      html += buildProgressBar(bill);
      html += `</div>`;
    }
  } else {
    html += `<div style="font-size:12px;margin-top:4px;opacity:0.8">${state.summary.slice(0, 140)}${state.summary.length > 140 ? "..." : ""}</div>`;
  }

  html += `<div style="font-size:10px;opacity:0.5;margin-top:6px">Click for details</div>`;
  html += `</div>`;
  return html;
}

function buildProgressBar(bill: Bill): string {
  const statusLower = bill.status.toLowerCase();
  let stage = 0;
  let stageLabel = bill.status;

  if (statusLower.includes("introduced") || statusLower.includes("filed")) {
    stage = 1;
    stageLabel = "Introduced";
  } else if (statusLower.includes("committee")) {
    stage = 2;
    stageLabel = "In Committee";
  } else if (statusLower.includes("passed") && statusLower.includes("one")) {
    stage = 3;
    stageLabel = "Passed One Chamber";
  } else if (statusLower.includes("passed") || statusLower.includes("floor")) {
    stage = 3;
    stageLabel = "Floor Vote";
  } else if (statusLower.includes("enacted") || statusLower.includes("signed")) {
    stage = 4;
    stageLabel = "Enacted";
  } else if (statusLower.includes("committee")) {
    stage = 2;
  } else {
    stage = 2; // Default to "In committee" for most active bills
  }

  const totalStages = 4;
  const pct = (stage / totalStages) * 100;

  const labels = ["Filed", "Committee", "Floor", "Enacted"];

  let html = `<div style="margin-top:5px">`;
  // Track bar
  html += `<div style="position:relative;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;margin:4px 0">`;
  html += `<div style="position:absolute;left:0;top:0;height:100%;width:${pct}%;background:#fbbf24;border-radius:2px"></div>`;
  html += `</div>`;
  // Stage labels
  html += `<div style="display:flex;justify-content:space-between;font-size:9px;opacity:0.5">`;
  for (let i = 0; i < labels.length; i++) {
    const active = i < stage;
    html += `<span style="${active ? "opacity:1;color:#fbbf24" : ""}">${labels[i]}</span>`;
  }
  html += `</div>`;
  html += `<div style="font-size:11px;color:#fbbf24;margin-top:2px">Stage: ${stageLabel}</div>`;
  html += `</div>`;

  return html;
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
