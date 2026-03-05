import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ComputerTurnOverlay } from "../ComputerTurnOverlay"
import type { ScoredMove } from "@/movegen/types"

const mockMove: ScoredMove = [
  { row: 7, col: 7, tile: "H" },
  { row: 7, col: 8, tile: "E" },
  { row: 7, col: 9, tile: "L" },
  { row: 7, col: 10, tile: "L" },
  { row: 7, col: 11, tile: "O" },
] as ScoredMove
mockMove.score = 16
mockMove.words = ["HELLO"]

describe("ComputerTurnOverlay", () => {
  it("shows thinking message when isThinking is true", () => {
    render(<ComputerTurnOverlay isThinking={true} currentMove={null} />)

    expect(screen.getByText("Computer is thinking...")).toBeInTheDocument()
  })

  it("has data-computer-turn attribute", () => {
    const { container } = render(<ComputerTurnOverlay isThinking={true} currentMove={null} />)

    expect(container.querySelector("[data-computer-turn]")).toBeInTheDocument()
  })

  it("shows word and score after move is computed", () => {
    render(<ComputerTurnOverlay isThinking={false} currentMove={mockMove} />)

    expect(screen.getByText(/Computer played HELLO for 16 points/)).toBeInTheDocument()
  })

  it("renders nothing when not thinking and no move", () => {
    const { container } = render(<ComputerTurnOverlay isThinking={false} currentMove={null} />)

    expect(container.querySelector("[data-computer-turn]")).not.toBeInTheDocument()
  })
})
