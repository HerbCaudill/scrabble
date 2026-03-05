import { describe, expect, it } from "vitest"
import { isBlankTile } from "../isBlankTile"

describe("isBlankTile", () => {
  it("returns true for a space (unassigned blank)", () => {
    expect(isBlankTile(" ")).toBe(true)
  })

  it("returns true for lowercase letters (assigned blanks)", () => {
    expect(isBlankTile("a")).toBe(true)
    expect(isBlankTile("z")).toBe(true)
    expect(isBlankTile("m")).toBe(true)
  })

  it("returns false for uppercase letters (regular tiles)", () => {
    expect(isBlankTile("A")).toBe(false)
    expect(isBlankTile("Z")).toBe(false)
  })

  it("returns false for null", () => {
    expect(isBlankTile(null)).toBe(false)
  })
})
