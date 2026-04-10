"use client";

import { useEffect, useState } from "react";
import { LegiScanBill, LegiScanBillDetail } from "@/lib/types";

interface BillDetailProps {
  billId: number;
  bill?: LegiScanBill;
  onClose: () => void;
}

interface DetailWithEnrichment extends LegiScanBillDetail {
  ai_summary?: string;
  introducer_party?: string;
}

export default function BillDetail({ billId, bill, onClose }: BillDetailProps) {
  const [detail, setDetail] = useState<DetailWithEnrichment | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    setLoading(true);
    setApiFailed(false);

    fetch(`/api/legislation/${billId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDetail(data);
      })
      .catch(() => setApiFailed(true))
      .finally(() => setLoading(false));
  }, [billId]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Loading bill details...
        </div>
      </div>
    );
  }

  // If API failed but we have cached bill data, render from cache
  if ((apiFailed || !detail) && bill) {
    return <CachedBillDetail bill={bill} onClose={onClose} />;
  }

  if (!detail) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Could not load bill details.
          </p>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>
      </div>
    );
  }

  // Use session_end_date from detail or from cached bill
  const sessionEnd = detail.session_end_date || bill?.session_end_date;
  const daysRemaining = sessionEnd ? getDaysRemaining(sessionEnd) : null;

  // Use AI summary from detail (merged from cache in API) or from bill prop
  const aiSummary = detail.ai_summary || bill?.ai_summary;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-slate-900">
                {detail.state} {detail.bill_number}
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {detail.status}
              </span>
              {daysRemaining !== null && (
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    daysRemaining <= 30
                      ? "bg-red-50 text-red-700"
                      : daysRemaining <= 90
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} days left in session`
                    : "Session ended"}
                </span>
              )}
            </div>
            <h3 className="text-base text-slate-700 mt-1">{detail.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/30">
          <h4 className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
            AI Summary
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Description */}
      {detail.description && !aiSummary && (
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">
            {detail.description}
          </p>
        </div>
      )}

      {/* Vote Charts */}
      {detail.votes && detail.votes.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Vote Results
          </h4>
          <div className="space-y-3">
            {detail.votes.map((vote, i) => (
              <VotePieChart key={i} vote={vote} />
            ))}
          </div>
        </div>
      )}

      {/* Sponsors */}
      {detail.sponsors.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Sponsors
          </h4>
          <div className="flex flex-wrap gap-2">
            {detail.sponsors.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {s.name}
                {s.party && (
                  <span
                    className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold text-white ${
                      s.party === "D"
                        ? "bg-blue-500"
                        : s.party === "R"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {s.party.charAt(0)}
                  </span>
                )}
                {s.role !== "Sponsor" && (
                  <span className="text-slate-400">&middot; {s.role}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {detail.subjects.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">
            Subjects
          </h4>
          <div className="flex flex-wrap gap-2">
            {detail.subjects.map((s, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs bg-slate-50 text-slate-600 border border-slate-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History Timeline */}
      {detail.history.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Legislative History
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {detail.history.map((event, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 bg-blue-500" />
                  {i < detail.history.length - 1 && (
                    <div className="w-px h-full bg-slate-200 min-h-[16px]" />
                  )}
                </div>
                <div className="pb-1">
                  <div className="text-xs font-mono text-slate-400">
                    {event.date}
                    {event.chamber && (
                      <span className="ml-2 text-slate-300">
                        {event.chamber}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-700">{event.action}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {detail.text_url && (
            <a
              href={detail.text_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Full Text &rarr;
            </a>
          )}
          {detail.url && (
            <a
              href={detail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View on LegiScan &rarr;
            </a>
          )}
          {detail.state_link && (
            <a
              href={detail.state_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              State Legislature &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function VotePieChart({
  vote,
}: {
  vote: { date: string; chamber: string; yea: number; nay: number; absent: number; passed: boolean };
}) {
  const total = vote.yea + vote.nay + vote.absent;
  if (total === 0) return null;

  const yeaPct = (vote.yea / total) * 100;
  const nayPct = (vote.nay / total) * 100;

  // SVG donut chart
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const yeaArc = (vote.yea / total) * circumference;
  const nayArc = (vote.nay / total) * circumference;
  const absentArc = (vote.absent / total) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        {/* Yea (green) */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#22c55e"
          strokeWidth="8"
          strokeDasharray={`${yeaArc} ${circumference - yeaArc}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="butt"
        />
        {/* Nay (red) */}
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth="8"
          strokeDasharray={`${nayArc} ${circumference - nayArc}`}
          strokeDashoffset={circumference * 0.25 - yeaArc}
          strokeLinecap="butt"
        />
        {/* Absent (gray) */}
        {vote.absent > 0 && (
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="8"
            strokeDasharray={`${absentArc} ${circumference - absentArc}`}
            strokeDashoffset={circumference * 0.25 - yeaArc - nayArc}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="text-xs">
        <div className="font-semibold text-slate-700 mb-1">
          {vote.chamber} &middot; {vote.date}
          <span
            className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
              vote.passed
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {vote.passed ? "PASSED" : "FAILED"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Yea {vote.yea} ({yeaPct.toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Nay {vote.nay} ({nayPct.toFixed(0)}%)
          </span>
          {vote.absent > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
              Absent {vote.absent}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Fallback view when LegiScan API is unavailable — renders from cached bill data
function CachedBillDetail({ bill, onClose }: { bill: LegiScanBill; onClose: () => void }) {
  const sessionEnd = bill.session_end_date;
  const daysRemaining = sessionEnd ? getDaysRemaining(sessionEnd) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden mb-6">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-slate-900">
                {bill.state} {bill.bill_number}
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
              </span>
              {bill.introducer_party && bill.introducer_party !== "unknown" && (
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                    bill.introducer_party === "D"
                      ? "bg-blue-500"
                      : bill.introducer_party === "R"
                      ? "bg-red-500"
                      : "bg-purple-500"
                  }`}
                >
                  {bill.introducer_party}
                </span>
              )}
              {daysRemaining !== null && (
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    daysRemaining <= 30
                      ? "bg-red-50 text-red-700"
                      : daysRemaining <= 90
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  {daysRemaining > 0
                    ? `${daysRemaining} days left in session`
                    : "Session ended"}
                </span>
              )}
            </div>
            <h3 className="text-base text-slate-700 mt-1">{bill.title}</h3>
            {bill.introducer_name && (
              <p className="text-sm text-slate-500 mt-1">
                Introduced by {bill.introducer_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none p-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>

      {/* AI Summary */}
      {bill.ai_summary && (
        <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/30">
          <h4 className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wider">
            AI Summary
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">{bill.ai_summary}</p>
        </div>
      )}

      {/* Last Action */}
      {bill.last_action && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h4 className="text-sm font-semibold text-slate-700 mb-1">
            Last Action
          </h4>
          <p className="text-sm text-slate-600">
            {bill.last_action}
            <span className="text-slate-400 ml-2 text-xs font-mono">
              {bill.last_action_date}
            </span>
          </p>
        </div>
      )}

      {/* Links */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-3">
          {bill.url && (
            <a
              href={bill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View on LegiScan &rarr;
            </a>
          )}
          {bill.text_url && (
            <a
              href={bill.text_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View Full Text &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
