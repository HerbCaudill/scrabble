import type { Move } from "../board/types"
import { drawTiles } from "../tiles/drawTiles"
import { validateMove } from "../validation/validateMove"
import type { GameState, MoveRecord } from "./types"

/**
 * Apply a tile placement move to the game state. Validates the move, scores it,
 * draws replacement tiles, and advances to the next player. Throws if the move
 * is invalid.
 */
export function playMove(
  /** The current game state. */
  state: GameState,
  /** The tiles to place on the board. */
  move: Move,
): GameState {
  const isFirstMove = state.moveHistory.every(r => r.actionType !== "place")

  const validation = validateMove(state.board, move, isFirstMove)
  if (!validation.valid) {
    throw new Error(`Invalid move: ${validation.errors.join(", ")}`)
  }

  // Place tiles on the board (immutably)
  const newBoard = state.board.map(row => [...row])
  for (const { row, col, tile } of move) {
    newBoard[row][col] = tile
  }

  // Remove played tiles from the player's rack
  const currentPlayer = state.players[state.currentPlayerIndex]
  const playedLetters = move.map(t => t.tile)
  const remainingRack = [...currentPlayer.rack]
  for (const letter of playedLetters) {
    const idx = remainingRack.findIndex(t => t.letter === letter)
    if (idx !== -1) {
      remainingRack.splice(idx, 1)
    }
  }

  // Draw replacement tiles
  const tilesToDraw = move.length
  const { drawn, remaining: newBag } = drawTiles(state.tileBag, tilesToDraw)
  const newRack = [...remainingRack, ...drawn]

  // Build move record
  const record: MoveRecord = {
    player: currentPlayer.name,
    actionType: "place",
    move,
    score: validation.score,
    words: validation.words,
    timestamp: Date.now(),
  }

  // Build new players array
  const newPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIndex ?
      { ...p, score: p.score + validation.score, rack: newRack }
    : { ...p },
  )

  // Check for game end: player used all tiles and bag is empty
  const playerOutOfTiles = newRack.length === 0 && newBag.length === 0
  const newStatus = playerOutOfTiles ? "finished" : state.gameStatus

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length

  return {
    board: newBoard,
    players: newPlayers,
    currentPlayerIndex: nextPlayerIndex,
    tileBag: newBag,
    moveHistory: [...state.moveHistory, record],
    gameStatus: newStatus,
    consecutivePasses: 0,
  }
}
