import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Board } from "../Board"
import { createEmptyBoard } from "@/board/createEmptyBoard"

describe("Board", () => {
  it("renders a 15x15 grid of squares", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    const squares = container.querySelectorAll("[data-cell]")
    expect(squares).toHaveLength(225)
  })

  it("has data-cell attributes with row-col format", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    expect(container.querySelector('[data-cell="0-0"]')).toBeInTheDocument()
    expect(container.querySelector('[data-cell="7-7"]')).toBeInTheDocument()
    expect(container.querySelector('[data-cell="14-14"]')).toBeInTheDocument()
  })

  it("shows dots on premium squares", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    // TW square (0,0) should have 3 dots (children divs in the dots container)
    const twSquare = container.querySelector('[data-cell="0-0"]')
    const dots = twSquare?.querySelectorAll(".rounded-full")
    expect(dots?.length).toBe(3)
  })

  it("shows a bulls-eye on the center square", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    const centerSquare = container.querySelector('[data-cell="7-7"]')
    // The center square should contain the bulls-eye (nested rounded-full divs)
    const circles = centerSquare?.querySelectorAll(".rounded-full")
    expect(circles?.length).toBeGreaterThan(0)
  })

  it("shows tile letter when a tile is placed", () => {
    const board = createEmptyBoard()
    board[7][7] = "H"
    render(<Board board={board} />)
    const centerSquare = screen.getByTestId("cell-7-7")
    expect(centerSquare).toHaveTextContent("H")
  })

  it("hides premium label when a tile is placed", () => {
    const board = createEmptyBoard()
    // Place a tile on a TW square (0,0)
    board[0][0] = "A"
    const { container } = render(<Board board={board} />)
    const square = container.querySelector('[data-cell="0-0"]')
    // Should show the tile, not the premium label
    expect(square?.textContent).not.toContain("3W")
  })

  it("does not respond to clicks on squares", async () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    const square = container.querySelector('[data-cell="3-5"]') as HTMLElement
    // Squares should not have cursor-pointer since there's no click handler
    expect(square.className).not.toMatch(/cursor-pointer/)
  })

  it("highlights specified squares", () => {
    const board = createEmptyBoard()
    const highlighted = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ]
    const { container } = render(<Board board={board} highlightedSquares={highlighted} />)
    const square = container.querySelector('[data-cell="0-0"]')
    // Highlighted squares should have a distinct visual indicator
    expect(square?.className).toMatch(/ring|outline|border|highlight/)
  })

  it("renders the board as a CSS grid", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    // The grid container should use CSS grid with 15 columns
    const grid = container.firstElementChild as HTMLElement
    expect(grid.className).toMatch(/grid/)
  })
})
