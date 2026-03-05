import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Tile } from "../Tile"

describe("Tile", () => {
  it("renders a letter and point value", () => {
    render(<Tile tile={{ letter: "A", value: 1 }} />)
    const tile = screen.getByTestId("tile-A")
    expect(tile).toBeInTheDocument()
    expect(tile).toHaveTextContent("A")
    expect(tile).toHaveTextContent("1")
  })

  it("uses data-tile attribute with the letter", () => {
    render(<Tile tile={{ letter: "Z", value: 10 }} />)
    expect(screen.getByTestId("tile-Z")).toHaveAttribute("data-tile", "Z")
  })

  it("renders a blank tile with no visible letter", () => {
    const { container } = render(<Tile tile={{ letter: " ", value: 0 }} />)
    const tile = container.querySelector('[data-tile=" "]') as HTMLElement
    expect(tile).toBeInTheDocument()
    // Should not show a letter for blank tiles
    expect(tile.querySelector("[data-letter]")?.textContent).toBeFalsy()
  })

  it("renders a blank tile assigned as lowercase with faint letter", () => {
    render(<Tile tile={{ letter: "a", value: 0 }} />)
    const tile = screen.getByTestId("tile-a")
    expect(tile).toHaveAttribute("data-tile", "a")
    // Should show the letter faintly (uppercase display)
    expect(tile.querySelector("[data-letter]")?.textContent).toBe("A")
  })

  it("defaults to static mode with no drag attributes", () => {
    render(<Tile tile={{ letter: "B", value: 3 }} />)
    const tile = screen.getByTestId("tile-B")
    expect(tile).not.toHaveAttribute("draggable")
  })

  it("adds drag attributes in draggable mode", () => {
    render(<Tile tile={{ letter: "B", value: 3 }} mode="draggable" />)
    const tile = screen.getByTestId("tile-B")
    expect(tile).toHaveAttribute("draggable", "true")
  })

  it("does not add drag attributes in static mode", () => {
    render(<Tile tile={{ letter: "B", value: 3 }} mode="static" />)
    const tile = screen.getByTestId("tile-B")
    expect(tile).not.toHaveAttribute("draggable")
  })

  it("applies selected state styling", () => {
    const { container } = render(<Tile tile={{ letter: "C", value: 3 }} selected />)
    const tile = container.firstChild as HTMLElement
    // Selected tiles should have a ring/border class
    expect(tile.className).toMatch(/ring/)
  })

  it("renders at different sizes", () => {
    const { rerender } = render(<Tile tile={{ letter: "D", value: 2 }} size="sm" />)
    const smTile = screen.getByTestId("tile-D")
    expect(smTile).toBeInTheDocument()

    rerender(<Tile tile={{ letter: "D", value: 2 }} size="md" />)
    expect(screen.getByTestId("tile-D")).toBeInTheDocument()

    rerender(<Tile tile={{ letter: "D", value: 2 }} size="lg" />)
    expect(screen.getByTestId("tile-D")).toBeInTheDocument()
  })

  it("shows point value in subscript position", () => {
    render(<Tile tile={{ letter: "Q", value: 10 }} />)
    const tile = screen.getByTestId("tile-Q")
    const valueEl = tile.querySelector("[data-value]")
    expect(valueEl).toBeInTheDocument()
    expect(valueEl?.textContent).toBe("10")
  })

  it("does not show point value for blank tiles", () => {
    const { container } = render(<Tile tile={{ letter: " ", value: 0 }} />)
    const tile = container.querySelector('[data-tile=" "]') as HTMLElement
    expect(tile).toBeInTheDocument()
    const valueEl = tile.querySelector("[data-value]")
    expect(valueEl).not.toBeInTheDocument()
  })
})
