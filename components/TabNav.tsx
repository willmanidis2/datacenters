"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Moratoriums" },
  { href: "/construction", label: "Construction" },
  { href: "/legislation", label: "AI Legislation" },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 bg-slate-100 rounded-xl p-1 max-w-lg mx-auto">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
