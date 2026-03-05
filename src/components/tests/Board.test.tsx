import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Board } from "../Board"
import { createEmptyBoard } from "@/board/createEmptyBoard"
import type { BoardState } from "@/board/types"

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

  it("shows premium labels on empty squares", () => {
    const board = createEmptyBoard()
    render(<Board board={board} />)
    // TW squares should show "3W"
    expect(screen.getAllByText("3W").length).toBeGreaterThan(0)
    // DW squares should show "2W"
    expect(screen.getAllByText("2W").length).toBeGreaterThan(0)
    // TL squares should show "3L"
    expect(screen.getAllByText("3L").length).toBeGreaterThan(0)
    // DL squares should show "2L"
    expect(screen.getAllByText("2L").length).toBeGreaterThan(0)
  })

  it("shows a star icon on the center square", () => {
    const board = createEmptyBoard()
    const { container } = render(<Board board={board} />)
    const centerSquare = container.querySelector('[data-cell="7-7"]')
    // The center square should contain an SVG icon (IconStar)
    expect(centerSquare?.querySelector("svg")).toBeInTheDocument()
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

  it("calls onSquareClick when a square is clicked", async () => {
    const board = createEmptyBoard()
    const handleClick = vi.fn()
    const { container } = render(<Board board={board} onSquareClick={handleClick} />)
    const square = container.querySelector('[data-cell="3-5"]') as HTMLElement
    await userEvent.click(square)
    expect(handleClick).toHaveBeenCalledWith({ row: 3, col: 5 })
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
