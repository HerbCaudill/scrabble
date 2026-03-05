import type { BoardState, Move } from "../board/types"
import { getWordsFromMove } from "../scoring/getWordsFromMove"
import { calculateMoveScore } from "../scoring/calculateMoveScore"
import { isValidWord } from "../words/isValidWord"

/** Result of validating a move. */
export type ValidationResult = {
  /** Whether the move is valid */
  valid: boolean
  /** Error messages (empty if valid) */
  errors: string[]
  /** Words formed by the move */
  words: string[]
  /** Total score for the move (0 if invalid) */
  score: number
}

/**
 * Validate a move, checking that tiles are in a line, have no gaps,
 * connect to existing tiles (or cover center on first move), and
 * that all formed words are valid dictionary words.
 */
export const validateMove = (
  /** The board state before the move */
  board: BoardState,
  /** The tiles being placed */
  move: Move,
  /** Whether this is the first move of the game */
  isFirstMove: boolean = false,
): ValidationResult => {
  const invalid = (errors: string[]): ValidationResult => ({
    valid: false,
    errors,
    words: [],
    score: 0,
  })

  const errors: string[] = []

  // 1. At least one tile placed
  if (move.length === 0) {
    return invalid(["Must place at least one tile"])
  }

  // 2. All tiles in same row or column
  const rows = new Set(move.map(t => t.row))
  const cols = new Set(move.map(t => t.col))
  const isHorizontal = rows.size === 1
  const isVertical = cols.size === 1

  if (!isHorizontal && !isVertical) {
    errors.push("Tiles must be in a single row or column")
  }

  // 3. No gaps (only checkable if tiles are in a line)
  if (isHorizontal || isVertical) {
    if (hasGaps(board, move, isHorizontal)) {
      errors.push("Tiles must form a continuous line with no gaps")
    }
  }

  // 4. First move must cover center square (7,7)
  if (isFirstMove) {
    const coversCenter = move.some(t => t.row === 7 && t.col === 7)
    if (!coversCenter) {
      errors.push("First move must cover the center square")
    }
  }

  // 5. Subsequent moves must connect to existing tiles
  if (!isFirstMove) {
    if (!connectsToExisting(board, move)) {
      errors.push("Move must connect to existing tiles on the board")
    }
  }

  // If there are structural errors, return early before word validation
  if (errors.length > 0) {
    return invalid(errors)
  }

  // 6. All formed words must be valid dictionary words
  const words = getWordsFromMove(board, move)

  for (const word of words) {
    if (!isValidWord(word)) {
      errors.push(`"${word}" is not a valid word`)
    }
  }

  if (errors.length > 0) {
    return invalid(errors)
  }

  const score = calculateMoveScore(board, move)
  return { valid: true, errors: [], words, score }
}

/**
 * Check whether the placed tiles have gaps (empty squares between them
 * that are not filled by existing board tiles).
 */
const hasGaps = (
  /** The board state before the move */
  board: BoardState,
  /** The tiles being placed */
  move: Move,
  /** Whether the move is horizontal */
  isHorizontal: boolean,
): boolean => {
  const tempBoard = board.map(r => [...r])
  for (const { row, col, tile } of move) {
    tempBoard[row][col] = tile
  }

  if (isHorizontal) {
    const row = move[0].row
    const minCol = Math.min(...move.map(t => t.col))
    const maxCol = Math.max(...move.map(t => t.col))
    for (let c = minCol; c <= maxCol; c++) {
      if (tempBoard[row][c] === null) return true
    }
  } else {
    const col = move[0].col
    const minRow = Math.min(...move.map(t => t.row))
    const maxRow = Math.max(...move.map(t => t.row))
    for (let r = minRow; r <= maxRow; r++) {
      if (tempBoard[r][col] === null) return true
    }
  }

  return false
}

/**
 * Check whether any placed tile is orthogonally adjacent to an existing
 * tile on the board.
 */
const connectsToExisting = (
  /** The board state before the move */
  board: BoardState,
  /** The tiles being placed */
  move: Move,
): boolean => {
  const boardSize = board.length
  return move.some(({ row, col }) => {
    const adjacent = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ]
    return adjacent.some(([r, c]) => {
      if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) return false
      return board[r][c] !== null
    })
  })
}
