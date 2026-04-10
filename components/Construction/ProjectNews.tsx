"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { NewsItem } from "@/lib/types";

interface ProjectNewsProps {
  projectName: string;
  ownerName: string;
  stateName: string;
}

export default function ProjectNews({
  projectName,
  ownerName,
  stateName,
}: ProjectNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNews([]);

    // Build a search query: "data center" + owner + state location
    // e.g. "data center" Amazon "New Carlisle" Indiana
    const locationPart = projectName.includes(",")
      ? projectName.split(",")[0].trim()
      : projectName.replace(/^(OpenAI|Meta|Microsoft|Google|Amazon|xAI|QTS|Vantage|Fluidstack|Coreweave|Crusoe)\s*/i, "");
    const query = `${ownerName} "${locationPart}" data center`;

    fetch(`/api/news?state=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setNews(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [projectName, ownerName, stateName]);

  if (loading) {
    return (
      <div className="px-6 py-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">
          Local News
        </h4>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Loading news...
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="px-6 py-4 border-t border-slate-100">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Local News
        </h4>
        <p className="text-sm text-slate-400">
          No recent news found for this project.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 border-t border-slate-100">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">
        Local News
      </h4>
      <div className="space-y-3">
        {news.slice(0, 5).map((item, i) => {
          let timeAgo = "";
          try {
            timeAgo = formatDistanceToNow(new Date(item.pubDate), {
              addSuffix: true,
            });
          } catch {
            timeAgo = "";
          }

          return (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div className="text-sm text-slate-800 group-hover:text-blue-600 font-medium leading-snug line-clamp-2">
                {item.title}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                {item.source && (
                  <span className="font-medium text-slate-500">
                    {item.source}
                  </span>
                )}
                {timeAgo && <span>{timeAgo}</span>}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
