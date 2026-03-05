import type { Move, Position } from "./types"

/** Extract positions (row, col) from a Move, stripping tile information. */
export const getMovePositions = (move: Move): Position[] => {
  return move.map(({ row, col }) => ({ row, col }))
}
