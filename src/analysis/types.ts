import type { ScoredMove } from "../movegen/types"

/** Analysis of a single turn in the game. */
export type TurnAnalysis = {
  /** The 1-based turn number */
  turnNumber: number
  /** The name of the player who took this turn */
  playerName: string
  /** The move that was actually played, or null for a pass */
  movePlayed: ScoredMove | null
  /** The top N moves available at that board state */
  bestMoves: ScoredMove[]
  /** The score difference between the best available move and the actual move */
  scoreDifferential: number
  /** Running total of score differential for this player */
  cumulativeDifferential: number
}

/** Summary statistics for a single player's performance. */
export type PlayerSummary = {
  /** The player's name */
  playerName: string
  /** Total points left on the table across all turns */
  totalDifferential: number
  /** Average points left on the table per turn */
  averageDifferential: number
  /** Number of times the player played the highest-scoring available move */
  bestMoveCount: number
  /** Number of turns where the differential exceeded the threshold */
  worstMissCount: number
}

/** Complete analysis of a finished game. */
export type GameAnalysis = {
  /** Per-turn analysis for every turn in the game */
  turns: TurnAnalysis[]
  /** Aggregate statistics per player */
  playerSummaries: PlayerSummary[]
}
