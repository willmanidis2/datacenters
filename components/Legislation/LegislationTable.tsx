"use client";

import { LegiScanBill, LegiScanBillStatus } from "@/lib/types";

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
                colSpan={6}
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
                    {bill.bill_number}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {bill.title}
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
