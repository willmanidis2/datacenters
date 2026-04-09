"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "@/lib/types";
import NewsCard from "./NewsCard";

interface NewsFeedProps {
  stateFilter?: string;
}

export default function NewsFeed({ stateFilter }: NewsFeedProps) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = stateFilter
      ? `/api/news?state=${encodeURIComponent(stateFilter)}`
      : "/api/news";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch news");
        return res.json();
      })
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [stateFilter]);

  if (loading) {
    return (
      <div>
        <SectionHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-100 rounded-xl h-36"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <SectionHeader />
        <div className="text-center py-8 text-slate-500">
          <p>Failed to load news feed.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <SectionHeader />
        <p className="text-center py-8 text-slate-500">
          No recent news articles found.
        </p>
      </div>
    );
  }

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div>
      <SectionHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleItems.map((item, i) => (
          <NewsCard key={i} item={item} />
        ))}
      </div>
      {visibleCount < items.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount((c) => c + 9)}
            className="px-5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xl font-bold">Latest News</h2>
      <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        Live
      </span>
    </div>
  );
}
