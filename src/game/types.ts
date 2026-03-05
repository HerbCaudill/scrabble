import type { BoardState, Move } from "../board/types"
import type { Tile } from "../types"

/** A player in the game. */
export type Player = {
  /** The player's display name */
  name: string
  /** The player's current score */
  score: number
  /** The tiles currently in the player's rack */
  rack: Tile[]
}

/** The status of a game. */
export type GameStatus = "playing" | "finished"

/** The full state of a Scrabble game. */
export type GameState = {
  /** The current board state */
  board: BoardState
  /** The players in the game */
  players: Player[]
  /** Index of the player whose turn it is */
  currentPlayerIndex: number
  /** The remaining tiles in the bag */
  tileBag: Tile[]
  /** History of all moves made */
  moveHistory: MoveRecord[]
  /** Whether the game is in progress or finished */
  gameStatus: GameStatus
  /** Number of consecutive passes (resets on any non-pass action) */
  consecutivePasses: number
}

/** The type of action a player can take. */
export type GameActionType = "place" | "pass" | "exchange" | "end"

/** A record of a move in the game history. */
export type MoveRecord = {
  /** The name of the player who made the move */
  player: string
  /** The type of action taken */
  actionType: GameActionType
  /** The tiles placed (for place moves) */
  move: Move | null
  /** The score earned for this move */
  score: number
  /** The words formed by this move */
  words: string[]
  /** When the move was made */
  timestamp: number
}

/** A union of all possible game actions. */
export type GameAction =
  | { type: "place"; move: Move }
  | { type: "pass" }
  | { type: "exchange"; tileIndices: number[] }
  | { type: "end" }
