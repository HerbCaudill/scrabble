import { useMemo, useState } from "react"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { analyzeGame } from "@/analysis/analyzeGame"
import { reconstructBoardAtTurn } from "@/board/reconstructBoardAtTurn"
import { getMovePositions } from "@/board/getMovePositions"
import { buildSquareHighlights } from "@/board/buildSquareHighlights"
import { Board } from "./Board"
import type { GameState } from "@/game/types"
import type { GameAnalysis } from "@/analysis/types"

/** Turn-by-turn replay showing your move vs best available move. */
export const AnalysisView = ({ gameState }: Props) => {
  const analysis: GameAnalysis = useMemo(() => analyzeGame(gameState), [gameState])
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0)

  const totalTurns = analysis.turns.length
  const turn = analysis.turns[currentTurnIndex]

  /** Reconstruct board state up to (but not including) the current turn to show what was on the board before. */
  const boardBeforeMove = useMemo(
    () => reconstructBoardAtTurn(gameState.moveHistory, currentTurnIndex - 1),
    [gameState.moveHistory, currentTurnIndex],
  )

  /** Board state after the current turn's move. */
  const boardAfterMove = useMemo(
    () => reconstructBoardAtTurn(gameState.moveHistory, currentTurnIndex),
    [gameState.moveHistory, currentTurnIndex],
  )

  /** Positions of tiles placed in the current turn, for highlighting. */
  const actualPositions = useMemo(() => {
    const record = gameState.moveHistory[currentTurnIndex]
    if (!record?.move) return []
    return getMovePositions(record.move)
  }, [gameState.moveHistory, currentTurnIndex])

  const bestMove = turn.bestMoves[0] ?? null

  /** Positions of the best available move's tiles. */
  const bestPositions = useMemo(() => {
    if (!bestMove) return []
    return getMovePositions(bestMove)
  }, [bestMove])

  /** Whether the best move differs from what was actually played. */
  const bestDiffersFromActual = bestMove !== null && turn.scoreDifferential > 0

  /** Combined highlight map for actual and best move positions. */
  const squareHighlights = useMemo(() => {
    if (!bestDiffersFromActual) {
      return buildSquareHighlights(actualPositions, [])
    }
    return buildSquareHighlights(actualPositions, bestPositions)
  }, [actualPositions, bestPositions, bestDiffersFromActual])
  const movePlayedWord = turn.movePlayed?.words[0] ?? "Pass"
  const movePlayedScore = turn.movePlayed?.score ?? 0
  const bestMoveWord = bestMove?.words[0] ?? "N/A"
  const bestMoveScore = bestMove?.score ?? 0
  const differential = turn.scoreDifferential

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          aria-label="Previous turn"
          disabled={currentTurnIndex === 0}
          onClick={() => setCurrentTurnIndex(i => i - 1)}
          className={cn(
            "rounded p-1",
            currentTurnIndex === 0 ?
              "cursor-not-allowed text-gray-400"
            : "text-gray-700 hover:bg-gray-200",
          )}
        >
          <IconChevronLeft size={24} />
        </button>

        <span className="text-sm font-medium">
          Turn {currentTurnIndex + 1} of {totalTurns}
        </span>

        <button
          aria-label="Next turn"
          disabled={currentTurnIndex === totalTurns - 1}
          onClick={() => setCurrentTurnIndex(i => i + 1)}
          className={cn(
            "rounded p-1",
            currentTurnIndex === totalTurns - 1 ?
              "cursor-not-allowed text-gray-400"
            : "text-gray-700 hover:bg-gray-200",
          )}
        >
          <IconChevronRight size={24} />
        </button>
      </div>

      {/* Board */}
      <Board board={boardAfterMove} squareHighlights={squareHighlights} />

      {/* Turn details */}
      <div data-testid="turn-display" data-turn={String(turn.turnNumber)}>
        <div className="mb-2 text-lg font-semibold">{turn.playerName}</div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Played:</span>{" "}
            <span className="font-medium">{movePlayedWord}</span>{" "}
            <span className="text-gray-600">({movePlayedScore})</span>
          </div>
          <div>
            <span className="text-gray-500">Best:</span>{" "}
            <span className="font-medium">{bestMoveWord}</span>{" "}
            <span className="text-gray-600">({bestMoveScore})</span>
          </div>
        </div>

        <div
          data-testid="score-differential"
          className={cn(
            "mt-1 text-sm font-semibold",
            differential === 0 ? "text-green-600" : "text-red-600",
          )}
        >
          {differential === 0 ? "0" : `-${differential}`}
        </div>
      </div>

      {/* Summary panel */}
      <div data-testid="summary-panel" className="rounded border p-3">
        <div className="mb-1 text-sm font-semibold">Summary</div>
        {analysis.playerSummaries.map(summary => (
          <div key={summary.playerName} className="flex justify-between text-sm">
            <span>{summary.playerName}</span>
            <span
              className={cn(
                "font-medium",
                summary.totalDifferential === 0 ? "text-green-600" : "text-red-600",
              )}
            >
              -{summary.totalDifferential}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

type Props = {
  /** The completed game state to analyze. */
  gameState: GameState
}
