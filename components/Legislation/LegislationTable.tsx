"use client";

import { LegiScanBill, LegiScanBillStatus, AIBillCategory } from "@/lib/types";

interface LegislationTableProps {
  bills: LegiScanBill[];
  selectedBillId: number | null;
  onSelectBill: (id: number | null) => void;
}

const STATUS_STYLES: Record<LegiScanBillStatus, { bg: string; text: string }> = {
  introduced: { bg: "bg-blue-50", text: "text-blue-700" },
  engrossed: { bg: "bg-purple-50", text: "text-purple-700" },
  enrolled: { bg: "bg-indigo-50", text: "text-indigo-700" },
  passed: { bg: "bg-green-50", text: "text-green-700" },
  vetoed: { bg: "bg-orange-50", text: "text-orange-700" },
  failed: { bg: "bg-red-50", text: "text-red-700" },
  pending: { bg: "bg-slate-50", text: "text-slate-600" },
};

const CATEGORY_LABELS: Record<AIBillCategory, string> = {
  data_centers: "Data Centers",
  ai_regulation: "AI Regulation",
  deepfakes: "Deepfakes",
  ai_government: "Gov't AI",
  ai_employment: "Employment",
  ai_education: "Education",
  ai_healthcare: "Healthcare",
  ai_privacy: "Privacy",
  ai_criminal_justice: "Criminal Justice",
  ai_other: "Other",
};

export default function LegislationTable({
  bills,
  selectedBillId,
  onSelectBill,
}: LegislationTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              State
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Bill
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Title
            </th>
            <th className="text-center px-4 py-3 font-semibold text-slate-600">
              Category
            </th>
            <th className="text-center px-4 py-3 font-semibold text-slate-600">
              Status
            </th>
            <th className="text-left px-4 py-3 font-semibold text-slate-600">
              Last Action
            </th>
            <th className="text-right px-4 py-3 font-semibold text-slate-600">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-slate-400"
              >
                No bills found matching your filters.
              </td>
            </tr>
          ) : (
            bills.map((bill) => {
              const isSelected = selectedBillId === bill.bill_id;
              const style = STATUS_STYLES[bill.status] || STATUS_STYLES.pending;

              return (
                <tr
                  key={bill.bill_id}
                  onClick={() =>
                    onSelectBill(isSelected ? null : bill.bill_id)
                  }
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-semibold">
                    {bill.state}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className="flex items-center gap-1.5">
                      {bill.bill_number}
                      {bill.introducer_party && bill.introducer_party !== "unknown" && (
                        <span
                          className={`inline-block w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center leading-none ${
                            bill.introducer_party === "D"
                              ? "bg-blue-500"
                              : bill.introducer_party === "R"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                          title={`Introduced by ${bill.introducer_name || (bill.introducer_party === "D" ? "Democrat" : "Republican")}`}
                        >
                          {bill.introducer_party}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {bill.title}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        isSelected
                          ? "bg-white/10 text-slate-300"
                          : "bg-slate-50 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {CATEGORY_LABELS[bill.category] || bill.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : `${style.bg} ${style.text}`
                      }`}
                    >
                      {bill.status.charAt(0).toUpperCase() +
                        bill.status.slice(1)}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 max-w-xs truncate text-xs ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {bill.last_action}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs whitespace-nowrap">
                    {bill.last_action_date}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
