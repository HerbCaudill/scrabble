import { createEmptyBoard } from "../board/createEmptyBoard"
import { createTileBag } from "../tiles/createTileBag"
import { drawTiles } from "../tiles/drawTiles"
import { shuffleBag } from "../tiles/shuffleBag"
import type { Tile } from "../types"
import type { GameState, Player } from "./types"

/** The number of tiles each player starts with. */
const INITIAL_RACK_SIZE = 7

/** Create a new game with the given player names, dealing initial racks from a shuffled bag. */
export function createGame(
  /** The names of the players. */
  playerNames: string[],
): GameState {
  let bag: Tile[] = shuffleBag(createTileBag())

  const players: Player[] = playerNames.map(name => {
    const { drawn, remaining } = drawTiles(bag, INITIAL_RACK_SIZE)
    bag = remaining
    return { name, score: 0, rack: drawn }
  })

  return {
    board: createEmptyBoard(),
    players,
    currentPlayerIndex: 0,
    tileBag: bag,
    moveHistory: [],
    gameStatus: "playing",
    consecutivePasses: 0,
  }
}
