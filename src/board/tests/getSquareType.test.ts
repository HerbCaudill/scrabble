import { describe, expect, it } from "vitest"
import { getSquareType } from "../getSquareType"

describe("getSquareType", () => {
  it("returns TW for triple word squares", () => {
    expect(getSquareType(0, 0)).toBe("TW")
    expect(getSquareType(0, 7)).toBe("TW")
    expect(getSquareType(14, 14)).toBe("TW")
  })

  it("returns DW for double word squares", () => {
    expect(getSquareType(1, 1)).toBe("DW")
    expect(getSquareType(4, 4)).toBe("DW")
  })

  it("returns TL for triple letter squares", () => {
    expect(getSquareType(1, 5)).toBe("TL")
    expect(getSquareType(5, 1)).toBe("TL")
  })

  it("returns DL for double letter squares", () => {
    expect(getSquareType(0, 3)).toBe("DL")
    expect(getSquareType(6, 2)).toBe("DL")
  })

  it("returns ST for the center square", () => {
    expect(getSquareType(7, 7)).toBe("ST")
  })

  it("returns null for normal squares", () => {
    expect(getSquareType(0, 1)).toBeNull()
    expect(getSquareType(1, 2)).toBeNull()
  })
})
