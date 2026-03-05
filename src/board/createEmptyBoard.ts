import type { BoardState } from "./types"

/** Create an empty 15x15 board with all cells set to null. */
export const createEmptyBoard = (): BoardState =>
  Array.from({ length: 15 }, () => Array.from({ length: 15 }, () => null))
