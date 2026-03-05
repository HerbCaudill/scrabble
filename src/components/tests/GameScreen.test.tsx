import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { GameScreen } from "../GameScreen"

// Mock the game functions so tests are deterministic and fast
vi.mock("@/game/createGame", () => ({
  createGame: vi.fn((playerNames: string[]) => ({
    board: Array.from({ length: 15 }, () => Array(15).fill(null)),
    players: playerNames.map(name => ({
      name,
      score: 0,
      rack: [
        { letter: "A", value: 1 },
        { letter: "B", value: 3 },
        { letter: "C", value: 3 },
        { letter: "D", value: 2 },
        { letter: "E", value: 1 },
        { letter: "F", value: 4 },
        { letter: "G", value: 2 },
      ],
    })),
    currentPlayerIndex: 0,
    tileBag: Array(86).fill({ letter: "X", value: 8 }),
    moveHistory: [],
    gameStatus: "playing" as const,
    consecutivePasses: 0,
  })),
}))

vi.mock("@/game/passTurn", () => ({
  passTurn: vi.fn((state: any) => ({
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    consecutivePasses: state.consecutivePasses + 1,
  })),
}))

vi.mock("@/game/exchangePlayerTiles", () => ({
  exchangePlayerTiles: vi.fn((state: any) => ({
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    consecutivePasses: 0,
  })),
}))

vi.mock("@/ai/chooseMove", () => ({
  chooseMove: vi.fn(() => null),
}))

vi.mock("@/game/playMove", () => ({
  playMove: vi.fn((state: any) => ({
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    consecutivePasses: 0,
  })),
}))

describe("GameScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders with default player names", () => {
    render(<GameScreen />)
    expect(screen.getByText("You")).toBeInTheDocument()
    expect(screen.getByText("Computer")).toBeInTheDocument()
  })

  it("renders with custom player names", () => {
    render(<GameScreen playerNames={["Alice", "Bob"]} />)
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("shows data-player attributes on player names", () => {
    render(<GameScreen playerNames={["Alice", "Bob"]} />)
    expect(document.querySelector('[data-player="Alice"]')).toBeInTheDocument()
    expect(document.querySelector('[data-player="Bob"]')).toBeInTheDocument()
  })

  it("shows scores for each player", () => {
    render(<GameScreen />)
    // Both players start with score 0
    const scores = screen.getAllByText("0")
    expect(scores.length).toBeGreaterThanOrEqual(2)
  })

  it("shows the current player's rack", () => {
    render(<GameScreen />)
    const rack = screen.getByTestId("rack")
    expect(rack).toBeInTheDocument()
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(7)
  })

  it("renders Play, Exchange, Pass, and Shuffle buttons", () => {
    render(<GameScreen />)
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Exchange" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pass" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument()
  })

  it("indicates which player's turn it is", () => {
    render(<GameScreen />)
    // The current player should be visually indicated
    expect(screen.getByText(/your turn/i)).toBeInTheDocument()
  })

  it("passes the turn when Pass is clicked", async () => {
    const { passTurn } = await import("@/game/passTurn")
    render(<GameScreen />)
    fireEvent.click(screen.getByRole("button", { name: "Pass" }))
    expect(passTurn).toHaveBeenCalled()
  })

  it("toggles exchange mode when Exchange is clicked", () => {
    render(<GameScreen />)
    const exchangeBtn = screen.getByRole("button", { name: "Exchange" })
    fireEvent.click(exchangeBtn)
    // Should now show "Confirm exchange" button
    expect(screen.getByRole("button", { name: "Confirm exchange" })).toBeInTheDocument()
  })

  it("exits exchange mode when Exchange is clicked again (cancel)", () => {
    render(<GameScreen />)
    fireEvent.click(screen.getByRole("button", { name: "Exchange" }))
    expect(screen.getByRole("button", { name: "Confirm exchange" })).toBeInTheDocument()
    // Click cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("button", { name: "Confirm exchange" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Exchange" })).toBeInTheDocument()
  })

  it("shuffles rack tiles when Shuffle is clicked", () => {
    render(<GameScreen />)
    const shuffleBtn = screen.getByRole("button", { name: "Shuffle" })
    // Should not throw
    fireEvent.click(shuffleBtn)
    // Rack should still have 7 tiles
    const rack = screen.getByTestId("rack")
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(7)
  })

  it("shows an error when Play is clicked with no tiles placed", () => {
    render(<GameScreen />)
    fireEvent.click(screen.getByRole("button", { name: "Play" }))
    // Should show an error message
    expect(screen.getByRole("alert")).toBeInTheDocument()
  })

  it("renders the board", () => {
    render(<GameScreen />)
    // Board has 225 squares (15x15)
    const squares = document.querySelectorAll("[data-cell]")
    expect(squares).toHaveLength(225)
  })
})
