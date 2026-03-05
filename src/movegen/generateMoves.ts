import { calculateMoveScore } from "../scoring/calculateMoveScore"
import { getWordsFromMove } from "../scoring/getWordsFromMove"
import { isValidWord } from "../words/isValidWord"
import { validWords } from "../words/validWords"
import type { BoardState, Move } from "../board/types"
import { buildPrefixSet } from "./buildPrefixSet"
import { findAnchors } from "./findAnchors"
import { getCrossChecks } from "./getCrossChecks"
import type { ScoredMove } from "./types"

/** Standard Scrabble board size. */
const BOARD_SIZE = 15

/** Cached prefix set, built lazily. */
let cachedPrefixSet: Set<string> | null = null

/** Get or build the prefix set from valid words. */
const getPrefixSet = (): Set<string> => {
  if (!cachedPrefixSet) {
    cachedPrefixSet = buildPrefixSet(validWords)
  }
  return cachedPrefixSet
}

/**
 * Generate all valid moves for the given rack on the given board.
 * Returns moves scored and sorted by score descending.
 * Uses anchor-based approach: for each anchor and direction,
 * generate valid left-parts then extend right.
 */
export const generateMoves = (
  /** The current board state */
  board: BoardState,
  /** Array of tile letters in the player's rack. Blanks are ' ' (space). */
  rack: string[],
): ScoredMove[] => {
  const prefixSet = getPrefixSet()
  const anchors = findAnchors(board)
  const foundMoves: Map<string, ScoredMove> = new Map()

  for (const horizontal of [true, false]) {
    const crossChecks = getCrossChecks(board, horizontal, validWords)

    for (const anchor of anchors) {
      const leftLimit = computeLeftLimit(board, anchor.row, anchor.col, horizontal, anchors)

      generateMovesFromAnchor(
        board,
        rack,
        anchor.row,
        anchor.col,
        horizontal,
        leftLimit,
        crossChecks,
        prefixSet,
        foundMoves,
      )
    }
  }

  return [...foundMoves.values()].sort((a, b) => b.score - a.score)
}

/**
 * Compute how far left (or up) we can extend from an anchor.
 * We stop at another anchor, a filled square, or the board edge.
 */
const computeLeftLimit = (
  /** The current board state */
  board: BoardState,
  /** Anchor row */
  row: number,
  /** Anchor column */
  col: number,
  /** Whether generating horizontal moves */
  horizontal: boolean,
  /** All anchor positions */
  anchors: Array<{ row: number; col: number }>,
): number => {
  const anchorSet = new Set(anchors.map(a => `${a.row},${a.col}`))
  let limit = 0
  let r = row
  let c = col

  if (horizontal) {
    c--
    while (c >= 0 && board[r][c] === null && !anchorSet.has(`${r},${c}`)) {
      limit++
      c--
    }
  } else {
    r--
    while (r >= 0 && board[r][c] === null && !anchorSet.has(`${r},${c}`)) {
      limit++
      r--
    }
  }

  return limit
}

/**
 * Generate all valid moves from a single anchor in a single direction.
 * First generates left-parts (up to leftLimit tiles), then extends right.
 */
const generateMovesFromAnchor = (
  /** The current board state */
  board: BoardState,
  /** The player's rack */
  rack: string[],
  /** Anchor row */
  anchorRow: number,
  /** Anchor column */
  anchorCol: number,
  /** Whether generating horizontal moves */
  horizontal: boolean,
  /** Max tiles we can place to the left of the anchor */
  leftLimit: number,
  /** Cross-check sets for each square */
  crossChecks: Array<Array<Set<string> | null>>,
  /** Set of valid prefixes */
  prefixSet: Set<string>,
  /** Map to collect found moves (deduplication by key) */
  foundMoves: Map<string, ScoredMove>,
): void => {
  const existingPrefix = getExistingPrefix(board, anchorRow, anchorCol, horizontal)

  if (existingPrefix.length > 0) {
    extendRight(
      board,
      rack,
      existingPrefix.tiles,
      existingPrefix.word,
      anchorRow,
      anchorCol,
      horizontal,
      crossChecks,
      prefixSet,
      foundMoves,
      false,
    )
  } else {
    generateLeftParts(
      board,
      rack,
      [],
      "",
      anchorRow,
      anchorCol,
      horizontal,
      leftLimit,
      crossChecks,
      prefixSet,
      foundMoves,
    )
  }
}

