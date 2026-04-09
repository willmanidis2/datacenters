"use client";

import { LegislativeStatus } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";

interface StatusBadgeProps {
  status: LegislativeStatus;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{
        backgroundColor: `${config.color}1A`,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}
