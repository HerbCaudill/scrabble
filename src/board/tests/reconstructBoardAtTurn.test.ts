import { describe, expect, it } from "vitest"
import { reconstructBoardAtTurn } from "../reconstructBoardAtTurn"
import type { MoveRecord } from "../../game/types"

/** Helper to create a simple place MoveRecord. */
const placeMoveRecord = (
  player: string,
  move: Array<{ row: number; col: number; tile: string }>,
  score: number,
  words: string[],
): MoveRecord => ({
  player,
  actionType: "place",
  move,
  score,
  words,
  timestamp: Date.now(),
})

/** Helper to create a pass MoveRecord. */
const passMoveRecord = (player: string): MoveRecord => ({
  player,
  actionType: "pass",
  move: null,
  score: 0,
  words: [],
  timestamp: Date.now(),
})

describe("reconstructBoardAtTurn", () => {
  const moveHistory: MoveRecord[] = [
    placeMoveRecord(
      "Alice",
      [
        { row: 7, col: 7, tile: "H" },
        { row: 7, col: 8, tile: "I" },
      ],
      5,
      ["HI"],
    ),
    placeMoveRecord(
      "Bob",
      [
        { row: 8, col: 7, tile: "A" },
        { row: 9, col: 7, tile: "T" },
      ],
      6,
      ["HAT"],
    ),
    passMoveRecord("Alice"),
    placeMoveRecord("Bob", [{ row: 7, col: 6, tile: "S" }], 8, ["SHI"]),
  ]

  it("returns an empty board for turnIndex -1", () => {
    const board = reconstructBoardAtTurn(moveHistory, -1)
    const allNull = board.every(row => row.every(cell => cell === null))
    expect(allNull).toBe(true)
  })

  it("shows tiles from the first move at turnIndex 0", () => {
    const board = reconstructBoardAtTurn(moveHistory, 0)
    expect(board[7][7]).toBe("H")
    expect(board[7][8]).toBe("I")
    expect(board[8][7]).toBeNull()
  })

  it("accumulates tiles through turnIndex 1", () => {
    const board = reconstructBoardAtTurn(moveHistory, 1)
    expect(board[7][7]).toBe("H")
    expect(board[7][8]).toBe("I")
    expect(board[8][7]).toBe("A")
    expect(board[9][7]).toBe("T")
  })

  it("handles pass moves without changing the board", () => {
    const board = reconstructBoardAtTurn(moveHistory, 2)
    // Same as turnIndex 1 since turn 2 is a pass
    expect(board[7][7]).toBe("H")
    expect(board[8][7]).toBe("A")
    expect(board[9][7]).toBe("T")
  })

  it("shows all tiles through the last turn", () => {
    const board = reconstructBoardAtTurn(moveHistory, 3)
    expect(board[7][6]).toBe("S")
    expect(board[7][7]).toBe("H")
    expect(board[7][8]).toBe("I")
    expect(board[8][7]).toBe("A")
    expect(board[9][7]).toBe("T")
  })

  it("handles an empty move history", () => {
    const board = reconstructBoardAtTurn([], 0)
    const allNull = board.every(row => row.every(cell => cell === null))
    expect(allNull).toBe(true)
  })
})
