import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import stateStatusesData from "@/data/state-statuses.json";
import { StateData } from "@/lib/types";
import { STATUS_CONFIG } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import NewsFeed from "@/components/NewsFeed/NewsFeed";

interface PageProps {
  params: { slug: string };
}

function getState(slug: string): StateData | undefined {
  return stateStatusesData.states.find((s) => s.slug === slug) as
    | StateData
    | undefined;
}

export function generateStaticParams() {
  return stateStatusesData.states.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const state = getState(params.slug);
  if (!state) return { title: "State Not Found" };

  return {
    title: `${state.name} — Data Center Moratoriums`,
    description: state.summary,
  };
}

export default function StateDetailPage({ params }: PageProps) {
  const state = getState(params.slug);
  if (!state) notFound();

  const config = STATUS_CONFIG[state.status];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        ← Back to map
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <h1 className="text-3xl font-bold">{state.name}</h1>
        <StatusBadge status={state.status} size="md" />
      </div>

      <p className="text-slate-700 text-lg leading-relaxed mb-8">
        {state.summary}
      </p>

      {state.bills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Legislation</h2>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 font-medium text-slate-600">Bill</th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Title
                  </th>
                  <th className="px-4 py-3 font-medium text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.bills.map((bill) => (
                  <tr key={bill.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">
                      {bill.url ? (
                        <a
                          href={bill.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {bill.id}
                        </a>
                      ) : (
                        bill.id
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{bill.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${config.color}1A`,
                          color: config.color,
                        }}
                      >
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">
          Related News
        </h2>
        <NewsFeed stateFilter={state.name} />
      </section>

      <footer className="mt-10 pt-6 border-t border-slate-200 text-sm text-slate-400">
        Last updated: {state.lastUpdated}
      </footer>
    </main>
  );
}
