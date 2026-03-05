import type { BoardState } from "../board/types"
import { generateMoves } from "../movegen/generateMoves"
import type { ScoredMove } from "../movegen/types"
import type { TurnAnalysis } from "./types"

/** Default number of top moves to return. */
const DEFAULT_TOP_N = 5

/**
 * Analyze a single turn by generating the best available moves and comparing
 * with the move that was actually played.
 */
export const analyzeTurn = (
  /** The board state before this turn */
  board: BoardState,
  /** The player's rack as an array of letter strings */
  rack: string[],
  /** The move the player actually made, or null for a pass */
  movePlayed: ScoredMove | null,
  /** The 1-based turn number */
  turnNumber: number,
  /** The name of the player who took this turn */
  playerName: string,
  /** How many top moves to include in the analysis */
  topN: number = DEFAULT_TOP_N,
  /** Running cumulative differential for this player entering this turn */
  cumulativeBefore: number = 0,
): TurnAnalysis => {
  const allMoves = generateMoves(board, rack)
  const bestMoves = allMoves.slice(0, topN)

  const bestScore = bestMoves.length > 0 ? bestMoves[0].score : 0
  const actualScore = movePlayed?.score ?? 0
  const scoreDifferential = bestScore - actualScore

  return {
    turnNumber,
    playerName,
    movePlayed,
    bestMoves,
    scoreDifferential,
    cumulativeDifferential: cumulativeBefore + scoreDifferential,
  }
}
