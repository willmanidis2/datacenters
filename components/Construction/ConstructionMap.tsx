"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { ConstructionProject } from "@/lib/types";
import { GEO_URL } from "@/lib/constants";

interface ConstructionMapProps {
  projects: ConstructionProject[];
  selectedProject: string | null;
  onSelectProject: (name: string | null) => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#34C759",
  planned: "#007AFF",
  delayed: "#FF9500",
  deferred: "#FF9500",
  cancelled: "#FF3B30",
};

function getRadius(powerMW: number): number {
  if (powerMW <= 0) return 4;
  return Math.max(4, Math.min(22, Math.sqrt(powerMW) * 0.7));
}

function formatCost(b: number): string {
  if (b <= 0) return "TBD";
  return `$${b.toFixed(1)}B`;
}

function formatMW(mw: number): string {
  if (mw <= 0) return "TBD";
  return `${mw.toLocaleString()} MW`;
}

export default function ConstructionMap({
  projects,
  selectedProject,
  onSelectProject,
}: ConstructionMapProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => b.powerMW - a.powerMW);
  }, [projects]);

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 1000 }}
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#F1F5F9"
                stroke="#CBD5E1"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {sortedProjects.map((project) => {
          const isSelected = selectedProject === project.name;
          const isHovered = hoveredProject === project.name;
          const color = STATUS_COLORS[project.status] || "#34C759";
          const r = getRadius(project.powerMW);

          return (
            <Marker
              key={project.name}
              coordinates={[project.lng, project.lat]}
            >
              <circle
                r={isSelected || isHovered ? r + 3 : r}
                fill={color}
                fillOpacity={isSelected ? 0.9 : 0.7}
                stroke={isSelected ? "#0F172A" : "#FFFFFF"}
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={() => setHoveredProject(project.name)}
                onMouseLeave={() => setHoveredProject(null)}
                onClick={() =>
                  onSelectProject(
                    selectedProject === project.name ? null : project.name
                  )
                }
                data-tooltip-id="construction-tooltip"
                data-tooltip-html={buildTooltipHtml(project)}
              />
            </Marker>
          );
        })}
      </ComposableMap>
      <Tooltip
        id="construction-tooltip"
        className="!max-w-xs !bg-slate-900 !text-white !rounded-xl !px-4 !py-3 !text-sm !shadow-xl"
        opacity={1}
      />
    </div>
  );
}

function buildTooltipHtml(project: ConstructionProject): string {
  const color = STATUS_COLORS[project.status] || "#34C759";
  const statusLabel =
    project.status.charAt(0).toUpperCase() + project.status.slice(1);
  let html = `<div style="max-width:260px">`;
  html += `<div style="font-size:14px;font-weight:700;margin-bottom:4px">${project.name}</div>`;
  html += `<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px">`;
  html += `<span style="background:${color}30;color:${color};padding:1px 8px;border-radius:99px;font-size:11px;font-weight:600">${statusLabel}</span>`;
  html += `</div>`;
  html += `<div style="font-size:12px;opacity:0.8;line-height:1.4">`;
  html += `<div><strong>Owner:</strong> ${project.owner}</div>`;
  if (project.users.length > 0) {
    html += `<div><strong>Users:</strong> ${project.users.join(", ")}</div>`;
  }
  html += `<div><strong>Power:</strong> ${formatMW(project.powerMW)}</div>`;
  html += `<div><strong>Cost:</strong> ${formatCost(project.capitalCostB)}</div>`;
  html += `<div><strong>Location:</strong> ${project.state}</div>`;
  html += `</div>`;
  html += `<div style="font-size:10px;opacity:0.5;margin-top:6px">Click for details</div>`;
  html += `</div>`;
  return html;
}
