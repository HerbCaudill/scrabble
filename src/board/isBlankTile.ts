/**
 * Check if a tile represents a blank tile.
 * Blank tiles are stored as " " (space) for unassigned blanks,
 * or lowercase letters (a-z) for blanks representing that letter.
 */
export const isBlankTile = (
  /** The tile character, or null */
  tile: string | null,
): boolean => {
  if (!tile) return false
  if (tile === " ") return true
  return tile.length === 1 && tile >= "a" && tile <= "z"
}
