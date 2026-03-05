import type { Tile } from "../types"
import { drawTiles, type DrawResult } from "./drawTiles"

/**
 * Puts tiles back into the bag, then draws new ones. Returns the newly drawn
 * tiles and the remaining bag. Does not mutate any input arrays.
 */
export function swapTiles(
  /** The current tile bag. */
  bag: Tile[],
  /** The tiles to return to the bag before drawing. */
  tilesToReturn: Tile[],
  /** The number of new tiles to draw. */
  count: number,
): DrawResult {
  const augmentedBag = [...bag, ...tilesToReturn]
  return drawTiles(augmentedBag, count)
}
