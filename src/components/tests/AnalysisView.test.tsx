import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AnalysisView } from "../AnalysisView"
import { createEmptyBoard } from "@/board/createEmptyBoard"
import type { GameState } from "@/game/types"
import type { GameAnalysis } from "@/analysis/types"

/**
 * Mock analyzeGame so we don't need a real dictionary / move generator.
 * We control the analysis output directly.
 */
vi.mock("@/analysis/analyzeGame", () => ({
  analyzeGame: vi.fn(),
}))

import { analyzeGame } from "@/analysis/analyzeGame"

const mockAnalyzeGame = vi.mocked(analyzeGame)

/** Build a minimal GameState for testing. */
const makeGameState = (): GameState => ({
  board: createEmptyBoard(),
  players: [
    { name: "Alice", score: 30, rack: [] },
    { name: "Bob", score: 25, rack: [] },
  ],
  currentPlayerIndex: 0,
  tileBag: [],
  moveHistory: [
    {
      player: "Alice",
      actionType: "place",
      move: [
        { row: 7, col: 7, tile: "H" },
        { row: 7, col: 8, tile: "I" },
      ],
      score: 5,
      words: ["HI"],
      timestamp: 1,
    },
    {
      player: "Bob",
      actionType: "place",
      move: [
        { row: 8, col: 7, tile: "A" },
        { row: 9, col: 7, tile: "T" },
      ],
      score: 6,
      words: ["HAT"],
      timestamp: 2,
    },
    {
      player: "Alice",
      actionType: "place",
      move: [{ row: 7, col: 6, tile: "S" }],
      score: 8,
      words: ["SHI"],
      timestamp: 3,
    },
  ],
  gameStatus: "finished",
  consecutivePasses: 0,
})

/** Build a mock GameAnalysis matching the game state above. */
const makeAnalysis = (): GameAnalysis => ({
  turns: [
    {
      turnNumber: 1,
      playerName: "Alice",
      movePlayed: Object.assign(
        [
          { row: 7, col: 7, tile: "H" },
          { row: 7, col: 8, tile: "I" },
        ],
        { score: 5, words: ["HI"] },
      ),
      bestMoves: [
        Object.assign(
          [
            { row: 7, col: 5, tile: "H" },
            { row: 7, col: 6, tile: "E" },
            { row: 7, col: 7, tile: "L" },
            { row: 7, col: 8, tile: "L" },
            { row: 7, col: 9, tile: "O" },
          ],
          { score: 16, words: ["HELLO"] },
        ),
      ],
      scoreDifferential: 11,
      cumulativeDifferential: 11,
    },
    {
      turnNumber: 2,
      playerName: "Bob",
      movePlayed: Object.assign(
        [
          { row: 8, col: 7, tile: "A" },
          { row: 9, col: 7, tile: "T" },
        ],
        { score: 6, words: ["HAT"] },
      ),
      bestMoves: [
        Object.assign(
          [
            { row: 8, col: 7, tile: "A" },
            { row: 9, col: 7, tile: "T" },
          ],
          { score: 6, words: ["HAT"] },
        ),
      ],
      scoreDifferential: 0,
      cumulativeDifferential: 0,
    },
    {
      turnNumber: 3,
      playerName: "Alice",
      movePlayed: Object.assign([{ row: 7, col: 6, tile: "S" }], { score: 8, words: ["SHI"] }),
      bestMoves: [
        Object.assign(
          [
            { row: 7, col: 6, tile: "S" },
            { row: 7, col: 9, tile: "P" },
          ],
          { score: 12, words: ["SHIP"] },
        ),
      ],
      scoreDifferential: 4,
      cumulativeDifferential: 15,
    },
  ],
  playerSummaries: [
    {
      playerName: "Alice",
      totalDifferential: 15,
      averageDifferential: 7.5,
      bestMoveCount: 0,
      worstMissCount: 0,
    },
    {
      playerName: "Bob",
      totalDifferential: 0,
      averageDifferential: 0,
      bestMoveCount: 1,
      worstMissCount: 0,
    },
  ],
})

