"use client";

import { useMemo, useState, useEffect } from "react";
import { LocalMoratorium } from "@/lib/types";
import { COUNTIES_GEO_URL } from "@/lib/constants";

interface StateCountyMapProps {
  stateFips: string;
  localMoratoriums: LocalMoratorium[];
}

interface CountyFeature {
  id: string;
  path: string;
}

export default function StateCountyMap({
  stateFips,
  localMoratoriums,
}: StateCountyMapProps) {
  const [counties, setCounties] = useState<CountyFeature[]>([]);
  const [viewBox, setViewBox] = useState("0 0 400 300");
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  const moratoriumsByCounty = useMemo(() => {
    const map = new Map<string, LocalMoratorium[]>();
    for (const m of localMoratoriums) {
      const existing = map.get(m.countyFips) ?? [];
      existing.push(m);
      map.set(m.countyFips, existing);
    }
    return map;
  }, [localMoratoriums]);

  useEffect(() => {
    let cancelled = false;

    async function loadCounties() {
      const [topoModule, d3GeoModule] = await Promise.all([
        import("topojson-client"),
        import("d3-geo"),
      ]);

      const res = await fetch(COUNTIES_GEO_URL);
      const topo = await res.json();

      if (cancelled) return;

      const allCounties = topoModule.feature(
        topo,
        topo.objects.counties
      ) as unknown as GeoJSON.FeatureCollection;

      const stateCounties = allCounties.features.filter(
        (f) => String(f.id).substring(0, 2) === stateFips
      );

      const projection = d3GeoModule.geoAlbersUsa().scale(1000).translate([400, 250]);
      const pathGen = d3GeoModule.geoPath().projection(projection);

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      const features: CountyFeature[] = [];

      for (const f of stateCounties) {
        const d = pathGen(f);
        if (!d) continue;
        features.push({ id: String(f.id), path: d });

        const bounds = pathGen.bounds(f);
        if (bounds[0][0] < minX) minX = bounds[0][0];
        if (bounds[0][1] < minY) minY = bounds[0][1];
        if (bounds[1][0] > maxX) maxX = bounds[1][0];
        if (bounds[1][1] > maxY) maxY = bounds[1][1];
      }

      if (features.length > 0) {
        const pad = 15;
        setViewBox(
          `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`
        );
        setCounties(features);
      }
    }

    loadCounties();
    return () => { cancelled = true; };
  }, [stateFips]);

  if (counties.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto animate-pulse bg-slate-50 rounded-xl h-48" />
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <svg
        viewBox={viewBox}
        className="w-full h-auto"
        role="img"
        aria-label="County map showing local data center restrictions"
      >
        {counties.map((county) => {
          const moratoriums = moratoriumsByCounty.get(county.id);
          const isHovered = hoveredCounty === county.id;

          const hasActive = moratoriums?.some(
            (m) => m.status === "active" || m.status === "enacted"
          );
          const hasProposed = moratoriums?.some(
            (m) => m.status === "proposed"
          );

          let fill = "#f1f5f9";
          if (hasActive) fill = isHovered ? "#f87171" : "#fca5a5";
          else if (hasProposed) fill = isHovered ? "#fbbf24" : "#fde68a";
          else fill = isHovered ? "#e2e8f0" : "#f1f5f9";

          return (
            <path
              key={county.id}
              d={county.path}
              fill={fill}
              stroke="#cbd5e1"
              strokeWidth={0.5}
              onMouseEnter={() => setHoveredCounty(county.id)}
              onMouseLeave={() => setHoveredCounty(null)}
              onClick={() => {
                if (moratoriums) {
                  setHoveredCounty(county.id);
                }
              }}
              style={{ cursor: moratoriums ? "pointer" : "default" }}
            />
          );
        })}
      </svg>

      {hoveredCounty && moratoriumsByCounty.has(hoveredCounty) && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          {moratoriumsByCounty.get(hoveredCounty)!.map((m) => (
            <div key={m.locality} className="flex items-center gap-2 py-0.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  m.status === "active" || m.status === "enacted"
                    ? "bg-red-500"
                    : m.status === "proposed"
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <span className="font-medium">{m.locality}</span>
              <span className="text-slate-400">{m.status} &middot; {m.type.replace("_", " ")}</span>
              {m.url && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-auto"
                >
                  View &rarr;
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-300 border border-red-400" />
          Active
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-200 border border-amber-300" />
          Proposed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300" />
          No action
        </span>
      </div>
    </div>
  );
}
