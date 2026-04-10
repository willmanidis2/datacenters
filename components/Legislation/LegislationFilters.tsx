"use client";

interface LegislationFiltersProps {
  states: string[];
  selectedState: string;
  selectedStatus: string;
  selectedCategory: string;
  searchQuery: string;
  onStateChange: (state: string) => void;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "introduced", label: "Introduced" },
  { value: "engrossed", label: "Engrossed" },
  { value: "enrolled", label: "Enrolled" },
  { value: "passed", label: "Passed" },
  { value: "vetoed", label: "Vetoed" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "data_centers", label: "Data Centers" },
  { value: "ai_regulation", label: "AI Regulation" },
  { value: "deepfakes", label: "Deepfakes" },
  { value: "ai_government", label: "AI in Government" },
  { value: "ai_employment", label: "AI & Employment" },
  { value: "ai_education", label: "AI & Education" },
  { value: "ai_healthcare", label: "AI & Healthcare" },
  { value: "ai_privacy", label: "AI & Privacy" },
  { value: "ai_criminal_justice", label: "AI & Criminal Justice" },
  { value: "ai_other", label: "Other AI" },
];

export default function LegislationFilters({
  states,
  selectedState,
  selectedStatus,
  selectedCategory,
  searchQuery,
  onStateChange,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
}: LegislationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <select
        value={selectedState}
        onChange={(e) => onStateChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        <option value="all">All States</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search bills..."
        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 flex-1 min-w-[200px]"
      />
    </div>
  );
}
