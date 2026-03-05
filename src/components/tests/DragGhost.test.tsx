import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { DragGhost } from "../DragGhost"

describe("DragGhost", () => {
  it("renders the tile letter at the specified position", () => {
    render(<DragGhost tile={{ letter: "A", value: 1 }} x={100} y={200} />)
    const ghost = screen.getByTestId("drag-ghost")
    expect(ghost).toBeInTheDocument()
    expect(ghost).toHaveTextContent("A")
  })

  it("uses fixed positioning with pointer-events-none", () => {
    render(<DragGhost tile={{ letter: "B", value: 3 }} x={50} y={75} />)
    const ghost = screen.getByTestId("drag-ghost")
    expect(ghost.style.position).toBe("fixed")
    expect(ghost.style.pointerEvents).toBe("none")
  })

  it("positions the ghost centered on the coordinates", () => {
    render(<DragGhost tile={{ letter: "C", value: 3 }} x={100} y={200} />)
    const ghost = screen.getByTestId("drag-ghost")
    expect(ghost.style.left).toBe("100px")
    expect(ghost.style.top).toBe("200px")
  })
})
