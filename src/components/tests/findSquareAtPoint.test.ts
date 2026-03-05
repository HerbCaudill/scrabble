import { describe, expect, it, vi, afterEach, beforeEach } from "vitest"
import { findSquareAtPoint } from "../findSquareAtPoint"

describe("findSquareAtPoint", () => {
  let originalElementFromPoint: typeof document.elementFromPoint

  beforeEach(() => {
    originalElementFromPoint = document.elementFromPoint
  })

  afterEach(() => {
    document.elementFromPoint = originalElementFromPoint
  })

  it("returns position when point is over a board square", () => {
    const mockElement = document.createElement("div")
    mockElement.setAttribute("data-cell", "3-5")
    document.elementFromPoint = vi.fn().mockReturnValue(mockElement)

    const result = findSquareAtPoint(100, 200)
    expect(result).toEqual({ row: 3, col: 5 })
  })

  it("returns null when point is not over any element", () => {
    document.elementFromPoint = vi.fn().mockReturnValue(null)

    const result = findSquareAtPoint(100, 200)
    expect(result).toBeNull()
  })

  it("returns null when element has no data-cell attribute", () => {
    const mockElement = document.createElement("div")
    document.elementFromPoint = vi.fn().mockReturnValue(mockElement)

    const result = findSquareAtPoint(100, 200)
    expect(result).toBeNull()
  })

  it("finds data-cell on a parent element via closest", () => {
    const parent = document.createElement("div")
    parent.setAttribute("data-cell", "7-7")
    const child = document.createElement("span")
    parent.appendChild(child)
    document.elementFromPoint = vi.fn().mockReturnValue(child)

    const result = findSquareAtPoint(100, 200)
    expect(result).toEqual({ row: 7, col: 7 })
  })
})
