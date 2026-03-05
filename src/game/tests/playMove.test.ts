import { describe, it, expect } from "vitest"
import { createGame } from "../createGame"
import { playMove } from "../playMove"
import type { Move } from "../../board/types"
import type { GameState } from "../types"

/** Helper to set up a game state where the current player has specific tiles. */
const withRack = (state: GameState, tiles: string[]): GameState => ({
  ...state,
  players: state.players.map((p, i) =>
    i === state.currentPlayerIndex ?
      { ...p, rack: tiles.map(letter => ({ letter, value: 1 })) }
    : p,
  ),
})

describe("playMove", () => {
  it("places tiles on the board", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    expect(result.board[7][7]).toBe("C")
    expect(result.board[7][8]).toBe("A")
    expect(result.board[7][9]).toBe("T")
  })

  it("advances to the next player", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    expect(result.currentPlayerIndex).toBe(1)
  })

  it("wraps around to player 0 after the last player", () => {
    const initial = createGame(["Alice", "Bob"])
    const state1 = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move1: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const after1 = playMove(state1, move1)

    // Play "CATS" vertically extending from C
    const state2 = withRack(after1, ["A", "T", "S", "X", "Y", "Z", "Q"])
    const move2: Move = [
      { row: 8, col: 7, tile: "A" },
      { row: 9, col: 7, tile: "T" },
      { row: 10, col: 7, tile: "S" },
    ]
    const after2 = playMove(state2, move2)
    expect(after2.currentPlayerIndex).toBe(0)
  })

  it("updates the player's score", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    expect(result.players[0].score).toBeGreaterThan(0)
  })

  it("removes played tiles from the player's rack", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    // Should have drawn new tiles to replenish (4 remaining + up to 3 drawn)
    expect(result.players[0].rack.length).toBeLessThanOrEqual(7)
  })

  it("draws tiles from the bag to replenish the rack", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const initialBagSize = state.tileBag.length
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    // Bag should have fewer tiles (drew 3 to replace played tiles)
    expect(result.tileBag.length).toBe(initialBagSize - 3)
  })

  it("adds a record to the move history", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    expect(result.moveHistory).toHaveLength(1)
    expect(result.moveHistory[0].player).toBe("Alice")
    expect(result.moveHistory[0].actionType).toBe("place")
    expect(result.moveHistory[0].score).toBeGreaterThan(0)
  })

  it("resets consecutive passes on a successful move", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = {
      ...withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"]),
      consecutivePasses: 3,
    }
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    const result = playMove(state, move)
    expect(result.consecutivePasses).toBe(0)
  })

  it("throws on an invalid move", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    // Tiles not covering center on first move
    const move: Move = [
      { row: 0, col: 0, tile: "C" },
      { row: 0, col: 1, tile: "A" },
      { row: 0, col: 2, tile: "T" },
    ]
    expect(() => playMove(state, move)).toThrow()
  })

  it("does not mutate the original state", () => {
    const initial = createGame(["Alice", "Bob"])
    const state = withRack(initial, ["C", "A", "T", "X", "Y", "Z", "Q"])
    const originalBoard = state.board.map(r => [...r])
    const move: Move = [
      { row: 7, col: 7, tile: "C" },
      { row: 7, col: 8, tile: "A" },
      { row: 7, col: 9, tile: "T" },
    ]
    playMove(state, move)
    expect(state.board).toEqual(originalBoard)
    expect(state.currentPlayerIndex).toBe(0)
  })
})
