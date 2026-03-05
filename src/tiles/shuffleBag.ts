import type { Tile } from "../types"

/** Randomly shuffles the bag using the Fisher-Yates algorithm. Returns a new array. */
export function shuffleBag(
  /** The tile bag to shuffle. */
  bag: Tile[],
): Tile[] {
  const result = [...bag]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  return result
}
