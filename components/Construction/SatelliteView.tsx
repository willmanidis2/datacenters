"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";

interface SatelliteViewProps {
  lat: number;
  lng: number;
  name: string;
}

interface WaybackRelease {
  releaseNum: number;
  date: string; // formatted
  timestamp: number;
}

const ZOOM = 16;
const GRID = 3; // 3x3 tile grid

function latLngToTile(lat: number, lng: number, zoom: number) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
  return { x, y };
}

// Esri Wayback releases config
const WAYBACK_CONFIG_URL =
  "https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer?f=json";

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function SatelliteView({ lat, lng, name }: SatelliteViewProps) {
  const [releases, setReleases] = useState<WaybackRelease[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tile = useMemo(() => latLngToTile(lat, lng, ZOOM), [lat, lng]);

  // Auto-play: slowly advance through dates until user interacts
  useEffect(() => {
    if (!autoPlaying || releases.length <= 1 || userInteracted) return;

    // Start from the beginning
    setSelectedIdx(0);

    autoPlayRef.current = setInterval(() => {
      setSelectedIdx((prev) => {
        if (prev >= releases.length - 1) {
          // Reached the end, stop
          setAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlaying, releases.length, userInteracted]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInteracted(true);
    setAutoPlaying(false);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    setSelectedIdx(Number(e.target.value));
  }, []);

  // Fetch available Wayback releases
  useEffect(() => {
    let cancelled = false;

    fetch(WAYBACK_CONFIG_URL)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        // The WMTS response has Selection object with numeric keys
        // Each entry: { Name: "World Imagery (Wayback 2026-03-25)", M: "22869", ID: "WB_2026_R03" }
        const selection = data?.Selection;
        if (!selection || typeof selection !== "object") {
          setReleases([
            { releaseNum: 0, date: "Current", timestamp: Date.now() },
          ]);
          setLoading(false);
          return;
        }

        const entries = Object.values(selection) as {
          Name: string;
          M: string;
          ID: string;
        }[];

        // Parse date from Name like "World Imagery (Wayback 2026-03-25)"
        const allReleases: WaybackRelease[] = entries
          .map((entry) => {
            const dateMatch = entry.Name.match(/(\d{4}-\d{2}-\d{2})/);
            if (!dateMatch) return null;
            const timestamp = new Date(dateMatch[1]).getTime();
            return {
              releaseNum: parseInt(entry.M, 10),
              date: formatDate(timestamp),
              timestamp,
            };
          })
          .filter((r): r is WaybackRelease => r !== null && r.timestamp > new Date("2020-01-01").getTime())
          .sort((a, b) => a.timestamp - b.timestamp);

        // Sample: pick one per quarter to avoid too many options
        const sampled: WaybackRelease[] = [];
        let lastQuarter = "";
        for (const r of allReleases) {
          const d = new Date(r.timestamp);
          const q = `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`;
          if (q !== lastQuarter) {
            sampled.push(r);
            lastQuarter = q;
          }
        }

        if (sampled.length === 0) {
          sampled.push({
            releaseNum: 0,
            date: "Current",
            timestamp: Date.now(),
          });
        }

        setReleases(sampled);
        setSelectedIdx(0); // Start at oldest for auto-play
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <div className="px-6 py-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Satellite Imagery
        </h4>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Loading imagery...
        </div>
      </div>
    );
  }

  const currentRelease = releases[selectedIdx];
  const tileSize = 256;

  // Build tile URLs
  const getTileUrl = (tx: number, ty: number) => {
    if (currentRelease.releaseNum === 0) {
      // Current imagery
      return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${ty}/${tx}`;
    }
    // Wayback historical
    return `https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/WMTS/1.0.0/default028mm/MapServer/tile/${currentRelease.releaseNum}/${ZOOM}/${ty}/${tx}`;
  };

  const halfGrid = Math.floor(GRID / 2);
  const tiles: { x: number; y: number; row: number; col: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      tiles.push({
        x: tile.x - halfGrid + col,
        y: tile.y - halfGrid + row,
        row,
        col,
      });
    }
  }

  return (
    <div className="px-6 py-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">
          Satellite Imagery
        </h4>
        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
          {currentRelease.date}
        </span>
      </div>

      {/* Tile Grid — scales down on small screens via CSS */}
      <div
        className="relative overflow-hidden rounded-xl border border-slate-200 mx-auto"
        style={{
          width: "100%",
          maxWidth: GRID * tileSize,
          aspectRatio: "1",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            width: "100%",
            aspectRatio: "1",
          }}
        >
          {tiles.map((t) => (
            <img
              key={`${currentRelease.releaseNum}-${t.x}-${t.y}`}
              src={getTileUrl(t.x, t.y)}
              alt=""
              style={{ display: "block", width: "100%", height: "100%" }}
              loading="eager"
            />
          ))}
        </div>

        {/* Center crosshair */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="w-6 h-6 border-2 border-white rounded-full shadow-md opacity-80" />
        </div>

        {/* Project label */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {name}
        </div>
      </div>

      {/* Date Slider */}
      {releases.length > 1 && (
        <div className="mt-3">
          <input
            type="range"
            min={0}
            max={releases.length - 1}
            value={selectedIdx}
            onChange={handleSliderChange}
            className="w-full accent-slate-700"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>{releases[0].date}</span>
            <span>{releases[releases.length - 1].date}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-400">
          Imagery: Esri World Imagery Wayback
        </p>
        {!autoPlaying && releases.length > 1 && (
          <button
            onClick={() => {
              setUserInteracted(false);
              setSelectedIdx(0);
              setAutoPlaying(true);
            }}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1.5v9l8-4.5z" />
            </svg>
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
