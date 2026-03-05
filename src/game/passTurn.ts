import type { GameState, MoveRecord } from "./types"

/** The number of consecutive passes that ends the game. */
const MAX_CONSECUTIVE_PASSES = 6

/** Pass the current player's turn without placing any tiles. */
export function passTurn(
  /** The current game state. */
  state: GameState,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex]
  const newConsecutivePasses = state.consecutivePasses + 1

  const record: MoveRecord = {
    player: currentPlayer.name,
    actionType: "pass",
    move: null,
    score: 0,
    words: [],
    timestamp: Date.now(),
  }

  const gameOver = newConsecutivePasses >= MAX_CONSECUTIVE_PASSES

  return {
    ...state,
    players: state.players.map(p => ({ ...p, rack: [...p.rack] })),
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    moveHistory: [...state.moveHistory, record],
    consecutivePasses: newConsecutivePasses,
    gameStatus: gameOver ? "finished" : state.gameStatus,
  }
}
