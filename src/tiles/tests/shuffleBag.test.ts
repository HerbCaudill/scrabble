import { describe, expect, it } from "vitest"
import { createTileBag } from "../createTileBag"
import { shuffleBag } from "../shuffleBag"

describe("shuffleBag", () => {
  it("returns the same number of tiles", () => {
    const bag = createTileBag()
    const shuffled = shuffleBag(bag)
    expect(shuffled).toHaveLength(bag.length)
  })

  it("does not mutate the original bag", () => {
    const bag = createTileBag()
    const original = [...bag]
    shuffleBag(bag)
    expect(bag).toEqual(original)
  })

  it("contains the same tiles (same letter/value counts)", () => {
    const bag = createTileBag()
    const shuffled = shuffleBag(bag)

    const sortFn = (a: { letter: string }, b: { letter: string }) =>
      a.letter.localeCompare(b.letter)
    const sortedOriginal = [...bag].sort(sortFn)
    const sortedShuffled = [...shuffled].sort(sortFn)
    expect(sortedShuffled).toEqual(sortedOriginal)
  })

  it("produces a different order (statistical check)", () => {
    const bag = createTileBag()
    // Run multiple shuffles and check at least one differs
    let anyDifferent = false
    for (let i = 0; i < 5; i++) {
      const shuffled = shuffleBag(bag)
      const sameOrder = shuffled.every((tile, idx) => tile.letter === bag[idx].letter)
      if (!sameOrder) {
        anyDifferent = true
        break
      }
    }
    expect(anyDifferent).toBe(true)
  })

  it("returns a new array", () => {
    const bag = createTileBag()
    const shuffled = shuffleBag(bag)
    expect(shuffled).not.toBe(bag)
  })
})
