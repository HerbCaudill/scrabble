import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, beforeEach } from "vitest"
import { usePersistedGameState } from "../usePersistedGameState"
import { createGame } from "@/game/createGame"
import { STORAGE_KEY } from "@/game/persistGameState"

describe("usePersistedGameState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("creates a fresh game when nothing is saved", () => {
    const { result } = renderHook(() => usePersistedGameState(["Alice", "Bob"]))
    expect(result.current[0].gameStatus).toBe("playing")
    expect(result.current[0].players.map(p => p.name)).toEqual(["Alice", "Bob"])
  })

  it("restores a previously saved game on mount", () => {
    const saved = createGame(["Saved1", "Saved2"])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    const { result } = renderHook(() => usePersistedGameState(["Alice", "Bob"]))
    expect(result.current[0].players.map(p => p.name)).toEqual(["Saved1", "Saved2"])
  })

  it("persists state to localStorage when the setter is called", () => {
    const { result } = renderHook(() => usePersistedGameState(["A", "B"]))

    act(() => {
      result.current[1](prev => ({ ...prev, consecutivePasses: 5 }))
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.consecutivePasses).toBe(5)
  })

  it("persists state when setter receives a direct value", () => {
    const { result } = renderHook(() => usePersistedGameState(["A", "B"]))
    const newState = createGame(["X", "Y"])

    act(() => {
      result.current[1](newState)
    })

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(stored.players.map((p: any) => p.name)).toEqual(["X", "Y"])
  })

  it("ignores corrupt localStorage data and creates a fresh game", () => {
    localStorage.setItem(STORAGE_KEY, "{{broken")
    const { result } = renderHook(() => usePersistedGameState(["A", "B"]))
    expect(result.current[0].gameStatus).toBe("playing")
    expect(result.current[0].players.map(p => p.name)).toEqual(["A", "B"])
  })
})
