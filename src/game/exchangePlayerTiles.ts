import { exchangeTiles } from "../tiles/exchangeTiles"
import type { GameState, MoveRecord } from "./types"

/** The minimum number of tiles that must be in the bag to allow an exchange. */
const MIN_BAG_SIZE_FOR_EXCHANGE = 7

/**
 * Exchange selected tiles from the current player's rack for new tiles from the bag.
 * Throws if fewer than 7 tiles remain in the bag.
 */
export function exchangePlayerTiles(
  /** The current game state. */
  state: GameState,
  /** Indices into the current player's rack identifying tiles to exchange. */
  tileIndices: number[],
): GameState {
  if (state.tileBag.length < MIN_BAG_SIZE_FOR_EXCHANGE) {
    throw new Error("Cannot exchange tiles: fewer than 7 tiles remain in the bag")
  }

  const currentPlayer = state.players[state.currentPlayerIndex]
  const tilesToReturn = tileIndices.map(i => currentPlayer.rack[i])
  const keptTiles = currentPlayer.rack.filter((_, i) => !tileIndices.includes(i))

  const { drawn, remaining: newBag } = exchangeTiles(
    state.tileBag,
    tilesToReturn,
    tileIndices.length,
  )

  const newRack = [...keptTiles, ...drawn]

  const record: MoveRecord = {
    player: currentPlayer.name,
    actionType: "exchange",
    move: null,
    score: 0,
    words: [],
    timestamp: Date.now(),
  }

  return {
    ...state,
    players: state.players.map((p, i) =>
      i === state.currentPlayerIndex ? { ...p, rack: newRack } : { ...p, rack: [...p.rack] },
    ),
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    tileBag: newBag,
    moveHistory: [...state.moveHistory, record],
    consecutivePasses: 0,
  }
}
