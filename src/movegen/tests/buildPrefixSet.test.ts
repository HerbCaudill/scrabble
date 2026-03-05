import { describe, expect, it } from "vitest"
import { buildPrefixSet } from "../buildPrefixSet"

describe("buildPrefixSet", () => {
  it("should contain all prefixes of the given words", () => {
    const words = new Set(["CAT", "CAR", "CARD"])
    const prefixes = buildPrefixSet(words)

    expect(prefixes.has("C")).toBe(true)
    expect(prefixes.has("CA")).toBe(true)
    expect(prefixes.has("CAT")).toBe(true)
    expect(prefixes.has("CAR")).toBe(true)
    expect(prefixes.has("CARD")).toBe(true)
    expect(prefixes.has("CAD")).toBe(false)
    expect(prefixes.has("D")).toBe(false)
  })

  it("should not contain empty string", () => {
    const words = new Set(["AB"])
    const prefixes = buildPrefixSet(words)
    expect(prefixes.has("")).toBe(false)
  })
})
