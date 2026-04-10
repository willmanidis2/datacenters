"use client";

import { useState, useMemo } from "react";
import { LegiScanBill } from "@/lib/types";
import GanttChart from "./GanttChart";
import CadenceChart from "./CadenceChart";

interface TimelineViewProps {
  bills: LegiScanBill[];
}

const PARTY_OPTIONS = [
  { value: "all", label: "All Parties" },
  { value: "D", label: "Democrat" },
  { value: "R", label: "Republican" },
  { value: "B", label: "Bipartisan" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "data_centers", label: "Data Centers" },
  { value: "ai_regulation", label: "AI Regulation" },
  { value: "deepfakes", label: "Deepfakes" },
  { value: "ai_government", label: "Gov't AI" },
  { value: "ai_employment", label: "Employment" },
  { value: "ai_education", label: "Education" },
  { value: "ai_healthcare", label: "Healthcare" },
  { value: "ai_privacy", label: "Privacy" },
  { value: "ai_criminal_justice", label: "Criminal Justice" },
  { value: "ai_other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active (Introduced/Committee)" },
  { value: "passed", label: "Passed/Enacted" },
  { value: "failed", label: "Failed/Vetoed" },
];

export default function TimelineView({ bills }: TimelineViewProps) {
  const [partyFilter, setPartyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [colorBy, setColorBy] = useState<"party" | "status" | "category">("party");

  const states = useMemo(
    () => Array.from(new Set(bills.map((b) => b.state))).sort(),
    [bills]
  );

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      if (partyFilter !== "all" && bill.introducer_party !== partyFilter) return false;
      if (categoryFilter !== "all" && bill.category !== categoryFilter) return false;
      if (stateFilter !== "all" && bill.state !== stateFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "active" && !["introduced", "engrossed", "enrolled", "pending"].includes(bill.status)) return false;
        if (statusFilter === "passed" && bill.status !== "passed") return false;
        if (statusFilter === "failed" && !["failed", "vetoed"].includes(bill.status)) return false;
      }
      return true;
    });
  }, [bills, partyFilter, categoryFilter, statusFilter, stateFilter]);

  // Party stats
  const partyStats = useMemo(() => {
    const d = filtered.filter((b) => b.introducer_party === "D").length;
    const r = filtered.filter((b) => b.introducer_party === "R").length;
    const b = filtered.filter((b) => b.introducer_party === "B").length;
    return { d, r, b, total: filtered.length };
  }, [filtered]);

  return (
    <div>
      {/* Party stat bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">
            {partyStats.total} bills
          </span>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              Democrat: {partyStats.d}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              Republican: {partyStats.r}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              Bipartisan: {partyStats.b}
            </span>
          </div>
        </div>
        {partyStats.total > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            {partyStats.d > 0 && (
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${(partyStats.d / partyStats.total) * 100}%` }}
              />
            )}
            {partyStats.r > 0 && (
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${(partyStats.r / partyStats.total) * 100}%` }}
              />
            )}
            {partyStats.b > 0 && (
              <div
                className="bg-purple-500 transition-all"
                style={{ width: `${(partyStats.b / partyStats.total) * 100}%` }}
              />
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={partyFilter}
          onChange={(e) => setPartyFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {PARTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="all">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 ml-auto bg-white border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setColorBy("party")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              colorBy === "party"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Color: Party
          </button>
          <button
            onClick={() => setColorBy("status")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              colorBy === "status"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setColorBy("category")}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              colorBy === "category"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Category
          </button>
        </div>
      </div>

      {/* Introduction cadence histogram */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Bill Introduction Cadence
        </h3>
        <CadenceChart bills={filtered} />
      </div>

      {/* Gantt chart */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <GanttChart bills={filtered} colorBy={colorBy} />
      </div>
    </div>
  );
}
