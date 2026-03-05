import { boardLayout } from "./boardLayout"
import type { SquareType } from "./types"

/** Return the premium square type at the given board position. */
export const getSquareType = (
  /** Row index (0-14) */
  row: number,
  /** Column index (0-14) */
  col: number,
): SquareType => {
  return boardLayout[row][col]
}
