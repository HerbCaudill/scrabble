import { renderHook, act } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useTilePlacement } from "../useTilePlacement"
import { createEmptyBoard } from "@/board/createEmptyBoard"
import type { Tile } from "@/types"

const makeTiles = (letters: string): Tile[] =>
  letters.split("").map(l => ({ letter: l, value: l === " " ? 0 : 1 }))

describe("useTilePlacement", () => {
  it("initially has no placed tiles", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toEqual(rack)
    expect(result.current.pendingBoard).toEqual(board)
  })

  it("places a tile from rack to board", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })

    expect(result.current.placedTiles.size).toBe(1)
    expect(result.current.placedTiles.get("7-7")).toEqual({ letter: "A", value: 1 })
    expect(result.current.rackTiles).toHaveLength(6)
    expect(result.current.rackTiles.map(t => t.letter).join("")).toBe("BCDEFG")
    expect(result.current.pendingBoard[7][7]).toBe("A")
  })

  it("does not mutate the original board", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })

    expect(board[7][7]).toBeNull()
  })

  it("does not mutate the original rack", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })

    expect(rack).toHaveLength(7)
  })

  it("places multiple tiles", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("HELLO")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0) // H
    })
    act(() => {
      result.current.placeTile({ row: 7, col: 8 }, 0) // E (now index 0 after H removed)
    })

    expect(result.current.placedTiles.size).toBe(2)
    expect(result.current.rackTiles).toHaveLength(3)
    expect(result.current.pendingBoard[7][7]).toBe("H")
    expect(result.current.pendingBoard[7][8]).toBe("E")
  })

  it("does not place a tile on an occupied square", () => {
    const board = createEmptyBoard()
    board[7][7] = "X"
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toHaveLength(7)
  })

  it("does not place a tile on a square that already has a pending tile", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })
    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })

    expect(result.current.placedTiles.size).toBe(1)
    expect(result.current.rackTiles).toHaveLength(6)
  })

  it("does not place a tile with an invalid rack index", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("AB")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 5)
    })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toHaveLength(2)
  })

  it("recalls a placed tile back to the rack", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })
    act(() => {
      result.current.recallTile({ row: 7, col: 7 })
    })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toHaveLength(7)
    expect(result.current.pendingBoard[7][7]).toBeNull()
  })

  it("recalling a non-pending position is a no-op", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.recallTile({ row: 7, col: 7 })
    })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toHaveLength(7)
  })

  it("recalls all placed tiles at once", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("HELLO")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })
    act(() => {
      result.current.placeTile({ row: 7, col: 8 }, 0)
    })
    act(() => {
      result.current.recallAll()
    })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toHaveLength(5)
    expect(result.current.pendingBoard[7][7]).toBeNull()
    expect(result.current.pendingBoard[7][8]).toBeNull()
  })

  it("getPendingMove returns null when no tiles are placed", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    expect(result.current.getPendingMove()).toBeNull()
  })

  it("getPendingMove returns a Move from placed tiles", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("HELLO")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0) // H
    })
    act(() => {
      result.current.placeTile({ row: 7, col: 8 }, 0) // E
    })

    const move = result.current.getPendingMove()
    expect(move).not.toBeNull()
    expect(move).toHaveLength(2)
    expect(move).toContainEqual({ row: 7, col: 7, tile: "H" })
    expect(move).toContainEqual({ row: 7, col: 8, tile: "E" })
  })

  it("preserves existing board tiles in pendingBoard", () => {
    const board = createEmptyBoard()
    board[7][7] = "X"
    const rack = makeTiles("ABCDEFG")
    const { result } = renderHook(() => useTilePlacement(board, rack))

    act(() => {
      result.current.placeTile({ row: 7, col: 8 }, 0)
    })

    expect(result.current.pendingBoard[7][7]).toBe("X")
    expect(result.current.pendingBoard[7][8]).toBe("A")
  })

  it("resets placements when board or rack props change", () => {
    const board = createEmptyBoard()
    const rack = makeTiles("ABCDEFG")
    const { result, rerender } = renderHook(({ board, rack }) => useTilePlacement(board, rack), {
      initialProps: { board, rack },
    })

    act(() => {
      result.current.placeTile({ row: 7, col: 7 }, 0)
    })
    expect(result.current.placedTiles.size).toBe(1)

    const newRack = makeTiles("XYZWVUT")
    rerender({ board, rack: newRack })

    expect(result.current.placedTiles.size).toBe(0)
    expect(result.current.rackTiles).toEqual(newRack)
  })
})
