import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScoreDisplay } from "../ScoreDisplay"
import type { Player, MoveRecord } from "@/game/types"

const makePlayers = (scores: [string, number][]): Player[] =>
  scores.map(([name, score]) => ({
    name,
    score,
    rack: [],
  }))

describe("ScoreDisplay", () => {
  it("renders each player's name and score", () => {
    const players = makePlayers([
      ["Alice", 42],
      ["Bob", 37],
    ])
    render(<ScoreDisplay players={players} currentPlayerIndex={0} tilesInBag={80} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("42")).toBeInTheDocument()
    expect(screen.getByText("37")).toBeInTheDocument()
  })

  it("sets data-score attribute on player score elements", () => {
    const players = makePlayers([
      ["Alice", 42],
      ["Bob", 37],
    ])
    render(<ScoreDisplay players={players} currentPlayerIndex={0} tilesInBag={80} />)
    const aliceScore = document.querySelector('[data-score="Alice"]')
    const bobScore = document.querySelector('[data-score="Bob"]')
    expect(aliceScore).toBeInTheDocument()
    expect(bobScore).toBeInTheDocument()
    expect(aliceScore).toHaveTextContent("42")
    expect(bobScore).toHaveTextContent("37")
  })

  it("highlights the current player", () => {
    const players = makePlayers([
      ["Alice", 0],
      ["Bob", 0],
    ])
    const { container } = render(
      <ScoreDisplay players={players} currentPlayerIndex={1} tilesInBag={80} />,
    )
    // The current player's row should have a distinguishing style (font-bold or bg highlight)
    const rows = container.querySelectorAll("[data-player-row]")
    expect(rows).toHaveLength(2)
    // Bob (index 1) should be highlighted
    expect((rows[1] as HTMLElement).className).toMatch(/font-bold|bg-/)
    // Alice (index 0) should not have bold
    expect((rows[0] as HTMLElement).className).not.toMatch(/font-bold/)
  })

  it("shows tiles remaining in bag", () => {
    const players = makePlayers([
      ["Alice", 0],
      ["Bob", 0],
    ])
    render(<ScoreDisplay players={players} currentPlayerIndex={0} tilesInBag={54} />)
    expect(screen.getByText(/54/)).toBeInTheDocument()
    expect(screen.getByText(/tiles remaining/i)).toBeInTheDocument()
  })

  it("shows last move info for a word placement", () => {
    const players = makePlayers([
      ["Alice", 10],
      ["Bob", 0],
    ])
    const lastMove: MoveRecord = {
      player: "Alice",
      actionType: "place",
      move: [{ row: 7, col: 7, tile: "C" }],
      score: 10,
      words: ["CAT"],
      timestamp: Date.now(),
    }
    render(
      <ScoreDisplay players={players} currentPlayerIndex={1} tilesInBag={80} lastMove={lastMove} />,
    )
    expect(screen.getByText(/CAT/)).toBeInTheDocument()
    expect(screen.getByText(/10 pts/)).toBeInTheDocument()
  })

  it("shows last move info for a pass", () => {
    const players = makePlayers([
      ["Alice", 0],
      ["Bob", 0],
    ])
    const lastMove: MoveRecord = {
      player: "Alice",
      actionType: "pass",
      move: null,
      score: 0,
      words: [],
      timestamp: Date.now(),
    }
    render(
      <ScoreDisplay players={players} currentPlayerIndex={1} tilesInBag={80} lastMove={lastMove} />,
    )
    expect(screen.getByText(/passed/i)).toBeInTheDocument()
  })

  it("shows last move info for a swap", () => {
    const players = makePlayers([
      ["Alice", 0],
      ["Bob", 0],
    ])
    const lastMove: MoveRecord = {
      player: "Bob",
      actionType: "swap",
      move: null,
      score: 0,
      words: [],
      timestamp: Date.now(),
    }
    render(
      <ScoreDisplay players={players} currentPlayerIndex={0} tilesInBag={80} lastMove={lastMove} />,
    )
    expect(screen.getByText(/swapped/i)).toBeInTheDocument()
  })

  it("renders without a last move", () => {
    const players = makePlayers([
      ["Alice", 0],
      ["Bob", 0],
    ])
    render(<ScoreDisplay players={players} currentPlayerIndex={0} tilesInBag={100} />)
    // Should not crash, and should not show any move info
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
    expect(screen.queryByText(/passed/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/swapped/i)).not.toBeInTheDocument()
  })
})
