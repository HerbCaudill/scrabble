import { describe, expect, it } from "vitest"
import { getMovePositions } from "../getMovePositions"
import type { Move } from "../types"

describe("getMovePositions", () => {
  it("returns empty array for empty move", () => {
    const move: Move = []
    expect(getMovePositions(move)).toEqual([])
  })

  it("extracts positions from a single-tile move", () => {
    const move: Move = [{ row: 7, col: 7, tile: "H" }]
    expect(getMovePositions(move)).toEqual([{ row: 7, col: 7 }])
  })

  it("extracts positions from a multi-tile move", () => {
    const move: Move = [
      { row: 7, col: 7, tile: "H" },
      { row: 7, col: 8, tile: "E" },
      { row: 7, col: 9, tile: "L" },
      { row: 7, col: 10, tile: "L" },
      { row: 7, col: 11, tile: "O" },
    ]
    expect(getMovePositions(move)).toEqual([
      { row: 7, col: 7 },
      { row: 7, col: 8 },
      { row: 7, col: 9 },
      { row: 7, col: 10 },
      { row: 7, col: 11 },
    ])
  })

  it("strips the tile property, returning only row and col", () => {
    const move: Move = [{ row: 3, col: 5, tile: "Z" }]
    const result = getMovePositions(move)
    expect(result[0]).toEqual({ row: 3, col: 5 })
    expect(result[0]).not.toHaveProperty("tile")
  })
})
