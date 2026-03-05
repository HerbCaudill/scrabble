import { describe, it, expect } from "vitest"
import { calculateFinalScores } from "../calculateFinalScores"
import type { GameState } from "../types"
import { createEmptyBoard } from "../../board/createEmptyBoard"

/** Create a minimal finished game state for testing. */
const makeFinishedState = (
  players: Array<{ name: string; score: number; rack: Array<{ letter: string; value: number }> }>,
): GameState => ({
  board: createEmptyBoard(),
  players: players.map(p => ({ ...p })),
  currentPlayerIndex: 0,
  tileBag: [],
  moveHistory: [],
  gameStatus: "finished",
  consecutivePasses: 0,
})

describe("calculateFinalScores", () => {
  it("subtracts remaining tile values from each player", () => {
    const state = makeFinishedState([
      {
        name: "Alice",
        score: 100,
        rack: [{ letter: "A", value: 1 }],
      },
      {
        name: "Bob",
        score: 80,
        rack: [
          { letter: "Q", value: 10 },
          { letter: "Z", value: 10 },
        ],
      },
    ])
    const result = calculateFinalScores(state)
    expect(result.players[0].score).toBe(99) // 100 - 1
    expect(result.players[1].score).toBe(60) // 80 - 20
  })

  it("adds other players' remaining tile values to the player who went out", () => {
    const state = makeFinishedState([
      { name: "Alice", score: 100, rack: [] },
      {
        name: "Bob",
        score: 80,
        rack: [
          { letter: "Q", value: 10 },
          { letter: "Z", value: 10 },
        ],
      },
    ])
    const result = calculateFinalScores(state)
    // Alice went out (empty rack), gets Bob's remaining tile values
    expect(result.players[0].score).toBe(120) // 100 + 20
  })

  it("does not add bonus if no player went out", () => {
    const state = makeFinishedState([
      {
        name: "Alice",
        score: 100,
        rack: [{ letter: "A", value: 1 }],
      },
      {
        name: "Bob",
        score: 80,
        rack: [{ letter: "B", value: 3 }],
      },
    ])
    const result = calculateFinalScores(state)
    // Both still have tiles, so just subtract
    expect(result.players[0].score).toBe(99) // 100 - 1
    expect(result.players[1].score).toBe(77) // 80 - 3
  })

  it("handles multiple players", () => {
    const state = makeFinishedState([
      { name: "Alice", score: 100, rack: [] },
      {
        name: "Bob",
        score: 80,
        rack: [{ letter: "Q", value: 10 }],
      },
      {
        name: "Charlie",
        score: 90,
        rack: [{ letter: "Z", value: 10 }],
      },
    ])
    const result = calculateFinalScores(state)
    // Alice went out, gets Bob's 10 + Charlie's 10
    expect(result.players[0].score).toBe(120)
    expect(result.players[1].score).toBe(70)
    expect(result.players[2].score).toBe(80)
  })

  it("does not mutate the original state", () => {
    const state = makeFinishedState([
      { name: "Alice", score: 100, rack: [] },
      {
        name: "Bob",
        score: 80,
        rack: [{ letter: "Q", value: 10 }],
      },
    ])
    calculateFinalScores(state)
    expect(state.players[0].score).toBe(100)
    expect(state.players[1].score).toBe(80)
  })
})
