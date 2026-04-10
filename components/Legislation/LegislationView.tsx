"use client";

import { useState, useMemo } from "react";
import { LegiScanBill } from "@/lib/types";
import LegislationFilters from "./LegislationFilters";
import LegislationTable from "./LegislationTable";
import BillDetail from "./BillDetail";

interface LegislationViewProps {
  bills: LegiScanBill[];
  lastRefreshed: string | null;
}

export default function LegislationView({
  bills,
  lastRefreshed,
}: LegislationViewProps) {
  const [selectedBillId, setSelectedBillId] = useState<number | null>(null);
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const uniqueStates = useMemo(
    () => Array.from(new Set(bills.map((b) => b.state))).sort(),
    [bills]
  );

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      if (stateFilter !== "all" && bill.state !== stateFilter) return false;
      if (statusFilter !== "all" && bill.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          bill.title.toLowerCase().includes(q) ||
          bill.bill_number.toLowerCase().includes(q) ||
          bill.last_action.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bills, stateFilter, statusFilter, searchQuery]);

  return (
    <div>
      <LegislationFilters
        states={uniqueStates}
        selectedState={stateFilter}
        selectedStatus={statusFilter}
        searchQuery={searchQuery}
        onStateChange={setStateFilter}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      {selectedBillId && (
        <BillDetail
          billId={selectedBillId}
          onClose={() => setSelectedBillId(null)}
        />
      )}

      <LegislationTable
        bills={filteredBills}
        selectedBillId={selectedBillId}
        onSelectBill={setSelectedBillId}
      />

      {lastRefreshed && (
        <p className="text-xs text-slate-400 mt-3 text-center">
          Last refreshed:{" "}
          {new Date(lastRefreshed).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}
    </div>
  );
}
