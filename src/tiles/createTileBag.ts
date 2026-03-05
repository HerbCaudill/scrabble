import type { Tile } from "../types"
import { tileDistribution } from "./tileDistribution"
import { tileValues } from "./tileValues"

/** Creates the full bag of 100 Scrabble tiles based on the standard distribution. */
export function createTileBag(): Tile[] {
  const bag: Tile[] = []
  for (const [letter, count] of Object.entries(tileDistribution)) {
    const value = tileValues[letter]
    for (let i = 0; i < count; i++) {
      bag.push({ letter, value })
    }
  }
  return bag
}
