import { describe, expect, it } from "vitest"
import { getWordsFromMove } from "../getWordsFromMove"
import type { BoardState, Move } from "../../board/types"
import { createEmptyBoard } from "../../board/createEmptyBoard"

describe("getWordsFromMove", () => {
  it("returns empty array for empty move", () => {
    const board = createEmptyBoard()
    const move: Move = []
    expect(getWordsFromMove(board, move)).toEqual([])
  })

  it("returns the main word for a simple horizontal move", () => {
    const board = createEmptyBoard()
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    expect(getWordsFromMove(board, move)).toEqual(["CAT"])
  })

  it("returns the main word for a simple vertical move", () => {
    const board = createEmptyBoard()
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 8, col: 7, tile: "A" },
      { row: 9, col: 7, tile: "T" },
    ]
    expect(getWordsFromMove(board, move)).toEqual(["CAT"])
  })

  it("returns the extended word when adding to an existing word", () => {
    const board = parseBoard(`
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . C A T . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
    `)
    const move: Move = [{ row: 7, col: 10, tile: "S" }]
    expect(getWordsFromMove(board, move)).toEqual(["CATS"])
  })

  it("returns main word and cross words", () => {
    const board = parseBoard(`
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . C A T . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
    `)
    // Place B above A and E below A
    const move: Move = [
      { row: 6, col: 8, tile: "B" },
      { row: 8, col: 8, tile: "E" },
    ]
    // Main vertical word: BAE
    expect(getWordsFromMove(board, move)).toEqual(["BAE"])
  })

  it("returns both words for a single tile forming two words", () => {
    const board = parseBoard(`
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . A . . . . . .
      . . . . . . . C . T . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
      . . . . . . . . . . . . . . .
    `)
    // Place A at (7,8) to form "CAT" horizontally and "AA" vertically
    const move: Move = [{ row: 7, col: 8, tile: "A" }]
    const words = getWordsFromMove(board, move)
    expect(words).toContain("CAT")
    expect(words).toContain("AA")
    expect(words).toHaveLength(2)
  })

  it("handles blank tiles (space) as underscores", () => {
    const board = createEmptyBoard()
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: " " }, // blank
      { row: 7, col: 9, tile: "T" },
    ]
    expect(getWordsFromMove(board, move)).toEqual(["C_T"])
  })

  it("handles blank tiles (lowercase) showing the assigned letter", () => {
    const board = createEmptyBoard()
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "a" }, // blank representing A
      { row: 7, col: 9, tile: "T" },
    ]
    expect(getWordsFromMove(board, move)).toEqual(["CAT"])
  })
})

// HELPERS

/** Parse a board string into a BoardState. */
const parseBoard = (boardStr: string): BoardState => {
  const board: BoardState = Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => null))
  const lines = boardStr.trim().split("\n")
  for (let row = 0; row < lines.length; row++) {
    const cells = lines[row].trim().split(/\s+/)
    for (let col = 0; col < cells.length; col++) {
      const cell = cells[col]
      if (/^[A-Za-z]$/.test(cell)) {
        board[row][col] = cell
      }
    }
  }
  return board
}
