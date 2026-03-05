import { useState, useCallback, useEffect, useRef } from "react"
import { createGame } from "@/game/createGame"
import { loadGameState, saveGameState } from "@/game/persistGameState"
import type { GameState } from "@/game/types"

/**
 * Like useState<GameState>, but persists to localStorage on every change
 * and restores from localStorage on mount.
 */
export function usePersistedGameState(
  /** Player names used to create a fresh game if no saved state exists. */
  playerNames: string[],
): [GameState, (action: GameState | ((prev: GameState) => GameState)) => void] {
  const [state, setStateRaw] = useState<GameState>(() => {
    return loadGameState() ?? createGame(playerNames)
  })

  /** Track whether initial mount has completed so we don't double-save the initial state. */
  const isInitialMount = useRef(true)

  /** Persist to localStorage whenever state changes (skip the initial mount). */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    saveGameState(state)
  }, [state])

  /** Wrapped setter that also persists immediately for functional updates. */
  const setState = useCallback((action: GameState | ((prev: GameState) => GameState)) => {
    setStateRaw(prev => {
      const next = typeof action === "function" ? action(prev) : action
      saveGameState(next)
      return next
    })
  }, [])

  return [state, setState]
}
