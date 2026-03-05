import { generateMoves } from "../movegen/generateMoves"
import type { BoardState } from "../board/types"
import type { Difficulty } from "./chooseMove"

/** Score thresholds below which swap is recommended, by difficulty. */
const SWAP_THRESHOLDS: Record<Difficulty, number> = {
  easy: 5,
  medium: 8,
  hard: 12,
}

/** Letters considered "bad" for rack quality assessment. */
const BAD_LETTERS = new Set(["Q", "V", "Z", "X", "W"])

/**
 * Heuristic for whether the computer player should swap tiles instead of playing.
 * Considers the best available score and rack letter quality.
 * Returns false if the rack is empty.
 */
export const shouldSwap = (
  /** The current board state */
  board: BoardState,
  /** Array of tile letters in the player's rack */
  rack: string[],
  /** Difficulty level (defaults to 'medium') */
  difficulty?: Difficulty,
): boolean => {
  if (rack.length === 0) return false

  const diff = difficulty ?? "medium"
  const moves = generateMoves(board, rack)

  // No moves available means we should swap (or pass)
  if (moves.length === 0) return true

  const bestScore = moves[0].score
  const threshold = SWAP_THRESHOLDS[diff]

  // If the best score is above threshold, no need to swap
  if (bestScore > threshold) return false

  // Count bad letters in rack
  const badCount = rack.filter(letter => BAD_LETTERS.has(letter.toUpperCase())).length
  const badRatio = badCount / rack.length

  // Swap if rack is mostly bad letters and best score is low
  return badRatio >= 0.4
}
