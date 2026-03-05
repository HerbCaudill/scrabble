import { describe, it, expect } from "vitest"
import { analyzeTurn } from "../analyzeTurn"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import type { BoardState, Move } from "../../board/types"

/** Place tiles on a board and return the new board. */
const placeOnBoard = (board: BoardState, move: Move): BoardState => {
  const newBoard = board.map(row => [...row])
  for (const { row, col, tile } of move) {
    newBoard[row][col] = tile
  }
  return newBoard
}

describe("analyzeTurn", () => {
  it("returns zero differential when the best move was played", () => {
    const board = createEmptyBoard()
    // On an empty board with rack ["C","A","T","X","Y","Z","Q"],
    // whatever the best move is, if we play it, differential should be 0.
    const rack = ["C", "A", "T", "X", "Y", "Z", "Q"]

    // We don't know the best move ahead of time; run analysis with no move played
    // to find the best move, then analyze with that move.
    const prelimAnalysis = analyzeTurn(board, rack, null, 1, "Alice")
    const bestMove = prelimAnalysis.bestMoves[0]

    const analysis = analyzeTurn(board, rack, bestMove, 1, "Alice")
    expect(analysis.scoreDifferential).toBe(0)
    expect(analysis.movePlayed).not.toBeNull()
  })

  it("returns positive differential when a suboptimal move was played", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "X", "Y", "Z", "Q"]

    // Play CAT through center (a valid but likely suboptimal move)
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]

    const analysis = analyzeTurn(
      board,
      rack,
      { ...move, score: 10, words: ["CAT"] } as any,
      1,
      "Alice",
    )

    // The best move should score at least as much as CAT
    expect(analysis.scoreDifferential).toBeGreaterThanOrEqual(0)
    expect(analysis.bestMoves.length).toBeGreaterThan(0)
    expect(analysis.bestMoves[0].score).toBeGreaterThanOrEqual(10)
  })

  it("returns the best score as the differential when the player passed", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "X", "Y", "Z", "Q"]

    const analysis = analyzeTurn(board, rack, null, 1, "Alice")

    // Passing means actual score is 0
    expect(analysis.scoreDifferential).toBe(analysis.bestMoves[0]?.score ?? 0)
    expect(analysis.movePlayed).toBeNull()
  })

  it("limits bestMoves to topN", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "X", "Y", "Z", "Q"]

    const analysis = analyzeTurn(board, rack, null, 1, "Alice", 3)

    expect(analysis.bestMoves.length).toBeLessThanOrEqual(3)
  })

  it("sets turnNumber and playerName correctly", () => {
    const board = createEmptyBoard()
    const rack = ["C", "A", "T", "X", "Y", "Z", "Q"]

    const analysis = analyzeTurn(board, rack, null, 5, "Bob")

    expect(analysis.turnNumber).toBe(5)
    expect(analysis.playerName).toBe("Bob")
  })

  it("handles a board with existing tiles", () => {
    const empty = createEmptyBoard()
    const board = placeOnBoard(empty, [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ])
    const rack = ["S", "H", "E", "D", "O", "G", "R"]

    const analysis = analyzeTurn(board, rack, null, 2, "Bob")

    // Should find moves that extend or cross the existing word
    expect(analysis.bestMoves.length).toBeGreaterThan(0)
  })
})
