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

vi.mock("@/game/swapPlayerTiles", () => ({
  swapPlayerTiles: vi.fn((state: any) => ({
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

vi.mock("@/scoring/calculateMoveScore", () => ({
  calculateMoveScore: vi.fn(() => 12),
}))

describe("GameScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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

  it("renders Play, Swap, Pass, and Shuffle buttons", () => {
    render(<GameScreen />)
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Swap" })).toBeInTheDocument()
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

  it("toggles swap mode when Swap is clicked", () => {
    render(<GameScreen />)
    const swapBtn = screen.getByRole("button", { name: "Swap" })
    fireEvent.click(swapBtn)
    // Should now show "Confirm swap" button
    expect(screen.getByRole("button", { name: "Confirm swap" })).toBeInTheDocument()
  })

  it("exits swap mode when Swap is clicked again (cancel)", () => {
    render(<GameScreen />)
    fireEvent.click(screen.getByRole("button", { name: "Swap" }))
    expect(screen.getByRole("button", { name: "Confirm swap" })).toBeInTheDocument()
    // Click cancel
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("button", { name: "Confirm swap" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Swap" })).toBeInTheDocument()
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

  it("shows Shuffle button when no tiles are placed on the board", () => {
    render(<GameScreen />)
    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Recall" })).not.toBeInTheDocument()
  })

  it("shows Recall button instead of Shuffle after placing a tile on the board", () => {
    render(<GameScreen />)
    // Click a board square to place a tile
    const centerSquare = document.querySelector('[data-cell="7-7"]') as HTMLElement
    fireEvent.click(centerSquare)
    // Shuffle should be gone, Recall should appear
    expect(screen.queryByRole("button", { name: "Shuffle" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Recall" })).toBeInTheDocument()
  })

  it("shows score badge when tiles are placed on the board", () => {
    render(<GameScreen />)
    // No score badge initially
    expect(screen.queryByTestId("score-badge")).not.toBeInTheDocument()
    // Place a tile on the board
    const centerSquare = document.querySelector('[data-cell="7-7"]') as HTMLElement
    fireEvent.click(centerSquare)
    // Score badge should appear with the mocked score
    expect(screen.getByTestId("score-badge")).toBeInTheDocument()
    expect(screen.getByTestId("score-badge")).toHaveTextContent("12")
  })

  it("hides score badge when tiles are recalled", () => {
    render(<GameScreen />)
    // Place a tile
    const centerSquare = document.querySelector('[data-cell="7-7"]') as HTMLElement
    fireEvent.click(centerSquare)
    expect(screen.getByTestId("score-badge")).toBeInTheDocument()
    // Recall tiles
    fireEvent.click(screen.getByRole("button", { name: "Recall" }))
    // Score badge should disappear
    expect(screen.queryByTestId("score-badge")).not.toBeInTheDocument()
  })

  it("returns tiles to rack when Recall is clicked", () => {
    render(<GameScreen />)
    const rack = screen.getByTestId("rack")
    const initialTileCount = rack.querySelectorAll("[data-tile]").length

    // Place a tile on the board
    const centerSquare = document.querySelector('[data-cell="7-7"]') as HTMLElement
    fireEvent.click(centerSquare)
    // Rack should have one fewer tile
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(initialTileCount - 1)

    // Click Recall
    fireEvent.click(screen.getByRole("button", { name: "Recall" }))
    // Rack should be restored
    expect(rack.querySelectorAll("[data-tile]")).toHaveLength(initialTileCount)
    // Shuffle should be back
    expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Recall" })).not.toBeInTheDocument()
  })
})
