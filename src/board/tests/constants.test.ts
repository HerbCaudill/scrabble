import { describe, expect, it } from "vitest"
import { TILE_DISTRIBUTION, TOTAL_TILES, MAX_TILES_PER_MOVE } from "../constants"

describe("constants", () => {
  it("has a tile distribution that sums to 100", () => {
    const total = Object.values(TILE_DISTRIBUTION).reduce((sum, count) => sum + count, 0)
    expect(total).toBe(100)
  })

  it("TOTAL_TILES equals 100", () => {
    expect(TOTAL_TILES).toBe(100)
  })

  it("MAX_TILES_PER_MOVE is 7 (rack size)", () => {
    expect(MAX_TILES_PER_MOVE).toBe(7)
  })

  it("includes 2 blank tiles", () => {
    expect(TILE_DISTRIBUTION[" "]).toBe(2)
  })

  it("includes 12 E tiles", () => {
    expect(TILE_DISTRIBUTION["E"]).toBe(12)
  })
})
