import { describe, expect, it } from "vitest"
import { tileValues } from "../tileValues"

describe("tileValues", () => {
  it("assigns 1 point to common letters", () => {
    for (const letter of ["A", "E", "I", "O", "U", "L", "N", "S", "T", "R"]) {
      expect(tileValues[letter]).toBe(1)
    }
  })

  it("assigns 10 points to Q and Z", () => {
    expect(tileValues["Q"]).toBe(10)
    expect(tileValues["Z"]).toBe(10)
  })

  it("assigns 8 points to J and X", () => {
    expect(tileValues["J"]).toBe(8)
    expect(tileValues["X"]).toBe(8)
  })

  it("assigns 0 points to blank tiles", () => {
    expect(tileValues[" "]).toBe(0)
  })

  it("has values for all 26 letters plus blank", () => {
    expect(Object.keys(tileValues)).toHaveLength(27)
  })
})
