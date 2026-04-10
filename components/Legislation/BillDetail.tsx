"use client";

import { useEffect, useState } from "react";
import { LegiScanBillDetail } from "@/lib/types";

interface BillDetailProps {
  billId: number;
  onClose: () => void;
}

export default function BillDetail({ billId, onClose }: BillDetailProps) {
  const [detail, setDetail] = useState<LegiScanBillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`/api/legislation/${billId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDetail(data);
      })
      .catch(() => setError(true))
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

  if (error || !detail) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Could not load bill details. The bill may require a LegiScan API key.
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

      {/* Description */}
      {detail.description && (
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">
            {detail.description}
          </p>
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
                  <span className="text-slate-400">({s.party})</span>
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
