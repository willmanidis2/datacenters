"use client";

import { useState } from "react";
import { ConstructionProject } from "@/lib/types";
import ConstructionMap from "./ConstructionMap";
import ProjectTable from "./ProjectTable";
import ProjectDetail from "./ProjectDetail";

interface ConstructionViewProps {
  projects: ConstructionProject[];
}

export default function ConstructionView({ projects }: ConstructionViewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const selected = projects.find((p) => p.name === selectedProject) ?? null;

  return (
    <div>
      <ConstructionMap
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 mb-6 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#34C759]" />
          Operational
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#007AFF]" />
          Planned
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FF9500]" />
          Delayed
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          &lt;100 MW
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-300" />
          100–500 MW
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-300" />
          500+ MW
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="mb-6">
          <ProjectDetail
            project={selected}
            onClose={() => setSelectedProject(null)}
          />
        </div>
      )}

      {/* Data Table */}
      <ProjectTable
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />
    </div>
  );
}
