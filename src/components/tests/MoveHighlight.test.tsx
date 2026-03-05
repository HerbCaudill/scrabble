import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Board } from "../Board"
import { createEmptyBoard } from "@/board/createEmptyBoard"

describe("Move highlighting on board", () => {
  it("renders data-highlight='actual' on squares highlighted as actual move", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    const highlights = new Map([["7-7", "actual" as const]])
    const { container } = render(<Board board={board} squareHighlights={highlights} />)
    const square = container.querySelector('[data-cell="7-7"]')
    expect(square?.getAttribute("data-highlight")).toBe("actual")
  })

  it("renders data-highlight='best' on squares highlighted as best move", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    const highlights = new Map([["7-7", "best" as const]])
    const { container } = render(<Board board={board} squareHighlights={highlights} />)
    const square = container.querySelector('[data-cell="7-7"]')
    expect(square?.getAttribute("data-highlight")).toBe("best")
  })

  it("renders data-highlight='both' when a square is in both actual and best moves", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    const highlights = new Map([["7-7", "both" as const]])
    const { container } = render(<Board board={board} squareHighlights={highlights} />)
    const square = container.querySelector('[data-cell="7-7"]')
    expect(square?.getAttribute("data-highlight")).toBe("both")
  })

  it("does not render data-highlight on non-highlighted squares", () => {
    const board = createEmptyBoard()
    const highlights = new Map([["7-7", "actual" as const]])
    const { container } = render(<Board board={board} squareHighlights={highlights} />)
    const square = container.querySelector('[data-cell="0-0"]')
    expect(square?.hasAttribute("data-highlight")).toBe(false)
  })

  it("applies distinct styling for actual vs best highlights", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    board[7][8] = "E"
    const highlights = new Map([
      ["7-7", "actual" as const],
      ["7-8", "best" as const],
    ])
    const { container } = render(<Board board={board} squareHighlights={highlights} />)
    const actualSquare = container.querySelector('[data-cell="7-7"]')
    const bestSquare = container.querySelector('[data-cell="7-8"]')
    // Actual should have emerald/green ring, best should have indigo/blue ring
    expect(actualSquare?.className).toMatch(/emerald/)
    expect(bestSquare?.className).toMatch(/indigo/)
  })

  it("supports both old highlightedSquares and new squareHighlights props", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    // Old API still works
    const highlighted = [{ row: 7, col: 7 }]
    const { container } = render(<Board board={board} highlightedSquares={highlighted} />)
    const square = container.querySelector('[data-cell="7-7"]')
    expect(square?.className).toMatch(/ring/)
  })
})
