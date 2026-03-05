import { isBlankTile } from "../board/isBlankTile"
import type { BoardState, Move } from "../board/types"
import { getWordAt } from "./getWordAt"

/**
 * Extract all words formed by a move.
 * Returns an array of word strings (main word first, then cross words).
 * Blank tiles show as underscore (unassigned) or their assigned letter (lowercase tiles).
 */
export const getWordsFromMove = (
  /** The board state before the move */
  board: BoardState,
  /** The tiles being placed */
  move: Move,
): string[] => {
  if (move.length === 0) return []

  // Create temp board with new tiles
  const tempBoard = board.map(r => [...r])
  for (const { row, col, tile } of move) {
    tempBoard[row][col] = tile
  }

  const words: string[] = []
  const isHorizontal = new Set(move.map(t => t.row)).size === 1

  // Get main word
  const firstTile = move[0]

  if (move.length === 1) {
    // Single tile: check both directions
    const hWord = getWordAt(firstTile.row, firstTile.col, tempBoard, true)
    const vWord = getWordAt(firstTile.row, firstTile.col, tempBoard, false)

    if (hWord.length > 1) words.push(wordToString(hWord))
    if (vWord.length > 1) words.push(wordToString(vWord))
    return words
  }

  // Multiple tiles: main word in the direction of placement
  const mainWord = getWordAt(firstTile.row, firstTile.col, tempBoard, isHorizontal)
  if (mainWord.length > 1) {
    words.push(wordToString(mainWord))
  }

  // Get cross words for each placed tile
  for (const { row, col } of move) {
    const crossWord = getWordAt(row, col, tempBoard, !isHorizontal)
    if (crossWord.length > 1) {
      words.push(wordToString(crossWord))
    }
  }

  return words
}

/** Convert word tiles to a display string. */
const wordToString = (
  /** Array of tile positions and letters */
  word: Array<{ row: number; col: number; tile: string }>,
): string => {
  return word
    .map(t => {
      if (t.tile === " ") return "_" // Unassigned blank
      if (isBlankTile(t.tile)) return t.tile.toUpperCase() // Assigned blank (lowercase)
      return t.tile.toUpperCase() // Regular tile
    })
    .join("")
}
