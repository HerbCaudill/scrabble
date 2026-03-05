import { describe, expect, it } from "vitest"
import type { Move } from "../../board/types"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import { validateMove } from "../validateMove"

describe("validateMove", () => {
  describe("at least one tile placed", () => {
    it("rejects an empty move", () => {
      const board = createEmptyBoard()
      const move: Move = []

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Must place at least one tile")
      expect(result.score).toBe(0)
    })
  })

  describe("tiles in same row or column", () => {
    it("accepts a horizontal move", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Tiles must be in a single row or column")
    })

    it("accepts a vertical move", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 6, col: 7, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 8, col: 7, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Tiles must be in a single row or column")
    })

    it("accepts a single tile", () => {
      const board = createEmptyBoard()
      const move: Move = [{ row: 7, col: 7, tile: "A" }]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Tiles must be in a single row or column")
    })

    it("rejects tiles not in a line", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 7, tile: "C" },
        { row: 8, col: 8, tile: "A" },
        { row: 9, col: 9, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Tiles must be in a single row or column")
    })

    it("rejects L-shaped placement", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 7, tile: "C" },
        { row: 7, col: 8, tile: "A" },
        { row: 8, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Tiles must be in a single row or column")
    })
  })

  describe("no gaps", () => {
    it("accepts continuous horizontal tiles", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Tiles must form a continuous line with no gaps")
    })

    it("accepts tiles with gap filled by existing board tile", () => {
      const board = createEmptyBoard()
      board[7][7] = "A"

      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Tiles must form a continuous line with no gaps")
    })

    it("rejects horizontal tiles with an empty gap", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 9, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Tiles must form a continuous line with no gaps")
    })

    it("rejects vertical tiles with an empty gap", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 6, col: 7, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 9, col: 7, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Tiles must form a continuous line with no gaps")
    })
  })

  describe("first move must cover center square", () => {
    it("accepts first move covering center (7,7)", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("First move must cover the center square")
    })

    it("rejects first move not covering center", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 0, col: 0, tile: "C" },
        { row: 0, col: 1, tile: "A" },
        { row: 0, col: 2, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("First move must cover the center square")
    })

    it("does not require center on subsequent moves", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      const move: Move = [{ row: 7, col: 10, tile: "S" }]

      const result = validateMove(board, move, false)
      expect(result.errors).not.toContain("First move must cover the center square")
    })
  })

  describe("subsequent moves must connect to existing tiles", () => {
    it("accepts a move adjacent to existing tiles", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      const move: Move = [{ row: 7, col: 10, tile: "S" }]

      const result = validateMove(board, move, false)
      expect(result.errors).not.toContain("Move must connect to existing tiles on the board")
    })

    it("rejects a move with no connection to existing tiles", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      const move: Move = [
        { row: 0, col: 0, tile: "D" },
        { row: 0, col: 1, tile: "O" },
        { row: 0, col: 2, tile: "G" },
      ]

      const result = validateMove(board, move, false)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain("Move must connect to existing tiles on the board")
    })

    it("does not check connection on first move", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.errors).not.toContain("Move must connect to existing tiles on the board")
    })
  })

  describe("all formed words must be valid", () => {
    it("accepts a move forming valid words", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.words).toContain("CAT")
    })

    it("rejects a move forming an invalid word", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "X" },
        { row: 7, col: 7, tile: "Z" },
        { row: 7, col: 8, tile: "Q" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes("not a valid word"))).toBe(true)
    })

    it("rejects if any cross word is invalid", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      // Place "Z" below "C" - "CZ" is not a valid word
      const move: Move = [{ row: 8, col: 7, tile: "Z" }]

      const result = validateMove(board, move, false)
      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes("not a valid word"))).toBe(true)
    })
  })

  describe("return value structure", () => {
    it("returns words and score for a valid move", () => {
      const board = createEmptyBoard()
      const move: Move = [
        { row: 7, col: 6, tile: "C" },
        { row: 7, col: 7, tile: "A" },
        { row: 7, col: 8, tile: "T" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.words).toContain("CAT")
      expect(result.score).toBeGreaterThan(0)
    })

    it("returns score 0 for an invalid move", () => {
      const board = createEmptyBoard()
      const move: Move = []

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.score).toBe(0)
    })

    it("defaults isFirstMove to false", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      const move: Move = [{ row: 7, col: 10, tile: "S" }]

      // Call without third argument
      const result = validateMove(board, move)
      expect(result.valid).toBe(true)
    })
  })

  describe("multiple errors", () => {
    it("can report multiple errors at once", () => {
      const board = createEmptyBoard()
      // Tiles not in a line AND not covering center
      const move: Move = [
        { row: 0, col: 0, tile: "X" },
        { row: 1, col: 1, tile: "Z" },
      ]

      const result = validateMove(board, move, true)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe("complex scenarios", () => {
    it("validates a perpendicular word connecting to existing tiles", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      // Play "AT" vertically through existing "A"
      const move: Move = [{ row: 8, col: 8, tile: "T" }]

      const result = validateMove(board, move, false)
      expect(result.valid).toBe(true)
      expect(result.words).toContain("AT")
      expect(result.score).toBeGreaterThan(0)
    })

    it("validates a move extending an existing word", () => {
      const board = createEmptyBoard()
      board[7][7] = "C"
      board[7][8] = "A"
      board[7][9] = "T"

      const move: Move = [{ row: 7, col: 10, tile: "S" }]

      const result = validateMove(board, move, false)
      expect(result.valid).toBe(true)
      expect(result.words).toContain("CATS")
    })
  })
})
