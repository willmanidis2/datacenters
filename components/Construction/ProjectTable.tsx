"use client";

import { ConstructionProject } from "@/lib/types";

interface ProjectTableProps {
  projects: ConstructionProject[];
  selectedProject: string | null;
  onSelectProject: (name: string | null) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-50", text: "text-green-700" },
  planned: { bg: "bg-blue-50", text: "text-blue-700" },
  delayed: { bg: "bg-orange-50", text: "text-orange-700" },
  deferred: { bg: "bg-orange-50", text: "text-orange-700" },
  cancelled: { bg: "bg-red-50", text: "text-red-700" },
};

function formatCost(b: number): string {
  if (b <= 0) return "—";
  return `$${b.toFixed(1)}B`;
}

function formatMW(mw: number): string {
  if (mw <= 0) return "—";
  return `${mw.toLocaleString()}`;
}

function formatH100(n: number): string {
  if (n <= 0) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  return `${Math.round(n / 1000)}K`;
}

export default function ProjectTable({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectTableProps) {
  const sorted = [...projects].sort((a, b) => b.powerMW - a.powerMW);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Project
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Owner
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Users
            </th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">
              Power (MW)
            </th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">
              Cost
            </th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">
              H100 Equiv.
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              State
            </th>
            <th className="text-center px-4 py-3 font-semibold text-slate-600">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((project) => {
            const isSelected = selectedProject === project.name;
            const statusStyle = STATUS_COLORS[project.status] || STATUS_COLORS.active;

            return (
              <tr
                key={project.name}
                onClick={() =>
                  onSelectProject(isSelected ? null : project.name)
                }
                className={`border-b border-slate-100 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-50"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-semibold">
                    {project.name}
                  </div>
                  {project.project && (
                    <div
                      className={`text-xs ${
                        isSelected ? "text-slate-400" : "text-slate-400"
                      }`}
                    >
                      {project.project}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{project.owner}</td>
                <td className="px-4 py-3">
                  {project.users.length > 0
                    ? project.users.join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMW(project.powerMW)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCost(project.capitalCostB)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatH100(project.h100Equivalents)}
                </td>
                <td className="px-4 py-3">{project.stateId}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : `${statusStyle.bg} ${statusStyle.text}`
                    }`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
