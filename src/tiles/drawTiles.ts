import type { Tile } from "../types"

/**
 * Draws a number of random tiles from the bag. Returns the drawn tiles and the
 * remaining bag. Does not mutate the original bag.
 */
export function drawTiles(
  /** The current tile bag to draw from. */
  bag: Tile[],
  /** The number of tiles to draw. */
  count: number,
): DrawResult {
  const pool = [...bag]
  const actualCount = Math.min(count, pool.length)
  const drawn: Tile[] = []

  for (let i = 0; i < actualCount; i++) {
    const index = Math.floor(Math.random() * pool.length)
    drawn.push(pool[index])
    pool.splice(index, 1)
  }

  return { drawn, remaining: pool }
}

/** The result of drawing tiles from a bag. */
export type DrawResult = {
  /** The tiles that were drawn. */
  drawn: Tile[]
  /** The tiles remaining in the bag after drawing. */
  remaining: Tile[]
}
