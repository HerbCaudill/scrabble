import { renderHook, act } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { useComputerTurn } from "../useComputerTurn"
import { createEmptyBoard } from "@/board/createEmptyBoard"
import type { BoardState } from "@/board/types"
import type { ScoredMove } from "@/movegen/types"

vi.mock("@/ai/chooseMove", () => ({
  chooseMove: vi.fn(),
}))

import { chooseMove } from "@/ai/chooseMove"
const mockChooseMove = vi.mocked(chooseMove)

const mockMove: ScoredMove = [
  { row: 7, col: 7, tile: "H" },
  { row: 7, col: 8, tile: "I" },
] as ScoredMove
mockMove.score = 5
mockMove.words = ["HI"]

describe("useComputerTurn", () => {
  let board: BoardState

  beforeEach(() => {
    vi.useFakeTimers()
    board = createEmptyBoard()
    mockChooseMove.mockReturnValue(mockMove)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it("starts in idle state", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    expect(result.current.isThinking).toBe(false)
    expect(result.current.currentMove).toBeNull()
    expect(result.current.revealedTiles).toEqual([])
  })

  it("sets isThinking to true when triggerTurn is called", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    expect(result.current.isThinking).toBe(true)
    expect(result.current.currentMove).toBeNull()
  })

  it("computes the move after ~800ms thinking delay", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    // Before 800ms: still thinking, no move
    act(() => {
      vi.advanceTimersByTime(799)
    })
    expect(result.current.currentMove).toBeNull()
    expect(result.current.isThinking).toBe(true)

    // At 800ms: move is computed, first tile revealed
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.currentMove).toBe(mockMove)
    expect(result.current.isThinking).toBe(false)
    expect(result.current.revealedTiles).toHaveLength(1)
  })

  it("reveals tiles one by one with ~200ms intervals", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    // Advance past thinking delay
    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(result.current.revealedTiles).toHaveLength(1)
    expect(result.current.revealedTiles[0]).toEqual({ row: 7, col: 7, tile: "H" })

    // After 200ms: second tile revealed
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current.revealedTiles).toHaveLength(2)
    expect(result.current.revealedTiles[1]).toEqual({ row: 7, col: 8, tile: "I" })
  })

  it("calls onComplete 500ms after all tiles are revealed", () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    // Thinking: 800ms
    act(() => {
      vi.advanceTimersByTime(800)
    })

    // Tile 2: +200ms
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onComplete).not.toHaveBeenCalled()

    // Wait 499ms after last tile: not yet
    act(() => {
      vi.advanceTimersByTime(499)
    })
    expect(onComplete).not.toHaveBeenCalled()

    // 500ms after last tile: onComplete called
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onComplete).toHaveBeenCalledWith(mockMove)
  })

  it("calls onComplete with null when no move is found", () => {
    mockChooseMove.mockReturnValue(null)
    const onComplete = vi.fn()
    const { result } = renderHook(() =>
      useComputerTurn(board, ["X", "X", "X", "X", "X", "X", "X"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    // Thinking delay
    act(() => {
      vi.advanceTimersByTime(800)
    })

    // No tiles to reveal, so 500ms delay then onComplete
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onComplete).toHaveBeenCalledWith(null)
  })

  it("cleans up timers on unmount", () => {
    const onComplete = vi.fn()
    const { result, unmount } = renderHook(() =>
      useComputerTurn(board, ["H", "I", "T", "E", "S", "T", "S"], "medium", onComplete),
    )

    act(() => {
      result.current.triggerTurn()
    })

    unmount()

    // Advance all timers - onComplete should not be called
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(onComplete).not.toHaveBeenCalled()
  })
})
