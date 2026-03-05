import type { Position } from "@/board/types"

/**
 * Find the board square at a given screen coordinate by checking for a data-cell attribute.
 * Uses document.elementFromPoint to locate the element under the touch point.
 * Returns the board position if found, or null if the point is not over a board square.
 */
export const findSquareAtPoint = (
  /** X coordinate (clientX). */
  x: number,
  /** Y coordinate (clientY). */
  y: number,
): Position | null => {
  const element = document.elementFromPoint(x, y)
  if (!element) return null

  /** Walk up the DOM tree to find a data-cell attribute. */
  const cellElement = element.closest("[data-cell]")
  if (!cellElement) return null

  const cellValue = cellElement.getAttribute("data-cell")
  if (!cellValue) return null

  const [row, col] = cellValue.split("-").map(Number)
  if (isNaN(row) || isNaN(col)) return null

  return { row, col }
}
