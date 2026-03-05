import { describe, expect, it } from "vitest"
import { createTileBag } from "../createTileBag"

describe("createTileBag", () => {
  it("creates a bag with 100 tiles", () => {
    const bag = createTileBag()
    expect(bag).toHaveLength(100)
  })

  it("contains the correct number of each letter", () => {
    const bag = createTileBag()
    const counts = new Map<string, number>()
    for (const tile of bag) {
      counts.set(tile.letter, (counts.get(tile.letter) ?? 0) + 1)
    }

    // Standard Scrabble distribution
    expect(counts.get("A")).toBe(9)
    expect(counts.get("B")).toBe(2)
    expect(counts.get("C")).toBe(2)
    expect(counts.get("D")).toBe(4)
    expect(counts.get("E")).toBe(12)
    expect(counts.get("F")).toBe(2)
    expect(counts.get("G")).toBe(3)
    expect(counts.get("H")).toBe(2)
    expect(counts.get("I")).toBe(9)
    expect(counts.get("J")).toBe(1)
    expect(counts.get("K")).toBe(1)
    expect(counts.get("L")).toBe(4)
    expect(counts.get("M")).toBe(2)
    expect(counts.get("N")).toBe(6)
    expect(counts.get("O")).toBe(8)
    expect(counts.get("P")).toBe(2)
    expect(counts.get("Q")).toBe(1)
    expect(counts.get("R")).toBe(6)
    expect(counts.get("S")).toBe(4)
    expect(counts.get("T")).toBe(6)
    expect(counts.get("U")).toBe(4)
    expect(counts.get("V")).toBe(2)
    expect(counts.get("W")).toBe(2)
    expect(counts.get("X")).toBe(1)
    expect(counts.get("Y")).toBe(2)
    expect(counts.get("Z")).toBe(1)
    expect(counts.get(" ")).toBe(2)
  })

  it("assigns correct point values", () => {
    const bag = createTileBag()
    const tileA = bag.find(t => t.letter === "A")
    const tileZ = bag.find(t => t.letter === "Z")
    const tileBlank = bag.find(t => t.letter === " ")

    expect(tileA?.value).toBe(1)
    expect(tileZ?.value).toBe(10)
    expect(tileBlank?.value).toBe(0)
  })

  it("returns a new array each time", () => {
    const bag1 = createTileBag()
    const bag2 = createTileBag()
    expect(bag1).not.toBe(bag2)
  })
})
