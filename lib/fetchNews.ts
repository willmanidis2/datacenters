import { XMLParser } from "fast-xml-parser";
import { NewsItem } from "./types";
import { NEWS_RSS_URL } from "./constants";

export async function fetchNews(query?: string): Promise<NewsItem[]> {
  const url = query
    ? `https://news.google.com/rss/search?q=%22data+center%22+${encodeURIComponent(query)}+moratorium+OR+ban+OR+legislation&hl=en-US&gl=US&ceid=US:en`
    : NEWS_RSS_URL;

  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; DataCenterMoratoriums/1.0; +https://datacenters.example.com)",
    },
  });

  if (!response.ok) {
    console.error(`RSS fetch failed: ${response.status}`);
    return [];
  }

  const xml = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  try {
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel?.item) return [];

    const items = Array.isArray(channel.item)
      ? channel.item
      : [channel.item];

    return items.slice(0, 20).map((item: Record<string, unknown>) => {
      const rawTitle = (item.title as string) || "";
      const source =
        typeof item.source === "object" && item.source !== null
          ? ((item.source as Record<string, string>)["#text"] || "")
          : typeof item.source === "string"
            ? item.source
            : "";

      // Strip " - Source Name" suffix from title if present
      const title = source && rawTitle.endsWith(` - ${source}`)
        ? rawTitle.slice(0, -(` - ${source}`).length)
        : rawTitle;

      const description = ((item.description as string) || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim()
        .slice(0, 200);

      return {
        title,
        link: (item.link as string) || "",
        source,
        pubDate: (item.pubDate as string) || "",
        description,
      } satisfies NewsItem;
    });
  } catch (err) {
    console.error("RSS parse error:", err);
    return [];
  }
}
