import { createEmptyBoard } from "./createEmptyBoard"
import type { BoardState, Move } from "./types"
import type { MoveRecord } from "../game/types"

/**
 * Reconstruct the board state after a given number of turns have been played.
 * Replays moves 0 through turnIndex (inclusive) onto an empty board.
 */
export const reconstructBoardAtTurn = (
  /** The full move history of the game */
  moveHistory: MoveRecord[],
  /** The 0-based index of the turn to reconstruct up to (inclusive). Use -1 for empty board. */
  turnIndex: number,
): BoardState => {
  const board = createEmptyBoard()

  for (let i = 0; i <= turnIndex && i < moveHistory.length; i++) {
    const record = moveHistory[i]
    if (record.move) {
      applyMoveToBoard(board, record.move)
    }
  }

  return board
}

/** Mutate the board by placing tiles from a move. */
const applyMoveToBoard = (
  /** The board to mutate */
  board: BoardState,
  /** The move whose tiles to place */
  move: Move,
): void => {
  for (const { row, col, tile } of move) {
    board[row][col] = tile
  }
}
