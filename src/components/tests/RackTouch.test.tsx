import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Rack } from "../Rack"
import type { Tile } from "@/types"

const makeTiles = (letters: string): Tile[] =>
  letters.split("").map(l => ({ letter: l, value: l === " " ? 0 : 1 }))

describe("Rack touch drag", () => {
  it("calls onTouchDragStart when a tile receives a touch start", () => {
    const tiles = makeTiles("ABC")
    const onTouchDragStart = vi.fn()
    render(<Rack tiles={tiles} onTouchDragStart={onTouchDragStart} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")

    fireEvent.touchStart(tileEls[1], {
      touches: [{ clientX: 100, clientY: 200 }],
    })

    expect(onTouchDragStart).toHaveBeenCalledWith(1, 100, 200)
  })

  it("calls onTouchDragMove on touch move", () => {
    const tiles = makeTiles("ABC")
    const onTouchDragMove = vi.fn()
    render(<Rack tiles={tiles} onTouchDragMove={onTouchDragMove} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")

    fireEvent.touchMove(tileEls[1], {
      touches: [{ clientX: 150, clientY: 250 }],
    })

    expect(onTouchDragMove).toHaveBeenCalledWith(150, 250)
  })

  it("calls onTouchDragEnd on touch end", () => {
    const tiles = makeTiles("ABC")
    const onTouchDragEnd = vi.fn()
    render(<Rack tiles={tiles} onTouchDragEnd={onTouchDragEnd} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")

    fireEvent.touchEnd(tileEls[1], {
      changedTouches: [{ clientX: 150, clientY: 250 }],
    })

    expect(onTouchDragEnd).toHaveBeenCalledWith(150, 250)
  })

  it("does not fire touch drag events in swap mode", () => {
    const tiles = makeTiles("ABC")
    const onTouchDragStart = vi.fn()
    render(<Rack tiles={tiles} swapMode onTouchDragStart={onTouchDragStart} />)
    const tileEls = screen.getByTestId("rack").querySelectorAll("[data-tile]")

    fireEvent.touchStart(tileEls[0], {
      touches: [{ clientX: 100, clientY: 200 }],
    })

    expect(onTouchDragStart).not.toHaveBeenCalled()
  })
})
