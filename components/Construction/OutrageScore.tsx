import { StateData } from "@/lib/types";

interface OutrageScoreProps {
  stateId: string;
  stateData: StateData | undefined;
}

/**
 * Calculates a "Community Resistance Score" based on:
 * - Number of active local moratoriums in the state (×3 each)
 * - Number of proposed local moratoriums (×1 each)
 * - Number of state-level bills introduced (×4 each)
 * - Number of enacted state-level laws (×6 each)
 * - State classified as active_restrictions (×5)
 * - State classified as legislation_advancing (×3)
 *
 * Score ranges:
 * 0-5: Low resistance
 * 6-15: Moderate resistance
 * 16-30: High resistance
 * 31+: Very high resistance
 */
function computeScore(stateData: StateData | undefined): {
  score: number;
  breakdown: { label: string; count: number; points: number }[];
} {
  if (!stateData) return { score: 0, breakdown: [] };

  const breakdown: { label: string; count: number; points: number }[] = [];

  const moratoriums = stateData.localMoratoriums ?? [];
  const activeMoratoriums = moratoriums.filter(
    (m) => m.status === "active" || m.status === "enacted"
  ).length;
  const proposedMoratoriums = moratoriums.filter(
    (m) => m.status === "proposed"
  ).length;

  if (activeMoratoriums > 0) {
    breakdown.push({
      label: "Active local moratoriums",
      count: activeMoratoriums,
      points: activeMoratoriums * 3,
    });
  }
  if (proposedMoratoriums > 0) {
    breakdown.push({
      label: "Proposed moratoriums",
      count: proposedMoratoriums,
      points: proposedMoratoriums * 1,
    });
  }

  const bills = stateData.bills ?? [];
  const enactedBills = bills.filter((b) =>
    b.status.toLowerCase().includes("enacted") ||
    b.status.toLowerCase().includes("signed")
  ).length;
  const otherBills = bills.length - enactedBills;

  if (enactedBills > 0) {
    breakdown.push({
      label: "Enacted state laws",
      count: enactedBills,
      points: enactedBills * 6,
    });
  }
  if (otherBills > 0) {
    breakdown.push({
      label: "Bills introduced",
      count: otherBills,
      points: otherBills * 4,
    });
  }

  if (stateData.status === "active_restrictions") {
    breakdown.push({
      label: "State has active restrictions",
      count: 1,
      points: 5,
    });
  } else if (stateData.status === "legislation_advancing") {
    breakdown.push({
      label: "Legislation advancing",
      count: 1,
      points: 3,
    });
  }

  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { score, breakdown };
}

function getScoreLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score === 0)
    return { label: "None", color: "#C7C7CC", bgColor: "#F1F5F9" };
  if (score <= 5)
    return { label: "Low", color: "#34C759", bgColor: "#F0FFF4" };
  if (score <= 15)
    return { label: "Moderate", color: "#FF9500", bgColor: "#FFFBEB" };
  if (score <= 30)
    return { label: "High", color: "#FF3B30", bgColor: "#FFF1F0" };
  return { label: "Very High", color: "#AF1D1D", bgColor: "#FFF1F0" };
}

export default function OutrageScore({ stateId, stateData }: OutrageScoreProps) {
  const { score, breakdown } = computeScore(stateData);
  const level = getScoreLevel(score);

  return (
    <div className="px-6 py-4 border-t border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-700">
          Community Resistance ({stateId})
        </h4>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: level.color }}
          >
            {score}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: level.color,
              background: level.bgColor,
            }}
          >
            {level.label}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, (score / 40) * 100)}%`,
            background: level.color,
          }}
        />
      </div>

      {/* Breakdown */}
      {breakdown.length > 0 ? (
        <div className="space-y-1">
          {breakdown.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs"
            >
              <span className="text-slate-500">
                {item.label}
                {item.count > 1 && (
                  <span className="text-slate-400"> (×{item.count})</span>
                )}
              </span>
              <span className="font-mono text-slate-600">
                +{item.points}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400">
          No moratoriums or legislation in this state.
        </p>
      )}
    </div>
  );
}
