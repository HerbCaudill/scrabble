import type { GameState } from "./types"

/**
 * Calculate final scores at the end of the game. Subtracts remaining tile values
 * from each player's score. If one player went out (empty rack), that player
 * receives the sum of all other players' remaining tile values.
 */
export function calculateFinalScores(
  /** The finished game state. */
  state: GameState,
): GameState {
  const rackValues = state.players.map(p => p.rack.reduce((sum, tile) => sum + tile.value, 0))

  const playerWhoWentOut = state.players.findIndex(p => p.rack.length === 0)
  const totalOtherValues = rackValues.reduce((sum, v) => sum + v, 0)

  const newPlayers = state.players.map((p, i) => {
    let newScore = p.score - rackValues[i]
    if (playerWhoWentOut !== -1 && i === playerWhoWentOut) {
      newScore += totalOtherValues
    }
    return { ...p, score: newScore, rack: [...p.rack] }
  })

  return {
    ...state,
    players: newPlayers,
  }
}
