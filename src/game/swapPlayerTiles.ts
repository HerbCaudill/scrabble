import { swapTiles } from "../tiles/swapTiles"
import type { GameState, MoveRecord } from "./types"

/** The minimum number of tiles that must be in the bag to allow a swap. */
const MIN_BAG_SIZE_FOR_SWAP = 7

/**
 * Swap selected tiles from the current player's rack for new tiles from the bag.
 * Throws if fewer than 7 tiles remain in the bag.
 */
export function swapPlayerTiles(
  /** The current game state. */
  state: GameState,
  /** Indices into the current player's rack identifying tiles to swap. */
  tileIndices: number[],
): GameState {
  if (state.tileBag.length < MIN_BAG_SIZE_FOR_SWAP) {
    throw new Error("Cannot swap tiles: fewer than 7 tiles remain in the bag")
  }

  const currentPlayer = state.players[state.currentPlayerIndex]
  const tilesToReturn = tileIndices.map(i => currentPlayer.rack[i])
  const keptTiles = currentPlayer.rack.filter((_, i) => !tileIndices.includes(i))

  const { drawn, remaining: newBag } = swapTiles(state.tileBag, tilesToReturn, tileIndices.length)

  const newRack = [...keptTiles, ...drawn]

  const record: MoveRecord = {
    player: currentPlayer.name,
    actionType: "swap",
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
