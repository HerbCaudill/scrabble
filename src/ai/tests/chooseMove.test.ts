import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import type { BoardState } from "../../board/types"
import { generateMoves } from "../../movegen/generateMoves"
import { chooseMove } from "../chooseMove"

/** Place a word on the board horizontally starting at (row, col). */
const placeWord = (board: BoardState, word: string, row: number, col: number) => {
  for (let i = 0; i < word.length; i++) {
    board[row][col + i] = word[i]
  }
}

/** Create a random function that returns a fixed value. */
const fixedRandom = (value: number) => () => value

describe("chooseMove", () => {
  describe("hard difficulty", () => {
    it("should return the highest-scoring move", () => {
      const board = createEmptyBoard()
      const rack = ["C", "A", "T", "S", "D", "O", "G"]
      const moves = generateMoves(board, rack)
      const move = chooseMove(board, rack, "hard")

      expect(move).not.toBeNull()
      expect(move!.score).toBe(moves[0].score)
    })

    it("should be deterministic for hard difficulty", () => {
      const board = createEmptyBoard()
      const rack = ["C", "A", "T", "S", "D", "O", "G"]
      const move1 = chooseMove(board, rack, "hard")
      const move2 = chooseMove(board, rack, "hard")

      expect(move1!.score).toBe(move2!.score)
      expect(move1!.words).toEqual(move2!.words)
    })
  })

  describe("medium difficulty", () => {
    it("should select from the top 5 moves using weighted random", () => {
      const board = createEmptyBoard()
      placeWord(board, "CAT", 7, 6)
      const rack = ["S", "D", "O", "G", "E", "R", "N"]
      const moves = generateMoves(board, rack)

      // With random returning 0, should pick the first move (highest score)
      const moveFirst = chooseMove(board, rack, "medium", fixedRandom(0))
      expect(moveFirst!.score).toBe(moves[0].score)

      // With random returning 0.999, should pick one of the lower-scoring top 5
      const moveLast = chooseMove(board, rack, "medium", fixedRandom(0.999))
      const top5Scores = moves.slice(0, 5).map(m => m.score)
      expect(top5Scores).toContain(moveLast!.score)
    })

    it("should weight toward higher-scoring moves", () => {
      const board = createEmptyBoard()
      placeWord(board, "CAT", 7, 6)
      const rack = ["S", "D", "O", "G", "E", "R", "N"]
      const moves = generateMoves(board, rack)
      const top5 = moves.slice(0, 5)
      const totalScore = top5.reduce((sum, m) => sum + m.score, 0)

      // The threshold for the first move is its score / totalScore
      // A random value just below that threshold should pick the first move
      const firstMoveWeight = top5[0].score / totalScore
      const move = chooseMove(board, rack, "medium", fixedRandom(firstMoveWeight * 0.5))
      expect(move!.score).toBe(top5[0].score)
    })
  })

  describe("easy difficulty", () => {
    it("should select from top 20 moves with uniform distribution", () => {
      const board = createEmptyBoard()
      placeWord(board, "CAT", 7, 6)
      const rack = ["S", "D", "O", "G", "E", "R", "N"]
      const moves = generateMoves(board, rack)
      const poolSize = Math.min(20, moves.length)

      // With random returning 0, should pick the first move
      const moveFirst = chooseMove(board, rack, "easy", fixedRandom(0))
      expect(moveFirst!.score).toBe(moves[0].score)

      // With random returning 0.999, should pick one near the end of top 20
      const moveLast = chooseMove(board, rack, "easy", fixedRandom(0.999))
      const top20Scores = moves.slice(0, poolSize).map(m => m.score)
      expect(top20Scores).toContain(moveLast!.score)

      // The last move selected should be the last in the pool
      expect(moveLast!.score).toBe(moves[poolSize - 1].score)
    })
  })

  describe("default difficulty", () => {
    it("should default to medium", () => {
      const board = createEmptyBoard()
      const rack = ["C", "A", "T", "S", "D", "O", "G"]

      // Should not throw and should return a move
      const move = chooseMove(board, rack, undefined, fixedRandom(0))
      expect(move).not.toBeNull()
    })
  })

  describe("no valid moves", () => {
    it("should return null when no moves are possible", () => {
      const board = createEmptyBoard()
      const rack: string[] = []
      const move = chooseMove(board, rack, "hard")
      expect(move).toBeNull()
    })
  })

  describe("with existing board state", () => {
    it("should find moves building on existing words", () => {
      const board = createEmptyBoard()
      placeWord(board, "CAT", 7, 6)
      const rack = ["S", "D", "O", "G", "E", "R", "N"]
      const move = chooseMove(board, rack, "hard")

      expect(move).not.toBeNull()
      expect(move!.score).toBeGreaterThan(0)
    })
  })
})
