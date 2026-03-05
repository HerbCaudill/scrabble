import type { GameState } from "./types"

/** The localStorage key used to persist the current game. */
export const STORAGE_KEY = "scrabble-game-state"

/** Save the current game state to localStorage. */
export function saveGameState(
  /** The game state to persist. */
  state: GameState,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Silently ignore quota or serialization errors
  }
}

/** Load a previously saved game state from localStorage. Returns null if none exists or data is invalid. */
export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null

    const parsed = JSON.parse(raw)
    if (!isValidGameState(parsed)) return null

    return parsed as GameState
  } catch {
    return null
  }
}

/** Remove the saved game state from localStorage. */
export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Minimal shape check to guard against corrupt or outdated data. */
function isValidGameState(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    Array.isArray(obj.board) &&
    Array.isArray(obj.players) &&
    typeof obj.currentPlayerIndex === "number" &&
    Array.isArray(obj.tileBag) &&
    Array.isArray(obj.moveHistory) &&
    typeof obj.gameStatus === "string" &&
    typeof obj.consecutivePasses === "number"
  )
}
