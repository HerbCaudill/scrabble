import { describe, expect, it } from "vitest"
import { getTileValue } from "../getTileValue"

describe("getTileValue", () => {
  it("returns the correct value for uppercase letters", () => {
    expect(getTileValue("A")).toBe(1)
    expect(getTileValue("Q")).toBe(10)
    expect(getTileValue("Z")).toBe(10)
    expect(getTileValue("K")).toBe(5)
  })

  it("returns 0 for blank tiles (space)", () => {
    expect(getTileValue(" ")).toBe(0)
  })

  it("returns 0 for lowercase letters (blank tiles assigned a letter)", () => {
    expect(getTileValue("a")).toBe(0)
    expect(getTileValue("z")).toBe(0)
  })

  it("returns 0 for unknown characters", () => {
    expect(getTileValue("!")).toBe(0)
  })
})
