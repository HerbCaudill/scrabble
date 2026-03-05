import { describe, it, expect } from "vitest"
import { createGame } from "../createGame"

describe("createGame", () => {
  it("creates a game with two players", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.players).toHaveLength(2)
    expect(state.players[0].name).toBe("Alice")
    expect(state.players[1].name).toBe("Bob")
  })

  it("initializes scores to zero", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.players[0].score).toBe(0)
    expect(state.players[1].score).toBe(0)
  })

  it("deals 7 tiles to each player", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.players[0].rack).toHaveLength(7)
    expect(state.players[1].rack).toHaveLength(7)
  })

  it("removes dealt tiles from the bag", () => {
    const state = createGame(["Alice", "Bob"])
    // 100 total - 14 dealt = 86
    expect(state.tileBag.length).toBe(86)
  })

  it("starts with player 0", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.currentPlayerIndex).toBe(0)
  })

  it("starts with an empty board", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.board).toHaveLength(15)
    expect(state.board[0]).toHaveLength(15)
    expect(state.board[7][7]).toBeNull()
  })

  it("starts with empty move history", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.moveHistory).toHaveLength(0)
  })

  it("starts in playing status", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.gameStatus).toBe("playing")
  })

  it("starts with zero consecutive passes", () => {
    const state = createGame(["Alice", "Bob"])
    expect(state.consecutivePasses).toBe(0)
  })

  it("supports more than two players", () => {
    const state = createGame(["Alice", "Bob", "Charlie"])
    expect(state.players).toHaveLength(3)
    // 100 - 21 = 79
    expect(state.tileBag.length).toBe(79)
  })
})
