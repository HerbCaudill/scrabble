import { isBlankTile } from "./isBlankTile"
import { tileValues } from "./tileValues"

/** Get the point value for a tile. Blank tiles (space or lowercase) return 0. */
export const getTileValue = (
  /** The tile character */
  letter: string,
): number => {
  if (isBlankTile(letter)) return 0
  return tileValues[letter.toUpperCase()] ?? 0
}