/**
 * Get tiles already on the board to the left of (or above) the anchor.
 */
const getExistingPrefix = (
  /** The current board state */
  board: BoardState,
  /** Anchor row */
  row: number,
  /** Anchor column */
  col: number,
  /** Whether generating horizontal moves */
  horizontal: boolean,
): { word: string; tiles: Array<{ row: number; col: number; tile: string }> } => {
  const tiles: Array<{ row: number; col: number; tile: string }> = []
  let word = ""
  let r = row
  let c = col

  if (horizontal) {
    c--
    while (c >= 0 && board[r][c] !== null) {
      tiles.unshift({ row: r, col: c, tile: board[r][c]! })
      word = board[r][c]!.toUpperCase() + word
      c--
    }
  } else {
    r--
    while (r >= 0 && board[r][c] !== null) {
      tiles.unshift({ row: r, col: c, tile: board[r][c]! })
      word = board[r][c]!.toUpperCase() + word
      r--
    }
  }

  return { word, tiles }
}

/**
 * Recursively generate left-parts of up to `limit` tiles from the rack,
 * then extend each right from the anchor.
 */
const generateLeftParts = (
  /** The current board state */
  board: BoardState,
  /** Remaining rack tiles */
  rack: string[],
  /** Tiles placed so far (left of anchor) */
  placedTiles: Array<{ row: number; col: number; tile: string }>,
  /** Word formed so far */
  word: string,
  /** Anchor row */
  anchorRow: number,
  /** Anchor column */
  anchorCol: number,
  /** Whether generating horizontal moves */
  horizontal: boolean,
  /** How many more tiles we can place to the left */
  limit: number,
  /** Cross-check sets */
  crossChecks: Array<Array<Set<string> | null>>,
  /** Set of valid prefixes */
  prefixSet: Set<string>,
  /** Map to collect found moves */
  foundMoves: Map<string, ScoredMove>,
): void => {
  // Try extending right from the current left-part (anchor not yet reached)
  extendRight(
    board,
    rack,
    placedTiles,
    word,
    anchorRow,
    anchorCol,
    horizontal,
    crossChecks,
    prefixSet,
    foundMoves,
    false,
  )

  if (limit === 0) return

  const leftOffset = placedTiles.length + 1
  const nextRow = horizontal ? anchorRow : anchorRow - leftOffset
  const nextCol = horizontal ? anchorCol - leftOffset : anchorCol

  if (nextRow < 0 || nextCol < 0) return

  const crossCheck = crossChecks[nextRow][nextCol]

  const tried = new Set<string>()
  for (let i = 0; i < rack.length; i++) {
    const tile = rack[i]
    if (tried.has(tile)) continue
    tried.add(tile)

    if (tile === " ") {
      for (let c = 65; c <= 90; c++) {
        const letter = String.fromCharCode(c)
        if (crossCheck !== null && !crossCheck.has(letter)) continue

        const newWord = letter + word
        if (!prefixSet.has(newWord)) continue

        const newRack = [...rack.slice(0, i), ...rack.slice(i + 1)]
        const newTile = { row: nextRow, col: nextCol, tile: letter.toLowerCase() }
        const newPlaced = [newTile, ...placedTiles]

        generateLeftParts(
          board,
          newRack,
          newPlaced,
          newWord,
          anchorRow,
          anchorCol,
          horizontal,
          limit - 1,
          crossChecks,
          prefixSet,
          foundMoves,
        )
      }
    } else {
      const letter = tile.toUpperCase()
      if (crossCheck !== null && !crossCheck.has(letter)) continue

      const newWord = letter + word
      if (!prefixSet.has(newWord)) continue

      const newRack = [...rack.slice(0, i), ...rack.slice(i + 1)]
      const newTile = { row: nextRow, col: nextCol, tile }
      const newPlaced = [newTile, ...placedTiles]

      generateLeftParts(
        board,
        newRack,
        newPlaced,
        newWord,
        anchorRow,
        anchorCol,
        horizontal,
        limit - 1,
        crossChecks,
        prefixSet,
        foundMoves,
      )
    }
  }
}

/**
 * Extend the current partial word to the right (or down) from the given position,
 * placing tiles from the rack and using existing board tiles.
 */
