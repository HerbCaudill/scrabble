import type { Move } from "../board/types"

/** A valid move with its score and the words it forms. */
export type ScoredMove = Move & {
  /** Total score for this move */
  score: number
  /** Words formed by this move (main word first, then cross words) */
  words: string[]
}
