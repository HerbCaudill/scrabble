import { describe, expect, it } from "vitest"
import { createEmptyBoard } from "../../board/createEmptyBoard"
import { validWords } from "../../words/validWords"
import { getCrossChecks } from "../getCrossChecks"

describe("getCrossChecks", () => {
  it("should return null for squares with no cross constraints", () => {
    const board = createEmptyBoard()
    const checks = getCrossChecks(board, true, validWords)

    // Empty board has no cross constraints
    expect(checks[7][7]).toBeNull()
  })

  it("should constrain squares adjacent to existing tiles", () => {
    const board = createEmptyBoard()
    board[7][7] = "C"
    board[7][8] = "A"
    board[7][9] = "T"

    // For horizontal moves, cross-checks are vertical
    const checks = getCrossChecks(board, true, validWords)

    // Square above 'C' at (6,7): placing a letter there must form a valid 2-letter word ?C
    // Square below 'T' at (8,9): placing a letter there must form a valid 2-letter word T?
    const aboveC = checks[6][7]
    expect(aboveC).not.toBeNull()
    // Only letters that form valid words ending in C should be allowed
    if (aboveC) {
      // Every allowed letter + C should be a valid word
      for (const letter of aboveC) {
        expect(validWords.has(letter + "C")).toBe(true)
      }
    }
  })

  it("should return null for filled squares", () => {
    const board = createEmptyBoard()
    board[7][7] = "A"

    const checks = getCrossChecks(board, true, validWords)
    expect(checks[7][7]).toBeNull()
  })

  it("should handle squares between two tiles", () => {
    const board = createEmptyBoard()
    // Place tiles above and below a gap
    board[5][7] = "C"
    board[7][7] = "T"

    // For horizontal moves, cross-checks are vertical
    const checks = getCrossChecks(board, true, validWords)

    // Square at (6,7) is between C and T - only letters forming C?T should be allowed
    const between = checks[6][7]
    expect(between).not.toBeNull()
    if (between) {
      for (const letter of between) {
        expect(validWords.has("C" + letter + "T")).toBe(true)
      }
    }
  })
})