const extendRight = (
  /** The current board state */
  board: BoardState,
  /** Remaining rack tiles */
  rack: string[],
  /** Tiles placed so far */
  placedTiles: Array<{ row: number; col: number; tile: string }>,
  /** Word formed so far */
  word: string,
  /** Current row position */
  row: number,
  /** Current column position */
  col: number,
  /** Whether generating horizontal moves */
  horizontal: boolean,
  /** Cross-check sets */
  crossChecks: Array<Array<Set<string> | null>>,
  /** Set of valid prefixes */
  prefixSet: Set<string>,
  /** Map to collect found moves */
  foundMoves: Map<string, ScoredMove>,
  /** Whether we have placed or passed through a tile at or beyond the anchor */
  passedAnchor: boolean,
): void => {
  if (row >= BOARD_SIZE || col >= BOARD_SIZE) {
    if (passedAnchor) {
      recordMoveIfValid(board, placedTiles, word, foundMoves)
    }
    return
  }

  const existingTile = board[row][col]

  if (existingTile !== null) {
    const letter = existingTile.toUpperCase()
    const newWord = word + letter
    if (!prefixSet.has(newWord)) return

    const nextRow = horizontal ? row : row + 1
    const nextCol = horizontal ? col + 1 : col

    extendRight(
      board,
      rack,
      placedTiles,
      newWord,
      nextRow,
      nextCol,
      horizontal,
      crossChecks,
      prefixSet,
      foundMoves,
      true,
    )
  } else {
    // Empty square - check if current word is complete
    if (passedAnchor && word.length > 0 && placedTiles.length > 0) {
      recordMoveIfValid(board, placedTiles, word, foundMoves)
    }

    if (rack.length === 0) return

    const crossCheck = crossChecks[row][col]
    const tried = new Set<string>()

    for (let i = 0; i < rack.length; i++) {
      const tile = rack[i]
      if (tried.has(tile)) continue
      tried.add(tile)

      if (tile === " ") {
        for (let c = 65; c <= 90; c++) {
          const letter = String.fromCharCode(c)
          if (crossCheck !== null && !crossCheck.has(letter)) continue

          const newWord = word + letter
          if (!prefixSet.has(newWord)) continue

          const newRack = [...rack.slice(0, i), ...rack.slice(i + 1)]
          const newTile = { row, col, tile: letter.toLowerCase() }
          const newPlaced = [...placedTiles, newTile]
          const nextRow = horizontal ? row : row + 1
          const nextCol = horizontal ? col + 1 : col

          extendRight(
            board,
            newRack,
            newPlaced,
            newWord,
            nextRow,
            nextCol,
            horizontal,
            crossChecks,
            prefixSet,
            foundMoves,
            true,
          )
        }
      } else {
        const letter = tile.toUpperCase()
        if (crossCheck !== null && !crossCheck.has(letter)) continue

        const newWord = word + letter
        if (!prefixSet.has(newWord)) continue

        const newRack = [...rack.slice(0, i), ...rack.slice(i + 1)]
        const newTile = { row, col, tile }
        const newPlaced = [...placedTiles, newTile]
        const nextRow = horizontal ? row : row + 1
        const nextCol = horizontal ? col + 1 : col

        extendRight(
          board,
          newRack,
          newPlaced,
          newWord,
          nextRow,
          nextCol,
          horizontal,
          crossChecks,
          prefixSet,
          foundMoves,
          true,
        )
      }
    }
  }
}

/**
 * Record a move if the word is valid and at least one tile was placed from the rack.
 */
const recordMoveIfValid = (
  /** The current board state */
  board: BoardState,
  /** Tiles placed from the rack */
  placedTiles: Array<{ row: number; col: number; tile: string }>,
  /** The word formed */
  word: string,
  /** Map to collect found moves */
  foundMoves: Map<string, ScoredMove>,
): void => {
  if (placedTiles.length === 0) return
  if (word.length < 2) return
  if (!isValidWord(word)) return

  // Create the Move (only the newly placed tiles)
  const move: Move = placedTiles.map(t => ({ row: t.row, col: t.col, tile: t.tile }))

  // Verify all cross words are valid
  const words = getWordsFromMove(board, move)
  for (const w of words) {
    if (!isValidWord(w)) return
  }

  // Deduplicate by position+tile key
  const key = [...move]
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map(t => `${t.row},${t.col}:${t.tile}`)
    .join("|")

  if (foundMoves.has(key)) return

  const score = calculateMoveScore(board, move)
  const scoredMove = Object.assign([...move], { score, words }) as ScoredMove

  foundMoves.set(key, scoredMove)
}
