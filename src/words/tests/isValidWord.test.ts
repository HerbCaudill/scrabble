import { describe, expect, it } from "vitest"
import { isValidWord } from "../isValidWord"

describe("isValidWord", () => {
  it("should return true for a valid word", () => {
    expect(isValidWord("AA")).toBe(true)
  })

  it("should return true for a common valid word", () => {
    expect(isValidWord("HELLO")).toBe(true)
  })

  it("should be case-insensitive", () => {
    expect(isValidWord("hello")).toBe(true)
    expect(isValidWord("Hello")).toBe(true)
    expect(isValidWord("HELLO")).toBe(true)
  })

  it("should return false for an invalid word", () => {
    expect(isValidWord("ZZZZZZ")).toBe(false)
  })

  it("should return false for an empty string", () => {
    expect(isValidWord("")).toBe(false)
  })

  it("should return true for a word form like AAHED", () => {
    expect(isValidWord("AAHED")).toBe(true)
  })
})
