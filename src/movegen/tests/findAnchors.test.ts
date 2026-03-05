import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import { findAnchors } from "../findAnchors"

describe("findAnchors", () => {
  it("should return center square for an empty board", () => {
    const board = createEmptyBoard()
    const anchors = findAnchors(board)
    expect(anchors).toEqual([{ row: 7, col: 7 }])
  })

  it("should return empty squares adjacent to filled squares", () => {
    const board = createEmptyBoard()
    board[7][7] = "A"

    const anchors = findAnchors(board)

    // Should include squares adjacent to the 'A' at (7,7)
    expect(anchors).toContainEqual({ row: 6, col: 7 })
    expect(anchors).toContainEqual({ row: 8, col: 7 })
    expect(anchors).toContainEqual({ row: 7, col: 6 })
    expect(anchors).toContainEqual({ row: 7, col: 8 })

    // Should NOT include the filled square itself
    expect(anchors).not.toContainEqual({ row: 7, col: 7 })
  })

  it("should not duplicate anchors", () => {
    const board = createEmptyBoard()
    board[7][7] = "A"
    board[7][8] = "B"

    const anchors = findAnchors(board)
    // (7,9) should appear only once even though it's adjacent to B
    const count = anchors.filter(a => a.row === 7 && a.col === 9).length
    expect(count).toBe(1)
  })
})
