import { describe, expect, it } from "vitest"
import { createTileBag } from "../createTileBag"
import { drawTiles } from "../drawTiles"
import { swapTiles } from "../swapTiles"
import type { Tile } from "../../types"

describe("swapTiles", () => {
  it("returns the correct number of drawn tiles", () => {
    const bag = createTileBag()
    const { drawn: initialDraw, remaining } = drawTiles(bag, 7)
    const tilesToReturn = initialDraw.slice(0, 3)
    const { drawn } = swapTiles(remaining, tilesToReturn, 3)
    expect(drawn).toHaveLength(3)
  })

  it("bag size increases by returned tiles minus drawn tiles", () => {
    const bag = createTileBag()
    const { drawn: initialDraw, remaining } = drawTiles(bag, 7)
    const tilesToReturn = initialDraw.slice(0, 3)
    const { remaining: newRemaining } = swapTiles(remaining, tilesToReturn, 3)
    // 93 + 3 returned - 3 drawn = 93
    expect(newRemaining).toHaveLength(93)
  })

  it("does not mutate the original bag", () => {
    const bag = createTileBag()
    const { drawn: initialDraw, remaining } = drawTiles(bag, 7)
    const originalLength = remaining.length
    const tilesToReturn = initialDraw.slice(0, 2)
    swapTiles(remaining, tilesToReturn, 2)
    expect(remaining).toHaveLength(originalLength)
  })

  it("returned tiles are added back before drawing", () => {
    // With a tiny bag, returning tiles and drawing should work
    const smallBag: Tile[] = []
    const tilesToReturn: Tile[] = [
      { letter: "X", value: 8 },
      { letter: "Z", value: 10 },
    ]
    const { drawn, remaining } = swapTiles(smallBag, tilesToReturn, 2)
    expect(drawn).toHaveLength(2)
    expect(remaining).toHaveLength(0)
  })

  it("draws fewer tiles if bag + returned tiles is less than count", () => {
    const smallBag: Tile[] = [{ letter: "A", value: 1 }]
    const tilesToReturn: Tile[] = [{ letter: "B", value: 3 }]
    const { drawn, remaining } = swapTiles(smallBag, tilesToReturn, 5)
    expect(drawn).toHaveLength(2)
    expect(remaining).toHaveLength(0)
  })
})
