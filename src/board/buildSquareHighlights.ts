import type { HighlightType, Position } from "./types"

/**
 * Build a map of "row-col" -> HighlightType from actual and best move positions.
 * Squares in both lists get type "both"; otherwise "actual" or "best".
 */
export const buildSquareHighlights = (
  /** Positions of the tiles placed in the actual move. */
  actualPositions: Position[],
  /** Positions of the tiles in the best available move. */
  bestPositions: Position[],
): Map<string, HighlightType> => {
  const result = new Map<string, HighlightType>()

  const actualKeys = new Set(actualPositions.map(({ row, col }) => `${row}-${col}`))
  const bestKeys = new Set(bestPositions.map(({ row, col }) => `${row}-${col}`))

  for (const key of actualKeys) {
    result.set(key, bestKeys.has(key) ? "both" : "actual")
  }

  for (const key of bestKeys) {
    if (!result.has(key)) {
      result.set(key, "best")
    }
  }

  return result
}
