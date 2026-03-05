import type { BoardState } from "../board/types"

/** Standard Scrabble board size. */
const BOARD_SIZE = 15

/**
 * Compute cross-check sets for every empty square in a given direction.
 * For a horizontal move, cross-checks are computed vertically (and vice versa).
 * Returns a 15x15 grid where each cell is either null (filled square or no constraint)
 * or a Set of uppercase letters that can legally be placed there.
 */
export const getCrossChecks = (
  /** The current board state */
  board: BoardState,
  /** The direction of the move being generated (cross-checks are perpendicular) */
  horizontal: boolean,
  /** Set of all valid words (uppercase) */
  validWords: Set<string>,
): Array<Array<Set<string> | null>> => {
  const checks: Array<Array<Set<string> | null>> = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  )

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) continue

      // Check if there are adjacent tiles in the cross direction
      const { prefix, suffix } = getCrossWordParts(board, row, col, horizontal)

      if (prefix.length === 0 && suffix.length === 0) {
        // No cross constraint - any letter is valid
        checks[row][col] = null
        continue
      }

      // Only letters that form valid cross words are allowed
      const allowed = new Set<string>()
      for (let c = 65; c <= 90; c++) {
        const letter = String.fromCharCode(c)
        const word = prefix + letter + suffix
        if (validWords.has(word)) {
          allowed.add(letter)
        }
      }
      checks[row][col] = allowed
    }
  }

  return checks
}

/**
 * Get the prefix and suffix parts of a potential cross word at a position.
 * For horizontal moves, we look vertically (above and below).
 * For vertical moves, we look horizontally (left and right).
 */
const getCrossWordParts = (
  /** The current board state */
  board: BoardState,
  /** Row of the position */
  row: number,
  /** Column of the position */
  col: number,
  /** Whether the main move direction is horizontal */
  horizontal: boolean,
): { prefix: string; suffix: string } => {
  let prefix = ""
  let suffix = ""

  if (horizontal) {
    // Cross direction is vertical - look above and below
    let r = row - 1
    while (r >= 0 && board[r][col] !== null) {
      prefix = board[r][col]!.toUpperCase() + prefix
      r--
    }
    r = row + 1
    while (r < BOARD_SIZE && board[r][col] !== null) {
      suffix += board[r][col]!.toUpperCase()
      r++
    }
  } else {
    // Cross direction is horizontal - look left and right
    let c = col - 1
    while (c >= 0 && board[row][c] !== null) {
      prefix = board[row][c]!.toUpperCase() + prefix
      c--
    }
    c = col + 1
    while (c < BOARD_SIZE && board[row][c] !== null) {
      suffix += board[row][c]!.toUpperCase()
      c++
    }
  }

  return { prefix, suffix }
}
