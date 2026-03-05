import type { BoardState } from "../board/types"

/** Standard Scrabble board size. */
const BOARD_SIZE = 15

/**
 * Get the full word at a position in a given direction.
 * Returns an array of tile positions and letters that form the contiguous word.
 */
export const getWordAt = (
  /** Row of the starting position */
  row: number,
  /** Column of the starting position */
  col: number,
  /** The board state to read from */
  board: BoardState,
  /** If true, find the horizontal word; otherwise vertical */
  horizontal: boolean,
): Array<{ row: number; col: number; tile: string }> => {
  const word: Array<{ row: number; col: number; tile: string }> = []

  // Find the start of the word
  let r = row
  let c = col

  if (horizontal) {
    while (c > 0 && board[r][c - 1] !== null) {
      c--
    }
  } else {
    while (r > 0 && board[r - 1][c] !== null) {
      r--
    }
  }

  // Collect all tiles in the word
  while (r < BOARD_SIZE && c < BOARD_SIZE && board[r][c] !== null) {
    word.push({ row: r, col: c, tile: board[r][c]! })
    if (horizontal) {
      c++
    } else {
      r++
    }
  }

  return word
}
