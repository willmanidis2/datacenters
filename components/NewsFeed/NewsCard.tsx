"use client";

import { formatDistanceToNow } from "date-fns";
import { NewsItem } from "@/lib/types";

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const relativeTime = item.pubDate
    ? formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })
    : "";

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      {item.source && (
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          {item.source}
        </p>
      )}
      <h3 className="text-base font-medium mt-1 line-clamp-2 text-slate-900">
        {item.title}
      </h3>
      {item.description && (
        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
          {item.description}
        </p>
      )}
      <div className="flex items-center justify-between mt-3">
        {relativeTime && (
          <span className="text-xs text-slate-400">{relativeTime}</span>
        )}
        <span className="text-xs text-blue-600 font-medium">Read more →</span>
      </div>
    </a>
  );
}
