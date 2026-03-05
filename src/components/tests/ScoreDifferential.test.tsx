import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScoreDifferential } from "../ScoreDifferential"
import type { GameAnalysis } from "@/analysis/types"

/** Build a mock GameAnalysis for testing. */
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

describe("ScoreDifferential", () => {
  it("shows per-turn differential with +0 in green when optimal", () => {
    const analysis = makeAnalysis()
    const { container } = render(<ScoreDifferential analysis={analysis} currentTurnIndex={1} />)
    // Bob's turn (index 1) has scoreDifferential 0
    const el = container.querySelector("[data-differential]")!
    expect(el.textContent).toBe("+0")
    expect(el.getAttribute("data-differential")).toBe("0")
    expect(el.className).toMatch(/green/)
  })

  it("shows per-turn differential with -X in red when points were missed", () => {
    const analysis = makeAnalysis()
    const { container } = render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    // Alice's turn (index 0) has scoreDifferential 11
    const el = container.querySelector("[data-differential]")!
    expect(el.textContent).toBe("-11")
    expect(el.getAttribute("data-differential")).toBe("-11")
    expect(el.className).toMatch(/red/)
  })

  it("shows cumulative differential running total", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={2} />)
    // Alice's turn 3 has cumulativeDifferential 15
    expect(screen.getByText(/cumulative/i)).toBeInTheDocument()
    expect(screen.getByText(/-15/)).toBeInTheDocument()
  })

  it("shows cumulative differential of 0 on first Bob turn", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={1} />)
    // Bob's cumulative is 0
    expect(screen.getByText(/cumulative/i)).toBeInTheDocument()
  })

  it("shows summary section with total points missed per player", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    const summary = screen.getByTestId("differential-summary")
    expect(within(summary).getByText("Alice")).toBeInTheDocument()
    expect(within(summary).getByText("Bob")).toBeInTheDocument()
    // Alice total: 15
    expect(within(summary).getByText(/15/)).toBeInTheDocument()
  })

  it("shows average points missed per turn in summary", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    const summary = screen.getByTestId("differential-summary")
    // Alice avg: 7.5
    expect(within(summary).getByText(/7\.5/)).toBeInTheDocument()
  })

  it("shows number of optimal moves played in summary", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    const summary = screen.getByTestId("differential-summary")
    // Bob has 1 best move
    const bobSection = within(summary).getByTestId("player-summary-Bob")
    expect(within(bobSection).getByText(/1/)).toBeInTheDocument()
  })

  it("shows worst miss in summary", () => {
    const analysis = makeAnalysis()
    render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    const summary = screen.getByTestId("differential-summary")
    // Alice's worst miss is 11 (from turn 1)
    const aliceSection = within(summary).getByTestId("player-summary-Alice")
    expect(within(aliceSection).getByText(/11/)).toBeInTheDocument()
  })

  it("has data-differential attribute on the differential value", () => {
    const analysis = makeAnalysis()
    const { container } = render(<ScoreDifferential analysis={analysis} currentTurnIndex={0} />)
    const el = container.querySelector("[data-differential]")!
    expect(el).toHaveAttribute("data-differential", "-11")
  })
})
