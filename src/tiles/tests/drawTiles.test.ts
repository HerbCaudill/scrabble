import { describe, expect, it } from "vitest"
import { createTileBag } from "../createTileBag"
import { drawTiles } from "../drawTiles"

describe("drawTiles", () => {
  it("draws the requested number of tiles", () => {
    const bag = createTileBag()
    const { drawn, remaining } = drawTiles(bag, 7)
    expect(drawn).toHaveLength(7)
    expect(remaining).toHaveLength(93)
  })

  it("preserves total tile count (drawn + remaining = original)", () => {
    const bag = createTileBag()
    const { drawn, remaining } = drawTiles(bag, 5)
    expect(drawn.length + remaining.length).toBe(bag.length)
  })

  it("does not mutate the original bag", () => {
    const bag = createTileBag()
    const originalLength = bag.length
    drawTiles(bag, 7)
    expect(bag).toHaveLength(originalLength)
  })

  it("draws all remaining tiles when count exceeds bag size", () => {
    const bag = createTileBag().slice(0, 3)
    const { drawn, remaining } = drawTiles(bag, 7)
    expect(drawn).toHaveLength(3)
    expect(remaining).toHaveLength(0)
  })

  it("returns empty drawn array when bag is empty", () => {
    const { drawn, remaining } = drawTiles([], 7)
    expect(drawn).toHaveLength(0)
    expect(remaining).toHaveLength(0)
  })

  it("returns empty drawn array when count is 0", () => {
    const bag = createTileBag()
    const { drawn, remaining } = drawTiles(bag, 0)
    expect(drawn).toHaveLength(0)
    expect(remaining).toHaveLength(100)
  })

  it("drawn tiles are valid tiles from the bag", () => {
    const bag = createTileBag()
    const { drawn } = drawTiles(bag, 7)
    for (const tile of drawn) {
      expect(tile).toHaveProperty("letter")
      expect(tile).toHaveProperty("value")
      expect(typeof tile.letter).toBe("string")
      expect(typeof tile.value).toBe("number")
    }
  })
})