describe("AnalysisView", () => {
  beforeEach(() => {
    mockAnalyzeGame.mockReturnValue(makeAnalysis())
  })

  it("calls analyzeGame with the provided gameState", () => {
    const gameState = makeGameState()
    render(<AnalysisView gameState={gameState} />)
    expect(mockAnalyzeGame).toHaveBeenCalledWith(gameState)
  })

  it("shows the turn indicator starting at turn 1", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    expect(screen.getByText("Turn 1 of 3")).toBeInTheDocument()
  })

  it("shows the player name for the current turn", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    expect(within(turnDisplay).getByText("Alice")).toBeInTheDocument()
  })

  it("shows the move played (word and score)", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    expect(within(turnDisplay).getByText(/HI/)).toBeInTheDocument()
    expect(within(turnDisplay).getByText(/5/)).toBeInTheDocument()
  })

  it("shows the best available move (word and score)", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    expect(within(turnDisplay).getByText(/HELLO/)).toBeInTheDocument()
    expect(within(turnDisplay).getByText(/16/)).toBeInTheDocument()
  })

  it("shows the score differential", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    // Differential of 11 should be shown
    expect(within(turnDisplay).getByText(/-11/)).toBeInTheDocument()
  })

  it("navigates to the next turn when next button is clicked", async () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const nextButton = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextButton)
    expect(screen.getByText("Turn 2 of 3")).toBeInTheDocument()
    const turnDisplay = screen.getByTestId("turn-display")
    expect(within(turnDisplay).getByText("Bob")).toBeInTheDocument()
  })

  it("navigates to the previous turn when prev button is clicked", async () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const nextButton = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextButton) // go to turn 2
    const prevButton = screen.getByRole("button", { name: /prev/i })
    await userEvent.click(prevButton) // back to turn 1
    expect(screen.getByText("Turn 1 of 3")).toBeInTheDocument()
  })

  it("disables the prev button on the first turn", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const prevButton = screen.getByRole("button", { name: /prev/i })
    expect(prevButton).toBeDisabled()
  })

  it("disables the next button on the last turn", async () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const nextButton = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextButton) // turn 2
    await userEvent.click(nextButton) // turn 3
    expect(nextButton).toBeDisabled()
  })

  it("shows score differential in green when 0", async () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const nextButton = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextButton) // turn 2, Bob, differential 0
    const turnDisplay = screen.getByTestId("turn-display")
    const diffEl = within(turnDisplay).getByTestId("score-differential")
    expect(diffEl.className).toMatch(/green/)
  })

  it("shows score differential in red when points were missed", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    const diffEl = within(turnDisplay).getByTestId("score-differential")
    expect(diffEl.className).toMatch(/red/)
  })

  it("shows the summary panel with player differentials", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    // Summary should show both players' total differentials
    expect(screen.getByTestId("summary-panel")).toBeInTheDocument()
    const summary = screen.getByTestId("summary-panel")
    expect(within(summary).getByText("Alice")).toBeInTheDocument()
    expect(within(summary).getByText("Bob")).toBeInTheDocument()
    expect(within(summary).getByText(/15/)).toBeInTheDocument() // Alice's total
  })

  it("has a data-turn attribute on the turn display", () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const turnDisplay = screen.getByTestId("turn-display")
    expect(turnDisplay.getAttribute("data-turn")).toBe("1")
  })

  it("updates data-turn when navigating", async () => {
    render(<AnalysisView gameState={makeGameState()} />)
    const nextButton = screen.getByRole("button", { name: /next/i })
    await userEvent.click(nextButton)
    const turnDisplay = screen.getByTestId("turn-display")
    expect(turnDisplay.getAttribute("data-turn")).toBe("2")
  })
})
