"use client";

import { ConstructionProject, StateData } from "@/lib/types";
import ProjectNews from "./ProjectNews";
import OutrageScore from "./OutrageScore";

interface ProjectDetailProps {
  project: ConstructionProject;
  stateData: StateData | undefined;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "#34C759",
  planned: "#007AFF",
  delayed: "#FF9500",
  deferred: "#FF9500",
  cancelled: "#FF3B30",
};

export default function ProjectDetail({
  project,
  stateData,
  onClose,
}: ProjectDetailProps) {
  const color = STATUS_COLORS[project.status] || "#34C759";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {project.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: `${color}20`,
                  color: color,
                }}
              >
                {project.status.charAt(0).toUpperCase() +
                  project.status.slice(1)}
              </span>
              {project.project && (
                <span className="text-sm text-slate-500">
                  {project.project}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
        <Stat label="Owner" value={project.owner} />
        <Stat
          label="Users"
          value={project.users.length > 0 ? project.users.join(", ") : "—"}
        />
        <Stat
          label="Power"
          value={
            project.powerMW > 0
              ? `${project.powerMW.toLocaleString()} MW`
              : "TBD"
          }
        />
        <Stat
          label="Capital Cost"
          value={
            project.capitalCostB > 0
              ? `$${project.capitalCostB.toFixed(1)}B`
              : "TBD"
          }
        />
        <Stat
          label="H100 Equivalents"
          value={
            project.h100Equivalents > 0
              ? Math.round(project.h100Equivalents).toLocaleString()
              : "TBD"
          }
        />
        <Stat label="State" value={project.state} />
        <Stat label="Address" value={project.address} span2 />
      </div>

      {/* Notes */}
      <div className="px-6 py-4 border-t border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed">
          {project.notes}
        </p>
      </div>

      {/* Community Resistance Score */}
      <OutrageScore stateId={project.stateId} stateData={stateData} />

      {/* Timeline */}
      {project.timelineEvents.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Construction Timeline
          </h4>
          <div className="space-y-3">
            {project.timelineEvents.map((event, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{ background: color }}
                  />
                  {i < project.timelineEvents.length - 1 && (
                    <div className="w-px h-full bg-slate-200 min-h-[16px]" />
                  )}
                </div>
                <div className="pb-1">
                  <div className="text-xs font-mono text-slate-400">
                    {event.date}
                  </div>
                  <div className="text-sm text-slate-700">
                    {event.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local News */}
      <ProjectNews
        projectName={project.name}
        ownerName={project.owner}
        stateName={project.state}
      />

      {/* Sources */}
      {project.sources.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Sources
          </h4>
          <div className="space-y-1">
            {project.sources.map((url, i) => {
              let domain = url;
              try {
                domain = new URL(url).hostname.replace("www.", "");
              } catch {
                /* keep original */
              }
              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                >
                  {domain}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  span2,
}: {
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div className={`bg-white px-4 py-3 ${span2 ? "col-span-2" : ""}`}>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
      <div className="text-sm font-semibold text-slate-900 mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}
