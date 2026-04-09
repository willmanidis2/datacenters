import summaryData from "@/data/ai-summary.json";
import { formatDistanceToNow } from "date-fns";

export default function AISummaryPanel() {
  const generatedTime = formatDistanceToNow(new Date(summaryData.generatedAt), {
    addSuffix: true,
  });

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 1l2.39 4.84L17.27 6.8l-3.64 3.55.86 5.01L10 13.02l-4.49 2.34.86-5.01L2.73 6.8l4.88-.96L10 1z" />
          </svg>
          <h2 className="text-xl font-bold">AI Overview</h2>
        </div>
        <span className="text-xs text-slate-400">
          Generated {generatedTime} by Claude
        </span>
      </div>

      <div className="prose prose-slate prose-sm max-w-none">
        <p className="whitespace-pre-wrap leading-relaxed">
          {summaryData.summary}
        </p>
      </div>
    </div>
  );
}
