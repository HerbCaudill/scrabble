/** Premium square type: triple/double word, triple/double letter, star (center), or null (normal). */
export type SquareType = "TW" | "DW" | "TL" | "DL" | "ST" | null

/** Board position. */
export type Position = {
  /** Row index (0-14) */
  row: number
  /** Column index (0-14) */
  col: number
}

/** A set of tiles placed on the board in a single move. */
export type Move = Array<
  Position & {
    /** The tile letter placed at this position */
    tile: string
  }
>

/** Board state - 15x15 grid where each cell is a letter or null. */
export type BoardState = Array<Array<string | null>>
