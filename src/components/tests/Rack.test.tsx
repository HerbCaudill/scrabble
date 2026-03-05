import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Rack } from "../Rack"
import type { Tile } from "@/types"

const makeTiles = (letters: string): Tile[] =>
  letters.split("").map(l => ({ letter: l, value: l === " " ? 0 : 1 }))

describe("Rack", () => {
  it("renders up to 7 tiles in a horizontal row", () => {
    const tiles = makeTiles("ABCDEFG")
    render(<Rack tiles={tiles} />)
    const rack = screen.getByTestId("rack")
    expect(rack).toBeInTheDocument()
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(7)
  })

  it("renders fewer than 7 tiles", () => {
    const tiles = makeTiles("ABC")
    render(<Rack tiles={tiles} />)
    const rack = screen.getByTestId("rack")
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(3)
  })

  it("renders an empty rack", () => {
    render(<Rack tiles={[]} />)
    const rack = screen.getByTestId("rack")
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(0)
  })

  it("has a data-rack attribute on the container", () => {
    render(<Rack tiles={[]} />)
    expect(document.querySelector("[data-rack]")).toBeInTheDocument()
  })

  it("tiles are draggable by default", () => {
    const tiles = makeTiles("AB")
    render(<Rack tiles={tiles} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")
    tileEls.forEach(el => {
      expect(el).toHaveAttribute("draggable", "true")
    })
  })

  it("tiles are not draggable in exchange mode", () => {
    const tiles = makeTiles("AB")
    render(<Rack tiles={tiles} exchangeMode />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")
    tileEls.forEach(el => {
      expect(el).not.toHaveAttribute("draggable")
    })
  })

  it("calls onTileSelect when a tile is clicked in exchange mode", () => {
    const tiles = makeTiles("AB")
    const onTileSelect = vi.fn()
    render(<Rack tiles={tiles} exchangeMode onTileSelect={onTileSelect} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")
    fireEvent.click(tileEls[1])
    expect(onTileSelect).toHaveBeenCalledWith(1)
  })

  it("does not call onTileSelect when not in exchange mode", () => {
    const tiles = makeTiles("AB")
    const onTileSelect = vi.fn()
    render(<Rack tiles={tiles} onTileSelect={onTileSelect} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")
    fireEvent.click(tileEls[0])
    expect(onTileSelect).not.toHaveBeenCalled()
  })

  it("applies selected state to tiles at selectedIndices", () => {
    const tiles = makeTiles("ABC")
    render(<Rack tiles={tiles} exchangeMode selectedIndices={[0, 2]} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")
    // Selected tiles should have ring class
    expect((tileEls[0] as HTMLElement).className).toMatch(/ring/)
    expect((tileEls[1] as HTMLElement).className).not.toMatch(/ring/)
    expect((tileEls[2] as HTMLElement).className).toMatch(/ring/)
  })

  it("forwards onDragStart and onDragEnd handlers", () => {
    const tiles = makeTiles("A")
    const onDragStart = vi.fn()
    const onDragEnd = vi.fn()
    render(<Rack tiles={tiles} onDragStart={onDragStart} onDragEnd={onDragEnd} />)
    const tileEl = screen.getByTestId("rack").querySelector("[data-tile]") as HTMLElement
    fireEvent.dragStart(tileEl)
    expect(onDragStart).toHaveBeenCalled()
    fireEvent.dragEnd(tileEl)
    expect(onDragEnd).toHaveBeenCalled()
  })
})
