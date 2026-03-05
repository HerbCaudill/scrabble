import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../createEmptyBoard"

describe("createEmptyBoard", () => {
  it("creates a 15x15 grid", () => {
    const board = createEmptyBoard()
    expect(board).toHaveLength(15)
    for (const row of board) {
      expect(row).toHaveLength(15)
    }
  })

  it("fills every cell with null", () => {
    const board = createEmptyBoard()
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBeNull()
      }
    }
  })

  it("returns a new board each time (no shared references)", () => {
    const board1 = createEmptyBoard()
    const board2 = createEmptyBoard()
    expect(board1).not.toBe(board2)
    expect(board1[0]).not.toBe(board2[0])
  })
})
