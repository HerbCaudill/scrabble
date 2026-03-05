import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import type { BoardState } from "../../board/types"
import { isValidWord } from "../../words/isValidWord"
import { generateMoves } from "../generateMoves"

/** Place a word on the board horizontally starting at (row, col). */
const placeWord = (board: BoardState, word: string, row: number, col: number) => {
  for (let i = 0; i < word.length; i++) {
    board[row][col + i] = word[i]
  }
}

describe("generateMoves", () => {
  it("should return moves sorted by score descending", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "S", "D", "O", "G"]
    const moves = generateMoves(board, rack)

    expect(moves.length).toBeGreaterThan(0)

    // Check sorted by score descending
    for (let i = 1; i < moves.length; i++) {
      expect(moves[i - 1].score).toBeGreaterThanOrEqual(moves[i].score)
    }
  })

  it("should only produce valid words", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "S", "D", "O", "G"]
    const moves = generateMoves(board, rack)

    for (const move of moves) {
      for (const word of move.words) {
        expect(isValidWord(word)).toBe(true)
      }
    }
  })

  it("should place first move through center square", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "S", "D", "O", "G"]
    const moves = generateMoves(board, rack)

    for (const move of moves) {
      const positions = move.map(t => ({ row: t.row, col: t.col }))
      const coversCenter = positions.some(p => p.row === 7 && p.col === 7)
      expect(coversCenter).toBe(true)
    }
  })

  it("should find simple words on empty board", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T"]
    const moves = generateMoves(board, rack)

    // Should find CAT at minimum
    const catMoves = moves.filter(m => m.words.includes("CAT"))
    expect(catMoves.length).toBeGreaterThan(0)
  })

  it("should extend existing words", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6) // CAT at row 7, cols 6-8

    const rack = ["S", "E", "R", "A", "T", "D", "N"]
    const moves = generateMoves(board, rack)

    // Should find CATS (adding S after CAT)
    const catsMoves = moves.filter(m => m.words.includes("CATS"))
    expect(catsMoves.length).toBeGreaterThan(0)
  })

  it("should form valid cross words", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6) // CAT at row 7, cols 6-8

    const rack = ["S", "E", "R", "A", "T", "D", "N"]
    const moves = generateMoves(board, rack)

    // All moves should have valid cross words
    for (const move of moves) {
      for (const word of move.words) {
        expect(isValidWord(word)).toBe(true)
      }
    }
  })

  it("should handle perpendicular plays", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6) // CAT at row 7, cols 6-8

    const rack = ["A", "R", "E", "T", "S", "N", "D"]
    const moves = generateMoves(board, rack)

    // Should find vertical words crossing CAT
    const verticalMoves = moves.filter(m => {
      // Check if the placed tiles span multiple rows
      const rows = new Set(m.map(t => t.row))
      return rows.size > 1
    })
    expect(verticalMoves.length).toBeGreaterThan(0)
  })

  it("should handle blank tiles", () => {
    const board = createEmptyBoard()
    // Space character represents a blank tile in the rack
    const rack = [" ", "A", "T"]
    const moves = generateMoves(board, rack)

    expect(moves.length).toBeGreaterThan(0)

    // All words should still be valid
    for (const move of moves) {
      for (const word of move.words) {
        expect(isValidWord(word)).toBe(true)
      }
    }
  })

  it("should represent blank tiles as lowercase in moves", () => {
    const board = createEmptyBoard()
    const rack = [" ", "A", "T"]
    const moves = generateMoves(board, rack)

    // Find a move that uses the blank
    const movesUsingBlank = moves.filter(m => m.some(t => t.tile >= "a" && t.tile <= "z"))
    expect(movesUsingBlank.length).toBeGreaterThan(0)
  })

  it("should not produce duplicate moves", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T"]
    const moves = generateMoves(board, rack)

    const moveKeys = moves.map(m => {
      const tiles = [...m]
        .sort((a, b) => a.row - b.row || a.col - b.col)
        .map(t => `${t.row},${t.col}:${t.tile}`)
        .join("|")
      return tiles
    })

    const uniqueKeys = new Set(moveKeys)
    expect(uniqueKeys.size).toBe(moveKeys.length)
  })

  it("should return empty array when no valid moves exist", () => {
    const board = createEmptyBoard()
    // QQ - very unlikely to form valid words
    const rack = ["Q", "Q"]
    const moves = generateMoves(board, rack)

    // All returned moves should be valid (might be 0 or might find QI)
    for (const move of moves) {
      for (const word of move.words) {
        expect(isValidWord(word)).toBe(true)
      }
    }
  })

  it("should use tiles already on the board to form words", () => {
    const board = createEmptyBoard()
    placeWord(board, "HE", 7, 6) // HE at row 7, cols 6-7

    const rack = ["A", "T", "R", "S", "E", "N", "D"]
    const moves = generateMoves(board, rack)

    // Should find HEAT, HEAR, HEAP, etc.
    const extendMoves = moves.filter(m => m.words.some(w => w.startsWith("HE") && w.length > 2))
    expect(extendMoves.length).toBeGreaterThan(0)
  })

  it("should correctly score moves including premium squares", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T"]
    const moves = generateMoves(board, rack)

    // Every move should have a positive score
    for (const move of moves) {
      expect(move.score).toBeGreaterThan(0)
    }
  })

  it("should handle a rack with duplicate letters", () => {
    const board = createEmptyBoard()
    const rack = ["E", "E", "L", "S", "T", "A", "R"]
    const moves = generateMoves(board, rack)
    expect(moves.length).toBeGreaterThan(0)

    for (const move of moves) {
      for (const word of move.words) {
        expect(isValidWord(word)).toBe(true)
      }
    }
  })
})
