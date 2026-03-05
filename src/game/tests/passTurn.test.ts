import { describe, it, expect } from "vitest"
import { createGame } from "../createGame"
import { passTurn } from "../passTurn"

describe("passTurn", () => {
  it("advances to the next player", () => {
    const state = createGame(["Alice", "Bob"])
    const result = passTurn(state)
    expect(result.currentPlayerIndex).toBe(1)
  })

  it("increments consecutive passes", () => {
    const state = createGame(["Alice", "Bob"])
    const result = passTurn(state)
    expect(result.consecutivePasses).toBe(1)
  })

  it("adds a pass record to move history", () => {
    const state = createGame(["Alice", "Bob"])
    const result = passTurn(state)
    expect(result.moveHistory).toHaveLength(1)
    expect(result.moveHistory[0].actionType).toBe("pass")
    expect(result.moveHistory[0].player).toBe("Alice")
    expect(result.moveHistory[0].score).toBe(0)
  })

  it("ends the game after 6 consecutive passes with 2 players", () => {
    let state = createGame(["Alice", "Bob"])
    // 6 consecutive passes for a 2-player game (3 rounds * 2 players)
    for (let i = 0; i < 5; i++) {
      state = passTurn(state)
    }
    expect(state.gameStatus).toBe("playing")
    state = passTurn(state)
    expect(state.gameStatus).toBe("finished")
  })

  it("ends the game after 6 consecutive passes with 3 players", () => {
    let state = createGame(["Alice", "Bob", "Charlie"])
    for (let i = 0; i < 5; i++) {
      state = passTurn(state)
    }
    expect(state.gameStatus).toBe("playing")
    state = passTurn(state)
    expect(state.gameStatus).toBe("finished")
  })

  it("does not change the board", () => {
    const state = createGame(["Alice", "Bob"])
    const result = passTurn(state)
    expect(result.board).toEqual(state.board)
  })

  it("does not change scores", () => {
    const state = createGame(["Alice", "Bob"])
    const result = passTurn(state)
    expect(result.players[0].score).toBe(0)
    expect(result.players[1].score).toBe(0)
  })

  it("does not mutate the original state", () => {
    const state = createGame(["Alice", "Bob"])
    const originalIndex = state.currentPlayerIndex
    passTurn(state)
    expect(state.currentPlayerIndex).toBe(originalIndex)
    expect(state.consecutivePasses).toBe(0)
  })
})
