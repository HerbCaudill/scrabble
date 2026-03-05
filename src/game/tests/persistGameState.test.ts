import { describe, expect, it, beforeEach } from "vitest"
import { saveGameState, loadGameState, clearGameState, STORAGE_KEY } from "../persistGameState"
import { createGame } from "../createGame"
import type { GameState } from "../types"

describe("persistGameState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe("saveGameState", () => {
    it("saves game state to localStorage", () => {
      const state = createGame(["Alice", "Bob"])
      saveGameState(state)

      const stored = localStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()
      expect(JSON.parse(stored!)).toEqual(state)
    })
  })

  describe("loadGameState", () => {
    it("returns null when no state is saved", () => {
      expect(loadGameState()).toBeNull()
    })

    it("restores a previously saved game state", () => {
      const state = createGame(["Alice", "Bob"])
      saveGameState(state)

      const loaded = loadGameState()
      expect(loaded).toEqual(state)
    })

    it("returns null when localStorage contains invalid JSON", () => {
      localStorage.setItem(STORAGE_KEY, "not valid json{{{")
      expect(loadGameState()).toBeNull()
    })

    it("returns null when stored value is not a valid GameState shape", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }))
      expect(loadGameState()).toBeNull()
    })
  })

  describe("clearGameState", () => {
    it("removes saved state from localStorage", () => {
      const state = createGame(["Alice", "Bob"])
      saveGameState(state)
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()

      clearGameState()
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe("round-trip integrity", () => {
    it("preserves board, players, bag, and history through save/load", () => {
      const state: GameState = {
        ...createGame(["P1", "P2"]),
        currentPlayerIndex: 1,
        consecutivePasses: 2,
        gameStatus: "playing",
      }
      saveGameState(state)

      const loaded = loadGameState()!
      expect(loaded.board).toEqual(state.board)
      expect(loaded.players).toEqual(state.players)
      expect(loaded.tileBag).toEqual(state.tileBag)
      expect(loaded.moveHistory).toEqual(state.moveHistory)
      expect(loaded.currentPlayerIndex).toBe(1)
      expect(loaded.consecutivePasses).toBe(2)
      expect(loaded.gameStatus).toBe("playing")
    })
  })
})
