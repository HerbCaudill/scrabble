import { getSquareType } from "../board/getSquareType"
import { getTileValue } from "../board/getTileValue"
import type { BoardState, Move, SquareType } from "../board/types"
import { getWordAt } from "./getWordAt"

/** Bonus points for using all 7 tiles in a single move. */
export const BINGO_BONUS = 50

/**
 * Calculate the total score for a move, including premium squares and bingo bonus.
 */
export const calculateMoveScore = (
  /** The board state before the move */
  board: BoardState,
  /** The tiles being placed */
  move: Move,
): number => {
  if (move.length === 0) return 0

  // Create a set of newly placed positions for quick lookup
  const newTilePositions = new Set(move.map(t => `${t.row},${t.col}`))

  // Create a temporary board with the new tiles placed
  const tempBoard: BoardState = board.map(row => [...row])
  for (const { row, col, tile } of move) {
    tempBoard[row][col] = tile
  }

  // Determine if the move is horizontal or vertical
  const isHorizontal = new Set(move.map(t => t.row)).size === 1

  let totalScore = 0

  // Score the main word
  totalScore += scoreMainWord(move, tempBoard, newTilePositions, isHorizontal)

  // Score any cross words
  totalScore += scoreCrossWords(move, tempBoard, newTilePositions, isHorizontal)

  // Add bingo bonus if all 7 tiles were used
  if (move.length === 7) {
    totalScore += BINGO_BONUS
  }

  return totalScore
}

/** Score the main word formed by the move. */
const scoreMainWord = (
  /** The tiles being placed */
  move: Move,
  /** The board with new tiles placed */
  board: BoardState,
  /** Set of "row,col" strings for newly placed tiles */
  newTilePositions: Set<string>,
  /** Whether the move is horizontal */
  isHorizontal: boolean,
): number => {
  if (move.length === 0) return 0

  // For a single tile, find which direction forms the main word
  if (move.length === 1) {
    const { row, col } = move[0]
    const hWord = getWordAt(row, col, board, true)
    const vWord = getWordAt(row, col, board, false)

    if (hWord.length > 1 && vWord.length <= 1) {
      return scoreWord(hWord, newTilePositions)
    } else if (vWord.length > 1 && hWord.length <= 1) {
      return scoreWord(vWord, newTilePositions)
    } else if (hWord.length > 1 && vWord.length > 1) {
      // Both form words - score horizontal as main, vertical will be cross word
      return scoreWord(hWord, newTilePositions)
    }
    return 0
  }

  // Multiple tiles - get the full extent of the word
  const firstTile = move[0]
  const word = getWordAt(firstTile.row, firstTile.col, board, isHorizontal)
  return scoreWord(word, newTilePositions)
}

/** Score all cross words formed perpendicular to the main word. */
const scoreCrossWords = (
  /** The tiles being placed */
  move: Move,
  /** The board with new tiles placed */
  board: BoardState,
  /** Set of "row,col" strings for newly placed tiles */
  newTilePositions: Set<string>,
  /** Whether the move is horizontal */
  isHorizontal: boolean,
): number => {
  let score = 0

  // For single tile, if horizontal was scored as main, check vertical as cross
  if (move.length === 1) {
    const { row, col } = move[0]
    const hWord = getWordAt(row, col, board, true)
    const vWord = getWordAt(row, col, board, false)

    if (hWord.length > 1 && vWord.length > 1) {
      score += scoreWord(vWord, newTilePositions)
    }
    return score
  }

  // For each newly placed tile, check for a perpendicular word
  for (const { row, col } of move) {
    const crossWord = getWordAt(row, col, board, !isHorizontal)
    if (crossWord.length > 1) {
      score += scoreWord(crossWord, newTilePositions)
    }
  }

  return score
}

/** Calculate the score for a single word, applying multipliers for newly placed tiles. */
const scoreWord = (
  /** The tiles making up the word */
  word: Array<{ row: number; col: number; tile: string }>,
  /** Set of "row,col" strings for newly placed tiles */
  newTilePositions: Set<string>,
): number => {
  let wordScore = 0
  let wordMultiplier = 1

  for (const { row, col, tile } of word) {
    const tileValue = getTileValue(tile)
    const isNewTile = newTilePositions.has(`${row},${col}`)

    if (isNewTile) {
      const squareType = getSquareType(row, col)
      const { letterMultiplier, wordMult } = getMultipliers(squareType)
      wordScore += tileValue * letterMultiplier
      wordMultiplier *= wordMult
    } else {
      wordScore += tileValue
    }
  }

  return wordScore * wordMultiplier
}

/** Get the letter and word multipliers for a square type. */
const getMultipliers = (
  /** The type of premium square */
  squareType: SquareType,
): { letterMultiplier: number; wordMult: number } => {
  switch (squareType) {
    case "DL":
      return { letterMultiplier: 2, wordMult: 1 }
    case "TL":
      return { letterMultiplier: 3, wordMult: 1 }
    case "DW":
    case "ST":
      return { letterMultiplier: 1, wordMult: 2 }
    case "TW":
      return { letterMultiplier: 1, wordMult: 3 }
    default:
      return { letterMultiplier: 1, wordMult: 1 }
  }
}
