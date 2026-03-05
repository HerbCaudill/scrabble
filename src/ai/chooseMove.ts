import { generateMoves } from "../movegen/generateMoves"
import type { ScoredMove } from "../movegen/types"
import type { BoardState } from "../board/types"

/** Difficulty levels for the computer player. */
export type Difficulty = "easy" | "medium" | "hard"

/**
 * Select a move for the computer player from all valid moves.
 * - 'hard': always picks the best move
 * - 'medium': picks randomly from top 5 moves (weighted toward higher scores)
 * - 'easy': picks randomly from top 20 moves (uniform distribution)
 * Returns null if no valid moves exist.
 */
export const chooseMove = (
  /** The current board state */
  board: BoardState,
  /** Array of tile letters in the player's rack */
  rack: string[],
  /** Difficulty level (defaults to 'medium') */
  difficulty?: Difficulty,
  /** Optional random function for testability (defaults to Math.random) */
  random?: () => number,
): ScoredMove | null => {
  const diff = difficulty ?? "medium"
  const rand = random ?? Math.random

  const moves = generateMoves(board, rack)
  if (moves.length === 0) return null

  if (diff === "hard") {
    return moves[0]
  }

  if (diff === "easy") {
    const pool = moves.slice(0, 20)
    const index = Math.floor(rand() * pool.length)
    return pool[index]
  }

  // medium: weighted selection from top 5
  const pool = moves.slice(0, 5)
  return weightedSelect(pool, rand)
}

/**
 * Select a move from the pool, weighted by score so higher-scoring moves are more likely.
 */
const weightedSelect = (
  /** Pool of moves to select from */
  pool: ScoredMove[],
  /** Random number generator */
  random: () => number,
): ScoredMove => {
  const totalScore = pool.reduce((sum, m) => sum + m.score, 0)

  // If all scores are 0, pick uniformly
  if (totalScore === 0) {
    return pool[Math.floor(random() * pool.length)]
  }

  const threshold = random() * totalScore
  let cumulative = 0
  for (const move of pool) {
    cumulative += move.score
    if (cumulative >= threshold) return move
  }

  // Fallback (shouldn't reach here)
  return pool[pool.length - 1]
}
