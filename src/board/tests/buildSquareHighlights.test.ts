import { describe, expect, it } from "vitest"
import { buildSquareHighlights } from "../buildSquareHighlights"

describe("buildSquareHighlights", () => {
  it("returns empty map when both inputs are empty", () => {
    const result = buildSquareHighlights([], [])
    expect(result.size).toBe(0)
  })

  it("marks actual-only positions as 'actual'", () => {
    const actual = [{ row: 7, col: 7 }]
    const best = [{ row: 0, col: 0 }]
    const result = buildSquareHighlights(actual, best)
    expect(result.get("7-7")).toBe("actual")
  })

  it("marks best-only positions as 'best'", () => {
    const actual = [{ row: 7, col: 7 }]
    const best = [{ row: 0, col: 0 }]
    const result = buildSquareHighlights(actual, best)
    expect(result.get("0-0")).toBe("best")
  })

  it("marks overlapping positions as 'both'", () => {
    const actual = [
      { row: 7, col: 7 },
      { row: 7, col: 8 },
    ]
    const best = [
      { row: 7, col: 7 },
      { row: 7, col: 9 },
    ]
    const result = buildSquareHighlights(actual, best)
    expect(result.get("7-7")).toBe("both")
    expect(result.get("7-8")).toBe("actual")
    expect(result.get("7-9")).toBe("best")
  })

  it("returns only actual highlights when best is empty", () => {
    const actual = [
      { row: 7, col: 7 },
      { row: 7, col: 8 },
    ]
    const result = buildSquareHighlights(actual, [])
    expect(result.get("7-7")).toBe("actual")
    expect(result.get("7-8")).toBe("actual")
    expect(result.size).toBe(2)
  })

  it("returns only best highlights when actual is empty", () => {
    const best = [{ row: 3, col: 5 }]
    const result = buildSquareHighlights([], best)
    expect(result.get("3-5")).toBe("best")
    expect(result.size).toBe(1)
  })
})
