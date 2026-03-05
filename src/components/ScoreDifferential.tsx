import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { GameAnalysis } from "@/analysis/types"

/** Shows per-turn and cumulative score differentials, with a summary of missed points. */
export const ScoreDifferential = ({ analysis, currentTurnIndex }: Props) => {
  const turn = analysis.turns[currentTurnIndex]
  const differential = turn.scoreDifferential
  const cumulative = turn.cumulativeDifferential
  const isOptimal = differential === 0

  /** Compute worst miss per player from the turns data. */
  const worstMissByPlayer = useMemo(() => {
    const result: Record<string, number> = {}
    for (const t of analysis.turns) {
      const current = result[t.playerName] ?? 0
      if (t.scoreDifferential > current) {
        result[t.playerName] = t.scoreDifferential
      }
    }
    return result
  }, [analysis.turns])

  const differentialLabel = isOptimal ? "+0" : `-${differential}`
  const cumulativeLabel = cumulative === 0 ? "0" : `-${cumulative}`

  return (
    <div className="flex flex-col gap-3">
      {/* Per-turn differential */}
      <div className="flex items-center gap-4 text-sm">
        <div>
          <span className="text-gray-500">Differential: </span>
          <span
            data-differential={isOptimal ? "0" : `-${differential}`}
            className={cn("font-semibold", isOptimal ? "text-green-600" : "text-red-600")}
          >
            {differentialLabel}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Cumulative: </span>
          <span
            className={cn("font-semibold", cumulative === 0 ? "text-green-600" : "text-red-600")}
          >
            {cumulativeLabel}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div data-testid="differential-summary" className="rounded border p-3">
        <div className="mb-2 text-sm font-semibold">Overall missed points</div>
        {analysis.playerSummaries.map(summary => (
          <div
            key={summary.playerName}
            data-testid={`player-summary-${summary.playerName}`}
            className="mb-2 text-sm"
          >
            <div className="font-medium">{summary.playerName}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-2 text-gray-600">
              <span>Total missed:</span>
              <span className={cn("font-medium", summary.totalDifferential > 0 && "text-red-600")}>
                {summary.totalDifferential}
              </span>
              <span>Avg per turn:</span>
              <span>{summary.averageDifferential.toFixed(1)}</span>
              <span>Optimal moves:</span>
              <span>{summary.bestMoveCount}</span>
              <span>Worst miss:</span>
              <span>{worstMissByPlayer[summary.playerName] ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = {
  /** The complete game analysis. */
  analysis: GameAnalysis
  /** The index of the currently displayed turn. */
  currentTurnIndex: number
}
