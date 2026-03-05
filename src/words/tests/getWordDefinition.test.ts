import { describe, expect, it } from "vitest"
import { getWordDefinition } from "../getWordDefinition"

describe("getWordDefinition", () => {
  it("should return a definition for a valid word", () => {
    const definition = getWordDefinition("AA")
    expect(definition).toBeDefined()
    expect(definition).toContain("volcanic")
  })

  it("should be case-insensitive", () => {
    const definition = getWordDefinition("aa")
    expect(definition).toBeDefined()
    expect(definition).toContain("volcanic")
  })

  it("should return undefined for an invalid word", () => {
    expect(getWordDefinition("ZZZZZZ")).toBeUndefined()
  })

  it("should return undefined for a word with no definitions", () => {
    // AAHED has no definitions in CSW21, only a crossRef
    expect(getWordDefinition("AAHED")).toBeUndefined()
  })

  it("should return undefined for an empty string", () => {
    expect(getWordDefinition("")).toBeUndefined()
  })
})
