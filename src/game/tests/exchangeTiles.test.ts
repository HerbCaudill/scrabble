import { describe, it, expect } from "vitest"
import { createGame } from "../createGame"
import { exchangePlayerTiles } from "../exchangePlayerTiles"
import type { GameState } from "../types"
import type { Tile } from "../../types"

/** Helper to set a specific rack for the current player. */
const withRack = (state: GameState, tiles: Tile[]): GameState => ({
  ...state,
  players: state.players.map((p, i) =>
    i === state.currentPlayerIndex ? { ...p, rack: tiles } : p,
  ),
})

describe("exchangePlayerTiles", () => {
  it("replaces selected tiles with new ones from the bag", () => {
    const state = createGame(["Alice", "Bob"])
    const result = exchangePlayerTiles(state, [0, 1, 2])
    // Player should still have 7 tiles
    expect(result.players[0].rack).toHaveLength(7)
  })

  it("returns exchanged tiles to the bag", () => {
    const state = createGame(["Alice", "Bob"])
    const initialBagSize = state.tileBag.length
    const result = exchangePlayerTiles(state, [0, 1])
    // Bag size should remain the same (returned 2, drew 2)
    expect(result.tileBag.length).toBe(initialBagSize)
  })

  it("advances to the next player", () => {
    const state = createGame(["Alice", "Bob"])
    const result = exchangePlayerTiles(state, [0])
    expect(result.currentPlayerIndex).toBe(1)
  })

  it("resets consecutive passes", () => {
    const state = { ...createGame(["Alice", "Bob"]), consecutivePasses: 3 }
    const result = exchangePlayerTiles(state, [0])
    expect(result.consecutivePasses).toBe(0)
  })

  it("adds an exchange record to move history", () => {
    const state = createGame(["Alice", "Bob"])
    const result = exchangePlayerTiles(state, [0, 1])
    expect(result.moveHistory).toHaveLength(1)
    expect(result.moveHistory[0].actionType).toBe("exchange")
    expect(result.moveHistory[0].player).toBe("Alice")
    expect(result.moveHistory[0].score).toBe(0)
  })

  it("throws when fewer than 7 tiles remain in the bag", () => {
    const state: GameState = {
      ...createGame(["Alice", "Bob"]),
      tileBag: Array.from({ length: 6 }, () => ({ letter: "A", value: 1 })),
    }
    expect(() => exchangePlayerTiles(state, [0])).toThrow()
  })

  it("does not mutate the original state", () => {
    const state = createGame(["Alice", "Bob"])
    const originalRack = [...state.players[0].rack]
    exchangePlayerTiles(state, [0, 1])
    expect(state.players[0].rack).toEqual(originalRack)
  })
})
