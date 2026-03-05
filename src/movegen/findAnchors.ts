import type { BoardState, Position } from "../board/types"

/** Standard Scrabble board size. */
const BOARD_SIZE = 15

/**
 * Find all anchor squares on the board.
 * An anchor is an empty square adjacent to at least one filled square.
 * On an empty board, only the center square (7,7) is an anchor.
 */
export const findAnchors = (
  /** The current board state */
  board: BoardState,
): Position[] => {
  const hasAnyTile = board.some(row => row.some(cell => cell !== null))

  if (!hasAnyTile) {
    return [{ row: 7, col: 7 }]
  }

  const anchors: Position[] = []
  const seen = new Set<string>()

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] !== null) continue

      const adjacent = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]

      const isAnchor = adjacent.some(
        ([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] !== null,
      )

      if (isAnchor) {
        const key = `${row},${col}`
        if (!seen.has(key)) {
          seen.add(key)
          anchors.push({ row, col })
        }
      }
    }
  }

  return anchors
}
