import { describe, expect, it } from "vitest"
import { boardLayout } from "../boardLayout"

describe("boardLayout", () => {
  it("is a 15x15 grid", () => {
    expect(boardLayout).toHaveLength(15)
    for (const row of boardLayout) {
      expect(row).toHaveLength(15)
    }
  })

  it("has triple word squares in the corners", () => {
    expect(boardLayout[0][0]).toBe("TW")
    expect(boardLayout[0][14]).toBe("TW")
    expect(boardLayout[14][0]).toBe("TW")
    expect(boardLayout[14][14]).toBe("TW")
  })

  it("has a star (center) square at position 7,7", () => {
    expect(boardLayout[7][7]).toBe("ST")
  })

  it("has double letter squares at expected positions", () => {
    expect(boardLayout[0][3]).toBe("DL")
    expect(boardLayout[6][2]).toBe("DL")
  })

  it("has triple letter squares at expected positions", () => {
    expect(boardLayout[1][5]).toBe("TL")
    expect(boardLayout[5][1]).toBe("TL")
  })

  it("has double word squares at expected positions", () => {
    expect(boardLayout[1][1]).toBe("DW")
    expect(boardLayout[4][4]).toBe("DW")
  })

  it("has null for normal squares", () => {
    expect(boardLayout[0][1]).toBeNull()
    expect(boardLayout[1][2]).toBeNull()
  })
})
