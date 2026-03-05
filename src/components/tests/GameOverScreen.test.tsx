import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { GameOverScreen } from "../GameOverScreen"
import type { GameState } from "@/game/types"

/** Create a minimal finished game state for testing. */
function createFinishedGameState(
  /** Player scores as [name, score] tuples. */
  players: [string, number][],
): GameState {
  return {
    board: Array.from({ length: 15 }, () => Array(15).fill(null)),
    players: players.map(([name, score]) => ({
      name,
      score,
      rack: [],
    })),
    currentPlayerIndex: 0,
    tileBag: [],
    moveHistory: [],
    gameStatus: "finished",
    consecutivePasses: 0,
  }
}

describe("GameOverScreen", () => {
  it("renders with data-game-over attribute", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(document.querySelector("[data-game-over]")).toBeInTheDocument()
  })

  it("shows 'Game over' heading", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(screen.getByRole("heading", { name: "Game over" })).toBeInTheDocument()
  })

  it("shows final scores for each player", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("100")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("80")).toBeInTheDocument()
  })

  it("announces the winner", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(screen.getByText("Alice wins!")).toBeInTheDocument()
  })

  it("announces a tie when scores are equal", () => {
    const state = createFinishedGameState([
      ["Alice", 90],
      ["Bob", 90],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(screen.getByText("It's a tie!")).toBeInTheDocument()
  })

  it("highlights the winner's score row", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    const { container } = render(
      <GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />,
    )
    const aliceRow = container.querySelector("[data-winner]")
    expect(aliceRow).toBeInTheDocument()
  })

  it("calls onViewAnalysis when 'View analysis' is clicked", () => {
    const onViewAnalysis = vi.fn()
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(
      <GameOverScreen gameState={state} onViewAnalysis={onViewAnalysis} onPlayAgain={() => {}} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "View analysis" }))
    expect(onViewAnalysis).toHaveBeenCalledOnce()
  })

  it("calls onPlayAgain when 'Play again' is clicked", () => {
    const onPlayAgain = vi.fn()
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={onPlayAgain} />)
    fireEvent.click(screen.getByRole("button", { name: "Play again" }))
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })

  it("handles more than two players", () => {
    const state = createFinishedGameState([
      ["Alice", 100],
      ["Bob", 80],
      ["Charlie", 120],
    ])
    render(<GameOverScreen gameState={state} onViewAnalysis={() => {}} onPlayAgain={() => {}} />)
    expect(screen.getByText("Charlie wins!")).toBeInTheDocument()
  })
})
