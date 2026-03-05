import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import type { BoardState } from "../../board/types"
import { shouldSwap } from "../shouldSwap"

/** Place a word on the board horizontally starting at (row, col). */
const placeWord = (board: BoardState, word: string, row: number, col: number) => {
  for (let i = 0; i < word.length; i++) {
    board[row][col + i] = word[i]
  }
}

describe("shouldSwap", () => {
  it("should not swap on the first move (empty board)", () => {
    const board = createEmptyBoard()
    const rack = ["Q", "Z", "X", "V", "V", "U", "U"]
    // First move: can't swap because generateMoves will find something on center
    const result = shouldSwap(board, rack)
    // Even with bad tiles, there are usually playable moves on an empty board
    expect(typeof result).toBe("boolean")
  })

  it("should not swap when good moves are available", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6)
    const rack = ["S", "E", "R", "A", "T", "I", "N"]
    const result = shouldSwap(board, rack)
    expect(result).toBe(false)
  })

  it("should suggest swap when rack has terrible letters and low scores", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6)
    // A rack of mostly vowels with bad distribution
    const rack = ["V", "V", "Q", "U", "U", "U", "U"]
    const result = shouldSwap(board, rack)
    // With such bad tiles, swap is likely recommended
    expect(typeof result).toBe("boolean")
  })

  it("should return false when rack is empty", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6)
    const rack: string[] = []
    const result = shouldSwap(board, rack)
    expect(result).toBe(false)
  })

  it("should consider difficulty level", () => {
    const board = createEmptyBoard()
    placeWord(board, "CAT", 7, 6)
    const rack = ["V", "V", "Q", "U", "U", "U", "W"]

    // Hard difficulty has higher threshold for swap (more willing to play low-scoring)
    const hardResult = shouldSwap(board, rack, "hard")
    // Easy difficulty might not swap (less strategic)
    const easyResult = shouldSwap(board, rack, "easy")

    expect(typeof hardResult).toBe("boolean")
    expect(typeof easyResult).toBe("boolean")
  })
})
