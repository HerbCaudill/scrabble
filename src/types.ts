/** A single Scrabble tile with a letter and point value. */
export type Tile = {
  /** The letter on the tile. Blank tiles use a space character (' '). */
  letter: string
  /** The point value of the tile. Blank tiles have value 0. */
  value: number
}
